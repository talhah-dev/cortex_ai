"use client";

import React, { useMemo } from "react";
import ThoughtLine from "./ThoughtLine";

interface AgentLoaderProps {
    agent?: string;
}

const AgentLoader: React.FC<AgentLoaderProps> = ({ agent }) => {
    const agentKey = (agent || "auto").toLowerCase();
    const formattedAgent =
        agent && agent !== "auto"
            ? agent.charAt(0).toUpperCase() + agent.slice(1)
            : "Cortex";

    const steps = useMemo(() => {
        switch (agentKey) {
            case "coding":
                return [
                    "Analyzing requirements & architecture",
                    "Synthesizing modular solution",
                    "Generating production code & artifacts…",
                ];
            case "pdf":
                return [
                    "Structuring document layout",
                    "Writing editorial content",
                    "Compiling downloadable PDF…",
                ];
            case "ppt":
                return [
                    "Drafting slide outline & narrative",
                    "Applying typography & design tokens",
                    "Generating presentation deck…",
                ];
            case "search":
                return [
                    "Querying web index & verified sources",
                    "Extracting relevant citations",
                    "Synthesizing live search results…",
                ];
            case "vision":
                return [
                    "Analyzing visual prompt & context",
                    "Composing creative styling",
                    "Rendering image assets…",
                ];
            default:
                return [
                    "Understanding user intent",
                    "Gathering contextual memory",
                    "Synthesizing thoughtful response…",
                ];
        }
    }, [agentKey]);

    return (
        <div className="flex w-full mb-4 px-1 justify-start">
            <div className="inline-flex flex-col items-start px-4 py-2.5 rounded-2xl bg-[#ffffff] border border-[#e7e5e4] shadow-sm max-w-md">
                <ThoughtLine
                    label={`${formattedAgent} reasoning…`}
                    doneLabel={`${formattedAgent} completed`}
                    glyph="sparkle"
                    color="#292524"
                    glyphColor="#777169"
                    fontSize={13}
                    showTimer={true}
                    steps={steps}
                    collapsible={true}
                    working={true}
                    shimmer={true}
                />
            </div>
        </div>
    );
};

export default AgentLoader;
