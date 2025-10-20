import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { connectToDatabase } from "@/lib/db";
import { Memory } from "@/models/Memory";
import { Message } from "@/models/Message";
import { env, assertServerEnvForChat, assertServerEnvForDb } from "@/lib/env";
import { trimMessagesToTokenLimit } from "@/lib/tokens";

const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_API_KEY as string | undefined });

// DISABLE EDGE RUNTIME FOR MONGODB/MONGOOSE. Edge runtime does not support Node.js native modules.
export const runtime = "nodejs";

// Change default and allowed model to ONLY gemini-2.5-flash
const MODEL_DEFAULT = "gemini-2.5-flash";
const MODEL_TOKEN_LIMIT: Record<string, number> = {
  "gemini-2.5-flash": 1000000, // Adjust the token limit as appropriate for this model
};
const ALLOWED_MODELS = ["gemini-2.5-flash"];

// Add a simple logger utility at the top of the file
const logger = {
  info: (...args: any[]) => {},
  warn: (...args: any[]) => {},
  error: (...args: any[]) => {},
};

export async function POST(req: NextRequest) {
  try {
    logger.info("Chat API called");
    
    // Validate environment variables
    assertServerEnvForChat();
    
    const body = await req.json();
    logger.info("Request body:", { 
      messagesCount: body?.messages?.length, 
      model: body?.model, 
      conversationId: body?.conversationId 
    });
    
    const messages = Array.isArray(body?.messages) ? (body.messages as { role: string; content: string }[]) : [];
    let modelName = typeof body?.model === "string" ? body.model : MODEL_DEFAULT;
    if (!ALLOWED_MODELS.includes(modelName)) {
      modelName = "gemini-2.5-flash";
    }
    const conversationId: string | undefined = typeof body?.conversationId === "string" ? body.conversationId : undefined;
    const saveMemory: boolean = !!body?.saveMemory;
    const attachments = body?.attachments || [];

    if (!messages.length) {
      logger.info("No messages provided");
      return new Response("No messages provided", { status: 400 });
    }

    const limit = MODEL_TOKEN_LIMIT[modelName] ?? MODEL_TOKEN_LIMIT[MODEL_DEFAULT];
    const maxTokens = Math.floor(limit * 0.8); // Use 80% of context window

    // Load memory items for this conversation and prepend them as system messages
    let memoryMessages: { role: string; content: string }[] = [];
    if (conversationId) {
      try {
        await connectToDatabase();
        const mems = (await Memory.find({ conversationId }).sort({ createdAt: -1 }).limit(10).lean()) as { content: string }[];
        memoryMessages = mems.map((m) => ({ role: "system", content: m.content }));
      } catch (err) {
        logger.warn("Memory load error", err);
      }
    }

    // Handle attachments by adding them to the last user message
    const processedMessages = [...messages];
    if (attachments.length > 0 && processedMessages.length > 0) {
      const lastMessage = processedMessages[processedMessages.length - 1];
      if (lastMessage.role === "user") {
        const attachmentText = attachments.map((att: any) => `[Attachment: ${att.type}]`).join(" ");
        lastMessage.content += `\n\nAttachments: ${attachmentText}`;
      }
    }

    const combined = [...memoryMessages, ...processedMessages];
    const trimmed = trimMessagesToTokenLimit(combined, maxTokens);

    // Create the AI model instance
    const model = google(modelName as any);
    
    logger.info("Model created:", modelName);
    logger.info("Messages to send:", trimmed);
    logger.info("Google API Key exists:", !!env.GOOGLE_API_KEY);

    // Stream the response with proper error handling
    let result;
    try {
      result = await streamText({
        model,
        messages: trimmed as any,
        temperature: 0.7,
        onFinish: async (result) => {
          logger.info("Stream finished with result:", result.text);
          // Persist the conversation after completion
          try {
            const url = new URL("/api/persist", req.url).toString();
            const payload = JSON.stringify({ 
              conversationId, 
              messages: processedMessages, 
              saveMemory,
              assistantMessage: result.text 
            });
            const headers = { 
              "Content-Type": "application/json", 
              "x-internal-secret": env.PERSIST_SECRET ?? "" 
            };
            
            // Retry logic for persistence
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                const res = await fetch(url, { method: "POST", headers, body: payload });
                if (res.ok) break;
              } catch (err) {
                logger.warn("persist fetch error", err);
              }
              await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
            }
          } catch (err) {
            logger.error("Failed to persist conversation", err);
          }
        }
      });
    } catch (streamError) {
      logger.error("streamText error:", streamError);
      throw streamError;
    }

    logger.info("Streaming response starting...");
    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error) {
    logger.error("Chat API error:", error);
    
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }), 
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}


