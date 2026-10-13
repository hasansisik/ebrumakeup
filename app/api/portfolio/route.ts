import { NextResponse } from "next/server";
import { getPortfolioItems, createPortfolioItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const items = await getPortfolioItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Portfolyo verileri alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      category,
      subtitle,
      description,
      longDescription,
      image,
      gallery,
      details,
    } = body;

    if (!title || !category || !image) {
      return NextResponse.json(
        { success: false, message: "Başlık, kategori ve kapak görseli zorunludur." },
        { status: 400 }
      );
    }

    const galleryList = Array.isArray(gallery) && gallery.length > 0 ? gallery : [image];

    const created = await createPortfolioItem({
      title,
      category,
      subtitle: subtitle || `${category} Koleksiyonu`,
      description: description || title,
      longDescription: longDescription || description || title,
      image,
      gallery: galleryList,
      details: details || {
        duration: "90 dk",
        products: "Dior, Charlotte Tilbury",
        finish: "Radiant & Dewy",
        photography: "Stüdyo & Gün Işığı",
      },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error("Create portfolio error:", error);
    return NextResponse.json(
      { success: false, message: "Portfolyo kaydedilirken hata oluştu." },
      { status: 500 }
    );
  }
}
