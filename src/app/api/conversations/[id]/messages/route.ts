import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";

type RouteContext = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params as Promise<{ id: string }> | { id: string });
  if (!process.env.MONGODB_URI) {
    return NextResponse.json([]);
  }
  await connectToDatabase();
  const id = params?.id;
  if (!id) return NextResponse.json([]);
  const items = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
  return NextResponse.json(items.map((m) => ({ role: m.role, content: m.content })));
}


