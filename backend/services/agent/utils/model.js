import { ChatGoogleGenerativeAI }
  from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq"
import dotenv from "dotenv"
dotenv.config()
import { ChatOpenRouter } from "@langchain/openrouter";

const openRouter = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens:2500
  // other params...
});


export const gemini =
  new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY
  });

const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  // other params...
})


const openRouterWithFallback = openRouter.withFallbacks({ fallbacks: [groq, gemini] });
const groqWithFallback = groq.withFallbacks({ fallbacks: [gemini, openRouter] });
const geminiWithFallback = gemini.withFallbacks({ fallbacks: [groq, openRouter] });

export const getModel =
  (agent, requestedModel = "auto") => {
    if (requestedModel === "gemini") return geminiWithFallback;
    if (requestedModel === "deepseek") return openRouterWithFallback;
    if (requestedModel === "llama") return groqWithFallback;

    switch (agent) {
      case "coding":
        return openRouterWithFallback;
      case "image":
      case "search":
      case "chat":
      case "pdf":
      case "ppt":
        return groqWithFallback;
      case "vision":
        return geminiWithFallback;
      default:
        return groqWithFallback;
    }
  }