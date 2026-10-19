"use client";

import { useState } from "react";
import type { GiftRecord } from "@/lib/server-db";

const sectionMetadata: Record<
  string,
  { label: string; emoji: string; description: string; chapter: string }
> = {
  welcome: { label: "Welcome Envelope Surprise", emoji: "💌", description: "Personalized envelope opening and warm greeting", chapter: "Chapter 1" },
  observations: { label: "Things I Noticed About You", emoji: "👀", description: "Cherished quirks, habits, and adorable traits", chapter: "Chapter 2" },
  memories: { label: "Our Memories Scrapbook", emoji: "📸", description: "Polaroid photographs, dates, and recollections", chapter: "Chapter 3" },
  secretWorld: { label: "Our Secret World", emoji: "🔒", description: "Password-protected haven with hints and secret letter", chapter: "Chapter 4" },
  deluluMode: { label: "Delulu Mode", emoji: "🦋", description: "Playful relationship scenarios with humorous reactions", chapter: "Chapter 5" },
  quiz: { label: "Relationship Questionnaire", emoji: "❓", description: "Subjective question comparison and summary scorecard", chapter: "Chapter 6" },
  letters: { label: "Letters I Don't Say Enough", emoji: "💌", description: "Deep heartfelt letters with drop caps and signatures", chapter: "Chapter 7" },
  notebook: { label: "Our Shared Notebook", emoji: "📖", description: "Two-way shared couple journal with prompts and replies", chapter: "Chapter 8" },
  voice: { label: "Voice Message Whispers", emoji: "🎙️", description: "Recorded audio notes with playback and dedicated chimes", chapter: "Chapter 9" },
  datePlanner: { label: "Plan Our Next Adventure ♡", emoji: "🗺️", description: "Collaborative date ideas, proposals, calendar & countdown", chapter: "Chapter 10" },
  openWhenLetters: { label: "Open When... Envelopes", emoji: "✉️", description: "Special letters sealed until the exact moment arrives", chapter: "Chapter 11" },
  littleReasons: { label: "Little Reasons I Love You", emoji: "💗", description: "Dynamic appreciation cards with favorites bookmarking", chapter: "Chapter 12" },
  digitalGifts: { label: "Little Gifts I Owe You", emoji: "🎁", description: "Redeemable digital vouchers with claim verification", chapter: "Chapter 13" },
  ourSong: { label: "Our Song Dedicated Melody", emoji: "🎵", description: "Spinning vinyl record and audio pentatonic chimes", chapter: "Chapter 14" },
  finalHeart: { label: "Forever & Always", emoji: "❤️", description: "Milestone anniversary counter and final love celebration", chapter: "Chapter 15" },
};

interface SectionEditorRegistryProps {
  gift: GiftRecord;
  onChange: (updated: Partial<GiftRecord>) => void;
  onOpenMediaLibrary: (onSelect: (url: string) => void) => void;
}

export function SectionEditorRegistry({
  gift,
  onChange,
  onOpenMediaLibrary,
}: SectionEditorRegistryProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("welcome");

  const enabledSet = new Set(gift.enabledSections || []);
  const sectionOrder = gift.sectionOrder || Object.keys(sectionMetadata);

  // Toggle section enabled
  const handleToggleSection = (id: string) => {
    if (enabledSet.has(id)) {
      if (enabledSet.size <= 1) {
        alert("You must keep at least one section enabled in your gift.");
        return;
      }
      onChange({
        enabledSections: gift.enabledSections.filter((s) => s !== id),
      });
    } else {
      onChange({
        enabledSections: [...gift.enabledSections, id],
      });
    }
  };

  // Reorder sections
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onChange({ sectionOrder: updated });
  };

  const currentMeta = sectionMetadata[selectedSectionId] || {
    label: selectedSectionId,
    emoji: "✨",
    description: "",
    chapter: "Chapter",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Sections List & Reordering (5 cols) */}
      <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h4 className="font-serif text-base font-bold text-[var(--text-primary)]">
              Chapters & Section Order
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Enable, disable, or reorder the flow of your gift.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--pink-strong)] bg-[var(--pale-rose)] px-2.5 py-1 rounded-full">
            {gift.enabledSections?.length || 0} active
          </span>
        </div>

        {/* Section List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {sectionOrder.map((secId, index) => {
            const meta = sectionMetadata[secId] || {
              label: secId,
              emoji: "✨",
              description: "",
              chapter: `Ch ${index + 1}`,
            };
            const isEnabled = enabledSet.has(secId);
            const isSelected = selectedSectionId === secId;

            return (
              <div
                key={secId}
                onClick={() => setSelectedSectionId(secId)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--pale-rose)] border-[var(--pink-primary)] ring-1 ring-[var(--pink-primary)]/30 shadow-xs"
                    : isEnabled
                    ? "bg-white border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                    : "bg-stone-50 border-stone-200 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{meta.emoji}</span>
                  <div className="min-w-0">
                    <span className="block font-serif text-xs font-bold text-[var(--text-primary)] truncate">
                      {meta.label}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)]">
                      {meta.chapter} • {isEnabled ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Up / Down Controls */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveSection(index, "up")}
                    className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-white text-[10px] disabled:opacity-20 hover:bg-[var(--pale-rose)] cursor-pointer"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={index === sectionOrder.length - 1}
                    onClick={() => handleMoveSection(index, "down")}
                    className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-white text-[10px] disabled:opacity-20 hover:bg-[var(--pale-rose)] cursor-pointer"
                    title="Move down"
                  >
                    ▼
                  </button>

                  {/* Toggle Visible switch */}
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleSection(secId)}
                    className="w-4 h-4 accent-[var(--pink-primary)] cursor-pointer ml-1"
                    title={isEnabled ? "Hide section" : "Show section"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Section Content Form (7 cols) */}
      <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-6">
        {/* Active Section Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentMeta.emoji}</span>
            <div>
              <span className="text-[10px] font-bold text-[var(--pink-strong)] tracking-wider uppercase">
                Editing {currentMeta.chapter}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {currentMeta.label}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {currentMeta.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggleSection(selectedSectionId)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              enabledSet.has(selectedSectionId)
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {enabledSet.has(selectedSectionId) ? "✓ Section Active" : "✕ Section Hidden"}
          </button>
        </div>

        {/* Section Forms depending on selectedSectionId */}
        <div className="space-y-4 text-xs text-[var(--text-primary)]">
          {/* 1. WELCOME SURPRISE */}
          {selectedSectionId === "welcome" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold block">Envelope Headline</label>
                <input
                  type="text"
                  value={gift.welcomeTitle}
                  onChange={(e) => onChange({ welcomeTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Envelope Subtitle</label>
                <input
                  type="text"
                  value={gift.welcomeSubtitle}
                  onChange={(e) => onChange({ welcomeSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Welcome Envelope Letter Text</label>
                <textarea
                  rows={4}
                  value={gift.welcomeMessage}
                  onChange={(e) => onChange({ welcomeMessage: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] text-xs resize-none leading-relaxed"
                />
              </div>

              {/* 4 Floating Story Photo Cards */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs flex items-center gap-1.5 text-[var(--pink-strong)]">
                    <span>📸</span> 4 Floating Photo Cards (Solo, Couple or Any Photo)
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Universal Romantic Captions
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  These 4 floating photo cards surround the &quot;You &amp; Me&quot; title on the welcome screen. The quotes are specially crafted to look impressive and heartfelt whether you put a solo photo of your partner, yourself, or both of you together.
                </p>

                <div className="space-y-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const defaultLabels = [
                      "Card 1 · Top-Left",
                      "Card 2 · Top-Right",
                      "Card 3 · Bottom-Left",
                      "Card 4 · Bottom-Right",
                    ];
                    const defaultCaptions = [
                      "A moment I'd choose a thousand times ♡",
                      "The sweetest view in the whole world ✨",
                      "Right here is where my heart belongs ♡",
                      "The best part of every single day ✨",
                    ];
                    const defaultPhotos = [
                      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
                      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
                      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
                      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
                    ];

                    const currentPolaroid = (gift.welcomePolaroids && gift.welcomePolaroids[idx]) || {
                      src: defaultPhotos[idx],
                      caption: defaultCaptions[idx],
                    };

                    const updatePolaroid = (field: "src" | "caption", val: string) => {
                      const updated = [
                        ...(gift.welcomePolaroids || [
                          { src: defaultPhotos[0], caption: defaultCaptions[0] },
                          { src: defaultPhotos[1], caption: defaultCaptions[1] },
                          { src: defaultPhotos[2], caption: defaultCaptions[2] },
                          { src: defaultPhotos[3], caption: defaultCaptions[3] },
                        ]),
                      ];
                      updated[idx] = {
                        ...updated[idx],
                        [field]: val,
                      };
                      onChange({ welcomePolaroids: updated });
                    };

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white/70 rounded-xl border border-[var(--border-subtle)] space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-primary)]">
                          <span>{defaultLabels[idx]}</span>
                          <span className="text-[10px] text-[var(--pink-deep)] font-normal font-handwritten">
                            {currentPolaroid.caption || defaultCaptions[idx]}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-[var(--text-muted)] block">Photo URL</label>
                              <button
                                type="button"
                                onClick={() => onOpenMediaLibrary((url) => updatePolaroid("src", url))}
                                className="text-[10px] text-[var(--pink-primary)] hover:underline cursor-pointer"
                              >
                                Pick Media ↗
                              </button>
                            </div>
                            <input
                              type="text"
                              value={currentPolaroid.src || ""}
                              onChange={(e) => updatePolaroid("src", e.target.value)}
                              placeholder="Image URL..."
                              className="w-full p-2 rounded-lg border border-[var(--border-subtle)] text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Card Caption</label>
                            <input
                              type="text"
                              value={currentPolaroid.caption || ""}
                              onChange={(e) => updatePolaroid("caption", e.target.value)}
                              placeholder={defaultCaptions[idx]}
                              className="w-full p-2 rounded-lg border border-[var(--border-subtle)] text-xs"
                            />
                          </div>
                        </div>

                        {/* Quick preset suggestions */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {[
                            defaultCaptions[idx],
                            "My favourite human in existence ♡",
                            "Pure magic in a single frame ✨",
                            "The reason behind my biggest smile ✨",
                            "Endlessly loved, today & always ♡",
                          ].slice(0, 3).map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => updatePolaroid("caption", suggestion)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--soft-pink)] hover:bg-[var(--pink-light)] text-[var(--pink-deep)] transition-colors cursor-pointer"
                            >
                              + &quot;{suggestion}&quot;
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. SECRET WORLD */}
          {selectedSectionId === "secretWorld" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold block">Secret Password *</label>
                <input
                  type="text"
                  value={gift.secretPassword || "iloveyou"}
                  onChange={(e) => onChange({ secretPassword: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Gentle Hint</label>
                <input
                  type="text"
                  value={gift.secretHint || ""}
                  onChange={(e) => onChange({ secretHint: e.target.value })}
                  placeholder="e.g. What I always whisper to you before sleep..."
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Secret Protected Love Letter</label>
                <textarea
                  rows={4}
                  value={gift.secretContent || ""}
                  onChange={(e) => onChange({ secretContent: e.target.value })}
                  placeholder="Private letter only revealed when password is typed correctly..."
                  className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* 3. OUR SONG */}
          {selectedSectionId === "ourSong" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold block">Song Title</label>
                <input
                  type="text"
                  value={gift.featuredSong?.title || "Golden Hour (Our Melody)"}
                  onChange={(e) =>
                    onChange({
                      featuredSong: {
                        ...(gift.featuredSong || {
                          artist: "Acoustic Lofi",
                          dedication: "For you",
                        }),
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Artist</label>
                <input
                  type="text"
                  value={gift.featuredSong?.artist || "JVKE / Acoustic Lofi"}
                  onChange={(e) =>
                    onChange({
                      featuredSong: {
                        ...(gift.featuredSong || {
                          title: "Golden Hour",
                          dedication: "For you",
                        }),
                        artist: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Dedication Message</label>
                <textarea
                  rows={3}
                  value={gift.featuredSong?.dedication || ""}
                  onChange={(e) =>
                    onChange({
                      featuredSong: {
                        ...(gift.featuredSong || {
                          title: "Golden Hour",
                          artist: "Acoustic Lofi",
                        }),
                        dedication: e.target.value,
                      },
                    })
                  }
                  placeholder="Why this song belongs to us..."
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* 4. FOREVER & ALWAYS */}
          {selectedSectionId === "finalHeart" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold block">Official Relationship Date</label>
                <input
                  type="date"
                  value={gift.dateOfficialCouple || gift.dateFirstMet || "2023-08-20"}
                  onChange={(e) => onChange({ dateOfficialCouple: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Final Letter to Close the Experience</label>
                <textarea
                  rows={4}
                  value={gift.finalLetter || ""}
                  onChange={(e) => onChange({ finalLetter: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[var(--border-subtle)] text-xs resize-none leading-relaxed"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Closing Sign-off Message</label>
                <input
                  type="text"
                  value={gift.finalMessage || ""}
                  onChange={(e) => onChange({ finalMessage: e.target.value })}
                  placeholder="e.g. Forever yours, with all my love."
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs"
                />
              </div>
            </div>
          )}

          {/* 5. GENERAL SECTIONS (Observations, Memories, Letters, Delulu, Quiz, DatePlanner, etc.) */}
          {selectedSectionId !== "welcome" &&
            selectedSectionId !== "secretWorld" &&
            selectedSectionId !== "ourSong" &&
            selectedSectionId !== "finalHeart" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                  <h5 className="font-serif text-sm font-bold text-[var(--text-primary)]">
                    {currentMeta.label} Content Management
                  </h5>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    This section comes pre-loaded with rich romantic content and supports live interactive contributions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenMediaLibrary(() => {})}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>📸</span>
                    <span>Browse Media Library for This Section</span>
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
