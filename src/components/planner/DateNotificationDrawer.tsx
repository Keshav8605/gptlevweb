"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DateNotification, NotificationSettings } from "@/lib/server-db";

interface DateNotificationDrawerProps {
  notifications: DateNotification[];
  unreadCount: number;
  onMarkRead: (ids: string[] | "all") => void;
  onSelectNotification?: (notif: DateNotification) => void;
  settings?: NotificationSettings;
  onUpdateSettings?: (settings: Partial<NotificationSettings>) => void;
}

export function DateNotificationDrawer({
  notifications,
  unreadCount,
  onMarkRead,
  onSelectNotification,
  settings,
  onUpdateSettings,
}: DateNotificationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getEmojiForType = (type: DateNotification["type"]) => {
    switch (type) {
      case "new_proposal":
        return "💌";
      case "proposal_accepted":
        return "🎉";
      case "changes_requested":
        return "💬";
      case "rescheduled":
        return "🗓️";
      case "cancelled":
        return "💔";
      case "upcoming_reminder":
        return "⏰";
      case "post_date_memory_prompt":
        return "📸";
      default:
        return "✨";
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 sm:px-3 sm:py-2 rounded-full bg-white/90 border border-[var(--border-subtle)] hover:border-[var(--pink-primary)] hover:bg-[var(--pale-rose)] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]"
        aria-label="Romantic Notifications"
      >
        <span className="text-base">🔔</span>
        <span className="hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-deep)] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Notification Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-[var(--bg-main)] h-full shadow-2xl flex flex-col z-10 border-l border-[var(--border-subtle)]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border-subtle)] bg-white/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                      Couple Reminders & Alerts
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--pink-strong)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer"
                    title="Notification Preferences"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Notification Preferences Drawer View */}
              {isSettingsOpen && settings && onUpdateSettings && (
                <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--pink-strong)] uppercase tracking-wider">
                    Reminder Preferences
                  </h4>
                  <div className="space-y-2 text-xs text-[var(--text-primary)]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Upcoming date countdown alerts</span>
                      <input
                        type="checkbox"
                        checked={settings.upcomingReminders}
                        onChange={(e) => onUpdateSettings({ upcomingReminders: e.target.checked })}
                        className="rounded accent-[var(--pink-primary)] w-4 h-4 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>New proposal & negotiation alerts</span>
                      <input
                        type="checkbox"
                        checked={settings.proposalAlerts}
                        onChange={(e) => onUpdateSettings({ proposalAlerts: e.target.checked })}
                        className="rounded accent-[var(--pink-primary)] w-4 h-4 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Post-date memory prompts</span>
                      <input
                        type="checkbox"
                        checked={settings.memoryPrompts}
                        onChange={(e) => onUpdateSettings({ memoryPrompts: e.target.checked })}
                        className="rounded accent-[var(--pink-primary)] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <span className="text-4xl block">💌</span>
                    <p className="font-serif text-base text-[var(--text-secondary)]">
                      All caught up!
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      You will receive sweet notifications here when a date is proposed, accepted, or approaching.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) onMarkRead([notif.id]);
                        if (onSelectNotification) onSelectNotification(notif);
                        setIsOpen(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        notif.isRead
                          ? "bg-white/70 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white"
                          : "bg-white border-[var(--border-medium)] shadow-[var(--shadow-pink)] text-[var(--text-primary)] hover:border-[var(--pink-primary)]"
                      }`}
                    >
                      {!notif.isRead && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--pink-primary)]" />
                      )}

                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{getEmojiForType(notif.type)}</span>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-sm font-semibold leading-tight">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] block pt-1">
                            {new Date(notif.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-[var(--border-subtle)] bg-white/90 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onMarkRead("all")}
                    className="text-[var(--pink-strong)] hover:underline cursor-pointer font-medium"
                  >
                    Mark all as read
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)] italic">
                    In-app alerts are active 💖
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
