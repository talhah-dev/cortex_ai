import { getModel } from "../config/llmModels";
import { generatePpt } from "../utils/generatePpt";
import { getFromS3, uploadToS3 } from "../utils/s3";
import { AgentStateType } from "../graph/state";

export const pptAgent = async (state: AgentStateType) => {
    try {
        const llm = getModel("ppt");
        const prompt = `
        You are a professional presentation designer.

        Return ONLY valid JSON.

        Format:
        {
            "title": "",
            "subtitle": "",
            "slides": [
                {
                    "title": "",
                    "points": [
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            ]
        }

        Rules:
        - Generate exactly 6 content slides.
        - Each slide should have 4-6 concise bullet points.
        - No markdown.
        - No explanation.
        - No code block.
        - Return ONLY JSON.

        Topic:
        ${state.prompt}
        `;

        const res = await llm.invoke(prompt);
        const content = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
        const raw = content
            .replace(/```json|```/g, "")
            .replace(/\*\*/g, "")
            .trim();

        const data = JSON.parse(raw);
        const ppt = await generatePpt(data);

        const buffer = (await ppt.write({
            outputType: "nodebuffer",
        })) as Buffer;

        const filename = `ppt-${Date.now()}.pptx`;

        await uploadToS3(
            filename,
            buffer,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

        return {
            ...state,
            aiResponse: `📊 **Presentation Generated Successfully**\n\n**${data.title}**\n\n[PPT_DOWNLOAD](${downloadUrl})\n\n⏳ _Link expires in 24 hours — download now!_`,
        };
    } catch (error) {
        console.error("PPT agent error:", error);
        return {
            ...state,
            aiResponse: "Failed to generate PPT. Please try again.",
        };
    }
};

