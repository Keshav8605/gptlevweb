"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { GiftRecord } from "@/lib/server-db";

const availableSectionsConfig = [
  { id: "welcome", label: "Welcome Surprise", emoji: "💌", desc: "Interactive envelope opening with personalized letter" },
  { id: "observations", label: "Things I Noticed", emoji: "👀", desc: "Little habits, adorable quirks, and sweet traits" },
  { id: "memories", label: "Our Memories Scrapbook", emoji: "📸", desc: "Polaroid cards with dates, locations, and recollection notes" },
  { id: "secretWorld", label: "Our Secret World", emoji: "🔒", desc: "Password-protected haven with hints and private polaroids" },
  { id: "deluluMode", label: "Delulu Mode", emoji: "🦋", desc: "Playful scenario-based relationship game with custom reactions" },
  { id: "quiz", label: "Relationship Questionnaire", emoji: "❓", desc: "Side-by-side answer comparison and scorecard" },
  { id: "letters", label: "Letters I Don't Say Enough", emoji: "💌", desc: "Expandable love letters with signatures and drop caps" },
  { id: "notebook", label: "Our Shared Notebook", emoji: "📖", desc: "Two-way shared couple journal with prompts and replies" },
  { id: "voice", label: "Voice Whispers", emoji: "🎙️", desc: "Genuine audio notes and recorded voice messages" },
  { id: "datePlanner", label: "Plan Our Next Adventure ♡", emoji: "🗺️", desc: "Collaborative date ideas, proposals, calendar & countdown" },
  { id: "openWhenLetters", label: "Open When Envelopes", emoji: "✉️", desc: "Sealed envelopes for happy, lonely, or celebratory days" },
  { id: "littleReasons", label: "Little Reasons Why I Love You", emoji: "💗", desc: "Appreciation cards with shuffle and bookmarking" },
  { id: "digitalGifts", label: "Little Gifts I Owe You", emoji: "🎁", desc: "Redeemable digital vouchers with claim verification" },
  { id: "ourSong", label: "Our Song Dedicated Melody", emoji: "🎵", desc: "Spinning vinyl record and audio chime melody" },
  { id: "finalHeart", label: "Forever & Always", emoji: "❤️", desc: "Live relationship counter (D/H/M/S) and final heart mosaic" },
];

interface GiftCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (giftData: Partial<GiftRecord>, shouldPublish: boolean) => Promise<boolean>;
}

export function GiftCreationWizard({
  isOpen,
  onClose,
  onComplete,
}: GiftCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Wizard form states
  const [giftTitle, setGiftTitle] = useState("A Little World For You 💕");
  const [senderName, setSenderName] = useState("Your Love");
  const [senderNickname, setSenderNickname] = useState("Babe");
  const [recipientName, setRecipientName] = useState("My Everything");
  const [recipientNickname, setRecipientNickname] = useState("Baby");
  const [dateType, setDateType] = useState<"official" | "met">("official");
  const [relationshipDate, setRelationshipDate] = useState("2023-08-20");
  const [welcomeTitle, setWelcomeTitle] = useState("I Made Something For You");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("A tiny digital universe, just for us ✨");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Because you deserve to know how deeply you are loved. Every single pixel on this page was crafted with you in my heart. Take your time exploring — this is all for you."
  );

  const [selectedSections, setSelectedSections] = useState<string[]>(
    availableSectionsConfig.map((s) => s.id)
  );

  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  );
  const [firstLetter, setFirstLetter] = useState(
    "The day you came into my life, the whole world shifted into softer colors."
  );

  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [creatorPasscode, setCreatorPasscode] = useState("love2024");
  const [allowResponses, setAllowResponses] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      if (selectedSections.length <= 1) return;
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleFinishWizard = async (shouldPublish: boolean) => {
    setIsSubmitting(true);
    const newGiftData: Partial<GiftRecord> = {
      title: giftTitle.trim() || "My Romantic Gift ♡",
      senderName: senderName.trim() || "Your Love",
      senderNickname: senderNickname.trim() || "Babe",
      recipientName: recipientName.trim() || "My Everything",
      recipientNickname: recipientNickname.trim() || "Baby",
      dateOfficialCouple: dateType === "official" ? relationshipDate : undefined,
      dateFirstMet: dateType === "met" ? relationshipDate : undefined,
      welcomeTitle: welcomeTitle.trim() || "I Made Something For You",
      welcomeSubtitle: welcomeSubtitle.trim() || "A little world just for us ✨",
      welcomeMessage: welcomeMessage.trim(),
      enabledSections: selectedSections,
      sectionOrder: selectedSections,
      finalLetter: firstLetter.trim(),
      privacy: {
        isPasswordProtected,
        passcode: creatorPasscode || "love2024",
        recipientInviteToken: `sweetheart-${Math.random().toString(36).slice(2, 6)}`,
        invitationStatus: "active",
        allowResponses,
        allowRecipientContributions: true,
      },
    };

    const ok = await onComplete(newGiftData, shouldPublish);
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto flex flex-col justify-between"
        >
          {/* Header & Step Stepper */}
          <div className="space-y-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    Create a Personalized Gift
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Step {currentStep} of {totalSteps}: guided romantic wizard
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Contents */}
          <div className="py-2 space-y-5 text-xs text-[var(--text-primary)] flex-1">
            {/* STEP 1: Name Gift */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 1: What is the title of your gift?
                </h4>
                <p className="text-[var(--text-secondary)]">
                  Choose an affectionate title for this digital world.
                </p>
                <input
                  type="text"
                  required
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  placeholder="e.g. A Little World For You 💕"
                  className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] font-serif text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--pink-primary)]"
                />
              </div>
            )}

            {/* STEP 2: Sender Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 2: Who is this gift from?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold block">Your Real Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Keshav"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold block">Your Pet Name / Nickname</label>
                    <input
                      type="text"
                      value={senderNickname}
                      onChange={(e) => setSenderNickname(e.target.value)}
                      placeholder="e.g. Babe"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Recipient Details */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 3: Who is this gift for?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold block">Their Real Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Rose"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold block">Their Pet Name / Sweetheart Nickname</label>
                    <input
                      type="text"
                      value={recipientNickname}
                      onChange={(e) => setRecipientNickname(e.target.value)}
                      placeholder="e.g. Baby"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Relationship Date */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 4: Your Meaningful Relationship Date
                </h4>
                <p className="text-[var(--text-secondary)]">
                  Powers the live milestone relationship counter (Days, Hours, Minutes, Seconds).
                </p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="dateType"
                      checked={dateType === "official"}
                      onChange={() => setDateType("official")}
                      className="accent-[var(--pink-primary)]"
                    />
                    <span>Official Anniversary Date</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="dateType"
                      checked={dateType === "met"}
                      onChange={() => setDateType("met")}
                      className="accent-[var(--pink-primary)]"
                    />
                    <span>The Day We First Met</span>
                  </label>
                </div>
                <input
                  type="date"
                  value={relationshipDate}
                  onChange={(e) => setRelationshipDate(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] text-xs font-semibold"
                />
              </div>
            )}

            {/* STEP 5: Welcome Message */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 5: Welcome Envelope Surprise
                </h4>
                <p className="text-[var(--text-secondary)]">
                  The initial envelope and letter greeting your partner when they first open the website.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    placeholder="Welcome headline..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                  />
                  <input
                    type="text"
                    value={welcomeSubtitle}
                    onChange={(e) => setWelcomeSubtitle(e.target.value)}
                    placeholder="Welcome subtitle..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                  />
                  <textarea
                    rows={3}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Envelope letter text..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 6: Select Sections */}
            {currentStep === 6 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    Step 6: Choose Chapters & Sections ({selectedSections.length} selected)
                  </h4>
                  <button
                    onClick={() =>
                      setSelectedSections(
                        selectedSections.length === availableSectionsConfig.length
                          ? ["welcome", "finalHeart"]
                          : availableSectionsConfig.map((s) => s.id)
                      )
                    }
                    className="text-[11px] text-[var(--pink-strong)] underline cursor-pointer"
                  >
                    {selectedSections.length === availableSectionsConfig.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {availableSectionsConfig.map((sec) => {
                    const isSelected = selectedSections.includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleToggleSection(sec.id)}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[var(--pale-rose)]/50 border-[var(--pink-primary)]"
                            : "bg-white border-[var(--border-subtle)] opacity-70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 accent-[var(--pink-primary)]"
                        />
                        <div>
                          <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1">
                            <span>{sec.emoji}</span>
                            <span>{sec.label}</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {sec.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: Initial Content */}
            {currentStep === 7 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 7: Key Memory Photo & First Letter
                </h4>
                <div className="space-y-2">
                  <label className="font-semibold block">Cover / Memory Photograph URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]"
                  />
                  <label className="font-semibold block pt-1">Heartfelt Love Letter Snippet</label>
                  <textarea
                    rows={3}
                    value={firstLetter}
                    onChange={(e) => setFirstLetter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 8: Privacy & Access */}
            {currentStep === 8 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 8: Privacy & Response Permissions
                </h4>
                <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block">Password Protection</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Require a passcode to view the website</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                      className="accent-[var(--pink-primary)] w-4 h-4"
                    />
                  </label>

                  {isPasswordProtected && (
                    <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                      <label className="font-semibold block text-[11px]">Creator Passcode</label>
                      <input
                        type="text"
                        value={creatorPasscode}
                        onChange={(e) => setCreatorPasscode(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[var(--border-subtle)]">
                    <div>
                      <span className="font-semibold block">Enable Two-Way Responses</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Allow partner to leave comments, voice notes & quiz answers</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowResponses}
                      onChange={(e) => setAllowResponses(e.target.checked)}
                      className="accent-[var(--pink-primary)] w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 9: Summary & Preview */}
            {currentStep === 9 && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Step 9: Gift Summary
                </h4>
                <div className="p-4 rounded-2xl bg-[var(--pale-rose)]/50 border border-[var(--border-medium)] space-y-2 text-xs">
                  <p><strong>Title:</strong> {giftTitle}</p>
                  <p><strong>From:</strong> {senderName} ({senderNickname}) <strong>To:</strong> {recipientName} ({recipientNickname})</p>
                  <p><strong>Relationship Date:</strong> {relationshipDate}</p>
                  <p><strong>Active Chapters:</strong> {selectedSections.length} sections included</p>
                  <p><strong>Privacy:</strong> {isPasswordProtected ? "Password Protected" : "Secret Invitation Link"}</p>
                </div>
              </div>
            )}

            {/* STEP 10: Ready to Publish */}
            {currentStep === 10 && (
              <div className="space-y-4 text-center py-4">
                <span className="text-4xl block animate-pulse">🎉</span>
                <h4 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  Your Gift is Ready!
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  You can publish it immediately to generate a romantic sharing link, or save it as a private draft to continue customizing later in the Section Editor.
                </p>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => {
                if (currentStep > 1) setCurrentStep(currentStep - 1);
                else onClose();
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer"
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </button>

            <div className="flex items-center gap-2">
              {currentStep < 10 ? (
                <>
                  <button
                    onClick={() => handleFinishWizard(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full text-xs text-[var(--pink-strong)] hover:underline cursor-pointer"
                  >
                    Save as Draft & Exit
                  </button>
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer"
                  >
                    Next Step →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleFinishWizard(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleFinishWizard(true)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] via-[var(--pink-strong)] to-[var(--pink-deep)] hover:shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Publishing..." : "Publish Gift Now ♡"}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
