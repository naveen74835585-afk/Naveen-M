import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getKannadaSummary(bookTitle: string, author: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise, 2-3 sentence summary of the book "${bookTitle}" by ${author} in Kannada language. Format it nicely.`,
    });
    return response.text || "ಕನ್ನಡ ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ.";
  } catch (error) {
    console.error("Error fetching summary:", error);
    return "ಕನ್ನಡ ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.";
  }
}
