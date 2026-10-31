import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import { searchTool } from "../utils/tavily.js";
import { getMemory } from "../utils/memory.js";
import { getModel } from "../utils/model.js";
import { getSearchCache, setSearchCache } from "../utils/searchCache.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");
    await deductCredits(state.userId, "search");

    if (state.requiresFreshSearch === false) {
      const cachedResults = await getSearchCache(state.conversationId);
      if (cachedResults) {
        return { ...state, searchResults: cachedResults };
      }
    }

    const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);
    const recentHistory = history.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n");

    const llm = getModel("search");
    const rephrasedQueryRes = await llm.invoke(`
You are an expert search query generator.
Rewrite the user's latest query into a clear, standalone search engine query.
Return ONLY the rewritten query.
Recent Conversation:
${recentHistory}
User's Latest Query:
${state.prompt}
`);

    const searchQuery = rephrasedQueryRes.content.trim();
    const searchResults = await searchTool.invoke({ query: searchQuery });
    await setSearchCache(state.conversationId, searchResults);

    return { ...state, searchResults };
  } catch (error) {
    console.log("Search Agent Error:", error);
    return { ...state, searchResults: [] };
  }
};