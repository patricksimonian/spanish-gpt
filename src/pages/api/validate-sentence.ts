import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { targetWord, userSentence } = req.body as { targetWord: string; userSentence: string };

    if (!targetWord || !userSentence) {
        return res.status(400).json({ message: "Missing targetWord or userSentence" });
    }

    try {
        const prompt = `Analyze the following Spanish sentence: "${userSentence}". 
    Does it correctly use the word "${targetWord}" (or a valid conjugation/variation of it) AND is the sentence grammatically correct Spanish?
    Respond ONLY with a JSON object in this format: { "valid": boolean, "reason": "string explanation in English" }`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();

        // Clean up potential markdown code blocks if the model adds them
        const jsonStr = text.replace(/^```json\n|\n```$/g, "");

        const validationResult = JSON.parse(jsonStr) as { valid: boolean, reason: string };

        return res.status(200).json(validationResult);
    } catch (error) {
        console.error("Error validating sentence:", error);
        return res.status(500).json({ message: "Internal server error", valid: false, reason: "Failed to validate." });
    }
}
