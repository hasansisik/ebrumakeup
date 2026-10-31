/**
 * Data layer.
 *
 * Production (Vercel): everything is stored in MongoDB, because the serverless
 * filesystem is read-only. Configure MONGODB_URI (and optionally MONGODB_DB,
 * default "ebru").
 *
 * Local development without MONGODB_URI falls back to data/ebru-db.json.
 *
 * On the first run against an empty database, the content and analytics in
 * data/ebru-db.json are copied into MongoDB automatically.
 */
import fs from "fs";
import path from "path";
import { MongoClient, MongoServerError, type Db } from "mongodb";
import { cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { connection } from "next/server";
import seedJson from "@/data/ebru-db.json";
import {
  BlogPost,
  PortfolioItem,
  HeroColumn,
  initialHeroColumns,
  blogPosts as initialBlogPosts,
  portfolioItems as initialPortfolioItems,
} from "./data";

export interface AnalyticsSchema {
  baselineVisitors: number;
  baselinePageViews: number;
  uniqueVisitors: string[];
  pageViewsCount: number;
  blogAnalytics: {
    [blogId: string]: {
      uniqueVisitors: string[];
      viewsCount: number;
      baselineUnique?: number;
    };
  };
  dailyVisits: {
    [dateKey: string]: {
      uniqueVisitors: string[];
      pageViews: number;
    };
  };
  recentLogs: {
    visitorId: string;
    path: string;
    timestamp: string;
  }[];
}

export interface DatabaseSchema {
  blogPosts: BlogPost[];
  portfolioItems: PortfolioItem[];
  heroColumns?: HeroColumn[];
  analytics?: AnalyticsSchema;
  lastUpdated: string;
}

interface ContentSchema {
  blogPosts: BlogPost[];
  portfolioItems: PortfolioItem[];
  heroColumns: HeroColumn[];
  lastUpdated: string;
}

const emptyAnalytics = (): AnalyticsSchema => ({
  baselineVisitors: 0,
  baselinePageViews: 0,
  uniqueVisitors: [],
  pageViewsCount: 0,
  blogAnalytics: {},
  dailyVisits: {},
  recentLogs: [],
});

const seedDb = seedJson as unknown as DatabaseSchema;

const CONTENT_TAG = "content";
const DB_PATH = path.join(process.cwd(), "data", "ebru-db.json");
const MAX_LOGS = 25;
const DAY_TTL_SECONDS = 60 * 60 * 24 * 120;

/* ============================================================
   MONGODB
   ============================================================

   Collections:
     content        { _id: "main", blogPosts, portfolioItems, heroColumns, lastUpdated }
     counters       { _id: "pageviews" | "day:YYYY-MM-DD" | "blog:<id>", n }
     visitors       { _id: visitorId }
     day_visitors   { _id: "YYYY-MM-DD|visitorId", day, createdAt }   (TTL 120 days)
     blog_visitors  { _id: "<blogId>|visitorId", blogId }
     meta           { _id: "recentLogs", items: [...] }, { _id: "analyticsSeeded" }
*/

interface IdDoc {
  _id: string;
}
interface ContentDoc extends ContentSchema, IdDoc {}
interface CounterDoc extends IdDoc {
  n: number;
}
interface DayVisitorDoc extends IdDoc {
  day: string;
  createdAt: Date;
}
interface BlogVisitorDoc extends IdDoc {
  blogId: string;
}
interface MetaDoc extends IdDoc {
  items?: LogEntry[];
  at?: Date;
}

const hasMongo = () => Boolean(process.env.MONGODB_URI);

const globalForMongo = globalThis as unknown as { __ebruMongoDb?: Promise<Db> };

function getDb(): Promise<Db> {
  if (!globalForMongo.__ebruMongoDb) {
    const client = new MongoClient(process.env.MONGODB_URI!, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10_000,
    });
    globalForMongo.__ebruMongoDb = client
      .connect()
      .then(async (c) => {
        const db = c.db(process.env.MONGODB_DB || "ebru");
        await Promise.all([
          db.collection("day_visitors").createIndex({ day: 1 }),
          db.collection("day_visitors").createIndex({ createdAt: 1 }, { expireAfterSeconds: DAY_TTL_SECONDS }),
          db.collection("blog_visitors").createIndex({ blogId: 1 }),
        ]);
        return db;
      })
      .catch((err) => {
        globalForMongo.__ebruMongoDb = undefined; // retry on next call
        throw err;
      });
  }
  return globalForMongo.__ebruMongoDb;
}

const isDuplicateKey = (err: unknown) => err instanceof MongoServerError && err.code === 11000;

/** Insert-if-missing; concurrent duplicates are expected and ignored. */
async function insertIgnoringDuplicates<T extends IdDoc>(
  db: Db,
  collection: string,
  docs: T[]
): Promise<void> {
  if (docs.length === 0) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection<T>(collection).insertMany(docs as any, { ordered: false });
  } catch (err) {
    const writeErrors = (err as { writeErrors?: { code?: number }[] }).writeErrors;
    const onlyDuplicates = writeErrors?.every((e) => e.code === 11000);
    if (!isDuplicateKey(err) && !onlyDuplicates) throw err;
  }
}

/* ============================================================
   LOCAL FILE FALLBACK (development only)
   ============================================================ */

function readFileDb(): DatabaseSchema {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DatabaseSchema;
    data.analytics ??= emptyAnalytics();
    return data;
  } catch {
    return {
      blogPosts: initialBlogPosts,
      portfolioItems: initialPortfolioItems,
      heroColumns: initialHeroColumns,
      analytics: emptyAnalytics(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

function writeFileDb(data: DatabaseSchema): void {
  if (process.env.VERCEL) {
    throw new Error("Veritabanı ayarlanmamış: Vercel'de MONGODB_URI ortam değişkenini ekleyin.");
  }
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/* ============================================================
   CONTENT STORAGE (blog, portfolio, hero)
   ============================================================ */

function toContent(db: Partial<DatabaseSchema>): ContentSchema {
  return {
    blogPosts: db.blogPosts ?? initialBlogPosts,
    portfolioItems: db.portfolioItems ?? initialPortfolioItems,
    heroColumns: db.heroColumns?.length ? db.heroColumns : initialHeroColumns,
    lastUpdated: db.lastUpdated ?? new Date().toISOString(),
  };
}

/** Always reads fresh (uncached) content. Use for read-modify-write. */
async function loadContent(): Promise<ContentSchema> {
  if (!hasMongo()) return toContent(readFileDb());

  const db = await getDb();
  const contentCol = db.collection<ContentDoc>("content");
  const doc = await contentCol.findOne({ _id: "main" }, { projection: { _id: 0 } });
  if (doc) return toContent(doc);

  // Empty database: seed it with the bundled data (only the first writer wins).
  await insertIgnoringDuplicates<ContentDoc>(db, "content", [{ _id: "main", ...toContent(seedDb) }]);
  const seeded = await contentCol.findOne({ _id: "main" }, { projection: { _id: 0 } });
  return toContent(seeded ?? seedDb);
}

async function saveContent(content: ContentSchema): Promise<void> {
  content.lastUpdated = new Date().toISOString();
  if (hasMongo()) {
    const db = await getDb();
    await db
      .collection<ContentDoc>("content")
      .replaceOne({ _id: "main" }, content, { upsert: true });
  } else {
    const db = readFileDb();
    writeFileDb({ ...db, ...content });
  }
  // Pages show the change on the very next request.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** Cached read for public pages; invalidated by saveContent(). */
async function getCachedContent(): Promise<ContentSchema> {
  "use cache";
  cacheTag(CONTENT_TAG);
  return loadContent();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ============================================================
   BLOG CRUD
   ============================================================ */

function withDefaults(post: BlogPost): BlogPost {
  return { ...post, authorAvatar: post.authorAvatar || "/ebru.png" };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const content = await getCachedContent();
  return content.blogPosts.map(withDefaults);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const content = await getCachedContent();
  const post = content.blogPosts.find((p) => p.id === id);
  return post ? withDefaults(post) : null;
}

/** Blog posts including live view counts (admin panel). */
export async function getBlogPostsWithStats(): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const stats = await getBlogStats(posts.map((p) => p.id));
  return posts.map((p) => ({ ...p, ...stats[p.id] }));
}

export async function getBlogPostByIdWithStats(id: string): Promise<BlogPost | null> {
  const post = await getBlogPostById(id);
  if (!post) return null;
  const stats = await getBlogStats([post.id]);
  return { ...post, ...stats[post.id] };
}

export async function createBlogPost(post: Omit<BlogPost, "id"> & { id?: string }): Promise<BlogPost> {
  const content = await loadContent();
  const slug = post.id?.trim() || slugify(post.title);

  const newPost: BlogPost = {
    ...post,
    id: slug,
    date: post.date || new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    author: post.author || "Ebru Atik",
    authorTitle: post.authorTitle || "Profesyonel Makyaj Sanatçısı",
    authorAvatar: post.authorAvatar || "/logo.png",
  };
  delete newPost.views;
  delete newPost.uniqueViews;

  content.blogPosts = [newPost, ...content.blogPosts.filter((p) => p.id !== slug)];
  await saveContent(content);
  return newPost;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const content = await loadContent();
  const index = content.blogPosts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: BlogPost = { ...content.blogPosts[index], ...updates, id };
  // View counts live in the analytics collections, not on the post.
  delete updated.views;
  delete updated.uniqueViews;

  content.blogPosts[index] = updated;
  await saveContent(content);
  return updated;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const content = await loadContent();
  const before = content.blogPosts.length;
  content.blogPosts = content.blogPosts.filter((p) => p.id !== id);
  if (content.blogPosts.length === before) return false;
  await saveContent(content);
  return true;
}

/* ============================================================
   PORTFOLIO CRUD
   ============================================================ */

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const content = await getCachedContent();
  return content.portfolioItems;
}

export async function getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
  const content = await getCachedContent();
  return content.portfolioItems.find((p) => p.id === id) || null;
}

export async function createPortfolioItem(
  item: Omit<PortfolioItem, "id"> & { id?: string }
): Promise<PortfolioItem> {
  const content = await loadContent();
  const slug = item.id?.trim() || slugify(item.title);

  const newItem: PortfolioItem = {
    ...item,
    id: slug,
    gallery: item.gallery && item.gallery.length > 0 ? item.gallery : [item.image],
    details: item.details || {
      duration: "90 dk",
      products: "Lüks Profesyonel Segment",
      finish: "Soft Glow",
      photography: "Stüdyo & Gün Işığı",
    },
  };

  content.portfolioItems = [...content.portfolioItems.filter((p) => p.id !== slug), newItem];
  await saveContent(content);
  return newItem;
}

export async function updatePortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  const content = await loadContent();
  const index = content.portfolioItems.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: PortfolioItem = { ...content.portfolioItems[index], ...updates, id };
  content.portfolioItems[index] = updated;
  await saveContent(content);
  return updated;
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const content = await loadContent();
  const before = content.portfolioItems.length;
  content.portfolioItems = content.portfolioItems.filter((p) => p.id !== id);
  if (content.portfolioItems.length === before) return false;
  await saveContent(content);
  return true;
}

/* ============================================================
   HERO / HEADER STAGE DYNAMIC MANAGEMENT
   ============================================================ */

export async function getHeroColumns(): Promise<HeroColumn[]> {
  const content = await getCachedContent();
  return content.heroColumns.length ? content.heroColumns : initialHeroColumns;
}

export async function updateHeroColumns(columns: HeroColumn[]): Promise<HeroColumn[]> {
  const content = await loadContent();
  content.heroColumns = columns;
  await saveContent(content);
  return columns;
}

/* ============================================================
   ANALYTICS & UNIQUE VISITOR TRACKING
   ============================================================ */

export interface AnalyticsSummary {
  totalUniqueVisitors: number;
  todayUniqueVisitors: number;
  totalPageViews: number;
  totalBlogReads: number;
  blogs: {
    id: string;
    title: string;
    uniqueViews: number;
    totalViews: number;
  }[];
  recentLogs: {
    visitorId: string;
    path: string;
    timestamp: string;
  }[];
}

type LogEntry = AnalyticsSummary["recentLogs"][number];

const todayKey = () => new Date().toISOString().slice(0, 10);

let analyticsSeedChecked = false;

/** Copies the analytics from data/ebru-db.json into an empty database once. */
async function ensureAnalyticsSeeded(db: Db): Promise<void> {
  if (analyticsSeedChecked) return;
  const meta = db.collection<MetaDoc>("meta");
  try {
    await meta.insertOne({ _id: "analyticsSeeded", at: new Date() });
  } catch (err) {
    if (!isDuplicateKey(err)) throw err;
    analyticsSeedChecked = true;
    return; // already seeded
  }
  analyticsSeedChecked = true;

  const a = seedDb.analytics;
  if (!a) return;
  const counters: CounterDoc[] = [];

  await insertIgnoringDuplicates(db, "visitors", (a.uniqueVisitors ?? []).map((v) => ({ _id: v })));
  if (a.pageViewsCount) counters.push({ _id: "pageviews", n: a.pageViewsCount });

  for (const [day, d] of Object.entries(a.dailyVisits ?? {})) {
    await insertIgnoringDuplicates<DayVisitorDoc>(
      db,
      "day_visitors",
      (d.uniqueVisitors ?? []).map((v) => ({ _id: `${day}|${v}`, day, createdAt: new Date(`${day}T12:00:00Z`) }))
    );
    if (d.pageViews) counters.push({ _id: `day:${day}`, n: d.pageViews });
  }
  for (const [id, b] of Object.entries(a.blogAnalytics ?? {})) {
    await insertIgnoringDuplicates<BlogVisitorDoc>(
      db,
      "blog_visitors",
      (b.uniqueVisitors ?? []).map((v) => ({ _id: `${id}|${v}`, blogId: id }))
    );
    if (b.viewsCount) counters.push({ _id: `blog:${id}`, n: b.viewsCount });
  }

  const counterCol = db.collection<CounterDoc>("counters");
  await Promise.all(
    counters.map((c) => counterCol.updateOne({ _id: c._id }, { $inc: { n: c.n } }, { upsert: true }))
  );
  if (a.recentLogs?.length) {
    await meta.updateOne(
      { _id: "recentLogs" },
      { $push: { items: { $each: a.recentLogs.slice(0, MAX_LOGS), $slice: MAX_LOGS } } },
      { upsert: true }
    );
  }
}

async function getBlogStats(
  ids: string[]
): Promise<Record<string, { uniqueViews: number; views: number }>> {
  await connection(); // live stats: always read at request time
  const result: Record<string, { uniqueViews: number; views: number }> = {};
  for (const id of ids) result[id] = { uniqueViews: 0, views: 0 };

  if (!hasMongo()) {
    const a = readFileDb().analytics ?? emptyAnalytics();
    for (const id of ids) {
      const b = a.blogAnalytics?.[id];
      result[id] = { uniqueViews: b?.uniqueVisitors?.length ?? 0, views: b?.viewsCount ?? 0 };
    }
    return result;
  }

  const db = await getDb();
  await ensureAnalyticsSeeded(db);
  const [uniques, views] = await Promise.all([
    db
      .collection<BlogVisitorDoc>("blog_visitors")
      .aggregate<{ _id: string; count: number }>([
        { $match: { blogId: { $in: ids } } },
        { $group: { _id: "$blogId", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection<CounterDoc>("counters")
      .find({ _id: { $in: ids.map((id) => `blog:${id}`) } })
      .toArray(),
  ]);
  for (const u of uniques) if (result[u._id]) result[u._id].uniqueViews = u.count;
  for (const v of views) {
    const id = v._id.slice("blog:".length);
    if (result[id]) result[id].views = v.n;
  }
  return result;
}

export async function getAnalyticsStats(): Promise<AnalyticsSummary> {
  const posts = await getBlogPosts();
  const stats = await getBlogStats(posts.map((p) => p.id));

  let totalBlogReads = 0;
  const blogs = posts.map((post) => {
    const s = stats[post.id];
    totalBlogReads += s.uniqueViews;
    return { id: post.id, title: post.title, uniqueViews: s.uniqueViews, totalViews: s.views };
  });

  if (!hasMongo()) {
    const a = readFileDb().analytics ?? emptyAnalytics();
    return {
      totalUniqueVisitors: a.uniqueVisitors?.length || 0,
      todayUniqueVisitors: a.dailyVisits?.[todayKey()]?.uniqueVisitors?.length || 0,
      totalPageViews: a.pageViewsCount || 0,
      totalBlogReads,
      blogs,
      recentLogs: a.recentLogs || [],
    };
  }

  const db = await getDb();
  const [total, today, pageViews, logs] = await Promise.all([
    db.collection("visitors").countDocuments(),
    db.collection("day_visitors").countDocuments({ day: todayKey() }),
    db.collection<CounterDoc>("counters").findOne({ _id: "pageviews" }),
    db.collection<MetaDoc>("meta").findOne({ _id: "recentLogs" }),
  ]);

  return {
    totalUniqueVisitors: total,
    todayUniqueVisitors: today,
    totalPageViews: pageViews?.n ?? 0,
    totalBlogReads,
    blogs,
    recentLogs: logs?.items ?? [],
  };
}

export async function recordVisit(params: {
  visitorId: string;
  path: string;
  blogId?: string;
}): Promise<{ totalUnique: number; blogUnique?: number }> {
  // Inputs come from a public endpoint: normalise and bound them.
  const visitorId = String(params.visitorId ?? "").slice(0, 64);
  const pagePath = String(params.path || "/").slice(0, 200);
  let blogId = params.blogId ? String(params.blogId).slice(0, 200) : undefined;
  if (blogId) {
    try {
      blogId = decodeURIComponent(blogId);
    } catch {
      /* keep raw */
    }
    const posts = await getBlogPosts();
    if (!posts.some((p) => p.id === blogId)) blogId = undefined;
  }

  const log: LogEntry = {
    visitorId: visitorId.slice(-6),
    path: pagePath,
    timestamp: new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    }),
  };
  const day = todayKey();

  if (!hasMongo()) return recordVisitToFile(visitorId, blogId, log, day);
  if (!visitorId) return { totalUnique: 0 };

  const db = await getDb();
  await ensureAnalyticsSeeded(db);
  const counters = db.collection<CounterDoc>("counters");
  const inc = (id: string) => counters.updateOne({ _id: id }, { $inc: { n: 1 } }, { upsert: true });

  await Promise.all([
    insertIgnoringDuplicates(db, "visitors", [{ _id: visitorId }]),
    insertIgnoringDuplicates<DayVisitorDoc>(db, "day_visitors", [
      { _id: `${day}|${visitorId}`, day, createdAt: new Date() },
    ]),
    inc("pageviews"),
    inc(`day:${day}`),
    db
      .collection<MetaDoc>("meta")
      .updateOne(
        { _id: "recentLogs" },
        { $push: { items: { $each: [log], $position: 0, $slice: MAX_LOGS } } },
        { upsert: true }
      ),
    ...(blogId
      ? [
          insertIgnoringDuplicates<BlogVisitorDoc>(db, "blog_visitors", [
            { _id: `${blogId}|${visitorId}`, blogId },
          ]),
          inc(`blog:${blogId}`),
        ]
      : []),
  ]);

  const [totalUnique, blogUnique] = await Promise.all([
    db.collection("visitors").countDocuments(),
    blogId ? db.collection("blog_visitors").countDocuments({ blogId }) : Promise.resolve(undefined),
  ]);
  return { totalUnique, blogUnique };
}

function recordVisitToFile(
  visitorId: string,
  blogId: string | undefined,
  log: LogEntry,
  day: string
): { totalUnique: number; blogUnique?: number } {
  const db = readFileDb();
  const a = (db.analytics ??= emptyAnalytics());
  if (!visitorId) return { totalUnique: a.uniqueVisitors.length };

  if (!a.uniqueVisitors.includes(visitorId)) a.uniqueVisitors.push(visitorId);
  a.pageViewsCount = (a.pageViewsCount || 0) + 1;

  a.dailyVisits ??= {};
  const d = (a.dailyVisits[day] ??= { uniqueVisitors: [], pageViews: 0 });
  if (!d.uniqueVisitors.includes(visitorId)) d.uniqueVisitors.push(visitorId);
  d.pageViews += 1;

  let blogUnique: number | undefined;
  if (blogId) {
    a.blogAnalytics ??= {};
    const b = (a.blogAnalytics[blogId] ??= { uniqueVisitors: [], viewsCount: 0 });
    if (!b.uniqueVisitors.includes(visitorId)) b.uniqueVisitors.push(visitorId);
    b.viewsCount = (b.viewsCount || 0) + 1;
    blogUnique = b.uniqueVisitors.length;
  }

  a.recentLogs = [log, ...(a.recentLogs ?? [])].slice(0, MAX_LOGS);
  writeFileDb(db);
  return { totalUnique: a.uniqueVisitors.length, blogUnique };
}
