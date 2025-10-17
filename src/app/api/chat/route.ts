import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/models/Message";
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
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const modelName = typeof body?.model === "string" ? body.model : MODEL_DEFAULT;
  const conversationId: string | undefined = body?.conversationId;

  const limit = MODEL_TOKEN_LIMIT[modelName] ?? MODEL_TOKEN_LIMIT[MODEL_DEFAULT];
  const trimmed = trimMessagesToTokenLimit(messages, Math.floor(limit * 0.8));

  if (!hasKey) {
    const text = "This is a mock response. Set OPENAI_API_KEY in .env.local to enable real responses.";
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  const result = await streamText({
    model: openai(modelName as any),
    messages: trimmed as any,
  });

  // Best-effort persistence (not on Edge runtime path). Use Webhooks/Background in production.
  void (async () => {
    try {
      await connectToDatabase();
      const docs = messages.map((m: any) => ({
        conversationId: conversationId || "default",
        role: m.role,
        content: m.content,
      }));
      if (docs.length) await Message.insertMany(docs);
    } catch (err) {
      // ignore persistence errors to avoid affecting streaming
      console.warn("Persistence error", err);
    }
  })();

  return result.toTextStreamResponse();
}


