import { getGeminiClient } from "../_shared/geminiClient";

const defaultFallbacks: Record<string, string> = {
  en: `Here is a simple summary of the scheme.\n\n• 🎁 **What you get**: Benefits are explained clearly.\n• 🎯 **Who can get it**: Eligible people can apply.\n• 📋 **How to get it**: Go to the official website and show your local ID card.`,
  hi: `यह लाभ योजना का सरल सारांश है।\n\n• 🎁 **आपको क्या मिलेगा**: लाभ स्पष्ट रूप से बताया गया है।\n• 🎯 **किसे मिलेगा**: पात्र लोग आवेदन कर सकते हैं।\n• 📋 **कैसे मिलेगा**: आधिकारिक वेबसाइट पर जाएं और अपना स्थानीय पहचान पत्र दिखाएं।`,
  te: `ఈ పథకం యొక్క సరళ వివరణ ఇది.\n\n• 🎁 **మీకు ఏమి లభిస్తుంది**: ప్రయోజనాలు క్లియర్ గా వివరించబడతాయి.\n• 🎯 **ఎవరికి లభిస్తాయి**: అర్హులు దరఖాస్తు చేసుకోవచ్చు.\n• 📋 **ఎలా పొందాలి**: అధికారిక వెబ్‌సైట్‌కు వెళ్లి మీ స్థానిక గుర్తింపు కార్డును చూపించండి.`
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { language = "en", schemeName = "", description = "", benefits = "", eligibility = "" } = req.body || {};
  const fallbackText = defaultFallbacks[language] || defaultFallbacks.en;

  const client = getGeminiClient();
  if (!client) {
    return res.json({ text: fallbackText, isFallback: true });
  }

  try {
    const prompt = `You are a helpful government scheme guide. Simplify the following government healthcare scheme for an ordinary citizen, translating or explaining it in ${
      language === "hi" ? "Hindi" : language === "te" ? "Telugu" : "English"
    }.\nScheme Name: ${schemeName}\nDescription: ${description}\nBenefits: ${benefits}\nEligibility: ${eligibility}\n\nInstructions:\n1. Explain it using very simple words. Break it down into:\n   - 🎁 **What is it?** (1 short sentence)\n   - 💰 **What you get:** (1-2 simple bullet points)\n   - 🎯 **Who is it for?** (1-2 simple bullet points)\n   - 🚶‍♂️ **Simple Steps to Apply:** (2 simple steps)\n2. Use markdown formatting with bullet points.\n3. Keep it warm and super easy to read. Avoid any legal jargon.\n4. Output ONLY the response in the selected language (${language}).`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return res.json({ text: response.text || fallbackText });
  } catch (error: any) {
    console.error("❌ Gemini Simplify Scheme API Error:", error?.message || error);
    return res.json({ text: fallbackText, isFallback: true });
  }
}
