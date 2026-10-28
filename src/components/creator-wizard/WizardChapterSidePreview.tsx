"use client";

import { useState, useRef, useEffect } from "react";
import type { CreatorConfig } from "@/lib/creator-types";

// Authentic Section Components
import { WelcomeExperience } from "@/components/sections/WelcomeExperience";
import { ObservationsSection } from "@/components/sections/ObservationsSection";
import { SecretWorldSection } from "@/components/sections/SecretWorldSection";
import { MemoriesSection } from "@/components/sections/MemoriesSection";
import { OurSongSection } from "@/components/sections/OurSongSection";
import { OpenWhenSection } from "@/components/sections/OpenWhenSection";
import { DeluluSection } from "@/components/sections/DeluluSection";
import { QuizSection } from "@/components/sections/QuizSection";
import { LettersSection } from "@/components/sections/LettersSection";
import { LittleReasonsSection } from "@/components/sections/LittleReasonsSection";
import { DigitalGiftsSection } from "@/components/sections/DigitalGiftsSection";
import { NotebookSection } from "@/components/sections/NotebookSection";
import { VoiceMessageSection } from "@/components/sections/VoiceMessageSection";
import { BucketListSection } from "@/components/sections/BucketListSection";
import { PersonalCardsSection } from "@/components/sections/PersonalCardsSection";
import { DatePlannerSection } from "@/components/planner/DatePlannerSection";
import { LastSecretSection } from "@/components/sections/LastSecretSection";
import { FinalHeartSection } from "@/components/sections/FinalHeartSection";

interface WizardChapterSidePreviewProps {
  activeChapterId: string;
  config: CreatorConfig;
  chapterNumber: number;
  chapterTitle: string;
  chapterEmoji: string;
  onChange?: (updates: Partial<CreatorConfig>) => void;
}

export function WizardChapterSidePreview({
  activeChapterId,
  config,
  chapterNumber,
  chapterTitle,
  chapterEmoji,
  onChange,
}: WizardChapterSidePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [secretWorldUnlocked, setSecretWorldUnlocked] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(650);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const DESKTOP_WIDTH = 1200;
  // Calculate responsive zoom scale to fit the exact desktop preview in side column
  const availableWidth = Math.max(300, containerWidth - 24);
  const zoomScale = Math.min(1, Math.max(0.25, availableWidth / DESKTOP_WIDTH));

  // Check how many photos exist on this screen
  const getPhotoSummary = () => {
    switch (activeChapterId) {
      case "welcome":
        return {
          count: 4,
          labels: [
            "Photo 1 (Top-Left)",
            "Photo 2 (Top-Right)",
            "Photo 3 (Bottom-Left)",
            "Photo 4 (Bottom-Right)",
          ],
        };
      case "observations": {
        const obsWithPhotos = config.observations.items.filter((o) => o.selected && o.photo);
        return {
          count: obsWithPhotos.length,
          labels: obsWithPhotos.map((o) => `Photo (${o.title || "Observation"})`),
        };
      }
      case "memories": {
        const selectedMems = config.memories.items.filter((m) => m.selected);
        const collageType = config.memories.collageType || "heart";
        const heartCount = (config.memories.heartCollage?.centerHeroPhoto ? 1 : 0) + (config.memories.heartCollage?.photos?.length || 0);
        const polaroidCount = (config.memories.polaroidCollage?.centralHeartPhoto ? 1 : 0) + (config.memories.polaroidCollage?.borderPhotos?.length || 0);
        const collageCount = collageType === "heart" ? heartCount : polaroidCount;
        return {
          count: collageCount + selectedMems.length,
          labels: [
            ...(collageType === "heart"
              ? ["Heart Center Photo", "Heart Mosaic Tiles"]
              : ["Central Heart Photo", "Polaroid Border Tiles"]),
            ...selectedMems.map((m, i) => `Photo ${i + 1} (${m.title || "Memory"})`),
          ],
        };
      }
      case "datePlanner": {
        const selectedDates = config.datePlanner.items.filter((d) => d.selected);
        return {
          count: selectedDates.length,
          labels: selectedDates.map((d, i) => `Photo ${i + 1} (${d.title || "Date"})`),
        };
      }
      case "lastSecret":
        return { count: 1, labels: ["Photo 1 (Surprise Reveal Photo)"] };
      case "finalHeart":
        return {
          count: Math.max(config.finalHeart.collagePhotos.length, 4),
          labels: config.finalHeart.collagePhotos.map((_, i) => `Photo ${i + 1}`),
        };
      case "secretWorld": {
        const photos = config.secretWorld.secretPhotos || [];
        const count = Math.max(photos.length, 2);
        return {
          count,
          labels: Array.from({ length: count }).map(
            (_, i) => `Photo ${i + 1} (${photos[i] ? "Secret Haven Card" : "Slot waiting for photo"})`
          ),
        };
      }
      default:
        return { count: 0, labels: [] };
    }
  };

  const photoSummary = getPhotoSummary();

  return (
    <div className="w-full flex flex-col rounded-3xl border-2 border-pink-200/80 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Top Window Bar */}
      <div className="bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-pink-100/90 border-b border-pink-200/80 px-4 py-3 flex items-center justify-between gap-3 select-none">
        {/* Left: Window Dots & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-amber-300 inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-2xs" />
          </div>
          <div className="truncate">
            <span className="font-serif font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-1 truncate">
              <span>{chapterEmoji}</span>
              <span className="truncate">Ch. {chapterNumber}: {chapterTitle}</span>
            </span>
          </div>
        </div>

        {/* Right: Live Sync Pill & Device Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-rounded font-bold text-emerald-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync ♡</span>
          </div>

          <div className="flex items-center bg-white rounded-full p-1 border border-pink-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              title="Desktop Screen Preview"
              className={`px-2.5 py-1 rounded-full text-[11px] font-rounded font-semibold cursor-pointer transition-colors ${
                deviceMode === "desktop"
                  ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              🖥️
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              title="Mobile Phone Preview"
              className={`px-2.5 py-1 rounded-full text-[11px] font-rounded font-semibold cursor-pointer transition-colors ${
                deviceMode === "mobile"
                  ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              📱
            </button>
          </div>
        </div>
      </div>

      {/* Photo Notification Banner if chapter contains photos */}
      {photoSummary.count > 0 && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 text-[11px] font-rounded font-semibold flex items-center justify-between gap-2 shadow-2xs">
          <span className="flex items-center gap-1.5">
            <span>📷</span>
            <span>
              This screen features <strong>{photoSummary.count} photo slot{photoSummary.count > 1 ? "s" : ""}</strong> tagged:
            </span>
            <span className="underline decoration-pink-200 font-bold">
              {photoSummary.count === 1 ? "Photo 1" : `Photo 1 to Photo ${photoSummary.count}`}
            </span>
          </span>
          <span className="text-[10px] text-pink-100 hidden sm:inline">
            Matches inputs on the left 👈
          </span>
        </div>
      )}

      {/* Chapter 3 Secret Haven Toggle Switcher */}
      {activeChapterId === "secretWorld" && (
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-b border-pink-200/80 px-4 py-2 flex items-center justify-between gap-2 text-xs font-rounded">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px]">👁️</span>
            <span className="text-[var(--text-secondary)] font-medium truncate">
              Previewing:{" "}
              <strong className="text-[var(--pink-strong)]">
                {secretWorldUnlocked ? "Unlocked Haven (Letter + Gallery + Jokes)" : "Locked Door (Passcode Test)"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-xl border border-pink-200/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setSecretWorldUnlocked(true)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                secretWorldUnlocked
                  ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-pink-50"
              }`}
            >
              <span>🔓</span>
              <span>Unlocked Haven</span>
            </button>
            <button
              type="button"
              onClick={() => setSecretWorldUnlocked(false)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                !secretWorldUnlocked
                  ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-pink-50"
              }`}
            >
              <span>🔒</span>
              <span>Test Locked Door</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Preview Canvas */}
      <div
        ref={containerRef}
        className="relative p-2 sm:p-4 bg-gradient-to-b from-[#FFF5F9] via-[#FFF9FB] to-[#FAF4FF] min-h-[580px] max-h-[calc(100vh-170px)] overflow-y-auto overflow-x-hidden scrollbar-thin"
      >
        {deviceMode === "desktop" ? (
          <div
            style={{
              width: `${DESKTOP_WIDTH}px`,
              zoom: zoomScale,
            }}
            className="origin-top-left transition-all duration-200 rounded-3xl overflow-hidden shadow-sm border border-pink-100 bg-white"
          >
            {renderActiveChapterSection()}
          </div>
        ) : (
          <div className="mx-auto max-w-[375px] bg-white rounded-[38px] p-2 shadow-2xl border-4 border-gray-800 ring-4 ring-pink-200/50 min-h-[580px] overflow-hidden">
            {renderActiveChapterSection()}
          </div>
        )}
      </div>
    </div>
  );

  function renderActiveChapterSection() {
    switch (activeChapterId) {
      case "welcome":
        return (
          <WelcomeExperience
            recipientNickname={config.recipientNickname || "Baby"}
            title={config.welcome.heading || config.websiteTitle || "Dear, Us"}
            eyebrowLabel={config.welcome.eyebrowLabel}
            handwrittenNote={config.welcome.handwrittenNote}
            subtitle={config.welcome.subtitle || "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words."}
            message={config.welcome.quote || config.welcome.message || "Of all the stories life could give me, you're the one I'd choose to keep living."}
            buttonText={config.welcome.buttonText || "Come inside, my love ♡"}
            polaroids={config.welcome.polaroids}
            showPhotoBadges={true}
            character={config.welcome.selectedIllustration}
            deviceMode={deviceMode}
            onEnter={() => {}}
          />
        );

      case "observations":
        return (
          <ObservationsSection
            observations={config.observations.items.filter((i) => i.selected)}
          />
        );

      case "secretWorld":
        return (
          <SecretWorldSection
            initialHint={config.secretWorld.hint}
            customSecretLetter={config.secretWorld.secretLetter}
            customPhotos={config.secretWorld.secretPhotos}
            customPasscode={config.secretWorld.password}
            customInsideJokes={config.secretWorld.insideJokes}
            initialUnlocked={secretWorldUnlocked}
            showPhotoBadges={true}
            isPreviewMode={true}
            onLockChange={(unlocked) => setSecretWorldUnlocked(unlocked)}
          />
        );

      case "memories":
        return (
          <MemoriesSection
            memories={config.memories.items.filter((m) => m.selected)}
            showPhotoBadges={true}
            collageType={config.memories.collageType || "heart"}
            onCollageTypeChange={(type) => {
              onChange?.({
                memories: {
                  ...config.memories,
                  collageType: type,
                },
              });
            }}
            heartCenterPhoto={config.memories.heartCollage?.centerHeroPhoto}
            heartCenterCaption={config.memories.heartCollage?.centerHeroCaption}
            heartPhotos={config.memories.heartCollage?.photos}
            heartCaption={config.memories.heartCollage?.caption}
            polaroidCenterPhoto={config.memories.polaroidCollage?.centralHeartPhoto}
            polaroidCenterCaption={config.memories.polaroidCollage?.centralCaption}
            polaroidBorderPhotos={config.memories.polaroidCollage?.borderPhotos}
          />
        );

      case "ourSong":
        return (
          <OurSongSection
            featuredSong={{
              heading: config.ourSong.heading,
              subtitle: config.ourSong.subtitle,
              title: config.ourSong.title || "Golden Hour",
              artist: config.ourSong.artist || "JVKE",
              dedicationHeading: config.ourSong.dedicationHeading,
              whyItMatters:
                config.ourSong.whyItMatters ||
                "The melody that will always remind me of the way you smile at golden hour.",
              dedication: config.ourSong.dedication || "To the brightest light in my world.",
            }}
          />
        );

      case "openWhenLetters":
      case "openWhen":
        return (
          <OpenWhenSection
            letters={config.openWhen.items.filter((i) => i.selected)}
          />
        );

      case "deluluMode":
      case "delulu":
        return (
          <DeluluSection
            scenarios={config.delulu.items.filter((i) => i.selected)}
          />
        );

      case "quiz":
        return (
          <QuizSection
            questions={config.quiz.questions.filter((q) => q.selected)}
          />
        );

      case "letters":
        return (
          <LettersSection
            letters={config.letters.items.filter((l) => l.selected)}
          />
        );

      case "littleReasons":
        return (
          <LittleReasonsSection
            reasons={config.littleReasons.items.filter((r) => r.selected !== false)}
            title={config.littleReasons.heading}
            subtitle={config.littleReasons.subtitle}
          />
        );

      case "digitalGifts":
        return (
          <DigitalGiftsSection
            gifts={config.digitalGifts.items.filter((g) => g.selected)}
          />
        );

      case "notebook":
        return <NotebookSection />;

      case "voice":
        return <VoiceMessageSection />;

      case "bucketList":
        return (
          <BucketListSection
            items={config.bucketList.items.filter((i) => i.selected)}
          />
        );

      case "personalCards":
        return (
          <PersonalCardsSection
            cards={config.personalCards.items.filter((i) => i.selected)}
          />
        );

      case "datePlanner":
        return <DatePlannerSection />;

      case "lastSecret":
        return (
          <LastSecretSection
            revealHeading={config.lastSecret.revealHeading}
            revealMessage={config.lastSecret.revealMessage}
            surprisePhoto={config.lastSecret.surprisePhoto}
            buttonLabel={config.lastSecret.buttonLabel}
            finalNote={config.lastSecret.finalNote}
          />
        );

      case "finalHeart":
        return (
          <FinalHeartSection
            startDate={config.finalHeart.startDate || config.anniversaryDate || "2023-08-20"}
            closingHeading={config.finalHeart.closingHeading}
            finalLetter={config.finalHeart.finalMessage}
            finalMessage={config.finalHeart.finalMessage}
            senderName={config.senderNickname || config.senderName || "Babe"}
            signature={config.finalHeart.signature}
            closingButtonLabel={config.finalHeart.closingButtonLabel}
            centerPhoto={config.finalHeart.finalPhoto}
            photos={config.finalHeart.collagePhotos.map((url, i) => ({
              id: `mosaic_${i}`,
              url,
              caption: `Our moment ${i + 1}`,
            }))}
          />
        );

      default:
        return (
          <div className="p-8 text-center text-gray-500 font-rounded text-sm">
            Select a chapter to preview
          </div>
        );
    }
  }
}
