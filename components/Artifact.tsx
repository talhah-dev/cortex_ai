"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import {
    PiSidebarSimpleLight,
    PiCode,
    PiEye,
    PiCopy,
    PiCheck,
    PiFileHtml,
    PiFileCss,
    PiFileJs,
    PiFile,
} from "react-icons/pi";
import { RootState } from "@/store/store";

const Editor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center bg-[#fafafa] text-[#777169] text-xs">
            Loading code environment…
        </div>
    ),
});

const detectLanguage = (fileName = "") => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".html")) return "html";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".js") || name.endsWith(".jsx")) return "javascript";
    if (name.endsWith(".ts") || name.endsWith(".tsx")) return "typescript";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".py")) return "python";
    return "plaintext";
};

const getFileIcon = (fileName = "") => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".html")) return <PiFileHtml className="w-3.5 h-3.5" />;
    if (name.endsWith(".css")) return <PiFileCss className="w-3.5 h-3.5" />;
    if (name.endsWith(".js") || name.endsWith(".jsx"))
        return <PiFileJs className="w-3.5 h-3.5" />;
    return <PiFile className="w-3.5 h-3.5" />;
};

const Artifact: React.FC = () => {
    const { artifacts } = useSelector((state: RootState) => state.message);

    const [collapsed, setCollapsed] = useState(false);
    const [tab, setTab] = useState<"code" | "preview">("code");
    const [activeFile, setActiveFile] = useState(0);
    const [copied, setCopied] = useState(false);

    if (!artifacts || artifacts.length === 0) return null;

    const artifact = artifacts[0];
    const file = artifact?.files?.[activeFile];

    const htmlFile = artifact?.files?.find((f) => f.name === "index.html");
    const cssFile = artifact?.files?.find((f) => f.name === "style.css");
    const jsFile = artifact?.files?.find((f) => f.name === "script.js");

    const canPreview = Boolean(htmlFile);

    const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${cssFile?.content || ""}</style>
</head>
<body>
${htmlFile?.content || ""}
<script>${jsFile?.content || ""}<\/script>
</body>
</html>`;

    const handleCopy = () => {
        if (file?.content) {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (collapsed) {
        return (
            <div className="w-[48px] border-l border-[#e7e5e4] flex flex-col items-center py-4 gap-4 bg-[#f5f5f5] shrink-0">
                <button
                    onClick={() => setCollapsed(false)}
                    className="text-[#777169] hover:text-[#0c0a09] transition-colors cursor-pointer p-1 rounded hover:bg-[#ebe9e6]"
                    title="Expand Artifact panel"
                >
                    <PiSidebarSimpleLight className="w-4 h-4" />
                </button>
                <PiCode className="w-4 h-4 text-[#777169]" />
                <div
                    className="text-[#777169] text-xs mt-2 select-none font-medium"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                    {artifact?.title || "Artifact"}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[440px] lg:w-[500px] border-l border-[#e7e5e4] bg-[#ffffff] flex flex-col shrink-0 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7e5e4] bg-[#f5f5f5] shrink-0">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setCollapsed(true)}
                        className="text-[#777169] hover:text-[#0c0a09] transition-colors cursor-pointer p-1 rounded hover:bg-[#ebe9e6]"
                        title="Collapse panel"
                    >
                        <PiSidebarSimpleLight className="w-4 h-4" />
                    </button>
                    <PiCode className="w-4 h-4 text-[#292524]" />
                    <span className="text-[#0c0a09] text-sm font-medium truncate max-w-[220px]">
                        {artifact?.title || "Project Artifact"}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#d6d3d1] bg-[#ffffff] hover:border-[#292524] text-[#0c0a09] text-xs font-medium transition-colors cursor-pointer"
                    title="Copy active file content"
                >
                    {copied ? (
                        <>
                            <PiCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <PiCopy className="w-3.5 h-3.5 text-[#777169]" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code / Preview tab switcher */}
            {canPreview && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#e7e5e4] bg-[#ffffff] shrink-0">
                    <button
                        onClick={() => setTab("code")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            tab === "code"
                                ? "bg-[#292524] text-white shadow-sm"
                                : "bg-[#f5f5f5] text-[#777169] border border-[#e7e5e4] hover:text-[#0c0a09]"
                        }`}
                    >
                        <PiCode className="w-3.5 h-3.5" />
                        Code
                    </button>
                    <button
                        onClick={() => setTab("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            tab === "preview"
                                ? "bg-[#292524] text-white shadow-sm"
                                : "bg-[#f5f5f5] text-[#777169] border border-[#e7e5e4] hover:text-[#0c0a09]"
                        }`}
                    >
                        <PiEye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                </div>
            )}

            {/* File pills */}
            {tab === "code" && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#e7e5e4] bg-[#fafafa] overflow-x-auto shrink-0">
                    {artifact?.files?.map((f, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveFile(index)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer ${
                                activeFile === index
                                    ? "bg-[#ffffff] text-[#0c0a09] font-medium border border-[#d6d3d1] shadow-xs"
                                    : "text-[#777169] hover:text-[#0c0a09]"
                            }`}
                        >
                            {getFileIcon(f.name)}
                            {f.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Monaco / Preview iframe viewport */}
            <div className="flex-1 overflow-hidden bg-[#fafafa]">
                {tab === "preview" && canPreview ? (
                    <iframe
                        title="preview"
                        srcDoc={previewDoc}
                        sandbox="allow-scripts"
                        className="w-full h-full bg-white"
                    />
                ) : (
                    <Editor
                        height="100%"
                        theme="vs"
                        language={detectLanguage(file?.name)}
                        value={file?.content || ""}
                        options={{
                            readOnly: true,
                            wordWrap: "on",
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            padding: { top: 16 },
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Artifact;
