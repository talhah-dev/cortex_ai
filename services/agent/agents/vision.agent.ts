import { getModel } from "../config/llmModels";
import axios from "axios";
import { uploadToS3, getFromS3 } from "../utils/s3";
import { AgentStateType } from "../graph/state";

export const visionAgent = async (state: AgentStateType) => {
    try {
        const llm = getModel("image");
        const res = await llm.invoke(`
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

        const prompt = typeof res.content === "string" ? res.content.trim() : "";
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
        });

        const buffer = Buffer.from(imageRes.data);
        const filename = `image-${Date.now()}.png`;

        await uploadToS3(filename, buffer, "image/png");
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

        return {
            ...state,
            aiResponse: `🖼️ **Image Generated Successfully**\n\n📥 [Download Image](${downloadUrl})\n\n⏳ _Link expires in 24 hours._`,
            images: [downloadUrl],
        };
    } catch (error) {
        console.error("Vision agent error:", error);
        return {
            ...state,
            aiResponse: "Failed to generate image. Please try again.",
        };
    }
};

