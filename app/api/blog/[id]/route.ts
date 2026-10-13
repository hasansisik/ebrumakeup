import { NextResponse } from "next/server";
import { updateBlogPost, deleteBlogPost } from "@/lib/db";
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

    const updated = await updateBlogPost(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Blog yazısı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
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
    const deleted = await deleteBlogPost(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Silinecek blog bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog yazısı başarıyla silindi.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Silme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
