import mongoose, { Schema, Model } from "mongoose";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface IMessage {
  conversationId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, index: true, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);


