import { useState } from "react";
import { explainQuestion } from "../api/tutor";

const LETTERS = ["A", "B", "C", "D"];
const CONFETTI_DOTS = [
  { left: "8%", color: "var(--gold-icon)", delay: "0s" },
  { left: "28%", color: "var(--green-icon)", delay: "0.05s" },
  { left: "52%", color: "var(--gold-icon)", delay: "0.1s" },
  { left: "72%", color: "var(--green-icon)", delay: "0.02s" },
  { left: "90%", color: "var(--gold-icon)", delay: "0.08s" },
];

export default function QuestionCard({
  subject,
  questionNumber,
  totalQuestions,
  score,
  streak,
  item,
  onAnswered,
  onNext,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const hasAnswered = selectedIndex !== null;
  const wasCorrect = hasAnswered && selectedIndex === item.correctIndex;
  const filledSegments = hasAnswered ? questionNumber : questionNumber - 1;

  function handleSelect(index) {
    if (hasAnswered) return;
    setSelectedIndex(index);
    onAnswered(index === item.correctIndex);
  }

  async function handleExplain() {
    setIsExplaining(true);
    setExplanation(null);
    try {
      const { explanation } = await explainQuestion({
        subject,
        question: item.question,
        options: item.options,
        correctAnswer: item.options[item.correctIndex],
      });
      setExplanation(explanation);
    } catch (err) {
      setExplanation("Couldn't reach the AI tutor right now. Please try again.");
    }
    setIsExplaining(false);
  }

  function handleNext() {
    setSelectedIndex(null);
    setExplanation(null);
    onNext();
  }

  return (
    <div className="panel">
      <div className="quiz-head">
        <span className="qcount">
          {subject} — Q{questionNumber} of {totalQuestions}
        </span>
        {streak > 0 && (
          <span className="streak-badge">
            {streak} streak
          </span>
        )}
      </div>

      <div className="progress-track" aria-hidden="true">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`progress-seg${i < filledSegments ? " filled" : ""}`}
          />
        ))}
      </div>

      <div className="score">
        Score: {score}/{filledSegments}
      </div>

      <div className="question">{item.question}</div>

      <div className="options">
        {item.options.map((option, index) => {
          const isCorrect = index === item.correctIndex;
          const isWrongPick = hasAnswered && index === selectedIndex && !isCorrect;
          const showConfetti = hasAnswered && wasCorrect && isCorrect;

          let className = "opt";
          if (hasAnswered) {
            className += " disabled";
            if (isCorrect) className += " correct";
            if (isWrongPick) className += " wrong";
          }

          return (
            <div key={index} className={className} onClick={() => handleSelect(index)}>
              <span className="letter">{LETTERS[index]}</span>
              <span>{option}</span>
              {showConfetti &&
                CONFETTI_DOTS.map((dot, i) => (
                  <span
                    key={i}
                    className="confetti-dot"
                    style={{ left: dot.left, background: dot.color, animationDelay: dot.delay }}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="feedback">
          {wasCorrect ? "Correct." : "Not quite."} {item.note}
        </div>
      )}

      {hasAnswered && (
        <div className="row-actions">
          <button className="btn" onClick={handleExplain} disabled={isExplaining}>
            {isExplaining ? "Working through it..." : "Explain with AI tutor"}
          </button>
          <button className="btn btn-secondary" onClick={handleNext}>
            {questionNumber === totalQuestions ? "See results" : "Next question"}
          </button>
        </div>
      )}

      {explanation && <div className="explain-box">{explanation}</div>}
    </div>
  );
}
