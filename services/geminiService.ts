
import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt: string, history: { role: 'user' | 'model', parts: string }[] = []) {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Gemini assistance is unavailable.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Gemini, the built-in AI assistant for the Nexus Messenger. You are helpful, concise, and professional. You acknowledge that you live within a browser-based local messenger.",
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong with the AI integration. Please try again later.";
  }
}
