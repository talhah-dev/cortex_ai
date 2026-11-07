import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export interface MessageItem {
    _id?: string;
    role: "user" | "assistant";
    content: string;
    images?: string[];
    artifacts?: ArtifactItem[];
    createdAt?: string;
}

interface MessageState {
    messages: MessageItem[];
    artifacts: ArtifactItem[];
    isLoading: boolean;
    loadingAgent: string;
}

const initialState: MessageState = {
    messages: [],
    artifacts: [],
    isLoading: false,
    loadingAgent: "auto",
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<MessageItem[]>) => {
            state.messages = action.payload || [];
        },
        addMessages: (state, action: PayloadAction<MessageItem>) => {
            state.messages.push(action.payload);
        },
        setArtifacts: (state, action: PayloadAction<ArtifactItem[]>) => {
            state.artifacts = action.payload || [];
        },
        setLoading: (
            state,
            action: PayloadAction<{ isLoading: boolean; agent?: string }>
        ) => {
            state.isLoading = action.payload.isLoading;
            state.loadingAgent = action.payload.agent || "auto";
        },
    },
});

export const { setMessages, addMessages, setArtifacts, setLoading } = messageSlice.actions;
export default messageSlice.reducer;

