import { getModel } from "../utils/model.js";

export const evaluatorNode = async (state) => {
  const MAX_RETRIES = 2;

  // If we already hit max retries, just accept it and move on
  if (state.retryCount >= MAX_RETRIES) {
    return state;
  }

  const response = state.response || "";

  // Bypass evaluation for coding/image agents as code blocks/urls often trigger false positives
  if (state.agent === "coding" || state.agent === "image") {
    return { ...state, lastError: null };
  }

  // Basic Heuristics
  if (!response || response.trim().length < 5) {
    return {
      ...state,
      retryCount: (state.retryCount || 0) + 1,
      lastError: "The previous response was empty or too short. Please provide a detailed response."
    };
  }

  // LLM-based evaluation
  const llm = getModel("router"); // Use the faster router model for evaluation
  const prompt = state.prompt;

  try {
    const evalResult = await llm.invoke(`
You are an expert quality assurance evaluator for an AI agent system.
Your job is to determine if the agent's response to the user's prompt is "garbage" or acceptable.
"Garbage" means:
- It completely hallucinates a totally unrelated topic.
- It is obvious gibberish or broken formatting (e.g., unresolved variables).
- It failed to generate a meaningful response when it clearly should have.

Note: A refusal to answer due to safety or lack of knowledge (e.g., "I don't know") is ACCEPTABLE and NOT garbage. 

User Prompt: "${prompt}"
Agent Response: "${response}"

Return ONLY a JSON object matching this structure EXACTLY:
{
  "is_garbage": boolean,
  "reason": "short explanation if garbage, else empty"
}
`);

    let parsed = { is_garbage: false, reason: "" };
    const rawContent = evalResult.content.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(rawContent);

    if (parsed.is_garbage) {
      console.log(`Evaluator flagged response as garbage: ${parsed.reason}`);
      return {
        ...state,
        retryCount: (state.retryCount || 0) + 1,
        lastError: `Your previous response was rejected by the evaluator. Reason: ${parsed.reason}. Please generate a better response.`
      };
    }

  } catch (e) {
    console.error("Evaluator JSON parsing failed:", e.message);
    // If the evaluator itself fails, we default to accepting the response to prevent infinite loops
  }

  // Clear any past errors if we passed
  return { ...state, lastError: null };
};
