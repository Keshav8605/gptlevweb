"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { defaultGiftConfig } from "@/lib/gift-data";
import { FloatingHearts } from "@/components/FloatingHearts";
import { CursorHeartTrail } from "@/components/CursorHeartTrail";
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
import { StorySceneProvider } from "@/context/StorySceneContext";
import { StorySceneContainer, SceneDefinition } from "@/components/scenes/StorySceneContainer";
=======
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888

function HomeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
<<<<<<< HEAD
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
  };

  const storyScenes: SceneDefinition[] = [
    {
      id: "welcome",
      node: (
        <WelcomeExperience
          recipientNickname={defaultGiftConfig.recipientNickname}
          title={defaultGiftConfig.welcomeTitle}
          subtitle={defaultGiftConfig.welcomeSubtitle}
          message={defaultGiftConfig.welcomeMessage}
          onEnter={handleEnterWorld}
        />
      ),
    },
    {
      id: "observations",
      node: <ObservationsSection observations={defaultGiftConfig.observations} />,
    },
    {
      id: "memories",
      node: <MemoriesSection memories={defaultGiftConfig.memories} />,
    },
    {
      id: "secretWorld",
      node: <SecretWorldSection initialHint={defaultGiftConfig.secretHint} />,
    },
    {
      id: "deluluMode",
      node: <DeluluSection />,
    },
    {
      id: "quiz",
      node: <QuizSection />,
    },
    {
      id: "letters",
      node: <LettersSection letters={defaultGiftConfig.letters} />,
    },
    {
      id: "notebook",
      node: <NotebookSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />,
    },
    {
      id: "voice",
      node: <VoiceMessageSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />,
    },
    {
      id: "datePlanner",
      node: <DatePlannerSection onOpenAccessModal={() => setIsAccessModalOpen(true)} />,
    },
    {
      id: "openWhenLetters",
      node: <OpenWhenSection letters={defaultGiftConfig.openWhenLetters} />,
    },
    {
      id: "littleReasons",
      node: <LittleReasonsSection reasons={defaultGiftConfig.littleReasons} />,
    },
    {
      id: "digitalGifts",
      node: <DigitalGiftsSection gifts={defaultGiftConfig.digitalGifts} />,
    },
    ...(defaultGiftConfig.featuredSong
      ? [
          {
            id: "ourSong",
            node: (
              <OurSongSection
                featuredSong={defaultGiftConfig.featuredSong}
                additionalSongs={defaultGiftConfig.additionalSongs}
              />
            ),
          },
        ]
      : []),
    {
      id: "finalHeart",
      node: (
        <FinalHeartSection
          startDate={defaultGiftConfig.dateOfficialCouple || defaultGiftConfig.dateFirstMet}
          milestones={defaultGiftConfig.customMilestones}
          finalLetter={defaultGiftConfig.finalLetter}
          finalMessage={defaultGiftConfig.finalMessage}
          senderName={defaultGiftConfig.senderNickname || defaultGiftConfig.senderName}
        />
      ),
    },
  ];

  return (
    <StorySceneProvider>
      <main className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)]">
        {/* Delicate floating background ambience */}
        <FloatingHearts />
        {/* Delightful cursor heart trail */}
        <CursorHeartTrail />

        {/* Floating interactive navigation menu */}
        <GiftNavigation
          onOpenCreatorStudio={() => setIsCreatorStudioOpen(true)}
          onOpenAccessModal={() => setIsAccessModalOpen(true)}
        />

        {/* Romantic Scene-By-Scene Story Container */}
        <StorySceneContainer scenes={storyScenes} />

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
    </StorySceneProvider>
=======
    const qs = searchParams.toString();
    router.replace(`/story/welcome${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--pink-strong)] font-handwritten text-2xl">
      Opening our love story... ♡
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeRedirect />
    </Suspense>
>>>>>>> d158bf5f03c3f4e4709a5dd17b3510469507a888
  );
}
