"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { GiftRecord } from "@/lib/server-db";
import { WelcomeExperience } from "@/components/sections/WelcomeExperience";
import { ObservationsSection } from "@/components/sections/ObservationsSection";
import { MemoriesSection } from "@/components/sections/MemoriesSection";
import { SecretWorldSection } from "@/components/sections/SecretWorldSection";
import { DeluluSection } from "@/components/sections/DeluluSection";
import { QuizSection } from "@/components/sections/QuizSection";
import { LettersSection } from "@/components/sections/LettersSection";
import { NotebookSection } from "@/components/sections/NotebookSection";
import { VoiceMessageSection } from "@/components/sections/VoiceMessageSection";
import { DatePlannerSection } from "@/components/planner/DatePlannerSection";
import { OpenWhenSection } from "@/components/sections/OpenWhenSection";
import { LittleReasonsSection } from "@/components/sections/LittleReasonsSection";
import { DigitalGiftsSection } from "@/components/sections/DigitalGiftsSection";
import { OurSongSection } from "@/components/sections/OurSongSection";
import { FinalHeartSection } from "@/components/sections/FinalHeartSection";
import { defaultGiftConfig } from "@/lib/gift-data";

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftRecord;
}

export function LivePreviewModal({ isOpen, onClose, gift }: LivePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen) return null;

  const enabledSet = new Set(gift.enabledSections || []);
  const sectionOrder = gift.sectionOrder || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-white/95 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">👁️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  Live Recipient Preview: {gift.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Simulation Mode (No Live Mutations)
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Experience the gift exactly as {gift.recipientNickname || gift.recipientName} will see it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Toggle */}
            <div className="p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center text-xs">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  deviceMode === "desktop"
                    ? "bg-[var(--pink-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  deviceMode === "mobile"
                    ? "bg-[var(--pink-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
                }`}
              >
                📱 Mobile (Phone Frame)
              </button>
            </div>

            {/* Back to Editor */}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer transition-all"
            >
              ← Back to Studio Editor
            </button>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center">
          <div
            className={`transition-all duration-300 bg-[var(--bg-main)] text-[var(--text-primary)] ${
              deviceMode === "mobile"
                ? "w-[390px] min-h-[844px] rounded-[48px] border-[10px] border-stone-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative my-auto"
                : "w-full max-w-6xl rounded-3xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden"
            }`}
          >
            {/* Mobile Notch simulation */}
            {deviceMode === "mobile" && (
              <div className="sticky top-0 left-0 right-0 h-6 bg-stone-800 z-50 flex items-center justify-center">
                <div className="w-28 h-4 bg-stone-900 rounded-full" />
              </div>
            )}

            {/* Welcome Envelope */}
            {enabledSet.has("welcome") && (
              <WelcomeExperience
                recipientNickname={gift.recipientNickname || gift.recipientName || "My Everything"}
                title={gift.welcomeTitle}
                subtitle={gift.welcomeSubtitle}
                message={gift.welcomeMessage}
                polaroids={gift.welcomePolaroids}
                onEnter={() => {}}
              />
            )}

            {/* Sections in configured custom order */}
            <div className="relative z-10">
              {sectionOrder.map((sectionId) => {
                if (!enabledSet.has(sectionId)) return null;

                switch (sectionId) {
                  case "observations":
                    return (
                      <ObservationsSection
                        key="observations"
                        observations={gift.customObservations || defaultGiftConfig.observations}
                      />
                    );
                  case "memories":
                    return (
                      <MemoriesSection
                        key="memories"
                        memories={gift.customMemories || defaultGiftConfig.memories}
                      />
                    );
                  case "secretWorld":
                    return (
                      <SecretWorldSection
                        key="secretWorld"
                        initialHint={gift.secretHint || defaultGiftConfig.secretHint}
                      />
                    );
                  case "deluluMode":
                    return <DeluluSection key="deluluMode" />;
                  case "quiz":
                    return <QuizSection key="quiz" />;
                  case "letters":
                    return (
                      <LettersSection
                        key="letters"
                        letters={gift.customLetters || defaultGiftConfig.letters}
                      />
                    );
                  case "notebook":
                    return <NotebookSection key="notebook" onOpenAccessModal={() => {}} />;
                  case "voice":
                    return <VoiceMessageSection key="voice" onOpenAccessModal={() => {}} />;
                  case "datePlanner":
                    return <DatePlannerSection key="datePlanner" onOpenAccessModal={() => {}} />;
                  case "openWhenLetters":
                    return (
                      <OpenWhenSection
                        key="openWhenLetters"
                        letters={gift.customOpenWhenLetters || defaultGiftConfig.openWhenLetters}
                      />
                    );
                  case "littleReasons":
                    return (
                      <LittleReasonsSection
                        key="littleReasons"
                        reasons={gift.customLittleReasons || defaultGiftConfig.littleReasons}
                      />
                    );
                  case "digitalGifts":
                    return (
                      <DigitalGiftsSection
                        key="digitalGifts"
                        gifts={gift.customDigitalGifts || defaultGiftConfig.digitalGifts}
                      />
                    );
                  case "ourSong":
                    return (
                      <OurSongSection
                        key="ourSong"
                        featuredSong={gift.featuredSong || defaultGiftConfig.featuredSong!}
                        additionalSongs={defaultGiftConfig.additionalSongs}
                      />
                    );
                  case "finalHeart":
                    return (
                      <FinalHeartSection
                        key="finalHeart"
                        startDate={gift.dateOfficialCouple || gift.dateFirstMet || defaultGiftConfig.dateOfficialCouple}
                        milestones={gift.customMilestones || defaultGiftConfig.customMilestones}
                        finalLetter={gift.finalLetter || defaultGiftConfig.finalLetter}
                        finalMessage={gift.finalMessage || defaultGiftConfig.finalMessage}
                        senderName={gift.senderNickname || gift.senderName || "Your Love"}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>

            {/* Editorial Footer */}
            <footer className="py-12 px-6 text-center border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]">
              <p className="font-script text-2xl text-[var(--pink-strong)]">
                A tiny digital universe made just for you 💕
              </p>
              <p className="mt-1">
                Crafted by {gift.senderNickname || gift.senderName} with unconditional devotion.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
