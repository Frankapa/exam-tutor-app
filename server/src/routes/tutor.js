import express from "express";
import { askGemini } from "../services/geminiClient.js";

const router = express.Router();

// Turns a Gemini error into a response the frontend can show as-is.
// A 429 (rate limit) gets a specific, honest message instead of the
// generic "something went wrong" — retrying immediately won't help,
// so the student should know to wait rather than mash the button.
function sendGeminiError(err, res, context) {
  console.error(`Error in ${context}:`, err.message);

  if (err.status === 429) {
    return res.status(429).json({
      error:
        "The free AI quota for today has been used up for a moment — this resets quickly. Please wait a bit and try again.",
    });
  }

  res.status(500).json({ error: "Could not reach the AI tutor. Please try again." });
}

// POST /api/tutor/generate-question
// Body: { subject, previousQuestions? }
// Asks Gemini for one fresh multiple-choice question, so no two quiz runs
// (and no two students) see a predictable, fixed set of questions.
router.post("/generate-question", async (req, res) => {
  const { subject, previousQuestions = [] } = req.body;

  if (!subject) {
    return res.status(400).json({ error: "subject is required." });
  }

  const avoidList =
    previousQuestions.length > 0
      ? `Do not repeat or closely resemble any of these questions already used in this session: ${previousQuestions
          .map((q) => `"${q}"`)
          .join(", ")}.`
      : "";

  const prompt = [
    `You are an item-writer creating one multiple-choice practice question for a Nigerian secondary school student preparing for WAEC/JAMB, on the subject: ${subject}.`,
    `The question should be at a realistic WAEC/JAMB difficulty level, testing a single clear concept.`,
    `Provide exactly 4 answer options, with only one correct.`,
    `Also provide a short one- or two-sentence explanation of why the correct answer is right, written simply enough for a student who just got it wrong to understand.`,
    `Write all math in plain text, not LaTeX — use things like x^2, 1/2, or sqrt(9) instead of wrapping expressions in dollar signs or backslash notation.`,
    avoidList,
    `Respond with ONLY valid JSON, no markdown formatting, no code fences, no extra commentary, in exactly this shape:`,
    `{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "note": "..."}`,
    `"correctIndex" must be the zero-based index (0, 1, 2, or 3) of the correct option in the "options" array.`,
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const raw = await askGemini(prompt, {
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    });

    let generated;
    try {
      generated = JSON.parse(raw);
    } catch (parseErr) {
      console.error("Gemini returned non-JSON:", raw);
      return res.status(502).json({ error: "The AI tutor sent back something unexpected. Please try again." });
    }

    const { question, options, correctIndex, note } = generated;
    const isValid =
      typeof question === "string" &&
      Array.isArray(options) &&
      options.length === 4 &&
      Number.isInteger(correctIndex) &&
      correctIndex >= 0 &&
      correctIndex <= 3 &&
      typeof note === "string";

    if (!isValid) {
      console.error("Gemini returned malformed question shape:", generated);
      return res.status(502).json({ error: "The AI tutor sent back an incomplete question. Please try again." });
    }

    res.json({ question, options, correctIndex, note });
  } catch (err) {
    sendGeminiError(err, res, "/generate-question");
  }
});

// POST /api/tutor/explain
// Body: { subject, question, options, correctAnswer }
// Used when a student wants a step-by-step breakdown of a quiz question.
router.post("/explain", async (req, res) => {
  const { subject, question, options, correctAnswer } = req.body;

  if (!subject || !question || !options || !correctAnswer) {
    return res.status(400).json({
      error: "subject, question, options, and correctAnswer are all required.",
    });
  }

  const prompt = [
    `You are a patient WAEC/JAMB tutor helping a Nigerian secondary school student.`,
    `Explain this ${subject} question step by step in simple, encouraging language.`,
    `Question: "${question}"`,
    `Options: ${options.join(", ")}`,
    `Correct answer: ${correctAnswer}`,
    `Write all math in plain text, not LaTeX — use things like x^2, 1/2, or sqrt(9) instead of wrapping expressions in dollar signs or backslash notation.`,
    `Keep it under 120 words.`,
  ].join(" ");

  try {
    const explanation = await askGemini(prompt, { maxOutputTokens: 1024 });
    res.json({ explanation });
  } catch (err) {
    sendGeminiError(err, res, "/explain");
  }
});

// POST /api/tutor/ask
// Body: { question }
// Used for the free-form "ask the tutor anything" box.
router.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required." });
  }

  const prompt = `You are a friendly WAEC/JAMB exam tutor for a Nigerian secondary school student. Answer clearly and simply, under 150 words. Write all math in plain text, not LaTeX — use things like x^2, 1/2, or sqrt(9) instead of wrapping expressions in dollar signs or backslash notation. Student's question: ${question}`;

  try {
    const answer = await askGemini(prompt, { maxOutputTokens: 500 });
    res.json({ answer });
  } catch (err) {
    sendGeminiError(err, res, "/ask");
  }
});

export default router;
