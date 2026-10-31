import { NextResponse } from "next/server";
import { updatePortfolioItem, deletePortfolioItem } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updatePortfolioItem(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Portfolyo çalışması bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "Güncelleme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deletePortfolioItem(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Silinecek portfolyo bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolyo çalışması başarıyla silindi.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "Silme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
