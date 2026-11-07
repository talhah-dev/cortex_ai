import { getModel } from "../config/llmModels";
import { AgentStateType } from "./state";

export const router = async (state: AgentStateType) => {
    if (state.agent && state.agent !== "auto") {
        return {
            ...state,
            agent: state.agent,
        };
    }

    const llm = getModel("router");
    const prompt = `
    You are an agent router.

    Available agents:
    - chat
    - search
    - coding
    - pdf
    - ppt
    - vision

    Rules:
    chat:
    General conversation, explanations, learning, questions.

    search:
    Current events, latest information, news, recent developments, internet lookup.

    coding:
    Generate code, debug code, build projects, architecture, API design.

    pdf:
    Questions about generating PDFs, document summaries, or PDF context.

    ppt:
    Questions about generating PPTs, presentation slides, or pitch decks.

    vision:
    Generate image, Create image, picture, photo, visual illustration.

    Return ONLY one word:
    chat
    search
    coding
    pdf
    ppt
    vision

    User Query:
    ${state.prompt}
    `;

    try {
        const response = await llm.invoke(prompt);
        const agentName = (typeof response.content === "string" ? response.content : "")
            .trim()
            .toLowerCase();

        return {
            ...state,
            agent: agentName,
        };
    } catch (err) {
        console.error("Router error:", err);
        return {
            ...state,
            agent: "chat",
        };
    }
};

