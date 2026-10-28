"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ALL_18_CHAPTERS } from "@/lib/creator-defaults";
import type { CreatorConfig, CreatorReasonItem } from "@/lib/creator-types";
import type { CharacterIdentifier } from "@/config/characterAssets";
import { WizardChapterSidePreview } from "./WizardChapterSidePreview";

interface WizardPersonalizeProps {
  config: CreatorConfig;
  onChange: (updates: Partial<CreatorConfig>) => void;
  onOpenPhotoLibrary: (onSelect: (url: string) => void, title?: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardPersonalize({
  config,
  onChange,
  onOpenPhotoLibrary,
  onNext,
  onBack,
}: WizardPersonalizeProps) {
  // Only show selected chapters
  const selectedChapters = ALL_18_CHAPTERS.filter((ch) =>
    config.selectedChapterIds.includes(ch.id)
  );

  const [activeChapterId, setActiveChapterId] = useState<string>(
    selectedChapters[0]?.id || "welcome"
  );

  // Mobile viewport view switcher (Form vs Live Preview)
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  // Search filter for Chapter 16 Date Ideas
  const [dateSearchQuery, setDateSearchQuery] = useState("");
  const [dateCategoryFilter, setDateCategoryFilter] = useState("all");

  // Temporary state for adding a custom item
  const [newCustomModal, setNewCustomModal] = useState<{
    chapterId: string;
    isOpen: boolean;
  }>({ chapterId: "", isOpen: false });

  // Custom item form states
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customEmoji, setCustomEmoji] = useState("✨");
  const [customPhoto, setCustomPhoto] = useState("");
  const [customExtra, setCustomExtra] = useState("");

  const currentChapter =
    selectedChapters.find((c) => c.id === activeChapterId) || selectedChapters[0];

  const handleNextChapter = () => {
    const idx = selectedChapters.findIndex((c) => c.id === activeChapterId);
    if (idx < selectedChapters.length - 1) {
      setActiveChapterId(selectedChapters[idx + 1].id);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      onNext();
    }
  };

  const handlePrevChapter = () => {
    const idx = selectedChapters.findIndex((c) => c.id === activeChapterId);
    if (idx > 0) {
      setActiveChapterId(selectedChapters[idx - 1].id);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto py-6 px-3 sm:px-6 lg:px-8">
      {/* Chapter Selection Pill Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block">
              Step 4 · Personalize Selected Chapters
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>{currentChapter.emoji}</span>
              <span>{currentChapter.chapterNumber}. {currentChapter.title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile View Switcher (Only visible on mobile/tablets where 2-column split is stacked) */}
            <div className="flex lg:hidden items-center bg-white p-1 rounded-full border border-[var(--border-subtle)] shadow-xs">
              <button
                type="button"
                onClick={() => setMobileTab("form")}
                className={`px-3 py-1 rounded-full text-xs font-rounded font-bold transition-all cursor-pointer ${
                  mobileTab === "form"
                    ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                    : "text-[var(--text-secondary)] hover:text-black"
                }`}
              >
                ✏️ Edit Form
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={`px-3 py-1 rounded-full text-xs font-rounded font-bold transition-all cursor-pointer ${
                  mobileTab === "preview"
                    ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                    : "text-[var(--text-secondary)] hover:text-black"
                }`}
              >
                👁️ Live Preview
              </button>
            </div>

            <span className="text-xs font-rounded font-bold text-[var(--text-muted)] bg-white px-3 py-1.5 rounded-full border border-[var(--border-subtle)] shadow-2xs">
              {selectedChapters.findIndex((c) => c.id === activeChapterId) + 1} of{" "}
              {selectedChapters.length} active
            </span>
          </div>
        </div>

        {/* Scrollable Chapter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {selectedChapters.map((ch) => {
            const isActive = ch.id === activeChapterId;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-rounded font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                    : "bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-pink-300"
                }`}
              >
                <span>{ch.emoji}</span>
                <span>{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Split: Left = Customization Form, Right = Respective Chapter Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Customization Window */}
        <div className={`lg:col-span-6 xl:col-span-6 ${mobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          <div className="bg-white/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-5 sm:p-8 shadow-xl relative min-h-[500px]">
        {/* ==================== CHAPTER 1: WELCOME SURPRISE ==================== */}
        {activeChapterId === "welcome" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Welcome Surprise Settings
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                Configure the grand opening card and 4 floating hero polaroids your partner sees when they first unwrap their world.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={config.welcome.heading}
                  onChange={(e) =>
                    onChange({
                      welcome: { ...config.welcome, heading: e.target.value },
                    })
                  }
                  placeholder="Dear, Us"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Eyebrow Badge Label
                </label>
                <input
                  type="text"
                  value={config.welcome.eyebrowLabel}
                  onChange={(e) =>
                    onChange({
                      welcome: { ...config.welcome, eyebrowLabel: e.target.value },
                    })
                  }
                  placeholder="A LITTLE WORLD, JUST FOR YOU"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Dedication Nickname
                </label>
                <input
                  type="text"
                  value={config.recipientNickname}
                  onChange={(e) =>
                    onChange({
                      recipientNickname: e.target.value,
                    })
                  }
                  placeholder="e.g. Baby, My Love"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] font-rounded">
                  Shown as &ldquo;🌸 For my sweetest {config.recipientNickname || "Baby"} ♡&rdquo;
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.welcome.buttonText}
                  onChange={(e) =>
                    onChange({
                      welcome: { ...config.welcome, buttonText: e.target.value },
                    })
                  }
                  placeholder="Come inside, my love ♡"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Supporting Subtitle
              </label>
              <textarea
                rows={2}
                value={config.welcome.subtitle || config.welcome.message}
                onChange={(e) =>
                  onChange({
                    welcome: { ...config.welcome, subtitle: e.target.value, message: e.target.value },
                  })
                }
                placeholder="A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words."
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Romantic Quote
              </label>
              <input
                type="text"
                value={config.welcome.quote}
                onChange={(e) =>
                  onChange({
                    welcome: { ...config.welcome, quote: e.target.value },
                  })
                }
                placeholder="Of all the stories life could give me, you're the one I'd choose to keep living."
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] font-serif italic"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Handwritten Note Underneath Title
              </label>
              <input
                type="text"
                value={config.welcome.handwrittenNote || ""}
                onChange={(e) =>
                  onChange({
                    welcome: { ...config.welcome, handwrittenNote: e.target.value },
                  })
                }
                placeholder="If I could put everything I feel into one place, it would look a little like this."
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-handwritten text-[var(--pink-strong)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
              />
            </div>

            {/* 4 Floating Hero Polaroids (Photo 1 to Photo 4) */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded flex items-center gap-1.5">
                    <span>📷</span>
                    <span>4 Corner Hero Polaroids (Photo 1 to Photo 4)</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                    These 4 photographs and captions float in the four corners around your welcome message.
                  </p>
                </div>
                <span className="text-[10px] text-[var(--pink-strong)] font-semibold font-rounded bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  Visible on Live Preview ➔
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { index: 0, tag: "Photo 1", pos: "Top-Left", defaultCap: "A moment I'd choose all over again." },
                  { index: 1, tag: "Photo 2", pos: "Top-Right", defaultCap: "Somehow, my heart always finds its way back to you." },
                  { index: 2, tag: "Photo 3", pos: "Bottom-Left", defaultCap: "The world feels softer when I share it with you." },
                  { index: 3, tag: "Photo 4", pos: "Bottom-Right", defaultCap: "My favorite person, in a thousand little ways." },
                ].map((pol) => {
                  const currentPolaroids = config.welcome.polaroids || [
                    { id: "p1", src: "", caption: "A moment I'd choose all over again." },
                    { id: "p2", src: "", caption: "Somehow, my heart always finds its way back to you." },
                    { id: "p3", src: "", caption: "The world feels softer when I share it with you." },
                    { id: "p4", src: "", caption: "My favorite person, in a thousand little ways." },
                  ];
                  const item = currentPolaroids[pol.index] || { id: `p${pol.index + 1}`, src: "", caption: pol.defaultCap };

                  const updatePolaroid = (updates: Partial<{ src: string; caption: string }>) => {
                    const newArr = [...currentPolaroids];
                    newArr[pol.index] = { ...item, ...updates };
                    onChange({
                      welcome: {
                        ...config.welcome,
                        polaroids: newArr,
                      },
                    });
                  };

                  return (
                    <div
                      key={pol.index}
                      className="p-3.5 rounded-2xl bg-white border border-pink-200 shadow-2xs space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded flex items-center gap-1">
                          <span>📷</span>
                          <span>{pol.tag} · {pol.pos}</span>
                        </span>
                        {item.src && (
                          <button
                            type="button"
                            onClick={() => updatePolaroid({ src: "" })}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer font-rounded"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          onClick={() =>
                            onOpenPhotoLibrary((url) => {
                              updatePolaroid({ src: url });
                            }, `Choose ${pol.tag} (${pol.pos})`)
                          }
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/70 hover:bg-pink-100/70 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 relative group transition-all"
                        >
                          {item.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.src}
                              alt={pol.tag}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-xl">📸</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenPhotoLibrary((url) => {
                                updatePolaroid({ src: url });
                              }, `Choose ${pol.tag} (${pol.pos})`)
                            }
                            className="text-xs font-rounded font-bold text-[var(--pink-strong)] hover:underline cursor-pointer block truncate text-left"
                          >
                            {item.src ? `Change ${pol.tag}` : `Select ${pol.tag}`} 📷
                          </button>
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => updatePolaroid({ caption: e.target.value })}
                            placeholder={pol.defaultCap}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-handwritten text-[var(--romantic-plum)] focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Character Illustration selector */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Center Character Illustration
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { id: "kissingCouple", label: "Cheek Kiss (Dudu & Bubu)", emoji: "😽" },
                  { id: "tenderCouple", label: "Tender Cuddle", emoji: "🧸" },
                  { id: "cozyCouple", label: "Cozy Hug", emoji: "💕" },
                  { id: "huggingCouple", label: "Loving Embrace", emoji: "🥰" },
                ].map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        welcome: { ...config.welcome, selectedIllustration: char.id },
                      })
                    }
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-rounded font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      (config.welcome.selectedIllustration || "kissingCouple") === char.id
                        ? "border-[var(--pink-primary)] bg-[var(--pale-rose)] text-[var(--pink-strong)] ring-2 ring-[var(--pink-primary)]/20 shadow-2xs"
                        : "border-[var(--border-subtle)] bg-white text-[var(--text-secondary)] hover:border-pink-300"
                    }`}
                  >
                    <span>{char.emoji}</span>
                    <span>{char.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 2: THINGS I NOTICED ABOUT YOU ==================== */}
        {activeChapterId === "observations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Things I Noticed About You
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Customize the little habits, category tags, emojis, and sweet quirks displayed on each card.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const id = `obs_custom_${Date.now()}`;
                  onChange({
                    observations: {
                      items: [
                        ...config.observations.items,
                        {
                          id,
                          category: "LITTLE DETAIL",
                          emoji: "✨",
                          title: "A Little Habit of Yours",
                          content: "The sweet way you always focus when you are excited about something.",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer transition-colors"
              >
                + Add a Little Detail
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.observations.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    item.selected
                      ? "border-[var(--pink-primary)]/40 bg-white shadow-xs"
                      : "border-[var(--border-subtle)] bg-gray-50/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.observations.items.map((o) =>
                          o.id === item.id ? { ...o, selected: !o.selected } : o
                        );
                        onChange({ observations: { items: updated } });
                      }}
                      className="flex items-center gap-2 cursor-pointer text-xs font-rounded font-bold text-[var(--text-primary)]"
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                          item.selected ? "bg-[var(--pink-strong)]" : "border border-gray-300"
                        }`}
                      >
                        {item.selected && "✓"}
                      </span>
                      <span>{item.selected ? "Included" : "Excluded"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.observations.items.filter((o) => o.id !== item.id);
                        onChange({ observations: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer p-1"
                      title="Remove card"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={item.category || ""}
                        onChange={(e) => {
                          const updated = config.observations.items.map((o) =>
                            o.id === item.id ? { ...o, category: e.target.value } : o
                          );
                          onChange({ observations: { items: updated } });
                        }}
                        placeholder="01 - THE THINGS YOU DO"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded font-bold text-[var(--pink-strong)] uppercase focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={item.emoji || "✨"}
                        onChange={(e) => {
                          const updated = config.observations.items.map((o) =>
                            o.id === item.id ? { ...o, emoji: e.target.value } : o
                          );
                          onChange({ observations: { items: updated } });
                        }}
                        placeholder="👀"
                        className="w-full text-center px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = config.observations.items.map((o) =>
                          o.id === item.id ? { ...o, title: e.target.value } : o
                        );
                        onChange({ observations: { items: updated } });
                      }}
                      placeholder="Observation title..."
                      className="w-full font-rounded font-bold text-base text-[var(--romantic-plum)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded">
                      Content / Note
                    </label>
                    <textarea
                      rows={2}
                      value={item.content}
                      onChange={(e) => {
                        const updated = config.observations.items.map((o) =>
                          o.id === item.id ? { ...o, content: e.target.value } : o
                        );
                        onChange({ observations: { items: updated } });
                      }}
                      placeholder="The sweet memory or detail..."
                      className="w-full text-xs font-rounded text-[var(--text-secondary)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)] leading-relaxed"
                    />
                  </div>

                  {/* Optional Photo Attachment */}
                  <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPhotoLibrary((url) => {
                          const updated = config.observations.items.map((o) =>
                            o.id === item.id ? { ...o, photo: url } : o
                          );
                          onChange({ observations: { items: updated } });
                        }, `Attach Photo to Observation: ${item.title}`)
                      }
                      className="text-[11px] font-rounded font-semibold text-[var(--pink-strong)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>📷</span>
                      <span>{item.photo ? "Change Photo" : "+ Attach Photo"}</span>
                    </button>
                    {item.photo && (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photo}
                          alt={item.title}
                          className="w-8 h-8 rounded-lg object-cover border border-pink-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.observations.items.map((o) =>
                              o.id === item.id ? { ...o, photo: undefined } : o
                            );
                            onChange({ observations: { items: updated } });
                          }}
                          className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 3: OUR SECRET WORLD ==================== */}
        {activeChapterId === "secretWorld" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Our Secret World</span>
                    <span className="text-base">🔒</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                    A password-protected haven with a secret letter, private photo gallery, and inside jokes revealed only to your partner.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[11px] font-rounded font-bold text-[var(--pink-strong)]">
                  <span>✨ 4-Step Secret Haven</span>
                </div>
              </div>
            </div>

            {/* Step 1: Secret Password & Passcode Hint */}
            <div className="space-y-3 p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 via-rose-50/40 to-pink-50/60 border border-[var(--pink-primary)]/25 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--pink-strong)] text-white text-xs font-bold font-rounded flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                      Secret Passcode & Clue 🔐
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                      Your partner enters this secret word to unlock Chapter 3.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--pink-strong)] font-semibold font-rounded hidden sm:inline">
                  Case-insensitive ♡
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] font-rounded">
                    Secret Word / Passcode
                  </label>
                  <input
                    type="text"
                    value={config.secretWorld.password || ""}
                    onChange={(e) =>
                      onChange({
                        secretWorld: { ...config.secretWorld, password: e.target.value },
                      })
                    }
                    placeholder="e.g. iloveyou, sunshine, ourspecialdate"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white text-sm font-rounded focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] font-mono shadow-2xs"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] font-rounded">
                    The secret phrase your partner will type to unlock.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] font-rounded">
                    Passcode Hint (Sweet Clue)
                  </label>
                  <input
                    type="text"
                    value={config.secretWorld.hint || ""}
                    onChange={(e) =>
                      onChange({
                        secretWorld: { ...config.secretWorld, hint: e.target.value },
                      })
                    }
                    placeholder="e.g. Three words, no spaces, all lowercase..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white text-sm font-rounded focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] shadow-2xs"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] font-rounded">
                    Revealed if your partner taps &ldquo;Need a sweet little hint?&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-[var(--pink-deep)] font-rounded flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-pink-200/60">
                <span>💡</span>
                <span>
                  <strong>Tip:</strong> You can test typing this passcode in the live preview on the right by clicking <strong>&ldquo;Test Locked Door&rdquo;</strong>!
                </span>
              </div>
            </div>

            {/* Step 2: Secret Haven Letter revealed upon unlocking */}
            <div className="space-y-3 p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--pink-strong)] text-white text-xs font-bold font-rounded flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                      Secret Love Letter 💌
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                      Revealed in a warm vintage parchment card directly below the welcome illustration.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      secretWorld: {
                        ...config.secretWorld,
                        secretLetter:
                          "I wanted a place that belonged completely to us. Beyond every busy day, noise, and routine — this is where I keep the moments that make me feel whole. You are my safe harbor, my favorite laugh, and my home.",
                      },
                    })
                  }
                  className="text-[11px] text-[var(--pink-strong)] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>✨</span>
                  <span>Use Romantic Default</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={config.secretWorld.secretLetter ?? ""}
                onChange={(e) =>
                  onChange({
                    secretWorld: { ...config.secretWorld, secretLetter: e.target.value },
                  })
                }
                placeholder="I wanted a place that belonged completely to us. Beyond every busy day, noise, and routine — this is where I keep the moments that make me feel whole. You are my safe harbor, my favorite laugh, and my home..."
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded font-serif italic leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] shadow-2xs"
              />
              <p className="text-[10px] text-[var(--text-muted)] font-rounded">
                If left empty, the romantic default letter shown in the live preview will be used.
              </p>
            </div>

            {/* Step 3: Moments Only We Cherish (Secret Haven Gallery Photos) */}
            <div className="space-y-4 p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--pink-strong)] text-white text-xs font-bold font-rounded flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                      Moments Only We Cherish (Secret Gallery Photos) 📸
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                      Private photos displayed as interactive gallery cards in the unlocked haven.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        secretWorld: {
                          ...config.secretWorld,
                          secretPhotos: [
                            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
                            "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
                          ],
                        },
                      });
                    }}
                    className="text-[11px] text-[var(--pink-strong)] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>✨</span>
                    <span>Load Demo Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const current = [...(config.secretWorld.secretPhotos || [])];
                      if (current.length < 6) {
                        current.push("");
                        onChange({
                          secretWorld: { ...config.secretWorld, secretPhotos: current },
                        });
                      }
                    }}
                    disabled={(config.secretWorld.secretPhotos?.length || 0) >= 6}
                    className="px-3 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-[var(--pink-strong)] text-xs font-bold font-rounded transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    + Add Photo Slot
                  </button>
                </div>
              </div>

              {/* Visual Guidance Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200/70 text-xs font-rounded flex items-start gap-2.5">
                <span className="text-base mt-0.5">👁️</span>
                <div className="flex-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--pink-strong)]">How photos appear: </strong>
                  Each photo slot below directly matches the <span className="font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded border border-rose-200">Photo 1</span> and <span className="font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded border border-rose-200">Photo 2</span> cards in the live preview on the right. When your partner clicks any photo, it opens in a full-screen romantic lightbox!
                </div>
              </div>

              {/* Photo Slots Grid */}
              {(() => {
                const photos = config.secretWorld.secretPhotos || [];
                const totalSlots = Math.max(photos.length, 2);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: totalSlots }).map((_, pIdx) => {
                      const currentPhoto = photos[pIdx];
                      const photoNum = pIdx + 1;

                      return (
                        <div
                          key={pIdx}
                          className="p-3.5 rounded-2xl border-2 border-pink-200/80 bg-gradient-to-b from-white to-pink-50/30 space-y-2.5 shadow-2xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold font-rounded shadow-2xs">
                                Photo {photoNum}
                              </span>
                              <span className="text-[11px] font-bold text-[var(--text-primary)] font-rounded">
                                Secret Gallery Slot #{photoNum}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {currentPhoto && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = [...(config.secretWorld.secretPhotos || [])];
                                    current[pIdx] = "";
                                    onChange({
                                      secretWorld: { ...config.secretWorld, secretPhotos: current },
                                    });
                                  }}
                                  title={`Remove Photo ${photoNum}`}
                                  className="text-[11px] text-gray-400 hover:text-rose-500 px-1 cursor-pointer font-rounded"
                                >
                                  Clear
                                </button>
                              )}
                              {pIdx >= 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = [...(config.secretWorld.secretPhotos || [])];
                                    current.splice(pIdx, 1);
                                    onChange({
                                      secretWorld: { ...config.secretWorld, secretPhotos: current },
                                    });
                                  }}
                                  title="Delete this extra photo slot"
                                  className="text-gray-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>

                          <div
                            onClick={() =>
                              onOpenPhotoLibrary((url) => {
                                const current = [...(config.secretWorld.secretPhotos || [])];
                                current[pIdx] = url;
                                onChange({
                                  secretWorld: { ...config.secretWorld, secretPhotos: current },
                                });
                              }, `Choose Photo ${photoNum} (Secret Haven Gallery)`)
                            }
                            className="aspect-[4/3] rounded-xl border-2 border-dashed border-pink-300 bg-white hover:bg-pink-50/60 flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all shadow-inner"
                          >
                            {currentPhoto ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={currentPhoto}
                                  alt={`Secret Photo ${photoNum}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-rounded font-bold gap-1.5">
                                  <span>📷</span>
                                  <span>Change Photo {photoNum}</span>
                                </div>
                                <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                                  Photo {photoNum} • In Haven
                                </span>
                              </>
                            ) : (
                              <div className="text-center p-3 text-xs font-rounded text-[var(--pink-strong)] space-y-1.5">
                                <span className="text-2xl block animate-bounce">📷</span>
                                <span className="font-bold block text-sm">
                                  Click to Select Photo {photoNum}
                                </span>
                                <span className="text-[10px] text-gray-400 block max-w-[180px] mx-auto">
                                  Choose from library or upload. Will display as Photo {photoNum} in live preview.
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-[var(--text-muted)] font-rounded flex items-center justify-between">
                            <span>
                              {currentPhoto ? "✓ Photo set & live in preview" : "Waiting for photo selection"}
                            </span>
                            <span className="text-[var(--pink-strong)] font-semibold">
                              Aspect: 4:3
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Step 4: Inside Jokes & Private Traditions */}
            <div className="space-y-4 p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--pink-strong)] text-white text-xs font-bold font-rounded flex items-center justify-center shadow-xs">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                      Inside Jokes & Private Traditions 🤫
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                      Displayed as cute secret keepsake notes inside your unlocked haven.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {config.secretWorld.insideJokes.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          secretWorld: {
                            ...config.secretWorld,
                            insideJokes: [
                              {
                                id: "joke_1",
                                title: "The Midnight Snack Debacle",
                                explanation: "When we tried to bake cookies at 2 AM and ended up laughing on the kitchen floor.",
                              },
                              {
                                id: "joke_2",
                                title: "Our 5-Minute Warning",
                                explanation: "That always mysteriously turns into 45 more minutes of talking in the car.",
                              },
                            ],
                          },
                        });
                      }}
                      className="text-[11px] text-[var(--pink-strong)] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>✨</span>
                      <span>Load Example Jokes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const id = `joke_${Date.now()}`;
                      onChange({
                        secretWorld: {
                          ...config.secretWorld,
                          insideJokes: [
                            ...config.secretWorld.insideJokes,
                            {
                              id,
                              title: "Our Secret Joke",
                              explanation: "Only the two of us will ever understand why this is funny.",
                            },
                          ],
                        },
                      });
                    }}
                    className="px-3 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-[var(--pink-strong)] text-xs font-bold font-rounded transition-colors cursor-pointer"
                  >
                    + Add a Little Secret
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.secretWorld.insideJokes.map((joke) => (
                  <div
                    key={joke.id}
                    className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-pink-50/30 hover:bg-white transition-all space-y-2 relative shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          secretWorld: {
                            ...config.secretWorld,
                            insideJokes: config.secretWorld.insideJokes.filter((j) => j.id !== joke.id),
                          },
                        });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 cursor-pointer text-xs"
                      title="Remove inside joke"
                    >
                      ✕
                    </button>
                    <div className="pr-6">
                      <input
                        type="text"
                        value={joke.title}
                        onChange={(e) => {
                          const updated = config.secretWorld.insideJokes.map((j) =>
                            j.id === joke.id ? { ...j, title: e.target.value } : j
                          );
                          onChange({ secretWorld: { ...config.secretWorld, insideJokes: updated } });
                        }}
                        placeholder="Title of inside joke..."
                        className="w-full font-serif font-bold text-sm text-[var(--text-primary)] focus:outline-none border-b border-transparent focus:border-[var(--pink-strong)] pb-1"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={joke.explanation}
                      onChange={(e) => {
                        const updated = config.secretWorld.insideJokes.map((j) =>
                          j.id === joke.id ? { ...j, explanation: e.target.value } : j
                        );
                        onChange({ secretWorld: { ...config.secretWorld, insideJokes: updated } });
                      }}
                      placeholder="The story behind it..."
                      className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 4: MEMORIES ==================== */}
        {activeChapterId === "memories" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Memories &amp; Photo Collage
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                Choose how your memories collage is presented (Heart Collage or Polaroid Frame), customize its photos, and write your scrapbook stories.
              </p>
            </div>

            {/* Collage Style Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Memory Collage Presentation Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      memories: {
                        ...config.memories,
                        collageType: "heart",
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                    (config.memories.collageType || "heart") === "heart"
                      ? "border-[var(--pink-strong)] bg-gradient-to-br from-pink-50 to-rose-50/60 shadow-sm ring-2 ring-pink-300/40"
                      : "border-[var(--border-subtle)] bg-white hover:border-pink-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-rounded font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>❤️</span>
                      <span>Heart Photo Collage</span>
                    </span>
                    {(config.memories.collageType || "heart") === "heart" && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-rounded">
                    Sculpted mosaic of 29 romantic prints with a prominent couple centerpiece photo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      memories: {
                        ...config.memories,
                        collageType: "polaroid",
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                    config.memories.collageType === "polaroid"
                      ? "border-[var(--pink-strong)] bg-gradient-to-br from-purple-50 to-pink-50/60 shadow-sm ring-2 ring-pink-300/40"
                      : "border-[var(--border-subtle)] bg-white hover:border-pink-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-rounded font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>📷</span>
                      <span>Polaroid Frame Collage</span>
                    </span>
                    {config.memories.collageType === "polaroid" && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-rounded">
                    Heart-shaped cutout revealing your main couple photo, framed by dense polaroid prints.
                  </p>
                </button>
              </div>
            </div>

            {/* Conditional Collage Customization: Heart Collage */}
            {(config.memories.collageType || "heart") === "heart" && (
              <div className="p-4 sm:p-5 rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/70 via-rose-50/30 to-pink-50/70 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-pink-200/70 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded flex items-center gap-1.5">
                      <span>❤️</span>
                      <span>Heart Collage Photo Inputs</span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                      Configure the grand center photo (&quot;Our Center ♡&quot;) and surrounding heart mosaic photos.
                    </p>
                  </div>
                  <span className="text-[10px] text-pink-700 bg-pink-100 font-bold px-2 py-0.5 rounded-full border border-pink-200 self-start sm:self-auto">
                    Live Synced ➔
                  </span>
                </div>

                {/* Center Hero Photo */}
                <div className="p-3.5 rounded-2xl bg-white border border-pink-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                        Photo 1 · Centerpiece
                      </span>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                        Our Center ♡ (Hero Photo)
                      </label>
                    </div>
                    {config.memories.heartCollage?.centerHeroPhoto && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            memories: {
                              ...config.memories,
                              heartCollage: {
                                ...config.memories.heartCollage,
                                centerHeroPhoto: undefined,
                              },
                            },
                          })
                        }
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer font-rounded"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                    The large 3x4 portrait photograph placed right at the heart&apos;s focal center.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div
                      onClick={() =>
                        onOpenPhotoLibrary((url) => {
                          onChange({
                            memories: {
                              ...config.memories,
                              heartCollage: {
                                ...config.memories.heartCollage,
                                centerHeroPhoto: url,
                              },
                            },
                          });
                        }, "Choose Our Center ♡ Photo")
                      }
                      className="w-16 h-20 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/70 hover:bg-pink-100/70 flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all shrink-0"
                    >
                      {config.memories.heartCollage?.centerHeroPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={config.memories.heartCollage.centerHeroPhoto}
                          alt="Center Hero Photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-xl">📸</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            onChange({
                              memories: {
                                ...config.memories,
                                heartCollage: {
                                  ...config.memories.heartCollage,
                                  centerHeroPhoto: url,
                                },
                              },
                            });
                          }, "Choose Our Center ♡ Photo")
                        }
                        className="text-xs font-rounded font-bold text-[var(--pink-strong)] hover:underline cursor-pointer block text-left"
                      >
                        {config.memories.heartCollage?.centerHeroPhoto ? "Change Center Photo 📷" : "Select Center Photo 📷"}
                      </button>

                      <input
                        type="text"
                        value={config.memories.heartCollage?.centerHeroCaption ?? "The center of my universe ♡"}
                        onChange={(e) =>
                          onChange({
                            memories: {
                              ...config.memories,
                              heartCollage: {
                                ...config.memories.heartCollage,
                                centerHeroCaption: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="The center of my universe ♡"
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Heart Mosaic Photos */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                        Heart Mosaic Photos ({(config.memories.heartCollage?.photos || []).length} added)
                      </label>
                      <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                        These photos fill the surrounding tiles forming the sculpted heart shape.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const memPhotos = config.memories.items
                            .flatMap((m) => m.photos || [])
                            .filter(Boolean);
                          if (memPhotos.length === 0) return;
                          const existing = config.memories.heartCollage?.photos || [];
                          const merged = Array.from(new Set([...existing, ...memPhotos]));
                          onChange({
                            memories: {
                              ...config.memories,
                              heartCollage: {
                                ...config.memories.heartCollage,
                                photos: merged,
                              },
                            },
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-white border border-pink-200 text-[10px] text-[var(--pink-strong)] font-rounded font-bold hover:bg-pink-50 cursor-pointer shadow-2xs"
                        title="Import all photos already uploaded to memory cards"
                      >
                        ✨ Fill from Scrapbook
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            const cur = config.memories.heartCollage?.photos || [];
                            onChange({
                              memories: {
                                ...config.memories,
                                heartCollage: {
                                  ...config.memories.heartCollage,
                                  photos: [...cur, url],
                                },
                              },
                            });
                          }, "Add Photo to Heart Mosaic")
                        }
                        className="px-3 py-1.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-rounded font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>📷</span>
                        <span>+ Add Photo</span>
                      </button>
                    </div>
                  </div>

                  {(config.memories.heartCollage?.photos || []).length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                      {(config.memories.heartCollage?.photos || []).map((url, pIdx) => (
                        <div
                          key={pIdx}
                          className="rounded-xl border border-pink-200 overflow-hidden relative group bg-white shadow-2xs aspect-square"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Heart tile ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded shadow">
                            H{pIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = (config.memories.heartCollage?.photos || []).filter((_, i) => i !== pIdx);
                              onChange({
                                memories: {
                                  ...config.memories,
                                  heartCollage: {
                                    ...config.memories.heartCollage,
                                    photos: next,
                                  },
                                },
                              });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic font-rounded bg-white/70 p-2.5 rounded-xl border border-dashed border-pink-200 text-center">
                      Currently using romantic defaults. Click <strong>+ Add Photo</strong> or <strong>✨ Fill from Scrapbook</strong> to populate with your own memories ♡
                    </p>
                  )}
                </div>

                {/* Bottom Ribbon Caption */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                    Heart Bottom Ribbon Caption
                  </label>
                  <input
                    type="text"
                    value={config.memories.heartCollage?.caption ?? "You & Me, Always & Forever ♡"}
                    onChange={(e) =>
                      onChange({
                        memories: {
                          ...config.memories,
                          heartCollage: {
                            ...config.memories.heartCollage,
                            caption: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="You & Me, Always & Forever ♡"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-white text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
                  />
                </div>
              </div>
            )}

            {/* Conditional Collage Customization: Polaroid Frame Collage */}
            {config.memories.collageType === "polaroid" && (
              <div className="p-4 sm:p-5 rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/60 via-pink-50/30 to-purple-50/60 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-purple-200/70 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 font-rounded flex items-center gap-1.5">
                      <span>📷</span>
                      <span>Polaroid Frame Collage Photo Slots</span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                      Configure the central heart cutout photo and surrounding polaroid prints.
                    </p>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-100 font-bold px-2 py-0.5 rounded-full border border-purple-200 self-start sm:self-auto">
                    Live Synced ➔
                  </span>
                </div>

                {/* Central Heart Cutout Photo */}
                <div className="p-3.5 rounded-2xl bg-white border border-purple-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold font-rounded">
                        Central Cutout Photo
                      </span>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                        Main Heart Couple Photograph
                      </label>
                    </div>
                    {config.memories.polaroidCollage?.centralHeartPhoto && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            memories: {
                              ...config.memories,
                              polaroidCollage: {
                                ...config.memories.polaroidCollage,
                                centralHeartPhoto: undefined,
                              },
                            },
                          })
                        }
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer font-rounded"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                    Visible right inside the organic heart cutout in the center of the frame.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div
                      onClick={() =>
                        onOpenPhotoLibrary((url) => {
                          onChange({
                            memories: {
                              ...config.memories,
                              polaroidCollage: {
                                ...config.memories.polaroidCollage,
                                centralHeartPhoto: url,
                              },
                            },
                          });
                        }, "Choose Central Heart Photo")
                      }
                      className="w-16 h-20 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all shrink-0"
                    >
                      {config.memories.polaroidCollage?.centralHeartPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={config.memories.polaroidCollage.centralHeartPhoto}
                          alt="Central Heart Photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-xl">📸</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            onChange({
                              memories: {
                                ...config.memories,
                                polaroidCollage: {
                                  ...config.memories.polaroidCollage,
                                  centralHeartPhoto: url,
                                },
                              },
                            });
                          }, "Choose Central Heart Photo")
                        }
                        className="text-xs font-rounded font-bold text-purple-700 hover:underline cursor-pointer block text-left"
                      >
                        {config.memories.polaroidCollage?.centralHeartPhoto ? "Change Central Photo 📷" : "Select Central Photo 📷"}
                      </button>

                      <input
                        type="text"
                        value={config.memories.polaroidCollage?.centralCaption ?? "You & Me, Always & Forever ♡"}
                        onChange={(e) =>
                          onChange({
                            memories: {
                              ...config.memories,
                              polaroidCollage: {
                                ...config.memories.polaroidCollage,
                                centralCaption: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="You & Me, Always & Forever ♡"
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Border Polaroid Prints */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                        Border Polaroid Prints ({(config.memories.polaroidCollage?.borderPhotos || []).length} added)
                      </label>
                      <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                        These photos wrap around the outside of the heart frame.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const memPhotos = config.memories.items
                            .flatMap((m) => m.photos || [])
                            .filter(Boolean);
                          if (memPhotos.length === 0) return;
                          const existing = config.memories.polaroidCollage?.borderPhotos || [];
                          const merged = Array.from(new Set([...existing, ...memPhotos]));
                          onChange({
                            memories: {
                              ...config.memories,
                              polaroidCollage: {
                                ...config.memories.polaroidCollage,
                                borderPhotos: merged,
                              },
                            },
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-white border border-purple-200 text-[10px] text-purple-700 font-rounded font-bold hover:bg-purple-50 cursor-pointer shadow-2xs"
                        title="Import all photos already uploaded to memory cards"
                      >
                        ✨ Fill from Scrapbook
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            const cur = config.memories.polaroidCollage?.borderPhotos || [];
                            onChange({
                              memories: {
                                ...config.memories,
                                polaroidCollage: {
                                  ...config.memories.polaroidCollage,
                                  borderPhotos: [...cur, url],
                                },
                              },
                            });
                          }, "Add Border Polaroid")
                        }
                        className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-rounded font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>📷</span>
                        <span>+ Add Polaroid</span>
                      </button>
                    </div>
                  </div>

                  {(config.memories.polaroidCollage?.borderPhotos || []).length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                      {(config.memories.polaroidCollage?.borderPhotos || []).map((url, pIdx) => (
                        <div
                          key={pIdx}
                          className="rounded-xl border border-purple-200 overflow-hidden relative group bg-white shadow-2xs aspect-square"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Border polaroid ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded shadow">
                            P{pIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = (config.memories.polaroidCollage?.borderPhotos || []).filter((_, i) => i !== pIdx);
                              onChange({
                                memories: {
                                  ...config.memories,
                                  polaroidCollage: {
                                    ...config.memories.polaroidCollage,
                                    borderPhotos: next,
                                  },
                                },
                              });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic font-rounded bg-white/70 p-2.5 rounded-xl border border-dashed border-purple-200 text-center">
                      Currently using romantic defaults. Click <strong>+ Add Polaroid</strong> or <strong>✨ Fill from Scrapbook</strong> to add custom border photos ♡
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Scrapbook Stories Header */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
              <div>
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  Scrapbook Memory Stories
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-0.5">
                  Individual memory cards with story text, dates, and locations displayed below the collage.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `mem_custom_${Date.now()}`;
                  onChange({
                    memories: {
                      ...config.memories,
                      items: [
                        ...config.memories.items,
                        {
                          id,
                          title: "A Beautiful Day Together",
                          description: "I remember looking at you and thinking how lucky I am.",
                          date: "2024-05-12",
                          location: "Our favorite spot",
                          photos: [],
                          category: "romantic",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer transition-colors"
              >
                + Add a Memory Card
              </button>
            </div>

            <div className="space-y-4">
              {config.memories.items.map((mem, idx) => (
                <div
                  key={mem.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    mem.selected ? "bg-white border-[var(--border-subtle)] shadow-xs" : "bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                        Photo {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.memories.items.map((m) =>
                            m.id === mem.id ? { ...m, selected: !m.selected } : m
                          );
                          onChange({ memories: { ...config.memories, items: updated } });
                        }}
                        className="text-xs font-rounded font-bold text-[var(--pink-strong)] cursor-pointer"
                      >
                        {mem.selected ? "✓ Included in Scrapbook" : "○ Excluded"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.memories.items.filter((m) => m.id !== mem.id);
                        onChange({ memories: { ...config.memories, items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                        Input for Photo {idx + 1}
                      </label>
                      <div
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            const updated = config.memories.items.map((m) =>
                              m.id === mem.id ? { ...m, photos: [url] } : m
                            );
                            onChange({ memories: { ...config.memories, items: updated } });
                          }, `Choose Input for Photo ${idx + 1} (${mem.title})`)
                        }
                        className="aspect-[4/3] rounded-xl border-2 border-dashed border-pink-300 bg-[var(--soft-pink)]/40 hover:bg-[var(--soft-pink)] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all"
                      >
                        {mem.photos && mem.photos.length > 0 ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mem.photos[0]}
                              alt={`Photo ${idx + 1} - ${mem.title}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-rounded font-bold">
                              Change Photo {idx + 1} 📷
                            </div>
                            <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              Photo {idx + 1}
                            </span>
                          </>
                        ) : (
                          <div className="text-center p-2 text-xs font-rounded text-[var(--pink-strong)] space-y-1">
                            <span className="text-xl block">📸</span>
                            <span className="font-bold block">Input for Photo {idx + 1}</span>
                            <span className="text-[10px] text-gray-500 block">Click to select photo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <input
                        type="text"
                        value={mem.title}
                        onChange={(e) => {
                          const updated = config.memories.items.map((m) =>
                            m.id === mem.id ? { ...m, title: e.target.value } : m
                          );
                          onChange({ memories: { ...config.memories, items: updated } });
                        }}
                        placeholder="Memory title..."
                        className="w-full font-serif font-bold text-lg text-[var(--text-primary)] focus:outline-none border-b border-transparent focus:border-[var(--pink-strong)]"
                      />

                      <textarea
                        rows={3}
                        value={mem.description}
                        onChange={(e) => {
                          const updated = config.memories.items.map((m) =>
                            m.id === mem.id ? { ...m, description: e.target.value } : m
                          );
                          onChange({ memories: { ...config.memories, items: updated } });
                        }}
                        placeholder="What happened and what made it special..."
                        className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none p-1 rounded-lg border border-transparent hover:border-gray-200"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={mem.date || ""}
                            onChange={(e) => {
                              const updated = config.memories.items.map((m) =>
                                m.id === mem.id ? { ...m, date: e.target.value } : m
                              );
                              onChange({ memories: { ...config.memories, items: updated } });
                            }}
                            placeholder="Date (e.g. Summer 2024)"
                            className="w-full pl-2 pr-7 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] focus:outline-none focus:border-[var(--pink-strong)]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                              if (input) {
                                if (typeof input.showPicker === "function") {
                                  input.showPicker();
                                } else {
                                  input.click();
                                }
                              }
                            }}
                            title="Pick date from calendar"
                            className="absolute right-1 text-gray-400 hover:text-[var(--pink-strong)] p-1 rounded cursor-pointer transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                              type="date"
                              tabIndex={-1}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const [y, m, d] = e.target.value.split("-").map(Number);
                                const dateObj = new Date(y, m - 1, d);
                                const formatted = dateObj.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                });
                                const updated = config.memories.items.map((mItem) =>
                                  mItem.id === mem.id ? { ...mItem, date: formatted } : mItem
                                );
                                onChange({ memories: { ...config.memories, items: updated } });
                              }}
                            />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={mem.location || ""}
                          onChange={(e) => {
                            const updated = config.memories.items.map((m) =>
                              m.id === mem.id ? { ...m, location: e.target.value } : m
                            );
                            onChange({ memories: { ...config.memories, items: updated } });
                          }}
                          placeholder="Location (e.g. The beach)"
                          className="px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] focus:outline-none focus:border-[var(--pink-strong)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 5: OUR SONG ==================== */}
        {activeChapterId === "ourSong" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Our Song
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                Configure your meaningful couple song and why it holds a place in your hearts.
              </p>
            </div>

            {/* 1. Section Heading & Subtitle (Displayed at the top of the Song screen) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-4 shadow-2xs">
              <div className="border-b border-[var(--border-subtle)] pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded flex items-center gap-1.5">
                  <span>🎵</span>
                  <span>Section Heading & Subtitle</span>
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                  Displayed at the very top of the song screen.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={config.ourSong.heading ?? "Our Song"}
                    onChange={(e) =>
                      onChange({
                        ourSong: { ...config.ourSong, heading: e.target.value },
                      })
                    }
                    placeholder="e.g. Our Song"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={
                      config.ourSong.subtitle ??
                      "Some songs play in the background. This one brings you right back to me."
                    }
                    onChange={(e) =>
                      onChange({
                        ourSong: { ...config.ourSong, subtitle: e.target.value },
                      })
                    }
                    placeholder="Subtitle displayed below the heading..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Song Details (Song Title & Artist Name) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Song Title
                </label>
                <input
                  type="text"
                  value={config.ourSong.title}
                  onChange={(e) =>
                    onChange({
                      ourSong: { ...config.ourSong, title: e.target.value },
                    })
                  }
                  placeholder="e.g. Golden Hour, Until I Found You"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={config.ourSong.artist}
                  onChange={(e) =>
                    onChange({
                      ourSong: { ...config.ourSong, artist: e.target.value },
                    })
                  }
                  placeholder="e.g. JVKE, Stephen Sanchez"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                />
              </div>
            </div>

            {/* 3. Personal Dedication (Displayed in the dedication card) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-4 shadow-2xs">
              <div className="border-b border-[var(--border-subtle)] pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded flex items-center gap-1.5">
                  <span>💌</span>
                  <span>Personal Dedication Card</span>
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                  Displayed in the dedicated card right below the song title and artist.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Dedication Card Heading
                </label>
                <input
                  type="text"
                  value={config.ourSong.dedicationHeading ?? "A little dedication to you"}
                  onChange={(e) =>
                    onChange({
                      ourSong: { ...config.ourSong, dedicationHeading: e.target.value },
                    })
                  }
                  placeholder="e.g. A little dedication to you"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Personal Dedication Message
                </label>
                <textarea
                  rows={3}
                  value={config.ourSong.dedication}
                  onChange={(e) =>
                    onChange({
                      ourSong: { ...config.ourSong, dedication: e.target.value },
                    })
                  }
                  placeholder="e.g. Dedicated to my favorite person in the whole wide world..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded focus:outline-none focus:border-[var(--pink-strong)]"
                />
              </div>
            </div>

            {/* 4. Why This Song Matters (Displayed as the romantic quote below the dedication card) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Why This Song Matters (Quote)
              </label>
              <textarea
                rows={3}
                value={config.ourSong.whyItMatters}
                onChange={(e) =>
                  onChange({
                    ourSong: { ...config.ourSong, whyItMatters: e.target.value },
                  })
                }
                placeholder="Every time this song plays, I remember the night we drove along the coast..."
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded italic focus:outline-none focus:border-[var(--pink-strong)]"
              />
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 6: OPEN WHEN ==================== */}
        {activeChapterId === "openWhenLetters" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Open When Envelopes
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Sealed comfort envelopes for different moods and emotional milestones.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `open_custom_${Date.now()}`;
                  onChange({
                    openWhen: {
                      items: [
                        ...config.openWhen.items,
                        {
                          id,
                          title: "Open When You Need Reassurance",
                          emoji: "💌",
                          content: "I believe in you with every fiber of my being. You are capable, brilliant, and never alone.",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer transition-colors"
              >
                + Add Custom Envelope
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.openWhen.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.selected ? "bg-white border-[var(--border-subtle)] shadow-xs" : "bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, selected: !o.selected } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      className="text-xs font-rounded font-bold text-[var(--pink-strong)] cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{item.selected ? "✓ Active" : "○ Skipped"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.openWhen.items.filter((o) => o.id !== item.id);
                        onChange({ openWhen: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <input
                      type="text"
                      value={item.emoji || "💌"}
                      onChange={(e) => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, emoji: e.target.value } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      placeholder="💌"
                      className="w-10 text-center px-1.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-base focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, title: e.target.value } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      placeholder="e.g. Open When You Miss Me"
                      className="flex-1 font-serif font-bold text-sm text-[var(--text-primary)] focus:outline-none px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  {/* Letter Subtitle / Heading */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={item.heading || ""}
                      onChange={(e) => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, heading: e.target.value } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      placeholder="Letter subtitle (e.g. A quiet lullaby for a wandering mind)"
                      className="w-full text-xs font-handwritten text-[var(--pink-strong)] focus:outline-none px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  {/* Message Body */}
                  <div className="mb-2">
                    <textarea
                      rows={3}
                      value={item.content}
                      onChange={(e) => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, content: e.target.value } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      placeholder="The heartfelt message inside the envelope..."
                      className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  {/* Sign-off / Signature */}
                  <div className="mb-2.5">
                    <input
                      type="text"
                      value={item.signature || ""}
                      onChange={(e) => {
                        const updated = config.openWhen.items.map((o) =>
                          o.id === item.id ? { ...o, signature: e.target.value } : o
                        );
                        onChange({ openWhen: { items: updated } });
                      }}
                      placeholder="Sign-off (e.g. Sleep peacefully, my favorite person. ♡)"
                      className="w-full text-xs font-serif italic text-[var(--text-muted)] focus:outline-none px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  {/* Cute Companion / Illustration Selector */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded flex items-center gap-1">
                        <span>🐾</span>
                        <span>Companion Character / Sticker</span>
                      </label>
                      {item.photo && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.openWhen.items.map((o) =>
                              o.id === item.id ? { ...o, photo: undefined } : o
                            );
                            onChange({ openWhen: { items: updated } });
                          }}
                          className="text-[10px] text-rose-500 hover:underline cursor-pointer font-rounded"
                        >
                          Reset to Character
                        </button>
                      )}
                    </div>

                    {item.photo ? (
                      <div className="flex items-center gap-2 p-1.5 bg-pink-50 rounded-xl border border-pink-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.photo} alt="Custom sticker" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-[11px] font-rounded text-[var(--pink-strong)] font-semibold truncate flex-1">
                          Custom sticker/photo active
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPhotoLibrary((url) => {
                              const updated = config.openWhen.items.map((o) =>
                                o.id === item.id ? { ...o, photo: url } : o
                              );
                              onChange({ openWhen: { items: updated } });
                            }, `Choose sticker for "${item.title}"`)
                          }
                          className="text-[10px] text-[var(--pink-strong)] font-bold underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: "tenderCouple", label: "Forehead Kiss", img: "/images/534-5341290_heart-pink-png.png" },
                          { id: "kissingCouple", label: "Cheek Kiss", img: "/images/528-5288220_kawaii-tumblr-png.png" },
                          { id: "cozyCouple", label: "Snuggle", img: "/images/506-5064307_cute-cats-png.png" },
                          { id: "huggingCouple", label: "Joyful Hug", img: "/images/519-5196830_cute-cat-png.png" },
                        ].map((char) => {
                          const isSelected = (item.character || "tenderCouple") === char.id;
                          return (
                            <button
                              key={char.id}
                              type="button"
                              onClick={() => {
                                const updated = config.openWhen.items.map((o) =>
                                  o.id === item.id ? { ...o, character: char.id as CharacterIdentifier, photo: undefined } : o
                                );
                                onChange({ openWhen: { items: updated } });
                              }}
                              className={`p-1 px-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-pink-100/90 border-[var(--pink-strong)] ring-1 ring-[var(--pink-strong)] shadow-2xs"
                                  : "bg-white border-gray-200 hover:border-pink-300"
                              }`}
                              title={char.label}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={char.img} alt={char.label} className="w-5 h-5 object-contain" />
                              <span className="text-[10px] font-rounded font-semibold text-gray-700 whitespace-nowrap">
                                {char.label}
                              </span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPhotoLibrary((url) => {
                              const updated = config.openWhen.items.map((o) =>
                                o.id === item.id ? { ...o, photo: url } : o
                              );
                              onChange({ openWhen: { items: updated } });
                            }, `Choose sticker for "${item.title}"`)
                          }
                          className="p-1 px-2 rounded-xl border border-dashed border-pink-300 bg-white hover:bg-[var(--pale-rose)] text-[10px] text-[var(--pink-strong)] font-rounded font-semibold cursor-pointer whitespace-nowrap transition-colors"
                          title="Pick a custom sticker or photo"
                        >
                          + Photo 📷
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 7: DELULU MODE ==================== */}
        {activeChapterId === "deluluMode" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Delulu Mode Scenarios
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Cute imaginary situations and playful couple fantasies with interactive choices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `delulu_${Date.now()}`;
                  onChange({
                    delulu: {
                      items: [
                        ...config.delulu.items,
                        {
                          id,
                          title: "Our Movie-Style Encounter",
                          situation: "If we met in a romantic comedy at an airport, what would happen?",
                          options: [
                            { id: "o1", text: "Accidentally swap identical coffees", response: "And end up talking for 3 hours! ☕" },
                            { id: "o2", text: "Lock eyes across the crowded terminal", response: "Classic Hollywood romance moment! ✨" },
                            { id: "o3", text: "Run to catch the same taxi cab", response: "Silly arguing turning into a coffee date! 🚕" },
                          ],
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Create Custom Scenario
              </button>
            </div>

            <div className="space-y-4">
              {config.delulu.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    item.selected ? "bg-white border-[var(--border-subtle)] shadow-xs" : "bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-rounded font-bold text-[var(--pink-strong)]">
                      {item.selected ? "✓ Active Scenario" : "○ Excluded"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.delulu.items.filter((d) => d.id !== item.id);
                        onChange({ delulu: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = config.delulu.items.map((d) =>
                        d.id === item.id ? { ...d, title: e.target.value } : d
                      );
                      onChange({ delulu: { items: updated } });
                    }}
                    placeholder="Scenario title..."
                    className="w-full font-serif font-bold text-base text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={item.situation}
                    onChange={(e) => {
                      const updated = config.delulu.items.map((d) =>
                        d.id === item.id ? { ...d, situation: e.target.value } : d
                      );
                      onChange({ delulu: { items: updated } });
                    }}
                    placeholder="The daydream premise..."
                    className="w-full text-xs font-rounded text-[var(--text-secondary)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none"
                  />

                  {/* Interactive Options and Responses */}
                  {item.options && item.options.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded">
                        Interactive Choices & Responses
                      </span>
                      {item.options.map((opt, oIdx) => (
                        <div
                          key={opt.id || oIdx}
                          className="bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-subtle)] space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] w-14 shrink-0 font-rounded">
                              Choice {oIdx + 1}:
                            </span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...item.options];
                                newOpts[oIdx] = { ...opt, text: e.target.value };
                                const updated = config.delulu.items.map((d) =>
                                  d.id === item.id ? { ...d, options: newOpts } : d
                                );
                                onChange({ delulu: { items: updated } });
                              }}
                              className="flex-1 px-2 py-1 rounded bg-white border border-[var(--border-subtle)] text-xs font-rounded text-[var(--text-primary)] focus:outline-none"
                              placeholder="Choice button text..."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--pink-strong)] w-14 shrink-0 font-rounded">
                              Reply:
                            </span>
                            <input
                              type="text"
                              value={opt.response}
                              onChange={(e) => {
                                const newOpts = [...item.options];
                                newOpts[oIdx] = { ...opt, response: e.target.value };
                                const updated = config.delulu.items.map((d) =>
                                  d.id === item.id ? { ...d, options: newOpts } : d
                                );
                                onChange({ delulu: { items: updated } });
                              }}
                              className="flex-1 px-2 py-1 rounded bg-white border border-[var(--border-subtle)] text-xs font-serif italic text-[var(--romantic-plum)] focus:outline-none"
                              placeholder="Romantic response revealed..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 8: QUIZ ==================== */}
        {activeChapterId === "quiz" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  How Well Do You Know Us? (Relationship Quiz)
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Customize the interactive questions and reveal answers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `quiz_${Date.now()}`;
                  onChange({
                    quiz: {
                      questions: [
                        ...config.quiz.questions,
                        {
                          id,
                          question: "What is my absolute favorite thing about you?",
                          type: "multiple-choice",
                          options: ["Your smile", "Your gentle heart", "The way you laugh", "All of the above ♡"],
                          creatorAnswer: "All of the above ♡",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {config.quiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-white space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-rounded font-bold text-[var(--pink-strong)]">
                      Question {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.quiz.questions.filter((item) => item.id !== q.id);
                        onChange({ quiz: { questions: updated } });
                      }}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = config.quiz.questions.map((item) =>
                        item.id === q.id ? { ...item, question: e.target.value } : item
                      );
                      onChange({ quiz: { questions: updated } });
                    }}
                    placeholder="Enter question text..."
                    className="w-full font-serif font-bold text-base text-[var(--text-primary)] focus:outline-none border-b border-transparent focus:border-[var(--pink-strong)]"
                  />

                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options!];
                            newOptions[oIdx] = e.target.value;
                            const updated = config.quiz.questions.map((item) =>
                              item.id === q.id ? { ...item, options: newOptions } : item
                            );
                            onChange({ quiz: { questions: updated } });
                          }}
                          placeholder={`Option ${oIdx + 1}`}
                          className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-rounded"
                        />
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={q.creatorAnswer || ""}
                        onChange={(e) => {
                          const updated = config.quiz.questions.map((item) =>
                            item.id === q.id ? { ...item, creatorAnswer: e.target.value } : item
                          );
                          onChange({ quiz: { questions: updated } });
                        }}
                        placeholder="e.g. All of the above ♡"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded font-semibold text-[var(--pink-strong)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-rounded">
                        Sweet Explanation / Note
                      </label>
                      <input
                        type="text"
                        value={q.explanation || ""}
                        onChange={(e) => {
                          const updated = config.quiz.questions.map((item) =>
                            item.id === q.id ? { ...item, explanation: e.target.value } : item
                          );
                          onChange({ quiz: { questions: updated } });
                        }}
                        placeholder="Why this is our answer..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded font-serif italic text-[var(--text-secondary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 9: LETTERS ==================== */}
        {activeChapterId === "letters" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Letters I Don&apos;t Say Enough
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Heartfelt love letters with personal body text and signatures.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `letter_${Date.now()}`;
                  onChange({
                    letters: {
                      items: [
                        ...config.letters.items,
                        {
                          id,
                          title: "To My Favorite Person",
                          content: "Thank you for simply existing in my world. You make every day warmer.",
                          closingLine: "With all my love,",
                          signature: config.senderNickname || "Babe",
                          paperStyle: "vintage",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Write a Letter
              </button>
            </div>

            <div className="space-y-6">
              {config.letters.items.map((letter) => (
                <div
                  key={letter.id}
                  className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={letter.title}
                      onChange={(e) => {
                        const updated = config.letters.items.map((l) =>
                          l.id === letter.id ? { ...l, title: e.target.value } : l
                        );
                        onChange({ letters: { items: updated } });
                      }}
                      className="font-serif font-bold text-xl text-[var(--text-primary)] bg-transparent focus:outline-none border-b border-transparent focus:border-[var(--pink-strong)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.letters.items.filter((l) => l.id !== letter.id);
                        onChange({ letters: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={letter.content}
                    onChange={(e) => {
                      const updated = config.letters.items.map((l) =>
                        l.id === letter.id ? { ...l, content: e.target.value } : l
                      );
                      onChange({ letters: { items: updated } });
                    }}
                    className="w-full font-serif text-sm sm:text-base text-[var(--text-primary)] leading-relaxed bg-white rounded-2xl p-4 border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <input
                      type="text"
                      value={letter.signature || config.senderNickname || "Babe"}
                      onChange={(e) => {
                        const updated = config.letters.items.map((l) =>
                          l.id === letter.id ? { ...l, signature: e.target.value } : l
                        );
                        onChange({ letters: { items: updated } });
                      }}
                      className="font-handwritten text-xl text-[var(--pink-strong)] bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 10: LITTLE REASONS ==================== */}
        {activeChapterId === "littleReasons" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  A Hundred Little Reasons
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Manage the reasons you adore them. Each card features an emoji, headline, and optional supporting note.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-rounded font-semibold text-[var(--pink-strong)] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  {config.littleReasons.items.length} Reasons
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const id = `reason_${Date.now()}`;
                    const newReason: CreatorReasonItem = {
                      id,
                      title: "The way you smile whenever you see our favorite food.",
                      supportingText: "It lights up the whole room instantly.",
                      text: "The way you smile whenever you see our favorite food. It lights up the whole room instantly.",
                      emoji: "💗",
                      selected: true,
                      isCustom: true,
                    };
                    onChange({
                      littleReasons: {
                        ...config.littleReasons,
                        items: [...config.littleReasons.items, newReason],
                      },
                    });
                  }}
                  className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
                >
                  + Add a Reason
                </button>
              </div>
            </div>

            {/* Section Headings Customization */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Screen Title & Subtitle
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-rounded text-[var(--text-secondary)] mb-1">
                    Screen Title
                  </label>
                  <input
                    type="text"
                    value={config.littleReasons.heading ?? "Little Reasons I Love You"}
                    onChange={(e) =>
                      onChange({
                        littleReasons: {
                          ...config.littleReasons,
                          heading: e.target.value,
                        },
                      })
                    }
                    placeholder="Little Reasons I Love You"
                    className="w-full text-xs font-rounded text-[var(--text-primary)] px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-white focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-rounded text-[var(--text-secondary)] mb-1">
                    Screen Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.littleReasons.subtitle ?? "I started counting. Then I remembered that loving you isn't something I can finish counting."}
                    onChange={(e) =>
                      onChange({
                        littleReasons: {
                          ...config.littleReasons,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    placeholder="Subtitle or romantic quote..."
                    className="w-full text-xs font-rounded text-[var(--text-primary)] px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-white focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[550px] overflow-y-auto pr-2">
              {config.littleReasons.items.map((r, idx) => {
                // Live sync detection: If user edited text while preset title was stale, use text as current title
                const isStaleTitle = Boolean(
                  r.title &&
                  r.text &&
                  !r.text.includes(r.title)
                );
                const currentTitle = isStaleTitle ? r.text : (r.title ?? r.text);
                const currentSupporting = isStaleTitle ? "" : (r.supportingText || "");

                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-white/90 hover:bg-white flex flex-col justify-between space-y-2 shadow-2xs transition-all"
                  >
                    {/* Header Row: Index, Emoji Picker, Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-rounded text-[var(--pink-strong)]">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={r.emoji || "💗"}
                          onChange={(e) => {
                            const updated = config.littleReasons.items.map((item) =>
                              item.id === r.id ? { ...item, emoji: e.target.value } : item
                            );
                            onChange({ littleReasons: { ...config.littleReasons, items: updated } });
                          }}
                          placeholder="💗"
                          title="Emoji icon"
                          className="w-8 h-7 text-center text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.littleReasons.items.filter((item) => item.id !== r.id);
                          onChange({ littleReasons: { ...config.littleReasons, items: updated } });
                        }}
                        className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer p-1 rounded-md hover:bg-rose-50 transition-colors"
                        title="Remove reason"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Reason Headline / Title Input */}
                    <div>
                      <input
                        type="text"
                        value={currentTitle}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          const updated = config.littleReasons.items.map((item) => {
                            if (item.id !== r.id) return item;
                            const supporting = isStaleTitle ? "" : (item.supportingText || "");
                            const combined = supporting ? `${newTitle} ${supporting}`.trim() : newTitle;
                            return {
                              ...item,
                              title: newTitle,
                              supportingText: supporting,
                              text: combined,
                              isCustom: true,
                            };
                          });
                          onChange({ littleReasons: { ...config.littleReasons, items: updated } });
                        }}
                        placeholder="Reason headline..."
                        className="w-full text-xs font-serif font-bold text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                      />
                    </div>

                    {/* Supporting Detail / Note Input (optional) */}
                    <div>
                      <input
                        type="text"
                        value={currentSupporting}
                        onChange={(e) => {
                          const newSupporting = e.target.value;
                          const updated = config.littleReasons.items.map((item) => {
                            if (item.id !== r.id) return item;
                            const title = isStaleTitle ? item.text : (item.title ?? item.text);
                            const combined = newSupporting ? `${title} ${newSupporting}`.trim() : title;
                            return {
                              ...item,
                              title,
                              supportingText: newSupporting,
                              text: combined,
                              isCustom: true,
                            };
                          });
                          onChange({ littleReasons: { ...config.littleReasons, items: updated } });
                        }}
                        placeholder="Supporting note / detail (optional)..."
                        className="w-full text-[11px] font-serif italic text-[var(--text-secondary)] px-2.5 py-1 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--pink-strong)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 11: DIGITAL GIFTS ==================== */}
        {activeChapterId === "digitalGifts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Little Gifts I Owe You
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Digital vouchers and affectionate promises that never expire.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `gift_${Date.now()}`;
                  onChange({
                    digitalGifts: {
                      items: [
                        ...config.digitalGifts.items,
                        {
                          id,
                          title: "One Guilt-Free Lazy Day",
                          description: "I bring snacks, handle all chores, and let you nap as much as you want.",
                          emoji: "🧸",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Add Promise Voucher
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.digitalGifts.items.map((gift) => (
                <div
                  key={gift.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-white space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={gift.emoji || "🎁"}
                        onChange={(e) => {
                          const updated = config.digitalGifts.items.map((g) =>
                            g.id === gift.id ? { ...g, emoji: e.target.value } : g
                          );
                          onChange({ digitalGifts: { items: updated } });
                        }}
                        placeholder="🎁"
                        className="w-10 text-center px-1 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xl focus:outline-none"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded">
                        Promise Coupon
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.digitalGifts.items.filter((g) => g.id !== gift.id);
                        onChange({ digitalGifts: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={gift.title}
                    onChange={(e) => {
                      const updated = config.digitalGifts.items.map((g) =>
                        g.id === gift.id ? { ...g, title: e.target.value } : g
                      );
                      onChange({ digitalGifts: { items: updated } });
                    }}
                    placeholder="Coupon title..."
                    className="w-full font-serif font-bold text-sm text-[var(--text-primary)] focus:outline-none border-b border-transparent focus:border-[var(--pink-strong)]"
                  />
                  <textarea
                    rows={2}
                    value={gift.description}
                    onChange={(e) => {
                      const updated = config.digitalGifts.items.map((g) =>
                        g.id === gift.id ? { ...g, description: e.target.value } : g
                      );
                      onChange({ digitalGifts: { items: updated } });
                    }}
                    placeholder="What this promise includes..."
                    className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 12: NOTEBOOK ==================== */}
        {activeChapterId === "notebook" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Our Little Notebook
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Shared thoughts, quiet reminders, and little love notes left on the counter.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `note_${Date.now()}`;
                  onChange({
                    notebook: {
                      notes: [
                        ...config.notebook.notes,
                        {
                          id,
                          title: "A sweet reminder",
                          content: "You are the best part of my every day.",
                          authorName: config.senderNickname || "Babe",
                          moodEmoji: "🤍",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Add a Note
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.notebook.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-lg">{note.moodEmoji || "🤍"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.notebook.notes.filter((n) => n.id !== note.id);
                        onChange({ notebook: { notes: updated } });
                      }}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={note.title || ""}
                    onChange={(e) => {
                      const updated = config.notebook.notes.map((n) =>
                        n.id === note.id ? { ...n, title: e.target.value } : n
                      );
                      onChange({ notebook: { notes: updated } });
                    }}
                    placeholder="Note heading..."
                    className="w-full font-serif font-bold text-sm text-[var(--text-primary)] focus:outline-none bg-transparent"
                  />
                  <textarea
                    rows={3}
                    value={note.content}
                    onChange={(e) => {
                      const updated = config.notebook.notes.map((n) =>
                        n.id === note.id ? { ...n, content: e.target.value } : n
                      );
                      onChange({ notebook: { notes: updated } });
                    }}
                    placeholder="Write your note..."
                    className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 13: VOICE NOTES ==================== */}
        {activeChapterId === "voice" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                If You Could Hear My Heart (Voice Notes)
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                A heartfelt personal message with optional audio or whisper transcript.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Main Message
              </label>
              <textarea
                rows={3}
                value={config.voice.mainMessage}
                onChange={(e) =>
                  onChange({
                    voice: { ...config.voice, mainMessage: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Transcript / Written Whisper
              </label>
              <textarea
                rows={4}
                value={config.voice.transcript || ""}
                onChange={(e) =>
                  onChange({
                    voice: { ...config.voice, transcript: e.target.value },
                  })
                }
                placeholder="Write out the words they can read if audio isn't playing..."
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded font-serif italic"
              />
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 14: SOMEDAY, WITH YOU ==================== */}
        {activeChapterId === "bucketList" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Someday, With You (Future Wishes & Bucket List)
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Dreams, future trips, and little traditions you want to experience together.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `dream_${Date.now()}`;
                  onChange({
                    bucketList: {
                      items: [
                        ...config.bucketList.items,
                        {
                          id,
                          title: "Watch the Northern Lights",
                          description: "Wrapped together in a cozy thermal cabin under the green glowing sky.",
                          creator: "sender",
                          status: "planned",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Add a Dream
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.bucketList.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-white space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <select
                      value={item.status}
                      onChange={(e) => {
                        const updated = config.bucketList.items.map((b) =>
                          b.id === item.id ? { ...b, status: e.target.value as CreatorBucketListItem["status"] } : b
                        );
                        onChange({ bucketList: { items: updated } });
                      }}
                      className="text-xs font-rounded font-bold text-[var(--pink-strong)] bg-[var(--pale-rose)] px-2.5 py-1 rounded-full border border-pink-200 focus:outline-none cursor-pointer"
                    >
                      <option value="idea">💭 Dream</option>
                      <option value="shortlisted">⭐ Shortlisted</option>
                      <option value="planned">📅 Planned!</option>
                      <option value="completed">✅ Done!</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.bucketList.items.filter((b) => b.id !== item.id);
                        onChange({ bucketList: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = config.bucketList.items.map((b) =>
                        b.id === item.id ? { ...b, title: e.target.value } : b
                      );
                      onChange({ bucketList: { items: updated } });
                    }}
                    placeholder="Dream title..."
                    className="w-full font-serif font-bold text-base text-[var(--text-primary)] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => {
                      const updated = config.bucketList.items.map((b) =>
                        b.id === item.id ? { ...b, description: e.target.value } : b
                      );
                      onChange({ bucketList: { items: updated } });
                    }}
                    placeholder="Why this dream matters to us..."
                    className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 15: LITTLE THINGS THAT ARE SO YOU ==================== */}
        {activeChapterId === "personalCards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Little Things That Are So You
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Celebrate their favorite things, habits, preferences, and personality quirks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `quirk_${Date.now()}`;
                  onChange({
                    personalCards: {
                      items: [
                        ...config.personalCards.items,
                        {
                          id,
                          category: "Favorite Comfort",
                          title: "Hot Chamomile Tea in Oversized Mugs",
                          content: "Two hands holding the warm mug like it holds all the warmth in the universe.",
                          emoji: "☕",
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer"
              >
                + Add a Favorite
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.personalCards.items.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-white space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={card.emoji || "🌸"}
                        onChange={(e) => {
                          const updated = config.personalCards.items.map((p) =>
                            p.id === card.id ? { ...p, emoji: e.target.value } : p
                          );
                          onChange({ personalCards: { items: updated } });
                        }}
                        placeholder="🌸"
                        className="w-9 text-center px-1 py-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        value={card.category}
                        onChange={(e) => {
                          const updated = config.personalCards.items.map((p) =>
                            p.id === card.id ? { ...p, category: e.target.value } : p
                          );
                          onChange({ personalCards: { items: updated } });
                        }}
                        className="text-[10px] uppercase font-bold text-[var(--pink-strong)] bg-[var(--pale-rose)] px-2 py-0.5 rounded-full border border-pink-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.personalCards.items.filter((p) => p.id !== card.id);
                        onChange({ personalCards: { items: updated } });
                      }}
                      className="text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => {
                      const updated = config.personalCards.items.map((p) =>
                        p.id === card.id ? { ...p, title: e.target.value } : p
                      );
                      onChange({ personalCards: { items: updated } });
                    }}
                    placeholder="Title..."
                    className="w-full font-serif font-bold text-base text-[var(--text-primary)] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={card.content}
                    onChange={(e) => {
                      const updated = config.personalCards.items.map((p) =>
                        p.id === card.id ? { ...p, content: e.target.value } : p
                      );
                      onChange({ personalCards: { items: updated } });
                    }}
                    placeholder="Description..."
                    className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 16: PLAN OUR NEXT LITTLE ADVENTURE ==================== */}
        {activeChapterId === "datePlanner" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Plan Our Next Little Adventure (24 Date Cards)
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                  Select, customize, or add your own date ideas. All 24 canonical ideas feature simplified natural titles.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = `date_custom_${Date.now()}`;
                  onChange({
                    datePlanner: {
                      items: [
                        ...config.datePlanner.items,
                        {
                          id,
                          title: "Our Street Food Stroll",
                          description: "Walk down night food stalls, share dumplings, and talk until our feet get tired.",
                          category: "budget_friendly",
                          costEstimateText: "Under $25",
                          estimatedDuration: "About 2 hours",
                          location: "Downtown night market",
                          isFavorited: true,
                          selected: true,
                          isCustom: true,
                        },
                      ],
                    },
                  });
                }}
                className="px-4 py-2 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--soft-pink)] cursor-pointer shrink-0"
              >
                + Add My Own Date
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Search date ideas (e.g. Picnic, Movie, Stargazing)..."
                value={dateSearchQuery}
                onChange={(e) => setDateSearchQuery(e.target.value)}
                className="w-full sm:flex-1 px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-rounded focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["all", "outdoor_adventures", "cozy_home", "romantic_evenings", "budget_friendly", "special_occasions"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDateCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-rounded font-bold shrink-0 cursor-pointer transition-colors ${
                        dateCategoryFilter === cat
                          ? "bg-[var(--pink-strong)] text-white"
                          : "bg-white border border-[var(--border-subtle)] text-[var(--text-muted)]"
                      }`}
                    >
                      {cat.replace(/_/g, " ").toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-2">
              {config.datePlanner.items
                .filter((d) => {
                  const matchQuery =
                    !dateSearchQuery ||
                    d.title.toLowerCase().includes(dateSearchQuery.toLowerCase()) ||
                    d.description.toLowerCase().includes(dateSearchQuery.toLowerCase());
                  const matchCat = dateCategoryFilter === "all" || d.category === dateCategoryFilter;
                  return matchQuery && matchCat;
                })
                .map((date, dIdx) => (
                  <div
                    key={date.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      date.selected
                        ? "bg-white border-[var(--pink-primary)]/40 shadow-xs"
                        : "bg-gray-50/50 border-[var(--border-subtle)] opacity-50"
                    }`}
                  >
                    <div>
                      {/* Photo Thumbnail with explicit Input for Photo X */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                              Photo {dIdx + 1}
                            </span>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                              Input for Photo {dIdx + 1}
                            </label>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-rounded">
                            Date idea cover
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            onOpenPhotoLibrary((url) => {
                              const updated = config.datePlanner.items.map((d) =>
                                d.id === date.id ? { ...d, coverPhoto: url } : d
                              );
                              onChange({ datePlanner: { items: updated } });
                            }, `Choose Input for Photo ${dIdx + 1} (${date.title})`)
                          }
                          className="aspect-[16/9] w-full rounded-xl overflow-hidden relative bg-pink-50 border-2 border-dashed border-pink-300 hover:border-[var(--pink-strong)] cursor-pointer group flex items-center justify-center transition-all"
                        >
                          {date.coverPhoto ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={date.coverPhoto}
                                alt={`Photo ${dIdx + 1} - ${date.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-rounded font-bold">
                                Change Photo {dIdx + 1} 📷
                              </div>
                              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                Photo {dIdx + 1}
                              </span>
                            </>
                          ) : (
                            <div className="text-center p-2 text-xs font-rounded text-[var(--pink-strong)] space-y-0.5">
                              <span className="text-xl block">📸</span>
                              <span className="font-bold block">Input for Photo {dIdx + 1}</span>
                              <span className="text-[10px] text-gray-500 block">Click to select photo</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.datePlanner.items.map((d) =>
                              d.id === date.id ? { ...d, selected: !d.selected } : d
                            );
                            onChange({ datePlanner: { items: updated } });
                          }}
                          className={`text-xs font-rounded font-bold cursor-pointer ${
                            date.selected ? "text-[var(--pink-strong)]" : "text-gray-400"
                          }`}
                        >
                          {date.selected ? "✓ Selected" : "○ Unselected"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.datePlanner.items.map((d) =>
                              d.id === date.id ? { ...d, isFavorited: !d.isFavorited } : d
                            );
                            onChange({ datePlanner: { items: updated } });
                          }}
                          className={`text-sm cursor-pointer ${
                            date.isFavorited ? "text-rose-500" : "text-gray-300"
                          }`}
                          title="Favorite"
                        >
                          {date.isFavorited ? "❤️" : "🤍"}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={date.title}
                        onChange={(e) => {
                          const updated = config.datePlanner.items.map((d) =>
                            d.id === date.id ? { ...d, title: e.target.value } : d
                          );
                          onChange({ datePlanner: { items: updated } });
                        }}
                        className="w-full font-serif font-bold text-base text-[var(--text-primary)] mb-1 focus:outline-none"
                      />

                      <textarea
                        rows={2}
                        value={date.description}
                        onChange={(e) => {
                          const updated = config.datePlanner.items.map((d) =>
                            d.id === date.id ? { ...d, description: e.target.value } : d
                          );
                          onChange({ datePlanner: { items: updated } });
                        }}
                        className="w-full text-xs font-rounded text-[var(--text-secondary)] focus:outline-none mb-2"
                      />
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)]/50 flex items-center justify-end text-[11px] font-rounded text-[var(--text-muted)]">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoLibrary((url) => {
                            const updated = config.datePlanner.items.map((d) =>
                              d.id === date.id ? { ...d, coverPhoto: url } : d
                            );
                            onChange({ datePlanner: { items: updated } });
                          }, `Replace photo for ${date.title}`)
                        }
                        className="text-[var(--pink-strong)] hover:underline cursor-pointer"
                      >
                        Change photo
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 17: ONE LAST LITTLE SECRET ==================== */}
        {activeChapterId === "lastSecret" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                One Last Little Secret
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                A surprise hidden reveal right before the grand finale. Kept hidden until they tap to unlock.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Reveal Heading
              </label>
              <input
                type="text"
                value={config.lastSecret.revealHeading}
                onChange={(e) =>
                  onChange({
                    lastSecret: { ...config.lastSecret, revealHeading: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Secret Message Revealed
              </label>
              <textarea
                rows={4}
                value={config.lastSecret.revealMessage}
                onChange={(e) =>
                  onChange({
                    lastSecret: { ...config.lastSecret, revealMessage: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded font-serif italic"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Reveal Button Label
                </label>
                <input
                  type="text"
                  value={config.lastSecret.buttonLabel}
                  onChange={(e) =>
                    onChange({
                      lastSecret: { ...config.lastSecret, buttonLabel: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Final Secret Note
                </label>
                <input
                  type="text"
                  value={config.lastSecret.finalNote || ""}
                  onChange={(e) =>
                    onChange({
                      lastSecret: { ...config.lastSecret, finalNote: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded font-handwritten text-lg"
                />
              </div>
            </div>

            {/* Explicit Input for Photo 1 (Surprise Reveal Photo) */}
            <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--pink-strong)] text-white text-[10px] font-bold font-rounded">
                    Photo 1
                  </span>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                    Input for Photo 1 (Surprise Reveal Photo)
                  </label>
                </div>
                <span className="text-[10px] text-[var(--pink-strong)] font-semibold font-rounded">
                  Climax Secret Photo
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-rounded">
                This photograph appears as <strong>Photo 1</strong> when your partner unlocks this final secret on the live preview.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onOpenPhotoLibrary((url) => {
                      onChange({
                        lastSecret: { ...config.lastSecret, surprisePhoto: url },
                      });
                    }, "Choose Input for Photo 1 (Surprise Reveal Photo)")
                  }
                  className="px-4 py-2.5 rounded-2xl border-2 border-dashed border-[var(--pink-primary)] bg-white text-xs font-rounded font-bold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <span>📷</span>
                  <span>{config.lastSecret.surprisePhoto ? "Change Input for Photo 1" : "Select Input for Photo 1"}</span>
                </button>

                {config.lastSecret.surprisePhoto && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.lastSecret.surprisePhoto}
                        alt="Input for Photo 1"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-pink-300 shadow-2xs"
                      />
                      <span className="absolute -top-1.5 -left-1.5 bg-[var(--pink-strong)] text-white text-[9px] font-bold px-1 rounded-sm shadow-xs">
                        P1
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          lastSecret: { ...config.lastSecret, surprisePhoto: undefined },
                        })
                      }
                      className="text-xs text-rose-500 hover:underline cursor-pointer font-rounded"
                    >
                      Remove Photo 1
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== CHAPTER 18: FINAL HEART & OUR TIME ==================== */}
        {activeChapterId === "finalHeart" && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Our Time Together & Final Heart
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-rounded mt-1">
                The grand emotional climax: relationship time counter, love message, and photo mosaic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Closing Heading
                </label>
                <input
                  type="text"
                  value={config.finalHeart.closingHeading}
                  onChange={(e) =>
                    onChange({
                      finalHeart: { ...config.finalHeart, closingHeading: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                  Relationship Start Date
                </label>
                <input
                  type="date"
                  value={config.finalHeart.startDate || config.anniversaryDate || "2023-08-20"}
                  onChange={(e) =>
                    onChange({
                      anniversaryDate: e.target.value,
                      finalHeart: { ...config.finalHeart, startDate: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Final Romantic Message
              </label>
              <textarea
                rows={4}
                value={config.finalHeart.finalMessage}
                onChange={(e) =>
                  onChange({
                    finalHeart: { ...config.finalHeart, finalMessage: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded leading-relaxed"
              />
            </div>

            {/* Dedicated Input for Center Hero Photo */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded flex items-center gap-1.5">
                    <span>💖</span>
                    <span>Grand Centerpiece Photo (Our Center ♡)</span>
                  </label>
                  <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                    A separate photo dedicated specifically to the <strong>grand center</strong> of your heart collage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPhotoLibrary((url) => {
                      onChange({
                        finalHeart: {
                          ...config.finalHeart,
                          finalPhoto: url,
                        },
                      });
                    }, "Choose Centerpiece Hero Photo")
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-rounded font-bold hover:opacity-90 cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>📷</span>
                  <span>{config.finalHeart.finalPhoto ? "Change Center Photo" : "+ Choose Center Photo"}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 via-rose-50/40 to-pink-50/80 border-2 border-pink-200/90 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
                <div
                  onClick={() =>
                    onOpenPhotoLibrary((url) => {
                      onChange({
                        finalHeart: {
                          ...config.finalHeart,
                          finalPhoto: url,
                        },
                      });
                    }, "Choose Centerpiece Hero Photo")
                  }
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl border-2 border-pink-300 bg-white shadow-xs flex items-center justify-center cursor-pointer overflow-hidden shrink-0 relative group hover:border-[var(--pink-strong)] hover:shadow-md transition-all"
                  title="Click to choose/change center photo"
                >
                  {config.finalHeart.finalPhoto ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.finalHeart.finalPhoto}
                        alt="Center Hero Photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold font-rounded">
                        Change
                      </div>
                      <span className="absolute bottom-1 left-1 bg-[var(--pink-strong)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Center ♡
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl block mb-1">🖼️</span>
                      <span className="text-[10px] text-[var(--pink-strong)] font-bold font-rounded block leading-tight">
                        + Choose Center Photo
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold font-rounded text-[var(--text-primary)] flex items-center justify-center sm:justify-start gap-1.5">
                        <span>Center Photo Tile</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-100 text-[var(--pink-strong)] border border-pink-200">
                          Heart Centerpiece
                        </span>
                      </h5>
                      <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-1">
                        {config.finalHeart.finalPhoto
                          ? "This photo appears prominently in the large centerpiece tile at the heart of your collage."
                          : "No custom center photo selected. Defaults to the romantic couple hero photo."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPhotoLibrary((url) => {
                          onChange({
                            finalHeart: {
                              ...config.finalHeart,
                              finalPhoto: url,
                            },
                          });
                        }, "Choose Centerpiece Hero Photo")
                      }
                      className="px-3 py-1.5 rounded-full bg-white border border-pink-300 text-xs text-[var(--pink-strong)] font-rounded font-bold hover:bg-pink-50 cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <span>📷</span>
                      <span>{config.finalHeart.finalPhoto ? "Replace Photo" : "Upload / Select Photo"}</span>
                    </button>

                    {config.finalHeart.finalPhoto && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            finalHeart: {
                              ...config.finalHeart,
                              finalPhoto: "",
                            },
                          })
                        }
                        className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-500 font-rounded hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                        title="Remove custom center photo"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Collage Photos Multi-Picker with Explicit Input for Photo X */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                    Surrounding Photo Mosaic ({config.finalHeart.collagePhotos.length} photos)
                  </label>
                  <p className="text-[11px] text-[var(--text-muted)] font-rounded mt-0.5">
                    Surrounding mosaic tiles mapped directly to <strong>Photo 1, Photo 2, Photo 3...</strong> forming the heart contour.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPhotoLibrary((url) => {
                      onChange({
                        finalHeart: {
                          ...config.finalHeart,
                          collagePhotos: [...config.finalHeart.collagePhotos, url],
                        },
                      });
                    }, `Add Input for Photo ${config.finalHeart.collagePhotos.length + 1}`)
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[var(--pale-rose)] border border-[var(--pink-primary)] text-xs text-[var(--pink-strong)] font-rounded font-bold hover:bg-[var(--soft-pink)] cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>📷</span>
                  <span>+ Add Input for Photo {config.finalHeart.collagePhotos.length + 1}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {config.finalHeart.collagePhotos.map((url, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-2xl border-2 border-pink-200 overflow-hidden relative group bg-pink-50 flex flex-col p-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[10px] font-bold font-rounded text-[var(--pink-strong)]">
                        Input for Photo {pIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = config.finalHeart.collagePhotos.filter((_, i) => i !== pIdx);
                          onChange({ finalHeart: { ...config.finalHeart, collagePhotos: next } });
                        }}
                        className="text-gray-400 hover:text-rose-500 text-xs cursor-pointer"
                        title={`Remove Photo ${pIdx + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      onClick={() =>
                        onOpenPhotoLibrary((newUrl) => {
                          const next = [...config.finalHeart.collagePhotos];
                          next[pIdx] = newUrl;
                          onChange({ finalHeart: { ...config.finalHeart, collagePhotos: next } });
                        }, `Change Photo ${pIdx + 1}`)
                      }
                      className="aspect-square rounded-xl overflow-hidden relative cursor-pointer group/thumb"
                      title={`Click to change Photo ${pIdx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold font-rounded">
                        Change
                      </div>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Photo {pIdx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Right Column: Sticky Respective Chapter Live Preview */}
        <div className={`lg:col-span-6 xl:col-span-6 lg:sticky lg:top-20 ${mobileTab === "form" ? "hidden lg:block" : "block"}`}>
          <WizardChapterSidePreview
            activeChapterId={activeChapterId}
            config={config}
            chapterNumber={currentChapter.chapterNumber}
            chapterTitle={currentChapter.title}
            chapterEmoji={currentChapter.emoji}
            onChange={onChange}
          />
        </div>
      </div>

      {/* Chapter Stepper Footer */}
      <div className="mt-8 flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handlePrevChapter}
          className="px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
        >
          ← {selectedChapters.findIndex((c) => c.id === activeChapterId) === 0 ? "Back to Chapters" : "Previous Chapter"}
        </button>

        <button
          type="button"
          onClick={handleNextChapter}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-sm font-rounded font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <span>
            {selectedChapters.findIndex((c) => c.id === activeChapterId) === selectedChapters.length - 1
              ? "Continue to Preview →"
              : "Next Chapter →"}
          </span>
        </button>
      </div>
    </div>
  );
}
