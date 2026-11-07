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
            const conversation = await Conversation.create({
                userId: user.userId,
                title: "New Chat",
            });
            return NextResponse.json(conversation, { status: 201 });
        } catch (dbErr) {
            const fallbackConv = inMemoryDB.createConversation(user.userId, "New Chat");
            return NextResponse.json(fallbackConv, { status: 201 });
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
        const fallbackConv = inMemoryDB.createConversation("guest-user-123", "New Chat");
        return NextResponse.json(fallbackConv, { status: 201 });
    }
}
