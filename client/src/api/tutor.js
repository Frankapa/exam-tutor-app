const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function postJSON(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function generateQuestion({ subject, previousQuestions }) {
  return postJSON("/api/tutor/generate-question", { subject, previousQuestions });
}

export function explainQuestion({ subject, question, options, correctAnswer }) {
  return postJSON("/api/tutor/explain", { subject, question, options, correctAnswer });
}

export function askTutor(question) {
  return postJSON("/api/tutor/ask", { question });
}
