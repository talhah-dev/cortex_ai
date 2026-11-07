"use client";

import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addMessages, setArtifacts, setLoading } from "@/store/messageSlice";
import { addConversation, setConvTitle, setSelectConversation } from "@/store/conversationSlice";
import { createConversation, sendMessage, updateConversation } from "@/services/chatService";
import PromptBar, {
    PromptBarCommand,
    PromptBarModel,
    PromptBarSendDetail,
    PromptBarSource,
} from "./PromptBar";

const AGENT_MODELS: PromptBarModel[] = [
    { key: "auto", name: "Auto Route", tag: "Autonomous" },
    { key: "chat", name: "Editorial Chat", tag: "General" },
    { key: "coding", name: "Coding Agent", tag: "Full-Stack" },
    { key: "pdf", name: "PDF Publisher", tag: "Editorial PDF" },
    { key: "ppt", name: "Slide Deck", tag: "Presentations" },
    { key: "vision", name: "Vision & Image", tag: "Creative" },
    { key: "search", name: "Live Search", tag: "Tavily Web" },
];

const AGENT_COMMANDS: PromptBarCommand[] = [
    { key: "coding", name: "/code", description: "Generate components, code architecture & scripts" },
    { key: "pdf", name: "/pdf", description: "Author formatted editorial PDF document" },
    { key: "ppt", name: "/slides", description: "Design interactive presentation deck" },
    { key: "search", name: "/search", description: "Search live web indices & extract citations" },
    { key: "chat", name: "/chat", description: "Direct conversational AI response" },
    { key: "summarize", name: "/summarize", description: "Synthesize key points from discussion" },
];

const AGENT_SOURCES: PromptBarSource[] = [
    { key: "files", name: "Attach File", description: "Upload code or document context", attach: true },
    { key: "web", name: "Tavily Web Search", description: "Include real-time internet search results" },
    { key: "docs", name: "Project Memory", description: "Active session and context memory" },
];

const ChatInput: React.FC = () => {
    const { isLoading } = useSelector((state: RootState) => state.message);
    const { selectedConversation } = useSelector((state: RootState) => state.conversation);
    const dispatch = useDispatch<AppDispatch>();

    const sendingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // ── Voice dictation handler (Web Speech API) ──────────────────────────────
    const handleDictate = useCallback((): Promise<string | void> => {
        return new Promise((resolve) => {
            if (typeof window === "undefined") {
                resolve();
                return;
            }

            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognition) {
                alert("Voice input is not supported in this browser. Please try Chrome or Edge.");
                resolve();
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";

            recognition.onresult = (e: any) => {
                const transcript = e.results?.[0]?.[0]?.transcript || "";
                resolve(transcript);
            };

            recognition.onerror = () => {
                resolve();
            };

            recognition.onend = () => {
                resolve();
            };

            try {
                recognition.start();
            } catch {
                resolve();
            }
        });
    }, []);

    // ── File attachment handler ───────────────────────────────────────────────
    const handleAttach = useCallback((): Promise<string | void> => {
        return new Promise((resolve) => {
            if (typeof document === "undefined") {
                resolve();
                return;
            }
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                    resolve(file.name);
                } else {
                    resolve();
                }
            };
            input.click();
        });
    }, []);

    // ── Stop handler ──────────────────────────────────────────────────────────
    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        dispatch(setLoading({ isLoading: false, agent: "auto" }));
        sendingRef.current = false;
    }, [dispatch]);

    // ── Send handler ──────────────────────────────────────────────────────────
    const handleSend = useCallback(
        async (text: string, detail: PromptBarSendDetail) => {
            const prompt = text.trim();
            if (!prompt || isLoading || sendingRef.current) return;

            sendingRef.current = true;
            abortControllerRef.current = new AbortController();

            // Detect slash command or active model
            let agent = detail.model?.key || "auto";
            let cleanPrompt = prompt;

            if (prompt.startsWith("/code ")) {
                agent = "coding";
                cleanPrompt = prompt.replace(/^\/code\s+/, "");
            } else if (prompt.startsWith("/pdf ")) {
                agent = "pdf";
                cleanPrompt = prompt.replace(/^\/pdf\s+/, "");
            } else if (prompt.startsWith("/slides ")) {
                agent = "ppt";
                cleanPrompt = prompt.replace(/^\/slides\s+/, "");
            } else if (prompt.startsWith("/search ")) {
                agent = "search";
                cleanPrompt = prompt.replace(/^\/search\s+/, "");
            } else if (prompt.startsWith("/chat ")) {
                agent = "chat";
                cleanPrompt = prompt.replace(/^\/chat\s+/, "");
            }

            if (detail.attachments?.length > 0) {
                cleanPrompt += `\n[Attached: ${detail.attachments.join(", ")}]`;
            }

            try {
                let conversation = selectedConversation;

                if (!conversation) {
                    const conv = await createConversation();
                    if (conv) {
                        dispatch(addConversation(conv));
                        dispatch(setSelectConversation(conv));
                        conversation = conv;
                    }
                }

                if (conversation && conversation.title === "New Chat") {
                    await updateConversation({ id: conversation._id, title: cleanPrompt });
                    dispatch(setConvTitle({ conversationId: conversation._id, title: cleanPrompt }));
                }

                dispatch(addMessages({ role: "user", content: cleanPrompt }));

                if (conversation) {
                    const payload = {
                        prompt: cleanPrompt,
                        conversationId: conversation._id,
                        agent: agent.toLowerCase(),
                    };

                    dispatch(setLoading({ isLoading: true, agent }));
                    const data = await sendMessage(payload);
                    dispatch(setLoading({ isLoading: false, agent }));

                    if (data?.artifacts) {
                        dispatch(setArtifacts(data.artifacts));
                    }

                    if (data) {
                        dispatch(
                            addMessages({
                                role: "assistant",
                                content: data.answer || "No response received",
                                images: data.images || [],
                                artifacts: data.artifacts || [],
                            })
                        );
                    }
                }
            } catch (err) {
                dispatch(setLoading({ isLoading: false, agent }));
                console.error("Send failed:", err);
            } finally {
                sendingRef.current = false;
                abortControllerRef.current = null;
            }
        },
        [dispatch, isLoading, selectedConversation]
    );

    return (
        <div className="px-6 pb-5 pt-2 shrink-0 relative z-20 flex justify-center">
            <div className="w-full max-w-3xl">
                <PromptBar
                    placeholder="Ask, generate code, create slides, or search (/ for commands, @ for sources)…"
                    models={AGENT_MODELS}
                    defaultModel="auto"
                    commands={AGENT_COMMANDS}
                    sources={AGENT_SOURCES}
                    efforts={["Fast", "Standard", "Deep", "Max"]}
                    defaultEffort="Standard"
                    busy={isLoading}
                    onSend={handleSend}
                    onStop={handleStop}
                    onDictate={handleDictate}
                    onAttach={handleAttach}
                    background="#ffffff"
                    color="#0c0a09"
                    menuBackground="#ffffff"
                    sparkColor="#292524"
                    width={800}
                    radius={20}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default ChatInput;
