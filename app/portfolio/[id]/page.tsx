import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioItems, getPortfolioItemById } from "@/lib/db";
import { MailIcon } from "@/components/Icons";

// Next.js 16 instant shell config
export const instant = false;

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const items = await getPortfolioItems();
  return items.map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPortfolioItemById(id);

  if (!item) {
    return {
      title: "Çalışma Bulunamadı | EbruMakeUp",
    };
  }

  return {
    title: `${item.title} - ${item.category} Koleksiyonu | EbruMakeUp`,
    description: item.description,
    openGraph: {
      title: `${item.title} | EbruMakeUp Portfolyo`,
      description: item.description,
      images: [
        {
          url: item.image,
          width: 800,
          height: 1000,
          alt: item.title,
        },
      ],
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioPageProps) {
  const { id } = await params;
  const item = await getPortfolioItemById(id);

  if (!item) {
    notFound();
  }

  const allItems = await getPortfolioItems();

  // Find next item for seamless discovery
  const currentIndex = allItems.findIndex((p) => p.id === id);
  const nextItem =
    allItems[(currentIndex + 1) % allItems.length];
  const prevItem =
    allItems[
      (currentIndex - 1 + allItems.length) % allItems.length
    ];

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${item.title} - EbruMakeUp`,
    description: item.longDescription,
    author: {
      "@type": "Person",
      name: "Ebru Atik",
      jobTitle: "Profesyonel Makyaj Sanatçısı",
    },
    image: item.gallery,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="portfolio-detail-page">
        {/* Header Hero Area */}
        <header className="portfolio-detail-header">
          <div className="container">
            {/* Breadcrumb Navigation */}
            <div className="portfolio-detail-nav">
              <Link href="/#portfolio" className="portfolio-back-btn">
                <span>←</span> Portfolyoya Dön
              </Link>
              <span className="portfolio-category-badge">{item.category}</span>
            </div>

            <h1 className="portfolio-detail-title">{item.title}</h1>
            <p className="portfolio-detail-subtitle">{item.subtitle}</p>
            <p className="portfolio-detail-description">
              {item.longDescription}
            </p>

            {/* Technical Specifications Bar */}
            <div className="portfolio-meta-bar">
              <div className="portfolio-meta-item">
                <span className="meta-label">Uygulama Süresi</span>
                <span className="meta-value">{item.details.duration}</span>
              </div>
              <div className="portfolio-meta-item">
                <span className="meta-label">Ürün Segmenti</span>
                <span className="meta-value">{item.details.products}</span>
              </div>
              <div className="portfolio-meta-item">
                <span className="meta-label">Bitiş Dokusu</span>
                <span className="meta-value">{item.details.finish}</span>
              </div>
              <div className="portfolio-meta-item">
                <span className="meta-label">Işık Uyumu</span>
                <span className="meta-value">{item.details.photography}</span>
              </div>
            </div>
          </div>
        </header>

        {/* FULL PAGE ZERO-GAP EDGE-TO-EDGE GALLERY */}
        <section className="portfolio-edge-gallery-section" id="gallery">
          <div className="portfolio-edge-gallery-grid">
            {item.gallery.map((imgSrc, idx) => (
              <figure key={idx} className="edge-gallery-item">
                <Image
                  src={imgSrc}
                  alt={`${item.title} - Detay Görseli ${idx + 1}`}
                  width={900}
                  height={1200}
                  className="edge-gallery-img"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33.33vw"
                  priority={idx < 3}
                />
                <figcaption className="edge-gallery-caption">
                  <span className="caption-number">0{idx + 1}</span>
                  <span className="caption-title">{item.title}</span>
                  <span className="caption-cat">{item.category} • EbruMakeUp</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Consultation & Booking CTA */}
        <section className="portfolio-booking-banner">
          <div className="container">
            <div className="booking-card">
              <span className="section-label">Rezervasyon & Bilgi</span>
              <h2 className="booking-title">
                Bu Görünümü <strong>Özel Gününüze</strong> Taşıyalım
              </h2>
              <p className="booking-text">
                Randevu takvimimiz özellikle düğün ve davet sezonunda hızla dolmaktadır.
                Tarihinizi ayırtmak ve kişiselleştirilmiş prova seansı planlamak için
                e-posta üzerinden doğrudan iletişime geçebilirsiniz.
              </p>
              <div className="booking-actions">
                <a
                  href={`mailto:info@ebrumakeup.com?subject=${encodeURIComponent(`Randevu Talebi - ${item.title}`)}&body=${encodeURIComponent(`Merhaba Ebru Hanım, web sitenizdeki "${item.title}" çalışmanız hakkında bilgi almak ve randevu oluşturmak istiyorum.`)}`}
                  className="btn btn-primary"
                >
                  <MailIcon size={20} />
                  <span>E-Posta ile Randevu Planla</span>
                </a>
                <Link href="/#portfolio" className="btn btn-secondary">
                  Tüm Portfolyoyu İncele
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pagination: Next & Prev Category */}
        <nav className="portfolio-adjacent-nav" aria-label="Diğer Kategoriler">
          <div className="container">
            <div className="adjacent-grid">
              <Link
                href={`/portfolio/${prevItem.id}`}
                className="adjacent-card adjacent-prev"
                scroll={true}
              >
                <span className="adjacent-direction">← Önceki Kategori</span>
                <span className="adjacent-title">{prevItem.title}</span>
                <span className="adjacent-cat">{prevItem.category}</span>
              </Link>
              <Link
                href={`/portfolio/${nextItem.id}`}
                className="adjacent-card adjacent-next"
                scroll={true}
              >
                <span className="adjacent-direction">Sonraki Kategori →</span>
                <span className="adjacent-title">{nextItem.title}</span>
                <span className="adjacent-cat">{nextItem.category}</span>
              </Link>
            </div>
          </div>
        </nav>
      </article>
    </>
  );
}
