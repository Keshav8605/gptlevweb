"use client";

import { motion } from "framer-motion";
import type { CreatorConfig } from "@/lib/creator-types";

interface WizardBasicsProps {
  config: CreatorConfig;
  onChange: (updates: Partial<CreatorConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardBasics({ config, onChange, onNext, onBack }: WizardBasicsProps) {
  const relationshipOptions = [
    { value: "partner", label: "Partner" },
    { value: "girlfriend", label: "Girlfriend" },
    { value: "boyfriend", label: "Boyfriend" },
    { value: "spouse", label: "Spouse / Wife / Husband" },
    { value: "custom", label: "Custom Label" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-strong)] font-rounded block mb-2">
          Step 2 · The Essentials
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Tell us about the two of you
        </h2>
        <p className="font-rounded text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto">
          These names and details weave throughout your letters, interactive chapters, and romantic countdowns. You can edit them at any time.
        </p>
      </motion.div>

      <div className="bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Names Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
              Your Name or Nickname <span className="text-[var(--pink-strong)]">*</span>
            </label>
            <input
              type="text"
              value={config.senderName}
              onChange={(e) => onChange({ senderName: e.target.value })}
              placeholder="e.g. Babe, Your Love, Keshav"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] transition-all"
            />
            <p className="text-[11px] text-[var(--text-muted)] font-rounded">
              Shown as the author of letters and notes.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
              Your Partner&apos;s Name or Nickname <span className="text-[var(--pink-strong)]">*</span>
            </label>
            <input
              type="text"
              value={config.recipientName}
              onChange={(e) => onChange({ recipientName: e.target.value })}
              placeholder="e.g. Baby, Sweetheart, My Everything"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] transition-all"
            />
            <p className="text-[11px] text-[var(--text-muted)] font-rounded">
              Greets them warmly across every chapter.
            </p>
          </div>
        </div>

        {/* Relationship Label */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]/60">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
            Relationship Label (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {relationshipOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ relationshipLabel: opt.value })}
                className={`px-4 py-2 rounded-full text-xs font-rounded font-semibold cursor-pointer transition-all ${
                  config.relationshipLabel === opt.value
                    ? "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white shadow-sm"
                    : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--pink-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {config.relationshipLabel === "custom" && (
            <input
              type="text"
              value={config.customRelationshipLabel || ""}
              onChange={(e) => onChange({ customRelationshipLabel: e.target.value })}
              placeholder="Enter your custom relationship title (e.g. Soulmate, Best Friend)"
              className="mt-2 w-full px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
            />
          )}
        </div>

        {/* Website Title & Tagline */}
        <div className="space-y-6 pt-2 border-t border-[var(--border-subtle)]/60">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Website Title
              </label>
              <button
                type="button"
                onClick={() => onChange({ websiteTitle: "Dear, Us" })}
                className="text-[11px] text-[var(--pink-strong)] hover:underline cursor-pointer"
              >
                Use sample: &ldquo;Dear, Us&rdquo;
              </button>
            </div>
            <input
              type="text"
              value={config.websiteTitle}
              onChange={(e) => onChange({ websiteTitle: e.target.value })}
              placeholder="e.g. Dear, Us or A Little Universe of You & Me"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] transition-all font-serif font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
                Opening Message / Tagline
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    tagline: "A little world, made of us. ♡",
                    openingLine: "For my favorite person, and the little universe we keep creating together.",
                  })
                }
                className="text-[11px] text-[var(--pink-strong)] hover:underline cursor-pointer"
              >
                Use sample default
              </button>
            </div>
            <textarea
              rows={3}
              value={config.openingLine}
              onChange={(e) => onChange({ openingLine: e.target.value })}
              placeholder="For my favorite person, and the little universe we keep creating together..."
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] transition-all"
            />
          </div>
        </div>

        {/* Date, Language & Signature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-subtle)]/60">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
              Special Date (e.g. Anniversary or First Met)
            </label>
            <input
              type="date"
              value={config.anniversaryDate || ""}
              onChange={(e) => onChange({ anniversaryDate: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)]"
            />
            <p className="text-[11px] text-[var(--text-muted)] font-rounded">
              Powers your live relationship counter in the finale.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-rounded">
              Closing Signature
            </label>
            <input
              type="text"
              value={config.closingSignature || ""}
              onChange={(e) => onChange({ closingSignature: e.target.value })}
              placeholder="e.g. Forever yours, Babe ♡"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pink-strong)] font-handwritten text-lg"
            />
            <p className="text-[11px] text-[var(--text-muted)] font-rounded">
              Appears at the very end of your final letter.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-sm font-rounded font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all inline-flex items-center gap-2"
        >
          <span>Continue to Chapter Selection →</span>
        </button>
      </div>
    </div>
  );
}
