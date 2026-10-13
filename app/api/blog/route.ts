import { NextResponse } from "next/server";
import { getBlogPosts, createBlogPost } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await getBlogPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Blog yazıları alınamadı." },
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
    const { title, excerpt, content, image, tag, readTime } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Başlık ve içerik alanları zorunludur." },
        { status: 400 }
      );
    }

    const createdPost = await createBlogPost({
      title,
      excerpt: excerpt || content.slice(0, 150) + "...",
      content,
      image: image || "/images/blog/bridal-tips.jpg",
      tag: tag || "Güzellik & Makyaj",
      readTime: readTime || "4 dk okuma",
      date: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      author: "Ebru Atik",
      authorTitle: "Profesyonel Makyaj Sanatçısı",
      authorAvatar: "/logo.png",
    });

    return NextResponse.json({ success: true, post: createdPost });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { success: false, message: "Blog kaydedilirken hata oluştu." },
      { status: 500 }
    );
  }
}
