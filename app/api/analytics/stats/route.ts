import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/db";

export const instant = false;

export async function GET() {
  try {
    const stats = await getAnalyticsStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error("Analytics stats error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 });
  }
}
