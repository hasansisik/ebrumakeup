/**
 * Data layer.
 *
 * Production (Vercel): everything is stored in Upstash Redis, because the
 * serverless filesystem is read-only. Configure either
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   (Upstash console)
 * or
 *   KV_REST_API_URL + KV_REST_API_TOKEN                 (Vercel Marketplace integration)
 *
 * Local development without those variables falls back to data/ebru-db.json.
 *
 * On the first run against an empty Redis database, the content and analytics
 * in data/ebru-db.json are copied into Redis automatically.
 */
import fs from "fs";
import path from "path";
import { cacheTag, revalidatePath, revalidateTag } from "next/cache";
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

/* ============================================================
   REDIS (Upstash REST API)
   ============================================================ */

const K = {
  content: "ebru:content",
  analyticsSeeded: "ebru:an:seeded",
  visitors: "ebru:an:visitors",
  pageViews: "ebru:an:pageviews",
  logs: "ebru:an:logs",
  dayVisitors: (day: string) => `ebru:an:day:${day}:visitors`,
  dayViews: (day: string) => `ebru:an:day:${day}:views`,
  blogVisitors: (id: string) => `ebru:an:blog:${id}:visitors`,
  blogViews: (id: string) => `ebru:an:blog:${id}:views`,
};

const DAY_TTL_SECONDS = 60 * 60 * 24 * 120;
const MAX_LOGS = 25;

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

type RedisArg = string | number;

/** Runs commands in a single pipeline request and returns their results in order. */
async function redis(commands: RedisArg[][]): Promise<unknown[]> {
  const cfg = redisConfig();
  if (!cfg) throw new Error("Redis is not configured.");
  if (commands.length === 0) return [];

  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify(commands),
    // Never let Next's fetch cache store database reads (it persists across builds).
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis request failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = data.find((d) => d.error);
  if (failed) throw new Error(`Redis error: ${failed.error}`);
  return data.map((d) => d.result);
}

const toNumber = (v: unknown) => Number(v ?? 0) || 0;

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
    throw new Error(
      "Veritabanı ayarlanmamış: Vercel'de UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN (veya KV_REST_API_URL ve KV_REST_API_TOKEN) ortam değişkenlerini ekleyin."
    );
  }
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/* ============================================================
   CONTENT STORAGE (blog, portfolio, hero)
   ============================================================ */

function toContent(db: DatabaseSchema): ContentSchema {
  return {
    blogPosts: db.blogPosts ?? initialBlogPosts,
    portfolioItems: db.portfolioItems ?? initialPortfolioItems,
    heroColumns: db.heroColumns?.length ? db.heroColumns : initialHeroColumns,
    lastUpdated: db.lastUpdated ?? new Date().toISOString(),
  };
}

/** Always reads fresh (uncached) content. Use for read-modify-write. */
async function loadContent(): Promise<ContentSchema> {
  if (!redisConfig()) return toContent(readFileDb());

  const [raw] = await redis([["GET", K.content]]);
  if (typeof raw === "string") return toContent(JSON.parse(raw));

  // Empty database: seed it with the bundled data (only the first writer wins).
  const initial = toContent(seedDb);
  await redis([["SET", K.content, JSON.stringify(initial), "NX"]]);
  const [afterSeed] = await redis([["GET", K.content]]);
  return typeof afterSeed === "string" ? toContent(JSON.parse(afterSeed)) : initial;
}

async function saveContent(content: ContentSchema): Promise<void> {
  content.lastUpdated = new Date().toISOString();
  if (redisConfig()) {
    await redis([["SET", K.content, JSON.stringify(content)]]);
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
  // View counts live in the analytics store, not on the post.
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

/** Copies the analytics from data/ebru-db.json into an empty Redis database once. */
async function ensureAnalyticsSeeded(): Promise<void> {
  if (analyticsSeedChecked) return;
  const [claimed] = await redis([["SET", K.analyticsSeeded, new Date().toISOString(), "NX"]]);
  analyticsSeedChecked = true;
  if (claimed !== "OK") return;

  const a = seedDb.analytics;
  if (!a) return;
  const cmds: RedisArg[][] = [];
  if (a.uniqueVisitors?.length) cmds.push(["SADD", K.visitors, ...a.uniqueVisitors]);
  if (a.pageViewsCount) cmds.push(["INCRBY", K.pageViews, a.pageViewsCount]);
  for (const [day, d] of Object.entries(a.dailyVisits ?? {})) {
    if (d.uniqueVisitors?.length) cmds.push(["SADD", K.dayVisitors(day), ...d.uniqueVisitors]);
    if (d.pageViews) cmds.push(["INCRBY", K.dayViews(day), d.pageViews]);
    cmds.push(["EXPIRE", K.dayVisitors(day), DAY_TTL_SECONDS], ["EXPIRE", K.dayViews(day), DAY_TTL_SECONDS]);
  }
  for (const [id, b] of Object.entries(a.blogAnalytics ?? {})) {
    if (b.uniqueVisitors?.length) cmds.push(["SADD", K.blogVisitors(id), ...b.uniqueVisitors]);
    if (b.viewsCount) cmds.push(["INCRBY", K.blogViews(id), b.viewsCount]);
  }
  if (a.recentLogs?.length) {
    cmds.push(["RPUSH", K.logs, ...a.recentLogs.slice(0, MAX_LOGS).map((l) => JSON.stringify(l))]);
  }
  await redis(cmds);
}

async function getBlogStats(
  ids: string[]
): Promise<Record<string, { uniqueViews: number; views: number }>> {
  const result: Record<string, { uniqueViews: number; views: number }> = {};

  if (!redisConfig()) {
    const a = readFileDb().analytics ?? emptyAnalytics();
    for (const id of ids) {
      const b = a.blogAnalytics?.[id];
      result[id] = { uniqueViews: b?.uniqueVisitors?.length ?? 0, views: b?.viewsCount ?? 0 };
    }
    return result;
  }

  await ensureAnalyticsSeeded();
  const values = await redis(ids.flatMap((id) => [["SCARD", K.blogVisitors(id)], ["GET", K.blogViews(id)]]));
  ids.forEach((id, i) => {
    result[id] = { uniqueViews: toNumber(values[i * 2]), views: toNumber(values[i * 2 + 1]) };
  });
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

  if (!redisConfig()) {
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

  const [total, today, pageViews, logs] = await redis([
    ["SCARD", K.visitors],
    ["SCARD", K.dayVisitors(todayKey())],
    ["GET", K.pageViews],
    ["LRANGE", K.logs, 0, MAX_LOGS - 1],
  ]);

  return {
    totalUniqueVisitors: toNumber(total),
    todayUniqueVisitors: toNumber(today),
    totalPageViews: toNumber(pageViews),
    totalBlogReads,
    blogs,
    recentLogs: ((logs as string[]) ?? []).flatMap((l) => {
      try {
        return [JSON.parse(l) as LogEntry];
      } catch {
        return [];
      }
    }),
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

  if (!redisConfig()) return recordVisitToFile(visitorId, blogId, log, day);
  if (!visitorId) return { totalUnique: 0 };

  await ensureAnalyticsSeeded();
  const cmds: RedisArg[][] = [
    ["SADD", K.visitors, visitorId],
    ["INCR", K.pageViews],
    ["SADD", K.dayVisitors(day), visitorId],
    ["EXPIRE", K.dayVisitors(day), DAY_TTL_SECONDS],
    ["INCR", K.dayViews(day)],
    ["EXPIRE", K.dayViews(day), DAY_TTL_SECONDS],
    ["LPUSH", K.logs, JSON.stringify(log)],
    ["LTRIM", K.logs, 0, MAX_LOGS - 1],
    ["SCARD", K.visitors],
  ];
  if (blogId) {
    cmds.push(
      ["SADD", K.blogVisitors(blogId), visitorId],
      ["INCR", K.blogViews(blogId)],
      ["SCARD", K.blogVisitors(blogId)]
    );
  }
  const results = await redis(cmds);

  return {
    totalUnique: toNumber(results[8]),
    blogUnique: blogId ? toNumber(results[11]) : undefined,
  };
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
