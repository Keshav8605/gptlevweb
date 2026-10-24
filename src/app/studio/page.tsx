"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { GiftRecord, ContentComment, JournalEntry, VoiceMessage } from "@/lib/server-db";
import { GiftCreationWizard } from "@/components/studio/GiftCreationWizard";
import { SectionEditorRegistry } from "@/components/studio/SectionEditorRegistry";
import { LivePreviewModal } from "@/components/studio/LivePreviewModal";
import { PublishModal } from "@/components/studio/PublishModal";
import { MediaLibraryModal } from "@/components/studio/MediaLibraryModal";

interface CreatorSummary {
  totalRecipientReactions: number;
  totalRecipientComments: number;
  unreadCommentsCount: number;
  totalJournalEntries: number;
  unreadJournalCount: number;
  totalVoiceMessages: number;
  unreadVoiceCount: number;
  totalDateProposals?: number;
  activeProposalsCount?: number;
  confirmedEventsCount?: number;
  totalDateMemories?: number;
  recentComments: ContentComment[];
  recentJournal: JournalEntry[];
  voiceMessages: VoiceMessage[];
  invitationStatus: "active" | "revoked";
  recipientInviteToken: string;
  creatorPasscode: string;
}

export default function CreatorStudioPage() {
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [activeGift, setActiveGift] = useState<GiftRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sections" | "media" | "privacy" | "responses"
  >("dashboard");

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaSelectCallback, setMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  const [giftToDelete, setGiftToDelete] = useState<GiftRecord | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);

  // Autosave & Save Status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unsaved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedJsonRef = useRef<string>("");

  // Response Center state
  const [responses, setResponses] = useState<CreatorSummary | null>(null);
  const [responsesTab, setResponsesTab] = useState<
    "all" | "comments" | "notebook" | "voice" | "proposals" | "reactions"
  >("all");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fetch gifts list
  const fetchGifts = useCallback(async () => {
    try {
      const res = await fetch("/api/gifts");
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
        if (data.gifts?.length > 0 && !activeGift) {
          setActiveGift(data.gifts[0]);
          lastSavedJsonRef.current = JSON.stringify(data.gifts[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load gifts", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeGift]);

  // 2. Fetch responses
  const fetchResponses = useCallback(async () => {
    try {
      const res = await fetch("/api/creator/responses");
      if (res.ok) {
        const data = await res.json();
        setResponses(data);
      }
    } catch (err) {
      console.error("Failed to load responses", err);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
    fetchResponses();
  }, [fetchGifts, fetchResponses]);

  // 3. Save Active Gift
  const saveGiftData = async (giftToSave: GiftRecord, isAuto = false) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/gifts/${giftToSave.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftToSave),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.gift;
        setActiveGift(updated);
        setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        lastSavedJsonRef.current = JSON.stringify(updated);
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((s) => (s === "saved" ? "idle" : s));
        }, isAuto ? 1500 : 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  // Debounced Autosave on activeGift change
  const handleUpdateActiveGift = (updates: Partial<GiftRecord>) => {
    if (!activeGift) return;
    const updated: GiftRecord = {
      ...activeGift,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setActiveGift(updated);
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGiftData(updated, true);
    }, 2000);
  };

  // Duplicate gift
  const handleDuplicateGift = async (sourceGiftId: string) => {
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", sourceGiftId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGifts((prev) => [data.gift, ...prev]);
        setActiveGift(data.gift);
        setActiveTab("sections");
      }
    } catch (err) {
      console.error("Duplicate failed", err);
    }
  };

  // Delete gift
  const handleDeleteGift = async () => {
    if (!giftToDelete) return;
    try {
      const res = await fetch(`/api/gifts/${giftToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const remaining = gifts.filter((g) => g.id !== giftToDelete.id);
        setGifts(remaining);
        if (activeGift?.id === giftToDelete.id) {
          setActiveGift(remaining[0] || null);
        }
        setGiftToDelete(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (gift: GiftRecord) => {
    const nextStatus = gift.status === "published" ? "unpublished" : "published";
    try {
      const res = await fetch(`/api/gifts/${gift.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setGifts((prev) => prev.map((g) => (g.id === gift.id ? data.gift : g)));
        if (activeGift?.id === gift.id) {
          setActiveGift(data.gift);
        }
      }
    } catch (err) {
      console.error("Failed to toggle publish", err);
    }
  };

  // Copy link
  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/gift/${slug}`;
    navigator.clipboard.writeText(url);
    setCopyFeedbackId(slug);
    setTimeout(() => setCopyFeedbackId(null), 2500);
  };

  // Voice playback
  const handleTogglePlayVoice = (msg: VoiceMessage) => {
    if (playingVoiceId === msg.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const a = new Audio(msg.audioData);
      audioRef.current = a;
      setPlayingVoiceId(msg.id);
      a.play().catch(() => setPlayingVoiceId(null));
      a.onended = () => setPlayingVoiceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* 1. STUDIO HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
            title="Return to Experience"
          >
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[var(--pink-strong)] to-[var(--pink-primary)] flex items-center justify-center text-white text-base shadow-sm">
              ♡
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)]">
                Romantic Experience
              </span>
              <h1 className="font-serif text-lg font-bold text-[var(--text-primary)] leading-none group-hover:text-[var(--pink-deep)] transition-colors">
                Creator Studio
              </h1>
            </div>
          </Link>

          {/* Active Gift Selector Pill */}
          {gifts.length > 0 && activeGift && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] mr-2">Editing:</span>
              <select
                value={activeGift.id}
                onChange={(e) => {
                  const found = gifts.find((g) => g.id === e.target.value);
                  if (found) {
                    setActiveGift(found);
                    lastSavedJsonRef.current = JSON.stringify(found);
                  }
                }}
                className="bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
              >
                {gifts.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.recipientNickname})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Save Status Badge */}
          <div className="hidden sm:flex items-center text-xs font-medium mr-2">
            {saveStatus === "saving" && (
              <span className="text-[var(--pink-strong)] flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[var(--pink-strong)]"></span>
                Autosaving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-800 flex items-center gap-1">
                ✓ Saved to cloud
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-amber-800 flex items-center gap-1">
                ● Unsaved edits
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-rose-800 flex items-center gap-1">
                ⚠️ Save failed
              </span>
            )}
            {saveStatus === "idle" && (
              <span className="text-[var(--text-muted)] text-[11px]">
                All changes saved
              </span>
            )}
          </div>

          {/* Manual Save Button */}
          {activeGift && (
            <button
              onClick={() => saveGiftData(activeGift)}
              disabled={saveStatus === "saving"}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
            >
              💾 Save Draft
            </button>
          )}

          {/* Live Preview Button */}
          {activeGift && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>Preview</span>
            </button>
          )}

          {/* Publish / Share Button */}
          {activeGift && (
            <button
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-primary)] text-white hover:opacity-95 shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>Publish & Share</span>
            </button>
          )}

          {/* Launch Creator Wizard Button */}
          <Link
            href="/create"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white hover:opacity-95 shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Launch Wizard</span>
          </Link>

          {/* New Gift Button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[var(--border-medium)] text-[var(--pink-deep)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
          >
            + Quick Gift
          </button>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="bg-white border-b border-[var(--border-subtle)] px-4 sm:px-8">
        <div className="flex gap-2 sm:gap-6 overflow-x-auto text-xs font-semibold text-[var(--text-secondary)]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3.5 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "dashboard"
                ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                : "border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🏠</span>
            <span>All Gifts Dashboard</span>
            <span className="text-[10px] bg-[var(--pale-rose)] px-2 py-0.5 rounded-full text-[var(--pink-deep)]">
              {gifts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sections")}
            className={`py-3.5 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "sections"
                ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                : "border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            <span>✍️</span>
            <span>Section & Content Editor</span>
            {activeGift && (
              <span className="text-[10px] bg-[var(--pale-rose)] px-2 py-0.5 rounded-full text-[var(--pink-deep)]">
                {activeGift.enabledSections?.length || 0} active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`py-3.5 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "media"
                ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                : "border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🖼️</span>
            <span>Media Library</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3.5 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "privacy"
                ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                : "border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            <span>🔒</span>
            <span>Privacy & Access</span>
          </button>

          <button
            onClick={() => setActiveTab("responses")}
            className={`py-3.5 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "responses"
                ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                : "border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            <span>📬</span>
            <span>Response Center</span>
            {responses &&
              ((responses.unreadCommentsCount || 0) +
                (responses.unreadJournalCount || 0) +
                (responses.unreadVoiceCount || 0)) > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {(responses.unreadCommentsCount || 0) +
                    (responses.unreadJournalCount || 0) +
                    (responses.unreadVoiceCount || 0)}{" "}
                  new
                </span>
              )}
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {/* TAB 1: ALL GIFTS DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Top welcome & metrics banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-[var(--bg-surface)] to-[var(--pale-rose)]/40 border border-[var(--border-subtle)] shadow-xs flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
                  Personalized Gifting Experience
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                  Welcome to Your Creator Sanctuary ✨
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Design, personalize, and share intimate romantic websites for your partner.
                  Every gift carries your custom stories, photographs, love notes, voice whispers,
                  and collaborative adventures.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-primary)] text-white text-sm font-semibold hover:opacity-95 shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>Create New Gift</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Total Gifts</span>
                <span className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  {gifts.length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Published Gifts</span>
                <span className="font-serif text-2xl font-bold text-emerald-800">
                  {gifts.filter((g) => g.status === "published").length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Drafts In Progress</span>
                <span className="font-serif text-2xl font-bold text-amber-800">
                  {gifts.filter((g) => g.status === "draft").length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Total Received Responses</span>
                <span className="font-serif text-2xl font-bold text-[var(--pink-deep)]">
                  {responses
                    ? responses.totalRecipientReactions +
                      responses.totalRecipientComments +
                      responses.totalJournalEntries +
                      responses.totalVoiceMessages
                    : 0}
                </span>
              </div>
            </div>

            {/* Gifts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Your Romantic Gifts
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Select a gift to edit or preview
                </span>
              </div>

              {gifts.length === 0 && !isLoading ? (
                /* Welcoming Empty State */
                <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-[var(--border-medium)] space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center text-3xl mx-auto">
                    💌
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    No gifts created yet
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                    Start by setting up your first personalized romantic world. Our 10-step wizard
                    will guide you smoothly from love note to publishing!
                  </p>
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer transition-colors shadow-sm"
                  >
                    Start Guided Setup ♡
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gifts.map((g) => {
                    const isSelected = activeGift?.id === g.id;
                    return (
                      <motion.div
                        key={g.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-3xl bg-white border transition-all p-6 flex flex-col justify-between space-y-5 ${
                          isSelected
                            ? "border-[var(--pink-primary)] ring-2 ring-[var(--pink-primary)]/20 shadow-md"
                            : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] shadow-xs"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                g.status === "published"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : g.status === "draft"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              {g.status}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              Updated {new Date(g.updatedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-serif text-xl font-bold text-[var(--text-primary)] line-clamp-1">
                            {g.title}
                          </h4>

                          <p className="text-xs text-[var(--text-secondary)]">
                            From <span className="font-semibold">{g.senderNickname}</span> to{" "}
                            <span className="font-semibold">{g.recipientNickname}</span>
                          </p>
                        </div>

                        {/* Middle info */}
                        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] text-xs space-y-2 border border-[var(--border-subtle)]">
                          <div className="flex justify-between items-center text-[var(--text-secondary)]">
                            <span>Enabled Chapters</span>
                            <span className="font-bold text-[var(--pink-deep)]">
                              {g.enabledSections?.length || 0} sections
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[var(--text-secondary)]">
                            <span>Slug URL</span>
                            <span className="font-mono text-[11px] text-[var(--text-primary)] truncate max-w-[140px]">
                              /gift/{g.slug}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[var(--text-secondary)]">
                            <span>Protection</span>
                            <span>{g.privacy?.isPasswordProtected ? "🔒 Passcode" : "🌐 Token/Open"}</span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setActiveGift(g);
                                lastSavedJsonRef.current = JSON.stringify(g);
                                setActiveTab("sections");
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer text-center"
                            >
                              ✍️ Edit Draft
                            </button>
                            <button
                              onClick={() => {
                                setActiveGift(g);
                                setIsPreviewOpen(true);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer text-center"
                            >
                              👁️ Preview
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(g.slug)}
                              className="text-[var(--pink-strong)] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>🔗</span>
                              <span>
                                {copyFeedbackId === g.slug ? "Copied! ✨" : "Copy Link"}
                              </span>
                            </button>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicateGift(g.id)}
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                              title="Duplicate gift"
                            >
                              📑 Duplicate
                            </button>

                            {/* Toggle Publish */}
                            <button
                              onClick={() => handleTogglePublish(g)}
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            >
                              {g.status === "published" ? "Unpublish" : "Publish"}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setGiftToDelete(g)}
                              disabled={gifts.length <= 1}
                              className="text-rose-500 hover:text-rose-700 disabled:opacity-20 cursor-pointer"
                              title={gifts.length <= 1 ? "Cannot delete only gift" : "Delete gift"}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SECTION & CONTENT EDITOR */}
        {activeTab === "sections" && activeGift && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)]">
                  Editing Section Flow
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  {activeGift.title} ({activeGift.recipientNickname})
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer flex items-center gap-1.5"
                >
                  <span>👁️</span>
                  <span>Preview Recipient Experience</span>
                </button>
                <button
                  type="button"
                  onClick={() => saveGiftData(activeGift)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--pink-strong)] text-white hover:bg-[var(--pink-deep)] cursor-pointer shadow-xs"
                >
                  Save Changes ✨
                </button>
              </div>
            </div>

            <SectionEditorRegistry
              gift={activeGift}
              onChange={handleUpdateActiveGift}
              onOpenMediaLibrary={(cb) => {
                setMediaSelectCallback(() => cb);
                setIsMediaModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 3: MEDIA LIBRARY */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[var(--border-subtle)] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)]">
                Media & Sound Vault
              </span>
              <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                Manage Photos & Audio Whispers
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Upload pictures, romantic snaps, polaroid scans, and MP3 audio clips up to 10MB.
                All assets are stored securely with strict MIME type and file validation.
              </p>
            </div>

            {/* Embed Media Library Modal view inline */}
            <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6">
              <button
                onClick={() => setIsMediaModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <span>📁</span>
                <span>Open Dedicated Media Manager Modal</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PRIVACY & ACCESS SETTINGS */}
        {activeTab === "privacy" && activeGift && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
                  Security & Access Controls
                </span>
                <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  Privacy Settings for &quot;{activeGift.title}&quot;
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Control how your recipient views the gift, enters the site, and submits replies.
                </p>
              </div>

              {/* Setting 1: Password Protection */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                      Passcode Protection 🔒
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Require your partner to enter a secret passcode before opening the gift.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeGift.privacy?.isPasswordProtected || false}
                    onChange={(e) =>
                      handleUpdateActiveGift({
                        privacy: {
                          ...activeGift.privacy,
                          isPasswordProtected: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[var(--pink-primary)] cursor-pointer"
                  />
                </div>

                {activeGift.privacy?.isPasswordProtected && (
                  <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                    <label className="text-xs font-semibold block text-[var(--text-primary)]">
                      Secret Passcode:
                    </label>
                    <input
                      type="text"
                      value={activeGift.privacy?.passcode || "love2024"}
                      onChange={(e) =>
                        handleUpdateActiveGift({
                          privacy: {
                            ...activeGift.privacy,
                            passcode: e.target.value,
                          },
                        })
                      }
                      className="w-full sm:w-64 p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono bg-white"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Make sure to tell your partner this code or whisper it in a note!
                    </p>
                  </div>
                )}
              </div>

              {/* Setting 2: Recipient Invitation Token */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                    Recipient Access Token & Direct Link 🎟️
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Unique invite token for accessing the gift without manual login.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={activeGift.privacy?.recipientInviteToken || "sweetheart"}
                    onChange={(e) =>
                      handleUpdateActiveGift({
                        privacy: {
                          ...activeGift.privacy,
                          recipientInviteToken: e.target.value,
                        },
                      })
                    }
                    className="p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono bg-white w-56"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "";
                      const link = `${origin}/gift/${activeGift.slug}?invite=${
                        activeGift.privacy?.recipientInviteToken || "sweetheart"
                      }`;
                      navigator.clipboard.writeText(link);
                      setCopyFeedbackId("privacy-link");
                      setTimeout(() => setCopyFeedbackId(null), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[var(--border-subtle)] text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] cursor-pointer"
                  >
                    {copyFeedbackId === "privacy-link" ? "Copied! ✨" : "Copy Direct Access Link"}
                  </button>
                </div>
              </div>

              {/* Setting 3: Invitation Status (Active vs Revoked) */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                    Access Status
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Instantly pause or revoke the recipient link anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next =
                      activeGift.privacy?.invitationStatus === "active" ? "revoked" : "active";
                    handleUpdateActiveGift({
                      privacy: {
                        ...activeGift.privacy,
                        invitationStatus: next,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    activeGift.privacy?.invitationStatus === "active"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {activeGift.privacy?.invitationStatus === "active"
                    ? "✓ Link Active"
                    : "✕ Link Paused/Revoked"}
                </button>
              </div>

              {/* Setting 4: Recipient Contributions */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                      Allow Two-Way Contributions & Replies
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Allow your partner to send voice whispers, comment on memories, reply in the notebook, and propose dates.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeGift.privacy?.allowRecipientContributions !== false}
                    onChange={(e) =>
                      handleUpdateActiveGift({
                        privacy: {
                          ...activeGift.privacy,
                          allowRecipientContributions: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[var(--pink-primary)] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RESPONSE CENTER */}
        {activeTab === "responses" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)]">
                  Persisted Feedback & Activity
                </span>
                <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  Recipient Responses Center
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  All real interactions submitted by your partner across your shared chapters.
                </p>
              </div>

              <button
                onClick={fetchResponses}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer"
              >
                🔄 Refresh Responses
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto text-xs font-semibold">
              {(
                [
                  { id: "all", label: "All Items" },
                  { id: "comments", label: `Comments (${responses?.totalRecipientComments || 0})` },
                  { id: "notebook", label: `Notebook Entries (${responses?.totalJournalEntries || 0})` },
                  { id: "voice", label: `Voice Notes (${responses?.totalVoiceMessages || 0})` },
                  { id: "proposals", label: `Date Proposals (${responses?.totalDateProposals || 0})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setResponsesTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    responsesTab === tab.id
                      ? "bg-[var(--pink-strong)] text-white border-[var(--pink-strong)]"
                      : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Response Content Panels */}
            <div className="space-y-4">
              {/* Comments */}
              {(responsesTab === "all" || responsesTab === "comments") && (
                <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    Recent Love Comments 💬
                  </h4>
                  {(!responses?.recentComments || responses.recentComments.length === 0) ? (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No comments submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {responses.recentComments.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--pink-strong)]">
                              {c.authorName} ({c.author})
                            </span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-[var(--text-primary)]">{c.content}</p>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            On section: {c.targetType} / {c.targetId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Shared Notebook */}
              {(responsesTab === "all" || responsesTab === "notebook") && (
                <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    Shared Notebook Entries 📖
                  </h4>
                  {(!responses?.recentJournal || responses.recentJournal.length === 0) ? (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No notebook entries written yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {responses.recentJournal.map((j) => (
                        <div
                          key={j.id}
                          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2"
                        >
                          <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--pink-strong)]">
                              {j.author === "recipient" ? "Your Partner" : "You"}
                            </span>
                            <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                            Prompt: &quot;{j.prompt}&quot;
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                            {j.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Voice Whispers */}
              {(responsesTab === "all" || responsesTab === "voice") && (
                <div className="bg-white rounded-3xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    Voice Whispers 🎙️
                  </h4>
                  {(!responses?.voiceMessages || responses.voiceMessages.length === 0) ? (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No voice messages recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {responses.voiceMessages.map((v) => (
                        <div
                          key={v.id}
                          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="font-semibold text-xs text-[var(--text-primary)] block">
                              Voice Whisper ({v.durationSeconds}s)
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              Recorded by {v.senderName || v.sender} on {new Date(v.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            onClick={() => handleTogglePlayVoice(v)}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)] cursor-pointer"
                          >
                            {playingVoiceId === v.id ? "⏸️ Pause" : "▶ Play Voice"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS */}
      {/* 10-Step Guided Creation Wizard */}
      <GiftCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={async (newGiftData, shouldPublish) => {
          try {
            const res = await fetch("/api/gifts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newGiftData),
            });
            if (res.ok) {
              const data = await res.json();
              setGifts((prev) => [data.gift, ...prev]);
              setActiveGift(data.gift);
              lastSavedJsonRef.current = JSON.stringify(data.gift);
              if (shouldPublish) {
                await fetch(`/api/gifts/${data.gift.id}/publish`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "published" }),
                });
                data.gift.status = "published";
              }
              setActiveTab("sections");
              return true;
            }
          } catch (err) {
            console.error("Failed to create gift", err);
          }
          return false;
        }}
      />

      {/* Live Preview Modal */}
      {activeGift && (
        <LivePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          gift={activeGift}
        />
      )}

      {/* Publish & Share Modal */}
      {activeGift && (
        <PublishModal
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          gift={activeGift}
          onTogglePublish={async (shouldPublish: boolean) => {
            try {
              const res = await fetch(`/api/gifts/${activeGift.id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: shouldPublish ? "published" : "unpublished" }),
              });
              if (res.ok) {
                const data = await res.json();
                setActiveGift(data.gift);
                setGifts((prev) => prev.map((g) => (g.id === data.gift.id ? data.gift : g)));
                return true;
              }
            } catch {
              // ignore
            }
            return false;
          }}
          onUpdateSlug={async (newSlug: string) => {
            try {
              const res = await fetch(`/api/gifts/${activeGift.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: newSlug }),
              });
              if (res.ok) {
                const data = await res.json();
                setActiveGift(data.gift);
                setGifts((prev) => prev.map((g) => (g.id === data.gift.id ? data.gift : g)));
                return true;
              }
            } catch {
              // ignore
            }
            return false;
          }}
        />
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaSelectCallback(null);
        }}
        onSelectMedia={(mediaUrl: string) => {
          if (mediaSelectCallback) {
            mediaSelectCallback(mediaUrl);
          }
          setIsMediaModalOpen(false);
          setMediaSelectCallback(null);
        }}
        giftId={activeGift?.id}
      />

      {/* Delete Gift Confirmation Modal */}
      <AnimatePresence>
        {giftToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGiftToDelete(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[var(--border-subtle)] shadow-xl space-y-4 text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
                ⚠️
              </div>
              <h4 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Delete &quot;{giftToDelete.title}&quot;?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This will permanently remove this gift draft, its customized section content,
                and its public link. This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setGiftToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGift}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-sm"
                >
                  Yes, Delete Gift
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
