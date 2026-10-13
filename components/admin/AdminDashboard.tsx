"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogPost, PortfolioItem, HeroColumn, initialHeroColumns } from "@/lib/data";
import { AnalyticsSummary } from "@/lib/db";

interface AdminDashboardProps {
  initialPosts: BlogPost[];
  initialPortfolio: PortfolioItem[];
  initialAnalytics?: AnalyticsSummary;
  initialHeroColumns?: HeroColumn[];
}

export default function AdminDashboard({
  initialPosts,
  initialPortfolio,
  initialAnalytics,
  initialHeroColumns: serverHeroColumns,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"blog" | "portfolio" | "hero" | "analytics">("blog");
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(initialAnalytics || null);
  const [heroColumns, setHeroColumns] = useState<HeroColumn[]>(
    serverHeroColumns && serverHeroColumns.length > 0
      ? serverHeroColumns
      : initialHeroColumns
  );
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const refreshAnalytics = async () => {
    setIsRefreshingStats(true);
    try {
      const res = await fetch("/api/analytics/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalytics(data.stats);
        showToast("Ziyaretçi verileri güncellendi!");
      }
    } catch {
      showToast("İstatistikler yenilenirken hata oluştu", "error");
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const updateHeroColumn = (index: number, field: keyof HeroColumn, value: string) => {
    const updated = [...heroColumns];
    updated[index] = { ...updated[index], [field]: value };
    setHeroColumns(updated);
  };

  const handleSaveHero = async () => {
    setIsSavingHero(true);
    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns: heroColumns }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Header (Hero) kapak görselleri başarıyla kaydedildi!");
      } else {
        showToast(data.message || "Kaydetme başarısız", "error");
      }
    } catch {
      showToast("Görseller kaydedilirken sunucu hatası oluştu", "error");
    } finally {
      setIsSavingHero(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const router = useRouter();

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    tag: "Güzellik & Makyaj",
    excerpt: "",
    content: "",
    image: "/images/blog/bridal-tips.jpg",
    readTime: "4 dk okuma",
  });
  const [blogSubmitting, setBlogSubmitting] = useState(false);

  // Portfolio Modal State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioFormData, setPortfolioFormData] = useState({
    title: "",
    category: "Gelin",
    subtitle: "",
    description: "",
    longDescription: "",
    image: "/images/portfolio/bridal.jpg",
    gallery: [] as string[],
    duration: "90 - 120 dk",
    products: "Dior, Charlotte Tilbury, Tom Ford",
    finish: "Lüks Işıltılı Glow",
    photography: "Stüdyo & Gün Işığı Uyumlu",
  });
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);
  const [galleryInputUrl, setGalleryInputUrl] = useState("");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/ebru-giris");
      router.refresh();
    } catch {
      router.push("/ebru-giris");
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.url);
        showToast("Görsel başarıyla yüklendi!");
      } else {
        showToast(data.message || "Görsel yüklenemedi", "error");
      }
    } catch {
      showToast("Görsel yüklenirken bağlantı hatası oluştu.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  /* ============================================================
     BLOG OPERATIONS
     ============================================================ */
  const openNewBlogModal = () => {
    setEditingPost(null);
    setBlogFormData({
      title: "",
      tag: "Güzellik & Makyaj",
      excerpt: "",
      content: "",
      image: "/images/blog/bridal-tips.jpg",
      readTime: "4 dk okuma",
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingPost(post);
    setBlogFormData({
      title: post.title,
      tag: post.tag,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      readTime: post.readTime,
    });
    setIsBlogModalOpen(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogSubmitting(true);

    try {
      if (editingPost) {
        // Update
        const res = await fetch(`/api/blog/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogFormData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPosts(posts.map((p) => (p.id === editingPost.id ? data.post : p)));
          showToast("Blog yazısı başarıyla güncellendi!");
          setIsBlogModalOpen(false);
        } else {
          showToast(data.message || "Güncelleme başarısız", "error");
        }
      } else {
        // Create
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogFormData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPosts([data.post, ...posts]);
          showToast("Yeni blog yazısı başarıyla yayınlandı!");
          setIsBlogModalOpen(false);
        } else {
          showToast(data.message || "Blog kaydedilemedi", "error");
        }
      }
    } catch {
      showToast("Sunucu ile iletişim kurulurken hata oluştu.", "error");
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" başlıklı blog yazısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(posts.filter((p) => p.id !== id));
        showToast("Blog yazısı silindi.");
      } else {
        showToast(data.message || "Silme işlemi başarısız", "error");
      }
    } catch {
      showToast("Silme işlemi sırasında hata oluştu.", "error");
    }
  };

  /* ============================================================
     PORTFOLIO OPERATIONS
     ============================================================ */
  const openNewPortfolioModal = () => {
    setEditingPortfolio(null);
    setPortfolioFormData({
      title: "",
      category: "Gelin",
      subtitle: "",
      description: "",
      longDescription: "",
      image: "/images/portfolio/bridal.jpg",
      gallery: ["/images/portfolio/bridal.jpg"],
      duration: "90 - 120 dk",
      products: "Dior, Charlotte Tilbury, Tom Ford",
      finish: "Lüks Işıltılı Glow",
      photography: "Stüdyo & Gün Işığı Uyumlu",
    });
    setIsPortfolioModalOpen(true);
  };

  const openEditPortfolioModal = (item: PortfolioItem) => {
    setEditingPortfolio(item);
    setPortfolioFormData({
      title: item.title,
      category: item.category,
      subtitle: item.subtitle || "",
      description: item.description,
      longDescription: item.longDescription || item.description,
      image: item.image,
      gallery: item.gallery || [item.image],
      duration: item.details?.duration || "90 dk",
      products: item.details?.products || "Dior, Charlotte Tilbury",
      finish: item.details?.finish || "Radiant Glow",
      photography: item.details?.photography || "Stüdyo & Gün Işığı",
    });
    setIsPortfolioModalOpen(true);
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortfolioSubmitting(true);

    const payload = {
      title: portfolioFormData.title,
      category: portfolioFormData.category,
      subtitle: portfolioFormData.subtitle || `${portfolioFormData.category} Koleksiyonu`,
      description: portfolioFormData.description,
      longDescription: portfolioFormData.longDescription || portfolioFormData.description,
      image: portfolioFormData.image,
      gallery:
        portfolioFormData.gallery.length > 0
          ? portfolioFormData.gallery
          : [portfolioFormData.image],
      details: {
        duration: portfolioFormData.duration,
        products: portfolioFormData.products,
        finish: portfolioFormData.finish,
        photography: portfolioFormData.photography,
      },
    };

    try {
      if (editingPortfolio) {
        // Update
        const res = await fetch(`/api/portfolio/${editingPortfolio.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPortfolio(
            portfolio.map((p) => (p.id === editingPortfolio.id ? data.item : p))
          );
          showToast("Portfolyo çalışması başarıyla güncellendi!");
          setIsPortfolioModalOpen(false);
        } else {
          showToast(data.message || "Güncelleme başarısız", "error");
        }
      } else {
        // Create
        const res = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPortfolio([data.item, ...portfolio]);
          showToast("Yeni portfolyo çalışması başarıyla eklendi!");
          setIsPortfolioModalOpen(false);
        } else {
          showToast(data.message || "Portfolyo kaydedilemedi", "error");
        }
      }
    } catch {
      showToast("Sunucu hatası oluştu.", "error");
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" portfolyo çalışmasını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPortfolio(portfolio.filter((p) => p.id !== id));
        showToast("Portfolyo çalışması silindi.");
      } else {
        showToast(data.message || "Silme işlemi başarısız", "error");
      }
    } catch {
      showToast("Silme sırasında hata oluştu.", "error");
    }
  };

  const addGalleryImage = (url: string) => {
    if (!url.trim()) return;
    if (!portfolioFormData.gallery.includes(url.trim())) {
      setPortfolioFormData({
        ...portfolioFormData,
        gallery: [...portfolioFormData.gallery, url.trim()],
      });
    }
    setGalleryInputUrl("");
  };

  const removeGalleryImage = (index: number) => {
    const updated = portfolioFormData.gallery.filter((_, i) => i !== index);
    setPortfolioFormData({ ...portfolioFormData, gallery: updated });
  };

  const handleQuickUpdatePortfolioCover = async (id: string, newImage: string) => {
    if (!newImage.trim()) return;
    try {
      const item = portfolio.find((p) => p.id === id);
      if (!item) return;
      const updated = { ...item, image: newImage.trim() };
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPortfolio(portfolio.map((p) => (p.id === id ? data.item : p)));
        showToast(`"${item.title}" kapak görseli başarıyla güncellendi!`);
      } else {
        showToast(data.message || "Kapak görseli güncellenemedi", "error");
      }
    } catch {
      showToast("Kapak görseli güncellenirken sunucu hatası oluştu", "error");
    }
  };

  return (
    <div className="admin-page-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <div className="admin-avatar">
              <Image
                src="/logo.png"
                alt="Ebru Atik"
                width={40}
                height={40}
                className="admin-avatar-img"
              />
            </div>
            <div>
              <h1 className="admin-title">EbruMakeUp Yönetim Paneli</h1>
              <p className="admin-subtitle">Hoş geldiniz, Ebru Atik</p>
            </div>
          </div>

          <div className="admin-header-actions">
            <Link
              href="/"
              target="_blank"
              className="admin-btn admin-btn-outline"
            >
              <span>Siteyi Canlı Gör</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>

            <button
              onClick={handleLogout}
              className="admin-btn admin-btn-danger"
              id="admin-logout-btn"
            >
              <span>Çıkış Yap</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-main">
        {/* KPI Summary Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon-wrap stat-icon-visitors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <span className="stat-label">Gerçek Tekil Ziyaretçi</span>
              <div className="stat-value">
                {(analytics?.totalUniqueVisitors ?? 0).toLocaleString("tr-TR")}
              </div>
              <span className="stat-subtext">Farklı tekil kişi</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-wrap stat-icon-today">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <span className="stat-label">Bugünkü Tekil Ziyaretçi</span>
              <div className="stat-value stat-value-highlight">
                +{(analytics?.todayUniqueVisitors ?? 0).toLocaleString("tr-TR")}
              </div>
              <span className="stat-subtext">Bugün siteyi gezen kişi</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-wrap stat-icon-blog">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <span className="stat-label">Blog Tekil Okunma</span>
              <div className="stat-value">
                {(analytics?.totalBlogReads ?? 0).toLocaleString("tr-TR")}
              </div>
              <span className="stat-subtext">Farklı tekil okuyucu</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-wrap stat-icon-status">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <span className="stat-label">Toplam Sayfa Görüntüleme</span>
              <div className="stat-value">
                {(analytics?.totalPageViews ?? 0).toLocaleString("tr-TR")}
              </div>
              <span className="stat-subtext">Tüm sayfalar canlı trafik</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-bar">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === "blog" ? "active" : ""}`}
              onClick={() => setActiveTab("blog")}
            >
              <span>📝 Blog Yönetimi ({posts.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
              onClick={() => setActiveTab("portfolio")}
            >
              <span>🎨 Portfolyo ({portfolio.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "hero" ? "active" : ""}`}
              onClick={() => setActiveTab("hero")}
            >
              <span>🖼️ Header (Hero) Görselleri</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <span>📊 Ziyaretçi & Okuyucu Analitiği</span>
            </button>
          </div>

          {activeTab === "blog" && (
            <Link
              href="/ebru-admin/blog/yeni"
              className="admin-btn admin-btn-primary"
              id="add-blog-btn"
            >
              <span>+ Yeni Blog Yazısı Ekle</span>
            </Link>
          )}

          {activeTab === "portfolio" && (
            <button
              onClick={openNewPortfolioModal}
              className="admin-btn admin-btn-primary"
              id="add-portfolio-btn"
            >
              <span>+ Yeni Portfolyo Çalışması Ekle</span>
            </button>
          )}

          {activeTab === "hero" && (
            <button
              onClick={handleSaveHero}
              disabled={isSavingHero}
              className="admin-btn admin-btn-primary"
              id="save-hero-top-btn"
            >
              <span>{isSavingHero ? "Kaydediliyor..." : "Header Değişikliklerini Kaydet ✓"}</span>
            </button>
          )}

          {activeTab === "analytics" && (
            <button
              onClick={refreshAnalytics}
              disabled={isRefreshingStats}
              className="admin-btn admin-btn-outline"
            >
              <span>{isRefreshingStats ? "Yenileniyor..." : "Verileri Yenile ⟳"}</span>
            </button>
          )}
        </div>

        {/* ============================================================
            TAB 1: BLOG MANAGEMENT
            ============================================================ */}
        {activeTab === "blog" && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Görsel</th>
                  <th>Başlık & Özet</th>
                  <th>Kategori</th>
                  <th>Tekil Okuyucu</th>
                  <th>Tarih</th>
                  <th>Okuma</th>
                  <th style={{ width: "160px", textAlign: "right" }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="table-thumb-wrap">
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={70}
                          height={50}
                          className="table-thumb-img"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="table-title">{post.title}</div>
                      <div className="table-excerpt">{post.excerpt}</div>
                    </td>
                    <td>
                      <span className="badge-tag">{post.tag}</span>
                    </td>
                    <td>
                      <div className="admin-readers-badge">
                        <span className="readers-count">
                          👥 {(post.uniqueViews ?? 0).toLocaleString("tr-TR")}
                        </span>
                        <span className="readers-sub">tekil kişi</span>
                      </div>
                    </td>
                    <td className="table-muted">{post.date}</td>
                    <td className="table-muted">{post.readTime}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <Link
                          href={`/blog/${post.id}`}
                          target="_blank"
                          className="table-btn table-btn-view"
                          title="Sitede Görüntüle"
                        >
                          👁
                        </Link>
                        <Link
                          href={`/ebru-admin/blog/${post.id}`}
                          className="table-btn table-btn-edit"
                          title="Düzenle (Özel Editör Sayfası)"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(post.id, post.title)}
                          className="table-btn table-btn-delete"
                          title="Sil"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================
            TAB 2: PORTFOLIO MANAGEMENT
            ============================================================ */}
        {activeTab === "portfolio" && (
          <div className="portfolio-admin-wrapper">
            {/* Dedicated Cover Images Quick Manager */}
            <div className="admin-covers-card">
              <div className="covers-header">
                <div>
                  <span className="section-label">Dinamik Kapak Yönetimi</span>
                  <h3 className="covers-title">Portfolyo Koleksiyonu Kapak Fotoğrafları</h3>
                  <p className="covers-desc">
                    Ana sayfadaki 6&apos;lı Portfolyo vitrininde yer alan kapak fotoğraflarını buradan tek tıkla doğrudan bilgisayarınızdan yükleyebilir veya anında değiştirebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="portfolio-covers-grid">
                {portfolio.map((item) => (
                  <div key={item.id} className="portfolio-cover-item-card">
                    <div className="cover-img-preview-box">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={280}
                        height={190}
                        className="cover-img-preview"
                      />
                      <span className="cover-cat-pill">{item.category}</span>
                      <label className="cover-quick-upload-label" title="Bilgisayardan Yeni Kapak Yükle">
                        <span>📷 Kapak Değiştir</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                handleQuickUpdatePortfolioCover(item.id, url);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="cover-card-details">
                      <div className="cover-card-title">{item.title}</div>
                      <div className="cover-card-subtitle">{item.subtitle || item.description}</div>
                      
                      <div className="cover-card-actions">
                        <label className="admin-btn admin-btn-outline admin-btn-sm" style={{ cursor: "pointer" }}>
                          <span>📁 Dosya Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  handleQuickUpdatePortfolioCover(item.id, url);
                                });
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => openEditPortfolioModal(item)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                        >
                          ✏️ Tüm Detaylar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Table */}
            <div className="admin-table-container" style={{ marginTop: "24px" }}>
              <div className="analytics-table-header">
                <div>
                  <h4 className="analytics-table-title">Tüm Portfolyo Çalışmaları Listesi</h4>
                  <p className="analytics-table-subtitle">Koleksiyon detayları, galeri fotoğrafları ve içerik yönetimi</p>
                </div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Kapak</th>
                    <th>Çalışma Başlığı</th>
                    <th>Kategori</th>
                    <th>Alt Başlık</th>
                    <th>Galeri Sayısı</th>
                    <th style={{ width: "160px", textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-thumb-wrap">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={70}
                            height={50}
                            className="table-thumb-img"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="table-title">{item.title}</div>
                        <div className="table-excerpt">{item.description}</div>
                      </td>
                      <td>
                        <span className="badge-tag">{item.category}</span>
                      </td>
                      <td className="table-muted">{item.subtitle || "-"}</td>
                      <td>
                        <span className="badge-count">
                          {item.gallery?.length || 1} Fotoğraf
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="table-actions">
                          <Link
                            href={`/portfolio/${item.id}`}
                            target="_blank"
                            className="table-btn table-btn-view"
                            title="Sitede Görüntüle"
                          >
                            👁
                          </Link>
                          <button
                            onClick={() => openEditPortfolioModal(item)}
                            className="table-btn table-btn-edit"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(item.id, item.title)}
                            className="table-btn table-btn-delete"
                            title="Sil"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: HEADER (HERO) GÖRSELLERİ DİNAMİK YÖNETİMİ
            ============================================================ */}
        {activeTab === "hero" && (
          <div className="admin-hero-view">
            <div className="analytics-overview-card">
              <div className="analytics-overview-text">
                <span className="section-label">Ana Sayfa Header Vitrini</span>
                <h3 className="analytics-overview-title">
                  Kaydırmalı 3 Kolonlu Header Kapak Görselleri ve Başlıkları
                </h3>
                <p className="analytics-overview-desc">
                  Ziyaretçiler web sitenizi açtıklarında karşılaştıkları 3 vitrin kolonunun (Gelin Makyajı, Editoryal & Moda, Davet & Gece)
                  büyük kapak fotoğraflarını, başlıklarını ve açıklamalarını buradan canlı olarak özelleştirebilirsiniz.
                </p>
              </div>
              <button
                onClick={handleSaveHero}
                disabled={isSavingHero}
                className="admin-btn admin-btn-primary"
              >
                <span>{isSavingHero ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet ✓"}</span>
              </button>
            </div>

            <div className="hero-columns-editor-grid">
              {heroColumns.map((col, idx) => {
                const columnLabels = [
                  "1. Kolon (Sol Vitrin) • Gelin Makyajı",
                  "2. Kolon (Orta Vitrin) • Editoryal & Moda",
                  "3. Kolon (Sağ Vitrin) • Davet & Gece",
                ];
                return (
                  <div key={col.id || idx} className="hero-column-card">
                    <div className="hero-card-top-bar">
                      <span className="hero-col-badge">{columnLabels[idx] || `${idx + 1}. Kolon`}</span>
                      <span className="hero-step-tag">{col.step || `0${idx + 1}`}</span>
                    </div>

                    {/* Image Preview & Upload */}
                    <div className="hero-card-img-wrap">
                      <Image
                        src={col.image || "/images/catalog/gelin/gelin-1.png"}
                        alt={col.title}
                        width={380}
                        height={460}
                        className="hero-card-preview-img"
                      />
                      <div className="hero-card-img-overlay">
                        <label className="btn-file-upload-hero">
                          <span>📁 Bilgisayardan Yeni Görsel Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  updateHeroColumn(idx, "image", url);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="hero-card-form">
                      <div className="form-group">
                        <label className="form-label">Görsel URL / Dosya Yolu</label>
                        <input
                          type="text"
                          value={col.image}
                          onChange={(e) => updateHeroColumn(idx, "image", e.target.value)}
                          placeholder="/images/catalog/gelin/gelin-1.png veya https://..."
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Üst Etiket (Tag)</label>
                        <input
                          type="text"
                          value={col.tag}
                          onChange={(e) => updateHeroColumn(idx, "tag", e.target.value)}
                          placeholder="Örn: İmza Hizmet"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Ana Başlık</label>
                        <input
                          type="text"
                          value={col.title}
                          onChange={(e) => updateHeroColumn(idx, "title", e.target.value)}
                          placeholder="Örn: Gelin Makyajı"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Vurgulu Alt Başlık (Subtitle)</label>
                        <input
                          type="text"
                          value={col.subtitle}
                          onChange={(e) => updateHeroColumn(idx, "subtitle", e.target.value)}
                          placeholder="Örn: Zamansız Zarafet & 16 Saat Kalıcı Işıltı"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Açıklama Metni</label>
                        <textarea
                          rows={3}
                          value={col.description}
                          onChange={(e) => updateHeroColumn(idx, "description", e.target.value)}
                          placeholder="Kolonda gösterilecek açıklama..."
                          className="form-textarea"
                        />
                      </div>

                      <div className="hero-card-button-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Buton Metni</label>
                          <input
                            type="text"
                            value={col.ctaText}
                            onChange={(e) => updateHeroColumn(idx, "ctaText", e.target.value)}
                            placeholder="Örn: Randevu Al"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Buton Linki</label>
                          <input
                            type="text"
                            value={col.ctaLink}
                            onChange={(e) => updateHeroColumn(idx, "ctaLink", e.target.value)}
                            placeholder="Örn: #contact"
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Bar */}
            <div className="hero-save-bottom-bar">
              <button
                onClick={handleSaveHero}
                disabled={isSavingHero}
                className="admin-btn admin-btn-primary admin-btn-lg"
              >
                <span>{isSavingHero ? "Kaydediliyor..." : "Tüm Header Görsellerini ve Metinlerini Kaydet ✓"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: VISITOR & BLOG READERS ANALYTICS
            ============================================================ */}
        {activeTab === "analytics" && (
          <div className="admin-analytics-view">
            {/* Header info bar */}
            <div className="analytics-overview-card">
              <div className="analytics-overview-text">
                <span className="section-label">Canlı Ziyaretçi & Okuyucu Raporu</span>
                <h3 className="analytics-overview-title">
                  Siteye Giren Gerçek Kişiler ve Blog Tekil Okunma İstatistikleri
                </h3>
                <p className="analytics-overview-desc">
                  Her tekil ziyaretçi tarayıcı bazlı benzersiz kimlikle ayrıştırılır. Aynı kişinin tekrar tıklamaları
                  tekil sayıyı şişirmez; sadece gerçek ve farklı kişiler hesaba katılır.
                </p>
              </div>
              <button
                onClick={refreshAnalytics}
                disabled={isRefreshingStats}
                className="admin-btn admin-btn-outline"
              >
                <span>{isRefreshingStats ? "Yenileniyor..." : "Verileri Şimdi Yenile ⟳"}</span>
              </button>
            </div>

            {/* Top 3 Metric Spotlight Cards */}
            <div className="analytics-spotlight-grid">
              <div className="analytics-spotlight-card">
                <div className="spotlight-header">
                  <span className="spotlight-title">Site Geneli Gerçek Ziyaretçi</span>
                  <span className="spotlight-badge">Tüm Zamanlar</span>
                </div>
                <div className="spotlight-main-number">
                  {(analytics?.totalUniqueVisitors ?? 0).toLocaleString("tr-TR")}
                  <span className="spotlight-unit">tekil kişi</span>
                </div>
                <p className="spotlight-explanation">
                  Web sitenizi ziyaret eden toplam bağımsız gerçek kullanıcı sayısı.
                </p>
              </div>

              <div className="analytics-spotlight-card">
                <div className="spotlight-header">
                  <span className="spotlight-title">Bugünkü Gerçek Ziyaretçiler</span>
                  <span className="spotlight-badge spotlight-badge-green">Bugün Canlı</span>
                </div>
                <div className="spotlight-main-number spotlight-number-green">
                  +{(analytics?.todayUniqueVisitors ?? 0).toLocaleString("tr-TR")}
                  <span className="spotlight-unit">tekil kişi</span>
                </div>
                <p className="spotlight-explanation">
                  Bugün siteye giriş yapmış olan farklı gerçek ziyaretçi sayısı.
                </p>
              </div>

              <div className="analytics-spotlight-card">
                <div className="spotlight-header">
                  <span className="spotlight-title">Toplam Blog Tekil Okuma</span>
                  <span className="spotlight-badge spotlight-badge-gold">Tüm Bloglar</span>
                </div>
                <div className="spotlight-main-number spotlight-number-gold">
                  {(analytics?.totalBlogReads ?? 0).toLocaleString("tr-TR")}
                  <span className="spotlight-unit">tekil okuyucu</span>
                </div>
                <p className="spotlight-explanation">
                  Yazılarınızı en az bir kez okumuş olan gerçek kişi toplamı.
                </p>
              </div>
            </div>

            {/* Blog Post Unique Readers Ranking Table */}
            <div className="admin-table-container" style={{ marginTop: "24px" }}>
              <div className="analytics-table-header">
                <div>
                  <h4 className="analytics-table-title">📖 Blog Yazılarının Tekil Okuyucu Sıralaması</h4>
                  <p className="analytics-table-subtitle">Hangi makaleyi kaç farklı gerçek kişi okudu?</p>
                </div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Sıra</th>
                    <th>Blog Başlığı</th>
                    <th>Tekil Okuyucu</th>
                    <th>Toplam Görüntülenme</th>
                    <th>Okuyucu Oranı</th>
                    <th style={{ textAlign: "right" }}>Görüntüle</th>
                  </tr>
                </thead>
                <tbody>
                  {[...posts]
                    .sort((a, b) => (b.uniqueViews || 0) - (a.uniqueViews || 0))
                    .map((post, idx) => {
                      const unique = post.uniqueViews || 0;
                      const total = post.views || unique;
                      const maxUnique = Math.max(...posts.map((p) => p.uniqueViews || 0), 1);
                      const percent = Math.min(100, Math.round((unique / maxUnique) * 100));

                      return (
                        <tr key={post.id}>
                          <td>
                            <span className={`rank-badge rank-badge-${idx + 1}`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td>
                            <div className="table-title">{post.title}</div>
                            <span className="badge-tag">{post.tag}</span>
                          </td>
                          <td>
                            <div className="readers-highlight">
                              <span className="readers-big">
                                👥 {unique.toLocaleString("tr-TR")}
                              </span>
                              <span className="readers-label">tekil gerçek kişi</span>
                            </div>
                          </td>
                          <td className="table-muted">
                            👁️ {total.toLocaleString("tr-TR")} kez
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            <div className="progress-bar-wrap">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="progress-text">{percent}% popülerlik</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Link
                              href={`/blog/${post.id}`}
                              target="_blank"
                              className="table-btn table-btn-view"
                              title="Sitede Görüntüle"
                            >
                              👁
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Live Visitor Stream */}
            {analytics?.recentLogs && analytics.recentLogs.length > 0 && (
              <div className="admin-table-container" style={{ marginTop: "24px" }}>
                <div className="analytics-table-header">
                  <div>
                    <h4 className="analytics-table-title">⚡ Son Ziyaretçi Sayfa Hareketleri (Canlı Akış)</h4>
                    <p className="analytics-table-subtitle">Ziyaretçilerin gezindiği son sayfalar ve anlık hareketler</p>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ziyaretçi Kimliği</th>
                      <th>Ziyaret Edilen Sayfa</th>
                      <th style={{ textAlign: "right" }}>Saat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentLogs.slice(0, 10).map((log, i) => (
                      <tr key={i}>
                        <td>
                          <span className="visitor-badge">
                            👤 Ziyaretçi #{log.visitorId}
                          </span>
                        </td>
                        <td>
                          <code className="path-code">{log.path}</code>
                        </td>
                        <td className="table-muted" style={{ textAlign: "right" }}>
                          {log.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================
          MODAL: BLOG CREATE / EDIT
          ============================================================ */}
      {isBlogModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingPost ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Oluştur"}
              </h2>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="admin-modal-form">
              <div className="modal-form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Blog Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={blogFormData.title}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, title: e.target.value })
                    }
                    placeholder="Örn: 2026 Gelin Makyajı Trendleri"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori / Etiket</label>
                  <input
                    type="text"
                    value={blogFormData.tag}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, tag: e.target.value })
                    }
                    placeholder="Örn: Gelin Rehberi"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Okuma Süresi</label>
                  <input
                    type="text"
                    value={blogFormData.readTime}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, readTime: e.target.value })
                    }
                    placeholder="Örn: 5 dk okuma"
                    className="form-input"
                  />
                </div>

                {/* Cover Image Upload / URL */}
                <div className="form-group span-2">
                  <label className="form-label">Kapak Görseli</label>
                  <div className="media-input-group">
                    <input
                      type="text"
                      value={blogFormData.image}
                      onChange={(e) =>
                        setBlogFormData({ ...blogFormData, image: e.target.value })
                      }
                      placeholder="/images/blog/bridal-tips.jpg veya URL"
                      className="form-input"
                    />
                    <label className="btn-file-upload">
                      <span>{isUploading ? "Yükleniyor..." : "📁 Dosyadan Yükle"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) =>
                              setBlogFormData({ ...blogFormData, image: url })
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  {blogFormData.image && (
                    <div className="image-preview-strip">
                      <Image
                        src={blogFormData.image}
                        alt="Önizleme"
                        width={90}
                        height={60}
                        className="preview-img"
                      />
                      <span className="preview-label">Kapak Görseli Önizleme</span>
                    </div>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Kısa Özet (Excerpt) *</label>
                  <textarea
                    rows={2}
                    required
                    value={blogFormData.excerpt}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, excerpt: e.target.value })
                    }
                    placeholder="Yazının ana sayfada ve kartlarda görünecek kısa özeti..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Blog İçeriği *</label>
                  <textarea
                    rows={8}
                    required
                    value={blogFormData.content}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, content: e.target.value })
                    }
                    placeholder="Blog yazınızın tam metni..."
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="admin-btn admin-btn-outline"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={blogSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {blogSubmitting
                    ? "Kaydediliyor..."
                    : editingPost
                    ? "Değişiklikleri Kaydet"
                    : "Blogu Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: PORTFOLIO CREATE / EDIT
          ============================================================ */}
      {isPortfolioModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingPortfolio
                  ? "Portfolyo Çalışmasını Düzenle"
                  : "Yeni Portfolyo Çalışması Ekle"}
              </h2>
              <button
                onClick={() => setIsPortfolioModalOpen(false)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePortfolioSubmit} className="admin-modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label">Çalışma Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={portfolioFormData.title}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Örn: Kraliyet Gelin Makyajı"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={portfolioFormData.category}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        category: e.target.value,
                      })
                    }
                    placeholder="Örn: Gelin, Editoryal, Özel Gece"
                    className="form-input"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Alt Başlık (Subtitle)</label>
                  <input
                    type="text"
                    value={portfolioFormData.subtitle}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        subtitle: e.target.value,
                      })
                    }
                    placeholder="Örn: Romantik Zarafet & Gün Boyu Kusursuz Kalıcılık"
                    className="form-input"
                  />
                </div>

                {/* Main Cover Image */}
                <div className="form-group span-2">
                  <label className="form-label">Kapak Görseli *</label>
                  <div className="media-input-group">
                    <input
                      type="text"
                      required
                      value={portfolioFormData.image}
                      onChange={(e) =>
                        setPortfolioFormData({
                          ...portfolioFormData,
                          image: e.target.value,
                        })
                      }
                      placeholder="/images/portfolio/bridal.jpg veya URL"
                      className="form-input"
                    />
                    <label className="btn-file-upload">
                      <span>{isUploading ? "Yükleniyor..." : "📁 Dosyadan Yükle"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setPortfolioFormData({
                                ...portfolioFormData,
                                image: url,
                                gallery: portfolioFormData.gallery.length === 0 ? [url] : portfolioFormData.gallery,
                              });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {portfolioFormData.image && (
                    <div className="image-preview-strip">
                      <Image
                        src={portfolioFormData.image}
                        alt="Kapak Önizleme"
                        width={90}
                        height={60}
                        className="preview-img"
                      />
                      <span className="preview-label">Kapak Görseli Önizleme</span>
                    </div>
                  )}
                </div>

                {/* Multiple Gallery Images */}
                <div className="form-group span-2">
                  <label className="form-label">Galeri Fotoğrafları (Sıfır Boşluklu Koleksiyon)</label>
                  <div className="gallery-uploader-box">
                    <div className="media-input-group">
                      <input
                        type="text"
                        value={galleryInputUrl}
                        onChange={(e) => setGalleryInputUrl(e.target.value)}
                        placeholder="Görsel URL ekleyin veya dosyadan yükleyin..."
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => addGalleryImage(galleryInputUrl)}
                        className="admin-btn admin-btn-outline"
                      >
                        + URL Ekle
                      </button>
                      <label className="btn-file-upload">
                        <span>📁 Yeni Fotoğraf Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => addGalleryImage(url));
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Gallery Thumbnails List */}
                    <div className="gallery-chips-grid">
                      {portfolioFormData.gallery.map((imgUrl, i) => (
                        <div key={i} className="gallery-chip">
                          <Image
                            src={imgUrl}
                            alt={`Galeri ${i + 1}`}
                            width={60}
                            height={60}
                            className="chip-img"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="chip-delete-btn"
                            title="Kaldır"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Kısa Açıklama *</label>
                  <textarea
                    rows={2}
                    required
                    value={portfolioFormData.description}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Ana sayfada görünecek açıklama..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Detaylı Koleksiyon Açıklaması</label>
                  <textarea
                    rows={4}
                    value={portfolioFormData.longDescription}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        longDescription: e.target.value,
                      })
                    }
                    placeholder="Portfolyo detay sayfasında görüntülenecek zengin metin..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Uygulama Süresi</label>
                  <input
                    type="text"
                    value={portfolioFormData.duration}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        duration: e.target.value,
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kullanılan Ürünler</label>
                  <input
                    type="text"
                    value={portfolioFormData.products}
                    onChange={(e) =>
                      setPortfolioFormData({
                        ...portfolioFormData,
                        products: e.target.value,
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="admin-btn admin-btn-outline"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={portfolioSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {portfolioSubmitting
                    ? "Kaydediliyor..."
                    : editingPortfolio
                    ? "Değişiklikleri Kaydet"
                    : "Portfolyoyu Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
