import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json([]);
  }
  await connectToDatabase();
  const items = await Message.find({ conversationId: params.id }).sort({ createdAt: 1 }).lean();
  return NextResponse.json(items.map((m) => ({ role: m.role, content: m.content })));
}


