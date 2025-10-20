import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Memory } from "@/models/Memory";

// Ensure Node.js runtime for MongoDB operations
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Persistence disabled" }, { status: 501 });
  }
  await connectToDatabase();
  const body = (await req.json().catch(() => ({}))) as { conversationId?: string; content?: string };
  const conversationId = body?.conversationId || "default";
  const content = body?.content;
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });
  const created = await Memory.create({ conversationId, content });
  return NextResponse.json({ id: created._id.toString(), ok: true });
}
