// All calls to our backend live here so components don't need to know
// about endpoints, headers, or error shapes.
//
// API_BASE_URL is empty by default, which means requests go to a relative
// path like "/api/tutor/ask". That works locally because vite.config.js
// proxies /api to the backend on port 4000. Once the backend is deployed
// (e.g. to Render), set VITE_API_BASE_URL in a .env file to the deployed
// URL and requests will go straight there instead — see .env.example.
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
