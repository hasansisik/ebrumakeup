import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const instant = false;

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });
  }
  try {
    const stats = await getAnalyticsStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error("Analytics stats error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 });
  }
}
