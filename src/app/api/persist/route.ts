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
    const assistantMessage: string | undefined = typeof body?.assistantMessage === "string" ? body.assistantMessage : undefined;

    await connectToDatabase();

    // Prepare messages for insertion, skip those with invalid content
    const docs: { conversationId: string; role: string; content: string }[] = messages
      .filter((m: { role: string; content: string }) => typeof m.content === "string" && m.content.trim())
      .map((m: { role: string; content: string }) => ({
        conversationId: conversationId || "default",
        role: m.role,
        content: m.content,
      }));

    // Log any rejected messages for debugging
    const invalidDocs = messages.filter((m: { role: string; content: string }) => !m.content || typeof m.content !== "string" || !m.content.trim());
    if (invalidDocs.length) {
      console.warn("Rejected messages in /api/persist (missing content):", invalidDocs);
    }

    // Add assistant message if provided and valid
    if (assistantMessage && typeof assistantMessage === "string" && assistantMessage.trim()) {
      docs.push({
        conversationId: conversationId || "default",
        role: "assistant",
        content: assistantMessage,
      });
    }

    if (docs.length) {
      await Message.insertMany(docs);
    }

    // Save to memory if enabled and we have a valid assistant message
    if (
      saveMemory &&
      assistantMessage &&
      typeof assistantMessage === "string" &&
      assistantMessage.trim()
    ) {
      await Memory.create({
        conversationId: conversationId || "default",
        content: assistantMessage
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("/api/persist error", err);
    return new Response(JSON.stringify({ ok: false, error: "persistence_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
