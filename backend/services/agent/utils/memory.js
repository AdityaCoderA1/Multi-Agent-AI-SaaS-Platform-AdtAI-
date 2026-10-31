import redis from "../../../shared/redis/redis.js";
import { getConversationHistory } from "./getConv.js";

export const getMemory = async (conversationId, userId, leafId) => {
  // We no longer cache the linear history in Redis because it's branch-dependent.
  // Instead, we fetch all messages for the conversation and traverse the tree.
  const allMessages = await getConversationHistory(conversationId, userId);
  
  if (!allMessages || allMessages.length === 0 || !leafId) {
    return [];
  }

  // Create a map for fast lookup
  const messageMap = new Map();
  allMessages.forEach(msg => messageMap.set(msg._id.toString(), msg));

  // Build the branch upwards
  const branch = [];
  let currentId = leafId;
  
  while (currentId && messageMap.has(currentId.toString())) {
    const msg = messageMap.get(currentId.toString());
    branch.unshift({ role: msg.role, content: msg.content });
    currentId = msg.parentId;
  }

  // If the last message is a user message, it means it's the message we are currently regenerating.
  // Since LangGraph injects state.prompt as the HumanMessage, we must exclude this user message from history.
  if (branch.length > 0 && branch[branch.length - 1].role === "user") {
    branch.pop();
  }

  // Enforce context window using fast token approximation (1 token ≈ 4 chars)
  const TOKEN_LIMIT = 6000;
  let currentTokens = 0;
  const optimizedBranch = [];

  // Iterate from newest to oldest
  for (let i = branch.length - 1; i >= 0; i--) {
    const msg = branch[i];
    const estimatedTokens = Math.ceil((msg.content?.length || 0) / 4);
    
    if (currentTokens + estimatedTokens > TOKEN_LIMIT) {
      break; // Stop including older messages
    }
    
    currentTokens += estimatedTokens;
    optimizedBranch.unshift(msg); // Prepend to maintain chronological order
  }

  return optimizedBranch;
};