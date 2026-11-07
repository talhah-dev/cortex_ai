import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import { inMemoryDB } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser();
        const { id, title } = await req.json();

        if (!id || !title) {
            return NextResponse.json({ message: "id and title are required" }, { status: 400 });
        }

        try {
            await connectDB();
            const conversation = await Conversation.findOneAndUpdate(
                { _id: id, userId: user.userId },
                { title },
                { new: true }
            );
            return NextResponse.json(conversation, { status: 200 });
        } catch (dbErr) {
            const updated = inMemoryDB.updateConversation(id, title);
            return NextResponse.json(updated, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: "Update conversation error" }, { status: 500 });
    }
}
