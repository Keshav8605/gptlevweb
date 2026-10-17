"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DateProposal, ChecklistItem } from "@/lib/server-db";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DateCalendarViewProps {
  proposals: DateProposal[];
  onUpdateChecklist: (proposalId: string, checklist: ChecklistItem[]) => Promise<boolean>;
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
  onOpenMemoriesForProposal?: (proposal: DateProposal) => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateCalendarView({
  proposals,
  onUpdateChecklist,
  onTransitionProposal,
  onOpenMemoriesForProposal,
}: DateCalendarViewProps) {
  // Calendar month navigation
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  // Detail Modal for an event
  const [activeEventDetail, setActiveEventDetail] = useState<DateProposal | null>(null);

  // New Checklist item input
  const [newChecklistText, setNewChecklistText] = useState("");
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState(false);

  // Reschedule dialog state inside detail modal
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayString(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayString(null);
  };

  // Find proposals for a given day (YYYY-MM-DD)
  const getProposalsForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;

    return proposals.filter((p) => p.proposedDate === dateString);
  };

  // Agenda: All upcoming dates sorted chronologically
  const upcomingEvents = [...proposals]
    .filter((p) => p.proposedDate && p.status !== "cancelled" && p.status !== "declined")
    .sort((a, b) => {
      const aTime = new Date(`${a.proposedDate}T${a.proposedStartTime || "00:00"}`).getTime();
      const bTime = new Date(`${b.proposedDate}T${b.proposedStartTime || "00:00"}`).getTime();
      return aTime - bTime;
    });

  // Filtered by selected calendar day
  const displayedAgenda = selectedDayString
    ? upcomingEvents.filter((p) => p.proposedDate === selectedDayString)
    : upcomingEvents;

  // Toggle Checklist Item
  const handleToggleChecklistItem = async (itemIndex: number) => {
    if (!activeEventDetail || isUpdatingChecklist) return;

    setIsUpdatingChecklist(true);
    const updatedChecklist = [...activeEventDetail.checklist];
    updatedChecklist[itemIndex] = {
      ...updatedChecklist[itemIndex],
      isCompleted: !updatedChecklist[itemIndex].isCompleted,
    };

    const ok = await onUpdateChecklist(activeEventDetail.id, updatedChecklist);
    setIsUpdatingChecklist(false);

    if (ok) {
      setActiveEventDetail({
        ...activeEventDetail,
        checklist: updatedChecklist,
      });
    }
  };

  // Add Checklist Item
  const handleAddChecklist = async () => {
    if (!activeEventDetail || !newChecklistText.trim() || isUpdatingChecklist) return;

    setIsUpdatingChecklist(true);
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      task: newChecklistText.trim(),
      isCompleted: false,
      assignedTo: "both",
      createdAt: new Date().toISOString(),
    };

    const updatedChecklist = [...(activeEventDetail.checklist || []), newItem];
    const ok = await onUpdateChecklist(activeEventDetail.id, updatedChecklist);
    setIsUpdatingChecklist(false);

    if (ok) {
      setNewChecklistText("");
      setActiveEventDetail({
        ...activeEventDetail,
        checklist: updatedChecklist,
      });
    }
  };

  // Remove Checklist Item
  const handleRemoveChecklistItem = async (itemIndex: number) => {
    if (!activeEventDetail || isUpdatingChecklist) return;

    setIsUpdatingChecklist(true);
    const updatedChecklist = [...activeEventDetail.checklist];
    updatedChecklist.splice(itemIndex, 1);

    const ok = await onUpdateChecklist(activeEventDetail.id, updatedChecklist);
    setIsUpdatingChecklist(false);

    if (ok) {
      setActiveEventDetail({
        ...activeEventDetail,
        checklist: updatedChecklist,
      });
    }
  };

  // Execute Reschedule
  const handleExecuteReschedule = async () => {
    if (!activeEventDetail || !rescheduleDate || !rescheduleTime) return;

    const ok = await onTransitionProposal(activeEventDetail.id, "reschedule", {
      proposedDate: rescheduleDate,
      proposedStartTime: rescheduleTime,
    });

    if (ok) {
      setIsRescheduling(false);
      setActiveEventDetail({
        ...activeEventDetail,
        proposedDate: rescheduleDate,
        proposedStartTime: rescheduleTime,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗓️</span>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Interactive monthly calendar and date agenda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full border border-[var(--border-subtle)] bg-white hover:bg-[var(--pale-rose)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)] cursor-pointer transition-colors"
            title="Previous Month"
          >
            ‹
          </button>
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white hover:bg-[var(--pale-rose)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full border border-[var(--border-subtle)] bg-white hover:bg-[var(--pale-rose)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)] cursor-pointer transition-colors"
            title="Next Month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Monthly Calendar Grid (7 Cols on desktop) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-sm space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day, idx) => (
              <span
                key={day}
                className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
                  idx === 0 || idx === 6 ? "text-[var(--pink-strong)]" : "text-[var(--text-muted)]"
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-14 sm:h-20 rounded-2xl bg-[var(--bg-surface)]/40 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dateString = `${year}-${formattedMonth}-${formattedDay}`;

              const dayEvents = getProposalsForDay(day);
              const isSelected = selectedDayString === dateString;

              const todayObj = new Date();
              const isToday =
                todayObj.getFullYear() === year &&
                todayObj.getMonth() === month &&
                todayObj.getDate() === day;

              const hasConfirmed = dayEvents.some((e) => e.status === "confirmed");
              const hasProposed = dayEvents.some((e) => e.status === "proposed" || e.status === "changes_requested");
              const hasCompleted = dayEvents.some((e) => e.status === "completed");

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDayString(isSelected ? null : dateString)}
                  className={`h-14 sm:h-20 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-[var(--pink-strong)] bg-[var(--pale-rose)] ring-2 ring-[var(--pink-primary)]/40 shadow-xs"
                      : isToday
                      ? "border-[var(--pink-primary)] bg-[var(--bg-surface)]"
                      : "border-[var(--border-subtle)] bg-white hover:bg-[var(--bg-surface)]/70"
                  }`}
                >
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center leading-none ${
                      isToday
                        ? "bg-[var(--pink-strong)] text-white"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {day}
                  </span>

                  {/* Event indicators dots/pills */}
                  {dayEvents.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-auto">
                      <div className="flex items-center gap-1 flex-wrap">
                        {hasConfirmed && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Confirmed date" />
                        )}
                        {hasProposed && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" title="Proposed date" />
                        )}
                        {hasCompleted && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" title="Completed date" />
                        )}
                      </div>
                      <span className="hidden sm:block text-[9px] font-semibold text-[var(--pink-strong)] truncate">
                        {dayEvents[0].title}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Confirmed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Proposed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Right Column: Upcoming Agenda View (Mobile Intuitive List, 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              {selectedDayString ? `Events on ${selectedDayString}` : "Upcoming Adventures Agenda"}
            </h4>

            {selectedDayString && (
              <button
                onClick={() => setSelectedDayString(null)}
                className="text-xs text-[var(--pink-strong)] font-semibold hover:underline cursor-pointer"
              >
                Show All Upcoming
              </button>
            )}
          </div>

          {displayedAgenda.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-[var(--border-subtle)] space-y-2">
              <span className="text-3xl block">🕊️</span>
              <p className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                No events scheduled for this view
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Click any day or switch to the Date Builder to propose our next date!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAgenda.map((event) => {
                const isConfirmed = event.status === "confirmed";
                const isCompleted = event.status === "completed";

                return (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setActiveEventDetail(event);
                      setRescheduleDate(event.proposedDate);
                      setRescheduleTime(event.proposedStartTime);
                    }}
                    className="p-4 rounded-3xl bg-white border border-[var(--border-subtle)] hover:border-[var(--pink-primary)] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : isCompleted
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isConfirmed ? "Confirmed ♡" : isCompleted ? "Completed" : "Proposed"}
                        </span>
                        <h5 className="font-serif text-base font-bold text-[var(--text-primary)] leading-tight pt-1">
                          {event.title}
                        </h5>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-serif text-xs font-bold text-[var(--pink-strong)]">
                          {event.proposedDate}
                        </span>
                        <span className="block text-[10px] text-[var(--text-muted)]">
                          {event.proposedStartTime}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {event.personalMessage || event.description || "Romantic couple adventure."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                      <span>⏳ {event.totalEstimatedDurationMinutes} mins</span>
                      <span className="text-[var(--pink-strong)] font-semibold group-hover:underline">
                        View Details & Checklist →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Event Details & Preparation Checklist Modal */}
      <AnimatePresence>
        {activeEventDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveEventDetail(null);
                setIsRescheduling(false);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--pink-strong)] tracking-wider uppercase">
                    Event Details & Preparation
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    {activeEventDetail.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-3">
                    <span>🗓️ {activeEventDetail.proposedDate} at {activeEventDetail.proposedStartTime}</span>
                    <span>📍 {activeEventDetail.itinerary[0]?.location || "Secret Location"}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveEventDetail(null);
                    setIsRescheduling(false);
                  }}
                  className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Personal message */}
              {activeEventDetail.personalMessage && (
                <div className="p-4 rounded-2xl bg-[var(--warm-cream)] border border-[#EFE5D8] text-xs space-y-1">
                  <span className="font-bold text-[#8A7561] uppercase tracking-wider text-[10px]">
                    Message from {activeEventDetail.proposerName}:
                  </span>
                  <p className="font-script text-base text-[var(--text-primary)]">
                    &ldquo;{activeEventDetail.personalMessage}&rdquo;
                  </p>
                </div>
              )}

              {/* Itinerary Stops */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Full Itinerary Stops ({activeEventDetail.itinerary.length})
                </h4>

                <div className="space-y-2">
                  {activeEventDetail.itinerary.map((stop, i) => (
                    <div
                      key={stop.id ? `${activeEventDetail.id}-stop-${stop.id}-${i}` : `${activeEventDetail.id}-stop-${i}`}
                      className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)]">
                          Stop #{i + 1}: {stop.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
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

              {/* Date Preparation Checklist */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Preparation Checklist
                  </h4>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {activeEventDetail.checklist?.filter((c) => c.isCompleted).length || 0} of{" "}
                    {activeEventDetail.checklist?.length || 0} complete
                  </span>
                </div>

                <div className="space-y-2">
                  {activeEventDetail.checklist?.map((item, idx) => (
                    <div
                      key={item.id ? `${activeEventDetail.id}-item-${item.id}-${idx}` : `${activeEventDetail.id}-item-${idx}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[var(--border-subtle)] text-xs"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklistItem(idx)}
                          className="w-4 h-4 rounded accent-[var(--pink-primary)] cursor-pointer"
                        />
                        <span
                          className={`transition-all ${
                            item.isCompleted
                              ? "line-through text-[var(--text-muted)]"
                              : "text-[var(--text-primary)] font-medium"
                          }`}
                        >
                          {item.task}
                        </span>
                      </label>

                      <button
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer ml-2 text-xs"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add checklist item */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add preparation item (e.g. Check reservation, bring charger)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklist();
                      }
                    }}
                    className="flex-1 p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Reschedule View (Inside Detail Modal) */}
              {isRescheduling && (
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--pink-primary)]/40 space-y-3 text-xs">
                  <h5 className="font-bold text-[var(--pink-strong)]">
                    Reschedule This Date
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--text-primary)] block">
                        New Date
                      </label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--text-primary)] block">
                        New Start Time
                      </label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[var(--border-subtle)] bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsRescheduling(false)}
                      className="px-3 py-1.5 rounded-full text-xs text-[var(--text-muted)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteReschedule}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[var(--pink-strong)] hover:bg-[var(--pink-deep)] cursor-pointer"
                    >
                      Save New Timing
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal Footer */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {!isRescheduling && activeEventDetail.status !== "completed" && (
                    <button
                      onClick={() => setIsRescheduling(true)}
                      className="px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-white hover:bg-[var(--pale-rose)] font-semibold text-[var(--text-secondary)] cursor-pointer"
                    >
                      Reschedule Date
                    </button>
                  )}

                  {activeEventDetail.status === "confirmed" && (
                    <button
                      onClick={() => {
                        if (confirm(`Mark "${activeEventDetail.title}" as completed?`)) {
                          onTransitionProposal(activeEventDetail.id, "complete", {});
                          if (onOpenMemoriesForProposal) {
                            onOpenMemoriesForProposal(activeEventDetail);
                          }
                          setActiveEventDetail(null);
                        }
                      }}
                      className="px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer"
                    >
                      📸 Mark Completed & Add Memories
                    </button>
                  )}

                  {activeEventDetail.status === "completed" && onOpenMemoriesForProposal && (
                    <button
                      onClick={() => {
                        onOpenMemoriesForProposal(activeEventDetail);
                        setActiveEventDetail(null);
                      }}
                      className="px-4 py-2 rounded-full text-white font-semibold bg-[var(--pink-strong)] cursor-pointer"
                    >
                      View Date Memories ♡
                    </button>
                  )}
                </div>

                {activeEventDetail.status !== "completed" && (
                  <button
                    onClick={() => {
                      const reason = prompt("Reason for cancelling this date event:");
                      if (reason !== null) {
                        onTransitionProposal(activeEventDetail.id, "cancel", { reason });
                        setActiveEventDetail(null);
                      }
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Cancel Event
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
