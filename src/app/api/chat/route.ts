import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";
import { Memory } from "@/models/Memory";
import { env, assertServerEnvForChat } from "@/lib/env";
import { trimMessagesToTokenLimit } from "@/lib/tokens";

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY as string | undefined });

export const runtime = "edge";

const MODEL_DEFAULT = "gpt-4o-mini";
const MODEL_TOKEN_LIMIT: Record<string, number> = {
  "gpt-4o-mini": 128000,
  "gpt-4o": 128000,
  "gpt-4.1-mini": 128000,
};

export async function POST(req: NextRequest) {
  const hasKey = !!env.OPENAI_API_KEY;
  const body = await req.json();
  const messages = Array.isArray(body?.messages) ? (body.messages as { role: string; content: string }[]) : [];
  const modelName = typeof body?.model === "string" ? body.model : MODEL_DEFAULT;
  const conversationId: string | undefined = typeof body?.conversationId === "string" ? body.conversationId : undefined;
  const saveMemory: boolean = !!body?.saveMemory;

  const limit = MODEL_TOKEN_LIMIT[modelName] ?? MODEL_TOKEN_LIMIT[MODEL_DEFAULT];

  // Load memory items for this conversation and prepend them as system messages.
  let memoryMessages: { role: string; content: string }[] = [];
  if (conversationId) {
    try {
      await connectToDatabase();
      const mems = await Memory.find({ conversationId }).sort({ createdAt: -1 }).limit(10).lean();
      memoryMessages = mems.map((m) => ({ role: "system", content: m.content }));
    } catch (e) {
      // ignore memory load errors
      console.warn("Memory load error", e);
    }
  }

  const combined = [...memoryMessages, ...messages];
  const trimmed = trimMessagesToTokenLimit(combined, Math.floor(limit * 0.8));

  if (!hasKey) {
    const text = "This is a mock response. Set OPENAI_API_KEY in .env.local to enable real responses.";
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // ai.streamText typings are broad; cast to unknown then to the expected shape to satisfy lint rules
  const result = await streamText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: openai(modelName as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: trimmed as any,
  });

  // Best-effort persistence (not on Edge runtime path). Use Webhooks/Background in production.
  void (async () => {
    try {
      await connectToDatabase();
      const docs = messages.map((m: { role: string; content: string }) => ({
        conversationId: conversationId || "default",
        role: m.role,
        content: m.content,
      }));
      if (docs.length) await Message.insertMany(docs);

      // Persist a short memory entry if requested (e.g., last assistant reply)
      if (saveMemory) {
        const lastAssistant = docs.slice().reverse().find((d) => d.role === "assistant");
        if (lastAssistant) {
          await Memory.create({ conversationId: conversationId || "default", content: lastAssistant.content });
        }
      }
    } catch (err) {
      // ignore persistence errors to avoid affecting streaming
      console.warn("Persistence error", err);
    }
  })();

  return result.toTextStreamResponse();
}


