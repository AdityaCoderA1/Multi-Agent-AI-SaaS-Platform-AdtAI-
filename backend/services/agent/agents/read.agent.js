import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getMemory } from "../utils/memory.js";
import { getModel } from "../utils/model.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import axios from "axios";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

export const readAgent = async (state) => {
  await checkAgentLimit(state.userId, "read");
  await deductCredits(state.userId, "read");

  const llm = getModel("chat", state.model); // Use standard chat model
  const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);

  // Extract URLs from the prompt
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = state.prompt.match(urlRegex) || [];
  
  let scrapedContext = "";

  if (urls.length > 0) {
    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) adtAI Bot",
          }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Remove unnecessary clutter
        $("script, style, nav, footer, header, aside, iframe, noscript, svg, [role='navigation']").remove();
        
        const cleanHtml = $("body").html() || "";
        
        // Convert to Markdown
        const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
        const markdown = turndownService.turndown(cleanHtml);
        
        scrapedContext += `\n\n--- Content from ${url} ---\n\n${markdown}\n`;
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        scrapedContext += `\n\n--- Failed to read ${url}: ${error.message} ---\n`;
      }
    }
  }

  const systemPrompt = `You are adtAI, an intelligent AI assistant created by Aditya.
Current Date: ${new Date().toLocaleDateString('en-GB')}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

${state.customInstructions ? `Custom User Instructions:\n${state.customInstructions}\n` : ""}

${scrapedContext ? `The user requested you to read the following web content:\n${scrapedContext}\n\nAnswer the user's questions comprehensively based on the above scraped web content. Be concise and format your response beautifully with Markdown.` : "The user invoked the web reader agent but no URLs were provided. Politely ask them to provide a valid URL."}
`;

  const messages = [new SystemMessage(systemPrompt)];

  history.forEach((msg) => {
    if (msg.role === "user") messages.push(new HumanMessage(msg.content));
    if (msg.role === "assistant") messages.push(new AIMessage(msg.content));
  });

  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);

  return {
    ...state,
    response: response.content,
    images: []
  };
};
