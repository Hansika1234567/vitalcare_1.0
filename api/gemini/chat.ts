import { getGeminiClient, createChatContents, systemInstruction } from "../_shared/geminiClient";

const defaultFallback = "I am VitalCare's AI Companion. I'm currently running in demo mode, but I can tell you that keeping a steady heart rate and staying hydrated is great for your overall health! Always consult a professional doctor for medical issues.";

function generateFallbackText(lastUserMsg: string) {
  let fallbackText = "I am VitalCare's AI Companion. The assistant is currently in light offline mode, but remember: drinking water, eating fresh vegetables, and getting daily rest is excellent for your wellness! If you are feeling unwell, don't hesitate to reach out to your caretaker or tap the Emergency Card.";

  if (lastUserMsg.includes("sugar") || lastUserMsg.includes("diabet") || lastUserMsg.includes("glucose")) {
    fallbackText = "As your VitalCare Assistant (Offline mode), keeping a check on your sugar levels is super important! Eating fiber-rich food and staying active helps manage diabetes. Remember to discuss your recent levels with your doctor.";
  } else if (lastUserMsg.includes("pressure") || lastUserMsg.includes("bp") || lastUserMsg.includes("hypertension")) {
    fallbackText = "As your VitalCare Assistant (Offline mode), we want to make sure your heart is happy! Reducing salty food, breathing deeply, and getting gentle rest can help lower blood pressure. Please consult your physician.";
  } else if (lastUserMsg.includes("oxygen") || lastUserMsg.includes("pulse") || lastUserMsg.includes("o2")) {
    fallbackText = "As your VitalCare Assistant (Offline mode), normal oxygen levels are usually above 95%. Taking slow, deep breaths in a well-ventilated space is helpful. Let us know immediately if you feel breathless.";
  } else if (lastUserMsg.includes("temp") || lastUserMsg.includes("fever") || lastUserMsg.includes("warm")) {
    fallbackText = "As your VitalCare Assistant (Offline mode), body temperatures around 98.6°F are standard. If you have a mild fever, drink lots of water, rest, and keep the room cool. If it stays high, reach out to your doctor.";
  }

  return fallbackText;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages body. Expected an array." });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({ text: defaultFallback, isFallback: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createChatContents(messages),
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ text: response.text || defaultFallback });
  } catch (error: any) {
    console.error("❌ Gemini Chat API Error:", error?.message || error);

    const lastUserMsg = (messages || [])
      .slice()
      .reverse()
      .find((m: any) => m.role === "user")?.content?.toLowerCase() || "";

    return res.json({
      text: generateFallbackText(lastUserMsg),
      isFallback: true,
    });
  }
}
