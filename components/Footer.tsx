"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  InstagramIcon,
  TiktokIcon,
  MailIcon,
} from "@/components/Icons";

import Logo from "@/components/Logo";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);
  const pathname = usePathname();

  // Hide footer on ebru-admin, ebru-giris, and ebru-makeup
  const isNoFooter =
    pathname.startsWith("/ebru-admin") ||
    pathname.startsWith("/ebru-giris") ||
    pathname.startsWith("/ebru-makeup");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (isNoFooter) {
    return null;
  }

  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Logo light={true} />
            <p>
              Profesyonel freelance makyaj sanatçısı. Gelin, özel gün,
              eğitim ve editoryal projelerinizde güzelliğinizi ön plana çıkarıyorum.
            </p>
            <div className="footer-social">
              <a
                href="https://instagram.com/ebruatikmakeup"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
                id="social-instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@ebruatikmakeup"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="TikTok"
                id="social-tiktok"
              >
                <TiktokIcon size={18} />
              </a>
              <a
                href="mailto:info@ebrumakeup.com"
                className="footer-social-link"
                aria-label="E-Posta"
                id="social-email"
              >
                <MailIcon size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Sayfalar</h4>
            <ul className="footer-links">
              <li>
                <Link href="/">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/#portfolio">Portfolyo</Link>
              </li>
              <li>
                <Link href="/#services">Hizmetler</Link>
              </li>
              <li>
                <Link href="/#about">Hakkımda</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="footer-title">Hizmetler</h4>
            <ul className="footer-links">
              <li>
                <Link href="/#services">Gelin Makyajı</Link>
              </li>
              <li>
                <Link href="/#services">Özel Gün & Davet</Link>
              </li>
              <li>
                <Link href="/#services">Profesyonel Çekim</Link>
              </li>
              <li>
                <Link href="/#services">Makyaj Eğitimi</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-title">İletişim</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@ebrumakeup.com" className="footer-email-link">
                  info@ebrumakeup.com
                </a>
              </li>
              <li>
                <span>Şişli, İstanbul</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} EbruMakeup • Ebru Atik • Tüm hakları saklıdır.</p>
          <p>İstanbul Freelance Makyaj Sanatçısı</p>
        </div>
      </div>
    </footer>
  );
}
