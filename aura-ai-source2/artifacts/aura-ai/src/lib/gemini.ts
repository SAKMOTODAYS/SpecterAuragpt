export const GEMINI_KEY = "AIzaSyATLQRFn0ItLTCY0tFrrkVgWomxEiRACcg";

export const MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

export async function generateGeminiResponse(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  modelIndex: number,
  signal: AbortSignal
): Promise<{ text: string; nextModelIndex: number }> {
  if (modelIndex >= MODELS.length) {
    throw new Error("All models exhausted.");
  }

  const model = MODELS[modelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 8192 },
      }),
      signal,
    });

    if (!res.ok) {
      if (res.status === 429 || res.status === 503) {
        return generateGeminiResponse(history, modelIndex + 1, signal);
      }
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Empty response from AI");
    }

    return { text: data.candidates[0].content.parts[0].text, nextModelIndex: modelIndex };
  } catch (e: any) {
    if (e.name === "AbortError") {
      throw e;
    }
    if (modelIndex < MODELS.length - 1) {
      return generateGeminiResponse(history, modelIndex + 1, signal);
    }
    throw e;
  }
}
