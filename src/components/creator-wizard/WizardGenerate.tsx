"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CreatorConfig } from "@/lib/creator-types";

interface WizardGenerateProps {
  config: CreatorConfig;
  onBack: () => void;
}

export function WizardGenerate({ config, onBack }: WizardGenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Assemble full GiftRecord payload
      const payload = {
        title: config.websiteTitle.trim() || "Dear, Us",
        senderName: config.senderName.trim() || "Your Love",
        senderNickname: config.senderNickname.trim() || "Babe",
        recipientName: config.recipientName.trim() || "My Everything",
        recipientNickname: config.recipientNickname.trim() || "Baby",
        dateOfficialCouple: config.anniversaryDate || undefined,
        welcomeTitle: config.welcome.heading || config.websiteTitle,
        welcomeEyebrow: config.welcome.eyebrowLabel,
        welcomeHandwrittenNote: config.welcome.handwrittenNote,
        welcomeSubtitle: config.welcome.subtitle || "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words.",
        welcomeMessage: config.welcome.quote || config.welcome.message || config.openingLine,
        welcomePolaroids: config.welcome.polaroids,
        welcomeButtonText: config.welcome.buttonText,
        welcomeIllustration: config.welcome.selectedIllustration,
        enabledSections: config.selectedChapterIds,
        sectionOrder: config.chapterOrder,
        finalLetter: config.finalHeart.finalMessage,
        finalMessage: config.finalHeart.finalMessage,
        secretPassword: config.secretWorld.password || "iloveyou",
        secretHint: config.secretWorld.hint || "Three words, no spaces...",
        featuredSong: {
          title: config.ourSong.title,
          artist: config.ourSong.artist,
          dedication: config.ourSong.dedication,
          whyItMatters: config.ourSong.whyItMatters,
        },
        customObservations: config.observations.items.filter((i) => i.selected),
        customMemories: config.memories.items.filter((m) => m.selected),
        memoriesCollageType: config.memories.collageType || "heart",
        memoriesHeartCollage: config.memories.heartCollage,
        memoriesPolaroidCollage: config.memories.polaroidCollage,
        customLetters: config.letters.items.filter((l) => l.selected),
        customOpenWhenLetters: config.openWhen.items.filter((o) => o.selected),
        customLittleReasons: config.littleReasons.items.filter((r) => r.selected),
        customDigitalGifts: config.digitalGifts.items.filter((g) => g.selected),
        customDeluluScenarios: config.delulu.items.filter((d) => d.selected),
        customQuizQuestions: config.quiz.questions.filter((q) => q.selected),
        customBucketListItems: config.bucketList.items.filter((b) => b.selected),
        customPersonalCards: config.personalCards.items.filter((p) => p.selected),
        customDateIdeas: config.datePlanner.items.filter((d) => d.selected),
        lastSecretHeading: config.lastSecret.revealHeading,
        lastSecretMessage: config.lastSecret.revealMessage,
        lastSecretPhoto: config.lastSecret.surprisePhoto,
        lastSecretButtonLabel: config.lastSecret.buttonLabel,
        lastSecretFinalNote: config.lastSecret.finalNote,
        designPreferences: config.preferences,
        privacy: {
          isPasswordProtected: false,
          passcode: "love2024",
          recipientInviteToken: `us-${Math.random().toString(36).slice(2, 7)}`,
          invitationStatus: "active",
          allowResponses: true,
          allowRecipientContributions: true,
        },
        status: "published",
      };

      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create gift on server");
      }

      const data = await res.json();
      const slug = data.gift?.slug || "our-story";
      setGeneratedSlug(slug);
    } catch (err) {
      console.error("Generation error", err);
      // Fallback local slug
      const localSlug = (config.websiteTitle || "dear-us")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setGeneratedSlug(localSlug || "dear-us");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullShareUrl = () => {
    if (typeof window === "undefined") return `/gift/${generatedSlug}`;
    return `${window.location.origin}/gift/${generatedSlug}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center">
      {!generatedSlug ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--pale-rose)] to-pink-100 flex items-center justify-center text-4xl shadow-inner border border-pink-200">
            💌
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block">
            Step 8 · Final Generation
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Ready to bring your little world to life?
          </h2>

          <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Your website has been personalized with your names (<strong>{config.senderNickname}</strong> &{" "}
            <strong>{config.recipientNickname}</strong>), <strong>{config.selectedChapterIds.length}</strong> selected
            chapters, custom love letters, memories, and date adventures.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
            >
              ← Review Details
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-bold text-base sm:text-lg shadow-xl shadow-pink-300/40 hover:shadow-2xl cursor-pointer transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Weaving your love story...</span>
                </>
              ) : (
                <>
                  <span>Create our little world ♡</span>
                  <span className="text-xl">✨</span>
                </>
              )}
            </motion.button>
          </div>

          {errorMessage && (
            <p className="text-xs font-rounded text-rose-500 font-semibold mt-2">
              {errorMessage}
            </p>
          )}
        </motion.div>
      ) : (
        /* Celebration Success Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-14 shadow-2xl space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-pink-400 via-[var(--pink-primary)] to-[var(--pink-strong)] text-white flex items-center justify-center text-5xl shadow-xl shadow-pink-300/50">
            🎉
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block">
            Website Successfully Created!
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Your little world is alive ♡
          </h2>

          <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Every memory, word, and photograph you configured has been woven into a dedicated romantic website for{" "}
            <strong>{config.recipientNickname}</strong>.
          </p>

          {/* Shareable Link Box */}
          <div className="bg-[var(--pale-rose)]/50 p-4 sm:p-5 rounded-2xl border border-[var(--pink-primary)]/30 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-mono text-xs text-[var(--text-primary)] truncate max-w-xs sm:max-w-sm">
              {getFullShareUrl()}
            </span>

            <button
              type="button"
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-xl bg-white border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              {copied ? "✓ Copied!" : "Copy Link 💌"}
            </button>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/gift/${generatedSlug}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-bold text-sm sm:text-base shadow-lg shadow-pink-300/40 hover:shadow-xl cursor-pointer transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Visit Your Website Now 🚀</span>
            </Link>

            <Link
              href="/studio"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Open Studio Dashboard ⚙️</span>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
