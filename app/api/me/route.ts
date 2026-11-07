import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getSessionUser();
        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") {
            throw error;
        }
        return NextResponse.json(
            {
                userId: "guest-user-123",
                name: "Cortex User",
                email: "user@cortex.ai",
                avatar: "",
            },
            { status: 200 }
        );
    }
}
