import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Conversation } from "@/models/Conversation";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Persistence disabled" }, { status: 501 });
  }
  await connectToDatabase();
  const body = await req.json().catch(() => ({}));
  const title: string | undefined = body?.title;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const updated = await Conversation.findByIdAndUpdate(
    params.id,
    { title },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ id: (updated as any)._id.toString(), title: updated.title });
}


