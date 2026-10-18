"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

import { scrollToChapter } from "@/lib/motion";

export interface NavItem {
  id: string;
  label: string;
  emoji: string;
}

const defaultNavItems: NavItem[] = [
  { id: "welcome", label: "You & Me", emoji: "🧸" },
  { id: "observations", label: "Things I Noticed", emoji: "👀" },
  { id: "memories", label: "Polaroid Scrapbook", emoji: "📸" },
  { id: "secretWorld", label: "Secret World", emoji: "🔒" },
  { id: "deluluMode", label: "Delulu Mode", emoji: "🦋" },
  { id: "quiz", label: "Do You Love Me?", emoji: "💖" },
  { id: "letters", label: "Love Letters", emoji: "💌" },
  { id: "notebook", label: "Our Notebook", emoji: "📖" },
  { id: "voice", label: "Voice Whispers", emoji: "🎙️" },
  { id: "datePlanner", label: "Date Planner", emoji: "🗺️" },
  { id: "openWhenLetters", label: "Open When...", emoji: "✉️" },
  { id: "littleReasons", label: "Why I Love You", emoji: "💗" },
  { id: "digitalGifts", label: "Gifts For You", emoji: "🎁" },
  { id: "ourSong", label: "Our Song", emoji: "🎵" },
  { id: "finalHeart", label: "Heart Collage", emoji: "❤️" },
];

interface GiftNavigationProps {
  items?: NavItem[];
  onOpenCreatorStudio?: () => void;
  onOpenAccessModal?: () => void;
}

export function GiftNavigation({
  items = defaultNavItems,
  onOpenCreatorStudio,
  onOpenAccessModal,
}: GiftNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [participantRole, setParticipantRole] = useState<string>("recipient");
  const [participantName, setParticipantName] = useState<string>("Baby");
  const [activeSectionId, setActiveSectionId] = useState<string>("welcome");

  useEffect(() => {
    const updateRole = () => {
      const role = localStorage.getItem("gift_participant_role") || "recipient";
      const name = localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
      setParticipantRole(role);
      setParticipantName(name);
    };
    updateRole();
    window.addEventListener("storage", updateRole);
    return () => window.removeEventListener("storage", updateRole);
  }, []);

  // Frontend-only active chapter scroll tracking with IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScrollBoundary = () => {
      const scrollPos = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollPos < 160) {
        setActiveSectionId("welcome");
      } else if (scrollPos + clientHeight >= scrollHeight - 140) {
        setActiveSectionId("finalHeart");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
          );
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -50% 0px",
        threshold: [0, 0.2, 0.5],
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", handleScrollBoundary, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollBoundary);
    };
  }, [items]);

  // When drawer opens, smoothly bring the active item into view inside the drawer panel
  useEffect(() => {
    if (isOpen && activeSectionId) {
      const timer = setTimeout(() => {
        const activeEl = document.getElementById(`nav-item-${activeSectionId}`);
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeSectionId]);

  const scrollToSection = (id: string) => {
    scrollToChapter(id);
    setActiveSectionId(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Floating Badge for Active Participant */}
      <div className="fixed top-5 left-5 z-40 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-[var(--shadow-pink)] text-xs text-[var(--text-secondary)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Active:</span>
        <span className="font-semibold text-[var(--pink-strong)]">
          {participantName} ({participantRole === "creator" ? "Creator" : "Recipient"})
        </span>
        {onOpenAccessModal && (
          <button
            onClick={onOpenAccessModal}
            className="text-[11px] text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer ml-1 font-medium"
          >
            Switch
          </button>
        )}
      </div>

      {/* Fixed nav toggle button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 right-5 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: isOpen
            ? "var(--pink-primary)"
            : "linear-gradient(135deg, var(--white) 0%, var(--pale-rose) 100%)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 20px var(--shadow-pink)",
        }}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-white text-lg font-bold"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="heart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-xl"
            >
              💕
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Navigation overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-[rgba(73,50,63,0.35)] backdrop-blur-xs"
            />

            {/* Nav panel */}
            <motion.nav
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] z-45 overflow-y-auto py-12 px-6 bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <p className="font-script text-3xl text-[var(--pink-strong)]">
                      Our Little World ✨
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Jump to any chapter of our love
                    </p>
                  </div>
                </div>

                {/* Participant badge in drawer */}
                <div className="mb-4 p-2.5 rounded-2xl bg-white/80 border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Signed in as</span>
                    <span className="font-semibold text-[var(--pink-strong)]">
                      {participantName} ({participantRole === "creator" ? "Creator" : "Recipient"})
                    </span>
                  </div>
                  {onOpenAccessModal && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenAccessModal();
                      }}
                      className="px-2.5 py-1 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-[11px] font-semibold hover:bg-[var(--bg-blush)] cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {items.map((item, i) => {
                    const isActive = activeSectionId === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        id={`nav-item-${item.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer group ${
                          isActive
                            ? "bg-gradient-to-r from-[var(--pale-rose)] to-white border border-[var(--pink-primary)]/40 shadow-xs text-[var(--pink-strong)] font-semibold"
                            : "hover:bg-[var(--pale-rose)] text-[var(--text-primary)]"
                        }`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-base transition-transform duration-200 ${isActive ? "scale-115" : "group-hover:scale-115"}`}>
                            {item.emoji}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium ${isActive ? "text-[var(--pink-strong)] font-bold" : "group-hover:text-[var(--pink-deep)]"}`}>
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wider text-[var(--pink-strong)] flex items-center gap-1.5 font-rounded font-bold bg-white/80 px-2 py-0.5 rounded-full border border-[var(--pink-primary)]/20 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink-strong)] animate-pulse" />
                            <span>Here</span>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Studio Action */}
              <div className="pt-5 border-t border-[var(--border-subtle)] text-center space-y-3">
                {onOpenCreatorStudio && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenCreatorStudio();
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl border border-[var(--pink-primary)] bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--bg-blush)] cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>✏️</span>
                    <span>Quick Response Drawer</span>
                  </button>
                )}
                <Link
                  href="/studio"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-primary)] text-white text-xs font-semibold hover:opacity-95 cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>🚀</span>
                  <span>Open Full Creator Studio</span>
                </Link>
                <p className="font-script text-lg text-[var(--pink-strong)]">
                  Made with endless love ♡
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
