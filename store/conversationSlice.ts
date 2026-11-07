import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConversationItem {
    _id: string;
    title: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ConversationState {
    conversations: ConversationItem[];
    selectedConversation: ConversationItem | null;
}

const initialState: ConversationState = {
    conversations: [],
    selectedConversation: null,
};

const conversationSlice = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        setConversation: (state, action: PayloadAction<ConversationItem[]>) => {
            state.conversations = action.payload || [];
        },
        addConversation: (state, action: PayloadAction<ConversationItem>) => {
            if (action.payload) {
                state.conversations.unshift(action.payload);
            }
        },
        setSelectConversation: (state, action: PayloadAction<ConversationItem | null>) => {
            state.selectedConversation = action.payload;
        },
        setConvTitle: (
            state,
            action: PayloadAction<{ conversationId: string; title: string }>
        ) => {
            const { title, conversationId } = action.payload;
            state.conversations = state.conversations.map((conv) =>
                conv._id === conversationId ? { ...conv, title } : conv
            );

            if (state.selectedConversation?._id === conversationId) {
                state.selectedConversation = { ...state.selectedConversation, title };
            }
        },
        removeConversation: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            state.conversations = state.conversations.filter(
                (conv) => conv._id !== conversationId
            );
            if (state.selectedConversation?._id === conversationId) {
                state.selectedConversation = state.conversations[0] || null;
            }
        },
    },
});

export const {
    setConversation,
    addConversation,
    setSelectConversation,
    setConvTitle,
    removeConversation,
} = conversationSlice.actions;
export default conversationSlice.reducer;

