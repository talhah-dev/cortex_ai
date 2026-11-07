import { NextRequest, NextResponse } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import connectDB from "@/lib/db";
import User from "@/models/User";
import redis from "@/lib/redis";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }

        const decoded = await firebaseAdminAuth.verifyIdToken(token);

        await connectDB();

        let user = await User.findOne({ firebaseUid: decoded.uid });

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name || decoded.displayName || "User",
                email: decoded.email,
                avatar: decoded.picture,
            });
        }

        const sessionId = crypto.randomUUID();

        const sessionData = {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        };

        await redis.set(`session-${sessionId}`, JSON.stringify(sessionData), "EX", 7 * 24 * 60 * 60);

        const response = NextResponse.json(user, { status: 200 });

        response.cookies.set("session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Login Server Error:", error);
        return NextResponse.json({ message: "Login Server Error", error: error?.message }, { status: 500 });
    }
}

