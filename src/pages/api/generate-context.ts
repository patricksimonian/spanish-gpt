import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { english, spanish } = req.body as { english: string; spanish: string };

    if (!english || !spanish) {
        return res.status(400).json({ message: "Missing english or spanish term" });
    }

    try {
        const prompt = `Generate a simple, short Spanish sentence using the word "${spanish}" (which means "${english}") and provide its English translation. Format: "Spanish sentence. (English translation)". Keep it simple for a learner.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        return res.status(200).json({ context: text });
    } catch (error) {
        console.error("Error generating context:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
