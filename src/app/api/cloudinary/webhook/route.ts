import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // In production, verify Cloudinary webhook signature using API secret
  try {
    const raw = await req.text();
    const sig = req.headers.get("x-cld-signature");
    const ts = req.headers.get("x-cld-timestamp");
    if (!sig || !ts || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const expected = crypto
      .createHash("sha1")
      .update(raw + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");
    if (expected !== sig) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    // parse after verifying signature
    const payload = JSON.parse(raw);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}


