"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { GiftRecord } from "@/lib/server-db";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftRecord;
  onTogglePublish: (publish: boolean) => Promise<boolean>;
  onUpdateSlug: (newSlug: string) => Promise<boolean>;
}

export function PublishModal({
  isOpen,
  onClose,
  gift,
  onTogglePublish,
  onUpdateSlug,
}: PublishModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [customSlug, setCustomSlug] = useState(gift.slug);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const giftUrl = `${origin}/gift/${gift.slug}`;
  const inviteUrl = `${origin}/?invite=${gift.privacy.recipientInviteToken}`;

  const isPublished = gift.status === "published";

  const handleCopy = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handlePublishClick = async (publish: boolean) => {
    setErrorMsg(null);
    setIsPublishing(true);
    const ok = await onTogglePublish(publish);
    setIsPublishing(false);
    if (!ok) {
      setErrorMsg("Failed to update publishing status. Please ensure title and recipient are set.");
    }
  };

  const handleSaveSlug = async () => {
    if (!customSlug.trim()) return;
    const ok = await onUpdateSlug(customSlug.trim().toLowerCase());
    if (ok) {
      setIsEditingSlug(false);
    } else {
      setErrorMsg("This slug is already taken. Please choose another.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 border border-[var(--border-subtle)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Publish & Share Gift
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Make your romantic gift live for your partner.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              isPublished
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span>{isPublished ? "Gift is Live & Published! 🎉" : "Gift is Currently in Private Draft Mode 📝"}</span>
              </span>
              <p className="text-[11px] opacity-90">
                {isPublished
                  ? `Published on ${new Date(gift.publishedAt || gift.updatedAt).toLocaleDateString()} — ready to share with ${gift.recipientNickname || gift.recipientName}!`
                  : "Only you can preview this gift right now. When you're ready, click Publish below."}
              </p>
            </div>

            <button
              onClick={() => handlePublishClick(!isPublished)}
              disabled={isPublishing}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0 ${
                isPublished
                  ? "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
                  : "bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white hover:shadow-md"
              }`}
            >
              {isPublishing ? "Updating..." : isPublished ? "Unpublish Gift" : "Publish Gift Now ♡"}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Sharing Link Box (When Published) */}
          {isPublished && (
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[var(--pink-strong)] tracking-wider uppercase text-[10px] block">
                  Dedicated Romantic Gift URL:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={giftUrl}
                    className="flex-1 p-2.5 rounded-xl border border-[var(--border-medium)] bg-white text-xs font-mono text-[var(--text-secondary)] select-all truncate"
                  />
                  <button
                    onClick={() => handleCopy(giftUrl)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[var(--border-subtle)] font-bold text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] cursor-pointer shadow-xs shrink-0"
                  >
                    {copiedLink ? "✓ Copied!" : "📋 Copy Link"}
                  </button>
                </div>
              </div>

              {/* Seamless Recipient Token Link */}
              <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-primary)] block">
                  Direct Magic Recipient Link (No login needed):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 p-2.5 rounded-xl border border-[var(--border-subtle)] bg-white text-xs font-mono text-[var(--text-muted)] select-all truncate"
                  />
                  <button
                    onClick={() => handleCopy(inviteUrl)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer text-xs shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Custom Slug Editor */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Custom URL Path: /gift/<strong>{gift.slug}</strong></span>
                {!isEditingSlug ? (
                  <button
                    onClick={() => setIsEditingSlug(true)}
                    className="text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer font-medium"
                  >
                    Customize Slug
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[var(--border-medium)] bg-white text-xs font-mono w-32"
                    />
                    <button
                      onClick={handleSaveSlug}
                      className="px-2.5 py-1 rounded-lg bg-[var(--pink-strong)] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingSlug(false)}
                      className="px-2 py-1 text-xs text-[var(--text-muted)] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sharing Tips */}
          <div className="p-4 rounded-2xl bg-[var(--warm-cream)] border border-[#EFE5D8] space-y-2 text-xs text-[var(--text-secondary)]">
            <h5 className="font-bold text-[#8A7561] uppercase tracking-wider text-[10px]">
              How to Surprise Your Partner ♡
            </h5>
            <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
              <li>Send the link via message: &ldquo;I made a tiny digital universe just for you. Open this when you have a quiet moment 💕&rdquo;</li>
              <li>When they open the link, the animated envelope opening will greet them with your personal welcome note!</li>
              <li>They can leave love reactions, reply to notes, answer your questionnaire, and collaborate on date ideas without signing up.</li>
            </ul>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
