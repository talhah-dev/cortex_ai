"use client";

import React from "react";
import { useSelector } from "react-redux";
import { PiChatCircleDots } from "react-icons/pi";
import { RootState } from "@/store/store";

const Nav: React.FC = () => {
    const { selectedConversation } = useSelector((state: RootState) => state.conversation);
    const { messages } = useSelector((state: RootState) => state.message);

    if (!selectedConversation) return null;

    return (
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e7e5e4] bg-[#ffffff] shrink-0">
            <h1 className="text-[#0c0a09] text-[14px] font-medium truncate tracking-tight">
                {selectedConversation?.title || "New Chat"}
            </h1>

            <div className="flex items-center gap-1.5 text-[#777169] text-xs bg-[#f5f5f5] px-2.5 py-1 rounded-full border border-[#e7e5e4]">
                <PiChatCircleDots className="w-3.5 h-3.5" />
                <span>{messages?.length || 0} messages</span>
            </div>
        </div>
    );
};

export default Nav;
