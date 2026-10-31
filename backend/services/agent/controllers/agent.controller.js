import redis from "../../../shared/redis/redis.js";
import { graph } from "../graph/supervisor.graph.js";
import { getModel } from "../utils/model.js";
import axios from "axios";


export const chat = async (
  req,
  res,
  next
) => {
  try {
    const {
      prompt,
      conversationId,
      agent,
      model,
      parentId,
      isRegenerate
    } = req.body;

    const userId = req.headers["x-user-id"];
    console.log("Agent Chat Request:", { prompt, agent, model, conversationId, userId });
    if (req.files) console.log("Files:", req.files.length);

    let userMessageId = parentId;

    if (isRegenerate !== "true" && isRegenerate !== true) {

      // Save user message to chat service (Fire-and-forget or await)
      const userMsgRes = await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
        conversationId,
        role: "user",
        content: prompt,
        parentId: parentId || null
      }, {
        headers: { "x-user-id": userId }
      });

      userMessageId = userMsgRes.data?._id;
    }

    // 1. Setup SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const serverMessageId = "temp-" + Date.now();
    res.write(`data: ${JSON.stringify({ type: "start", messageId: serverMessageId })}\n\n`);

    // 2. Handle Abort Controller (Stop Generation)
    const controller = new AbortController();
    req.on("close", () => {
      controller.abort();
    });

    // 3. Invoke LangGraph with streamEvents
    const customInstructionsHeader = req.headers["x-user-custom-instructions"];
    const customInstructions = customInstructionsHeader ? Buffer.from(customInstructionsHeader, "base64").toString("utf-8") : "";

    const stream = await graph.streamEvents(
      {
        prompt,
        conversationId,
        agent,
        userId,
        files: req.files || [],
        model: model || null,
        parentMessageId: isRegenerate ? userMessageId : (parentId || null),
        customInstructions
      },
      { version: "v2", signal: controller.signal }
    );

    let finalState = {};

    for await (const event of stream) {
      // 4. Stream tokens for valid agents (chat, coding, search)
      if (
        event.event === "on_chat_model_stream" &&
        (event.metadata?.langgraph_node === "chat" ||
          event.metadata?.langgraph_node === "coding" ||
          event.metadata?.langgraph_node === "search" ||
          event.metadata?.langgraph_node === "pdf_rag")
      ) {
        const chunk = event.data?.chunk?.content;
        if (chunk) {
          res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
        }
      }

      // 5. Capture final output of the entire graph
      if (event.event === "on_chain_end") {
        if (event.data?.output && typeof event.data.output === "object" && event.data.output.response) {
          finalState = event.data.output;
        }
      }
    }

    if (!finalState.response) {
      throw new Error("No response generated from the agent graph.");
    }

    // Auto-extract markdown code blocks into artifacts if none exist (to show in the right window)
    if ((!finalState.artifacts || finalState.artifacts.length === 0) && finalState.response) {
      const blockMatches = [...finalState.response.matchAll(/```(\w+)?\n([\s\S]*?)```/g)];
      if (blockMatches.length > 0) {
        const parsedFiles = [];
        blockMatches.forEach((match, index) => {
          const codeContent = match[2].trim();
          // Only extract if it's a multi-line code block (at least 3 lines) to avoid tiny snippets opening the panel
          if (codeContent.split('\\n').length >= 3) {
            const lang = (match[1] || "text").toLowerCase();
            let ext = lang;
            if (lang === "javascript" || lang === "js" || lang === "jsx") ext = "js";
            else if (lang === "python" || lang === "py") ext = "py";
            else if (lang === "html") ext = "html";
            else if (lang === "css") ext = "css";
            else if (lang === "json") ext = "json";
            else if (lang === "typescript" || lang === "ts" || lang === "tsx") ext = "ts";
            
            parsedFiles.push({
              name: `snippet_${parsedFiles.length + 1}.${ext}`,
              content: codeContent
            });
          }
        });

        if (parsedFiles.length > 0) {
          finalState.artifacts = [{
            id: Date.now().toString(),
            type: "code",
            title: "Code Snippet",
            files: parsedFiles,
            createdAt: new Date().toISOString()
          }];
          
          // Optionally strip the code blocks from the chat response so it's strictly in the artifact panel
          finalState.response = finalState.response.replace(/```(\w+)?\n([\s\S]*?)```/g, '*Code generated in the Artifact panel on the right.*').trim();
        }
      }
    }

    // 6. Save final assistant message to Chat Service
    const saveResponse = await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: finalState.response,
      images: finalState.images || [],
      artifacts: finalState.artifacts || [],
      parentId: userMessageId
    }, {
      headers: { "x-user-id": userId }
    });

    // Extract the actual MongoDB _id
    const savedMessageId = saveResponse.data?._id || serverMessageId;

    // 7. Emit DONE event with the final data
    res.write(`data: ${JSON.stringify({
      type: "done",
      messageId: savedMessageId,
      userMessageId: userMessageId,
      images: finalState.images || [],
      artifacts: finalState.artifacts || [],
      finalContent: finalState.response
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error("Chat Error:", error.response?.data || error.message);
    if (!res.headersSent) {
      res.status(500).json({
        message: error.response?.data?.message || error.message || "An error occurred during generation."
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message || "An error occurred during generation." })}\n\n`);
      res.end();
    }
  }
};

export const generateTitle = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ title: "New Chat" });

    const llm = getModel("chat");
    const response = await llm.invoke(`Generate a very concise, 3 to 5 word title for a conversation that starts with this message: "${prompt}". Do not use quotes, punctuation, or any prefix like "Title:".`);

    let title = response.content.trim();
    title = title.replace(/^["']|["']$/g, '');

    res.json({ title });
  } catch (error) {
    res.status(500).json({ title: "New Chat" });
  }
};