"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
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

  // Reference 5: "Do You Love Me?" interactive game state
  const [hasSaidYes, setHasSaidYes] = useState(false);
  const [noCount, setNoCount] = useState(0);

  const noPhrases = [
    "No 🥺",
    "Are you sure? 💔",
    "Pwease think again? 🥺",
    "Wrong button silly! 🙈",
    "Don't do this to me! 😭",
    "Look at this cute face! 🐾",
    "You know you love me! 🥰",
  ];

  const handleNoClick = () => {
    setNoCount((prev) => (prev + 1) % noPhrases.length);
  };

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

  return (
    <SectionWrapper
      id="quiz"
      title=""
      subtitle=""
      emoji="💌"
      bgVariant="default"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Eyebrow and Header (Matching Reference 5) */}
        <p className="font-handwritten text-lg sm:text-xl text-[var(--pink-strong)] mb-1">
          AlwaysYou · MADE WITH LOVE ♥
        </p>

        <h2 className="font-rounded text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--romantic-plum)] mb-3">
          Do You Love Me? <span className="inline-block animate-pulse-soft text-[var(--pink-primary)]">💖</span>
        </h2>

        {/* Pill Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--soft-pink)] border border-[var(--border-subtle)] text-[var(--pink-strong)] text-xs font-rounded font-semibold tracking-wide shadow-2xs mb-6">
          A Cute Interactive Surprise 💖
        </div>

        {/* Three Value Props (Matching Reference 5) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs font-rounded font-medium text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[var(--border-subtle)] shadow-2xs">
            <span className="text-[var(--pink-primary)]">♥</span>
            <span>Sweet Questions</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[var(--border-subtle)] shadow-2xs">
            <span>🎁</span>
            <span>Adorable Surprises</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[var(--border-subtle)] shadow-2xs">
            <span className="text-[var(--pink-primary)]">✨</span>
            <span>Made with Love</span>
          </div>
        </div>

        {/* Interactive "Do You Love Me?" Card (Reference 5) */}
        {!hasSaidYes ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-[var(--border-subtle)] shadow-lg relative overflow-hidden mb-8"
          >
            <p className="font-handwritten text-2xl text-[var(--pink-strong)] mb-4">
              Please say YES... 💖
            </p>

            {/* Tender loving couple asking for your love */}
            <div className="my-3 flex justify-center">
              <RomanticCharacter
                character="tenderCouple"
                size={225}
                animation="soft-breathe"
                sparkles
              />
            </div>

            {/* YES / NO Interactive Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setHasSaidYes(true)}
                style={{ transform: `scale(${1 + noCount * 0.1})` }}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-base font-rounded font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
              >
                YES ❤️
              </button>

              <button
                onClick={handleNoClick}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-rounded font-medium border border-slate-200 cursor-pointer transition-all"
              >
                {noPhrases[noCount]}
              </button>
            </div>
          </motion.div>
        ) : (
          /* YAYYY I knew it all along (Matching Reference 5 Success State with Leaping Hugging Couple PNG) */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-[var(--border-subtle)] shadow-lg mb-8"
          >
            <div className="mb-3 flex justify-center">
              <RomanticCharacter
                character="huggingCouple"
                size={235}
                animation="gentle-float"
                sparkles
              />
            </div>

            <h3 className="font-rounded text-3xl sm:text-4xl font-bold text-[var(--pink-strong)] mb-1">
              YAYYY ❤️
            </h3>
            <p className="font-handwritten text-xl text-[var(--romantic-plum)]">
              I knew it all along! You&apos;re stuck with me forever 🥰
            </p>

            <p className="text-xs text-[var(--text-muted)] mt-4">
              Now let&apos;s see how well you know our little love story below ↓
            </p>
          </motion.div>
        )}

        {/* Relationship Questionnaire Cards */}
        <div className="text-left mt-8">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-6">
            <span className="font-rounded text-xs font-semibold text-[var(--pink-strong)] uppercase tracking-wider">
              Question {currentQ + 1} of {activeQuestions.length}
            </span>

            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-xs font-rounded font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer"
            >
              {showSummary ? "Back to Quiz" : "View Comparison Summary 📜"}
            </button>
          </div>

          {!showSummary ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-md space-y-6"
              >
                <h3 className="font-rounded text-xl sm:text-2xl font-bold text-[var(--romantic-plum)]">
                  {currentQuestion.question}
                </h3>

                {/* Multiple choice options */}
                {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = currentAnswer === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(option)}
                          className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-rounded transition-all cursor-pointer flex items-center justify-between border ${
                            isSelected
                              ? "bg-[var(--soft-pink)] border-[var(--pink-strong)] text-[var(--romantic-plum)] font-semibold shadow-xs"
                              : "bg-white border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-secondary)]"
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && <span className="text-[var(--pink-strong)]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Free text input */}
                {currentQuestion.type === "free-text" && (
                  <form onSubmit={handleFreeTextSubmit} className="space-y-3">
                    <textarea
                      value={textDraft || currentAnswer || ""}
                      onChange={(e) => setTextDraft(e.target.value)}
                      placeholder="Write your sweet answer here..."
                      rows={3}
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!textDraft.trim()}
                        className="px-5 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-rounded font-semibold hover:bg-[var(--pink-deep)] disabled:opacity-40 cursor-pointer transition-all"
                      >
                        {isAnswered ? "Update Answer" : "Submit Answer ♡"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Creator Answer Reveal */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-[var(--border-subtle)] space-y-3"
                    >
                      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--warm-cream)] border border-[var(--border-subtle)] text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 mb-1.5 font-rounded font-bold text-[var(--pink-deep)]">
                          <span>💌 What I Answered:</span>
                        </div>
                        <p className="text-[var(--text-primary)] font-medium mb-1">
                          &ldquo;{currentQuestion.creatorAnswer}&rdquo;
                        </p>
                        {currentQuestion.explanation && (
                          <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 text-xs sm:text-sm font-rounded font-medium text-[var(--text-secondary)] disabled:opacity-30 cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentQ((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                    disabled={currentQ === activeQuestions.length - 1}
                    className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Next Question →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Summary Comparison */
            <div className="space-y-4">
              {activeQuestions.map((q, idx) => {
                const ans = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl p-5 border border-[var(--border-subtle)] shadow-xs space-y-2 text-xs"
                  >
                    <span className="font-rounded font-bold text-[var(--pink-strong)]">
                      #{idx + 1}. {q.question}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)]">
                        <p className="font-bold text-[var(--pink-deep)] mb-1">Your Answer:</p>
                        <p className="text-[var(--text-primary)]">{ans || "Not answered yet"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--warm-cream)] border border-[var(--border-subtle)]">
                        <p className="font-bold text-[var(--text-secondary)] mb-1">My Answer:</p>
                        <p className="text-[var(--text-primary)]">{q.creatorAnswer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
