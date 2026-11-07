import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import { inMemoryDB } from "@/lib/memoryStore";

export async function GET() {
    try {
        const user = await getSessionUser();

        try {
            await connectDB();
            const conversations = await Conversation.find({
                userId: user.userId,
            }).sort({ updatedAt: -1 });

            return NextResponse.json(conversations, { status: 200 });
        } catch (dbErr) {
            // Fallback to in-memory store if DB is temporarily unreachable
            const fallbackList = inMemoryDB.getConversations(user.userId);
            return NextResponse.json(fallbackList, { status: 200 });
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
        return NextResponse.json([], { status: 200 });
    }
}
