import process from "process";
import { z } from "zod";

// Validate presence/shape of known environment variables.
// Do NOT embed secrets or default secret values in source. Keep values optional when appropriate
// so local dev without all services doesn't crash at module import time.
const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  PERSIST_SECRET: z.string().optional(),
});

const raw = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  PERSIST_SECRET: process.env.PERSIST_SECRET,
};

// Use safeParse to avoid throwing during import; endpoints will assert required vars when needed.
const parsed = EnvSchema.safeParse(raw);

export const env = parsed.success ? parsed.data : (raw as z.infer<typeof EnvSchema>);

export function assertServerEnvForChat() {
  if (!env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is required to use the chat API. Set it in your environment (.env.local).");
  }
}

export function assertServerEnvForDb() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for persistence. Set it in your environment (.env.local).");
  }
}


