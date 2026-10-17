"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { DeluluScenario, LittleReason } from "@/lib/gift-data";
import type { ClaimRecord } from "../sections/DigitalGiftsSection";
import type { VoiceMessage, ContentComment, JournalEntry } from "@/lib/server-db";

interface CreatorStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function CreatorStudio({ isOpen, onClose }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<
    "responses" | "secret" | "delulu" | "quiz" | "reasons" | "claims"
  >("responses");

  // Response Center state
  const [responseSummary, setResponseSummary] = useState<CreatorSummary | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Secret World state
  const [secretPassword, setSecretPassword] = useState("iloveyou");
  const [secretHint, setSecretHint] = useState("");
  const [secretLetter, setSecretLetter] = useState("");
  const [secretSaveStatus, setSecretSaveStatus] = useState<string | null>(null);

  // Questionnaire responses state
  const [submittedQuizAnswers, setSubmittedQuizAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const savedQuiz = localStorage.getItem("gift_quiz_responses");
      return savedQuiz ? JSON.parse(savedQuiz) : {};
    } catch {
      return {};
    }
  });

  // Claimed vouchers state
  const [claimedVouchers, setClaimedVouchers] = useState<Record<string, ClaimRecord>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const savedClaims = localStorage.getItem("gift_digital_vouchers_claims");
      return savedClaims ? JSON.parse(savedClaims) : {};
    } catch {
      return {};
    }
  });

  // Delulu Scenarios state
  const [customScenarios, setCustomScenarios] = useState<DeluluScenario[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedScenarios = localStorage.getItem("gift_custom_delulu_scenarios");
      return savedScenarios ? JSON.parse(savedScenarios) : [];
    } catch {
      return [];
    }
  });
  const [newScenarioTitle, setNewScenarioTitle] = useState("");
  const [newScenarioSituation, setNewScenarioSituation] = useState("");
  const [newOpt1Text, setNewOpt1Text] = useState("");
  const [newOpt1Response, setNewOpt1Response] = useState("");
  const [newOpt2Text, setNewOpt2Text] = useState("");
  const [newOpt2Response, setNewOpt2Response] = useState("");

  // Little Reasons state
  const [customReasons, setCustomReasons] = useState<LittleReason[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedReasons = localStorage.getItem("gift_custom_reasons");
      return savedReasons ? JSON.parse(savedReasons) : [];
    } catch {
      return [];
    }
  });
  const [newReasonText, setNewReasonText] = useState("");
  const [newReasonEmoji, setNewReasonEmoji] = useState("💖");

  const fetchResponses = () => {
    fetch("/api/creator/responses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.summary) {
          setResponseSummary(data.summary);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    fetch("/api/creator/responses")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.summary) {
          setResponseSummary(data.summary);
        }
      })
      .catch(() => {});

    fetch("/api/secret/config")
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          if (data.hint) setSecretHint(data.hint);
          if (data.letter) setSecretLetter(data.letter);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const refreshResponses = () => {
    fetchResponses();
    try {
      const savedQuiz = localStorage.getItem("gift_quiz_responses");
      if (savedQuiz) setSubmittedQuizAnswers(JSON.parse(savedQuiz));

      const savedClaims = localStorage.getItem("gift_digital_vouchers_claims");
      if (savedClaims) setClaimedVouchers(JSON.parse(savedClaims));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/creator/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: responseSummary?.creatorPasscode || "love2024" }),
      });
      if (res.ok) {
        fetchResponses();
      }
    } catch {}
  };

  const handleToggleInvitation = async () => {
    if (!responseSummary) return;
    const nextStatus = responseSummary.invitationStatus === "active" ? "revoked" : "active";
    try {
      const res = await fetch("/api/auth/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorPasscode: responseSummary.creatorPasscode || "love2024",
          invitationStatus: nextStatus,
        }),
      });
      if (res.ok) {
        setResponseSummary((prev) => (prev ? { ...prev, invitationStatus: nextStatus } : null));
      }
    } catch {}
  };

  const handleCopyInviteLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const token = responseSummary?.recipientInviteToken || "sweetheart";
    const link = `${origin}/?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const togglePlayVoice = (msg: VoiceMessage) => {
    if (playingVoiceId === msg.id) {
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      setPlayingVoiceId(null);
    } else {
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      const audio = new Audio(msg.audioData);
      voiceAudioRef.current = audio;
      setPlayingVoiceId(msg.id);
      audio.play().catch(() => setPlayingVoiceId(null));
      audio.onended = () => setPlayingVoiceId(null);
    }
  };

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretSaveStatus("Saving...");
    try {
      const res = await fetch("/api/secret/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: secretPassword,
          hint: secretHint,
          letter: secretLetter,
        }),
      });
      if (res.ok) {
        setSecretSaveStatus("Saved successfully! ✨");
        setTimeout(() => setSecretSaveStatus(null), 2500);
      } else {
        setSecretSaveStatus("Error saving.");
      }
    } catch {
      setSecretSaveStatus("Network error.");
    }
  };

  const handleAddScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioTitle.trim() || !newScenarioSituation.trim()) return;

    const newScenario: DeluluScenario = {
      id: `ds_${Date.now()}`,
      title: newScenarioTitle.trim(),
      situation: newScenarioSituation.trim(),
      options: [
        {
          id: `opt_${Date.now()}_1`,
          text: newOpt1Text.trim() || "Do something spontaneous",
          response: newOpt1Response.trim() || "I would love every second of that! 💕",
        },
        {
          id: `opt_${Date.now()}_2`,
          text: newOpt2Text.trim() || "Stay cozy together",
          response: newOpt2Response.trim() || "Nothing beats holding you close. 🥰",
        },
      ],
    };

    const updated = [newScenario, ...customScenarios];
    setCustomScenarios(updated);
    try {
      localStorage.setItem("gift_custom_delulu_scenarios", JSON.stringify(updated));
    } catch {}

    setNewScenarioTitle("");
    setNewScenarioSituation("");
    setNewOpt1Text("");
    setNewOpt1Response("");
    setNewOpt2Text("");
    setNewOpt2Response("");
  };

  const handleDeleteScenario = (id: string) => {
    const updated = customScenarios.filter((s) => s.id !== id);
    setCustomScenarios(updated);
    try {
      localStorage.setItem("gift_custom_delulu_scenarios", JSON.stringify(updated));
    } catch {}
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonText.trim()) return;

    const newReason: LittleReason = {
      id: `custom_lr_${Date.now()}`,
      text: newReasonText.trim(),
      emoji: newReasonEmoji || "💖",
    };

    const updated = [newReason, ...customReasons];
    setCustomReasons(updated);
    try {
      localStorage.setItem("gift_custom_reasons", JSON.stringify(updated));
    } catch {}

    setNewReasonText("");
  };

  const handleDeleteReason = (id: string) => {
    const updated = customReasons.filter((r) => r.id !== id);
    setCustomReasons(updated);
    try {
      localStorage.setItem("gift_custom_reasons", JSON.stringify(updated));
    } catch {}
  };

  const totalUnread =
    (responseSummary?.unreadCommentsCount || 0) +
    (responseSummary?.unreadJournalCount || 0) +
    (responseSummary?.unreadVoiceCount || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 z-50 bg-white rounded-3xl shadow-2xl border border-[var(--border-subtle)] flex flex-col max-w-5xl mx-auto overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-[var(--bg-main)] to-[var(--bg-surface)]">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
                  Creator Studio & Response Center ✏️
                </span>
                <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  Manage Your Shared World
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/studio"
                  className="px-3.5 py-1.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] border border-[var(--border-subtle)] text-xs font-semibold hover:bg-[var(--bg-blush)] cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>🚀</span>
                  <span>Open Full Studio</span>
                </Link>
                <button
                  onClick={refreshResponses}
                  title="Refresh responses"
                  className="px-3 py-1.5 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-6 gap-2 overflow-x-auto text-xs font-semibold text-[var(--text-secondary)]">
              {[
                {
                  id: "responses",
                  label: `📬 Response Center ${totalUnread > 0 ? `(${totalUnread} new)` : ""}`,
                },
                { id: "secret", label: "🔒 Secret World" },
                { id: "delulu", label: "🦋 Delulu Scenarios" },
                { id: "quiz", label: "❓ Responses & Quiz" },
                { id: "reasons", label: "💗 Little Reasons" },
                { id: "claims", label: "🎁 Claimed Gifts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[var(--pink-strong)] text-[var(--pink-strong)] font-bold"
                      : "border-transparent hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* TAB 0: Response Center */}
              {activeTab === "responses" && (
                <div className="space-y-6">
                  {/* Top Notification Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--pale-rose)] via-white to-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        Partner Responses & Live Interactions
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Real-time reactions, comments, journal entries, and voice messages left by your recipient.
                      </p>
                    </div>
                    {totalUnread > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 rounded-full bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-hover)] cursor-pointer shadow-sm"
                      >
                        ✓ Mark All as Read ({totalUnread})
                      </button>
                    )}
                  </div>

                  {/* Private Couple Access & Invitation Manager */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔐</span>
                        <h5 className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                          Private Couple Access & Invitation Status
                        </h5>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          responseSummary?.invitationStatus === "active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {responseSummary?.invitationStatus === "active"
                          ? "● Invitation Active"
                          : "● Invitation Revoked"}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Your partner accesses their shared private experience using this token link. No account creation is required for them.
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <div className="flex-1 min-w-[240px] px-3 py-2 rounded-xl bg-white border border-[var(--border-medium)] text-xs font-mono text-[var(--text-secondary)] truncate select-all">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/?invite=${responseSummary?.recipientInviteToken || "sweetheart"}`
                          : `/?invite=sweetheart`}
                      </div>
                      <button
                        onClick={handleCopyInviteLink}
                        className="px-4 py-2 rounded-xl bg-white border border-[var(--border-subtle)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--pale-rose)] cursor-pointer shadow-xs"
                      >
                        {copySuccess ? "✓ Link Copied!" : "📋 Copy Invite Link"}
                      </button>
                      <button
                        onClick={handleToggleInvitation}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors ${
                          responseSummary?.invitationStatus === "active"
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {responseSummary?.invitationStatus === "active"
                          ? "Revoke Invitation"
                          : "Re-activate Invitation"}
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">❤️</span>
                      <span className="font-serif text-xl font-bold text-[var(--text-primary)] block">
                        {responseSummary?.totalRecipientReactions || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Partner Reactions
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">💬</span>
                      <span className="font-serif text-xl font-bold text-[var(--text-primary)] block">
                        {responseSummary?.totalRecipientComments || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Notes ({responseSummary?.unreadCommentsCount || 0} new)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">📖</span>
                      <span className="font-serif text-xl font-bold text-[var(--text-primary)] block">
                        {responseSummary?.totalJournalEntries || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Journal ({responseSummary?.unreadJournalCount || 0} new)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">🎙️</span>
                      <span className="font-serif text-xl font-bold text-[var(--text-primary)] block">
                        {responseSummary?.totalVoiceMessages || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Voice Notes ({responseSummary?.unreadVoiceCount || 0} new)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">🗺️</span>
                      <span className="font-serif text-xl font-bold text-[var(--pink-strong)] block">
                        {responseSummary?.totalDateProposals || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Date Proposals ({responseSummary?.confirmedEventsCount || 0} confirmed)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs text-center">
                      <span className="text-xl block mb-1">📸</span>
                      <span className="font-serif text-xl font-bold text-[var(--pink-deep)] block">
                        {responseSummary?.totalDateMemories || 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Date Memories Logged
                      </span>
                    </div>
                  </div>

                  {/* Voice Notes Audio Feed inside Creator Studio */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>🎙️</span>
                      <span>Voice Messages Received & Exchanged</span>
                    </h5>

                    {(!responseSummary?.voiceMessages || responseSummary.voiceMessages.length === 0) ? (
                      <div className="p-6 text-center bg-[var(--bg-surface)] rounded-2xl text-xs text-[var(--text-muted)]">
                        No voice messages recorded yet. Head over to the Voice Notes section on the page to record or receive audio whispers!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {responseSummary.voiceMessages.map((v) => {
                          const isPlaying = playingVoiceId === v.id;
                          return (
                            <div
                              key={v.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isPlaying
                                  ? "bg-[var(--pale-rose)]/50 border-[var(--pink-strong)] shadow-xs"
                                  : "bg-white border-[var(--border-subtle)]"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[var(--text-primary)]">
                                  {v.senderName} ({v.sender === "creator" ? "You" : "Sweetheart"})
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {new Date(v.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => togglePlayVoice(v)}
                                  className="w-8 h-8 rounded-full bg-[var(--pink-strong)] text-white flex items-center justify-center text-xs cursor-pointer shadow-xs hover:bg-[var(--pink-hover)]"
                                >
                                  {isPlaying ? "⏸️" : "▶️"}
                                </button>
                                <span className="text-xs text-[var(--text-secondary)] font-mono">
                                  Duration: {v.durationSeconds}s
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Comments Feed */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>💬</span>
                      <span>Recent Notes & Card Comments</span>
                    </h5>

                    {(!responseSummary?.recentComments || responseSummary.recentComments.length === 0) ? (
                      <div className="p-6 text-center bg-[var(--bg-surface)] rounded-2xl text-xs text-[var(--text-muted)]">
                        No comments or notes left on cards yet. When your partner comments on observation or memory cards, they will appear here.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {responseSummary.recentComments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] text-xs space-y-1 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[var(--pink-strong)]">
                                on {c.targetType.toUpperCase()} ({c.targetId})
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {new Date(c.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <p className="text-[var(--text-primary)] italic">&ldquo;{c.content}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Journal Entries Feed */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-serif text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>📖</span>
                      <span>Our Little Notebook Entries</span>
                    </h5>

                    {(!responseSummary?.recentJournal || responseSummary.recentJournal.length === 0) ? (
                      <div className="p-6 text-center bg-[var(--bg-surface)] rounded-2xl text-xs text-[var(--text-muted)]">
                        The shared journal is waiting for its first page. Visit &ldquo;Our Little Notebook&rdquo; below to write the first entry!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {responseSummary.recentJournal.map((j) => (
                          <div
                            key={j.id}
                            className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] text-xs space-y-1.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{j.moodEmoji || "✨"}</span>
                                <span className="font-bold text-[var(--text-primary)]">
                                  {j.title || "Journal Thought"}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)]">
                                  by {j.authorName}
                                </span>
                              </div>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {new Date(j.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {j.prompt && (
                              <p className="text-[11px] font-semibold text-[var(--pink-strong)]">
                                Prompt: {j.prompt}
                              </p>
                            )}
                            <p className="text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {j.content}
                            </p>
                            {j.replies && j.replies.length > 0 && (
                              <span className="text-[10px] text-[var(--text-muted)] block">
                                ↳ {j.replies.length} replies in thread
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: Secret World */}
              {activeTab === "secret" && (
                <form onSubmit={handleSaveSecret} className="space-y-5 max-w-xl">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Configure Secret World Password & Hint
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Changes are securely verified on the server.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Secret Password / Phrase *
                    </label>
                    <input
                      type="text"
                      required
                      value={secretPassword}
                      onChange={(e) => setSecretPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Public Hint shown on lock screen *
                    </label>
                    <input
                      type="text"
                      required
                      value={secretHint}
                      onChange={(e) => setSecretHint(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Secret Letter / Content revealed upon unlock *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={secretLetter}
                      onChange={(e) => setSecretLetter(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer"
                    >
                      Save Secret World Settings ♡
                    </button>
                    {secretSaveStatus && (
                      <span className="text-xs font-medium text-[var(--pink-deep)]">
                        {secretSaveStatus}
                      </span>
                    )}
                  </div>
                </form>
              )}

              {/* TAB 2: Delulu Scenarios */}
              {activeTab === "delulu" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Add a Custom Delulu Scenario
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Create a funny or sweet situation with custom answer responses.
                    </p>
                  </div>

                  <form onSubmit={handleAddScenario} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Scenario Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newScenarioTitle}
                        onChange={(e) => setNewScenarioTitle(e.target.value)}
                        placeholder="e.g. We get stranded on an island together"
                        className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Situation Description *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={newScenarioSituation}
                        onChange={(e) => setNewScenarioSituation(e.target.value)}
                        placeholder="e.g. A coconut falls near our tent..."
                        className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-xl border border-[var(--border-subtle)] space-y-2">
                        <label className="text-[11px] font-bold text-[var(--pink-strong)] block">
                          Option 1 Button Text
                        </label>
                        <input
                          type="text"
                          value={newOpt1Text}
                          onChange={(e) => setNewOpt1Text(e.target.value)}
                          placeholder="e.g. Build a luxury sand mansion"
                          className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)]"
                        />
                        <label className="text-[11px] font-bold text-[var(--pink-strong)] block">
                          Option 1 Reaction Message
                        </label>
                        <input
                          type="text"
                          value={newOpt1Response}
                          onChange={(e) => setNewOpt1Response(e.target.value)}
                          placeholder="e.g. Complete with a shell chandelier! 👑"
                          className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)]"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-[var(--border-subtle)] space-y-2">
                        <label className="text-[11px] font-bold text-[var(--pink-strong)] block">
                          Option 2 Button Text
                        </label>
                        <input
                          type="text"
                          value={newOpt2Text}
                          onChange={(e) => setNewOpt2Text(e.target.value)}
                          placeholder="e.g. Look for dolphins"
                          className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)]"
                        />
                        <label className="text-[11px] font-bold text-[var(--pink-strong)] block">
                          Option 2 Reaction Message
                        </label>
                        <input
                          type="text"
                          value={newOpt2Response}
                          onChange={(e) => setNewOpt2Response(e.target.value)}
                          placeholder="e.g. We will name the first one Bubbles! 🐬"
                          className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer"
                    >
                      + Add Delulu Scenario
                    </button>
                  </form>

                  {customScenarios.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                        Custom Scenarios ({customScenarios.length})
                      </h5>
                      {customScenarios.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between bg-white text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">
                              {s.title}
                            </span>
                            <span className="text-[var(--text-muted)] line-clamp-1">{s.situation}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteScenario(s.id)}
                            className="text-xs text-rose-500 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Quiz Answers */}
              {activeTab === "quiz" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Partner Questionnaire Answers
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Review how your partner answered questions in &ldquo;How Well Do You Know Us?&rdquo;
                    </p>
                  </div>

                  {Object.keys(submittedQuizAnswers).length === 0 ? (
                    <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl text-xs text-[var(--text-muted)]">
                      No responses submitted yet. As soon as your partner answers questions in &ldquo;How Well Do You Know Us?&rdquo;, their answers will appear here!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(submittedQuizAnswers).map(([qId, ans]) => (
                        <div
                          key={qId}
                          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3"
                        >
                          <span className="text-lg">💭</span>
                          <div>
                            <span className="text-xs font-semibold text-[var(--pink-strong)] block">
                              Question ID: {qId}
                            </span>
                            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] mt-1">
                              Partner&apos;s Answer: &ldquo;{ans}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Little Reasons */}
              {activeTab === "reasons" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Add a Little Reason
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Add personal traits, sweet memories, or quirks to your appreciation deck.
                    </p>
                  </div>

                  <form onSubmit={handleAddReason} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newReasonEmoji}
                      onChange={(e) => setNewReasonEmoji(e.target.value)}
                      placeholder="Emoji"
                      className="w-16 text-center text-lg p-2.5 rounded-xl border border-[var(--border-medium)] bg-white"
                    />
                    <input
                      type="text"
                      required
                      value={newReasonText}
                      onChange={(e) => setNewReasonText(e.target.value)}
                      placeholder="e.g. The way you hug me when I get home..."
                      className="flex-1 text-xs p-3 rounded-xl border border-[var(--border-medium)] bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer"
                    >
                      + Add Reason
                    </button>
                  </form>

                  {customReasons.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                        Added Reasons ({customReasons.length})
                      </h5>
                      {customReasons.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between bg-white text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span>{r.emoji}</span>
                            <span className="text-[var(--text-primary)]">{r.text}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteReason(r.id)}
                            className="text-xs text-rose-500 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Claimed Gifts Dashboard */}
              {activeTab === "claims" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-1">
                      Claimed Digital Vouchers ({Object.keys(claimedVouchers).length})
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      All promise cards redeemed by your partner, with redemption notes and timestamps.
                    </p>
                  </div>

                  {Object.keys(claimedVouchers).length === 0 ? (
                    <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl text-xs text-[var(--text-muted)]">
                      No gift vouchers have been claimed yet. When your partner redeems cards in &ldquo;Little Gifts I Owe You&rdquo;, they will appear here!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.values(claimedVouchers).map((c) => (
                        <div
                          key={c.giftId}
                          className="p-4 rounded-2xl bg-gradient-to-br from-[var(--pale-rose)] to-white border border-[var(--pink-primary)] shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--pink-strong)]">
                              Gift ID: {c.giftId}
                            </span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)]">
                              {c.claimedAt}
                            </span>
                          </div>
                          {c.redemptionNote ? (
                            <p className="text-xs italic text-[var(--text-primary)] font-medium">
                              Partner&apos;s Note: &ldquo;{c.redemptionNote}&rdquo;
                            </p>
                          ) : (
                            <p className="text-xs text-[var(--text-muted)] italic">
                              Claimed without a note
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
