"use client";

import { use, useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GiftRecord } from "@/lib/server-db";
import { defaultGiftConfig } from "@/lib/gift-data";
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
import { BucketListSection } from "@/components/sections/BucketListSection";
import { PersonalCardsSection } from "@/components/sections/PersonalCardsSection";
import { LastSecretSection } from "@/components/sections/LastSecretSection";
import { FinalHeartSection } from "@/components/sections/FinalHeartSection";
import { ParticipantAccessModal } from "@/components/auth/ParticipantAccessModal";
import { CreatorStudio } from "@/components/creator/CreatorStudio";
import { scrollToChapter } from "@/lib/motion";

function GiftRecipientContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [gift, setGift] = useState<GiftRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Fetch gift by slug
  const loadGift = useCallback(async (passcode = "") => {
    setErrorStatus(null);
    try {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const inviteToken = searchParams.get("invite") || searchParams.get("token") || "";

      let url = `/api/gifts/by-slug/${slug}?`;
      if (inviteToken) url += `invite=${encodeURIComponent(inviteToken)}&`;
      if (passcode) url += `passcode=${encodeURIComponent(passcode)}&`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.status === 404) {
        setErrorStatus("Gift not found");
        return;
      }

      if (res.status === 403) {
        setErrorStatus("This gift is currently in draft mode and has not been published yet.");
        return;
      }

      if (data.isLocked) {
        setIsLocked(true);
        setIsLoading(false);
        return;
      }

      if (data.gift) {
        setGift(data.gift);
        setIsLocked(false);
      }
    } catch {
      setErrorStatus("Unable to open this gift right now.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadGift();
  }, [loadGift]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeAttempt.trim()) return;
    loadGift(passcodeAttempt.trim());
  };

  const handleEnterWorld = () => {
    scrollToChapter("observations");
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center text-2xl animate-bounce mb-4 shadow-sm">
          💌
        </div>
        <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
          Unwrapping your surprise...
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Gathering every little memory and melody for you 💕
        </p>
      </div>
    );
  }

  // 2. Draft / Unpublished or Not Found Error State
  if (errorStatus) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[var(--border-subtle)] shadow-xl space-y-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center text-3xl mx-auto">
            🎀
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
            Romantic Gift Notice
          </span>
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            {errorStatus.includes("draft") ? "A Surprise in Progress ♡" : "Gift Not Found"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {errorStatus.includes("draft")
              ? "This gift is currently being drafted with love by its creator. If you were sent a preview link or passcode, please verify your invitation."
              : "We couldn't locate this romantic gift link. Please double-check the URL or ask your partner for an updated link."}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/studio"
              className="px-5 py-2.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--bg-blush)] cursor-pointer transition-colors"
            >
              Open Creator Studio ✍️
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Passcode Protected Lock Screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-9 border border-[var(--border-subtle)] shadow-2xl space-y-6 relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--pink-strong)] to-[var(--pink-primary)] text-white flex items-center justify-center text-2xl mx-auto shadow-md">
            🔒
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
              Intimate Romantic Haven
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              This Gift is Protected
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter the secret passcode whispered to you by your partner to unlock your world.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter secret passcode..."
              value={passcodeAttempt}
              onChange={(e) => {
                setPasscodeAttempt(e.target.value);
                setPasscodeError("");
              }}
              autoFocus
              className="w-full text-center tracking-widest text-sm p-3.5 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
            />

            {passcodeError && (
              <p className="text-xs text-rose-500 font-semibold">{passcodeError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-primary)] text-white text-xs font-bold hover:opacity-95 shadow-md cursor-pointer transition-all"
            >
              Unlock Our World ♡
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-muted)]">
            Don&apos;t know the passcode? Ask your partner for their secret word or direct invite token.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!gift) return null;

  const enabledSet = new Set(gift.enabledSections || []);
  const sectionOrder = gift.sectionOrder || [
    "welcome",
    "observations",
    "secretWorld",
    "memories",
    "ourSong",
    "openWhenLetters",
    "deluluMode",
    "quiz",
    "letters",
    "littleReasons",
    "digitalGifts",
    "notebook",
    "voice",
    "bucketList",
    "personalCards",
    "datePlanner",
    "lastSecret",
    "finalHeart",
  ];

  return (
    <main className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)]">
      {/* Delightful cursor heart trail */}
      <CursorHeartTrail />

      {/* Floating navigation bar */}
      <GiftNavigation
        onOpenCreatorStudio={() => setIsCreatorStudioOpen(true)}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
      />

      {/* Draft / Studio banner if in draft */}
      {gift.status !== "published" && (
        <div className="sticky top-0 z-30 bg-amber-500/95 backdrop-blur-md text-white text-xs font-semibold py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2">
          <span>⚠️ You are previewing a draft gift: &quot;{gift.title}&quot;</span>
          <Link
            href="/studio"
            className="underline font-bold hover:text-amber-100 ml-2"
          >
            Edit in Studio ↗
          </Link>
        </div>
      )}

      {/* Chapter 1: Welcome Envelope Surprise */}
      {enabledSet.has("welcome") && (
        <WelcomeExperience
          recipientNickname={gift.recipientNickname || defaultGiftConfig.recipientNickname}
          title={gift.welcomeTitle || defaultGiftConfig.welcomeTitle}
          eyebrowLabel={gift.welcomeEyebrow}
          handwrittenNote={gift.welcomeHandwrittenNote}
          subtitle={gift.welcomeSubtitle || defaultGiftConfig.welcomeSubtitle}
          message={gift.welcomeMessage || defaultGiftConfig.welcomeMessage}
          polaroids={gift.welcomePolaroids || defaultGiftConfig.welcomePolaroids}
          onEnter={handleEnterWorld}
        />
      )}

      {/* Dynamic Ordered Sections Flow */}
      <div className="relative z-10">
        {sectionOrder.map((sectionId) => {
          if (!enabledSet.has(sectionId) || sectionId === "welcome") return null;

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
                  collageType={gift.memoriesCollageType || "heart"}
                  heartCenterPhoto={gift.memoriesHeartCollage?.centerHeroPhoto}
                  heartCenterCaption={gift.memoriesHeartCollage?.centerHeroCaption}
                  heartPhotos={gift.memoriesHeartCollage?.photos}
                  heartCaption={gift.memoriesHeartCollage?.caption}
                  polaroidCenterPhoto={gift.memoriesPolaroidCollage?.centralHeartPhoto}
                  polaroidCenterCaption={gift.memoriesPolaroidCollage?.centralCaption}
                  polaroidBorderPhotos={gift.memoriesPolaroidCollage?.borderPhotos}
                />
              );

            case "secretWorld":
              return (
                <SecretWorldSection
                  key="secretWorld"
                  initialHint={gift.secretHint || defaultGiftConfig.secretHint}
                  customSecretLetter={gift.secretContent}
                  customPasscode={gift.secretPassword}
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
              return (
                <NotebookSection
                  key="notebook"
                  onOpenAccessModal={() => setIsAccessModalOpen(true)}
                />
              );

            case "voice":
              return (
                <VoiceMessageSection
                  key="voice"
                  onOpenAccessModal={() => setIsAccessModalOpen(true)}
                />
              );

            case "datePlanner":
              return (
                <DatePlannerSection
                  key="datePlanner"
                  onOpenAccessModal={() => setIsAccessModalOpen(true)}
                />
              );

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
              const songToUse = {
                title: gift.featuredSong?.title || defaultGiftConfig.featuredSong?.title || "Our Song",
                artist: gift.featuredSong?.artist || defaultGiftConfig.featuredSong?.artist || "Artist",
                dedication: gift.featuredSong?.dedication || defaultGiftConfig.featuredSong?.dedication || "For you",
                whyItMatters: gift.featuredSong?.whyItMatters || defaultGiftConfig.featuredSong?.whyItMatters || "Because it's ours",
              };
              return (
                <OurSongSection
                  key="ourSong"
                  featuredSong={songToUse}
                  additionalSongs={defaultGiftConfig.additionalSongs}
                />
              );

            case "bucketList":
              return (
                <BucketListSection
                  key="bucketList"
                  items={gift.customBucketListItems || defaultGiftConfig.bucketListItems || []}
                />
              );

            case "personalCards":
              return (
                <PersonalCardsSection
                  key="personalCards"
                  cards={gift.customPersonalCards || defaultGiftConfig.personalCards || []}
                />
              );

            case "lastSecret":
              return (
                <LastSecretSection
                  key="lastSecret"
                  revealHeading={gift.lastSecretHeading}
                  revealMessage={gift.lastSecretMessage}
                  surprisePhoto={gift.lastSecretPhoto}
                  buttonLabel={gift.lastSecretButtonLabel}
                  finalNote={gift.lastSecretFinalNote}
                />
              );

            case "finalHeart":
              return (
                <FinalHeartSection
                  key="finalHeart"
                  startDate={gift.dateOfficialCouple || gift.dateFirstMet || "2023-08-20"}
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

      {/* Recipient Footer */}
      <footer className="py-14 px-6 text-center border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] relative z-10">
        <div className="max-w-md mx-auto space-y-3">
          <p className="font-script text-2xl text-[var(--pink-strong)]">
            A little universe created just for you 💕
          </p>
          <p>
            From {gift.senderNickname} to {gift.recipientNickname}. Every memory crafted with unconditional devotion.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/studio"
              className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white text-[var(--text-secondary)] text-[11px] font-semibold hover:bg-[var(--pale-rose)] cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Creator Studio</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Creator Studio & Access Modals */}
      <CreatorStudio
        isOpen={isCreatorStudioOpen}
        onClose={() => setIsCreatorStudioOpen(false)}
      />
      <ParticipantAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </main>
  );
}

export default function GiftRecipientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center text-2xl animate-bounce mb-3 shadow-xs">
            💌
          </div>
          <p className="font-serif text-lg text-[var(--text-primary)]">
            Loading your surprise...
          </p>
        </div>
      }
    >
      <GiftRecipientContent params={params} />
    </Suspense>
  );
}
