import { getModel } from "../config/llmModels";
import { AgentStateType } from "../graph/state";

export const codingAgent = async (state: AgentStateType) => {
    try {
        const intentLlm = getModel("intent");
        const llm = getModel("coding");

        const intentRes = await intentLlm.invoke(`
        You are an intent classifier.

        Return ONLY one of these values:
        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION

        User Request:
        ${state.prompt}
        `);

        const intent = typeof intentRes.content === "string" ? intentRes.content.trim() : "";

        if (intent === "CODE_GENERATION") {
            const prompt = `
            You are CortexAI Coding Agent.

            Generate the requested project.

            Default stack:
            - HTML
            - CSS
            - JavaScript

            Use React / Next.js / Vue ONLY if explicitly requested.

            Rules:
            - Responsive
            - Modern UI
            - CSS Variables
            - Flexbox/Grid
            - Smooth Scroll
            - Hover Effects
            - Beautiful spacing
            - Single page unless user asks otherwise.

            Images:
            always use real unsplash images and never use placeholder

            Return ONLY valid JSON.

            Schema:
            {
                "files": [
                    {
                        "name": "index.html",
                        "content": "..."
                    },
                    {
                        "name": "style.css",
                        "content": "..."
                    },
                    {
                        "name": "script.js",
                        "content": "..."
                    }
                ]
            }

            Rules:
            - Output must start with {
            - Output must end with }
            - No markdown
            - No explanation
            - No extra text
            - No \`\`\`
            - Never mention intent

            User Request:
            ${state.prompt}
            `;

            const res = await llm.invoke(prompt);
            const content = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
            const raw = content.replace(/```json|```/g, "").trim();

            let data: { files?: Array<{ name: string; content: string }> } = {};
            try {
                data = JSON.parse(raw);
            } catch (parseErr) {
                // Try finding first { and last }
                const firstBrace = raw.indexOf("{");
                const lastBrace = raw.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1) {
                    data = JSON.parse(raw.substring(firstBrace, lastBrace + 1));
                }
            }

            return {
                ...state,
                aiResponse: "Code Generated Successfully",
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        title: state.prompt,
                        files: data.files || [],
                    },
                ],
            };
        }

        const res = await llm.invoke(`
        The user's request is:
        ${intent}

        Return Markdown only.
        Never generate project files.

        Use headings like:
        # Overview
        ## Explanation
        ## Problems
        ## Improvements
        ## Best Practices
        ## Optimized Code (if needed)

        User Request:
        ${state.prompt}
        `);

        const data = typeof res.content === "string" ? res.content : JSON.stringify(res.content);

        return {
            ...state,
            aiResponse: data,
            artifacts: [],
        };
    } catch (error) {
        console.error("Coding agent error:", error);
        return {
            ...state,
            aiResponse: "Failed to process coding request. Please try again.",
            artifacts: [],
        };
    }
};

