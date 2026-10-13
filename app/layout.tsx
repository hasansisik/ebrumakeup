import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReset from "@/components/ScrollReset";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://ebrumakeup.com"),
  title: {
    default: "EbruMakeup | Ebru Atik - Profesyonel Makyaj Sanatçısı",
    template: "%s | EbruMakeup",
  },
  description:
    "İstanbul'da profesyonel freelance makyaj sanatçısı Ebru Atik. Gelin makyajı, özel gün, editoryal ve çekim makyajı hizmetleri. Randevu için iletişime geçin.",
  keywords: [
    "EbruMakeup",
    "Ebru Atik",
    "makyaj sanatçısı",
    "gelin makyajı",
    "İstanbul makyöz",
    "profesyonel makyaj",
    "düğün makyajı",
    "özel gün makyajı",
    "freelance makyöz",
    "editoryal makyaj",
    "makyaj blog",
  ],
  authors: [{ name: "Ebru Atik" }],
  creator: "Ebru Atik",
  publisher: "EbruMakeup",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "EbruMakeup",
    title: "EbruMakeup | Ebru Atik - Profesyonel Makyaj Sanatçısı",
    description:
      "Profesyonel freelance makyaj sanatçısı Ebru Atik. Gelin, özel gün ve editoryal makyaj hizmetleri.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "EbruMakeup - Profesyonel Makyaj",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EbruMakeup | Ebru Atik - Profesyonel Makyaj Sanatçısı",
    description:
      "İstanbul'da profesyonel freelance makyaj sanatçısı Ebru Atik. Gelin, özel gün ve editoryal makyaj.",
    images: ["/images/hero.jpg"],
  },
  alternates: {
    canonical: "https://ebrubeauty.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#fefcfa" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Outfit:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ScrollReset />
        <AnalyticsTracker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
