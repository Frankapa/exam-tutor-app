const MODEL = process.env.GEMINI_MODEL;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function askGemini(prompt, { maxOutputTokens = 2048, responseMimeType } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing. Copy server/.env.example to server/.env and add your key."
    );
  }

  const generationConfig = { maxOutputTokens };
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(`Gemini API error (${response.status}): ${errorBody}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  return stripLatexDollarSigns(text);
}
function stripLatexDollarSigns(text) {
  return text.replace(/\$/g, "");
}

export { askGemini };
