import redis from "@/lib/redis";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export interface MemoryMessage {
    role: "user" | "assistant";
    content: string;
}

export const getMemory = async (conversationId: string): Promise<MemoryMessage[]> => {
    const key = `messages-${conversationId}`;

    const cached = await redis.get(key);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch {
            // parse error fallback
        }
    }

    try {
        await connectDB();
        const dbMessages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(20)
            .lean();

        const messages: MemoryMessage[] = dbMessages.map((msg) => ({
            role: msg.role,
            content: msg.content || "",
        }));

        await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
        return messages;
    } catch (err) {
        console.error("Failed to fetch memory from DB:", err);
        return [];
    }
};

export const addMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    const key = `messages-${conversationId}`;

    const rawMessages = await redis.get(key);
    let messages: MemoryMessage[] = [];
    if (rawMessages) {
        try {
            messages = JSON.parse(rawMessages);
        } catch {
            messages = [];
        }
    }

    messages.push({ role, content });

    if (messages.length > 20) {
        messages.shift();
    }

    await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
};

