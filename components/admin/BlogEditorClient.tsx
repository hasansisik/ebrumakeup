"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/data";

interface BlogEditorClientProps {
  initialPost: BlogPost | null;
  isNew: boolean;
  slugId: string;
}

export default function BlogEditorClient({
  initialPost,
  isNew,
  slugId,
}: BlogEditorClientProps) {
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(
    isNew
      ? ""
      : initialPost?.id || slugId
  );
  const [tag, setTag] = useState(initialPost?.tag || "Güzellik & Makyaj");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [image, setImage] = useState(
    initialPost?.image || "/images/blog/bridal-tips.jpg"
  );
  const [readTime, setReadTime] = useState(initialPost?.readTime || "5 dk okuma");

  // UI States
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-generate slug from title if creating new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setImageError(false);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImage(data.url);
        showToast("Görsel başarıyla yüklendi ve güncellendi!");
      } else {
        showToast(data.message || "Görsel yüklenemedi", "error");
      }
    } catch {
      showToast("Görsel yükleme sırasında bağlantı hatası.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate word count & auto read time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  useEffect(() => {
    if (wordCount > 0) {
      const minutes = Math.max(1, Math.ceil(wordCount / 180));
      setReadTime(`${minutes} dk okuma`);
    }
  }, [wordCount]);

  // Editor Toolbar Insertion Helper
  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + (selectedText || "") + suffix;

    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setContent(newContent);

    // Save current scroll position
    const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    // Restore focus and cursor without triggering browser scroll jumps
    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
      if (typeof window !== "undefined" && window.scrollY !== currentScrollY) {
        window.scrollTo({ top: currentScrollY, behavior: "instant" });
      }
    }, 10);
  };

  // Save / Update Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Lütfen başlık ve içerik alanlarını doldurun.", "error");
      return;
    }

    setIsSaving(true);

    const payload = {
      title,
      id: slug.trim() || undefined,
      tag,
      excerpt: excerpt.trim() || content.slice(0, 150) + "...",
      content,
      image,
      readTime,
    };

    try {
      if (isNew) {
        // Create new
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast("Blog yazısı başarıyla oluşturuldu ve yayınlandı!");
          setTimeout(() => {
            router.push(`/ebru-admin/blog/${data.post.id}`);
            router.refresh();
          }, 800);
        } else {
          showToast(data.message || "Blog kaydedilemedi", "error");
        }
      } else {
        // Update existing
        const targetId = initialPost?.id || slugId;
        const res = await fetch(`/api/blog/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast("Blog yazısı başarıyla güncellendi!");
          router.refresh();
        } else {
          showToast(data.message || "Güncelleme başarısız", "error");
        }
      }
    } catch {
      showToast("Sunucu ile iletişim kurulurken hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!initialPost) return;
    if (
      !window.confirm(
        `"${initialPost.title}" başlıklı blog yazısını kalıcı olarak silmek istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blog/${initialPost.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Blog yazısı başarıyla silindi.");
        setTimeout(() => {
          router.push("/ebru-admin");
          router.refresh();
        }, 700);
      } else {
        showToast(data.message || "Silme işlemi başarısız.", "error");
        setIsDeleting(false);
      }
    } catch {
      showToast("Silme işlemi sırasında hata oluştu.", "error");
      setIsDeleting(false);
    }
  };

  // Render markdown for live preview
  const renderPreview = (text: string) => {
    const lines = text.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inBlockquote = false;
    let blockquoteContent = "";
    let key = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key++}`} className="blog-preview-list">
            {currentList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushBlockquote = () => {
      if (inBlockquote) {
        elements.push(
          <blockquote key={`bq-${key++}`} className="blog-preview-quote">
            <p>{blockquoteContent.trim()}</p>
          </blockquote>
        );
        inBlockquote = false;
        blockquoteContent = "";
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith(">")) {
        flushList();
        inBlockquote = true;
        blockquoteContent += (blockquoteContent ? " " : "") + trimmed.replace(/^>\s*/, "");
        continue;
      } else {
        flushBlockquote();
      }

      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={key++} className="blog-preview-h3">
            {trimmed.replace(/^###\s+/, "")}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={key++} className="blog-preview-h2">
            {trimmed.replace(/^##\s+/, "")}
          </h2>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        currentList.push(trimmed.replace(/^[-*]\s+/, ""));
      } else if (trimmed === "---") {
        flushList();
        elements.push(<hr key={key++} className="blog-preview-hr" />);
      } else if (trimmed) {
        flushList();
        elements.push(
          <p key={key++} className="blog-preview-p">
            {trimmed}
          </p>
        );
      }
    }

    flushList();
    flushBlockquote();

    return elements;
  };

  return (
    <div className="editor-page-wrapper">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="editor-header">
        <div className="editor-header-inner">
          <div className="editor-header-left">
            <Link href="/ebru-admin" className="editor-back-btn">
              <span>←</span>
              <span>Yönetim Paneline Dön</span>
            </Link>
            <div className="editor-status-badge">
              <span className="status-dot" />
              <span>{isNew ? "Yeni Taslak" : "Yayında Olan Blog"}</span>
            </div>
          </div>

          <div className="editor-header-actions">
            {!isNew && initialPost && (
              <>
                <Link
                  href={`/blog/${initialPost.id}`}
                  target="_blank"
                  className="admin-btn admin-btn-outline"
                >
                  <span>Sitede Gör</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="admin-btn admin-btn-danger"
                >
                  {isDeleting ? "Siliniyor..." : "Yazıyı Sil"}
                </button>
              </>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving
                ? "Kaydediliyor..."
                : isNew
                ? "Yazıyı Yayınla ✓"
                : "Değişiklikleri Kaydet ✓"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="editor-main-container">
        <form onSubmit={handleSave} className="editor-form-grid">
          {/* LEFT COLUMN: Main Editorial Content & Rich Editor */}
          <div className="editor-content-column">
            {/* Title Input */}
            <div className="editor-title-card">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Yazı Başlığını Buraya Girin..."
                className="editor-title-input"
              />

              {/* Permalink / ID Slug Bar */}
              <div className="editor-slug-bar">
                <span className="slug-label">Kalıcı Bağlantı (URL ID):</span>
                <span className="slug-prefix">ebrumakeup.com/blog/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  placeholder="yazi-url-adresi"
                  className="editor-slug-input"
                  title="Arama motoru ve site bağlantı ID'si"
                />
              </div>
            </div>

            {/* Excerpt Box */}
            <div className="editor-card">
              <label className="editor-section-label">
                Kısa Özet (Meta Description & Kart Açıklaması)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Bu yazının ana sayfada ve arama motorlarında görünecek dikkat çekici kısa özeti..."
                className="editor-excerpt-textarea"
              />
            </div>

            {/* Rich Content Editor */}
            <div className="editor-card editor-card-no-padding">
              {/* Toolbar & Mode Toggle */}
              <div className="editor-toolbar-header">
                {/* Formatting Buttons */}
                <div className="editor-formatting-tools">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n## ")}
                    className="tool-btn"
                    title="Büyük Başlık (H2)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n### ")}
                    className="tool-btn"
                    title="Alt Başlık (H3)"
                  >
                    H3
                  </button>
                  <div className="tool-divider" />
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("**", "**")}
                    className="tool-btn bold"
                    title="Kalın Yazı"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("*", "*")}
                    className="tool-btn italic"
                    title="İtalik Yazı"
                  >
                    I
                  </button>
                  <div className="tool-divider" />
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n> Profesyonel Tavsiye: ")}
                    className="tool-btn quote"
                    title="Alıntı / Uzman Tavsiyesi Kutusu"
                  >
                    “ ”
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n- ")}
                    className="tool-btn"
                    title="Madde İşaretli Liste"
                  >
                    • Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n1. ")}
                    className="tool-btn"
                    title="Numaralı Liste"
                  >
                    1. Liste
                  </button>
                  <div className="tool-divider" />
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("\n---\n")}
                    className="tool-btn"
                    title="Ayırıcı Çizgi"
                  >
                    ―
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertTextAtCursor("[Bağlantı Metni](https://ebrumakeup.com)")
                    }
                    className="tool-btn"
                    title="Bağlantı Ekle"
                  >
                    🔗
                  </button>
                </div>

                {/* Mode Switcher */}
                <div className="editor-mode-switcher">
                  <button
                    type="button"
                    className={`mode-tab-btn ${activeTab === "edit" ? "active" : ""}`}
                    onClick={() => setActiveTab("edit")}
                  >
                    <span>✏️ Yazı Editörü</span>
                  </button>
                  <button
                    type="button"
                    className={`mode-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                    onClick={() => setActiveTab("preview")}
                  >
                    <span>👁 Canlı Önizleme</span>
                  </button>
                </div>
              </div>

              {/* Editor Workspace */}
              {activeTab === "edit" ? (
                <div className="editor-textarea-wrapper">
                  <textarea
                    ref={textareaRef}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Blog yazınızı buraya yazın... Toolbar butonlarını kullanarak başlık, madde işaretleri veya uzman tavsiyesi kutuları ekleyebilirsiniz."
                    className="editor-content-textarea"
                    rows={18}
                  />
                </div>
              ) : (
                <div className="editor-live-preview-box">
                  {content ? (
                    renderPreview(content)
                  ) : (
                    <p className="preview-empty">
                      Önizlenecek bir içerik henüz yazılmadı. Yazı Editörü sekmesine geçerek içerik girebilirsiniz.
                    </p>
                  )}
                </div>
              )}

              {/* Footer Word Count Stats */}
              <div className="editor-footer-stats">
                <div className="stat-pill">
                  <span>{wordCount}</span> kelime
                </div>
                <div className="stat-pill">
                  <span>{content.length}</span> karakter
                </div>
                <div className="stat-pill">
                  <span>{readTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media, Cover Photo & Meta Settings */}
          <aside className="editor-sidebar-column">
            {/* COVER IMAGE CARD WITH IMMEDIATE LIVE PREVIEW */}
            <div className="editor-card">
              <h3 className="editor-section-label">Kapak Görseli</h3>
              <p className="editor-section-desc">
                Blog başlığının üstünde ve kart listelerinde sergilenecek ana fotoğraf.
              </p>

              {/* Large Image Preview with Immediate Update */}
              <div className="editor-cover-preview-wrapper">
                {image && !imageError ? (
                  <div className="editor-cover-preview-box">
                    <Image
                      src={image}
                      alt={title || "Blog Kapak Görseli"}
                      width={500}
                      height={320}
                      className="editor-cover-preview-img"
                      onError={() => setImageError(true)}
                    />
                    <div className="cover-badge">Yayındaki Görsel</div>
                  </div>
                ) : (
                  <div className="editor-cover-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Görsel Yüklenmedi veya Geçersiz URL</span>
                  </div>
                )}
              </div>

              {/* Direct URL Input */}
              <div className="form-group" style={{ marginTop: "14px" }}>
                <label className="form-label">Görsel URL / Dosya Yolu</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="/images/blog/bridal-tips.jpg veya https://..."
                  className="form-input"
                />
              </div>

              {/* File Upload Drop Button */}
              <label className="editor-file-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>
                  {isUploading ? "Görsel Yükleniyor..." : "Bilgisayardan Yeni Görsel Yükle"}
                </span>
              </label>
            </div>

            {/* META SETTINGS CARD */}
            <div className="editor-card">
              <h3 className="editor-section-label">Yayın & Kategori Bilgileri</h3>

              <div className="form-group" style={{ marginTop: "14px" }}>
                <label className="form-label">Kategori / Etiket</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Örn: Cilt Bakımı, Gelin Rehberi"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: "14px" }}>
                <label className="form-label">Okuma Süresi</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="Örn: 5 dk okuma"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: "14px" }}>
                <label className="form-label">Yazar</label>
                <input
                  type="text"
                  disabled
                  value="Ebru Atik"
                  className="form-input"
                  style={{ background: "#f8f5f1", cursor: "not-allowed" }}
                />
              </div>
            </div>

            {/* READERSHIP & VISITOR STATS */}
            {!isNew && initialPost && (
              <div className="editor-card">
                <h3 className="editor-section-label">Okuyucu İstatistikleri</h3>
                <p className="editor-section-desc">
                  Bu yazının bağımsız gerçek kişilerce okunma verileri.
                </p>

                <div className="editor-stats-mini-grid">
                  <div className="editor-mini-stat">
                    <span className="mini-stat-label">👥 Tekil Okuyucu</span>
                    <span className="mini-stat-value">
                      {(initialPost.uniqueViews ?? 0).toLocaleString("tr-TR")}
                    </span>
                    <span className="mini-stat-sub">farklı gerçek kişi</span>
                  </div>

                  <div className="editor-mini-stat">
                    <span className="mini-stat-label">👁️ Toplam Görüntülenme</span>
                    <span className="mini-stat-value">
                      {(initialPost.views ?? 0).toLocaleString("tr-TR")}
                    </span>
                    <span className="mini-stat-sub">sayfa açılışı</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </form>
      </main>
    </div>
  );
}
