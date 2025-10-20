import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Conversation } from "@/models/Conversation";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json([]);
  }
  await connectToDatabase();
  const items = (await Conversation.find({}).sort({ updatedAt: -1 }).limit(100).lean()) as (
    | { _id: { toString: () => string }; title?: string }
    | { title?: string }
  )[];
  return NextResponse.json(
    items.map((c) => {
      if (c && "_id" in c) return { id: c._id.toString(), title: c.title };
      return { id: "", title: (c as { title?: string }).title };
    })
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Persistence disabled" }, { status: 501 });
  }
  await connectToDatabase();
  const body = (await req.json().catch(() => ({}))) as { title?: string };
  const title: string = body?.title || "New chat";
  const created = await Conversation.create({ title });
  return NextResponse.json({ id: created._id.toString(), title: created.title });
}


