import fs from "fs/promises";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { getModel } from "../utils/model.js";

import { checkAgentLimit } from "../config/agentRateLimit.js";

import { deductCredits } from "../utils/deductCredits.js";

export const visionAgent = async (state) => {

  try {

    await checkAgentLimit(
      state.userId,
      "image"
    );

    await deductCredits(
      state.userId,
      "image"
    );

    const llm =
      getModel("vision");

    const contentArray = [
      {
        type: "text",
        text: state.prompt || "Describe these images."
      }
    ];

    if (state.files && state.files.length > 0) {
      for (const file of state.files) {
        const imageBuffer = await fs.readFile(file.path);
        const base64Image = imageBuffer.toString("base64");
        contentArray.push({
          type: "image_url",
          image_url: {
            url: `data:${file.mimetype};base64,${base64Image}`
          }
        });
      }
    }

    const messages = [

      new SystemMessage(`

You are adtAI Vision Agent, an intelligent AI assistant created by Aditya.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.

`),

      new HumanMessage({
        content: contentArray
      })

    ];

    const response =
      await llm.invoke(
        messages
      );

    return {

      ...state,

      response:
        response.content

    };

  }

  finally {

    if (state.files && state.files.length > 0) {
      for (const file of state.files) {
        try {
          await fs.unlink(file.path);
          console.log("Deleted:", file.path);
        } catch (err) {
          console.log(err.message);
        }
      }
    }

  }

};