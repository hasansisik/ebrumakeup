import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <span className="section-label" style={{ marginBottom: "20px" }}>
        404
      </span>
      <h1
        className="section-title"
        style={{ marginBottom: "16px", fontSize: "2.5rem" }}
      >
        Sayfa <strong>Bulunamadı</strong>
      </h1>
      <p
        className="section-description"
        style={{ marginBottom: "40px", maxWidth: "400px" }}
      >
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <Link href="/" className="btn btn-primary" id="back-home">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
