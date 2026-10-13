"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable native browser scroll restoration so Next.js doesn't restore bottom scroll
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If there is no hash anchor (like #portfolio or #contact), force scroll to top
    if (!window.location.hash) {
      window.scrollTo(0, 0);

      // Extra frames to ensure layout paint and dynamic images don't retain previous scroll offset
      const rAF = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      const t1 = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      const t2 = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 150);

      return () => {
        cancelAnimationFrame(rAF);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname]);

  return null;
}
