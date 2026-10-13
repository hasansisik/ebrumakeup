import Image from "next/image";
import Link from "next/link";
import { services, testimonials } from "@/lib/data";
import { getPortfolioItems, getBlogPosts, getHeroColumns } from "@/lib/db";
import HeroScrollColumns from "@/components/HeroScrollColumns";
import {
  RingIcon,
  SparklesIcon,
  CameraIcon,
  BrushIcon,
  StarIcon,
  MailIcon,
  ArrowRightIcon,
  UserIcon,
} from "@/components/Icons";

export default async function Home() {
  const [portfolioItems, blogPosts, heroColumns] = await Promise.all([
    getPortfolioItems(),
    getBlogPosts(),
    getHeroColumns(),
  ]);

  const renderServiceIcon = (type: string) => {
    switch (type) {
      case "ring":
        return <RingIcon size={26} />;
      case "sparkles":
        return <SparklesIcon size={26} />;
      case "camera":
        return <CameraIcon size={26} />;
      case "brush":
        return <BrushIcon size={26} />;
      default:
        return <SparklesIcon size={26} />;
    }
  };

  return (
    <>
      {/* ==================== SCROLL-DRIVEN 3-COLUMN HERO ==================== */}
      <HeroScrollColumns initialColumns={heroColumns} />

      {/* ==================== PORTFOLIO ==================== */}
      <section className="section" id="portfolio">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Portfolyo</span>
            <div className="divider" />
            <h2 className="section-title">
              Seçkin <strong>Çalışmalarım</strong>
            </h2>
            <p className="section-description">
              Her müşterimin yüz anatomisine, ten rengine ve tarzına özel tasarladığım
              güncel makyaj çalışmalarımdan kareler.
            </p>
          </div>

          <div className="portfolio-grid">
            {portfolioItems.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.id}`}
                className="portfolio-card"
                id={`portfolio-${item.id}`}
                scroll={true}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={800}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="portfolio-card-overlay">
                  <h3 className="portfolio-card-title">{item.title}</h3>
                  <span className="portfolio-card-hint">
                    Koleksiyonu Keşfet <ArrowRightIcon size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SERVICES (Soft Powder Pink Tint) ==================== */}
      <section className="section section-bg-powder" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hizmetler</span>
            <div className="divider" />
            <h2 className="section-title">
              Kişiye Özel <strong>Hizmetlerim</strong>
            </h2>
            <p className="section-description">
              Özel günlerden profesyonel prodüksiyonlara kadar kaliteli ürünler ve
              yüksek kalıcılıkla tasarlanan profesyonel makyaj paketleri.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card service-card-with-image"
                id={`service-${index}`}
              >
                {service.image && (
                  <div className="service-card-image-wrap">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={600}
                      height={360}
                      className="service-card-img"
                    />
                    {service.tag && (
                      <span className="service-card-tag">{service.tag}</span>
                    )}
                  </div>
                )}
                <div className="service-card-content">
                  <div className="service-icon">
                    {renderServiceIcon(service.iconType)}
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-text">{service.description}</p>
                  <span className="service-price">{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ABOUT ==================== */}
      <section className="section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-wrapper">
              <Image
                src="/ebru.png"
                alt="Ebru Atik - Profesyonel Makyaj Sanatçısı"
                width={600}
                height={750}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="about-content">
              <span className="section-label">Hakkımda</span>
              <h2 className="about-title">
                Merhaba, ben <strong>Ebru Atik</strong>
              </h2>
              <p className="about-text">
                10 yılı aşkın süredir İstanbul&apos;da freelance makyaj sanatçısı olarak
                gelin, moda ve özel davet projelerinde yer alıyorum. Felsefem, ağır katmanlarla
                yüzü değiştirmek değil; var olan güzelliğinizi en taze ve zarif haliyle ortaya çıkarmaktır.
              </p>
              <p className="about-text">
                Kullandığım tüm ürünler dermatolojik olarak test edilmiş, lüks segment ve kamera
                önü HD teknolojisine uygun profesyonel formüllerdir. Özel anlarınızda sakin,
                güvenli ve keyifli bir hazırlık süreci sunuyorum.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <div className="about-stat-number">500+</div>
                  <div className="about-stat-label">Mutlu Müşteri</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-number">10+</div>
                  <div className="about-stat-label">Yıl Tecrübe</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-number">200+</div>
                  <div className="about-stat-label">Gelin Makyajı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS (Soft Powder Pink Tint) ==================== */}
      <section className="section section-bg-powder" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Müşteri Yorumları</span>
            <div className="divider" />
            <h2 className="section-title">
              Danışanlarım Ne <strong>Diyor</strong>?
            </h2>
            <p className="section-description">
              Birlikte hazırladığımız en özel anların ardından gelen samimi geri bildirimler.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card"
                id={`testimonial-${index}`}
              >
                <div className="testimonial-stars">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <StarIcon key={i} size={15} filled={true} />
                  ))}
                </div>
                <p className="testimonial-text">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BLOG PREVIEW ==================== */}
      <section className="section" id="blog-preview">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Güzellik Blogu</span>
            <div className="divider" />
            <h2 className="section-title">
              İpuçları & <strong>Rehberler</strong>
            </h2>
            <p className="section-description">
              Makyaj sanatçısından püf noktaları, doğru ürün uygulama teknikleri ve sezon trendleri.
            </p>
          </div>

          <div className="blog-grid">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="blog-card"
                id={`blog-preview-${post.id}`}
                scroll={true}
              >
                <div className="blog-card-image">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={600}
                    height={375}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="blog-card-tag">{post.tag}</span>
                    <span className="blog-card-author">
                      <UserIcon size={13} className="meta-icon" />
                      {post.author}
                    </span>
                    <span className="meta-dot">•</span>
                    <span className="blog-card-read">{post.readTime}</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-link">
                    Yazıyı Oku <ArrowRightIcon size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "44px" }}>
            <Link href="/blog" className="btn btn-outline" id="view-all-blog">
              Tüm Yazıları Gör <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== CTA / CONTACT ==================== */}
      <section className="section" id="contact">
        <div className="container">
          <div className="cta-section">
            <h2 className="cta-title">
              Özel Gününüzü Birlikte <strong>Planlayalım</strong>
            </h2>
            <p className="cta-text">
              Düğün, nişan veya özel çekim randevunuz için tarih müsaitliğini öğrenmek
              veya detaylı bilgi almak için e-posta yoluyla doğrudan iletişime geçebilirsiniz.
            </p>
            <div
              className="hero-cta-group"
              style={{ position: "relative", zIndex: 1, justifyContent: "center" }}
            >
              <a
                href="mailto:info@ebrumakeup.com?subject=Randevu%20ve%20Bilgi%20Talebi"
                className="btn btn-primary"
                id="cta-email"
              >
                <MailIcon size={18} /> E-Posta ile İletişime Geçin (info@ebrumakeup.com)
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
