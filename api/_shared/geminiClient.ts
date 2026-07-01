import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const systemInstruction = "You are the VitalCare Health Assistant. Your goal is to explain health concepts in simple, clear, and plain language suitable for people with little or no formal education. You must use warm, reassuring tones, keep sentences short and easy to understand, and never use dense medical jargon without explaining it simply first. CRITICAL: You are NOT a doctor and cannot diagnose illnesses or prescribe treatments. Always include a disclaimer that this is general information, not a medical diagnosis.";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set. AI features will use fallback responses.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function createChatContents(messages: any[]) {
  return messages.map((m: any) => {
    const parts: any[] = [{ text: m.content || "Analyze the attached file." }];
    if (m.attachment && m.attachment.mimeType && m.attachment.data) {
      parts.push({
        inlineData: {
          mimeType: m.attachment.mimeType,
          data: m.attachment.data,
        },
      });
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts,
    };
  });
}
