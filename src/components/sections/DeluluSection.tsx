"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import type { DeluluScenario } from "@/lib/gift-data";

export const defaultDeluluScenarios: DeluluScenario[] = [
  {
    id: "ds1",
    title: "We get caught in the torrential rain together",
    situation:
      "A sudden summer downpour catches us miles from home. Neither of us has an umbrella, and our clothes are getting drenched within seconds. What happens next?",
    options: [
      {
        id: "ds1_o1",
        text: "Pull me by the hands and dance in the middle of the empty street",
        response:
          "Main character energy! 🌧️💃 You spin me around until we're both breathless and laughing like idiots. That's the exact moment a stranger looks out their window and thinks 'I want what they have.'",
      },
      {
        id: "ds1_o2",
        text: "Sprint for the nearest café awning and squeeze under my jacket together",
        response:
          "Maximum cozy romance. We're shivering, shivering, looking into each other's eyes while dripping wet, and I end up kissing your wet nose. We buy two hot chocolates and refuse to leave for hours. ☕💕",
      },
      {
        id: "ds1_o3",
        text: "Give up completely and have a puddle-splashing war",
        response:
          "Chaotic evil, but I respect it. You deliberately splash me, so I scoop you up and spin you straight into the biggest puddle. We both catch colds, but it was 100% worth it. 💦😂",
      },
    ],
  },
  {
    id: "ds2",
    title: "We have an entire day with zero plans",
    situation:
      "It's Saturday morning. No work, no chores, phones on silent, and the weather is pure perfection. How are we spending the next 12 hours?",
    options: [
      {
        id: "ds2_o1",
        text: "Stay in bed until 2 PM building a blanket fort with snacks & movies",
        response:
          "The ultimate cozy hibernation. Fairy lights strung inside, 4 pillows minimum, eating popcorn in bed with zero shame. I fall asleep on your chest by movie #2. 🍿🧸",
      },
      {
        id: "ds2_o2",
        text: "Impulse road trip to a random town we've never visited",
        response:
          "Window down, hand in hand over the gear shift, screaming our favorite songs at the top of our lungs. We end up finding a tiny thrift shop and having lunch at an eccentric roadside diner. 🚗🎶",
      },
      {
        id: "ds2_o3",
        text: "Bake something elaborate from scratch and make a huge mess",
        response:
          "Flour on your cheeks, batter on my nose, dancing around the kitchen to oldies music. It either turns out Michelin-star delicious or completely burnt, and either way we eat the whole thing. 🧁👩‍🍳",
      },
    ],
  },
  {
    id: "ds3",
    title: "It's 2 AM and neither of us can sleep",
    situation:
      "The room is pitch dark, the city is silent, and our brains are wide awake. What do we end up doing?",
    options: [
      {
        id: "ds3_o1",
        text: "Whisper deep philosophical questions and childhood secrets",
        response:
          "Those 2 AM talks hit different. You tell me something you've never told another living soul, and I just look at you thinking how grateful I am to be your safe place. 🌙✨",
      },
      {
        id: "ds3_o2",
        text: "Raid the kitchen fridge like two stealthy raccoons",
        response:
          "Standing in the glow of the open fridge whispering 'don't drop the spoon!!' while sharing leftover pasta and ice cream directly from the tub. True soulmates. 🦝🧀",
      },
      {
        id: "ds3_o3",
        text: "Put on quiet jazz and slow dance in our pajamas",
        response:
          "Barefoot on the living room rug, swaying in the moonlight. You rest your forehead against mine, and for five minutes the entire universe stops spinning. 🥺💖",
      },
    ],
  },
  {
    id: "ds4",
    title: "We suddenly win an all-expenses-paid trip",
    situation:
      "A golden envelope arrives: flights and luxury stays anywhere in the world for two weeks. Where are we landing?",
    options: [
      {
        id: "ds4_o1",
        text: "A wooden chalet in the Swiss Alps surrounded by snowy pines",
        response:
          "Roaring fireplace, thick woolen socks, hot fondue, and watching snowflakes fall outside while wrapped in a giant cashmere blanket. Peak romance. 🏔️❄️",
      },
      {
        id: "ds4_o2",
        text: "An overwater bungalow in the Maldives with glowing turquoise water",
        response:
          "Jumping straight off our deck into the warm ocean at sunrise, stargazing from the hammock at night, and forgetting what shoes feel like. Pure paradise. 🏝️🌊",
      },
      {
        id: "ds4_o3",
        text: "A vintage apartment in Kyoto with paper lanterns and cherry blossoms",
        response:
          "Wandering cobblestone alleys under blooming sakura, eating handmade matcha mochi, and visiting quiet ancient temples with our hands entwined. 🌸🍵",
      },
    ],
  },
  {
    id: "ds5",
    title: "We're 80 years old and having a silly argument",
    situation:
      "Decades from now, we're sitting on our porch rocking chairs. What ridiculous thing are we playfully bickering about?",
    options: [
      {
        id: "ds5_o1",
        text: "Who was ACTUALLY the one that fell in love first back in 2023",
        response:
          "'You looked at me like I was the sun, dear!' / 'No, YOU couldn't stop blushing!' — and we still smile the exact same way we do right now. 👵👴❤️",
      },
      {
        id: "ds5_o2",
        text: "Who stole the last bite of the homemade strawberry pie",
        response:
          "You have powdered sugar on your chin while denying it with a straight face. I kiss your cheek to steal the sugar back. Some habits never change. 🥧🍓",
      },
    ],
  },
  {
    id: "ds6",
    title: "We only have one hour together before a long trip",
    situation:
      "The suitcase is packed by the door. We have exactly 60 minutes before we have to head to the airport. How do we spend it?",
    options: [
      {
        id: "ds6_o1",
        text: "Hold each other tightly in silence, soaking up every heartbeat",
        response:
          "My favorite kind of goodbye. No words needed. Just your scent, your warmth, and the quiet promise that my heart stays behind with you wherever I go. 🫂🤍",
      },
      {
        id: "ds6_o2",
        text: "Slip tiny handwritten notes into each other's luggage to find later",
        response:
          "I hide one in your coat pocket, one in your book, and one in your shoe. You open your bag 4,000 miles away and find: 'I miss you already, baby.' 💌✈️",
      },
    ],
  },
];

interface DeluluSectionProps {
  scenarios?: DeluluScenario[];
}

export function DeluluSection({ scenarios = defaultDeluluScenarios }: DeluluSectionProps) {
  const activeScenarios = scenarios.length > 0 ? scenarios : defaultDeluluScenarios;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [returnParam] = useState<string>(() => {
    if (typeof window === "undefined") return "/#deluluMode";
    return window.location.pathname + (window.location.search || "") + "#deluluMode";
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("gift_delulu_answers");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const performScrollToDelulu = () => {
      const isDeluluTarget =
        window.location.hash === "#deluluMode" ||
        sessionStorage.getItem("scroll_to_delulu_on_load") === "true";

      if (isDeluluTarget) {
        sessionStorage.removeItem("scroll_to_delulu_on_load");
        const el = document.getElementById("deluluMode");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Trigger scroll restoration on mount and layout settle
    performScrollToDelulu();
    const t1 = setTimeout(performScrollToDelulu, 80);
    const t2 = setTimeout(performScrollToDelulu, 250);
    const t3 = setTimeout(performScrollToDelulu, 600);

    window.addEventListener("hashchange", performScrollToDelulu);
    window.addEventListener("popstate", performScrollToDelulu);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("hashchange", performScrollToDelulu);
      window.removeEventListener("popstate", performScrollToDelulu);
    };
  }, []);

  const currentScenario = activeScenarios[currentIndex];
  const selectedOptionId = selectedAnswers[currentScenario?.id];
  const selectedOption = currentScenario?.options.find((o) => o.id === selectedOptionId);

  const handleSelectOption = (optionId: string) => {
    const updated = {
      ...selectedAnswers,
      [currentScenario.id]: optionId,
    };
    setSelectedAnswers(updated);
    try {
      localStorage.setItem("gift_delulu_answers", JSON.stringify(updated));
    } catch {}
  };

  const handleNext = () => {
    if (currentIndex < activeScenarios.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  return (
    <SectionWrapper
      id="deluluMode"
      title="Delulu Mode"
      subtitle="Playful relationship scenarios — pick your path, discover my reaction 🦋"
      emoji="🦋"
      bgVariant="blush"
      chapterNumber={4}
      nextSectionId="quiz"
      nextSectionLabel="Do You Love Me?"
      nextSectionEmoji="💖"
    >
      <div className="max-w-2xl mx-auto">
        {/* Playful couple companion */}
        <div className="flex justify-center -mt-3 mb-6">
          <RomanticCharacter
            character="huggingCouple"
            size={180}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {activeScenarios.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === currentIndex ? "2.2rem" : "0.5rem",
                background:
                  i === currentIndex
                    ? "var(--pink-strong)"
                    : selectedAnswers[activeScenarios[i].id]
                    ? "var(--pink-primary)"
                    : "var(--border-subtle)",
              }}
              aria-label={`Jump to scenario ${i + 1}`}
            />
          ))}
        </div>

        {/* Current Scenario Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--border-subtle)] shadow-[0_8px_30px_var(--shadow-pink)]">
              {/* Category chip */}
              <div className="text-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] inline-block">
                  Scenario {currentIndex + 1} of {activeScenarios.length}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mt-3">
                  {currentScenario.title}
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mt-2 max-w-lg mx-auto">
                  {currentScenario.situation}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentScenario.options.map((opt, i) => {
                  const isChosen = selectedOptionId === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer border flex items-center justify-between gap-3 ${
                        isChosen
                          ? "bg-gradient-to-r from-[var(--pale-rose)] to-[var(--bg-blush)] border-[var(--pink-strong)] shadow-xs"
                          : "bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {isChosen ? "✨" : ["🌸", "💫", "🎀"][i % 3]}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      <span className="text-xs font-bold text-[var(--pink-strong)]">
                        {isChosen ? "Chosen ♡" : "Select"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>


            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-3">
                {currentIndex === activeScenarios.length - 1 ? (
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer transition-colors"
                  >
                    ↺ Replay Scenarios
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--pink-strong)] text-white hover:bg-[var(--pink-deep)] shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    Next Scenario →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Story Universe Promotional Entry Card */}
        <div className="mt-8 bg-white/90 backdrop-blur-xs rounded-3xl p-6 sm:p-7 border border-[var(--border-subtle)] shadow-[0_6px_25px_var(--shadow-pink)] text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xs text-[var(--pink-primary)] select-none">✨</span>
            <h4 className="font-serif italic leading-tight">
              <span className="text-lg sm:text-xl text-[#855870] font-medium mr-1.5">
                One click.
              </span>
              <span className="text-xl sm:text-2xl text-[var(--pink-primary)] font-bold">
                Endless worlds.
              </span>
            </h4>
            <span className="text-xs text-[var(--pink-primary)] select-none">♡</span>
          </div>

          <p className="font-serif italic text-xs sm:text-sm text-[#987589] mb-4">
            Stories made for your kind of delulu.
          </p>

          <Link
            href={`/story-universe?from=${encodeURIComponent(returnParam)}`}
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("story_universe_return_to", returnParam);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--pink-strong)] text-white hover:bg-[var(--pink-deep)] shadow-sm hover:shadow-md cursor-pointer transition-all"
            id="btn-explore-story-universe"
          >
            Explore Other Worlds →
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
