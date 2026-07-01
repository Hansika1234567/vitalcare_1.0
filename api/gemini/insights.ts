import { getGeminiClient } from "../_shared/geminiClient";

const defaultFallbackText = {
  en: "Your vitals look steady! Keep monitoring them daily and make sure to take any prescribed medicines on time.",
  hi: "आपके स्वास्थ्य संकेत सामान्य हैं! प्रतिदिन जाँच करें और समय पर दवाइयाँ लें।",
  te: "మీ ఆరోగ్య సంకేతాలు నిలకడగా ఉన్నాయి! ప్రతిరోజు పర్యవేక్షణ కొనసాగించండి మరియు మందులు సమయానికి తీసుకోండి."
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { vitals, language = "en" } = req.body || {};
  const fallbackText = defaultFallbackText[language] || defaultFallbackText.en;

  const client = getGeminiClient();
  if (!client) {
    return res.json({ text: fallbackText, isFallback: true });
  }

  try {
    const prompt = `Analyze these recent vitals and provide a short, simple health trend summary.\nVitals: ${JSON.stringify(
      vitals
    )}\nLanguage: ${language}\nInstructions:\n- Summarize trends in 2-3 extremely simple, encouraging sentences.\n- Avoid any medical jargon. Use words a young child or someone with no reading education would understand when read aloud.\n- Use friendly, positive tone.\n- Tell them if they are safe, or if they should rest or reach out to their doctor.\n- Output ONLY the translated content in the requested language (${language}).`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return res.json({ text: response.text || fallbackText });
  } catch (error: any) {
    console.error("❌ Gemini Insights API Error:", error?.message || error);
    return res.json({ text: fallbackText, isFallback: true });
  }
}
