import { SearchTool } from "../config/tavily";
import { AgentStateType } from "../graph/state";

export const searchAgent = async (state: AgentStateType) => {
    try {
        const results = await SearchTool.invoke({
            query: state.prompt,
        });

        const parsedResults = typeof results === "string" ? JSON.parse(results) : results;

        return {
            ...state,
            searchResults: parsedResults,
            images: parsedResults?.images || [],
        };
    } catch (error) {
        console.error("Search agent error:", error);
        return {
            ...state,
            searchResults: [],
            images: [],
        };
    }
};

