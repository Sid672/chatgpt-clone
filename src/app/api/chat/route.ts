import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { connectToDatabase } from "@/lib/db";
import { Memory } from "@/models/Memory";
import { env } from "@/lib/env";
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
      const mems = (await Memory.find({ conversationId }).sort({ createdAt: -1 }).limit(10).lean()) as { content: string }[];
      memoryMessages = mems.map((m) => ({ role: "system", content: m.content }));
    } catch (err) {
      // ignore memory load errors (log for debugging)
      console.warn("Memory load error", err);
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

  // Best-effort persistence: call a serverful endpoint to avoid DB work on the Edge runtime
  // Best-effort persistence: call a serverful endpoint to avoid DB work on the Edge runtime
  void (async () => {
    const url = new URL("/api/persist", req.url).toString();
    const payload = JSON.stringify({ conversationId, messages, saveMemory });
    const headers = { "Content-Type": "application/json", "x-internal-secret": env.PERSIST_SECRET ?? "" };
    // retry a couple times with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, { method: "POST", headers, body: payload });
        if (res.ok) break;
      } catch (err) {
        // continue to retry; log for observability
        console.warn("persist fetch error", err);
      }
      // backoff
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  })();

  return result.toTextStreamResponse();
}


