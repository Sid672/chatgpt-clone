import mongoose from "mongoose";

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If already connecting, return the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  connectionPromise = (async () => {
    try {
      mongoose.set("strictQuery", true);
      
      // Add connection options for better performance
      await mongoose.connect(uri, { 
        dbName: process.env.MONGODB_DB || undefined,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false // Disable mongoose buffering
      });
      
      isConnected = true;
      return mongoose;
    } catch (error) {
      connectionPromise = null; // Reset on error
      throw error;
    }
  })();

  return connectionPromise;
}


