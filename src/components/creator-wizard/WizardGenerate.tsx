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
  const [rawInviteToken, setRawInviteToken] = useState<string | null>(null);
  const [creatorPasscode, setCreatorPasscode] = useState<string>("love2024");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setIsAuthError(false);

    try {
      const enteredPasscode = config.secretWorld.password?.trim() || "love2024";

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
        welcomeSubtitle:
          config.welcome.subtitle ||
          "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words.",
        welcomeMessage: config.welcome.quote || config.welcome.message || config.openingLine,
        welcomePolaroids: config.welcome.polaroids,
        welcomeButtonText: config.welcome.buttonText,
        welcomeIllustration: config.welcome.selectedIllustration,
        enabledSections: config.selectedChapterIds,
        sectionOrder: config.chapterOrder,
        finalLetter: config.finalHeart.finalMessage,
        finalMessage: config.finalHeart.finalMessage,
        secretPassword: enteredPasscode,
        secretHint: config.secretWorld.hint || "Three words, no spaces...",
        secretContent: config.secretWorld.secretLetter,
        featuredSong: {
          heading: config.ourSong.heading,
          subtitle: config.ourSong.subtitle,
          title: config.ourSong.title,
          artist: config.ourSong.artist,
          dedicationHeading: config.ourSong.dedicationHeading,
          dedication: config.ourSong.dedication,
          whyItMatters: config.ourSong.whyItMatters,
          coverArtwork: config.ourSong.coverArtwork,
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
        finalHeading: config.finalHeart.closingHeading,
        finalSignature: config.finalHeart.signature,
        finalPhoto: config.finalHeart.finalPhoto,
        finalCenterPhoto: config.finalHeart.finalPhoto,
        finalCollagePhotos: config.finalHeart.collagePhotos,
        designPreferences: config.preferences,
        privacy: {
          isPasswordProtected: Boolean(config.secretWorld.password?.trim()),
          passcode: enteredPasscode,
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
        if (res.status === 401) {
          setIsAuthError(true);
          setErrorMessage("Please log in to create your gift");
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.error || "Failed to create gift on server. Please try again.");
        return;
      }

      const data = await res.json();
      const slug = data.gift?.slug || "our-story";
      const rawToken = data.rawInviteToken || "";
      setGeneratedSlug(slug);
      setRawInviteToken(rawToken);
      setCreatorPasscode(enteredPasscode);
    } catch (err) {
      console.error("Generation error", err);
      setErrorMessage("Network error: Unable to connect to server. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullShareUrl = () => {
    const query = rawInviteToken ? `?token=${encodeURIComponent(rawInviteToken)}` : "";
    if (typeof window === "undefined") return `/gift/${generatedSlug}${query}`;
    return `${window.location.origin}/gift/${generatedSlug}${query}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getFullShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyPasscode = () => {
    navigator.clipboard.writeText(creatorPasscode);
    setCopiedPasscode(true);
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  const copyAll = () => {
    const text = `💌 A special romantic world for you:\nInvite Link: ${getFullShareUrl()}\nPasscode: ${creatorPasscode}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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

          {/* Error Message Box */}
          {errorMessage && (
            <div className="pt-2">
              {isAuthError ? (
                <div className="p-5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-sm font-rounded space-y-3 text-center max-w-md mx-auto shadow-sm">
                  <div className="text-2xl">🔒</div>
                  <p className="font-bold text-rose-700">Please log in to create your gift</p>
                  <p className="text-xs text-rose-600 leading-relaxed">
                    You must be logged in with a creator account to save and manage your relationship website.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/login?next=/create"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-pink-200"
                    >
                      <span>Log In to Continue</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-rounded text-rose-600 font-semibold max-w-md mx-auto">
                  {errorMessage}
                </div>
              )}
            </div>
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

          {/* Recipient Credentials Box */}
          <div className="bg-[var(--pale-rose)]/40 p-5 sm:p-6 rounded-3xl border border-[var(--pink-primary)]/30 max-w-xl mx-auto space-y-4 text-left">
            {/* Full Partner Invite Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded block">
                💌 Partner Invite Link (With Secret Token)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  className="font-mono text-xs text-[var(--text-primary)] bg-transparent border-none outline-none flex-1 px-2 select-all truncate"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs font-rounded font-bold hover:opacity-90 cursor-pointer transition-opacity shrink-0 shadow-2xs"
                >
                  {copiedLink ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Secret Passcode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded block">
                🔐 Unlock Passcode
              </label>
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs">
                <span className="font-mono text-sm font-bold text-[var(--romantic-plum)] px-2">
                  {creatorPasscode}
                </span>
                <button
                  type="button"
                  onClick={copyPasscode}
                  className="px-4 py-2 rounded-xl bg-white border border-[var(--pink-primary)] text-[var(--pink-strong)] text-xs font-rounded font-bold hover:bg-[var(--pale-rose)] cursor-pointer transition-colors shrink-0 shadow-2xs"
                >
                  {copiedPasscode ? "✓ Copied!" : "Copy Passcode"}
                </button>
              </div>
            </div>

            {/* One-time Warning Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-rounded flex items-start gap-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950">Save this now. It can&apos;t be shown again.</p>
                <p className="text-amber-800 leading-relaxed">
                  For your relationship&apos;s privacy, tokens and passcodes are cryptographically hashed on the server and cannot be retrieved after leaving this page.
                </p>
              </div>
            </div>

            {/* Copy All Button */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={copyAll}
                className="w-full py-2.5 rounded-xl border border-[var(--pink-primary)] bg-white text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors shadow-2xs"
              >
                {copiedAll ? "✓ Copied Link & Passcode!" : "Copy Both Link & Passcode 📋"}
              </button>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={getFullShareUrl()}
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
