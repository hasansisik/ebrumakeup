import type { MetadataRoute } from "next";
import { getBlogPosts, getPortfolioItems } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ebrumakeup.com";

  const staticDate = "2026-03-01";

  const [blogPosts, portfolioItems] = await Promise.all([
    getBlogPosts(),
    getPortfolioItems(),
  ]);

  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: staticDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const portfolioEntries = portfolioItems.map((item) => ({
    url: `${baseUrl}/portfolio/${item.id}`,
    lastModified: staticDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: staticDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: staticDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...portfolioEntries,
    ...blogEntries,
  ];
}
