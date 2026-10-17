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
  currentRole: "creator" | "recipient";
  currentName: string;
}

const sampleMemoryPhotos = [
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
];

export function DateMemoriesGallery({
  memories,
  completedProposals,
  onAddMemory,
  onDeleteMemory,
  initialProposalForMemory,
  currentRole,
}: DateMemoriesGalleryProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!initialProposalForMemory);

  // Form states
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    initialProposalForMemory?.id || ""
  );
  const [dateTitle, setDateTitle] = useState(initialProposalForMemory?.title || "");
  const [completedDate, setCompletedDate] = useState(() => {
    return initialProposalForMemory?.proposedDate || new Date().toISOString().split("T")[0];
  });
  const [description, setDescription] = useState("");
  const [favoriteMoment, setFavoriteMoment] = useState("");
  const [funniestMoment, setFunniestMoment] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [ratingEmoji, setRatingEmoji] = useState("⭐⭐⭐⭐⭐");
  const [inspiredNextIdea, setInspiredNextIdea] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([sampleMemoryPhotos[0]]);
  const [customPhotoInput, setCustomPhotoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox for photos
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const handleAddPhoto = () => {
    if (!customPhotoInput.trim()) return;
    setPhotoUrls([...photoUrls, customPhotoInput.trim()]);
    setCustomPhotoInput("");
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photoUrls];
    updated.splice(index, 1);
    setPhotoUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddMemory({
      proposalId: selectedProposalId || undefined,
      dateTitle: dateTitle.trim(),
      completedDate,
      photos: photoUrls,
      description: description.trim(),
      favoriteMoment: favoriteMoment.trim(),
      funniestMoment: funniestMoment.trim(),
      personalNote: personalNote.trim(),
      ratingEmoji,
      inspiredNextIdea: inspiredNextIdea.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setIsAddModalOpen(false);
      // Reset form
      setDateTitle("");
      setDescription("");
      setFavoriteMoment("");
      setFunniestMoment("");
      setPersonalNote("");
      setInspiredNextIdea("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Memory Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            After the Date — Our Little Memories
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Every finished adventure preserved in our shared scrapbook with photographs, laughs, and favorite moments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
        >
          <span>📸</span>
          <span>+ Add Post-Date Memories</span>
        </button>
      </div>

      {/* Memories Scrapbook Cards */}
      {memories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[var(--border-subtle)] space-y-3">
          <span className="text-4xl block">📷</span>
          <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
            No memories logged yet
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Once we complete our first confirmed date, come here to capture polaroid photos, favorite moments, and funny giggles!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[var(--pink-strong)] hover:bg-[var(--pink-deep)] transition-colors cursor-pointer"
          >
            Add a Past Memory Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {memories.map((mem) => (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white border border-[var(--border-subtle)] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5 relative"
            >
              {/* Header: Title, Date, Rating */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--pale-rose)] text-[var(--pink-strong)]">
                    🗓️ {mem.completedDate}
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {mem.dateTitle}
                  </h4>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    Saved by <strong className="text-[var(--text-primary)]">{mem.authorName}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm block">{mem.ratingEmoji}</span>
                  {onDeleteMemory && (currentRole === "creator" || mem.authorRole === currentRole) && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete memory for "${mem.dateTitle}"?`)) {
                          onDeleteMemory(mem.id);
                        }
                      }}
                      className="text-[10px] text-[var(--text-muted)] hover:text-red-500 cursor-pointer mt-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Strip / Polaroids */}
              {mem.photos && mem.photos.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {mem.photos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxPhoto(photo)}
                      className="relative p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs hover:shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt="Memory capture"
                        className="w-28 h-28 object-cover rounded-xl"
                      />
                      <span className="absolute bottom-3 right-3 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[9px] font-bold">
                        🔍
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Story Description */}
              {mem.description && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {mem.description}
                </p>
              )}

              {/* Two Highlight Callouts: Favorite Moment & Funniest Moment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {mem.favoriteMoment && (
                  <div className="p-3.5 rounded-2xl bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--pink-strong)] flex items-center gap-1 text-[11px]">
                      <span>💖</span>
                      <span>Favorite Moment</span>
                    </span>
                    <p className="text-[var(--text-primary)] italic">
                      &ldquo;{mem.favoriteMoment}&rdquo;
                    </p>
                  </div>
                )}

                {mem.funniestMoment && (
                  <div className="p-3.5 rounded-2xl bg-[var(--warm-cream)] border border-[#EFE5D8] space-y-1">
                    <span className="font-bold text-[#8A7561] flex items-center gap-1 text-[11px]">
                      <span>😂</span>
                      <span>Funniest Moment</span>
                    </span>
                    <p className="text-[var(--text-primary)] italic">
                      &ldquo;{mem.funniestMoment}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Personal handwritten note */}
              {mem.personalNote && (
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
                    Personal Reflection:
                  </span>
                  <p className="font-script text-base text-[var(--text-primary)]">
                    &ldquo;{mem.personalNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Inspired next idea tag */}
              {mem.inspiredNextIdea && (
                <div className="flex items-center gap-2 text-xs text-[var(--pink-strong)] font-semibold pt-1">
                  <span>💡</span>
                  <span>Inspired next adventure: &ldquo;{mem.inspiredNextIdea}&rdquo;</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={lightboxPhoto}
              alt="Memory zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Add Memory Modal */}
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
                  <span className="text-2xl">📸</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    Save Our Date Memories
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Proposal selection (if completed proposals exist) */}
                {completedProposals.length > 0 && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Link to Completed Date (Optional)
                    </label>
                    <select
                      value={selectedProposalId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedProposalId(id);
                        const found = completedProposals.find((p) => p.id === id);
                        if (found) {
                          setDateTitle(found.title);
                          setCompletedDate(found.proposedDate);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs cursor-pointer"
                    >
                      <option value="">-- Choose from completed dates --</option>
                      {completedProposals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.proposedDate})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Date Adventure Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunset Picnic at Panoramic Hill"
                      value={dateTitle}
                      onChange={(e) => setDateTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Completed Date
                    </label>
                    <input
                      type="date"
                      value={completedDate}
                      onChange={(e) => setCompletedDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                {/* Story Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    What we did & what we loved
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the date went..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                  />
                </div>

                {/* Favorite & Funniest Moments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      💖 Favorite Moment
                    </label>
                    <input
                      type="text"
                      placeholder="The moment my heart fluttered..."
                      value={favoriteMoment}
                      onChange={(e) => setFavoriteMoment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      😂 Funniest Moment
                    </label>
                    <input
                      type="text"
                      placeholder="What made us laugh until we cried..."
                      value={funniestMoment}
                      onChange={(e) => setFunniestMoment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>
                </div>

                {/* Personal Note & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Personal Note / Love Whisper
                    </label>
                    <input
                      type="text"
                      placeholder="A secret little note to my love..."
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)] block">
                      Rating / Mood
                    </label>
                    <select
                      value={ratingEmoji}
                      onChange={(e) => setRatingEmoji(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs cursor-pointer"
                    >
                      <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ (Pure Perfection)</option>
                      <option value="💖💖💖💖💖">💖💖💖💖💖 (Overflowing Love)</option>
                      <option value="🌸✨🌸✨🌸">🌸✨🌸✨🌸 (Magical Dream)</option>
                      <option value="🍕🥂🎉🥳❤️">🍕🥂🎉🥳❤️ (Hilarious & Fun)</option>
                    </select>
                  </div>
                </div>

                {/* Inspired Next Idea */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Future Idea Inspired by This Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. We loved making pasta, let's try making sourdough pizza next!"
                    value={inspiredNextIdea}
                    onChange={(e) => setInspiredNextIdea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                  />
                </div>

                {/* Photos */}
                <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
                  <label className="font-semibold text-[var(--text-primary)] block">
                    Photographs ({photoUrls.length})
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {photoUrls.map((url, i) => (
                      <div key={i} className="relative group shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="preview"
                          className="w-16 h-16 object-cover rounded-xl border border-[var(--border-subtle)]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (Unsplash or web photo)..."
                      value={customPhotoInput}
                      onChange={(e) => setCustomPhotoInput(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-[var(--border-subtle)] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] cursor-pointer"
                    >
                      + Add Photo
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
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
                    {isSubmitting ? "Saving..." : "Save to Our Scrapbook ♡"}
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
