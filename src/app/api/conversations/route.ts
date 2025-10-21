import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Conversation } from "@/models/Conversation";

// Ensure Node.js runtime for MongoDB operations
export const runtime = "nodejs";
// Ask the platform for a longer execution window (in seconds)
export const maxDuration = 60;

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json([]);
    }
    
    // Add timeout protection (extend to 20s)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 20000)
    );
    
    const queryPromise = (async () => {
      await connectToDatabase();
      return await Conversation.find({})
        .sort({ updatedAt: -1 })
        .limit(50) // Reduced limit for faster queries
        .select('_id title updatedAt') // Only select needed fields
        .lean()
        .exec();
    })();
    
    const items = await Promise.race([queryPromise, timeoutPromise]) as (
      | { _id: { toString: () => string }; title?: string }
      | { title?: string }
    )[];
    
    return NextResponse.json(
      items.map((c) => {
        if (c && "_id" in c) return { id: c._id.toString(), title: c.title };
        return { id: "", title: (c as { title?: string }).title };
      })
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Persistence disabled" }, { status: 501 });
    }
    
    // Add timeout protection (extend to 15s)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 15000)
    );
    
    const createPromise = (async () => {
      await connectToDatabase();
      const body = (await req.json().catch(() => ({}))) as { title?: string };
      const title: string = body?.title || "New chat";
      const created = await Conversation.create({ title });
      return { id: created._id.toString(), title: created.title };
    })();
    
    const result = await Promise.race([createPromise, timeoutPromise]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}


