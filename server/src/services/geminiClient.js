// Thin wrapper around the Google Gemini API (Google AI Studio).
// Keeping this in its own file means the routes don't need to know
// anything about request/response shapes, headers, or endpoint URLs.
//
// Gemini's free tier (via a Google AI Studio key) doesn't require a card
// or expire like a trial credit does, which is why this project uses it
// instead of a paid API.

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
    // Attach the HTTP status to the error so callers (routes) can tell a
    // rate limit (429) apart from a bad request or a server-side failure,
    // and show the student a more specific message than "something broke".
    const err = new Error(`Gemini API error (${response.status}): ${errorBody}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  // Gemini nests the reply under candidates[0].content.parts[].text
  // Join the parts in case the response is ever split into multiple pieces.
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  return stripLatexDollarSigns(text);
}

// Gemini often wraps math in LaTeX-style delimiters like $x^2$ or $$x^2$$.
// This app has no LaTeX renderer, so those dollar signs just show up as
// confusing stray characters around numbers and variables. The prompts
// already ask Gemini not to do this, but this is a guaranteed fallback
// in case it does it anyway — it's safe here because the app never uses
// "$" to mean currency (Naira amounts use "₦").
function stripLatexDollarSigns(text) {
  return text.replace(/\$/g, "");
}

export { askGemini };
