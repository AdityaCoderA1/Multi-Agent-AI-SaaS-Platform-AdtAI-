import axios from "axios";
import { getModel } from "../utils/model.js";

import { getDownloadUrl } from "../utils/getDownloadUrl.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const imageAgent = async (state) => {

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
      getModel("image");

    const promptResponse =
      await llm.invoke(`

You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:

${state.prompt}

`);

    const enhancedPrompt =
      promptResponse.content.trim();

    let buffer;
    const promptsToTry = [enhancedPrompt, state.prompt, "A creative stunning visualization", "An abstract colorful image"];
    for (const p of promptsToTry) {
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}`;
        console.log("Trying Pollinations with:", imageUrl);
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
        if (imageResponse.status === 200) {
          buffer = Buffer.from(imageResponse.data, 'binary');
          break;
        }
      } catch (e) {
        console.log("Failed to fetch image for prompt:", p, e.message);
      }
    }

    if (!buffer) {
      throw new Error("All image generation attempts failed due to API instability.");
    }

    const fileName = `image-${Date.now()}.jpg`;
    await uploadToS3(buffer, fileName, "image/jpeg");
    const downloadUrl = await getDownloadUrl(fileName, 24 * 60 * 60);

    return {
      ...state,
      response: `![Generated Image](${downloadUrl})`
    };

  } catch (error) {

    console.log(
      "Image Agent Error:",
      error
    );

    return {

      ...state,

      response:
        "❌ Failed to generate image."

    };

  }

};