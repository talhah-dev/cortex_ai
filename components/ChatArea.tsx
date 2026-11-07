"use client";

import React, { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getMessages } from "@/services/chatService";
import { setArtifacts, setMessages } from "@/store/messageSlice";

const ChatArea: React.FC = () => {
    const { selectedConversation } = useSelector((state: RootState) => state.conversation);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchMessages = async () => {
            dispatch(setMessages([]));
            dispatch(setArtifacts([]));

            if (!selectedConversation) return;
            if (selectedConversation.title === "New Chat") return;

            const data = await getMessages(selectedConversation._id);
            dispatch(setMessages(data));

            const latestArtifactMessage = [...data]
                .reverse()
                .find((msg) => msg.artifacts && msg.artifacts.length > 0);
            dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
        };

        fetchMessages();
    }, [selectedConversation?._id, dispatch]);

    return (
        <div className="flex-1 h-screen flex flex-col overflow-hidden bg-[#fafafa] relative">
            {/* Atmospheric gradient bloom (ElevenLabs signature) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-orb pointer-events-none opacity-60 blur-3xl" />
            <Nav />
            <MessageList />
            <ChatInput />
        </div>
    );
};

export default ChatArea;
