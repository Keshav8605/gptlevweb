"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_18_CHAPTERS } from "@/lib/creator-defaults";
import type { CreatorConfig } from "@/lib/creator-types";

// Section components for preview
import { WelcomeExperience } from "@/components/sections/WelcomeExperience";
import { ObservationsSection } from "@/components/sections/ObservationsSection";
import { MemoriesSection } from "@/components/sections/MemoriesSection";
import { SecretWorldSection } from "@/components/sections/SecretWorldSection";
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
import { OpenWhenSection } from "@/components/sections/OpenWhenSection";
import { OurSongSection } from "@/components/sections/OurSongSection";
import { LastSecretSection } from "@/components/sections/LastSecretSection";
import { FinalHeartSection } from "@/components/sections/FinalHeartSection";

interface WizardPreviewProps {
  config: CreatorConfig;
  onEditChapter: (chapterId: string) => void;
  onReorderChapters: (newOrder: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardPreview({
  config,
  onEditChapter,
  onReorderChapters,
  onNext,
  onBack,
}: WizardPreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  const orderedSelectedChapters = config.chapterOrder
    .map((id) => ALL_18_CHAPTERS.find((ch) => ch.id === id))
    .filter(Boolean)
    .filter((ch) => config.selectedChapterIds.includes(ch!.id)) as typeof ALL_18_CHAPTERS;

  const [previewChapterId, setPreviewChapterId] = useState<string>(
    orderedSelectedChapters[0]?.id || "welcome"
  );

  const moveChapter = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedSelectedChapters.length) return;

    const newOrder = [...orderedSelectedChapters.map((c) => c.id)];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onReorderChapters(newOrder);
  };

  const currentPreviewChapter =
    orderedSelectedChapters.find((c) => c.id === previewChapterId) ||
    orderedSelectedChapters[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header & Device Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block">
            Step 7 · Live Preview
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Explore Your Personalized Website
          </h2>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-[var(--border-subtle)] shadow-xs">
          <button
            type="button"
            onClick={() => setDeviceMode("desktop")}
            className={`px-4 py-1.5 rounded-full text-xs font-rounded font-semibold cursor-pointer transition-colors ${
              deviceMode === "desktop"
                ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            🖥️ Desktop View
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`px-4 py-1.5 rounded-full text-xs font-rounded font-semibold cursor-pointer transition-colors ${
              deviceMode === "mobile"
                ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            📱 Mobile View
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Controls & Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapter Order & Quick-Jump Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[var(--border-subtle)] shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded block mb-3">
              Chapters in Website ({orderedSelectedChapters.length})
            </span>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {orderedSelectedChapters.map((ch, idx) => {
                const isActive = ch.id === previewChapterId;
                return (
                  <div
                    key={ch.id}
                    className={`p-2.5 rounded-2xl border text-xs font-rounded flex items-center justify-between gap-1 transition-all ${
                      isActive
                        ? "border-[var(--pink-primary)] bg-[var(--pale-rose)]/60 text-[var(--pink-strong)] font-bold shadow-2xs"
                        : "border-transparent hover:border-pink-200 bg-white/70 text-[var(--text-secondary)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewChapterId(ch.id)}
                      className="truncate flex items-center gap-1.5 flex-1 text-left cursor-pointer"
                    >
                      <span>{ch.emoji}</span>
                      <span className="truncate">{ch.title}</span>
                    </button>

                    {/* Move Up/Down Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveChapter(idx, "up")}
                        className="p-1 hover:text-black disabled:opacity-20 cursor-pointer"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedSelectedChapters.length - 1}
                        onClick={() => moveChapter(idx, "down")}
                        className="p-1 hover:text-black disabled:opacity-20 cursor-pointer"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Edit Current Chapter Button */}
          <button
            type="button"
            onClick={() => onEditChapter(previewChapterId)}
            className="w-full py-3 px-4 rounded-2xl border border-[var(--pink-primary)] bg-white text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>✏️</span>
            <span>Edit this chapter&apos;s details</span>
          </button>
        </div>

        {/* Preview Frame */}
        <div className="lg:col-span-3 flex justify-center">
          <div
            className={`transition-all duration-300 w-full overflow-hidden rounded-3xl border-4 border-white/80 shadow-2xl bg-[var(--bg-main)] min-h-[600px] max-h-[750px] overflow-y-auto ${
              deviceMode === "mobile" ? "max-w-sm ring-8 ring-black/10" : "max-w-full"
            }`}
          >
            {/* Top Chapter Breadcrumb Bar */}
            <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 py-2 flex items-center justify-between text-xs font-rounded">
              <span className="font-bold text-[var(--pink-strong)]">
                {currentPreviewChapter.emoji} {currentPreviewChapter.title}
              </span>

              <button
                type="button"
                onClick={() => onEditChapter(currentPreviewChapter.id)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--pink-strong)] underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Render Preview Component based on active preview chapter */}
            <div className="p-2 sm:p-4">
              {currentPreviewChapter.id === "welcome" && (
                <WelcomeExperience
                  title={config.welcome.heading || config.websiteTitle}
                  eyebrowLabel={config.welcome.eyebrowLabel}
                  handwrittenNote={config.welcome.handwrittenNote}
                  subtitle={config.welcome.subtitle || "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words."}
                  message={config.welcome.quote || config.welcome.message || config.openingLine}
                  buttonText={config.welcome.buttonText}
                  polaroids={config.welcome.polaroids}
                  character={config.welcome.selectedIllustration}
                  recipientNickname={config.recipientNickname || "Baby"}
                  onEnter={() => {}}
                />
              )}

              {currentPreviewChapter.id === "observations" && (
                <ObservationsSection
                  observations={config.observations.items.filter((i) => i.selected)}
                />
              )}

              {currentPreviewChapter.id === "secretWorld" && (
                <SecretWorldSection initialHint={config.secretWorld.hint} />
              )}

              {currentPreviewChapter.id === "memories" && (
                <MemoriesSection
                  memories={config.memories.items.filter((m) => m.selected)}
                  showPhotoBadges={true}
                  collageType={config.memories.collageType || "heart"}
                  heartCenterPhoto={config.memories.heartCollage?.centerHeroPhoto}
                  heartCenterCaption={config.memories.heartCollage?.centerHeroCaption}
                  heartPhotos={config.memories.heartCollage?.photos}
                  heartCaption={config.memories.heartCollage?.caption}
                  polaroidCenterPhoto={config.memories.polaroidCollage?.centralHeartPhoto}
                  polaroidCenterCaption={config.memories.polaroidCollage?.centralCaption}
                  polaroidBorderPhotos={config.memories.polaroidCollage?.borderPhotos}
                />
              )}

              {currentPreviewChapter.id === "ourSong" && (
                <OurSongSection
                  featuredSong={{
                    title: config.ourSong.title,
                    artist: config.ourSong.artist,
                    whyItMatters: config.ourSong.whyItMatters,
                    dedication: config.ourSong.dedication,
                  }}
                />
              )}

              {currentPreviewChapter.id === "openWhenLetters" && (
                <OpenWhenSection
                  letters={config.openWhen.items.filter((i) => i.selected)}
                />
              )}

              {currentPreviewChapter.id === "deluluMode" && <DeluluSection />}

              {currentPreviewChapter.id === "quiz" && <QuizSection />}

              {currentPreviewChapter.id === "letters" && (
                <LettersSection
                  letters={config.letters.items.filter((l) => l.selected)}
                />
              )}

              {currentPreviewChapter.id === "littleReasons" && (
                <LittleReasonsSection
                  reasons={config.littleReasons.items.filter((r) => r.selected)}
                />
              )}

              {currentPreviewChapter.id === "digitalGifts" && (
                <DigitalGiftsSection
                  gifts={config.digitalGifts.items.filter((g) => g.selected)}
                />
              )}

              {currentPreviewChapter.id === "notebook" && <NotebookSection />}

              {currentPreviewChapter.id === "voice" && <VoiceMessageSection />}

              {currentPreviewChapter.id === "bucketList" && (
                <BucketListSection
                  items={config.bucketList.items.filter((i) => i.selected)}
                />
              )}

              {currentPreviewChapter.id === "personalCards" && (
                <PersonalCardsSection
                  cards={config.personalCards.items.filter((i) => i.selected)}
                />
              )}

              {currentPreviewChapter.id === "datePlanner" && <DatePlannerSection />}

              {currentPreviewChapter.id === "lastSecret" && (
                <LastSecretSection
                  revealHeading={config.lastSecret.revealHeading}
                  revealMessage={config.lastSecret.revealMessage}
                  surprisePhoto={config.lastSecret.surprisePhoto}
                  buttonLabel={config.lastSecret.buttonLabel}
                  finalNote={config.lastSecret.finalNote}
                />
              )}

              {currentPreviewChapter.id === "finalHeart" && (
                <FinalHeartSection
                  startDate={config.finalHeart.startDate || config.anniversaryDate || "2023-08-20"}
                  finalLetter={config.finalHeart.finalMessage}
                  finalMessage={config.finalHeart.finalMessage}
                  senderName={config.senderNickname || config.senderName || "Babe"}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-10">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
        >
          ← Back to Aesthetics
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-9 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-sm sm:text-base font-rounded font-bold shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-400/50 cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <span>Ready to Generate Website ♡</span>
        </button>
      </div>
    </div>
  );
}
