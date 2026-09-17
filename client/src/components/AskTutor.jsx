import { useState } from "react";
import { askTutor } from "../api/tutor";

export default function AskTutor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      const { answer } = await askTutor(question);
      setAnswer(answer);
    } catch (err) {
      setAnswer("Couldn't reach the AI tutor right now. Please try again.");
    }
    setIsAsking(false);
  }

  return (
    <div className="panel">
      <div className="panel-title">Ask the tutor anything</div>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Explain the difference between a noun clause and a noun phrase"
      />
      <div className="row-actions">
        <button className="btn" onClick={handleAsk} disabled={isAsking}>
          {isAsking ? "Thinking..." : "Ask"}
        </button>
      </div>
      {answer && <div className="explain-box">{answer}</div>}
    </div>
  );
}
