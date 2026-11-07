"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import AgentLoader from "./AgentLoader";
import { PiCode, PiDatabase, PiSquaresFour } from "react-icons/pi";
import { RootState } from "@/store/store";

interface MessageListProps {
    onSelectSuggestion?: (text: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onSelectSuggestion }) => {
    const { selectedConversation } = useSelector((state: RootState) => state.conversation);
    const { messages, isLoading, loadingAgent } = useSelector((state: RootState) => state.message);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const suggestions = [
        { text: "Design a clean editorial portfolio", icon: PiSquaresFour },
        { text: "Analyze database indexing strategies", icon: PiDatabase },
        { text: "Generate an interactive audio player component", icon: PiCode },
    ];

    return (
        <div className="flex-1 overflow-y-auto relative z-10">
            {messages?.length === 0 || !selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
                    {/* Display headline (Waldenburg/Newsreader Light 300) */}
                    <h1 className="font-editorial text-4xl sm:text-5xl text-[#0c0a09] tracking-tight mb-3">
                        What would you like to create?
                    </h1>

                    <p className="text-[#777169] text-[15px] leading-relaxed mb-8 max-w-md">
                        Autonomous multi-agent intelligence for synthesis, presentation design, code, and live search.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onSelectSuggestion && onSelectSuggestion(s.text)}
                                className="flex items-center gap-2 text-[#292524] bg-[#ffffff] hover:border-[#292524] hover:shadow-md border border-[#d6d3d1] rounded-full px-4 py-2.5 text-xs font-medium cursor-pointer transition-all shadow-sm active:scale-95"
                            >
                                <s.icon className="w-3.5 h-3.5 text-[#777169]" />
                                <span>{s.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-5 px-6 py-8 max-w-3xl mx-auto w-full">
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={msg._id || i}
                            role={msg.role}
                            content={msg.content}
                            images={msg.images || []}
                        />
                    ))}
                    {isLoading && <AgentLoader agent={loadingAgent} />}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
};

export default MessageList;
