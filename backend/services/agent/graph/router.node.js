import { getModel } from "../utils/model.js";
import { getMemory } from "../utils/memory.js";

export const routerNode = async (state) => {

  if (state.agent && state.agent !== "auto") {
    return { ...state, agent: state.agent };
  }

  if (state.files && state.files.length > 0) {
    if (state.files.some(f => f.mimetype.startsWith("image/"))) {
      return { ...state, agent: "vision" };
    }
    if (state.files.some(f => f.mimetype === "application/pdf")) {
      return { ...state, agent: "pdf_rag" };
    }
  }

  const llm = getModel("router");
  const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);
  const recentHistory = history.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n");

  let parsed = null;
  let attempts = 0;
  let lastError = null;

  while (attempts < 3) {
    attempts++;
    try {
      const result = await llm.invoke(`
You are an agent router.
Available agents:
- chat
- search
- coding
- pdf
- ppt
- image 
- read

Return ONLY a valid JSON object matching this structure exactly (no markdown formatting, no backticks, just raw JSON):
{
  "agent": "chat|search|coding|pdf|ppt|image|vision|pdf_rag|read",
  "confidence": 0.9,
  "requires_fresh_search": true,
  "is_ambiguous": false,
  "clarification_message": ""
}

If the user provides a URL (http/https) and asks you to summarize, read, or analyze it, select the "read" agent.
If the user asks an ambiguous follow-up (e.g. "What was the score?" when previous context discussed both tennis and football), set "is_ambiguous" to true and provide a "clarification_message".
If the query relies on a previous web search that does not need updating (like asking for MVP of a historical game), set "requires_fresh_search" to false.

Recent Conversation History:
${recentHistory}

User's Latest Query:
${state.prompt}
${lastError ? `\nPREVIOUS ERROR: ${lastError}. PLEASE FIX YOUR OUTPUT.` : ''}
`);

      const rawContent = result.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(rawContent);
      break; // Success, exit retry loop
    } catch (e) {
      console.error(`Router JSON parsing failed on attempt ${attempts}:`, e.message);
      lastError = e.message;
    }
  }

  // Fallback if it still fails
  if (!parsed) {
    parsed = { agent: "chat", requires_fresh_search: true, is_ambiguous: false, clarification_message: "" };
  }

  if (parsed.is_ambiguous) {
    parsed.agent = "chat";
  }

  return {
    ...state,
    agent: parsed.agent.trim().toLowerCase(),
    requiresFreshSearch: parsed.requires_fresh_search,
    clarificationMessage: parsed.clarification_message
  };
};