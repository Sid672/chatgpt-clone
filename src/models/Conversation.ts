import mongoose, { Schema, Model } from "mongoose";

export interface IConversation {
  userId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: { type: String },
  title: { type: String },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

ConversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);


