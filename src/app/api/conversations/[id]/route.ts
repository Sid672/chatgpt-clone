import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Conversation } from "@/models/Conversation";

type RouteContext = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const params = (await Promise.resolve(context.params as Promise<{ id: string }> | { id: string })) as { id?: string } | undefined;
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "Persistence disabled" }, { status: 501 });
  }
  await connectToDatabase();
  const body = (await req.json().catch(() => ({}))) as { title?: string };
  const title: string | undefined = body?.title;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const updated = await Conversation.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  const typed = updated as { _id: { toString: () => string }; title?: string };
  return NextResponse.json({ id: typed._id.toString(), title: typed.title });
}


