import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  isConnected = true;
  return mongoose;
}


