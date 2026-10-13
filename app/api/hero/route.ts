import { NextResponse } from "next/server";
import { getHeroColumns, updateHeroColumns } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const instant = false;

export async function GET() {
  try {
    const columns = await getHeroColumns();
    return NextResponse.json({ success: true, columns });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Hero sütunları alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { columns } = body;

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { success: false, message: "Geçersiz sütun verisi." },
        { status: 400 }
      );
    }

    const updated = await updateHeroColumns(columns);
    return NextResponse.json({ success: true, columns: updated });
  } catch (error) {
    console.error("Hero update error:", error);
    return NextResponse.json(
      { success: false, message: "Hero güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
