import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkCredentials, AUTH_COOKIE_NAME, generateSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!checkCredentials(email, password)) {
      return NextResponse.json(
        { success: false, message: "E-posta veya şifre hatalı!" },
        { status: 401 }
      );
    }

    const token = generateSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
