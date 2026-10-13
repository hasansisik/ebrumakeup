"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@/components/Icons";

interface HeroPanel {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const panels: HeroPanel[] = [
  {
    id: "bridal",
    tag: "İmza Hizmet",
    title: "Gelin Makyajı",
    subtitle: "Zamansız zarafet ve 16 saat kalıcı ışıltı",
    description: "Özel gününüzde cildinizi maskelemeden, doğal güzelliğinizi ön plana çıkaran profesyonel gelin tasarımı ve prova seansı.",
    image: "/images/portfolio/bridal.jpg",
    ctaText: "Gelin Randevusu Al",
    ctaLink: "#contact",
  },
  {
    id: "editorial",
    tag: "Moda & Çekim",
    title: "Editoryal & Podyum",
    subtitle: "Kamera ışıklarına özel HD formüller",
    description: "Dergi kapakları, katalog çekimleri ve moda defilelerinde stilinizi sanata dönüştüren yüksek çözünürlüklü makyaj uygulaması.",
    image: "/images/portfolio/editorial.jpg",
    ctaText: "Çalışmaları İncele",
    ctaLink: "#portfolio",
  },
  {
    id: "evening",
    tag: "Gece & Davet",
    title: "Davet & Kutlama",
    subtitle: "Çarpıcı bakışlar ve porselen pürüzsüzlüğü",
    description: "Nişan, gala ve tüm özel organizasyonlarınızda yüz anatominize özel tonlarla gecenin yıldızı olacağınız kusursuz stil.",
    image: "/images/portfolio/evening.jpg",
    ctaText: "Hizmetleri Keşfet",
    ctaLink: "#services",
  },
];

export default function HeroCreative() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="hero-creative" id="hero">
      {/* Decorative ambient glow */}
      <div className="hero-ambient-glow" />

      <div className="container">
        {/* Editorial Header Content */}
        <div className="hero-creative-header">
          <div className="hero-badge">
            <SparklesIcon size={14} className="meta-icon" />
            <span>Ebru Atik • Freelance Makeup Artist</span>
          </div>
          <h1 className="hero-creative-title">
            Güzelliğinizi <strong>Sanata</strong> Dönüştürüyorum
          </h1>
          <p className="hero-creative-subtitle">
            Her yüz kendine has bir hikaye anlatır. Gelin, editoryal ve özel davetlerinizde
            kişiye özel hazırlanan profesyonel makyaj deneyimini keşfedin.
          </p>

          {/* Quick Category Tabs for Mobile & Accessibility */}
          <div className="hero-tabs" role="tablist" aria-label="Makyaj Kategorileri">
            {panels.map((panel, idx) => (
              <button
                key={panel.id}
                role="tab"
                aria-selected={activeIndex === idx}
                className={`hero-tab-btn ${activeIndex === idx ? "active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                {panel.title}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Panel Expanding Horizontal Showcase */}
        <div className="hero-accordion-wrapper">
          <div className="hero-accordion">
            {panels.map((panel, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div
                  key={panel.id}
                  className={`hero-panel ${isActive ? "active" : ""}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  role="region"
                  aria-label={panel.title}
                >
                  {/* Background Image */}
                  <div className="hero-panel-img">
                    <Image
                      src={panel.image}
                      alt={panel.title}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Gradient Scrim for Contrast & Readability */}
                  <div className="hero-panel-overlay" />

                  {/* Collapsed State Title (Visible when contracted) */}
                  <div className="hero-panel-collapsed">
                    <span className="hero-panel-collapsed-badge">{panel.tag}</span>
                    <h3 className="hero-panel-collapsed-title">{panel.title}</h3>
                  </div>

                  {/* Expanded Content (Visible when active) */}
                  <div className="hero-panel-expanded">
                    <div className="hero-panel-content">
                      <span className="hero-panel-tag">{panel.tag}</span>
                      <h2 className="hero-panel-title">{panel.title}</h2>
                      <p className="hero-panel-subtitle">{panel.subtitle}</p>
                      <p className="hero-panel-desc">{panel.description}</p>
                      <Link href={panel.ctaLink} className="hero-panel-cta">
                        {panel.ctaText} <ArrowRightIcon size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
