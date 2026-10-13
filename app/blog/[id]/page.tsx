import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPosts, getBlogPostById } from "@/lib/db";
import {
  MailIcon,
  InstagramIcon,
  ShareIcon,
  ArrowRightIcon,
  UserIcon,
} from "@/components/Icons";

export const instant = false;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    return {
      title: "Yazı Bulunamadı",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [post.tag, "makyaj blog", "güzellik rehberi", "makyaj ipuçları", "Ebru Atik", "EbruMakeup"],
    authors: [{ name: post.author }],
    openGraph: {
      title: `${post.title} | EbruMakeup Blog`,
      description: post.excerpt,
      type: "article",
      locale: "tr_TR",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: `https://ebrubeauty.com/blog/${id}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.id !== id).slice(0, 2);

  // Extract TOC headings for Left Column Navigation (SEO & Table of Contents)
  interface TocItem {
    id: string;
    text: string;
    level: number;
  }

  const tocItems: TocItem[] = [];
  const contentLines = post.content.trim().split("\n");
  let headingIndex = 0;

  for (const line of contentLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).replace(/\*\*/g, "").replace(/\*/g, "");
      const sectionId = `section-${++headingIndex}`;
      tocItems.push({ id: sectionId, text, level: 2 });
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).replace(/\*\*/g, "").replace(/\*/g, "");
      const sectionId = `section-${++headingIndex}`;
      tocItems.push({ id: sectionId, text, level: 3 });
    }
  }

  // Markdown-to-JSX parser with safe HTML decoding for rich text
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inBlockquote = false;
    let blockquoteContent = "";
    let key = 0;
    let currentHeadingIdx = 0;

    const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key++}`}>
            {currentList.map((item, i) => (
              <li
                key={i}
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushBlockquote = () => {
      if (inBlockquote && blockquoteContent) {
        elements.push(
          <blockquote key={`bq-${key++}`}>
            <p dangerouslySetInnerHTML={{ __html: blockquoteContent.trim() }} />
          </blockquote>
        );
        inBlockquote = false;
        blockquoteContent = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "") {
        flushList();
        flushBlockquote();
        continue;
      }

      if (trimmed.startsWith("> ")) {
        flushList();
        inBlockquote = true;
        const bqText = formatInline(trimmed.slice(2));
        blockquoteContent += (blockquoteContent ? " " : "") + bqText;
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = formatInline(trimmed.slice(2));
        currentList.push(itemText);
        continue;
      } else {
        flushList();
      }

      if (trimmed.startsWith("## ")) {
        const headingId = `section-${++currentHeadingIdx}`;
        const headingText = trimmed.slice(3).replace(/\*\*/g, "").replace(/\*/g, "");
        elements.push(
          <h2 id={headingId} key={`h2-${key++}`}>
            {headingText}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith("### ")) {
        const headingId = `section-${++currentHeadingIdx}`;
        const headingText = trimmed.slice(4).replace(/\*\*/g, "").replace(/\*/g, "");
        elements.push(
          <h3 id={headingId} key={`h3-${key++}`}>
            {headingText}
          </h3>
        );
        continue;
      }

      const processedText = formatInline(trimmed);

      elements.push(
        <p
          key={`p-${key++}`}
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    }

    flushList();
    flushBlockquote();

    return elements;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "EbruMakeup",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="blog-detail-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Ana Sayfa</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/blog">Blog</Link>
            <span className="breadcrumb-separator">/</span>
            <span>{post.title}</span>
          </nav>

          <div className="blog-detail-meta">
            <span className="blog-card-tag">{post.tag}</span>
            <span className="blog-card-author">
              <UserIcon size={14} className="meta-icon" />
              {post.author}
            </span>
            <span className="meta-dot">•</span>
            <span className="blog-card-date">{post.date}</span>
            <span className="meta-dot">•</span>
            <span className="blog-card-read">{post.readTime} okuma</span>
          </div>

          <h1 className="blog-detail-title">{post.title}</h1>
          <p className="section-description">{post.excerpt}</p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="container">
        <div className="blog-detail-hero">
          <Image
            src={post.image}
            alt={post.title}
            width={900}
            height={506}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            priority
            sizes="(max-width: 900px) 100vw, 900px"
          />
        </div>
      </div>

      {/* Content */}
      <article className="container">
        <div className="blog-article-layout">
          {/* Left Column: Sticky Table of Contents (TOC) for SEO & Fast Navigation */}
          {tocItems.length > 0 && (
            <aside className="blog-toc-sidebar" aria-label="İçindekiler Rehberi">
              <div className="blog-toc-sticky">
                <span className="blog-toc-badge">SEO REHBERİ</span>
                <h3 className="blog-toc-title">İçindekiler</h3>
                <nav className="blog-toc-nav" aria-label="İçindekiler">
                  <ol className="blog-toc-list">
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        className={`blog-toc-item toc-level-${item.level}`}
                      >
                        <a href={`#${item.id}`} className="blog-toc-link">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>
          )}

          {/* Right Column: Article Body */}
          <div className="blog-detail-content">
            {renderContent(post.content)}

            {/* Author Box */}
            <div className="author-box">
              <div className="author-avatar-wrap">
                <Image
                  src="/ebru.png"
                  alt={post.author}
                  width={72}
                  height={72}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              <div className="author-info">
                <h4 className="author-name">{post.author}</h4>
                <span className="author-badge">{post.authorTitle}</span>
                <p className="author-bio">
                  10 yılı aşkın süredir İstanbul&apos;da freelance makyaj sanatçısı olarak
                  özel günler, gelin hazırlıkları ve editoryal moda çekimlerinde hizmet veriyor.
                </p>
              </div>
            </div>

            {/* Share Section */}
            <div className="share-section">
              <span className="share-label">Paylaş:</span>
              <a
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Bu makaleyi incelemenizi öneririm: ${post.title}`)}`}
                className="share-btn"
                aria-label="E-Posta ile Paylaş"
                id="share-email"
                title="E-Posta ile Paylaş"
              >
                <MailIcon size={16} />
              </a>
              <a
                href="https://instagram.com/ebruatikmakeup"
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn"
                aria-label="Instagram"
                id="share-instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <button
                type="button"
                className="share-btn"
                aria-label="Bağlantıyı Kopyala"
                id="share-copy"
                title="Bağlantı"
              >
                <ShareIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Önerilen Yazılar</span>
              <div className="divider" />
              <h2 className="section-title">
                İlginizi Çekebilecek <strong>Diğer Rehberler</strong>
              </h2>
            </div>

            <div className="blog-page-grid">
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.id}
                  href={`/blog/${relPost.id}`}
                  className="blog-card"
                  id={`related-${relPost.id}`}
                  scroll={true}
                >
                  <div className="blog-card-image">
                    <Image
                      src={relPost.image}
                      alt={relPost.title}
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
                      <span className="blog-card-tag">{relPost.tag}</span>
                      <span className="blog-card-author">
                        <UserIcon size={12} className="meta-icon" />
                        {relPost.author}
                      </span>
                      <span className="meta-dot">•</span>
                      <span className="blog-card-date">{relPost.date}</span>
                    </div>
                    <h3 className="blog-card-title">{relPost.title}</h3>
                    <p className="blog-card-excerpt">{relPost.excerpt}</p>
                    <span className="blog-card-link">
                      Yazıyı Oku <ArrowRightIcon size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
