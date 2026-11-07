import { cookies } from "next/headers";
import redis from "./redis";

export interface SessionUser {
    userId: string;
    name?: string;
    email?: string;
    avatar?: string;
}

export async function getSessionUser(): Promise<SessionUser> {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("session")?.value;

        if (sessionId) {
            const session = await redis.get(`session-${sessionId}`);
            if (session) {
                return JSON.parse(session) as SessionUser;
            }
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
    }

    // Default guest session so the app works directly without login barrier
    return {
        userId: "guest-user-123",
        name: "Cortex User",
        email: "user@cortex.ai",
        avatar: "",
    };
}
