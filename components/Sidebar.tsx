"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    PiSidebarSimple,
    PiPencilSimpleLine,
    PiPlus,
    PiUserCircle,
    PiChatCircleText,
} from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
    addConversation,
    removeConversation,
    setConversation,
    setSelectConversation,
} from "@/store/conversationSlice";
import { getConversations, createConversation, deleteConversation } from "@/services/chatService";
import SwipeRow from "./SwipeRow";

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [imageError, setImageError] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { conversations, selectedConversation } = useSelector(
        (state: RootState) => state.conversation
    );
    const { userData } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 640) {
            setCollapsed(true);
        }
    }, []);

    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations();
            dispatch(setConversation(data));
        };

        if (userData?.userId || userData?._id) {
            getConv();
        }
    }, [userData?.userId, userData?._id, dispatch]);

    const handleCreateConversation = async () => {
        const data = await createConversation();
        if (data) {
            dispatch(addConversation(data));
            dispatch(setSelectConversation(data));
        }
    };

    const handleDeleteConversation = useCallback(
        async (conversationId: string) => {
            dispatch(removeConversation(conversationId));
            await deleteConversation(conversationId);
        },
        [dispatch]
    );

    if (collapsed) {
        return (
            <div className="hidden sm:flex w-[60px] bg-[#f5f5f5] border-r border-[#e7e5e4] flex-col items-center py-4 gap-4 shrink-0">
                <button
                    onClick={() => setCollapsed(false)}
                    className="text-[#777169] hover:text-[#0c0a09] transition-colors cursor-pointer p-1.5 rounded-md hover:bg-[#ebe9e6]"
                    title="Expand sidebar"
                >
                    <PiSidebarSimple className="w-4 h-4" />
                </button>
                <button
                    onClick={handleCreateConversation}
                    className="w-9 h-9 rounded-full bg-[#292524] text-white flex items-center justify-center hover:bg-[#0c0a09] transition-transform active:scale-95 cursor-pointer shadow-sm"
                    title="New Chat"
                >
                    <PiPlus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-1 flex-1 overflow-y-auto w-full px-2 mt-2">
                    {conversations.map((conv, i) => {
                        const isActive = selectedConversation?._id === conv?._id;
                        return (
                            <div
                                key={conv._id || i}
                                onClick={() => dispatch(setSelectConversation(conv))}
                                className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors ${
                                    isActive
                                        ? "bg-[#ebe9e6] text-[#0c0a09]"
                                        : "text-[#777169] hover:bg-[#ebe9e6] hover:text-[#0c0a09]"
                                }`}
                                title={conv.title || "Chat"}
                            >
                                <PiChatCircleText className="w-4 h-4 shrink-0" />
                            </div>
                        );
                    })}
                </div>
                <div className="pb-1">
                    {userData?.avatar && !imageError ? (
                        <img
                            src={userData.avatar}
                            alt={userData.name || "Avatar"}
                            onError={() => setImageError(true)}
                            className="w-7 h-7 rounded-full object-cover border border-[#e7e5e4]"
                        />
                    ) : (
                        <PiUserCircle className="w-7 h-7 text-[#777169]" />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[260px] bg-[#f5f5f5] border-r border-[#e7e5e4] flex flex-col p-4 shrink-0 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-[#777169] hover:text-[#0c0a09] transition-colors cursor-pointer p-1 rounded hover:bg-[#ebe9e6]"
                        title="Collapse sidebar"
                    >
                        <PiSidebarSimple className="w-4 h-4" />
                    </button>
                    <span className="font-editorial text-lg text-[#0c0a09] tracking-tight">
                        Cortex<span className="italic font-light text-[#777169]">AI</span>
                    </span>
                </div>
                <button
                    onClick={handleCreateConversation}
                    className="text-[#777169] hover:text-[#0c0a09] transition-colors cursor-pointer p-1 rounded hover:bg-[#ebe9e6]"
                    title="New conversation"
                >
                    <PiPencilSimpleLine className="w-4 h-4" />
                </button>
            </div>

            {/* Primary Action Button (Near-black ink pill per ElevenLabs spec) */}
            <button
                className="flex items-center justify-center gap-2 bg-[#292524] hover:bg-[#0c0a09] text-white text-[14px] font-medium py-2.5 px-4 rounded-full transition-transform active:scale-[0.98] cursor-pointer mb-5 shadow-sm"
                onClick={handleCreateConversation}
            >
                <PiPlus className="w-4 h-4" />
                New Chat
            </button>

            {/* Conversation list label */}
            <div className="text-[#777169] text-[11px] font-medium px-2 py-1.5 uppercase tracking-wider">
                {conversations.length === 0 ? "No recent chats" : "Recents"}
            </div>

            {/* Conversation list with SwipeRow */}
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
                {conversations.map((conv, i) => {
                    const isActive = selectedConversation?._id === conv?._id;
                    return (
                        <SwipeRow
                            key={conv._id || i}
                            label={conv.title || "Conversation item"}
                            height={38}
                            radius={8}
                            actionWidth={60}
                            direction="left"
                            rowColor={isActive ? "#ebe9e6" : "transparent"}
                            textColor={isActive ? "#0c0a09" : "#4e4e4e"}
                            actionColor="#e11d48"
                            drawerColor="#ffe4e6"
                            actions={[
                                {
                                    id: "delete",
                                    label: "Delete",
                                    color: "#e11d48",
                                },
                            ]}
                            onCommit={() => handleDeleteConversation(conv._id)}
                            onAction={(act) => {
                                if (act.id === "delete") {
                                    handleDeleteConversation(conv._id);
                                }
                            }}
                            className="w-full"
                        >
                            <div
                                onClick={() => dispatch(setSelectConversation(conv))}
                                className="flex items-center gap-2.5 w-full h-full text-[13px] select-none cursor-pointer truncate"
                                title={conv.title || "New Chat"}
                            >
                                <PiChatCircleText
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                        isActive ? "text-[#0c0a09]" : "text-[#777169]"
                                    }`}
                                />
                                <span
                                    className={`truncate ${
                                        isActive ? "font-medium text-[#0c0a09]" : "text-[#4e4e4e]"
                                    }`}
                                >
                                    {conv.title || "New Chat"}
                                </span>
                            </div>
                        </SwipeRow>
                    );
                })}
            </div>

            {/* Bottom divider */}
            <div className="h-px bg-[#e7e5e4] my-3" />

            {/* User row */}
            <div className="px-1">
                <div className="flex items-center gap-2.5 p-1 rounded-lg">
                    {userData?.avatar && !imageError ? (
                        <img
                            src={userData.avatar}
                            alt={userData.name || "Avatar"}
                            onError={() => setImageError(true)}
                            className="w-8 h-8 rounded-full object-cover border border-[#e7e5e4] shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[#f0efed] border border-[#e7e5e4] flex items-center justify-center text-[#292524] text-xs font-medium shrink-0">
                            {(userData?.name || "U")[0]}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#0c0a09] truncate">
                            {userData?.name || "Cortex User"}
                        </p>
                        <p className="text-[11px] text-[#777169] truncate">
                            Editorial Plan
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
