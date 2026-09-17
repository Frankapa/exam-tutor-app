import { useState } from "react";
import Header from "./components/Header.jsx";
import SubjectPicker from "./components/SubjectPicker.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import AskTutor from "./components/AskTutor.jsx";
import { generateQuestion } from "./api/tutor.js";
import { SUBJECTS, TOTAL_QUESTIONS_PER_SESSION } from "./data/subjects.js";

export default function App() {
  const [subject, setSubject] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [loadError, setLoadError] = useState(null);

  async function fetchQuestion(chosenSubject, previousQuestions) {
    setIsLoadingQuestion(true);
    setLoadError(null);
    try {
      const question = await generateQuestion({
        subject: chosenSubject,
        previousQuestions,
      });
      setCurrentQuestion(question);
      setAskedQuestions((prev) => [...prev, question.question]);
    } catch (err) {
      setLoadError(err.message || "Couldn't generate a question. Please try again.");
    }
    setIsLoadingQuestion(false);
  }

  function startQuiz(chosenSubject) {
    setSubject(chosenSubject);
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMissedQuestions([]);
    setAskedQuestions([]);
    setIsFinished(false);
    setCurrentQuestion(null);
    fetchQuestion(chosenSubject, []);
  }

  function handleAnswered(wasCorrect) {
    if (wasCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissedQuestions((list) => [...list, currentQuestion.question]);
    }
  }

  function handleNext() {
    if (questionNumber < TOTAL_QUESTIONS_PER_SESSION) {
      setQuestionNumber((n) => n + 1);
      fetchQuestion(subject, askedQuestions);
    } else {
      setIsFinished(true);
    }
  }

  function handleRetryLoad() {
    fetchQuestion(subject, askedQuestions);
  }

  function handleRestart() {
    setSubject(null);
    setIsFinished(false);
  }

  return (
    <div className="page">
      <div className="sheet">
        <Header />

        {!subject && <SubjectPicker subjects={SUBJECTS} onSelect={startQuiz} />}

        {subject && !isFinished && isLoadingQuestion && (
          <div className="panel">
            <div className="panel-title">Generating your question...</div>
            <p className="sub">The tutor is writing a fresh question just for you.</p>
          </div>
        )}

        {subject && !isFinished && !isLoadingQuestion && loadError && (
          <div className="panel">
            <div className="feedback">{loadError}</div>
            <div className="row-actions">
              <button className="btn" onClick={handleRetryLoad}>
                Try again
              </button>
            </div>
          </div>
        )}

        {subject && !isFinished && !isLoadingQuestion && !loadError && currentQuestion && (
          <QuestionCard
            subject={subject}
            questionNumber={questionNumber}
            totalQuestions={TOTAL_QUESTIONS_PER_SESSION}
            score={score}
            streak={streak}
            item={currentQuestion}
            onAnswered={handleAnswered}
            onNext={handleNext}
          />
        )}

        {subject && isFinished && (
          <SummaryPanel
            subject={subject}
            score={score}
            total={TOTAL_QUESTIONS_PER_SESSION}
            bestStreak={bestStreak}
            missedQuestions={missedQuestions}
            onRestart={handleRestart}
          />
        )}

        <AskTutor />

        <footer>
          Built as a practice tool — always confirm tricky topics with your teacher
          or textbook too.
        </footer>
      </div>
    </div>
  );
}
