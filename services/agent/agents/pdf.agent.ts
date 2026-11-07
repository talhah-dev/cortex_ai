import { getModel } from "../config/llmModels";
import { generatePdf } from "../utils/generatePdf";
import { getFromS3, uploadToS3 } from "../utils/s3";
import { AgentStateType } from "../graph/state";

export const pdfAgent = async (state: AgentStateType) => {
    try {
        const llm = getModel("pdf");

        const prompt = `
        Do NOT return markdown.
        Do NOT return explanations.

        Structure:
        {
            "title": "",
            "subtitle": "",
            "sections": [
                {
                    "heading": "",
                    "points": []
                }
            ]
        }

        Generate 4-8 sections.
        Each section should have 3-6 concise bullet points.

        Topic:
        ${state.prompt}
        `;

        const res = await llm.invoke(prompt);
        const content = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
        const cleanJson = content.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);

        const pdfBuffer = await generatePdf(data);
        const filename = `pdf-${Date.now()}.pdf`;

        await uploadToS3(filename, pdfBuffer, "application/pdf");
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

        return {
            ...state,
            aiResponse: `📄 **PDF Generated Successfully**\n\n**${data.title}**\n\n[PDF_DOWNLOAD](${downloadUrl})\n\n⏳ _Link expires in 24 hours — download now!_`,
        };
    } catch (error) {
        console.error("PDF agent error:", error);
        return {
            ...state,
            aiResponse: "Failed to generate PDF. Please try again.",
        };
    }
};

