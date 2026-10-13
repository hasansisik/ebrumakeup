"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function Header() {
  const [isOverLight, setIsOverLight] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on ebru-admin, ebru-giris, and ebru-makeup
  const isNoHeader =
    pathname.startsWith("/ebru-admin") ||
    pathname.startsWith("/ebru-giris") ||
    pathname.startsWith("/ebru-makeup");

  useEffect(() => {
    if (isNoHeader) return;
    const handleScroll = () => {
      if (pathname === "/") {
        // Hero takes ~300vh. Past 275vh, user enters light section
        const heroThreshold = window.innerHeight * 2.75;
        setIsOverLight(window.scrollY > heroThreshold);
      } else {
        setIsOverLight(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/#portfolio", label: "Portfolyo" },
    { href: "/#services", label: "Hizmetler" },
    { href: "/#about", label: "Hakkımda" },
    { href: "/blog", label: "Blog" },
    { href: "/#contact", label: "İletişim" },
  ];

  if (isNoHeader) {
    return null;
  }

  return (
    <>
      <header
        id="site-header"
        className={`header-direct ${isOverLight ? "header-theme-light" : "header-theme-dark"}`}
      >
        <div className="header-container">
          {/* Authentic Beauty Brand Logo */}
          <Logo light={isOverLight} />

          {/* Clean Typography Navigation without Box Background */}
          <nav className="nav-desktop" id="nav-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-direct"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className={`menu-toggle ${isMobileOpen ? "open" : ""}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menüyü Aç/Kapat"
            id="menu-toggle"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <nav
        className={`nav-mobile ${isMobileOpen ? "open" : ""}`}
        id="nav-mobile"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="nav-link-mobile"
            onClick={() => setIsMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
