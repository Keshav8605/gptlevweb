"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import { DateIdeasCatalog } from "./DateIdeasCatalog";
import { DateProposalsView } from "./DateProposalsView";
import { DateMemoriesGallery } from "./DateMemoriesGallery";
import type {
  DateIdea,
  DatePreference,
  DateProposal,
  DateMemory,
  DatePreferenceState,
  ChecklistItem,
} from "@/lib/server-db";

import { getUnlockHeaders } from "@/lib/client-auth";

type PlannerTab = "discover" | "plans" | "memories";

interface DatePlannerSectionProps {
  onOpenAccessModal?: () => void;
  giftId?: string;
  currentUserRole?: "creator" | "recipient";
  currentUserName?: string;
}

export function DatePlannerSection({
  onOpenAccessModal,
  giftId,
  currentUserRole = "recipient",
  currentUserName = "Baby",
}: DatePlannerSectionProps) {
  // Navigation: 3 destinations (Section 5 exact labels)
  const [activeTab, setActiveTab] = useState<PlannerTab>("discover");

  const [currentRole] = useState<"creator" | "recipient">(currentUserRole);
  const [currentName] = useState<string>(currentUserName);

  // Main state collections
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
  const [preferences, setPreferences] = useState<DatePreference[]>([]);
  const [proposals, setProposals] = useState<DateProposal[]>([]);
  const [memories, setMemories] = useState<DateMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialProposalForMemory, setInitialProposalForMemory] = useState<DateProposal | null>(null);

  const activeGiftId = giftId || "default";

  // Fetch all planner data
  const fetchAllData = useCallback(async () => {
    try {
      const headers = getUnlockHeaders(activeGiftId);

      // 1. Fetch Ideas & Preferences
      const ideasRes = await fetch(`/api/dates/ideas?giftId=${encodeURIComponent(activeGiftId)}`, { headers });
      if (ideasRes.ok) {
        const data = await ideasRes.json();
        if (data.ideas) setIdeas(data.ideas);
        if (data.preferences) setPreferences(data.preferences);
      }

      // 2. Fetch Proposals
      const propRes = await fetch(`/api/dates/proposals?giftId=${encodeURIComponent(activeGiftId)}`, { headers });
      if (propRes.ok) {
        const data = await propRes.json();
        if (data.proposals) setProposals(data.proposals);
      }

      // 3. Fetch Memories
      const memRes = await fetch(`/api/dates/memories?giftId=${encodeURIComponent(activeGiftId)}`, { headers });
      if (memRes.ok) {
        const data = await memRes.json();
        if (data.memories) setMemories(data.memories);
      }
    } catch (err) {
      console.error("Error loading Date Planner data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeGiftId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ==================== MUTATION HANDLERS ====================

  // Toggle Favorite
  const handleToggleFavorite = async (ideaId: string, currentFav: boolean) => {
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.ideaId === ideaId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isFavorite: !currentFav };
        return next;
      }
      return [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          ideaId,
          participantRole: currentRole,
          participantName: currentName,
          status: "none",
          isFavorite: !currentFav,
          isShortlisted: false,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      await fetch("/api/dates/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          ideaId,
          updates: { isFavorite: !currentFav },
        }),
      });
    } catch (err) {
      console.error("Toggle favorite error:", err);
      fetchAllData();
    }
  };

  // Toggle Shortlist / Save (Section 8 & 9.B)
  const handleToggleShortlist = async (ideaId: string, currentShortlisted: boolean) => {
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.ideaId === ideaId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isShortlisted: !currentShortlisted, isFavorite: !currentShortlisted ? true : next[idx].isFavorite };
        return next;
      }
      return [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          ideaId,
          participantRole: currentRole,
          participantName: currentName,
          status: "none",
          isFavorite: !currentShortlisted,
          isShortlisted: !currentShortlisted,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      await fetch("/api/dates/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          ideaId,
          updates: { isShortlisted: !currentShortlisted, isFavorite: !currentShortlisted },
        }),
      });
    } catch (err) {
      console.error("Toggle shortlist error:", err);
      fetchAllData();
    }
  };

  // Update Preference State
  const handleUpdatePreferenceState = async (ideaId: string, state: DatePreferenceState) => {
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.ideaId === ideaId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], status: state };
        return next;
      }
      return [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          ideaId,
          participantRole: currentRole,
          participantName: currentName,
          status: state,
          isFavorite: false,
          isShortlisted: false,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      await fetch("/api/dates/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          ideaId,
          updates: { status: state },
        }),
      });
    } catch (err) {
      console.error("Update preference state error:", err);
      fetchAllData();
    }
  };

  // Save Personal Note on an Idea
  const handleSavePersonalNote = async (ideaId: string, note: string) => {
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.ideaId === ideaId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], personalNote: note };
        return next;
      }
      return [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          ideaId,
          participantRole: currentRole,
          participantName: currentName,
          status: "none",
          isFavorite: false,
          isShortlisted: false,
          personalNote: note,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      await fetch("/api/dates/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          ideaId,
          updates: { personalNote: note },
        }),
      });
    } catch (err) {
      console.error("Save personal note error:", err);
      fetchAllData();
    }
  };

  // Create Custom Idea (Section 11)
  const handleCreateIdea = async (newIdea: Partial<DateIdea>): Promise<boolean> => {
    try {
      const res = await fetch("/api/dates/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          ...newIdea,
          giftId: activeGiftId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.idea) {
          setIdeas((prev) => [...prev, data.idea]);
          // Also automatically save the newly created idea to Our Plans
          handleToggleShortlist(data.idea.id, false);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Propose Date (Section 9.D)
  const handleProposeDate = async (proposalData: Partial<DateProposal>): Promise<boolean> => {
    try {
      const res = await fetch("/api/dates/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          ...proposalData,
          giftId: activeGiftId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setProposals((prev) => [data.proposal, ...prev]);
          setActiveTab("plans");
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Transition Proposal (Accept, Reschedule, Complete, etc.)
  const handleTransitionProposal = async (
    id: string,
    action: "accept" | "request_changes" | "reschedule" | "decline" | "cancel" | "complete" | "reveal_surprise",
    payload: {
      note?: string;
      proposedDate?: string;
      proposedStartTime?: string;
      reason?: string;
    }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/dates/proposals/${encodeURIComponent(id)}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          action,
          ...payload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setProposals((prev) =>
            prev.map((p) => (p.id === id ? data.proposal : p))
          );
          if (action === "complete") {
            setInitialProposalForMemory(data.proposal);
            setActiveTab("memories");
          }
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Update Checklist
  const handleUpdateChecklist = async (proposalId: string, checklist: ChecklistItem[]): Promise<boolean> => {
    try {
      const res = await fetch(`/api/dates/proposals/${encodeURIComponent(proposalId)}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          giftId: activeGiftId,
          checklist,
        }),
      });

      if (res.ok) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, checklist } : p))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Add Memory (Section 12)
  const handleAddMemory = async (memoryData: Partial<DateMemory>): Promise<boolean> => {
    try {
      const res = await fetch("/api/dates/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getUnlockHeaders(activeGiftId) },
        body: JSON.stringify({
          ...memoryData,
          giftId: activeGiftId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          setMemories((prev) => [data.memory, ...prev]);
          setInitialProposalForMemory(null);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/dates/memories?id=${encodeURIComponent(id)}&giftId=${encodeURIComponent(activeGiftId)}`, {
        method: "DELETE",
        headers: getUnlockHeaders(activeGiftId),
      });

      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <SectionWrapper
      id="datePlanner"
      eyebrowLabel="OUR NEXT LITTLE ADVENTURE ✨"
      title="Let's Make a Day of It ♡"
      subtitle="Little plans, new places, and memories we haven't made yet."
      emoji="🗺️"
      bgVariant="blush"
      chapterNumber={10}
      nextSectionId="openWhenLetters"
      nextSectionLabel="Open your letters for every kind of day 💌"
      nextSectionSubtitle="And for the days when we can't plan an adventure, I still want you to have a little reminder of how loved you are."
      nextSectionEmoji="✉️"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Balanced Hero Illustration (Section 3) */}
        <div className="flex justify-center -mt-2 mb-2">
          <RomanticCharacter
            character="huggingCouple"
            size={130}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Small, unobtrusive recipient identity (Section 4) */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] font-rounded mb-6">
          <span>Planning for {currentName || "Baby"} ♡</span>
          {onOpenAccessModal && (
            <button
              onClick={onOpenAccessModal}
              className="text-[11px] text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer font-medium ml-1"
            >
              (switch)
            </button>
          )}
        </div>

        {/* Simple Three-Part Navigation (Section 5 exact labels) */}
        <div className="flex justify-center pb-2">
          <div className="grid grid-cols-3 p-1.5 rounded-full bg-white border border-[var(--border-subtle)] shadow-xs max-w-md w-full text-center">
            <button
              onClick={() => setActiveTab("discover")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-rounded font-semibold cursor-pointer transition-all ${
                activeTab === "discover"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50"
              }`}
            >
              Discover Dates
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-rounded font-semibold cursor-pointer transition-all ${
                activeTab === "plans"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50"
              }`}
            >
              Our Plans
            </button>

            <button
              onClick={() => setActiveTab("memories")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-rounded font-semibold cursor-pointer transition-all ${
                activeTab === "memories"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50"
              }`}
            >
              Our Memories
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <span className="text-3xl inline-block animate-bounce">💖</span>
            <p className="font-rounded text-sm text-[var(--text-secondary)]">
              Opening our little adventure book...
            </p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "discover" && (
              <DateIdeasCatalog
                ideas={ideas}
                preferences={preferences}
                onToggleFavorite={handleToggleFavorite}
                onToggleShortlist={handleToggleShortlist}
                onUpdatePreferenceState={handleUpdatePreferenceState}
                onSavePersonalNote={handleSavePersonalNote}
                onCreateIdea={handleCreateIdea}
                onProposeFromIdea={() => {
                  setActiveTab("plans");
                }}
                onNavigateToPlans={() => setActiveTab("plans")}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}

            {activeTab === "plans" && (
              <DateProposalsView
                ideas={ideas}
                preferences={preferences}
                proposals={proposals}
                onToggleShortlist={handleToggleShortlist}
                onProposeDate={handleProposeDate}
                onTransitionProposal={handleTransitionProposal}
                onUpdateChecklist={handleUpdateChecklist}
                onExploreIdeas={() => setActiveTab("discover")}
                onOpenMemories={(prop) => {
                  if (prop) setInitialProposalForMemory(prop);
                  setActiveTab("memories");
                }}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}

            {activeTab === "memories" && (
              <DateMemoriesGallery
                memories={memories}
                completedProposals={proposals.filter((p) => p.status === "completed")}
                onAddMemory={handleAddMemory}
                onDeleteMemory={handleDeleteMemory}
                initialProposalForMemory={initialProposalForMemory}
                onExploreIdeas={() => setActiveTab("discover")}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
}
