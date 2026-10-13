import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/db";
import {
  MailIcon,
  ArrowRightIcon,
  UserIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Blog - Makyaj İpuçları ve Güzellik Trendleri",
  description:
    "Profesyonel makyaj sanatçısı Ebru Atik'in makyaj ipuçları, cilt bakımı rehberleri, gelin makyajı önerileri ve en son güzellik trendleri hakkındaki profesyonel yazıları.",
  keywords: [
    "makyaj blog",
    "güzellik ipuçları",
    "cilt bakımı rehberi",
    "makyaj trendleri 2026",
    "gelin makyajı ipuçları",
    "Ebru Atik",
    "EbruMakeUp",
  ],
  openGraph: {
    title: "Blog | EbruMakeUp - Makyaj İpuçları ve Güzellik Trendleri",
    description:
      "Makyaj ipuçları, cilt bakımı rehberleri ve güzellik trendleri hakkında profesyonel yazılar.",
    type: "website",
    locale: "tr_TR",
  },
  alternates: {
    canonical: "https://ebrumakeup.com/blog",
  },
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  return (
    <>
      {/* Blog Header */}
      <div className="blog-page-header">
        <div className="container">
          <span className="section-label">Güzellik Blogu</span>
          <div className="divider" />
          <h1 className="section-title" style={{ marginBottom: "16px" }}>
            Makyaj & Bakım <strong>Notları</strong>
          </h1>
          <p className="section-description">
            Doğru ürün seçimleri, backstage sırları, cilt bakım protokolleri ve
            sezonun öne çıkan güzellik trendleri hakkında kaleme aldığım kapsamlı rehberler.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <section className="section" style={{ paddingTop: "32px" }}>
        <div className="container">
          <div className="blog-page-grid">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="blog-card"
                id={`blog-card-${post.id}`}
                scroll={true}
              >
                <div className="blog-card-image">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={700}
                    height={437}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    sizes="(max-width: 768px) 100vw, 50vw"
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
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-link">
                    Yazıyı Oku <ArrowRightIcon size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-section">
            <h2 className="cta-title">
              Kişisel <strong>Danışmanlık</strong> ve Randevu
            </h2>
            <p className="cta-text">
              Kişisel makyaj stilinizi belirlemek, gelin provası oluşturmak veya
              özel gününüz için profesyonel hizmet almak üzere iletişime geçebilirsiniz.
            </p>
            <div
              className="hero-cta-group"
              style={{ position: "relative", zIndex: 1, justifyContent: "center" }}
            >
              <a
                href="mailto:info@ebrumakeup.com?subject=Makyaj%20ve%20G%C3%BCzellik%20Dan%C4%B1%C5%9Fmanl%C4%B1%C4%9F%C4%B1"
                className="btn btn-primary"
                id="blog-cta-email"
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
