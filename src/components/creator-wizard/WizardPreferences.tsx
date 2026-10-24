"use client";

import { motion } from "framer-motion";
import type { CreatorConfig } from "@/lib/creator-types";

interface WizardPreferencesProps {
  config: CreatorConfig;
  onChange: (updates: Partial<CreatorConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardPreferences({ config, onChange, onNext, onBack }: WizardPreferencesProps) {
  const current = config.preferences;

  const updatePref = (updates: Partial<CreatorConfig["preferences"]>) => {
    onChange({
      preferences: {
        ...current,
        ...updates,
      },
    });
  };

  const palettes = [
    {
      id: "blush",
      name: "Blush Pink",
      desc: "Warm rose, creamy ivory, and soft peach blossoms",
      preview: "linear-gradient(135deg, #FFF0F5 0%, #FFB6C1 50%, #FF69B4 100%)",
    },
    {
      id: "lavender",
      name: "Lavender Dream",
      desc: "Gentle lilac, pastel violet, and twilight softness",
      preview: "linear-gradient(135deg, #F8F4FF 0%, #E6E6FA 50%, #B39DDB 100%)",
    },
    {
      id: "cream-rose",
      name: "Cream & Rose",
      desc: "Vintage warm vanilla, antique parchment, and dusty rose",
      preview: "linear-gradient(135deg, #FFFDF9 0%, #F5EBE6 50%, #D4A373 100%)",
    },
    {
      id: "sunset",
      name: "Sunset Romance",
      desc: "Golden hour glow, honey amber, and dusky pink",
      preview: "linear-gradient(135deg, #FFF5EB 0%, #FFCCBC 50%, #FF8A80 100%)",
    },
  ];

  const typographyOptions = [
    {
      id: "elegant-serif",
      name: "Elegant Serif + Handwritten",
      fontSample: "Playfair Display & Dancing Script",
      desc: "Classic storybook romance with heartfelt personal handwriting",
    },
    {
      id: "modern-rounded",
      name: "Modern Rounded + Script",
      fontSample: "Quicksand & Soft Script",
      desc: "Cute, modern, approachable, and playful couple vibes",
    },
    {
      id: "romantic-classic",
      name: "Romantic Classic",
      fontSample: "Cormorant Garamond & Caveat",
      desc: "Timeless poetic love letters and subtle elegance",
    },
  ];

  const moodOptions = [
    { id: "soft-emotional", label: "Soft & Emotional 🥺", desc: "Tender, tearful joy, deep love, quiet intimacy" },
    { id: "playful-cute", label: "Playful & Cute 🧸", desc: "Inside jokes, cheeky teasing, bright smiles, cheerful energy" },
    { id: "elegant-minimal", label: "Elegant & Minimal ✨", desc: "Bespoke editorial feel, breathable spacing, quiet luxury" },
  ];

  const photoStyles = [
    { id: "scrapbook", label: "Scrapbook Tape & Angles", desc: "Authentic scrapbook corners with cute washi tape" },
    { id: "polaroid", label: "Classic White Polaroids", desc: "Square frames with handwritten dates and captions" },
    { id: "collage", label: "Floating Heart Mosaic", desc: "Interlocking organic frames forming a grand love mosaic" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block mb-2">
          Step 6 · Aesthetics & Atmosphere
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Design & Experience Preferences
        </h2>
        <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto">
          Tailor the color palette, typography mood, and visual style of your world. All choices come with sensible defaults.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* 1. Color Palette */}
        <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
            Color Palette
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {palettes.map((p) => {
              const isSelected = current.colorPalette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => updatePref({ colorPalette: p.id as any })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[var(--pink-primary)] ring-2 ring-[var(--pink-primary)]/20 bg-pink-50/30 shadow-xs"
                      : "border-[var(--border-subtle)] bg-white hover:border-pink-200"
                  }`}
                >
                  <div
                    className="h-14 rounded-xl w-full mb-3 shadow-inner border border-black/5"
                    style={{ background: p.preview }}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-rounded font-bold text-xs text-[var(--text-primary)]">
                        {p.name}
                      </span>
                      {isSelected && <span className="text-xs text-[var(--pink-strong)] font-bold">✓</span>}
                    </div>
                    <p className="text-[11px] font-rounded text-[var(--text-muted)] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Typography Preset */}
        <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
            Typography Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {typographyOptions.map((t) => {
              const isSelected = current.typographyPreset === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => updatePref({ typographyPreset: t.id as any })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[var(--pink-primary)] ring-2 ring-[var(--pink-primary)]/20 bg-pink-50/30 shadow-xs"
                      : "border-[var(--border-subtle)] bg-white hover:border-pink-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-rounded font-bold text-xs text-[var(--text-primary)]">
                        {t.name}
                      </span>
                      {isSelected && <span className="text-xs text-[var(--pink-strong)] font-bold">✓</span>}
                    </div>
                    <span className="text-sm font-serif italic text-[var(--pink-strong)] block mb-2">
                      &ldquo;Forever & Always&rdquo;
                    </span>
                    <p className="text-[11px] font-rounded text-[var(--text-muted)] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Overall Mood & Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
              Overall Mood
            </label>
            <div className="space-y-2">
              {moodOptions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => updatePref({ mood: m.id as any })}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    current.mood === m.id
                      ? "border-[var(--pink-primary)] bg-[var(--pale-rose)]/50 font-semibold text-[var(--pink-strong)]"
                      : "border-[var(--border-subtle)] hover:border-pink-200 text-[var(--text-secondary)]"
                  }`}
                >
                  <p className="font-rounded font-bold text-[var(--text-primary)]">{m.label}</p>
                  <p className="text-[11px] font-rounded text-[var(--text-muted)] mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded mb-3">
                Animation Intensity
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updatePref({ animationIntensity: "subtle" })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-rounded font-bold cursor-pointer transition-all ${
                    current.animationIntensity === "subtle"
                      ? "border-[var(--pink-primary)] bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                      : "border-[var(--border-subtle)] bg-white text-[var(--text-secondary)]"
                  }`}
                >
                  Subtle & Gentle ✨
                </button>
                <button
                  type="button"
                  onClick={() => updatePref({ animationIntensity: "playful" })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-rounded font-bold cursor-pointer transition-all ${
                    current.animationIntensity === "playful"
                      ? "border-[var(--pink-primary)] bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-xs"
                      : "border-[var(--border-subtle)] bg-white text-[var(--text-secondary)]"
                  }`}
                >
                  Playful & Bouncy 🌸
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded mb-2">
                Photo Presentation
              </label>
              <div className="space-y-1.5">
                {photoStyles.map((ps) => (
                  <div
                    key={ps.id}
                    onClick={() => updatePref({ photoPresentation: ps.id as any })}
                    className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all flex items-center justify-between ${
                      current.photoPresentation === ps.id
                        ? "border-[var(--pink-primary)] bg-[var(--soft-pink)] font-bold text-[var(--pink-strong)]"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <span>{ps.label}</span>
                    {current.photoPresentation === ps.id && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-10">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
        >
          ← Back to Personalize
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-sm font-rounded font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <span>Preview Complete Website →</span>
        </button>
      </div>
    </div>
  );
}
