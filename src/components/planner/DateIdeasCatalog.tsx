"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type {
  DateIdea,
  DatePreference,
  DateCategory,
  DateCostRange,
  DateEnvironment,
  DatePreferenceState,
} from "@/lib/server-db";

const categoryLabels: Record<DateCategory, { label: string; emoji: string }> = {
  cozy_home: { label: "Cozy at Home", emoji: "🛋️" },
  food_cafes: { label: "Food & Cafés", emoji: "☕" },
  outdoor_adventures: { label: "Outdoor Adventures", emoji: "🌿" },
  romantic_evenings: { label: "Romantic Evenings", emoji: "🕯️" },
  creative_activities: { label: "Creative Activities", emoji: "🎨" },
  spontaneous_adventures: { label: "Spontaneous Adventures", emoji: "🚗" },
  budget_friendly: { label: "Budget-Friendly", emoji: "🏷️" },
  special_occasions: { label: "Special Occasions", emoji: "🥂" },
};

const sampleCoverPresets = [
  { label: "Picnic Blanket", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { label: "Candlelit Dinner", url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" },
  { label: "Artisan Coffee", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" },
  { label: "Night Sky", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80" },
  { label: "Pottery & Clay", url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80" },
  { label: "Botanical Garden", url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80" },
];

interface DateIdeasCatalogProps {
  ideas: DateIdea[];
  preferences: DatePreference[];
  onToggleFavorite: (ideaId: string, currentFav: boolean) => void;
  onToggleShortlist: (ideaId: string, currentShortlisted: boolean) => void;
  onUpdatePreferenceState: (ideaId: string, state: DatePreferenceState) => void;
  onSavePersonalNote: (ideaId: string, note: string) => void;
  onCreateIdea: (newIdea: Partial<DateIdea>) => Promise<boolean>;
  onEditIdea?: (id: string, updates: Partial<DateIdea>) => Promise<boolean>;
  onDeleteIdea?: (id: string) => Promise<boolean>;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateIdeasCatalog({
  ideas,
  preferences,
  onToggleFavorite,
  onToggleShortlist,
  onUpdatePreferenceState,
  onSavePersonalNote,
  onCreateIdea,
  onDeleteIdea,
  currentRole,
}: DateIdeasCatalogProps) {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [selectedEnv, setSelectedEnv] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [viewFilter, setViewFilter] = useState<"all" | "favorites" | "shortlisted">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [noteModalIdea, setNoteModalIdea] = useState<DateIdea | null>(null);
  const [personalNoteText, setPersonalNoteText] = useState("");

  // Form states for new idea
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverPhoto, setNewCoverPhoto] = useState(sampleCoverPresets[0].url);
  const [newCategory, setNewCategory] = useState<DateCategory>("spontaneous_adventures");
  const [newCostRange, setNewCostRange] = useState<DateCostRange>("low");
  const [newCostEstimateText, setNewCostEstimateText] = useState("$20 - $35");
  const [newDuration, setNewDuration] = useState("2 hours");
  const [newDurationMinutes, setNewDurationMinutes] = useState(120);
  const [newEnvironment, setNewEnvironment] = useState<DateEnvironment>("both");
  const [newLocation, setNewLocation] = useState("");
  const [newPracticalNotes, setNewPracticalNotes] = useState("");
  const [newAccessibilityNotes, setNewAccessibilityNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preference mapping helper
  const getPrefForIdea = (ideaId: string): DatePreference | undefined => {
    return preferences.find((p) => p.ideaId === ideaId);
  };

  // Filter and sort calculation
  const filteredIdeas = ideas.filter((idea) => {
    const pref = getPrefForIdea(idea.id);

    // View filter
    if (viewFilter === "favorites" && !pref?.isFavorite) return false;
    if (viewFilter === "shortlisted" && !pref?.isShortlisted) return false;

    // Category filter
    if (selectedCategory !== "all" && idea.category !== selectedCategory) return false;

    // Budget filter
    if (selectedBudget !== "all" && idea.costRange !== selectedBudget) return false;

    // Environment filter
    if (selectedEnv !== "all" && idea.environment !== selectedEnv) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchDesc = idea.description.toLowerCase().includes(q);
      const matchLoc = idea.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    return true;
  });

  // Sorting
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortOption === "duration_asc") {
      return (a.estimatedDurationMinutes || 0) - (b.estimatedDurationMinutes || 0);
    }
    if (sortOption === "duration_desc") {
      return (b.estimatedDurationMinutes || 0) - (a.estimatedDurationMinutes || 0);
    }
    if (sortOption === "alpha") {
      return a.title.localeCompare(b.title);
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const handleOpenNoteModal = (idea: DateIdea) => {
    setNoteModalIdea(idea);
    const pref = getPrefForIdea(idea.id);
    setPersonalNoteText(pref?.personalNote || "");
  };

  const handleSaveNoteSubmit = () => {
    if (!noteModalIdea) return;
    onSavePersonalNote(noteModalIdea.id, personalNoteText);
    setNoteModalIdea(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onCreateIdea({
      title: newTitle.trim(),
      description: newDescription.trim(),
      coverPhoto: newCoverPhoto,
      category: newCategory,
      costRange: newCostRange,
      costEstimateText: newCostEstimateText.trim() || "$20 - $35",
      estimatedDuration: newDuration.trim() || "2 hours",
      estimatedDurationMinutes: Number(newDurationMinutes) || 120,
      environment: newEnvironment,
      location: newLocation.trim() || undefined,
      practicalNotes: newPracticalNotes.trim() || undefined,
      accessibilityNotes: newAccessibilityNotes.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setIsAddModalOpen(false);
      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewLocation("");
      setNewPracticalNotes("");
      setNewAccessibilityNotes("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, View Filter Pills & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* View Toggle Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs">
          <button
            onClick={() => setViewFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              viewFilter === "all"
                ? "bg-[var(--pink-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
            }`}
          >
            All Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setViewFilter("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5 ${
              viewFilter === "favorites"
                ? "bg-[var(--pink-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
            }`}
          >
            <span>💖</span>
            <span>Favorites</span>
          </button>
          <button
            onClick={() => setViewFilter("shortlisted")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5 ${
              viewFilter === "shortlisted"
                ? "bg-[var(--pink-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
            }`}
          >
            <span>📋</span>
            <span>Shortlist</span>
          </button>
        </div>

        {/* Action: Add Custom Idea */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>+ Add Custom Date Idea</span>
        </button>
      </div>

      {/* Filter Bar: Category Pills */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
              selectedCategory === "all"
                ? "bg-[var(--pink-strong)] text-white shadow-xs"
                : "bg-white text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
            }`}
          >
            All Categories ✨
          </button>
          {(Object.keys(categoryLabels) as DateCategory[]).map((cat) => {
            const config = categoryLabels[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-[var(--pink-strong)] text-white shadow-xs"
                    : "bg-white text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
                }`}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Dropdowns & Search */}
      <div className="p-4 rounded-2xl bg-white/70 border border-[var(--border-subtle)] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search ideas, locations, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] focus:outline-none focus:border-[var(--pink-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Budget */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] font-medium">Budget:</span>
          <select
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--pink-primary)]"
          >
            <option value="all">All Budgets</option>
            <option value="free">Free ($0)</option>
            <option value="low">Low ($)</option>
            <option value="medium">Medium ($$)</option>
            <option value="high">Special Occasion ($$$)</option>
          </select>
        </div>

        {/* Setting */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] font-medium">Setting:</span>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--pink-primary)]"
          >
            <option value="all">Indoor & Outdoor</option>
            <option value="indoor">Indoor Only 🛋️</option>
            <option value="outdoor">Outdoor Only 🌿</option>
            <option value="both">Both ⛅</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] font-medium">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--pink-primary)]"
          >
            <option value="default">Featured</option>
            <option value="duration_asc">Shortest duration first</option>
            <option value="duration_desc">Longest duration first</option>
            <option value="alpha">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      {sortedIdeas.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[var(--border-subtle)] space-y-3">
          <span className="text-4xl block">🔍</span>
          <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
            No date ideas match your current filter
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Try resetting your filters or create a brand new custom date idea!
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedBudget("all");
              setSelectedEnv("all");
              setViewFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedIdeas.map((idea, index) => {
            const pref = getPrefForIdea(idea.id);
            const isFav = pref?.isFavorite ?? false;
            const isShort = pref?.isShortlisted ?? false;
            const currentPrefState = pref?.status || "none";
            const catConfig = categoryLabels[idea.category] || { label: "Adventure", emoji: "✨" };

            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group relative rounded-3xl bg-white border border-[var(--border-subtle)] hover:border-[var(--pink-primary)] shadow-sm hover:shadow-[var(--shadow-pink-strong)] transition-all flex flex-col overflow-hidden"
              >
                {/* Cover Image & Overlays */}
                <div className="relative h-48 w-full overflow-hidden bg-[var(--pale-rose)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={idea.coverPhoto}
                    alt={idea.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[var(--text-primary)] shadow-xs">
                      {catConfig.emoji} {catConfig.label}
                    </span>
                    {idea.isCustom && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--lavender)] text-[var(--text-primary)]">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Top Right Heart Favorite Button */}
                  <button
                    onClick={() => onToggleFavorite(idea.id, isFav)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFav ? "💖" : "🤍"}
                  </button>

                  {/* Bottom Image Badges: Duration & Cost */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                      ⏳ {idea.estimatedDuration}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs font-semibold">
                      💰 {idea.costEstimateText}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-lg font-bold text-[var(--text-primary)] leading-snug">
                        {idea.title}
                      </h4>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      {idea.description}
                    </p>

                    {idea.location && (
                      <p className="text-[11px] text-[var(--pink-strong)] flex items-center gap-1 font-medium pt-1">
                        <span>📍</span>
                        <span>{idea.location}</span>
                      </p>
                    )}

                    {/* Practical & Accessibility Notes Dropdown/Expander */}
                    {(idea.practicalNotes || idea.accessibilityNotes) && (
                      <details className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-xl p-2.5 cursor-pointer mt-2 group/notes">
                        <summary className="font-semibold text-[var(--text-secondary)] list-none flex items-center justify-between">
                          <span>💡 Notes & Tips</span>
                          <span className="text-[10px] text-[var(--pink-strong)]">View</span>
                        </summary>
                        <div className="pt-2 space-y-1.5 border-t border-[var(--border-subtle)] mt-1.5">
                          {idea.practicalNotes && (
                            <p>
                              <strong className="text-[var(--text-primary)]">Tip:</strong> {idea.practicalNotes}
                            </p>
                          )}
                          {idea.accessibilityNotes && (
                            <p>
                              <strong className="text-[var(--text-primary)]">Access:</strong> {idea.accessibilityNotes}
                            </p>
                          )}
                        </div>
                      </details>
                    )}

                    {/* Saved Personal Note Preview */}
                    {pref?.personalNote && (
                      <div className="p-2.5 rounded-xl bg-[var(--warm-cream)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)] font-script italic">
                        &ldquo;{pref.personalNote}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
                    {/* Preference Selector Pills */}
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] font-bold block">
                        My Preference:
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <button
                          onClick={() => onUpdatePreferenceState(idea.id, currentPrefState === "really_want" ? "none" : "really_want")}
                          className={`py-1 px-1 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                            currentPrefState === "really_want"
                              ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-xs"
                              : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
                          }`}
                        >
                          🔥 Really Want
                        </button>
                        <button
                          onClick={() => onUpdatePreferenceState(idea.id, currentPrefState === "sounds_cute" ? "none" : "sounds_cute")}
                          className={`py-1 px-1 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                            currentPrefState === "sounds_cute"
                              ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-xs"
                              : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
                          }`}
                        >
                          ✨ Sounds Cute
                        </button>
                        <button
                          onClick={() => onUpdatePreferenceState(idea.id, currentPrefState === "maybe_someday" ? "none" : "maybe_someday")}
                          className={`py-1 px-1 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                            currentPrefState === "maybe_someday"
                              ? "bg-[var(--pink-primary)] text-white border-[var(--pink-strong)] shadow-xs"
                              : "bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--pale-rose)]"
                          }`}
                        >
                          ☁️ Someday
                        </button>
                      </div>
                    </div>

                    {/* Bottom Action Row: Shortlist & Personal Note */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => onToggleShortlist(idea.id, isShort)}
                        className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                          isShort
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--bg-blush)]"
                        }`}
                      >
                        <span>{isShort ? "✓" : "+"}</span>
                        <span>{isShort ? "Shortlisted" : "Add to Shortlist"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenNoteModal(idea)}
                        className="p-1.5 px-2.5 rounded-full border border-[var(--border-subtle)] bg-white hover:bg-[var(--pale-rose)] text-xs text-[var(--text-secondary)] cursor-pointer transition-colors"
                        title="Add private note"
                      >
                        ✏️ Note
                      </button>

                      {(currentRole === "creator" || idea.isCustom) && onDeleteIdea && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${idea.title}"?`)) {
                              onDeleteIdea(idea.id);
                            }
                          }}
                          className="p-1.5 rounded-full text-xs text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove idea"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Note Edit Modal */}
      <AnimatePresence>
        {noteModalIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteModalIdea(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Personal Note for &ldquo;{noteModalIdea.title}&rdquo;
                </h4>
                <button
                  onClick={() => setNoteModalIdea(null)}
                  className="w-7 h-7 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-xs text-[var(--text-muted)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Add a little reminder or hint (e.g. &ldquo;You promised to cook the pasta!&rdquo; or &ldquo;Let&apos;s go on a rainy afternoon&rdquo;).
              </p>

              <textarea
                value={personalNoteText}
                onChange={(e) => setPersonalNoteText(e.target.value)}
                placeholder="Write your personal note here..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--pink-primary)] resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setNoteModalIdea(null)}
                  className="px-4 py-2 rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNoteSubmit}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Date Idea Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    Create a Custom Date Idea
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                {/* Title */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Idea Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Rooftop Stargazing & Milkshakes"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--pink-primary)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Romantic Description *
                  </label>
                  <textarea
                    required
                    placeholder="Describe what we will do and why it will be special..."
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--pink-primary)] text-xs text-[var(--text-primary)] resize-none"
                  />
                </div>

                {/* Category & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as DateCategory)}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs cursor-pointer focus:outline-none focus:border-[var(--pink-primary)]"
                    >
                      {(Object.keys(categoryLabels) as DateCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabels[cat].emoji} {categoryLabels[cat].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Estimated Cost Range
                    </label>
                    <select
                      value={newCostRange}
                      onChange={(e) => {
                        const val = e.target.value as DateCostRange;
                        setNewCostRange(val);
                        if (val === "free") setNewCostEstimateText("Free ($0)");
                        else if (val === "low") setNewCostEstimateText("$15 - $30");
                        else if (val === "medium") setNewCostEstimateText("$40 - $70");
                        else setNewCostEstimateText("$80+");
                      }}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs cursor-pointer focus:outline-none focus:border-[var(--pink-primary)]"
                    >
                      <option value="free">Free ($0)</option>
                      <option value="low">Budget-Friendly ($15 - $30)</option>
                      <option value="medium">Moderate ($40 - $70)</option>
                      <option value="high">Special Occasion ($80+)</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Environment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Duration Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2.5 hours"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Duration Minutes
                    </label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={newDurationMinutes}
                      onChange={(e) => setNewDurationMinutes(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Setting
                    </label>
                    <select
                      value={newEnvironment}
                      onChange={(e) => setNewEnvironment(e.target.value as DateEnvironment)}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs cursor-pointer"
                    >
                      <option value="indoor">Indoor 🛋️</option>
                      <option value="outdoor">Outdoor 🌿</option>
                      <option value="both">Both ⛅</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Optional Location / Neighborhood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. River Promenade or Downtown Bistro"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                  />
                </div>

                {/* Cover Photo presets & URL */}
                <div className="space-y-2">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Cover Photograph
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {sampleCoverPresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewCoverPhoto(preset.url)}
                        className={`p-1 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          newCoverPhoto === preset.url
                            ? "border-[var(--pink-strong)] ring-2 ring-[var(--pink-primary)]/40"
                            : "border-[var(--border-subtle)]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-14 h-10 object-cover rounded-lg"
                        />
                        <span className="block text-[9px] text-center text-[var(--text-muted)] mt-0.5 max-w-[60px] truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="Or paste custom image URL..."
                    value={newCoverPhoto}
                    onChange={(e) => setNewCoverPhoto(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]"
                  />
                </div>

                {/* Practical Notes & Accessibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Practical Notes / What to Bring
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bring a warm hoodie and camera"
                      value={newPracticalNotes}
                      onChange={(e) => setNewPracticalNotes(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Accessibility Information
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair accessible, seated areas"
                      value={newAccessibilityNotes}
                      onChange={(e) => setNewAccessibilityNotes(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Add to Our Date Ideas ♡"}
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
