"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DateMemory, DateProposal } from "@/lib/server-db";

interface DateMemoriesGalleryProps {
  memories: DateMemory[];
  completedProposals: DateProposal[];
  onAddMemory: (memory: Partial<DateMemory>) => Promise<boolean>;
  onDeleteMemory?: (id: string) => Promise<boolean>;
  initialProposalForMemory?: DateProposal | null;
  onExploreIdeas?: () => void;
  currentRole: "creator" | "recipient";
  currentName: string;
}

export function DateMemoriesGallery({
  memories,
  completedProposals,
  onAddMemory,
  onDeleteMemory,
  initialProposalForMemory,
  onExploreIdeas,
}: DateMemoriesGalleryProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(Boolean(initialProposalForMemory));
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    initialProposalForMemory?.id || ""
  );
  const [dateTitle, setDateTitle] = useState(initialProposalForMemory?.title || "");
  const [completedDate, setCompletedDate] = useState(() => {
    return initialProposalForMemory?.proposedDate || new Date().toISOString().split("T")[0];
  });
  const [personalNote, setPersonalNote] = useState("");
  const [favoriteMoment, setFavoriteMoment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox for photo inspection
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const ok = await onAddMemory({
      proposalId: selectedProposalId || undefined,
      dateTitle: dateTitle.trim(),
      completedDate,
      photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      personalNote: personalNote.trim(),
      favoriteMoment: favoriteMoment.trim(),
      ratingEmoji: "⭐⭐⭐⭐⭐",
    });

    setIsSubmitting(false);
    if (ok) {
      setIsAddModalOpen(false);
      setDateTitle("");
      setPersonalNote("");
      setFavoriteMoment("");
      setPhotoUrl("");
    }
  };

  return (
    <div className="space-y-6 font-rounded">
      {/* Header Area (Section 12 exact copy) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--romantic-plum)]">
            Our Little Memories ♡
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            The dates we&apos;ve enjoyed, the little things we did, and the moments worth keeping.
          </p>
        </div>

        <button
          onClick={() => {
            setDateTitle("");
            setSelectedProposalId("");
            setCompletedDate(new Date().toISOString().split("T")[0]);
            setPersonalNote("");
            setFavoriteMoment("");
            setPhotoUrl("");
            setIsAddModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
        >
          <span>Add a memory +</span>
        </button>
      </div>

      {/* Empty State (Section 12 exact copy) */}
      {memories.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-white/70 border border-dashed border-[var(--border-medium)] text-center space-y-3">
          <span className="text-3xl block">📖</span>
          <h4 className="text-lg font-bold text-[var(--romantic-plum)]">
            Our memory book is waiting for its first page ♡
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Every little adventure can become a memory.
          </p>
          {onExploreIdeas && (
            <div className="pt-2">
              <button
                onClick={onExploreIdeas}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md transition-all cursor-pointer shadow-xs"
              >
                Find our first date idea
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Memories Grid (Section 12) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem) => {
            const hasPhoto = mem.photos && mem.photos.length > 0;
            return (
              <div
                key={mem.id}
                className="flex flex-col justify-between rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs hover:border-[var(--pink-light)] hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Photo if available */}
                  {hasPhoto && (
                    <div
                      onClick={() => setLightboxPhoto(mem.photos[0])}
                      className="relative aspect-[16/10] w-full bg-[var(--pale-rose)] overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={mem.photos[0]}
                        alt={mem.dateTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[var(--romantic-plum)] text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                          🔍 View photo
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>🗓️ {mem.completedDate}</span>
                      {mem.ratingEmoji && <span>{mem.ratingEmoji}</span>}
                    </div>

                    <h4 className="text-base font-bold text-[var(--romantic-plum)]">
                      {mem.dateTitle}
                    </h4>

                    {mem.favoriteMoment && (
                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] p-2.5 rounded-2xl leading-relaxed italic">
                        &ldquo;{mem.favoriteMoment}&rdquo;
                      </p>
                    )}

                    {mem.personalNote && mem.personalNote !== mem.favoriteMoment && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {mem.personalNote}
                      </p>
                    )}
                  </div>
                </div>

                {onDeleteMemory && (
                  <div className="p-5 pt-0 flex justify-end">
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer py-1 px-2"
                      title="Delete memory"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
                  Keep a little memory ♡
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Remember the smiles, the quiet moments, and the laughter.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* Date Selection / Title */}
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">
                    What date did we go on? *
                  </label>
                  {completedProposals.length > 0 && (
                    <select
                      value={selectedProposalId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedProposalId(id);
                        const match = completedProposals.find((p) => p.id === id);
                        if (match) {
                          setDateTitle(match.title);
                          if (match.proposedDate) setCompletedDate(match.proposedDate);
                        }
                      }}
                      className="w-full mb-2 p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] cursor-pointer"
                    >
                      <option value="">Select a completed date (or type custom below)...</option>
                      {completedProposals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.proposedDate})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    value={dateTitle}
                    onChange={(e) => setDateTitle(e.target.value)}
                    placeholder="e.g. Sunset Picnic at the Overlook"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--pink-primary)]"
                  />
                </div>

                {/* Completed date */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    When was it?
                  </label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>

                {/* Favorite moment */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Favorite moment or little thing we did
                  </label>
                  <textarea
                    rows={2}
                    value={favoriteMoment}
                    onChange={(e) => setFavoriteMoment(e.target.value)}
                    placeholder="e.g. When we shared dessert and couldn't stop smiling..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs resize-none"
                  />
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save memory ♡"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxPhoto}
              alt="Memory"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
