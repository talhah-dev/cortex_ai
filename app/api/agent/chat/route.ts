import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { inMemoryDB } from "@/lib/memoryStore";
import { graph } from "@/services/agent/graph/graph";
import { addMessage } from "@/services/agent/config/memory";

export const maxDuration = 60; // Allow 60s timeout for agent workflows

export async function POST(req: NextRequest) {
    try {
        await getSessionUser();
        const { prompt, conversationId, agent } = await req.json();

        if (!prompt || !conversationId) {
            return NextResponse.json(
                { message: "prompt and conversationId are required" },
                { status: 400 }
            );
        }

        // 1. Attempt DB save with in-memory fallback
        try {
            await connectDB();
            await Message.create({
                conversationId,
                role: "user",
                content: prompt,
            });
        } catch {
            inMemoryDB.saveMessage({
                conversationId,
                role: "user",
                content: prompt,
            });
        }

        // 2. Invoke LangGraph agent
        const result: any = await graph.invoke({
            prompt,
            agent: agent || "auto",
            conversationId,
        });

        const aiResponse = result?.aiResponse || "No response generated";
        const images = result?.images || [];
        const artifacts = result?.artifacts || [];

        // 3. Update memory cache
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", aiResponse);

        // 4. Attempt DB save assistant message with in-memory fallback
        try {
            await connectDB();
            await Message.create({
                conversationId,
                role: "assistant",
                content: aiResponse,
                images,
                artifacts,
            });
        } catch {
            inMemoryDB.saveMessage({
                conversationId,
                role: "assistant",
                content: aiResponse,
                images,
                artifacts,
            });
        }

        return NextResponse.json(
            {
                answer: aiResponse,
                images,
                artifacts,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Agent Route Error:", error);
        return NextResponse.json(
            {
                message: "Agent Server Error",
                error: error?.message,
            },
            { status: 500 }
        );
    }
}
