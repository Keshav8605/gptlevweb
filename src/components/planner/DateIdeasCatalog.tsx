"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import type {
  DateIdea,
  DatePreference,
  DateCostRange,
  DatePreferenceState,
} from "@/lib/server-db";

const primaryCategories = [
  { id: "all", label: "All Dates", emoji: "✨" },
  { id: "cozy_home", label: "At Home", emoji: "🛋️" },
  { id: "food_cafes", label: "Food & Cafés", emoji: "☕" },
  { id: "outdoor_adventures", label: "Outdoors", emoji: "🌿" },
  { id: "romantic_evenings", label: "Romantic", emoji: "🕯️" },
  { id: "creative_activities", label: "Something New", emoji: "🎨" },
];

const secondaryCategories = [
  { id: "spontaneous_adventures", label: "Spontaneous Adventures", emoji: "🚗" },
  { id: "budget_friendly", label: "Budget-Friendly", emoji: "🏷️" },
  { id: "special_occasions", label: "Special Occasions", emoji: "🥂" },
];

function getCategoryDisplay(cat: string): { label: string; emoji: string } {
  switch (cat) {
    case "cozy_home":
      return { label: "AT HOME", emoji: "🛋️" };
    case "food_cafes":
      return { label: "FOOD & CAFÉS", emoji: "☕" };
    case "outdoor_adventures":
      return { label: "OUTDOORS", emoji: "🌿" };
    case "romantic_evenings":
      return { label: "ROMANTIC", emoji: "🕯️" };
    case "creative_activities":
      return { label: "SOMETHING NEW", emoji: "🎨" };
    case "spontaneous_adventures":
      return { label: "SPONTANEOUS", emoji: "🚗" };
    case "budget_friendly":
      return { label: "BUDGET-FRIENDLY", emoji: "🏷️" };
    case "special_occasions":
      return { label: "SPECIAL OCCASION", emoji: "🥂" };
    default:
      return { label: "DATE IDEA", emoji: "♡" };
  }
}

function getBudgetDisplay(costRange?: DateCostRange, text?: string): string {
  if (text && (text.toLowerCase().includes("free") || text.toLowerCase().includes("cost") || text.toLowerCase().includes("moderate"))) {
    return text;
  }
  switch (costRange) {
    case "free":
      return "Free";
    case "low":
      return "Low cost";
    case "medium":
      return "Moderate";
    case "high":
      return "Higher budget";
    default:
      return "Low cost";
  }
}

interface DateIdeasCatalogProps {
  ideas: DateIdea[];
  preferences: DatePreference[];
  onToggleFavorite: (ideaId: string, currentFav: boolean) => void;
  onToggleShortlist: (ideaId: string, currentShortlisted: boolean) => void;
  onUpdatePreferenceState: (ideaId: string, state: DatePreferenceState) => void;
  onSavePersonalNote: (ideaId: string, note: string) => void;
  onCreateIdea: (newIdea: Partial<DateIdea>) => Promise<boolean>;
  onProposeFromIdea?: (idea: DateIdea) => void;
  onNavigateToPlans?: () => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateIdeasCatalog({
  ideas,
  preferences,
  onToggleShortlist,
  onUpdatePreferenceState,
  onSavePersonalNote,
  onCreateIdea,
  onProposeFromIdea,
}: DateIdeasCatalogProps) {
  // Navigation & Category states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isMoreCatOpen, setIsMoreCatOpen] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [selectedSetting, setSelectedSetting] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recommended" | "lowest_cost" | "shortest_duration" | "alpha">("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [detailIdea, setDetailIdea] = useState<DateIdea | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Custom Idea Form State (Section 11)
  const [customTitle, setCustomTitle] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Personal note inside detail modal
  const [detailNoteDraft, setDetailNoteDraft] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const getPrefForIdea = (ideaId: string) => {
    return preferences.find((p) => p.ideaId === ideaId);
  };

  const isIdeaSaved = (ideaId: string): boolean => {
    const pref = getPrefForIdea(ideaId);
    return Boolean(pref?.isShortlisted || pref?.isFavorite);
  };

  const handleToggleSave = async (idea: DateIdea) => {
    const currentlySaved = isIdeaSaved(idea.id);
    onToggleShortlist(idea.id, currentlySaved);
    if (!currentlySaved) {
      triggerToast("Saved to Our Plans ♡");
    } else {
      triggerToast("Removed from Our Plans");
    }
  };

  // Filter and sort ideas
  const visibleIdeas = useMemo(() => {
    return ideas
      .filter((idea) => {
        // Category filter
        if (selectedCategory !== "all") {
          if (idea.category !== selectedCategory) return false;
        }

        // Budget filter
        if (selectedBudget !== "all") {
          if (idea.costRange !== selectedBudget) return false;
        }

        // Setting filter
        if (selectedSetting !== "all") {
          if (selectedSetting === "cozy_home" && idea.category !== "cozy_home") return false;
          if (selectedSetting === "indoor" && idea.environment !== "indoor" && idea.environment !== "both") return false;
          if (selectedSetting === "outdoor" && idea.environment !== "outdoor" && idea.environment !== "both") return false;
        }

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = idea.title.toLowerCase().includes(q);
          const matchDesc = idea.description.toLowerCase().includes(q);
          const matchLoc = idea.location?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "lowest_cost") {
          const costScore: Record<string, number> = { free: 0, low: 1, medium: 2, high: 3 };
          return (costScore[a.costRange || "low"] ?? 1) - (costScore[b.costRange || "low"] ?? 1);
        }
        if (sortBy === "shortest_duration") {
          return (a.estimatedDurationMinutes || 120) - (b.estimatedDurationMinutes || 120);
        }
        if (sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }
        return (a.sortOrder || 99) - (b.sortOrder || 99);
      });
  }, [ideas, selectedCategory, selectedBudget, selectedSetting, searchQuery, sortBy]);

  // Open details modal
  const handleOpenDetails = (idea: DateIdea) => {
    setDetailIdea(idea);
    const pref = getPrefForIdea(idea.id);
    setDetailNoteDraft(pref?.personalNote || "");
  };

  const handleSaveDetailNote = () => {
    if (!detailIdea) return;
    onSavePersonalNote(detailIdea.id, detailNoteDraft);
    triggerToast("Note saved ♡");
  };

  // Submit custom date
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || isSubmittingCustom) return;

    setIsSubmittingCustom(true);

    const ok = await onCreateIdea({
      title: customTitle.trim(),
      description: customNote.trim() || "A little adventure daydreamed by us.",
      location: customLocation.trim() || "A place we love",
      costRange: "low",
      costEstimateText: "Low cost",
      estimatedDuration: "About 2 hours",
      estimatedDurationMinutes: 120,
      category: "spontaneous_adventures",
      environment: "both",
      coverPhoto: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      practicalNotes: customDate ? `Planned for ${customDate}${customTime ? ` at ${customTime}` : ""}` : undefined,
    });

    setIsSubmittingCustom(false);
    if (ok) {
      setIsCreateModalOpen(false);
      triggerToast("Saved to Our Plans ♡");
      setCustomTitle("");
      setCustomDate("");
      setCustomTime("");
      setCustomLocation("");
      setCustomNote("");
    }
  };

  const hasActiveFilters = selectedBudget !== "all" || selectedSetting !== "all" || sortBy !== "recommended";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[var(--romantic-plum)] text-white px-5 py-2.5 rounded-full shadow-lg font-rounded text-xs sm:text-sm font-semibold flex items-center gap-2 border border-pink-300/30"
          >
            <span>♡</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section (Section 6) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="font-rounded text-xl sm:text-2xl font-bold text-[var(--romantic-plum)]">
            What sounds fun for us? ♡
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Pick a little idea, save your favorite, and make it happen together.
          </p>
        </div>

        {/* Action: Create our own date + (Section 11) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-full text-xs font-rounded font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
        >
          <span>Create our own date +</span>
        </button>
      </div>

      {/* Category Chips (Section 6) */}
      <div className="flex items-center gap-2 flex-wrap">
        {primaryCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setIsMoreCatOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-rounded font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)] hover:text-[var(--pink-strong)]"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Compact "More categories" control */}
        <div className="relative">
          <button
            onClick={() => setIsMoreCatOpen(!isMoreCatOpen)}
            className={`px-3 py-1.5 rounded-full text-xs font-rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              secondaryCategories.some((c) => c.id === selectedCategory)
                ? "bg-[var(--pink-strong)] text-white font-semibold shadow-xs"
                : "bg-white text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
            }`}
          >
            <span>More categories</span>
            <span className="text-[10px]">{isMoreCatOpen ? "▲" : "▾"}</span>
          </button>

          {isMoreCatOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl border border-[var(--border-subtle)] shadow-lg p-2 z-30 space-y-1">
              {secondaryCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsMoreCatOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-rounded flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-[var(--pale-rose)] text-[var(--pink-strong)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--pale-rose)]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters Bar (Section 6 & 13) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Compact Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a date idea…"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--pink-primary)] focus:ring-1 focus:ring-[var(--pink-primary)] transition-all shadow-2xs font-rounded"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)]">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-full text-xs font-rounded font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5 border ${
            hasActiveFilters || showFilters
              ? "bg-[var(--pale-rose)] text-[var(--pink-strong)] border-[var(--pink-light)] shadow-2xs"
              : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
          }`}
        >
          <span>✨ Filters</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink-strong)]" />}
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-rounded"
        >
          {/* Budget Filter */}
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Budget</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] cursor-pointer"
            >
              <option value="all">Any budget</option>
              <option value="free">Free</option>
              <option value="low">Low cost</option>
              <option value="medium">Moderate</option>
              <option value="high">Higher budget</option>
            </select>
          </div>

          {/* Setting Filter */}
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Setting</label>
            <select
              value={selectedSetting}
              onChange={(e) => setSelectedSetting(e.target.value)}
              className="w-full p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] cursor-pointer"
            >
              <option value="all">Any setting</option>
              <option value="cozy_home">At home</option>
              <option value="indoor">Indoors</option>
              <option value="outdoor">Outdoors</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recommended" | "lowest_cost" | "shortest_duration" | "alpha")}
              className="w-full p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="lowest_cost">Lowest cost</option>
              <option value="shortest_duration">Shortest duration</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={() => {
                  setSelectedBudget("all");
                  setSelectedSetting("all");
                  setSortBy("recommended");
                }}
                className="text-xs text-[var(--pink-strong)] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Date Idea Cards Grid (Section 8) */}
      {visibleIdeas.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/70 rounded-3xl border border-[var(--border-subtle)] p-6">
          <span className="text-3xl block">🔍</span>
          <p className="font-rounded font-semibold text-[var(--romantic-plum)]">
            No date ideas found matching that filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setSelectedBudget("all");
              setSelectedSetting("all");
            }}
            className="px-4 py-2 rounded-full text-xs font-rounded font-semibold text-[var(--pink-strong)] border border-[var(--pink-light)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
          >
            Show all date ideas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleIdeas.map((idea) => {
            const isSaved = isIdeaSaved(idea.id);
            const categoryInfo = getCategoryDisplay(idea.category);

            return (
              <div
                key={idea.id}
                className="group flex flex-col justify-between h-full bg-white rounded-3xl border border-[var(--border-subtle)] hover:border-[var(--pink-light)] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Image & Category Overlay */}
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--pale-rose)]">
                    <img
                      src={idea.coverPhoto}
                      alt={idea.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold font-rounded tracking-wide text-[var(--pink-strong)] shadow-2xs">
                        <span>{categoryInfo.emoji}</span>
                        <span>{categoryInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content (Short, clean, no truncated ellipsis) */}
                  <div className="p-5 space-y-2.5">
                    <h4 className="font-rounded text-base sm:text-lg font-bold text-[var(--romantic-plum)] leading-snug">
                      {idea.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {idea.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions (Section 8: Single primary action & optional details action) */}
                <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)]/40 mt-3 pt-3">
                  {/* Primary Action: Save for us ♡ / Saved ♡ */}
                  <button
                    onClick={() => handleToggleSave(idea)}
                    className={`flex-1 py-2 px-3.5 rounded-full text-xs font-rounded font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 ${
                      isSaved
                        ? "bg-[var(--pale-rose)] text-[var(--pink-strong)] border border-[var(--pink-light)] shadow-2xs font-bold"
                        : "bg-white text-[var(--romantic-plum)] border border-[var(--border-medium)] hover:border-[var(--pink-primary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50"
                    }`}
                  >
                    <span>{isSaved ? "♥" : "♡"}</span>
                    <span>{isSaved ? "Saved ♡" : "Save for us ♡"}</span>
                  </button>

                  {/* Secondary Action: View details */}
                  <button
                    onClick={() => handleOpenDetails(idea)}
                    className="py-2 px-3 rounded-full text-xs font-rounded font-medium text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)]/50 transition-colors cursor-pointer"
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {detailIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailIdea(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Image banner */}
              <div className="relative aspect-[16/9] w-full bg-[var(--pale-rose)] shrink-0">
                <img
                  src={detailIdea.coverPhoto}
                  alt={detailIdea.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setDetailIdea(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[var(--text-primary)] hover:bg-white flex items-center justify-center text-sm cursor-pointer shadow-xs"
                >
                  ✕
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 text-xs font-bold font-rounded text-[var(--pink-strong)] shadow-xs">
                    {getCategoryDisplay(detailIdea.category).label}
                  </span>
                </div>
              </div>

              {/* Scrollable details content */}
              <div className="p-6 overflow-y-auto space-y-4 font-rounded">
                <div>
                  <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
                    {detailIdea.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {detailIdea.description}
                  </p>
                </div>

                {/* Practical details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--bg-main)] p-3.5 rounded-2xl">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] font-semibold uppercase">Duration</span>
                    <span className="text-[var(--text-primary)] font-medium">{detailIdea.estimatedDuration || "About 2 hours"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] font-semibold uppercase">Budget</span>
                    <span className="text-[var(--text-primary)] font-medium">{getBudgetDisplay(detailIdea.costRange, detailIdea.costEstimateText)}</span>
                  </div>
                  {detailIdea.location && (
                    <div className="col-span-2">
                      <span className="text-[var(--text-muted)] block text-[10px] font-semibold uppercase">Location</span>
                      <span className="text-[var(--text-primary)] font-medium">📍 {detailIdea.location}</span>
                    </div>
                  )}
                  {detailIdea.practicalNotes && (
                    <div className="col-span-2">
                      <span className="text-[var(--text-muted)] block text-[10px] font-semibold uppercase">Little tip</span>
                      <span className="text-[var(--text-secondary)]">{detailIdea.practicalNotes}</span>
                    </div>
                  )}
                </div>

                {/* Personal Note */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[var(--romantic-plum)]">
                    Add a little note for us ♡
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={detailNoteDraft}
                      onChange={(e) => setDetailNoteDraft(e.target.value)}
                      placeholder="e.g. Let's do this on a Friday evening!"
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--pink-primary)]"
                    />
                    <button
                      onClick={handleSaveDetailNote}
                      className="px-3.5 py-2 rounded-xl bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--pink-light)]/40 transition-colors cursor-pointer"
                    >
                      Save note
                    </button>
                  </div>
                </div>

                {/* Compact Preference state */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">How do you feel about this idea?</span>
                  <div className="flex items-center gap-2">
                    {[
                      { state: "really_want" as const, label: "Really want! 💕" },
                      { state: "sounds_cute" as const, label: "Sounds cute ✨" },
                      { state: "maybe_someday" as const, label: "Someday 🌿" },
                    ].map((opt) => {
                      const pref = getPrefForIdea(detailIdea.id);
                      const isSelected = pref?.status === opt.state;
                      return (
                        <button
                          key={opt.state}
                          onClick={() => onUpdatePreferenceState(detailIdea.id, opt.state)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-[var(--pink-strong)] text-white border-[var(--pink-strong)]"
                              : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--bg-main)]/50">
                <button
                  onClick={() => {
                    handleToggleSave(detailIdea);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs font-rounded font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                    isIdeaSaved(detailIdea.id)
                      ? "bg-[var(--pale-rose)] text-[var(--pink-strong)] border border-[var(--pink-light)]"
                      : "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                  }`}
                >
                  <span>{isIdeaSaved(detailIdea.id) ? "♥ Saved ♡" : "♡ Save for us"}</span>
                </button>

                {onProposeFromIdea && (
                  <button
                    onClick={() => {
                      onProposeFromIdea(detailIdea);
                      setDetailIdea(null);
                    }}
                    className="py-2.5 px-4 rounded-full text-xs font-rounded font-semibold text-[var(--romantic-plum)] bg-white border border-[var(--border-medium)] hover:border-[var(--pink-primary)] transition-all cursor-pointer"
                  >
                    Plan this date ♡
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Our Own Date Modal (Section 11) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10 p-6 space-y-4 font-rounded"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--romantic-plum)]">
                    Create our own date ♡
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Daydream something new just for the two of us.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3.5 text-xs">
                {/* What would we like to do? */}
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">
                    What would we like to do? *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Sunset picnic, ceramic mug painting, ramen night..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--pink-primary)]"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      When? (Optional)
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                      What time? (Optional)
                    </label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                {/* Where? */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Where? (Optional)
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. Our kitchen, quiet seaside pier, local cafe..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                  />
                </div>


                {/* A little note */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    A little note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Bring your favorite dessert and warm cozy socks..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] resize-none"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCustom}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCustom ? "Saving..." : "Save our date ♡"}
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
