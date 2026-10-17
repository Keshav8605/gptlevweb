"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useId } from "react";
import type {
  DateIdea,
  DatePreference,
  ItineraryStop,
  DateProposal,
} from "@/lib/server-db";

interface DateItineraryBuilderProps {
  ideas: DateIdea[];
  preferences: DatePreference[];
  onProposeDate: (proposalData: Partial<DateProposal>) => Promise<boolean>;
  onSwitchToCatalog: () => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateItineraryBuilder({
  ideas,
  preferences,
  onProposeDate,
  onSwitchToCatalog,
  currentRole,
  currentName,
}: DateItineraryBuilderProps) {
  // Idempotency key generator
  const baseDedupeId = useId();

  // Shortlisted ideas
  const shortlistedIdeas = ideas.filter((idea) => {
    const pref = preferences.find((p) => p.ideaId === idea.id);
    return pref?.isShortlisted;
  });

  // Proposal Title & Details
  const [proposalTitle, setProposalTitle] = useState("Our Next Little Adventure ♡");
  const [proposedDate, setProposedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [proposedStartTime, setProposedStartTime] = useState("18:00");
  const [timeZone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const [personalMessage, setPersonalMessage] = useState(
    "I would love to take you out this weekend! Wear that cute jacket you look so gorgeous in. ♡"
  );

  // Surprise Mode State
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);
  const [surpriseVibe, setSurpriseVibe] = useState("Warm candlelit glow, sweet acoustic tunes & delicious bites");
  const [surpriseWhatToWear, setSurpriseWhatToWear] = useState("Something cute and comfortable with walking shoes");

  // Itinerary Stops
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([
    {
      id: "stop_init_1",
      ideaId: shortlistedIdeas[0]?.id || ideas[0]?.id || "idea_sunset_picnic",
      title: shortlistedIdeas[0]?.title || ideas[0]?.title || "Sunset Picnic at the Overlook",
      location: shortlistedIdeas[0]?.location || ideas[0]?.location || "Scenic Ridge Overlook",
      estimatedDurationMinutes: shortlistedIdeas[0]?.estimatedDurationMinutes || 120,
      estimatedCostText: shortlistedIdeas[0]?.costEstimateText || "$20 - $35",
      notes: "First stop: unpack snacks and relax together.",
      travelOrBreakMinutesAfter: 15,
      travelNotes: "Gentle stroll over to the next spot.",
    },
  ]);

  // Initial Checklist
  const [checklistTasks, setChecklistTasks] = useState<string[]>([
    "Pick matching cute outfits",
    "Bring camera or charged phone for portraits",
  ]);
  const [newChecklistInput, setNewChecklistInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCelebration, setSubmittedCelebration] = useState(false);

  // Add stop from idea
  const handleAddStopFromIdea = (idea: DateIdea) => {
    const newStop: ItineraryStop = {
      id: `stop_${idea.id}_${itinerary.length + 1}`,
      ideaId: idea.id,
      title: idea.title,
      location: idea.location,
      estimatedDurationMinutes: idea.estimatedDurationMinutes || 90,
      estimatedCostText: idea.costEstimateText || "$20 - $30",
      notes: "",
      travelOrBreakMinutesAfter: 15,
      travelNotes: "",
    };
    setItinerary([...itinerary, newStop]);
  };

  // Add blank custom stop
  const handleAddBlankStop = () => {
    const newStop: ItineraryStop = {
      id: `stop_custom_${itinerary.length + 1}`,
      title: "New Itinerary Stop",
      location: "",
      estimatedDurationMinutes: 60,
      estimatedCostText: "$15",
      notes: "",
      travelOrBreakMinutesAfter: 0,
      travelNotes: "",
    };
    setItinerary([...itinerary, newStop]);
  };

  // Remove stop
  const handleRemoveStop = (idx: number) => {
    if (itinerary.length <= 1) {
      alert("A date itinerary needs at least one activity stop!");
      return;
    }
    const updated = [...itinerary];
    updated.splice(idx, 1);
    setItinerary(updated);
  };

  // Move stop up or down
  const handleMoveStop = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= itinerary.length) return;
    const updated = [...itinerary];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setItinerary(updated);
  };

  // Total Duration Calculation
  const totalDurationMinutes = itinerary.reduce((acc, stop) => {
    return acc + (stop.estimatedDurationMinutes || 0) + (stop.travelOrBreakMinutesAfter || 0);
  }, 0);

  const formatDuration = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m} minutes`;
    if (m === 0) return `${hrs} hours`;
    return `${hrs}h ${m}m`;
  };

  // Add Checklist item
  const handleAddChecklistTask = () => {
    if (!newChecklistInput.trim()) return;
    setChecklistTasks([...checklistTasks, newChecklistInput.trim()]);
    setNewChecklistInput("");
  };

  const handleRemoveChecklistTask = (idx: number) => {
    const updated = [...checklistTasks];
    updated.splice(idx, 1);
    setChecklistTasks(updated);
  };

  // Submit Proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !proposedDate || isSubmitting) return;

    setIsSubmitting(true);

    const checklistFormatted = checklistTasks.map((task, i) => ({
      id: `chk_${Date.now()}_${i}`,
      task,
      isCompleted: false,
      assignedTo: "both" as const,
      createdAt: new Date().toISOString(),
    }));

    const success = await onProposeDate({
      title: proposalTitle.trim(),
      description: isSurpriseMode
        ? surpriseVibe
        : `A romantic date with ${itinerary.length} curated stop${itinerary.length === 1 ? "" : "s"}.`,
      isSurprise: isSurpriseMode,
      surpriseVibe: isSurpriseMode ? surpriseVibe : undefined,
      surpriseWhatToWear: isSurpriseMode ? surpriseWhatToWear : undefined,
      surpriseRevealed: !isSurpriseMode,
      itinerary,
      proposedDate,
      proposedStartTime,
      timeZone,
      totalEstimatedDurationMinutes: totalDurationMinutes,
      estimatedTotalBudget: `$${itinerary.length * 20} - $${itinerary.length * 40}`,
      proposerRole: currentRole,
      proposerName: currentName,
      personalMessage: personalMessage.trim(),
      status: "proposed",
      checklist: checklistFormatted,
      dedupeKey: `builder_${baseDedupeId}_${proposedDate}_${itinerary.length}`,
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedCelebration(true);
      setTimeout(() => setSubmittedCelebration(false), 5000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Shortlisted Ideas Quick-Pick Tray */}
      <div className="p-5 rounded-3xl bg-white/80 border border-[var(--border-subtle)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h4 className="font-serif text-base font-bold text-[var(--text-primary)]">
              Your Shortlisted Activities ({shortlistedIdeas.length})
            </h4>
          </div>
          <button
            onClick={onSwitchToCatalog}
            className="text-xs text-[var(--pink-strong)] font-semibold hover:underline cursor-pointer"
          >
            + Browse More Ideas
          </button>
        </div>

        {shortlistedIdeas.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">
            You haven&apos;t shortlisted any ideas yet. Click &ldquo;Add to Shortlist&rdquo; on any date idea in the catalog to easily insert it here!
          </p>
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {shortlistedIdeas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => handleAddStopFromIdea(idea)}
                className="p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--pink-primary)] hover:bg-[var(--pale-rose)] transition-all cursor-pointer flex items-center gap-2 shrink-0 group text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={idea.coverPhoto}
                  alt={idea.title}
                  className="w-10 h-10 object-cover rounded-xl"
                />
                <div>
                  <span className="block text-xs font-semibold text-[var(--text-primary)] max-w-[140px] truncate">
                    {idea.title}
                  </span>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    + Add to Itinerary
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Builder Form */}
      <form onSubmit={handleSubmitProposal} className="space-y-6">
        {/* Proposal Header & Surprise Mode Toggle */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="text-xs font-bold text-[var(--pink-strong)] tracking-wider uppercase block">
                Step 1: Date Vision & Theme
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
                Design Our Itinerary
              </h3>
            </div>

            {/* Surprise Date Mode Switch */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--pale-rose)] border border-[var(--border-medium)]">
              <div>
                <span className="block text-xs font-bold text-[var(--text-primary)]">
                  Surprise Date Mode 🤫
                </span>
                <span className="block text-[10px] text-[var(--text-secondary)]">
                  Keep stops secret until revealed
                </span>
              </div>
              <input
                type="checkbox"
                checked={isSurpriseMode}
                onChange={(e) => setIsSurpriseMode(e.target.checked)}
                className="w-5 h-5 accent-[var(--pink-strong)] cursor-pointer"
              />
            </div>
          </div>

          {/* Proposal Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-primary)] block">
              Adventure Name / Title *
            </label>
            <input
              type="text"
              required
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="e.g. Sunset Picnic & Constellation Night"
              className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] font-serif text-base text-[var(--text-primary)] focus:outline-none focus:border-[var(--pink-primary)]"
            />
          </div>

          {/* Surprise Mode Options (When Active) */}
          <AnimatePresence>
            {isSurpriseMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--pink-primary)]/40 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--pink-strong)]">
                  <span>✨</span>
                  <span>Surprise Date Guidance (Visible to Partner for Comfort & Safety)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      The Vibe / Teaser
                    </label>
                    <input
                      type="text"
                      value={surpriseVibe}
                      onChange={(e) => setSurpriseVibe(e.target.value)}
                      placeholder="e.g. Warm lights, gentle laughter & sweet treats"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Dress Code / What to Wear
                    </label>
                    <input
                      type="text"
                      value={surpriseWhatToWear}
                      onChange={(e) => setSurpriseWhatToWear(e.target.value)}
                      placeholder="e.g. Comfortable walking shoes and a cozy sweater"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-white text-xs"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] italic">
                  Note: The destination and stops will be concealed from your partner until you reveal them, but timing, duration, budget range, and dress code are kept clear for consent and preparation!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Assembling the Stops */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="text-xs font-bold text-[var(--pink-strong)] tracking-wider uppercase block">
                Step 2: Activity Flow & Stops
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
                Stops & Itinerary ({itinerary.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={handleAddBlankStop}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] transition-colors cursor-pointer"
            >
              + Add Custom Stop
            </button>
          </div>

          {/* Stops List with Reordering & Breaks */}
          <div className="space-y-4">
            {itinerary.map((stop, index) => (
              <div
                key={stop.id ? `builder-stop-${stop.id}-${index}` : `builder-stop-${index}`}
                className="relative p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--pink-strong)] text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={stop.title}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].title = e.target.value;
                        setItinerary(updated);
                      }}
                      className="font-serif text-lg font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--pink-primary)] focus:border-[var(--pink-strong)] focus:outline-none px-1"
                    />
                  </div>

                  {/* Up / Down Reorder and Delete controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStop(index, "up")}
                      className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-white text-xs disabled:opacity-30 hover:bg-[var(--pale-rose)] cursor-pointer"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === itinerary.length - 1}
                      onClick={() => handleMoveStop(index, "down")}
                      className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-white text-xs disabled:opacity-30 hover:bg-[var(--pale-rose)] cursor-pointer"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-white text-xs text-red-500 hover:bg-red-50 cursor-pointer ml-1"
                      title="Remove stop"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Stop Location & Duration Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                      📍 Stop Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The corner café"
                      value={stop.location || ""}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].location = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                      ⏳ Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      step={15}
                      min={15}
                      value={stop.estimatedDurationMinutes}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].estimatedDurationMinutes = Number(e.target.value) || 30;
                        setItinerary(updated);
                      }}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                      💰 Estimated Cost
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $25"
                      value={stop.estimatedCostText || ""}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].estimatedCostText = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                {/* Stop Notes */}
                <div className="space-y-1 text-xs">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Stop Notes / Special Touch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Order the almond croissant to share!"
                    value={stop.notes || ""}
                    onChange={(e) => {
                      const updated = [...itinerary];
                      updated[index].notes = e.target.value;
                      setItinerary(updated);
                    }}
                    className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs text-[var(--text-primary)]"
                  />
                </div>

                {/* Travel / Break Buffer between stops */}
                {index < itinerary.length - 1 && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--pink-strong)]">
                      🚶 Travel / Break before Stop #{index + 2}:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={stop.travelOrBreakMinutesAfter || 0}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[index].travelOrBreakMinutesAfter = Number(e.target.value) || 0;
                          setItinerary(updated);
                        }}
                        className="w-16 p-1.5 rounded-lg border border-[var(--border-subtle)] bg-white text-xs text-center font-bold text-[var(--text-primary)]"
                      />
                      <span>mins</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Scenic walk through the park"
                      value={stop.travelNotes || ""}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[index].travelNotes = e.target.value;
                        setItinerary(updated);
                      }}
                      className="flex-1 min-w-[150px] p-1.5 rounded-lg border border-[var(--border-subtle)] bg-white text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Aggregate Calculation Summary Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--pale-rose)] via-[var(--bg-surface)] to-[var(--pale-rose)] border border-[var(--border-medium)] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-[var(--text-primary)]">
                Itinerary Total Duration:
              </span>
              <p className="font-serif text-lg font-bold text-[var(--pink-strong)]">
                {formatDuration(totalDurationMinutes)} ({totalDurationMinutes} mins total)
              </p>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="font-semibold text-[var(--text-primary)]">
                Estimated Total Budget:
              </span>
              <p className="font-serif text-lg font-bold text-[var(--pink-strong)]">
                ${itinerary.length * 20} - ${itinerary.length * 40} approx
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Date, Time & Romantic Proposal Message */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-sm space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-bold text-[var(--pink-strong)] tracking-wider uppercase block">
              Step 3: Timing & Personal Message
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
              When Shall We Go?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)] block">
                Tentative Date *
              </label>
              <input
                type="date"
                required
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--pink-primary)] font-medium text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)] block">
                Proposed Start Time *
              </label>
              <input
                type="time"
                required
                value={proposedStartTime}
                onChange={(e) => setProposedStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--pink-primary)] font-medium text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)] block">
                Time Zone
              </label>
              <input
                type="text"
                readOnly
                value={timeZone}
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed text-xs"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[var(--text-primary)] block">
              Personal Romantic Note to Partner
            </label>
            <textarea
              rows={3}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Write a sweet message to invite your partner..."
              className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--pink-primary)] resize-none font-serif text-sm text-[var(--text-primary)]"
            />
          </div>

          {/* Preparation Checklist Items */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
            <label className="font-semibold text-[var(--text-primary)] block">
              Initial Date Preparation Checklist
            </label>
            <div className="space-y-1.5">
              {checklistTasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                >
                  <span className="text-[var(--text-secondary)]">✓ {task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistTask(i)}
                    className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add checklist item (e.g. Pick up flowers)..."
                value={newChecklistInput}
                onChange={(e) => setNewChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistTask();
                  }
                }}
                className="flex-1 p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
              />
              <button
                type="button"
                onClick={handleAddChecklistTask}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar & Celebration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-sm">
          <div>
            <span className="block font-serif text-base font-bold text-[var(--text-primary)]">
              Ready to propose this adventure?
            </span>
            <span className="block text-xs text-[var(--text-muted)]">
              Your partner will receive a lovely proposal to review and confirm!
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] via-[var(--pink-strong)] to-[var(--pink-deep)] hover:shadow-lg hover:scale-105 transition-all cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <span>💌</span>
            <span>{isSubmitting ? "Sending Proposal..." : "Send Date Proposal ♡"}</span>
          </button>
        </div>

        {/* Celebration Banner */}
        <AnimatePresence>
          {submittedCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-medium space-y-1 shadow-sm"
            >
              <p className="font-serif text-base font-bold">
                🎉 Date Proposal Sent to Your Partner!
              </p>
              <p>
                Switch to the &ldquo;Date Proposals&rdquo; tab or shared calendar to review responses and mutual confirmation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
