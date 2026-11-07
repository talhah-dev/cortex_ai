import { TavilySearch } from "@langchain/tavily";

let toolInstance: TavilySearch | null = null;

export const getSearchTool = () => {
    if (!toolInstance) {
        if (!process.env.TAVILY_API_KEY) {
            process.env.TAVILY_API_KEY = "tvly-placeholder-build";
        }
        toolInstance = new TavilySearch({
            maxResults: 5,
            topic: "general",
            includeImages: true,
        });
    }
    return toolInstance;
};

// Safe Proxy so that module evaluation during Next.js build never throws if TAVILY_API_KEY is not set
export const SearchTool = new Proxy({} as TavilySearch, {
    get(_target, prop) {
        const tool = getSearchTool();
        const val = (tool as any)[prop];
        return typeof val === "function" ? val.bind(tool) : val;
    },
});

export default SearchTool;
