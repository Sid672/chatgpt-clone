import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";
import { Memory } from "@/models/Memory";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    // Validate internal secret header to avoid public abuse
    const secret = req.headers.get("x-internal-secret");
    if (!env.PERSIST_SECRET || !secret || secret !== env.PERSIST_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const body = await req.json();
    const conversationId: string | undefined = typeof body?.conversationId === "string" ? body.conversationId : undefined;
  const messages: { role: string; content: string }[] = Array.isArray(body?.messages) ? body.messages : [];
    const saveMemory: boolean = !!body?.saveMemory;

    await connectToDatabase();

    const docs: { conversationId: string; role: string; content: string }[] = messages.map((m: { role: string; content: string }) => ({
      conversationId: conversationId || "default",
      role: m.role,
      content: m.content,
    }));

    if (docs.length) {
      await Message.insertMany(docs);
    }

    if (saveMemory) {
      const lastAssistant = docs.slice().reverse().find((d) => d.role === "assistant");
      if (lastAssistant) {
        await Memory.create({ conversationId: conversationId || "default", content: lastAssistant.content });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    // Surface the error for server logs
    // Do not throw raw errors to clients
    console.error("/api/persist error", err);
    return new Response(JSON.stringify({ ok: false, error: "persistence_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
