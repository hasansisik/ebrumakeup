import fs from "fs";
import path from "path";
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

const defaultAnalytics: AnalyticsSchema = {
  baselineVisitors: 0,
  baselinePageViews: 0,
  uniqueVisitors: [],
  pageViewsCount: 0,
  blogAnalytics: {
    "cilt-bakimi-rehberi": {
      uniqueVisitors: [],
      viewsCount: 0,
    },
    "2026-makyaj-trendleri": {
      uniqueVisitors: [],
      viewsCount: 0,
    },
    "gelin-makyaji-ipuclari": {
      uniqueVisitors: [],
      viewsCount: 0,
    },
  },
  dailyVisits: {},
  recentLogs: [],
};

const DB_PATH = path.join(process.cwd(), "data", "ebru-db.json");

// In-memory cache for fast read operations
let cachedDb: DatabaseSchema | null = null;

function ensureDataDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDb(): DatabaseSchema {
  ensureDataDirectory();

  if (!fs.existsSync(DB_PATH)) {
    // Seed initial data
    const initialData: DatabaseSchema = {
      blogPosts: initialBlogPosts,
      portfolioItems: initialPortfolioItems,
      heroColumns: initialHeroColumns,
      analytics: defaultAnalytics,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
    cachedDb = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(raw) as DatabaseSchema;
    if (!data.analytics) {
      data.analytics = defaultAnalytics;
    }
    if (!data.heroColumns || data.heroColumns.length === 0) {
      data.heroColumns = initialHeroColumns;
    }
    cachedDb = data;
    return data;
  } catch (error) {
    console.error("Error reading database file, using fallback:", error);
    if (cachedDb) return cachedDb;
    return {
      blogPosts: initialBlogPosts,
      portfolioItems: initialPortfolioItems,
      heroColumns: initialHeroColumns,
      analytics: defaultAnalytics,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDataDirectory();
  data.lastUpdated = new Date().toISOString();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    cachedDb = data;
  } catch (error) {
    console.error("Error writing to database:", error);
    throw error;
  }
}

/* ============================================================
   BLOG CRUD
   ============================================================ */

function enrichPostWithStats(post: BlogPost, analytics?: AnalyticsSchema): BlogPost {
  const blogId = post.id;
  const blogData = analytics?.blogAnalytics?.[blogId];
  const uniqueCount = blogData?.uniqueVisitors?.length ?? post.uniqueViews ?? 0;
  const totalViews = blogData?.viewsCount ?? post.views ?? 0;

  return {
    ...post,
    authorAvatar: post.authorAvatar || "/ebru.png",
    uniqueViews: uniqueCount,
    views: totalViews,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const db = readDb();
  return db.blogPosts.map((p) => enrichPostWithStats(p, db.analytics));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const db = readDb();
  const post = db.blogPosts.find((p) => p.id === id);
  if (!post) return null;
  return enrichPostWithStats(post, db.analytics);
}

export async function createBlogPost(post: Omit<BlogPost, "id"> & { id?: string }): Promise<BlogPost> {
  const db = readDb();

  // Generate slug/id if not provided
  const slug =
    post.id?.trim() ||
    post.title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const newPost: BlogPost = {
    ...post,
    id: slug,
    date: post.date || new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    author: post.author || "Ebru Atik",
    authorTitle: post.authorTitle || "Profesyonel Makyaj Sanatçısı",
    authorAvatar: post.authorAvatar || "/logo.png",
  };

  // Remove existing with same id if any, prepend new post
  db.blogPosts = [newPost, ...db.blogPosts.filter((p) => p.id !== slug)];
  writeDb(db);
  return newPost;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const db = readDb();
  const index = db.blogPosts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: BlogPost = {
    ...db.blogPosts[index],
    ...updates,
    id, // Keep ID unchanged
  };

  db.blogPosts[index] = updated;
  writeDb(db);
  return updated;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const db = readDb();
  const beforeCount = db.blogPosts.length;
  db.blogPosts = db.blogPosts.filter((p) => p.id !== id);
  if (db.blogPosts.length !== beforeCount) {
    writeDb(db);
    return true;
  }
  return false;
}

/* ============================================================
   PORTFOLIO CRUD
   ============================================================ */

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const db = readDb();
  return db.portfolioItems;
}

export async function getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
  const db = readDb();
  return db.portfolioItems.find((p) => p.id === id) || null;
}

export async function createPortfolioItem(
  item: Omit<PortfolioItem, "id"> & { id?: string }
): Promise<PortfolioItem> {
  const db = readDb();

  const slug =
    item.id?.trim() ||
    item.title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

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

  db.portfolioItems = [...db.portfolioItems.filter((p) => p.id !== slug), newItem];
  writeDb(db);
  return newItem;
}

export async function updatePortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  const db = readDb();
  const index = db.portfolioItems.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: PortfolioItem = {
    ...db.portfolioItems[index],
    ...updates,
    id,
  };

  db.portfolioItems[index] = updated;
  writeDb(db);
  return updated;
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const db = readDb();
  const beforeCount = db.portfolioItems.length;
  db.portfolioItems = db.portfolioItems.filter((p) => p.id !== id);
  if (db.portfolioItems.length !== beforeCount) {
    writeDb(db);
    return true;
  }
  return false;
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

export async function getAnalyticsStats(): Promise<AnalyticsSummary> {
  const db = readDb();
  const analytics = db.analytics || defaultAnalytics;

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayUnique =
    analytics.dailyVisits?.[todayKey]?.uniqueVisitors?.length || 0;

  const totalUnique = analytics.uniqueVisitors?.length || 0;
  const totalPageViews = analytics.pageViewsCount || 0;

  let totalBlogReads = 0;
  const blogs = db.blogPosts.map((post) => {
    const blogData = analytics.blogAnalytics?.[post.id];
    const unique = blogData?.uniqueVisitors?.length ?? post.uniqueViews ?? 0;
    const views = blogData?.viewsCount ?? post.views ?? 0;
    totalBlogReads += unique;
    return {
      id: post.id,
      title: post.title,
      uniqueViews: unique,
      totalViews: views,
    };
  });

  return {
    totalUniqueVisitors: totalUnique,
    todayUniqueVisitors: todayUnique,
    totalPageViews: totalPageViews,
    totalBlogReads: totalBlogReads,
    blogs,
    recentLogs: analytics.recentLogs || [],
  };
}

export async function recordVisit(params: {
  visitorId: string;
  path: string;
  blogId?: string;
}): Promise<{ totalUnique: number; blogUnique?: number }> {
  const db = readDb();
  if (!db.analytics) {
    db.analytics = defaultAnalytics;
  }
  const analytics = db.analytics;

  const { visitorId, path, blogId } = params;
  if (!visitorId) {
    return {
      totalUnique: analytics.uniqueVisitors?.length || 0,
    };
  }

  // 1. Check & record unique visitor
  if (!analytics.uniqueVisitors) analytics.uniqueVisitors = [];
  if (!analytics.uniqueVisitors.includes(visitorId)) {
    analytics.uniqueVisitors.push(visitorId);
  }

  // 2. Increment total page views
  analytics.pageViewsCount = (analytics.pageViewsCount || 0) + 1;

  // 3. Record daily stats
  const todayKey = new Date().toISOString().slice(0, 10);
  if (!analytics.dailyVisits) analytics.dailyVisits = {};
  if (!analytics.dailyVisits[todayKey]) {
    analytics.dailyVisits[todayKey] = { uniqueVisitors: [], pageViews: 0 };
  }
  if (!analytics.dailyVisits[todayKey].uniqueVisitors.includes(visitorId)) {
    analytics.dailyVisits[todayKey].uniqueVisitors.push(visitorId);
  }
  analytics.dailyVisits[todayKey].pageViews += 1;

  // 4. Record blog analytics if blogId
  let blogUniqueCount: number | undefined;
  if (blogId) {
    if (!analytics.blogAnalytics) analytics.blogAnalytics = {};
    if (!analytics.blogAnalytics[blogId]) {
      analytics.blogAnalytics[blogId] = {
        uniqueVisitors: [],
        viewsCount: 0,
      };
    }
    const blogData = analytics.blogAnalytics[blogId];
    if (!blogData.uniqueVisitors.includes(visitorId)) {
      blogData.uniqueVisitors.push(visitorId);
    }
    blogData.viewsCount = (blogData.viewsCount || 0) + 1;

    blogUniqueCount = blogData.uniqueVisitors.length;

    // Sync to post object in db
    const postIdx = db.blogPosts.findIndex((p) => p.id === blogId);
    if (postIdx !== -1) {
      db.blogPosts[postIdx].uniqueViews = blogUniqueCount;
      db.blogPosts[postIdx].views = blogData.viewsCount;
    }
  }

  // 5. Recent logs (keep last 25)
  if (!analytics.recentLogs) analytics.recentLogs = [];
  analytics.recentLogs.unshift({
    visitorId: visitorId.slice(-6),
    path: path || "/",
    timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  });
  if (analytics.recentLogs.length > 25) {
    analytics.recentLogs = analytics.recentLogs.slice(0, 25);
  }

  writeDb(db);

  return {
    totalUnique: analytics.uniqueVisitors.length,
    blogUnique: blogUniqueCount,
  };
}

/* ============================================================
   HERO / HEADER STAGE DYNAMIC MANAGEMENT
   ============================================================ */

export async function getHeroColumns(): Promise<HeroColumn[]> {
  const db = readDb();
  if (!db.heroColumns || db.heroColumns.length === 0) {
    return initialHeroColumns;
  }
  return db.heroColumns;
}

export async function updateHeroColumns(columns: HeroColumn[]): Promise<HeroColumn[]> {
  const db = readDb();
  db.heroColumns = columns;
  writeDb(db);
  return columns;
}
