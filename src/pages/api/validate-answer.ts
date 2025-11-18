import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { question, answer } = req.body as { question: string; answer: string };

    if (!question || !answer) {
        return res.status(400).json({ message: "Missing question or answer" });
    }

    try {
        const prompt = `The user was asked this question in Spanish: "${question}".
        They answered: "${answer}".
        Is this a grammatically correct and relevant answer in Spanish?
        Respond ONLY with a JSON object in this format: { "valid": boolean, "feedback": "string explanation in English" }`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();

        // Clean up potential markdown code blocks
        const jsonStr = text.replace(/^```json\n|\n```$/g, "");

        const validationResult = JSON.parse(jsonStr) as { valid: boolean; feedback: string };

        return res.status(200).json(validationResult);
    } catch (error) {
        console.error("Error validating answer:", error);
        return res.status(500).json({ message: "Internal server error", valid: false, feedback: "Failed to validate." });
    }
}
