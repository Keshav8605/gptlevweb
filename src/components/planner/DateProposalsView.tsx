"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type {
  DateIdea,
  DatePreference,
  DateProposal,
  ChecklistItem,
} from "@/lib/server-db";
import { DateCalendarView } from "./DateCalendarView";

interface DateProposalsViewProps {
  ideas: DateIdea[];
  preferences: DatePreference[];
  proposals: DateProposal[];
  onToggleShortlist: (ideaId: string, currentShortlisted: boolean) => void;
  onProposeDate: (proposalData: Partial<DateProposal>) => Promise<boolean>;
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
  onUpdateChecklist?: (proposalId: string, checklist: ChecklistItem[]) => Promise<boolean>;
  onExploreIdeas: () => void;
  onOpenMemories: (proposal?: DateProposal) => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateProposalsView({
  ideas,
  preferences,
  proposals,
  onToggleShortlist,
  onProposeDate,
  onTransitionProposal,
  onUpdateChecklist,
  onExploreIdeas,
  onOpenMemories,
  currentRole,
}: DateProposalsViewProps) {
  // Calendar secondary toggle
  const [showCalendar, setShowCalendar] = useState(false);

  // Planning form modal (Section 9.D)
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [planIdeaTitle, setPlanIdeaTitle] = useState("");
  const [planIdeaId, setPlanIdeaId] = useState<string | undefined>(undefined);
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("18:00");
  const [planLocation, setPlanLocation] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Proposal detail / checklist modal
  const [detailProposal, setDetailProposal] = useState<DateProposal | null>(null);

  // Transition / Reschedule modal
  const [rescheduleProposal, setRescheduleProposal] = useState<DateProposal | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Filter genuine saved ideas
  const savedIdeas = ideas.filter((idea) => {
    const pref = preferences.find((p) => p.ideaId === idea.id);
    return Boolean(pref?.isShortlisted || pref?.isFavorite);
  });

  // Filter planned/proposed/confirmed dates (excluding completed/cancelled)
  const activeProposals = proposals.filter(
    (p) =>
      p.status === "proposed" ||
      p.status === "awaiting_response" ||
      p.status === "changes_requested" ||
      p.status === "confirmed"
  );

  // Filter completed dates
  const completedProposals = proposals.filter((p) => p.status === "completed");

  // Genuine upcoming confirmed date (Section 10)
  const upcomingConfirmed = proposals.find(
    (p) => p.status === "confirmed" && p.proposedDate && p.id !== "prop_demo_confirmed"
  );

  // Open planning modal for a specific saved idea
  const handleOpenPlanForIdea = (idea: DateIdea) => {
    setPlanIdeaTitle(idea.title);
    setPlanIdeaId(idea.id);
    setPlanLocation(idea.location || "");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPlanDate(tomorrow.toISOString().split("T")[0]);
    setPlanTime("18:00");
    setPlanNote("");
    setIsPlanningModalOpen(true);
  };

  // Submit plan (Section 9.D)
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planIdeaTitle.trim() || !planDate || isSubmittingPlan) return;

    setIsSubmittingPlan(true);

    const ok = await onProposeDate({
      title: planIdeaTitle.trim(),
      proposedDate: planDate,
      proposedStartTime: planTime || "18:00",
      itinerary: [
        {
          id: `stop_${Date.now()}`,
          ideaId: planIdeaId,
          title: planIdeaTitle.trim(),
          location: planLocation.trim() || "A place we love",
          estimatedDurationMinutes: 120,
          estimatedCostText: "Low cost",
          notes: planNote.trim() || "",
        },
      ],
      personalMessage: planNote.trim() || undefined,
    });

    setIsSubmittingPlan(false);
    if (ok) {
      setIsPlanningModalOpen(false);
      setPlanIdeaTitle("");
      setPlanIdeaId(undefined);
      setPlanDate("");
      setPlanLocation("");
      setPlanNote("");
    }
  };

  // Execute accept
  const handleAcceptProposal = async (proposalId: string) => {
    await onTransitionProposal(proposalId, "accept", {});
  };

  // Execute complete
  const handleCompleteProposal = async (proposal: DateProposal) => {
    const ok = await onTransitionProposal(proposal.id, "complete", {});
    if (ok) {
      onOpenMemories(proposal);
    }
  };

  // Submit reschedule
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleProposal || !rescheduleDate || isSubmittingReschedule) return;

    setIsSubmittingReschedule(true);
    const ok = await onTransitionProposal(rescheduleProposal.id, "reschedule", {
      proposedDate: rescheduleDate,
      proposedStartTime: rescheduleTime || "18:00",
      note: rescheduleNote.trim() || undefined,
    });
    setIsSubmittingReschedule(false);
    if (ok) {
      setRescheduleProposal(null);
    }
  };

  return (
    <div className="space-y-10 font-rounded">
      {/* 1. UPCOMING DATE CARD (Section 10) */}
      <div>
        {upcomingConfirmed ? (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[var(--pale-rose)]/40 to-white border border-[var(--pink-light)] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-[11px] font-bold tracking-wider uppercase shadow-2xs">
                  OUR NEXT DATE ♡
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--romantic-plum)]">
                  {upcomingConfirmed.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] flex flex-wrap items-center gap-3">
                  <span>🗓️ {upcomingConfirmed.proposedDate} at {upcomingConfirmed.proposedStartTime || "Evening"}</span>
                  {upcomingConfirmed.itinerary?.[0]?.location && (
                    <span>📍 {upcomingConfirmed.itinerary[0].location}</span>
                  )}
                </p>
                {upcomingConfirmed.personalMessage && (
                  <p className="text-xs text-[var(--pink-strong)] italic pt-1">
                    &ldquo;{upcomingConfirmed.personalMessage}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailProposal(upcomingConfirmed)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 transition-all cursor-pointer shadow-xs"
                >
                  View our plan
                </button>
                <button
                  onClick={() => handleCompleteProposal(upcomingConfirmed)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[var(--romantic-plum)] bg-white border border-[var(--border-medium)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                >
                  Mark completed 🎉
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 border border-[var(--border-subtle)] shadow-xs text-center space-y-3">
            <span className="text-2xl sm:text-3xl block">✨</span>
            <h4 className="text-lg sm:text-xl font-bold text-[var(--romantic-plum)]">
              Our next adventure is waiting ♡
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Save an idea you both like, and turn it into a plan whenever you&apos;re ready.
            </p>
            <div className="pt-1">
              <button
                onClick={onExploreIdeas}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Find a date idea</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. SAVED IDEAS SECTION (Section 9.C) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
            Saved Ideas
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Ideas we like but haven&apos;t committed to yet.
          </p>
        </div>

        {savedIdeas.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/70 border border-dashed border-[var(--border-medium)] text-center space-y-2.5">
            <span className="text-2xl block">💡</span>
            <h4 className="text-base font-bold text-[var(--romantic-plum)]">
              Nothing saved just yet ♡
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Find a date idea you love, and save it here for later.
            </p>
            <div className="pt-1">
              <button
                onClick={onExploreIdeas}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--pink-strong)] border border-[var(--pink-light)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
              >
                Explore date ideas
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedIdeas.map((idea) => {
              const pref = preferences.find((p) => p.ideaId === idea.id);
              return (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs hover:border-[var(--pink-light)] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={idea.coverPhoto}
                        alt={idea.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[var(--pale-rose)]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[var(--romantic-plum)] truncate">
                          {idea.title}
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {idea.estimatedDuration || "About 2 hours"} • {idea.costEstimateText || "Low cost"}
                        </p>
                      </div>
                    </div>

                    {pref?.personalNote && (
                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] p-2 rounded-xl italic">
                        &ldquo;{pref.personalNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]/40 mt-3 text-xs">
                    <button
                      onClick={() => handleOpenPlanForIdea(idea)}
                      className="flex-1 py-1.5 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-sm cursor-pointer transition-all text-center"
                    >
                      Plan this date ♡
                    </button>
                    <button
                      onClick={() => onToggleShortlist(idea.id, true)}
                      className="px-3 py-1.5 rounded-full text-xs text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PLANNED DATES SECTION (Section 9.C & 9.D) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
            Planned Dates
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Dates we have actually agreed to do.
          </p>
        </div>

        {activeProposals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/70 border border-dashed border-[var(--border-medium)] text-center space-y-2.5">
            <span className="text-2xl block">💌</span>
            <h4 className="text-base font-bold text-[var(--romantic-plum)]">
              No dates planned yet ♡
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Choose a saved idea and turn it into a plan.
            </p>
            <div className="pt-1">
              <button
                onClick={savedIdeas.length > 0 ? () => {} : onExploreIdeas}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--pink-strong)] border border-[var(--pink-light)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
              >
                Choose an idea
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProposals.map((proposal) => {
              const isConfirmed = proposal.status === "confirmed";
              const isAwaiting = proposal.status === "proposed" || proposal.status === "awaiting_response";
              const isChanges = proposal.status === "changes_requested";

              return (
                <div
                  key={proposal.id}
                  className="p-5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs hover:border-[var(--pink-light)] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isChanges
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-[var(--pale-rose)] text-[var(--pink-strong)] border border-[var(--pink-light)]"
                        }`}
                      >
                        {isConfirmed ? "Confirmed ♡" : isChanges ? "Changes Requested" : "Awaiting Response"}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {proposal.proposedDate}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-[var(--romantic-plum)]">
                      {proposal.title}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)]">
                      <span>⏰ {proposal.proposedStartTime || "18:00"}</span>
                      {proposal.itinerary?.[0]?.location && (
                        <span> • 📍 {proposal.itinerary[0].location}</span>
                      )}
                    </p>

                    {proposal.personalMessage && (
                      <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-main)] p-2.5 rounded-xl">
                        &ldquo;{proposal.personalMessage}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions for Planned Date */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]/40 flex-wrap text-xs">
                    {isAwaiting && (
                      <button
                        onClick={() => handleAcceptProposal(proposal.id)}
                        className="py-1.5 px-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-xs transition-all cursor-pointer"
                      >
                        Confirm plan ♡
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleCompleteProposal(proposal)}
                        className="py-1.5 px-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-xs transition-all cursor-pointer"
                      >
                        Mark as completed 🎉
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setRescheduleProposal(proposal);
                        setRescheduleDate(proposal.proposedDate || "");
                        setRescheduleTime(proposal.proposedStartTime || "18:00");
                        setRescheduleNote("");
                      }}
                      className="py-1.5 px-3 rounded-full text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50 transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>

                    <button
                      onClick={() => setDetailProposal(proposal)}
                      className="py-1.5 px-3 rounded-full text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50 transition-colors cursor-pointer ml-auto"
                    >
                      Details & checklist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COMPLETED DATES SECTION (Section 9.C & 9.E) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
            Completed Dates
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Dates we have already enjoyed.
          </p>
        </div>

        {completedProposals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/70 border border-dashed border-[var(--border-medium)] text-center space-y-2.5">
            <span className="text-2xl block">📸</span>
            <h4 className="text-base font-bold text-[var(--romantic-plum)]">
              Your memories will live here ♡
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              When you mark a date as completed, you can keep it here as a little memory.
            </p>
            <div className="pt-1">
              <button
                onClick={onExploreIdeas}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--pink-strong)] border border-[var(--pink-light)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
              >
                Explore date ideas
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lavender)] text-[var(--pink-deep)]">
                    Cherished Memory ♡
                  </span>
                  <h4 className="text-base font-bold text-[var(--romantic-plum)] mt-1.5">
                    {proposal.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Completed: {proposal.proposedDate}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)]/40">
                  <button
                    onClick={() => onOpenMemories(proposal)}
                    className="w-full py-1.5 px-3 rounded-full text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--pink-light)]/40 transition-colors cursor-pointer text-center"
                  >
                    View in Memories 📸
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. SHARED CALENDAR (Secondary View, Section 5) */}
      <div className="pt-4 border-t border-[var(--border-subtle)]/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-[var(--romantic-plum)]">
              Shared Calendar
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              See our upcoming dates on a shared monthly calendar.
            </p>
          </div>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--romantic-plum)] bg-white border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{showCalendar ? "▲ Hide calendar" : "📅 View shared calendar"}</span>
          </button>
        </div>

        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2"
          >
            <DateCalendarView
              proposals={proposals}
              onUpdateChecklist={onUpdateChecklist || (async () => false)}
              onTransitionProposal={onTransitionProposal}
              onOpenMemoriesForProposal={(p) => onOpenMemories(p)}
              currentRole={currentRole}
              currentName=""
            />
          </motion.div>
        )}
      </div>

      {/* MODAL: Simple Planning Form (Section 9.D) */}
      <AnimatePresence>
        {isPlanningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanningModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10 p-6 space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
                  Let&apos;s plan our date ♡
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Turn {planIdeaTitle ? `&ldquo;${planIdeaTitle}&rdquo;` : "this idea"} into a real plan for us.
                </p>
              </div>

              <form onSubmit={handleSavePlanSubmit} className="space-y-3.5 text-xs">
                {/* Date */}
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--pink-primary)]"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={planTime}
                    onChange={(e) => setPlanTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                {/* Location, optional */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Location, optional
                  </label>
                  <input
                    type="text"
                    value={planLocation}
                    onChange={(e) => setPlanLocation(e.target.value)}
                    placeholder="e.g. Scenic Ridge Overlook, that Italian bistro..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                {/* A little note, optional */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    A little note, optional
                  </label>
                  <textarea
                    rows={2}
                    value={planNote}
                    onChange={(e) => setPlanNote(e.target.value)}
                    placeholder="e.g. Wear your favorite sweater! I can't wait."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] resize-none"
                  />
                </div>

                {/* Buttons (Section 9.D exact copy) */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPlanningModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                  >
                    Not now
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPlan}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPlan ? "Saving..." : "Save our plan ♡"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Proposal Details & Checklist */}
      <AnimatePresence>
        {detailProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailProposal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden z-10 p-6 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)] bg-[var(--pale-rose)] px-2.5 py-0.5 rounded-full">
                    {detailProposal.status}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--romantic-plum)] mt-1.5">
                    {detailProposal.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    🗓️ {detailProposal.proposedDate} at {detailProposal.proposedStartTime}
                  </p>
                </div>
                <button
                  onClick={() => setDetailProposal(null)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 text-xs pr-1">
                {detailProposal.personalMessage && (
                  <div className="p-3 bg-[var(--bg-main)] rounded-2xl">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Personal Note</span>
                    <p className="text-[var(--text-primary)] mt-1 italic">&ldquo;{detailProposal.personalMessage}&rdquo;</p>
                  </div>
                )}

                {/* Itinerary stops */}
                {detailProposal.itinerary && detailProposal.itinerary.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Itinerary</span>
                    {detailProposal.itinerary.map((stop, idx) => (
                      <div key={stop.id || idx} className="p-3 bg-white border border-[var(--border-subtle)] rounded-xl space-y-1">
                        <span className="font-bold text-[var(--romantic-plum)]">{stop.title}</span>
                        {stop.location && <p className="text-[var(--text-secondary)]">📍 {stop.location}</p>}
                        {stop.notes && <p className="text-[var(--text-muted)] italic">{stop.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Checklist */}
                {detailProposal.checklist && detailProposal.checklist.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Checklist</span>
                    <div className="space-y-1.5">
                      {detailProposal.checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)]"
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={async (e) => {
                              if (!onUpdateChecklist) return;
                              const updated = detailProposal.checklist.map((c) =>
                                c.id === item.id ? { ...c, isCompleted: e.target.checked } : c
                              );
                              await onUpdateChecklist(detailProposal.id, updated);
                              setDetailProposal({ ...detailProposal, checklist: updated });
                            }}
                            className="rounded-sm accent-[var(--pink-primary)] cursor-pointer"
                          />
                          <span className={item.isCompleted ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}>
                            {item.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  onClick={() => setDetailProposal(null)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Reschedule */}
      <AnimatePresence>
        {rescheduleProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleProposal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10 p-6 space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
                  Reschedule Date 🗓️
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Pick a new date and time that works better for both of us.
                </p>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">New Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Little note</label>
                  <input
                    type="text"
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                    placeholder="e.g. Pushing by a few days so we have the whole evening!"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRescheduleProposal(null)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReschedule}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReschedule ? "Updating..." : "Update date ♡"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
