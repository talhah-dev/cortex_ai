import api from "./api";

export const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me");
        return data || null;
    } catch {
        // Not logged in or session expired
        return null;
    }
};

export const loginWithFirebaseToken = async (token: string) => {
    try {
        const { data } = await api.post("/api/auth/login", { token });
        return data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const { data } = await api.get("/api/auth/logout");
        return data;
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export default {
    getCurrentUser,
    loginWithFirebaseToken,
    logout,
};
