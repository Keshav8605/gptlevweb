"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DateProposal } from "@/lib/server-db";

const statusConfig: Record<
  DateProposal["status"],
  { label: string; bg: string; color: string; emoji: string }
> = {
  draft: { label: "Draft", bg: "#F1F5F9", color: "#475569", emoji: "📝" },
  proposed: { label: "Awaiting Response", bg: "#FEF3C7", color: "#92400E", emoji: "⏳" },
  awaiting_response: { label: "Awaiting Response", bg: "#FEF3C7", color: "#92400E", emoji: "⏳" },
  changes_requested: { label: "Changes Requested", bg: "#E0E7FF", color: "#3730A3", emoji: "💬" },
  confirmed: { label: "Confirmed Adventure", bg: "#DCFCE7", color: "#166534", emoji: "🎉" },
  declined: { label: "Declined Gently", bg: "#FEE2E2", color: "#991B1B", emoji: "💌" },
  cancelled: { label: "Cancelled", bg: "#F3F4F6", color: "#6B7280", emoji: "🚫" },
  completed: { label: "Completed & Cherished", bg: "var(--lavender)", color: "var(--pink-deep)", emoji: "📸" },
};

interface DateProposalsViewProps {
  proposals: DateProposal[];
  onTransitionProposal: (
    id: string,
    action: "accept" | "request_changes" | "reschedule" | "decline" | "cancel" | "complete" | "reveal_surprise",
    payload: {
      note?: string;
      proposedDate?: string;
      proposedStartTime?: string;
      reason?: string;
    }
  ) => Promise<boolean>;
  onOpenBuilder: () => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateProposalsView({
  proposals,
  onTransitionProposal,
  onOpenBuilder,
  currentRole,
}: DateProposalsViewProps) {
  // Modal states for negotiations
  const [activeModalProposal, setActiveModalProposal] = useState<DateProposal | null>(null);
  const [modalType, setModalType] = useState<"accept" | "changes" | "decline" | "cancel" | null>(null);

  // Form states inside modal
  const [modalNote, setModalNote] = useState("");
  const [modalNewDate, setModalNewDate] = useState("");
  const [modalNewTime, setModalNewTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenActionModal = (
    proposal: DateProposal,
    type: "accept" | "changes" | "decline" | "cancel"
  ) => {
    setActiveModalProposal(proposal);
    setModalType(type);
    setModalNote("");
    setModalNewDate(proposal.proposedDate || "");
    setModalNewTime(proposal.proposedStartTime || "18:00");
  };

  const handleExecuteTransition = async () => {
    if (!activeModalProposal || !modalType || isSubmitting) return;

    setIsSubmitting(true);
    let actionType: "accept" | "request_changes" | "decline" | "cancel" = "accept";
    if (modalType === "changes") actionType = "request_changes";
    else if (modalType === "decline") actionType = "decline";
    else if (modalType === "cancel") actionType = "cancel";

    const ok = await onTransitionProposal(activeModalProposal.id, actionType, {
      note: modalNote.trim() || undefined,
      proposedDate: modalType === "changes" ? modalNewDate : undefined,
      proposedStartTime: modalType === "changes" ? modalNewTime : undefined,
      reason: modalType === "cancel" || modalType === "decline" ? modalNote.trim() : undefined,
    });

    setIsSubmitting(false);
    if (ok) {
      setActiveModalProposal(null);
      setModalType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and New Proposal Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Our Date Proposals & Negotiations
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Propose dates, review ideas, suggest alternate timings, and mutually confirm adventures.
          </p>
        </div>

        <button
          onClick={onOpenBuilder}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
        >
          <span>✨</span>
          <span>+ Propose New Date</span>
        </button>
      </div>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[var(--border-subtle)] space-y-3">
          <span className="text-4xl block">💌</span>
          <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
            No date proposals yet
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Ready to plan something special? Use the Perfect Date Builder to propose our next adventure!
          </p>
          <button
            onClick={onOpenBuilder}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[var(--pink-strong)] hover:bg-[var(--pink-deep)] transition-colors cursor-pointer"
          >
            Open Date Builder
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => {
            const statusInfo = statusConfig[proposal.status] || {
              label: proposal.status,
              bg: "#F1F5F9",
              color: "#475569",
              emoji: "✨",
            };

            const isProposer = proposal.proposerRole === currentRole;
            const canAccept =
              !isProposer &&
              (proposal.status === "proposed" || proposal.status === "changes_requested");
            const canSuggestChanges =
              proposal.status === "proposed" || proposal.status === "changes_requested";
            const canCancel =
              proposal.status !== "cancelled" &&
              proposal.status !== "completed" &&
              proposal.status !== "declined";

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white border border-[var(--border-subtle)] hover:border-[var(--border-medium)] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Header row: Status, Proposer, Date */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                        style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                      >
                        <span>{statusInfo.emoji}</span>
                        <span>{statusInfo.label}</span>
                      </span>

                      {proposal.isSurprise && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--lavender)] text-[var(--text-primary)]">
                          Surprise Mode 🤫
                        </span>
                      )}

                      <span className="text-xs text-[var(--text-muted)]">
                        Proposed by <strong className="text-[var(--text-primary)]">{proposal.proposerName}</strong>
                      </span>
                    </div>

                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] pt-1">
                      {proposal.title}
                    </h4>
                  </div>

                  {/* Scheduled Date & Time pill */}
                  <div className="px-4 py-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-right">
                    <span className="block font-serif text-sm font-bold text-[var(--pink-strong)]">
                      🗓️ {proposal.proposedDate} at {proposal.proposedStartTime}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)]">
                      {proposal.timeZone} • {proposal.totalEstimatedDurationMinutes} mins
                    </span>
                  </div>
                </div>

                {/* Personal Message Card */}
                {proposal.personalMessage && (
                  <div className="p-4 rounded-2xl bg-[var(--warm-cream)] border border-[#EFE5D8] flex items-start gap-3">
                    <span className="text-xl">💌</span>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A7561] block">
                        Personal Note from {proposal.proposerName}:
                      </span>
                      <p className="font-script text-lg text-[var(--text-primary)] italic">
                        &ldquo;{proposal.personalMessage}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* Surprise Vibe & Dress Code (If surprise mode) */}
                {proposal.isSurprise && (
                  <div className="p-4 rounded-2xl bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)] space-y-2 text-xs">
                    {proposal.surpriseVibe && (
                      <p>
                        <strong className="text-[var(--pink-strong)]">The Vibe:</strong> {proposal.surpriseVibe}
                      </p>
                    )}
                    {proposal.surpriseWhatToWear && (
                      <p>
                        <strong className="text-[var(--pink-strong)]">Dress Code & Preparation:</strong> {proposal.surpriseWhatToWear}
                      </p>
                    )}
                  </div>
                )}

                {/* Itinerary Summary Stops */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase block">
                    Itinerary Flow ({proposal.itinerary.length} stops)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {proposal.itinerary.map((stop, idx) => (
                      <div
                        key={stop.id ? `${proposal.id}-stop-${stop.id}-${idx}` : `${proposal.id}-stop-${idx}`}
                        className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Stop #{idx + 1}: {stop.title}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            {stop.estimatedDurationMinutes} mins
                          </span>
                        </div>
                        {stop.location && (
                          <p className="text-[11px] text-[var(--text-muted)]">
                            📍 {stop.location}
                          </p>
                        )}
                        {stop.notes && (
                          <p className="text-[11px] text-[var(--text-secondary)] italic">
                            &ldquo;{stop.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Negotiation Note / Status message */}
                {proposal.negotiationNote && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <strong>Latest Negotiation Note:</strong> {proposal.negotiationNote}
                  </div>
                )}

                {/* Proposal Audit Trail (Expandable) */}
                {proposal.history && proposal.history.length > 0 && (
                  <details className="text-xs text-[var(--text-muted)] bg-white rounded-2xl border border-[var(--border-subtle)] p-3 cursor-pointer">
                    <summary className="font-semibold text-[var(--text-secondary)] list-none flex items-center justify-between">
                      <span>📜 Proposal History & Negotiation Trail ({proposal.history.length})</span>
                      <span className="text-[10px] text-[var(--pink-strong)]">Toggle</span>
                    </summary>
                    <div className="pt-3 space-y-2 border-t border-[var(--border-subtle)] mt-2">
                      {proposal.history.map((entry, entryIdx) => (
                        <div key={entry.id ? `${proposal.id}-hist-${entry.id}-${entryIdx}` : `${proposal.id}-hist-${entryIdx}`} className="flex items-start justify-between gap-2 text-[11px]">
                          <div>
                            <strong className="text-[var(--text-primary)]">{entry.authorName}</strong>{" "}
                            <span className="text-[var(--pink-strong)]">[{entry.action}]</span>:{" "}
                            <span>{entry.message}</span>
                            {entry.changeDetails && (
                              <span className="block text-[10px] text-[var(--text-muted)]">
                                {entry.changeDetails}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                            {new Date(entry.timestamp).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Action Buttons Row */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Accept Proposal (only for the recipient of the proposal) */}
                    {canAccept && (
                      <button
                        onClick={() => handleOpenActionModal(proposal, "accept")}
                        className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-md cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>Accept Proposal ♡</span>
                      </button>
                    )}

                    {/* Proposer waiting badge */}
                    {isProposer && proposal.status === "proposed" && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-medium inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Awaiting partner&apos;s confirmation...</span>
                      </span>
                    )}

                    {/* Request changes / suggest another time */}
                    {canSuggestChanges && (
                      <button
                        onClick={() => handleOpenActionModal(proposal, "changes")}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>💬</span>
                        <span>Suggest Different Time / Changes</span>
                      </button>
                    )}

                    {/* Reveal surprise button for planner */}
                    {proposal.isSurprise && !proposal.surpriseRevealed && isProposer && (
                      <button
                        onClick={() => {
                          if (confirm("Reveal the surprise activities to your partner now?")) {
                            onTransitionProposal(proposal.id, "reveal_surprise", {});
                          }
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>✨</span>
                        <span>Reveal Surprise Details</span>
                      </button>
                    )}

                    {/* Mark as Completed (for confirmed events) */}
                    {proposal.status === "confirmed" && (
                      <button
                        onClick={() => {
                          if (confirm(`Mark "${proposal.title}" as completed? This will open the memory scrapbook!`)) {
                            onTransitionProposal(proposal.id, "complete", {});
                          }
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--pink-deep)] bg-white border border-[var(--border-medium)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>📸</span>
                        <span>Mark as Completed & Save Memories</span>
                      </button>
                    )}
                  </div>

                  {/* Polite Decline & Cancel */}
                  <div className="flex items-center gap-2">
                    {canAccept && (
                      <button
                        onClick={() => handleOpenActionModal(proposal, "decline")}
                        className="px-3 py-1.5 rounded-full text-xs text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Decline Politely
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleOpenActionModal(proposal, "cancel")}
                        className="px-3 py-1.5 rounded-full text-xs text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Action / Negotiation Modal */}
      <AnimatePresence>
        {activeModalProposal && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveModalProposal(null);
                setModalType(null);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  {modalType === "accept" && "Accept Date Proposal ♡"}
                  {modalType === "changes" && "Suggest Changes or New Timing 💬"}
                  {modalType === "decline" && "Decline Politely 💌"}
                  {modalType === "cancel" && "Cancel Date Event 🚫"}
                </h4>
                <button
                  onClick={() => {
                    setActiveModalProposal(null);
                    setModalType(null);
                  }}
                  className="w-7 h-7 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-xs text-[var(--text-muted)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Accept Flow */}
              {modalType === "accept" && (
                <div className="space-y-3 text-xs">
                  <p className="text-[var(--text-secondary)]">
                    You are confirming &ldquo;{activeModalProposal.title}&rdquo; for{" "}
                    <strong>{activeModalProposal.proposedDate} at {activeModalProposal.proposedStartTime}</strong>!
                  </p>
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Add a Sweet Confirmation Note (Optional):
                    </label>
                    <textarea
                      rows={2}
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="e.g. I cannot wait! I'm bringing homemade cookies! 🍪💕"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Suggest Changes Flow */}
              {modalType === "changes" && (
                <div className="space-y-3 text-xs">
                  <p className="text-[var(--text-secondary)]">
                    Propose a different date or start time, or suggest adjusting stops:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--text-primary)] block">
                        Suggested Date
                      </label>
                      <input
                        type="date"
                        value={modalNewDate}
                        onChange={(e) => setModalNewDate(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--text-primary)] block">
                        Suggested Time
                      </label>
                      <input
                        type="time"
                        value={modalNewTime}
                        onChange={(e) => setModalNewTime(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Message / Reason for Adjustment:
                    </label>
                    <textarea
                      rows={3}
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="e.g. Could we do Sunday evening instead? I have a late afternoon meeting on Saturday!"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Decline Flow */}
              {modalType === "decline" && (
                <div className="space-y-3 text-xs">
                  <p className="text-[var(--text-secondary)]">
                    Leave a kind message so your partner knows you still cherish them:
                  </p>
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Polite Note:
                    </label>
                    <textarea
                      rows={3}
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="e.g. I love this idea, but my schedule is so packed this week. Let's plan another one next week! ♡"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Cancel Flow */}
              {modalType === "cancel" && (
                <div className="space-y-3 text-xs">
                  <p className="text-[var(--text-secondary)]">
                    Are you sure you want to cancel &ldquo;{activeModalProposal.title}&rdquo;?
                  </p>
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Cancellation Reason:
                    </label>
                    <input
                      type="text"
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="e.g. Unforeseen schedule conflict"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalProposal(null);
                    setModalType(null);
                  }}
                  className="px-4 py-2 rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleExecuteTransition}
                  className="px-6 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Confirm Action"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
