"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";

interface HeroColumn {
  id: string;
  step: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const columns: HeroColumn[] = [
  {
    id: "bridal",
    step: "01",
    tag: "İmza Hizmet",
    title: "Gelin Makyajı",
    subtitle: "Zamansız Zarafet & 16 Saat Kalıcı Işıltı",
    description: "Özel gününüzde cildinizi maskelemeden, doğal güzelliğinizi ve yüz hatlarınızı ön plana çıkaran profesyonel gelin tasarımı ve prova seansı.",
    image: "/images/catalog/gelin/gelin-1.png",
    ctaText: "Randevu Al",
    ctaLink: "#contact",
  },
  {
    id: "editorial",
    step: "02",
    tag: "Moda & Çekim",
    title: "Editoryal & Podyum",
    subtitle: "Kamera Işıklarına Özel HD Formüller",
    description: "Dergi kapakları, katalog çekimleri ve moda defilelerinde stilinizi sanata dönüştüren yüksek çözünürlüklü profesyonel makyaj uygulaması.",
    image: "/images/catalog/editorial/editorial-6.jpeg",
    ctaText: "Portfolyoyu Gör",
    ctaLink: "#portfolio",
  },
  {
    id: "evening",
    step: "03",
    tag: "Gece & Davet",
    title: "Davet & Gece Makyajı",
    subtitle: "Büyüleyici Bakışlar & Porselen Ten",
    description: "Nişan, gala ve tüm özel kutlamalarınızda yüz anatominize özel tonlarla gecenin yıldızı olacağınız sofistike ve kalıcı görünüm.",
    image: "/images/catalog/ozel-gun/ozel-gun-1.png",
    ctaText: "Hizmetleri İncele",
    ctaLink: "#services",
  },
];

interface HeroScrollColumnsProps {
  initialColumns?: HeroColumn[];
}

export default function HeroScrollColumns({ initialColumns }: HeroScrollColumnsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const isTransitioningRef = useRef(false);
  const displayColumns =
    initialColumns && initialColumns.length > 0 ? initialColumns : columns;

  const scrollToStep = useCallback((stepIndex: number) => {
    if (!containerRef.current) return;
    const totalDistance = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + (stepIndex / 2) * totalDistance;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
    setActiveStep(stepIndex);
  }, []);

  // Sync with scroll position
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const totalDistance = containerRef.current.offsetHeight - window.innerHeight;

          if (totalDistance <= 0) return;

          const scrolled = -rect.top;
          const progress = Math.min(Math.max(scrolled / totalDistance, 0), 1);

          if (progress < 0.3) {
            setActiveStep(0);
          } else if (progress < 0.7) {
            setActiveStep(1);
          } else {
            setActiveStep(2);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Wheel intercept for snappy responsive step transitions
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inHeroRange = rect.top <= 10 && rect.bottom >= window.innerHeight + 10;

      if (!inHeroRange) return;

      // Ignore tiny touchpad vibrations
      if (Math.abs(e.deltaY) < 22) return;

      if (e.deltaY > 0) {
        // Scrolling down
        if (activeStep < 2) {
          e.preventDefault();
          if (!isTransitioningRef.current) {
            isTransitioningRef.current = true;
            scrollToStep(activeStep + 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 650);
          }
        }
      } else if (e.deltaY < 0) {
        // Scrolling up
        if (activeStep > 0 && rect.top >= -window.innerHeight * 2.2) {
          e.preventDefault();
          if (!isTransitioningRef.current) {
            isTransitioningRef.current = true;
            scrollToStep(activeStep - 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 650);
          }
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeStep, scrollToStep]);

  return (
    <div
      ref={containerRef}
      className="hero-scroll-container"
      id="hero"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="hero-scroll-sticky">
        <div className="hero-columns-wrapper">
          {displayColumns.map((col, idx) => {
            const isActive = activeStep === idx;

            return (
              <div
                key={col.id}
                className={`hero-column ${isActive ? "active" : ""}`}
                onClick={() => scrollToStep(idx)}
                role="region"
                aria-label={col.title}
              >
                {/* Background Image */}
                <div className="hero-column-bg">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 65vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {/* Scrim Overlay */}
                <div className="hero-column-overlay" />

                {/* Collapsed State (Visible when narrow) */}
                <div className="hero-column-collapsed">
                  <span className="hero-col-number">{col.step}</span>
                  <div className="hero-col-vertical-title">{col.title}</div>
                </div>

                {/* Expanded State (Visible when active) */}
                <div className="hero-column-expanded">
                  <div className="hero-expanded-content">
                    <div className="hero-col-badge">
                      <span>{col.step}</span>
                      <span className="badge-dot">•</span>
                      <span>{col.tag}</span>
                    </div>
                    <h1 className="hero-col-title">{col.title}</h1>
                    <p className="hero-col-subtitle">{col.subtitle}</p>
                    <p className="hero-col-desc">{col.description}</p>
                    <div className="hero-col-actions">
                      <Link href={col.ctaLink} className="hero-col-btn">
                        {col.ctaText} <ArrowRightIcon size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
