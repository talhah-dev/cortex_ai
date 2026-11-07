import api from "./api";

export interface SendMessagePayload {
    prompt: string;
    conversationId: string;
    agent: string;
}

export const createConversation = async () => {
    try {
        const { data } = await api.get("/api/chat/create-conversation");
        return data;
    } catch (error) {
        console.error("Create conversation failed:", error);
        return null;
    }
};

export const getConversations = async () => {
    try {
        const { data } = await api.get("/api/chat/get-conversations");
        return data || [];
    } catch (error) {
        console.error("Get conversations failed:", error);
        return [];
    }
};

export const updateConversation = async (payload: { id: string; title: string }) => {
    try {
        const { data } = await api.post("/api/chat/update-conversation", payload);
        return data;
    } catch (error) {
        console.error("Update conversation failed:", error);
        return null;
    }
};

export const deleteConversation = async (id: string) => {
    try {
        const { data } = await api.post("/api/chat/delete-conversation", { id });
        return data;
    } catch (error) {
        console.error("Delete conversation failed:", error);
        return null;
    }
};

export const getMessages = async (id: string) => {
    try {
        const { data } = await api.get(`/api/chat/get-message/${id}`);
        return data || [];
    } catch (error) {
        console.error("Get messages failed:", error);
        return [];
    }
};

export const sendMessage = async (payload: SendMessagePayload) => {
    try {
        const { data } = await api.post("/api/agent/chat", payload);
        return data;
    } catch (error) {
        console.error("Send message failed:", error);
        return null;
    }
};

export default {
    createConversation,
    getConversations,
    updateConversation,
    getMessages,
    sendMessage,
};

