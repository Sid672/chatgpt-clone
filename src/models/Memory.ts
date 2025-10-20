import mongoose, { Schema, Model } from "mongoose";

export interface IMemory {
  conversationId: string;
  content: string;
  createdAt: Date;
}

const MemorySchema = new Schema<IMemory>({
  conversationId: { type: String, index: true, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Memory: Model<IMemory> =
  mongoose.models.Memory || mongoose.model<IMemory>("Memory", MemorySchema);
