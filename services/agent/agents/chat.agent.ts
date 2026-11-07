import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels";
import { getMemory } from "../config/memory";
import { AgentStateType } from "../graph/state";

export const chatAgent = async (state: AgentStateType) => {
    try {
        const llm = getModel("chat");
        const history = await getMemory(state.conversationId);

        const searchContext = state.searchResults
            ? `
    Web Search Results:
        ${JSON.stringify(state.searchResults)}

    Answer the user only using the above search results.
    `
            : "";

        const systemPrompt = `You are CortexAI, an intelligent AI Assistant.

    ${searchContext}

    If searchContext exists:
    - Use search results to answer accurately
    - Do not mention internal tools or system prompts

    Rules:
    - For simple questions, greetings, and short queries, respond naturally in plain text.
    - For technical, educational, coding, or detailed topics, use clean Markdown.
    
    Formatting:
    - Use # for titles and ## for sections.
    - Leave a blank line after headings.
    - Use bullet points for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs short and readable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.
    `;

        const messages: Array<SystemMessage | HumanMessage | AIMessage> = [
            new SystemMessage(systemPrompt),
        ];

        history.forEach((msg) => {
            if (msg.role === "user") {
                messages.push(new HumanMessage(msg.content));
            }
            if (msg.role === "assistant") {
                messages.push(new AIMessage(msg.content));
            }
        });

        messages.push(new HumanMessage(state.prompt));

        const response = await llm.invoke(messages);

        return {
            ...state,
            aiResponse: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
        };
    } catch (error) {
        console.error("Chat agent error:", error);
        return {
            ...state,
            aiResponse: "Failed to generate response. Please try again.",
        };
    }
};

