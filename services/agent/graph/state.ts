import { Annotation } from "@langchain/langgraph";

export interface ArtifactFile {
    name: string;
    content: string;
}

export interface ArtifactItem {
    id: number;
    type: string;
    title: string;
    files: ArtifactFile[];
}

export const agentState = Annotation.Root({
    prompt: Annotation<string>(),
    aiResponse: Annotation<string>(),
    agent: Annotation<string>(),
    conversationId: Annotation<string>(),
    searchResults: Annotation<any>(),
    images: Annotation<string[]>(),
    artifacts: Annotation<ArtifactItem[]>(),
});

export type AgentStateType = typeof agentState.State;

