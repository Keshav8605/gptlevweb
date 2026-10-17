"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import type { JournalEntry } from "@/lib/server-db";

const notebookPrompts = [
  "Something that made me think of you today",
  "One thing I deeply appreciate about us",
  "A memory I never want to forget",
  "Something I've been wanting to tell you",
  "One tiny thing that made me smile today",
  "A little question just for you",
];

const moodEmojis = ["🤍", "✨", "🥺", "🥰", "☕", "🌙", "🌻", "💌"];

interface NotebookSectionProps {
  currentUserRole?: "creator" | "recipient";
  currentUserName?: string;
  onOpenAccessModal?: () => void;
}

export function NotebookSection({
  currentUserRole,
  currentUserName,
  onOpenAccessModal,
}: NotebookSectionProps) {
  const [role, setRole] = useState<"creator" | "recipient">(() => {
    if (typeof window === "undefined") return currentUserRole || "recipient";
    return currentUserRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
  });
  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") return currentUserName || "Baby";
    return currentUserName || localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
  });

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New entry form state
  const [isComposing, setIsComposing] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState("🤍");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active reply input state: entryId -> text
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      const savedRole = currentUserRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
      setRole(savedRole);
      setName(currentUserName || localStorage.getItem("gift_participant_name") || (savedRole === "creator" ? "Babe" : "Baby"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [currentUserRole, currentUserName]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/notebook")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.entries) setEntries(data.entries);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entryTitle.trim(),
          content: entryContent.trim(),
          prompt: selectedPrompt || undefined,
          moodEmoji: selectedMood,
          role,
          name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setEntryTitle("");
        setEntryContent("");
        setSelectedPrompt(null);
        setSelectedMood("🤍");
        setIsComposing(false);
      }
    } catch {}
    finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (entryId: string) => {
    const text = replyDrafts[entryId]?.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          entryId,
          content: text,
          role,
          name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setEntries((prev) =>
          prev.map((item) =>
            item.id === entryId
              ? { ...item, replies: [...item.replies, data.reply] }
              : item
          )
        );
        setReplyDrafts((prev) => ({ ...prev, [entryId]: "" }));
        setActiveReplyId(null);
      }
    } catch {}
  };

  const handleToggleReaction = async (entryId: string, emoji: string) => {
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          entryId,
          emoji,
          role,
          name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reactions) {
        setEntries((prev) =>
          prev.map((item) =>
            item.id === entryId ? { ...item, reactions: data.reactions } : item
          )
        );
      }
    } catch {}
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to remove this journal entry?")) return;
    try {
      const res = await fetch(`/api/notebook?id=${entryId}&role=${role}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((item) => item.id !== entryId));
      }
    } catch {}
  };

  return (
    <SectionWrapper
      id="notebook"
      title="Our Little Notebook"
      subtitle="A quiet, shared journal where we leave thoughts, memories, and whispered notes for each other"
      emoji="📝"
      bgVariant="cream"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Cozy notebook journal companion */}
        <div className="flex justify-center -mt-3 mb-6">
          <RomanticCharacter
            character="cozyCouple"
            size={135}
            animation="soft-breathe"
            sparkles
          />
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
              Shared Couple&apos;s Diary
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[var(--text-muted)]">
                Writing as: <strong className="text-[var(--text-primary)]">{name}</strong> ({role === "creator" ? "Creator" : "Recipient"})
              </p>
              {onOpenAccessModal && (
                <button
                  onClick={onOpenAccessModal}
                  className="text-xs text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer font-medium"
                >
                  Switch
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsComposing(!isComposing)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>{isComposing ? "✕ Close Journal" : "✎ Write an Entry"}</span>
          </button>
        </div>

        {/* Entry Composer */}
        <AnimatePresence>
          {isComposing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateEntry}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--border-medium)] shadow-[0_8px_30px_var(--shadow-pink)] space-y-5 relative overflow-hidden"
            >
              <div>
                <h4 className="font-serif text-2xl font-semibold text-[var(--text-primary)] mb-1">
                  New Journal Entry
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Pick a prompt or write whatever is on your heart today.
                </p>
              </div>

              {/* Prompts Carousel Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Optional Romantic Prompts:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {notebookPrompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(selectedPrompt === p ? null : p);
                        if (!entryTitle) setEntryTitle(p);
                      }}
                      className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                        selectedPrompt === p
                          ? "bg-[var(--pale-rose)] border-[var(--pink-strong)] text-[var(--pink-deep)] font-semibold"
                          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--pale-rose)]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood & Title Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mood Picker */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-x-auto">
                  {moodEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedMood(emoji)}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        selectedMood === emoji
                          ? "bg-white shadow-xs scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Optional title or theme..."
                  className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)]"
                />
              </div>

              {/* Entry Body */}
              <div>
                <textarea
                  required
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  placeholder="Pour your thoughts out here..."
                  rows={5}
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)] resize-none leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!entryContent.trim() || isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] shadow-xs hover:shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving to Journal..." : "Save Entry to Our Diary ♡"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Entries Chronological Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)] animate-pulse">
              Opening our shared diary...
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[var(--border-subtle)] space-y-3">
              <span className="text-4xl block">📖</span>
              <h4 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                Our diary is waiting for its first page
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Leave a sweet thought, a memory from today, or a secret note for your partner to discover.
              </p>
              <button
                onClick={() => setIsComposing(true)}
                className="mt-2 px-6 py-2.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--bg-blush)] cursor-pointer"
              >
                Write First Entry ♡
              </button>
            </div>
          ) : (
            entries.map((entry) => {
              const isOwner = entry.author === currentUserRole || currentUserRole === "creator";
              const isReplying = activeReplyId === entry.id;

              return (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 sm:p-9 border border-[var(--border-subtle)] shadow-[0_4px_24px_var(--shadow-pink)] space-y-4 relative overflow-hidden"
                >
                  {/* Top Entry Metadata */}
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{entry.moodEmoji || "🤍"}</span>
                      <div>
                        <span className="font-bold text-xs text-[var(--pink-deep)] block">
                          {entry.authorName} {entry.author === "creator" ? "✏️" : "♡"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Delete entry"
                          className="text-xs text-[var(--text-muted)] hover:text-rose-500 cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Prompt Chip */}
                  {entry.prompt && (
                    <div className="inline-block px-3 py-1 rounded-full bg-[var(--warm-cream)] border border-[var(--border-subtle)] text-[11px] text-[var(--pink-strong)] italic">
                      Prompt: {entry.prompt}
                    </div>
                  )}

                  {/* Title */}
                  {entry.title && (
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                      {entry.title}
                    </h4>
                  )}

                  {/* Content */}
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {/* Reactions & Replies Bar */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      {["❤️", "🥺", "🥰", "✨"].map((emoji) => {
                        const reactors = entry.reactions?.[emoji] || [];
                        const hasReacted = reactors.includes(name);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(entry.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                              hasReacted
                                ? "bg-[var(--pale-rose)] border-[var(--pink-strong)] text-[var(--pink-deep)] scale-105"
                                : "bg-white border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                            }`}
                          >
                            <span>{emoji}</span>
                            {reactors.length > 0 && <span className="text-[10px] font-bold">{reactors.length}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setActiveReplyId(isReplying ? null : entry.id)}
                      className="text-xs font-semibold text-[var(--pink-strong)] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>💬</span>
                      <span>{entry.replies.length > 0 ? `Replies (${entry.replies.length})` : "Reply Back"}</span>
                    </button>
                  </div>

                  {/* Replies Thread */}
                  {entry.replies && entry.replies.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                      {entry.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-3.5 rounded-2xl bg-[var(--bg-surface)]/70 border border-[var(--border-subtle)] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-[11px] text-[var(--pink-deep)]">
                            <span>{reply.authorName} {reply.author === "creator" ? "✏️" : "♡"}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-normal">
                              {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-[var(--text-primary)] italic leading-relaxed">
                            &ldquo;{reply.content}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  <AnimatePresence>
                    {isReplying && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 flex gap-2"
                      >
                        <input
                          type="text"
                          value={replyDrafts[entry.id] || ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
                          }
                          placeholder={`Write a reply as ${currentUserName}...`}
                          className="flex-1 text-xs p-3 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)]"
                        />
                        <button
                          onClick={() => handleAddReply(entry.id)}
                          className="px-4 py-2 rounded-2xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer"
                        >
                          Send ♡
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
