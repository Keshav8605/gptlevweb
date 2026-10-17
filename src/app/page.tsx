"use client";

import { useState, useEffect } from "react";
import { defaultGiftConfig } from "@/lib/gift-data";
import { FloatingHearts } from "@/components/FloatingHearts";
import { GiftNavigation } from "@/components/GiftNavigation";
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
import { CreatorStudio } from "@/components/creator/CreatorStudio";
import { ParticipantAccessModal } from "@/components/auth/ParticipantAccessModal";

export default function Home() {
  const [, setHasStartedExploring] = useState(false);
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Auto-detect ?invite= parameter for seamless recipient authorization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invite }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.authorized) {
            localStorage.setItem("gift_participant_role", data.role || "recipient");
            localStorage.setItem("gift_participant_name", data.name || "Baby");
            localStorage.setItem("gift_auth_token", invite);
            window.dispatchEvent(new Event("storage"));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleEnterWorld = () => {
    setHasStartedExploring(true);
    const firstSection = document.getElementById("observations");
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)]">
      {/* Delicate floating background ambience */}
      <FloatingHearts />

      {/* Floating interactive navigation menu */}
      <GiftNavigation
        onOpenCreatorStudio={() => setIsCreatorStudioOpen(true)}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
      />

      {/* Chapter 1: Personalized Welcome & Envelope Surprise */}
      <WelcomeExperience
        recipientNickname={defaultGiftConfig.recipientNickname}
        title={defaultGiftConfig.welcomeTitle}
        subtitle={defaultGiftConfig.welcomeSubtitle}
        message={defaultGiftConfig.welcomeMessage}
        onEnter={handleEnterWorld}
      />

      {/* Main Experience Flow */}
      <div className="relative z-10">
        {/* Chapter 2: Things I Noticed About You */}
        <ObservationsSection observations={defaultGiftConfig.observations} />

        {/* Chapter 3: Our Memories Scrapbook */}
        <MemoriesSection memories={defaultGiftConfig.memories} />

        {/* Chapter 4: Our Secret World (Phase 2 - server-side protected haven) */}
        <SecretWorldSection initialHint={defaultGiftConfig.secretHint} />

        {/* Chapter 5: Delulu Mode (Phase 2 - interactive relationship game) */}
        <DeluluSection />

        {/* Chapter 6: How Well Do You Know Us? (Phase 2 - Relationship Questionnaire) */}
        <QuizSection />

        {/* Chapter 7: Letters I Don't Say Enough */}
        <LettersSection letters={defaultGiftConfig.letters} />

        {/* Chapter 8: Our Little Notebook (Phase 3 - Shared Journal & Prompts) */}
        <NotebookSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />

        {/* Chapter 9: Voice Message Experience (Phase 3 - 2-Way Audio Whispers) */}
        <VoiceMessageSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />

        {/* Chapter 10: Plan Our Next Little Adventure ♡ (Phase 4 - Collaborative Date Planner) */}
        <DatePlannerSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />

        {/* Chapter 11: Open When Letters */}
        <OpenWhenSection letters={defaultGiftConfig.openWhenLetters} />

        {/* Chapter 11: Little Reasons Why I Love You (Phase 2) */}
        <LittleReasonsSection reasons={defaultGiftConfig.littleReasons} />

        {/* Chapter 12: Little Gifts I Owe You (Phase 2 - redeemable digital vouchers) */}
        <DigitalGiftsSection gifts={defaultGiftConfig.digitalGifts} />

        {/* Chapter 13: Our Song Dedicated Melody */}
        {defaultGiftConfig.featuredSong && (
          <OurSongSection
            featuredSong={defaultGiftConfig.featuredSong}
            additionalSongs={defaultGiftConfig.additionalSongs}
          />
        )}

        {/* Chapter 14: Final Romantic Heart & Relationship Counter */}
        <FinalHeartSection
          startDate={defaultGiftConfig.dateOfficialCouple || defaultGiftConfig.dateFirstMet}
          milestones={defaultGiftConfig.customMilestones}
          finalLetter={defaultGiftConfig.finalLetter}
          finalMessage={defaultGiftConfig.finalMessage}
          senderName={defaultGiftConfig.senderNickname || defaultGiftConfig.senderName}
        />
      </div>

      {/* Editorial Footer */}
      <footer className="py-14 px-6 text-center border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] relative z-10">
        <div className="max-w-md mx-auto space-y-3">
          <p className="font-script text-2xl text-[var(--pink-strong)]">
            A tiny digital universe made just for you 💕
          </p>
          <p>
            Every word, melody, and memory crafted with unconditional devotion.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-[var(--text-secondary)] text-[11px] font-semibold hover:bg-[var(--pale-rose)] cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span>🔐</span>
              <span>Couple Access & Invite</span>
            </button>
            <button
              onClick={() => setIsCreatorStudioOpen(true)}
              className="px-4 py-1.5 rounded-full border border-[var(--border-medium)] bg-white text-[var(--pink-strong)] text-[11px] font-semibold hover:bg-[var(--pale-rose)] cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>Creator Studio / Response Center</span>
            </button>
          </div>
          <p className="text-[10px] tracking-wider uppercase text-[var(--pink-primary)] pt-1">
            © Forever & Always Yours
          </p>
        </div>
      </footer>

      {/* Creator Studio & Response Center Drawer */}
      <CreatorStudio
        isOpen={isCreatorStudioOpen}
        onClose={() => setIsCreatorStudioOpen(false)}
      />

      {/* Couple Access & Switcher Modal */}
      <ParticipantAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </main>
  );
}
