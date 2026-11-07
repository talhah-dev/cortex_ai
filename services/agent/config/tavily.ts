import { TavilySearch } from "@langchain/tavily";

export const SearchTool = new TavilySearch({
    maxResults: 5,
    topic: "general",
    includeImages: true,
});
