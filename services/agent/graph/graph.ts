import { StateGraph, START, END } from "@langchain/langgraph";
import { agentState, AgentStateType } from "./state";
import { router } from "./router";
import { chatAgent } from "../agents/chat.agent";
import { codingAgent } from "../agents/coding.agent";
import { searchAgent } from "../agents/search.agent";
import { pdfAgent } from "../agents/pdf.agent";
import { pptAgent } from "../agents/ppt.agent";
import { visionAgent } from "../agents/vision.agent";

export const graph = new StateGraph(agentState)
    .addNode("router", router)
    .addNode("chat", chatAgent)
    .addNode("search", searchAgent)
    .addNode("coding", codingAgent)
    .addNode("pdf", pdfAgent)
    .addNode("ppt", pptAgent)
    .addNode("vision", visionAgent)
    .addEdge(START, "router")
    .addConditionalEdges(
        "router",
        (state: AgentStateType) => {
            switch (state.agent) {
                case "chat":
                    return "chat";
                case "search":
                    return "search";
                case "coding":
                    return "coding";
                case "pdf":
                    return "pdf";
                case "ppt":
                    return "ppt";
                case "vision":
                    return "vision";
                default:
                    return "chat";
            }
        },
        {
            chat: "chat",
            search: "search",
            coding: "coding",
            pdf: "pdf",
            ppt: "ppt",
            vision: "vision",
        }
    )
    .addEdge("search", "chat")
    .addEdge("chat", END)
    .addEdge("coding", END)
    .addEdge("pdf", END)
    .addEdge("ppt", END)
    .addEdge("vision", END)
    .compile();
