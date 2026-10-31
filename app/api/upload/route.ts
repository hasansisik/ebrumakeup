import { NextResponse } from "next/server";
import crypto from "crypto";
import { isAuthenticated } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB (Cloudinary free plan limit)
const UPLOAD_FOLDER = "ebru-makeup";

export async function POST(request: Request) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz işlem. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Upload error: Cloudinary environment variables are missing.");
      return NextResponse.json(
        { success: false, message: "Görsel depolama ayarları eksik." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Dosya bulunamadı." },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Sadece görsel dosyaları yüklenebilir." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Görsel en fazla 10 MB olabilir." },
        { status: 400 }
      );
    }

    // Signed upload: signature = sha1 of sorted params + api secret
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", UPLOAD_FOLDER);
    uploadForm.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm }
    );
    const data = await res.json();

    if (!res.ok || !data.secure_url) {
      console.error("Cloudinary upload error:", data?.error?.message || data);
      return NextResponse.json(
        { success: false, message: "Görsel yüklenirken bir hata oluştu." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url as string,
      fileName: data.public_id as string,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Görsel yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
