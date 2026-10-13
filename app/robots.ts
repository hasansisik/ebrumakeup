import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/ebru-admin",
          "/ebru-admin/",
          "/ebru-giris",
          "/ebru-giris/",
          "/ebru-makeup",
          "/ebru-makeup/",
        ],
      },
    ],
    sitemap: "https://ebrumakeup.com/sitemap.xml",
  };
}
