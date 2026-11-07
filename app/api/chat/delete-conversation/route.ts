import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { inMemoryDB } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "id is required" }, { status: 400 });
        }

        try {
            await connectDB();
            await Conversation.findOneAndDelete({ _id: id, userId: user.userId });
            await Message.deleteMany({ conversationId: id });
            return NextResponse.json({ success: true }, { status: 200 });
        } catch (dbErr) {
            inMemoryDB.deleteConversation(id);
            return NextResponse.json({ success: true }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: "Delete conversation error" }, { status: 500 });
    }
}

