"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { ContentReaction, ContentComment } from "@/lib/server-db";

interface SharedInteractionsProps {
  targetType: "observation" | "memory" | "letter" | "openWhen";
  targetId: string;
  currentUserRole?: "creator" | "recipient";
  currentUserName?: string;
  accentColor?: string;
}

const reactionEmojis = ["❤️", "🥺", "🥰", "😂", "✨"];

export function SharedInteractions({
  targetType,
  targetId,
  currentUserRole,
  currentUserName,
}: SharedInteractionsProps) {
  const [role, setRole] = useState<"creator" | "recipient">(() => {
    if (typeof window === "undefined") return currentUserRole || "recipient";
    return currentUserRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
  });
  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") return currentUserName || "Baby";
    return currentUserName || localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
  });

  const [reactions, setReactions] = useState<ContentReaction[]>([]);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      const savedRole = currentUserRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
      setRole(savedRole);
      setName(currentUserName || localStorage.getItem("gift_participant_name") || (savedRole === "creator" ? "Babe" : "Baby"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [currentUserRole, currentUserName]);

  // Fetch reactions and comments from server
  useEffect(() => {
    fetch(`/api/interactions/reactions?targetType=${targetType}&targetId=${targetId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reactions) setReactions(data.reactions);
      })
      .catch(() => {});

    fetch(`/api/interactions/comments?targetType=${targetType}&targetId=${targetId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) setComments(data.comments);
      })
      .catch(() => {});
  }, [targetType, targetId]);

  const handleToggleReaction = async (emoji: string) => {
    try {
      const res = await fetch("/api/interactions/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          emoji,
          role,
          name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reactions) {
        setReactions(data.reactions);
      }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/interactions/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          content: commentText.trim(),
          role,
          name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        setIsCommenting(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch {}
    finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/interactions/comments?id=${commentId}&role=${role}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {}
  };

  // Group reactions by emoji (keep 3 for letter / clean aesthetic)
  const availableEmojis = targetType === "letter" ? ["❤️", "🥺", "🥰"] : reactionEmojis;
  const groupedReactions = availableEmojis.map((emoji) => {
    const list = reactions.filter((r) => r.emoji === emoji);
    const hasReacted = list.some((r) => r.author === role);
    return {
      emoji,
      count: list.length,
      hasReacted,
      authors: list.map((r) => r.authorName),
    };
  });

  return (
    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
      {/* Reactions Bar */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {targetType === "letter" && (
            <span className="text-[11px] font-rounded font-semibold text-[var(--pink-deep)] mr-1">
              Leave a little heart:
            </span>
          )}
          {groupedReactions.map((item) => (
            <button
              key={item.emoji}
              onClick={() => handleToggleReaction(item.emoji)}
              title={item.authors.length > 0 ? `Reacted by ${item.authors.join(", ")}` : "Leave a little heart"}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                item.hasReacted
                  ? "bg-[var(--pale-rose)] border-[var(--pink-strong)] text-[var(--pink-deep)] shadow-xs scale-105"
                  : "bg-white border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              <span>{item.emoji}</span>
              {item.count > 0 && <span className="text-[11px] font-bold">{item.count}</span>}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCommenting(!isCommenting)}
          className="text-xs font-semibold text-[var(--pink-strong)] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>💬</span>
          <span>{comments.length > 0 ? `Notes (${comments.length})` : "Leave a note for me"}</span>
        </button>
      </div>

      {/* Existing Comments Thread */}
      {comments.length > 0 && (
        <div className="space-y-2 pt-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-2xl bg-[var(--bg-surface)]/70 border border-[var(--border-subtle)] text-xs space-y-1 relative group"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[var(--pink-deep)]">
                  {c.authorName} {c.author === "creator" ? "✏️" : "♡"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {(c.author === currentUserRole || currentUserRole === "creator") && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      title="Delete note"
                      className="text-[10px] text-rose-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[var(--text-primary)] leading-relaxed italic">
                &ldquo;{c.content}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Input Form */}
      <AnimatePresence>
        {isCommenting && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddComment}
            className="space-y-2 pt-1"
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Write a personal note as ${currentUserName}...`}
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-white text-[var(--text-primary)] resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCommenting(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isSubmitting ? "Sending..." : "Post Note ♡"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Saved State Confirmation */}
      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-2.5 rounded-xl bg-[var(--pale-rose)]/70 border border-pink-200 text-[var(--pink-deep)] text-xs text-center font-medium font-rounded"
        >
          Tucked safely into our story ♡
        </motion.div>
      )}
    </div>
  );
}
