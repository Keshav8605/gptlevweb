"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import { DateCountdownBanner } from "./DateCountdownBanner";
import { DateIdeasCatalog } from "./DateIdeasCatalog";
import { DateItineraryBuilder } from "./DateItineraryBuilder";
import { DateProposalsView } from "./DateProposalsView";
import { DateCalendarView } from "./DateCalendarView";
import { DateMemoriesGallery } from "./DateMemoriesGallery";
import { DateNotificationDrawer } from "./DateNotificationDrawer";
import type {
  DateIdea,
  DatePreference,
  DateProposal,
  DateMemory,
  DateNotification,
  NotificationSettings,
  DatePreferenceState,
  ChecklistItem,
} from "@/lib/server-db";

type PlannerTab = "ideas" | "builder" | "proposals" | "calendar" | "memories";

interface DatePlannerSectionProps {
  onOpenAccessModal?: () => void;
}

export function DatePlannerSection({ onOpenAccessModal }: DatePlannerSectionProps) {
  const [activeTab, setActiveTab] = useState<PlannerTab>("ideas");

  // Dynamic user role & name from localStorage
  const [currentRole, setCurrentRole] = useState<"creator" | "recipient">(() => {
    if (typeof window === "undefined") return "recipient";
    return (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
  });
  const [currentName, setCurrentName] = useState<string>(() => {
    if (typeof window === "undefined") return "Baby";
    const role = localStorage.getItem("gift_participant_role") || "recipient";
    return localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
  });

  // Main state collections
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
  const [preferences, setPreferences] = useState<DatePreference[]>([]);
  const [proposals, setProposals] = useState<DateProposal[]>([]);
  const [memories, setMemories] = useState<DateMemory[]>([]);
  const [notifications, setNotifications] = useState<DateNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [initialProposalForMemory, setInitialProposalForMemory] = useState<DateProposal | null>(null);

  // Read role from localStorage
  const syncRole = useCallback(() => {
    if (typeof window === "undefined") return;
    const role = (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
    const name = localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
    setCurrentRole(role);
    setCurrentName(name);
  }, []);

  // Fetch all planner data
  const fetchAllData = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gift_auth_token") || "" : "";
      const role = typeof window !== "undefined" ? localStorage.getItem("gift_participant_role") || "recipient" : "recipient";

      // 1. Fetch Ideas & Preferences
      const ideasRes = await fetch(`/api/dates/ideas?role=${role}&token=${encodeURIComponent(token)}`);
      if (ideasRes.ok) {
        const data = await ideasRes.json();
        if (data.ideas) setIdeas(data.ideas);
        if (data.preferences) setPreferences(data.preferences);
      }

      // 2. Fetch Proposals
      const propRes = await fetch(`/api/dates/proposals?role=${role}&token=${encodeURIComponent(token)}`);
      if (propRes.ok) {
        const data = await propRes.json();
        if (data.proposals) setProposals(data.proposals);
      }

      // 3. Fetch Memories
      const memRes = await fetch("/api/dates/memories");
      if (memRes.ok) {
        const data = await memRes.json();
        if (data.memories) setMemories(data.memories);
      }

      // 4. Fetch Notifications
      const notifRes = await fetch(`/api/dates/notifications?role=${role}&token=${encodeURIComponent(token)}`);
      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === "number") setUnreadNotifCount(data.unreadCount);
      }

      // 5. Fetch Notification Settings
      const setRes = await fetch("/api/dates/notifications/settings");
      if (setRes.ok) {
        const data = await setRes.json();
        if (data.settings) setNotifSettings(data.settings);
      }
    } catch (err) {
      console.error("Error loading Date Planner data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, [syncRole, fetchAllData]);

  // ==================== MUTATION HANDLERS ====================

  // Toggle Favorite
  const handleToggleFavorite = async (ideaId: string, currentFav: boolean) => {
    const token = localStorage.getItem("gift_auth_token") || "";
    // Optimistic UI update
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          updates: { isFavorite: !currentFav },
          token,
          role: currentRole,
          name: currentName,
        }),
      });
    } catch (err) {
      console.error("Toggle favorite error:", err);
      fetchAllData();
    }
  };

  // Toggle Shortlist
  const handleToggleShortlist = async (ideaId: string, currentShortlisted: boolean) => {
    const token = localStorage.getItem("gift_auth_token") || "";
    // Optimistic UI update
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.ideaId === ideaId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isShortlisted: !currentShortlisted };
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
          isShortlisted: !currentShortlisted,
          updatedAt: new Date().toISOString(),
        },
      ];
    });

    try {
      await fetch("/api/dates/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          updates: { isShortlisted: !currentShortlisted },
          token,
          role: currentRole,
          name: currentName,
        }),
      });
    } catch (err) {
      console.error("Toggle shortlist error:", err);
      fetchAllData();
    }
  };

  // Update Preference State ("really_want" | "sounds_cute" | "maybe_someday" | "none")
  const handleUpdatePreferenceState = async (ideaId: string, state: DatePreferenceState) => {
    const token = localStorage.getItem("gift_auth_token") || "";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          updates: { status: state },
          token,
          role: currentRole,
          name: currentName,
        }),
      });
    } catch (err) {
      console.error("Update preference state error:", err);
      fetchAllData();
    }
  };

  // Save Personal Note on an Idea
  const handleSavePersonalNote = async (ideaId: string, note: string) => {
    const token = localStorage.getItem("gift_auth_token") || "";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          updates: { personalNote: note },
          token,
          role: currentRole,
          name: currentName,
        }),
      });
    } catch (err) {
      console.error("Save personal note error:", err);
      fetchAllData();
    }
  };

  // Create Custom Idea
  const handleCreateIdea = async (newIdea: Partial<DateIdea>): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch("/api/dates/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newIdea,
          token,
          role: currentRole,
          authorName: currentName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.idea) {
          setIdeas((prev) => [...prev, data.idea]);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Delete Idea
  const handleDeleteIdea = async (id: string): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch(`/api/dates/ideas?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&role=${currentRole}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIdeas((prev) => prev.filter((i) => i.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Propose Date
  const handleProposeDate = async (proposalData: Partial<DateProposal>): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch("/api/dates/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...proposalData,
          token,
          proposerRole: currentRole,
          proposerName: currentName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setProposals((prev) => [data.proposal, ...prev]);
          setActiveTab("proposals");
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Transition Proposal (Accept, Decline, Changes, Reschedule, Cancel, Complete, Reveal)
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
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch(`/api/dates/proposals/${encodeURIComponent(id)}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...payload,
          token,
          role: currentRole,
          name: currentName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setProposals((prev) =>
            prev.map((p) => (p.id === id ? data.proposal : p))
          );
          // If marked completed, switch to memories tab
          if (action === "complete") {
            setInitialProposalForMemory(data.proposal);
            setActiveTab("memories");
          }
          return true;
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Action could not be completed.");
      }
      return false;
    } catch {
      return false;
    }
  };

  // Update Checklist
  const handleUpdateChecklist = async (proposalId: string, checklist: ChecklistItem[]): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch(`/api/dates/proposals/${encodeURIComponent(proposalId)}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist,
          token,
          role: currentRole,
          name: currentName,
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

  // Add Date Memory
  const handleAddMemory = async (memoryData: Partial<DateMemory>): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch("/api/dates/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...memoryData,
          token,
          role: currentRole,
          authorName: currentName,
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

  // Delete Date Memory
  const handleDeleteMemory = async (id: string): Promise<boolean> => {
    const token = localStorage.getItem("gift_auth_token") || "";
    try {
      const res = await fetch(`/api/dates/memories?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&role=${currentRole}`, {
        method: "DELETE",
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

  // Mark Notifications Read
  const handleMarkNotificationsRead = async (ids: string[] | "all") => {
    const token = localStorage.getItem("gift_auth_token") || "";
    setNotifications((prev) =>
      prev.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
    setUnreadNotifCount(0);

    try {
      await fetch("/api/dates/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, token, role: currentRole }),
      });
    } catch {}
  };

  // Update Notification Settings
  const handleUpdateNotifSettings = async (updates: Partial<NotificationSettings>) => {
    setNotifSettings((prev) => (prev ? { ...prev, ...updates } : undefined));
    try {
      await fetch("/api/dates/notifications/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  // Counters for status bar
  const shortlistedCount = preferences.filter((p) => p.isShortlisted).length;
  const pendingProposalsCount = proposals.filter((p) => p.status === "proposed" || p.status === "changes_requested").length;
  const confirmedDatesCount = proposals.filter((p) => p.status === "confirmed").length;

  return (
    <SectionWrapper
      id="datePlanner"
      title="Plan Our Next Little Adventure ♡"
      subtitle="Where we explore date ideas, propose magical days, negotiate timing, and build forever memories"
      emoji="🗺️"
      bgVariant="blush"
      chapterNumber={9}
      nextSectionId="openWhenLetters"
      nextSectionLabel="Open When..."
      nextSectionEmoji="✉️"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Playful adventurous couple companion */}
        <div className="flex justify-center -mt-3 mb-6">
          <RomanticCharacter
            character="huggingCouple"
            size={180}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Top Control Bar: Active Participant, Notifications & Key Metrics */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/90 border border-[var(--border-subtle)] shadow-xs">
          {/* Active Partner Badge */}
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Planning as:</span>
            <span className="font-serif text-sm font-bold text-[var(--pink-strong)]">
              {currentName} ({currentRole === "creator" ? "Creator" : "Recipient"})
            </span>
            {onOpenAccessModal && (
              <button
                onClick={onOpenAccessModal}
                className="text-[11px] text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer font-medium ml-1"
              >
                Switch
              </button>
            )}
          </div>

          {/* Quick Metrics Badges & Notification Drawer Bell */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span className="px-3 py-1 rounded-full bg-[var(--pale-rose)] text-[var(--text-primary)] text-xs font-semibold">
              📋 {shortlistedCount} Shortlisted
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              ⏳ {pendingProposalsCount} Pending
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              🎉 {confirmedDatesCount} Confirmed
            </span>

            {/* In-App Notification Bell Drawer */}
            <DateNotificationDrawer
              notifications={notifications}
              unreadCount={unreadNotifCount}
              onMarkRead={handleMarkNotificationsRead}
              onSelectNotification={(notif) => {
                if (notif.type === "new_proposal" || notif.type === "changes_requested" || notif.type === "proposal_accepted") {
                  setActiveTab("proposals");
                } else if (notif.type === "post_date_memory_prompt") {
                  setActiveTab("memories");
                }
              }}
              settings={notifSettings}
              onUpdateSettings={handleUpdateNotifSettings}
            />
          </div>
        </div>

        {/* Live Countdown Banner for nearest confirmed future date */}
        <DateCountdownBanner
          proposals={proposals}
          onViewEvent={() => setActiveTab("calendar")}
          onExploreIdeas={() => setActiveTab("ideas")}
        />

        {/* 5-Tab Romantic Navigation Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
          <div className="inline-flex p-1.5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs min-w-max">
            <button
              onClick={() => setActiveTab("ideas")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 ${
                activeTab === "ideas"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]"
              }`}
            >
              <span>💡</span>
              <span>Browse Date Ideas ({ideas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 ${
                activeTab === "builder"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]"
              }`}
            >
              <span>📋</span>
              <span>Our Perfect Date Builder</span>
            </button>

            <button
              onClick={() => setActiveTab("proposals")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 relative ${
                activeTab === "proposals"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]"
              }`}
            >
              <span>💌</span>
              <span>Proposals & Responses</span>
              {pendingProposalsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 ${
                activeTab === "calendar"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]"
              }`}
            >
              <span>📅</span>
              <span>Shared Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab("memories")}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 ${
                activeTab === "memories"
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]"
              }`}
            >
              <span>📸</span>
              <span>Our Memories ({memories.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <span className="text-4xl inline-block animate-bounce">💖</span>
            <p className="font-serif text-lg text-[var(--text-secondary)]">
              Opening our little adventure book...
            </p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "ideas" && (
              <DateIdeasCatalog
                ideas={ideas}
                preferences={preferences}
                onToggleFavorite={handleToggleFavorite}
                onToggleShortlist={handleToggleShortlist}
                onUpdatePreferenceState={handleUpdatePreferenceState}
                onSavePersonalNote={handleSavePersonalNote}
                onCreateIdea={handleCreateIdea}
                onDeleteIdea={handleDeleteIdea}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}

            {activeTab === "builder" && (
              <DateItineraryBuilder
                ideas={ideas}
                preferences={preferences}
                onProposeDate={handleProposeDate}
                onSwitchToCatalog={() => setActiveTab("ideas")}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}

            {activeTab === "proposals" && (
              <DateProposalsView
                proposals={proposals}
                onTransitionProposal={handleTransitionProposal}
                onOpenBuilder={() => setActiveTab("builder")}
                currentRole={currentRole}
                currentName={currentName}
              />
            )}

            {activeTab === "calendar" && (
              <DateCalendarView
                proposals={proposals}
                onUpdateChecklist={handleUpdateChecklist}
                onTransitionProposal={handleTransitionProposal}
                onOpenMemoriesForProposal={(prop) => {
                  setInitialProposalForMemory(prop);
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
