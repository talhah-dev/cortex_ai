import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

let groqInstance: ChatGroq | null = null;
let geminiInstance: ChatGoogleGenerativeAI | null = null;
let openrouterInstance: ChatOpenRouter | null = null;

export const getGroqModel = () => {
    if (!groqInstance) {
        groqInstance = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "openai/gpt-oss-120b",
        });
    }
    return groqInstance;
};

export const getGeminiModel = () => {
    if (!geminiInstance) {
        geminiInstance = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-2.5-flash",
        });
    }
    return geminiInstance;
};

export const getOpenRouterModel = () => {
    if (!openrouterInstance) {
        openrouterInstance = new ChatOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
            model: "deepseek/deepseek-chat",
            temperature: 0,
            maxTokens: 2500,
        });
    }
    return openrouterInstance;
};

export const getModel = (agentType: string) => {
    switch (agentType) {
        case "chat":
        case "router":
        case "intent":
        case "image":
        case "pdf":
        case "ppt":
            return getGroqModel();

        case "search":
            return getGroqModel();

        case "coding":
            return getOpenRouterModel();

        case "gemini":
            return getGeminiModel();

        default:
            return getGroqModel();
    }
};

