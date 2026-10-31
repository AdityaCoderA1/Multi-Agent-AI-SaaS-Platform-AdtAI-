import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import { getModel } from "../utils/model.js";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getMemory } from "../utils/memory.js";

export const codingAgent = async (state) => {

    await checkAgentLimit(
        state.userId,
        "coding"
    );
    await deductCredits(

        state.userId,

        "coding"

    );

    function cleanCode(code = "") {
        return code
            .replace(/```[\w-]*\n?/g, "")
            .replace(/```/g, "")
            .trim();
    }

    const llm = getModel("coding", state.model);
    const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);

    const messages = [
        new SystemMessage(`You are adtAI Coding Agent, a highly skilled software engineer created by Aditya.

${state.customInstructions ? `=========================\nCUSTOM USER INSTRUCTIONS (CRITICAL)\n=========================\nThe user has provided the following custom instructions that MUST be strictly followed:\n${state.customInstructions}\n=========================\n` : ""}

CRITICAL BEHAVIORAL RULES:
1. DO NOT output your internal thought process, reasoning, or "Classification: XYZ" to the user. Just provide the final answer naturally.
2. If the user asks a general conversational question (e.g. "can you help me?"), just converse naturally! Don't arbitrarily write code unless asked.

PROJECT GENERATION VS SNIPPET GENERATION:
If the user explicitly asks to BUILD a full website, app, or UI (e.g. "build a portfolio website", "create a visualizer"):
- Use HTML, CSS, JavaScript (No frameworks unless explicitly requested).
- You MUST return the project using the EXACT following format and NOTHING ELSE. No markdown, no explanations.
FILE: index.html
[html code here]
FILE: style.css
[css code here]
FILE: script.js
[javascript code here]

If the user asks for a simple snippet, an algorithm, debugging, or explanation (e.g. "give me binary search", "fix this bug"):
- DO NOT generate a complete project.
- DO NOT use the "FILE:" syntax.
- Return ONLY plain Markdown with standard markdown code blocks (\`\`\`language).
- Provide a brief explanation before or after the code block.

Maximum ~4000 output tokens. Prefer concise but beautiful and functional code.`)
    ];

    history.forEach((msg) => {
        if (msg.role === "user") messages.push(new HumanMessage(msg.content));
        if (msg.role === "assistant") messages.push(new AIMessage(msg.content));
    });

    messages.push(new HumanMessage(state.prompt));

    const response = await llm.invoke(messages);

    const content =
        response.content?.trim();
    console.log(content)
    const files = [];

    const matches = [
        ...content.matchAll(
            /FILE:\s*([^\n]+)\n([\s\S]*?)(?=\nFILE:\s*[^\n]+\n|$)/g
        )
    ];

    if (matches.length) {

        matches.forEach(match => {

            files.push({
                name: match[1].trim(),
                content: cleanCode(match[2]),
            });

        });

    } else {

        let fileName = "main.js";

        const prompt =
            state.prompt.toLowerCase();

        if (prompt.includes("html")) {
            fileName = "index.html";
        }
        else if (prompt.includes("css")) {
            fileName = "style.css";
        }
        else if (prompt.includes("python")) {
            fileName = "main.py";
        }
        else if (prompt.includes("java")) {
            fileName = "Main.java";
        }
        else if (prompt.includes("c++")) {
            fileName = "main.cpp";
        }





    }


    if (!content.includes("FILE:")) {
        return {
            ...state,
            response: content,
            artifacts: []
        };
    }

    return {

        ...state,

        response:
            "Code generated successfully.",

        artifacts: [
            {
                id: Date.now(),
                type: "project",
                title: state.prompt,
                files,
                createdAt:
                    new Date().toISOString()
            }
        ]

    };

};