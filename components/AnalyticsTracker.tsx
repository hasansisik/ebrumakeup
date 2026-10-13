"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const key = "ebru_makeup_vid";
    let vid = localStorage.getItem(key);
    if (!vid) {
      vid =
        "v_" +
        Math.random().toString(36).substring(2, 9) +
        "_" +
        Date.now().toString(36);
      localStorage.setItem(key, vid);
    }
    return vid;
  } catch {
    return "v_guest_" + Date.now().toString(36);
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip tracking for admin and login routes to keep visitor stats pure
    if (
      pathname.startsWith("/ebru-admin") ||
      pathname.startsWith("/ebru-giris") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    // Check if on a blog post detail page
    let blogId: string | undefined;
    if (pathname.startsWith("/blog/") && pathname !== "/blog") {
      blogId = pathname.replace("/blog/", "").split("/")[0];
    }

    // Fire tracking ping (non-blocking)
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          path: pathname,
          blogId,
        }),
      }).catch(() => {
        // Silent catch
      });
    } catch {
      // Silent catch
    }
  }, [pathname]);

  return null;
}
