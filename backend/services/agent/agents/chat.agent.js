import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getMemory } from "../utils/memory.js";
import { getModel } from "../utils/model.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const chatAgent = async (state) => {
  await checkAgentLimit(state.userId, "chat");
  await deductCredits(state.userId, "chat");

  if (state.clarificationMessage) {
    return {
      ...state,
      response: state.clarificationMessage,
      images: []
    };
  }

  const llm = getModel("chat", state.model);
  const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);

  const searchContext = state.searchResults ? `
Web Search Results:
${typeof state.searchResults === 'string' ? state.searchResults : JSON.stringify(state.searchResults, null, 2)}
Answer the user using only the above search results.
` : "";

  const messages = [
    new SystemMessage(`
You are adtAI, an intelligent AI assistant created by Aditya.
Current Date: ${new Date().toLocaleDateString('en-GB')}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

${state.customInstructions ? `Custom User Instructions:\n${state.customInstructions}\n` : ""}

${searchContext}
`)
  ];

  history.forEach((msg) => {
    if (msg.role === "user") messages.push(new HumanMessage(msg.content));
    if (msg.role === "assistant") messages.push(new AIMessage(msg.content));
  });

  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);

  return {
    ...state,
    response: response.content,
    images: state.searchResults?.images || []
  };
};