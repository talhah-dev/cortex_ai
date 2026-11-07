// In-memory fallback repository when MongoDB is temporarily unreachable
export interface InMemoryConversation {
    _id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface InMemoryMessage {
    _id: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    images: string[];
    artifacts: any[];
    createdAt: string;
}

const conversations: InMemoryConversation[] = [];
const messages: InMemoryMessage[] = [];

export const inMemoryDB = {
    getConversations(userId: string) {
        return conversations
            .filter((c) => c.userId === userId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    createConversation(userId: string, title = "New Chat") {
        const conv: InMemoryConversation = {
            _id: "conv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
            title,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        conversations.unshift(conv);
        return conv;
    },

    updateConversation(id: string, title: string) {
        const conv = conversations.find((c) => c._id === id);
        if (conv) {
            conv.title = title;
            conv.updatedAt = new Date().toISOString();
        }
        return conv || { _id: id, title };
    },

    deleteConversation(id: string) {
        const index = conversations.findIndex((c) => c._id === id);
        if (index !== -1) {
            conversations.splice(index, 1);
        }
        return true;
    },

    getMessages(conversationId: string) {
        return messages.filter((m) => m.conversationId === conversationId);
    },

    saveMessage(data: {
        conversationId: string;
        role: "user" | "assistant";
        content: string;
        images?: string[];
        artifacts?: any[];
    }) {
        const msg: InMemoryMessage = {
            _id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
            conversationId: data.conversationId,
            role: data.role,
            content: data.content,
            images: data.images || [],
            artifacts: data.artifacts || [],
            createdAt: new Date().toISOString(),
        };
        messages.push(msg);
        return msg;
    },
};

