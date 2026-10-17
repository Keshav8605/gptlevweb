"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import type { QuizQuestion } from "@/lib/gift-data";

export interface ExtendedQuizQuestion extends QuizQuestion {
  explanation?: string;
}

export const defaultQuizQuestions: ExtendedQuizQuestion[] = [
  {
    id: "q1",
    question: "Who caught feelings first?",
    type: "multiple-choice",
    options: ["Definitely you", "Definitely me", "Simultaneously from the very first spark", "It was a slow, beautiful burn"],
    creatorAnswer: "Simultaneously from the very first spark",
    explanation: "Even before we said anything out loud, there was this undeniable gravity pulling us together.",
  },
  {
    id: "q2",
    question: "What's our funniest memory together?",
    type: "free-text",
    creatorAnswer: "The kitchen disaster where everything went wrong and we laughed on the floor until we cried!",
    explanation: "Burnt dinner, loud smoke alarm, and pure joy — proving we don't need perfection to have the best time.",
  },
  {
    id: "q3",
    question: "What little habit of mine makes your heart melt?",
    type: "multiple-choice",
    options: [
      "The way I squeeze your hand when I get excited",
      "The tiny nose scrunch when I laugh",
      "The sleepy voice right before bed",
      "How I always make sure you have the best bite of food",
    ],
    creatorAnswer: "The way I squeeze your hand when I get excited",
    explanation: "Every time you hold my hand tightly, I feel like the safest person in the world.",
  },
  {
    id: "q4",
    question: "What would our absolute dream Sunday look like?",
    type: "free-text",
    creatorAnswer: "Sleeping in late, coffee in bed with cozy blankets, gentle rain outside, and zero alarms.",
    explanation: "Nothing fancy needed — just uninterrupted hours in our own peaceful bubble.",
  },
  {
    id: "q5",
    question: "What nickname will never get old between us?",
    type: "multiple-choice",
    options: ["Baby ♡", "My Love", "Sweetheart", "Babe"],
    creatorAnswer: "Baby ♡",
    explanation: "No matter how many years go by, you will always be my baby.",
  },
];

interface QuizSectionProps {
  questions?: ExtendedQuizQuestion[];
}

export function QuizSection({ questions = defaultQuizQuestions }: QuizSectionProps) {
  const activeQuestions = questions.length > 0 ? questions : defaultQuizQuestions;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("gift_quiz_responses");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [textDraft, setTextDraft] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = activeQuestions[currentQ];
  const currentAnswer = answers[currentQuestion?.id];
  const isAnswered = !!currentAnswer;

  const handleSelectAnswer = (ans: string) => {
    if (!ans.trim()) return;
    const updated = {
      ...answers,
      [currentQuestion.id]: ans.trim(),
    };
    setAnswers(updated);
    try {
      localStorage.setItem("gift_quiz_responses", JSON.stringify(updated));
    } catch {}
  };

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDraft.trim()) return;
    handleSelectAnswer(textDraft);
    setTextDraft("");
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <SectionWrapper
      id="quiz"
      title="How Well Do You Know Us?"
      subtitle="Answer with your heart — then see what I answered and how our thoughts align 💕"
      emoji="❓"
      bgVariant="surface"
    >
      <div className="max-w-2xl mx-auto">
        {/* Toggle between question flow and summary */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pink-strong)]">
              {answeredCount} of {activeQuestions.length} answered
            </span>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-xs font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>{showSummary ? "← Back to Questions" : "Compare All Answers 👀"}</span>
            </button>
          )}
        </div>

        {!showSummary ? (
          <>
            {/* Progress Bar / Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {activeQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className="h-2 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: i === currentQ ? "2.2rem" : "0.5rem",
                    background:
                      i === currentQ
                        ? "var(--pink-strong)"
                        : answers[q.id]
                        ? "var(--pink-primary)"
                        : "var(--border-subtle)",
                  }}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--border-subtle)] shadow-[0_8px_30px_var(--shadow-pink)] space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Question {currentQ + 1} of {activeQuestions.length}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mt-2">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Multiple-choice or Free-text input */}
                {currentQuestion.type === "multiple-choice" && currentQuestion.options ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt) => {
                      const isChosen = currentAnswer === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectAnswer(opt)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer border flex items-center justify-between ${
                            isChosen
                              ? "bg-gradient-to-r from-[var(--pale-rose)] to-[var(--bg-blush)] border-[var(--pink-strong)] shadow-xs font-semibold text-[var(--text-primary)]"
                              : "bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && <span className="text-[var(--pink-strong)] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <form onSubmit={handleFreeTextSubmit} className="space-y-3">
                    <textarea
                      value={textDraft || currentAnswer || ""}
                      onChange={(e) => setTextDraft(e.target.value)}
                      placeholder="Write your honest, sweet answer here..."
                      rows={3}
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!textDraft.trim()}
                        className="px-5 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] disabled:opacity-40 cursor-pointer transition-all"
                      >
                        {isAnswered ? "Update My Answer" : "Submit Answer ♡"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Answer Comparison Reveal */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-[var(--border-subtle)] space-y-4"
                    >
                      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--warm-cream)] border border-[var(--border-subtle)] text-xs sm:text-sm">
                        <div className="flex items-center gap-2 mb-2 font-semibold text-[var(--pink-deep)]">
                          <span>💌 What I Answered:</span>
                        </div>
                        <p className="text-[var(--text-primary)] font-medium mb-1.5">
                          &ldquo;{currentQuestion.creatorAnswer}&rdquo;
                        </p>
                        {currentQuestion.explanation && (
                          <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                        <span>Your Answer: <strong className="text-[var(--text-primary)]">{currentAnswer}</strong></span>
                        <span className="text-[var(--pink-strong)] font-script text-base">
                          {currentAnswer.toLowerCase() === (currentQuestion.creatorAnswer || "").toLowerCase()
                            ? "Matched perfectly! 🥰"
                            : "Two hearts, one story ♡"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Question Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] disabled:opacity-30 cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentQ((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                    disabled={currentQ === activeQuestions.length - 1}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Next Question →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* Full Comparison Summary View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h4 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                Our Answer Comparisons 💕
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Comparing our thoughts and shared memories side by side
              </p>
            </div>

            {activeQuestions.map((q, idx) => {
              const ans = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--pink-strong)]">
                      #{idx + 1}. {q.question}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)]">
                      <p className="font-semibold text-[var(--pink-deep)] mb-1">Your Answer:</p>
                      <p className="text-[var(--text-primary)]">{ans || "Not answered yet"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--warm-cream)] border border-[var(--border-subtle)]">
                      <p className="font-semibold text-[var(--text-secondary)] mb-1">My Answer:</p>
                      <p className="text-[var(--text-primary)]">{q.creatorAnswer}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-4">
              <button
                onClick={() => setShowSummary(false)}
                className="px-6 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer"
              >
                Back to Questionnaire View
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
}
