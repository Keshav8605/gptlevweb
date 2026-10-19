"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import { useStoryTransitionSafe } from "@/context/StoryTransitionContext";
import type { QuizQuestion } from "@/lib/gift-data";

export interface ExtendedQuizQuestion extends QuizQuestion {
  explanation?: string;
}

export const defaultQuizQuestions: ExtendedQuizQuestion[] = [
  {
    id: "q1",
    question: "Who caught feelings first?",
    type: "multiple-choice",
    options: ["Definitely you", "Definitely me", "Somehow, we both fell at the same time.", "It was a slow, beautiful burn"],
    creatorAnswer: "Somehow, we both fell at the same time.",
    explanation: "Maybe there wasn't a first. Maybe we were finding our way toward each other all along.",
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
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);

  const noPhrases = [
    "Hmm… no? 👀",
    "Are you sure? 🥺",
    "Think again, sweetheart 🙈",
    "My heart says otherwise 💗",
    "You know you want to say yes 😚",
  ];

  const moveNoButton = () => {
    setNoPosition((prev) => {
      const minDistance = 80;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.floor(Math.random() * 80 + minDistance);
      let nextX = Math.round(Math.cos(angle) * distance);
      let nextY = Math.round(Math.sin(angle) * (distance * 0.65));

      // Clamp within safe margins so it stays playful and visible inside the card
      nextX = Math.max(-130, Math.min(130, nextX));
      nextY = Math.max(-70, Math.min(70, nextY));

      if (Math.abs(nextX - prev.x) < 45 && Math.abs(nextY - prev.y) < 45) {
        nextX = -prev.x || 90;
        nextY = -prev.y || 45;
      }
      return { x: nextX, y: nextY };
    });
    setNoAttempts((prev) => prev + 1);
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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [justRevealed, setJustRevealed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = activeQuestions[currentQ] || activeQuestions[0];
  const currentAnswer = (currentQuestion ? answers[currentQuestion.id] : "") || "";
  const isAnswered = currentAnswer.trim().length > 0;

  // Sync local draft and selection when question changes
  useEffect(() => {
    const existing = (currentQuestion ? answers[currentQuestion.id] : "") || "";
    setSelectedOption(existing);
    setTextDraft(existing);
    setIsEditing(false);
    setJustRevealed(false);
  }, [currentQ, currentQuestion?.id]);

  const handleLockInAnswer = (answerToLock: string) => {
    const trimmed = answerToLock.trim();
    if (!trimmed || !currentQuestion) return;
    const updated = {
      ...answers,
      [currentQuestion.id]: trimmed,
    };
    setAnswers(updated);
    try {
      localStorage.setItem("gift_quiz_responses", JSON.stringify(updated));
    } catch {}
    setIsEditing(false);
    setJustRevealed(true);
  };

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDraft.trim()) return;
    handleLockInAnswer(textDraft);
  };

  const handleResetQuiz = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("gift_quiz_responses");
      } catch {}
    }
    setAnswers({});
    setSelectedOption("");
    setTextDraft("");
    setIsEditing(false);
    setJustRevealed(false);
    setCurrentQ(0);
    setShowSummary(false);
  };

  const storyCtx = useStoryTransitionSafe();
  const isLastQuestion = currentQ === activeQuestions.length - 1;

  const handleProceedToNextSection = () => {
    if (storyCtx) {
      storyCtx.navigateWithTransition("love-letters");
      return;
    }
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/story")) {
        window.location.href = "/story/love-letters";
        return;
      }
      const lettersEl = document.getElementById("letters");
      if (lettersEl) {
        lettersEl.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
  };

  return (
    <SectionWrapper
      id="quiz"
      eyebrowLabel="A VERY IMPORTANT QUESTION"
      title="Do You Love Me?"
      subtitle="There is one answer I'm secretly hoping for. ♡"
      emoji="💗"
      bgVariant="default"
      chapterNumber={6}
      nextSectionId="letters"
      nextSectionLabel="Love Letters"
      nextSectionEmoji="💌"
    >
      <div className="max-w-2xl mx-auto text-center">

        {/* Interactive "Do You Love Me?" Card */}
        {!hasSaidYes ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-[var(--border-subtle)] shadow-lg relative mb-8 overflow-hidden"
          >
            {/* Tender loving couple asking for your love */}
            <div className="my-3 flex justify-center">
              <RomanticCharacter
                character="tenderCouple"
                size={225}
                animation="soft-breathe"
                sparkles
              />
            </div>

            {/* YES / NO Interactive Buttons (No button moves away on hover) */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 min-h-[64px]">
              <button
                type="button"
                onClick={() => setHasSaidYes(true)}
                style={{ transform: `scale(${1 + Math.min(noAttempts * 0.08, 0.4)})` }}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-base font-rounded font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300 z-10"
              >
                YES, OBVIOUSLY 💗
              </button>

              <motion.button
                type="button"
                animate={{ x: noPosition.x, y: noPosition.y }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                onMouseEnter={moveNoButton}
                onPointerEnter={moveNoButton}
                onTouchStart={(e) => {
                  e.preventDefault();
                  moveNoButton();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  moveNoButton();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 text-slate-600 text-xs font-rounded font-medium border border-slate-200 select-none shadow-2xs whitespace-nowrap z-20 cursor-default"
                tabIndex={0}
                aria-label="Playful no button"
              >
                {noPhrases[noAttempts % noPhrases.length]}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* YAYYY I knew it all along (Matching User Phase 3B Heading & Message) */
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

            <h3 className="font-rounded text-3xl sm:text-4xl font-bold text-[var(--pink-strong)] mb-2">
              I KNEW IT! ♡
            </h3>
            <p className="font-handwritten text-xl text-[var(--romantic-plum)]">
              Come here, you. If I could, I&apos;d give you the biggest hug right now.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("relationship-quiz-start");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-sm font-rounded font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all"
              >
                Let&apos;s see how well we know each other →
              </button>
            </div>
          </motion.div>
        )}

        {/* Relationship Questionnaire Cards */}
        <div id="relationship-quiz-start" className="text-left mt-8 pt-4">
          <div className="mb-6 text-center">
            <h3 className="font-rounded text-2xl sm:text-3xl font-bold text-[var(--romantic-plum)]">
              How Well Do We Know Each Other?
            </h3>
            <p className="font-handwritten text-base sm:text-lg text-[var(--text-secondary)] mt-1">
              Five little questions about our very favorite subject: us.
            </p>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-6">
            <div className="flex items-center gap-2">
              <span className="font-rounded text-xs font-semibold text-[var(--pink-strong)] uppercase tracking-wider">
                QUESTION {currentQ + 1} OF {activeQuestions.length}
              </span>
              {isAnswered && !isEditing && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-rounded font-semibold bg-emerald-100 text-emerald-700">
                  Unlocked ✓
                </span>
              )}
            </div>

            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-xs font-rounded font-semibold text-[var(--pink-deep)] hover:underline cursor-pointer"
            >
              {showSummary ? "Back to Questions" : "Our answers ♡"}
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
                {/* Question title & type badge */}
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-rounded font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)]">
                    {currentQuestion.type === "multiple-choice" ? "Multiple Choice 💕" : "Personal Memory ✨"}
                  </span>
                  <h3 className="font-rounded text-xl sm:text-2xl font-bold text-[var(--romantic-plum)] leading-snug">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Main Content Area: EITHER Revealed Dual-Answer View OR Interactive Answering Step */}
                {isAnswered && !isEditing ? (
                  /* ================= STAGE 2: ANSWERED -> REVEAL SENDER'S ANSWER ================= */
                  <div className="space-y-4">
                    {justRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 text-rose-800 text-xs sm:text-sm font-rounded font-semibold text-center flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>🎉 Answer locked in! Here is what I secretly wrote for you:</span>
                      </motion.div>
                    )}

                    {/* Receiver's Answer Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--pale-rose)]/40 border border-rose-200/80 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-rounded font-bold text-xs uppercase tracking-wider text-[var(--pink-strong)] flex items-center gap-1.5">
                          <span>🎀 Your Answer:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOption(currentAnswer);
                            setTextDraft(currentAnswer);
                            setIsEditing(true);
                          }}
                          className="text-xs font-rounded font-semibold text-[var(--pink-deep)] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-pink-200 shadow-2xs hover:bg-rose-50 transition-colors"
                        >
                          <span>✏️ Change my answer</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[var(--romantic-plum)] leading-relaxed">
                        &ldquo;{currentAnswer}&rdquo;
                      </p>
                    </div>

                    {/* Sender's Answer Card (Unlocked & Revealed!) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="p-4 sm:p-5 rounded-2xl bg-[var(--warm-cream)] border border-amber-200/80 text-left space-y-2 shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 font-rounded font-bold text-xs uppercase tracking-wider text-[var(--pink-deep)]">
                        <span>💌 What I Answered:</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                        &ldquo;{currentQuestion.creatorAnswer}&rdquo;
                      </p>
                      {currentQuestion.explanation && (
                        <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed pt-1 border-t border-amber-200/50">
                          {currentQuestion.explanation}
                        </p>
                      )}
                    </motion.div>

                    {/* Connection Pill */}
                    {currentQuestion.type === "multiple-choice" ? (
                      currentAnswer === currentQuestion.creatorAnswer ? (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-rounded font-semibold text-center">
                          <span>✨ We chose the exact same thing! Connected hearts in sync 🥰</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-rounded font-semibold text-center">
                          <span>💞 We don&apos;t have to remember everything the same way to share something beautiful. ♡</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-[var(--romantic-plum)] text-xs font-rounded font-medium text-center">
                        <span>🌸 I love your answer so much — holding this memory in my heart forever.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= STAGE 1: UNANSWERED OR EDITING ================= */
                  <div className="space-y-5">
                    {/* Multiple choice options */}
                    {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                      <div className="space-y-2.5">
                        {currentQuestion.options.map((option, idx) => {
                          const isSelected = selectedOption === option;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedOption(option)}
                              className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-rounded transition-all cursor-pointer flex items-center justify-between border ${
                                isSelected
                                  ? "bg-[var(--soft-pink)] border-[var(--pink-strong)] text-[var(--romantic-plum)] font-semibold shadow-xs ring-2 ring-[var(--pink-strong)]/20"
                                  : "bg-white border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-secondary)]"
                              }`}
                            >
                              <span>{option}</span>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-[var(--pink-strong)] text-white text-xs flex items-center justify-center font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-transparent">
                                  •
                                </span>
                              )}
                            </button>
                          );
                        })}

                        <div className="flex items-center justify-between pt-2">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOption(currentAnswer);
                                setIsEditing(false);
                              }}
                              className="text-xs font-rounded text-[var(--text-muted)] hover:underline cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] italic">
                              Pick an answer to reveal mine ♡
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleLockInAnswer(selectedOption)}
                            disabled={!selectedOption}
                            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            {isEditing ? "Update Answer ♡" : "Lock In My Answer & Reveal 💕"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Free text input */}
                    {currentQuestion.type === "free-text" && (
                      <form onSubmit={handleFreeTextSubmit} className="space-y-3">
                        <textarea
                          value={textDraft}
                          onChange={(e) => setTextDraft(e.target.value)}
                          placeholder="Write your sweet answer or favorite memory here..."
                          rows={3}
                          className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTextDraft(currentAnswer);
                                setIsEditing(false);
                              }}
                              className="text-xs font-rounded text-[var(--text-muted)] hover:underline cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] italic">
                              Answer first to unveil my secret note! ♡
                            </span>
                          )}

                          <button
                            type="submit"
                            disabled={!textDraft.trim()}
                            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            {isEditing ? "Update Answer ♡" : "Lock In My Answer & Reveal 💕"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Locked Teaser Box (Only shown when not answered yet) */}
                    {!isAnswered ? (
                      <div className="p-5 rounded-2xl border border-dashed border-rose-300/80 bg-gradient-to-br from-rose-50/50 to-pink-50/30 text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-500 shadow-2xs text-base">
                          🔒
                        </div>
                        <p className="font-rounded font-bold text-xs sm:text-sm text-[var(--pink-strong)]">
                          Sender&apos;s answer is locked ♡
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                          Answer this question first above! Once you lock it in, what I secretly wrote will magically unlock here. 💌
                        </p>
                      </div>
                    ) : (
                      /* When editing, show the unlocked sender card below for reference */
                      <div className="p-4 rounded-2xl bg-[var(--warm-cream)] border border-amber-200/80 text-left space-y-1.5 opacity-90">
                        <span className="font-rounded font-bold text-xs uppercase tracking-wider text-[var(--pink-deep)]">
                          💌 What I Answered (Unlocked):
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                          &ldquo;{currentQuestion.creatorAnswer}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons & Romantic Completion Guide */}
                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  {isLastQuestion ? (
                    isAnswered ? (
                      <>
                        {/* Mobile layout (< sm): sweet message centered on top, navigation buttons side-by-side below */}
                        <div className="flex flex-col gap-3 sm:hidden w-full">
                          <div className="text-center space-y-0.5">
                            <p className="font-rounded font-bold text-xs text-[var(--pink-strong)] flex items-center justify-center gap-1">
                              <span>Aww, you answered all our questions!</span>
                              <span>🥰</span>
                            </p>
                            <p className="font-handwritten text-xs text-[var(--text-secondary)]">
                              You know my whole heart so well 💕
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-3 w-full">
                            <button
                              type="button"
                              onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-rounded font-medium text-[var(--text-secondary)] hover:text-[var(--pink-strong)] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                            >
                              <span>←</span>
                              <span>Previous</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleProceedToNextSection}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs font-rounded font-bold shadow-md shadow-pink-300/40 hover:shadow-lg hover:shadow-pink-400/50 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 transition-all duration-300 group"
                            >
                              <span>Read My Love Letters</span>
                              <span className="inline-flex items-center gap-1 text-sm group-hover:scale-110 transition-transform duration-300 whitespace-nowrap">
                                <span>💌</span>
                                <span>→</span>
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Desktop / Tablet layout (>= sm): All three aligned perfectly in a single row */}
                        <div className="hidden sm:flex items-center justify-between gap-3 w-full">
                          <button
                            type="button"
                            onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-rounded font-medium text-[var(--text-secondary)] hover:text-[var(--pink-strong)] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                          >
                            <span>←</span>
                            <span>Previous</span>
                          </button>

                          <div className="text-center space-y-0.5 px-2">
                            <p className="font-rounded font-bold text-xs sm:text-sm text-[var(--pink-strong)] flex items-center justify-center gap-1 whitespace-nowrap">
                              <span>Aww, you answered all our questions!</span>
                              <span>🥰</span>
                            </p>
                            <p className="font-handwritten text-xs sm:text-sm text-[var(--text-secondary)] whitespace-nowrap">
                              You know my whole heart so well 💕
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleProceedToNextSection}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-bold shadow-md shadow-pink-300/40 hover:shadow-lg hover:shadow-pink-400/50 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 transition-all duration-300 group"
                          >
                            <span>Read My Love Letters</span>
                            <span className="inline-flex items-center gap-1 text-sm sm:text-base group-hover:scale-110 transition-transform duration-300 whitespace-nowrap">
                              <span>💌</span>
                              <span>→</span>
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 text-xs sm:text-sm font-rounded font-medium text-[var(--text-secondary)] hover:text-[var(--pink-strong)] cursor-pointer"
                        >
                          ← Previous
                        </button>

                        <span className="text-xs text-[var(--text-muted)] italic font-rounded text-right">
                          Last question of our quiz ♡ Lock in your answer above! ✨
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                        disabled={currentQ === 0}
                        className="px-4 py-2 text-xs sm:text-sm font-rounded font-medium text-[var(--text-secondary)] disabled:opacity-30 cursor-pointer hover:text-[var(--pink-strong)]"
                      >
                        ← Previous
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentQ((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                        className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-rounded font-semibold transition-all cursor-pointer ${
                          isAnswered
                            ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            : "bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--soft-pink)]"
                        }`}
                      >
                        Next question →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Summary Comparison */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">
                  Summary of all answers between both of you:
                </p>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="text-xs font-rounded font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Reset Answers 🔄
                </button>
              </div>

              {activeQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnsweredThis = Boolean(ans && ans.trim().length > 0);
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
                        <p className="text-[var(--text-primary)]">
                          {hasAnsweredThis ? ans : "Not answered yet"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--warm-cream)] border border-[var(--border-subtle)]">
                        <p className="font-bold text-[var(--text-secondary)] mb-1">My Answer:</p>
                        <p className="text-[var(--text-primary)]">
                          {hasAnsweredThis ? q.creatorAnswer : "🔒 Locked until you answer"}
                        </p>
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
