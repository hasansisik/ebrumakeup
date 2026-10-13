import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/db";

export const instant = false;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, blogId } = body;

    if (!visitorId) {
      return NextResponse.json({ success: false, message: "Visitor ID required" }, { status: 400 });
    }

    const result = await recordVisit({ visitorId, path, blogId });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ success: false, message: "Track failed" }, { status: 500 });
  }
}
