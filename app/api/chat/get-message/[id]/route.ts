import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { inMemoryDB } from "@/lib/memoryStore";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await getSessionUser();
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ message: "Conversation id is required" }, { status: 400 });
        }

        try {
            await connectDB();
            const messages = await Message.find({
                conversationId: id,
            }).sort({ createdAt: 1 });

            return NextResponse.json(messages, { status: 200 });
        } catch (dbErr) {
            const fallbackMessages = inMemoryDB.getMessages(id);
            return NextResponse.json(fallbackMessages, { status: 200 });
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
        return NextResponse.json([], { status: 200 });
    }
}
