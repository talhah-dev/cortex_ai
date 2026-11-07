import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.cookies.get("session")?.value;

        if (sessionId) {
            await redis.del(`session-${sessionId}`);
        }

        const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });

        response.cookies.set("session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return response;
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
        console.error("Logout Server Error:", error);
        return NextResponse.json({ message: "Logout Server Error", error: error?.message }, { status: 500 });
    }
}
