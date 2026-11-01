"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import { getResponsiveCardGridLayout } from "@/lib/layout-utils";
import type { DigitalGift } from "@/lib/gift-data";

export interface ClaimRecord {
  giftId: string;
  claimedAt: string;
  redemptionNote?: string;
}

export const defaultGiftsList: DigitalGift[] = [
  {
    id: "g1",
    title: "One really good hug",
    description: "Available whenever you need one. No rushing, no clock-watching. Just a hug until you feel a little better.",
    emoji: "🤗",
  },
  {
    id: "g2",
    title: "A movie night, your way",
    description: "You choose the movie, the snacks, and the blanket arrangement. I'll try not to complain about your choice. Much.",
    emoji: "🎬",
  },
  {
    id: "g3",
    title: "Your favorite treat",
    description: "That one snack or dessert you've been craving? Consider it a little mission for me.",
    emoji: "🧁",
  },
  {
    id: "g4",
    title: "A day planned entirely for you",
    description: "You tell me what kind of day your heart wants. I'll take care of the little details.",
    emoji: "👑",
  },
  {
    id: "g5",
    title: "An uninterrupted us day",
    description: "Phones away, distractions down, and time to be together without rushing anywhere.",
    emoji: "📵",
  },
  {
    id: "g6",
    title: "A surprise date",
    description: "Give me a little hint about your mood, and let me plan something thoughtful for us.",
    emoji: "🎁",
  },
  {
    id: "g7",
    title: "Breakfast in bed",
    description: "Your favorite breakfast, made with love and served with a side of morning kisses.",
    emoji: "🥞",
  },
  {
    id: "g8",
    title: "One slow dance",
    description: "Our favorite song, a little space in the living room, and absolutely no need to know how to dance.",
    emoji: "💃",
  },
  {
    id: "g9",
    title: "A relaxing massage",
    description: "Dim lights, soothing music, and as long as you need to let every bit of stress and tension melt away.",
    emoji: "💆",
  },
];

interface DigitalGiftsSectionProps {
  gifts?: DigitalGift[];
}

export function DigitalGiftsSection({ gifts = defaultGiftsList }: DigitalGiftsSectionProps) {
  const activeGifts = gifts.length > 0 ? gifts : defaultGiftsList;

  // Stored claims: giftId -> ClaimRecord
  const [claims, setClaims] = useState<Record<string, ClaimRecord>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("gift_digital_vouchers_claims");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Stored fulfillment records: giftId -> string (date)
  const [fulfilledMap, setFulfilledMap] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("gift_digital_vouchers_fulfilled");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeClaimModalGift, setActiveClaimModalGift] = useState<DigitalGift | null>(null);
  const [redemptionNote, setRedemptionNote] = useState("");
  const [celebrationGift, setCelebrationGift] = useState<DigitalGift | null>(null);

  const handleOpenClaimModal = (gift: DigitalGift) => {
    // Idempotent: cannot claim if already claimed
    if (claims[gift.id]) return;
    setActiveClaimModalGift(gift);
    setRedemptionNote("");
  };

  const handleConfirmClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimModalGift) return;

    const giftId = activeClaimModalGift.id;
    if (claims[giftId]) return; // prevent duplicate claim

    const newClaim: ClaimRecord = {
      giftId,
      claimedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      redemptionNote: redemptionNote.trim() || undefined,
    };

    const updated = {
      ...claims,
      [giftId]: newClaim,
    };

    setClaims(updated);
    try {
      localStorage.setItem("gift_digital_vouchers_claims", JSON.stringify(updated));
    } catch {}

    setCelebrationGift(activeClaimModalGift);
    setActiveClaimModalGift(null);
    setRedemptionNote("");

    setTimeout(() => {
      setCelebrationGift(null);
    }, 2500);
  };

  const handleToggleFulfilled = (giftId: string) => {
    const isCurrentlyFulfilled = !!fulfilledMap[giftId];
    const updated = { ...fulfilledMap };
    if (isCurrentlyFulfilled) {
      delete updated[giftId];
    } else {
      updated[giftId] = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    setFulfilledMap(updated);
    try {
      localStorage.setItem("gift_digital_vouchers_fulfilled", JSON.stringify(updated));
    } catch {}
  };

  const claimedCount = Object.keys(claims).length;

  return (
    <SectionWrapper
      id="digitalGifts"
      eyebrowLabel="A FEW LITTLE PROMISES"
      title="Little Gifts, Just for You"
      subtitle="A few things I'd love to do for you. No expiry date, just love."
      emoji="🎁"
      bgVariant="cream"
      chapterNumber={13}
      nextSectionId="ourSong"
      nextSectionLabel="Play our song 🎵"
      nextSectionSubtitle="One last thing before the final surprise: there's a song that makes me think of you."
      nextSectionEmoji="🎵"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Affectionate Gift Character Companion */}
        <div className="flex justify-center -mt-3 mb-6">
          <RomanticCharacter
            character="huggingCouple"
            size={180}
            animation="subtle-tilt"
            sparkles
          />
        </div>

        {/* Claimed counter badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold shadow-xs">
            <span>🎁</span>
            <span>
              {claimedCount} of {activeGifts.length} little promises claimed
            </span>
          </span>
        </div>

        {/* Gift Cards Grid */}
        {activeGifts.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white border border-[var(--border-subtle)] p-8">
            <span className="text-4xl block mb-2">🎁</span>
            <p className="font-serif text-lg text-[var(--text-secondary)]">
              All your little promises are waiting here.
            </p>
          </div>
        ) : (
          (() => {
            const layout = getResponsiveCardGridLayout(activeGifts.length);
            return (
              <div className={`${layout.containerClass} gap-6`}>
                {activeGifts.map((gift, i) => {
                  const claim = claims[gift.id];
                  const isClaimed = !!claim;
                  const isFulfilled = !!fulfilledMap[gift.id];
                  const isCelebrating = celebrationGift?.id === gift.id;

                  return (
                    <motion.div
                      key={gift.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      whileHover={!isClaimed ? { y: -5 } : {}}
                      className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden ${
                        isClaimed
                          ? "bg-gradient-to-br from-[var(--pale-rose)] via-[var(--bg-surface)] to-white border-[var(--pink-primary)] shadow-md"
                          : "bg-white border-[var(--border-subtle)] shadow-[0_4px_20px_var(--shadow-pink)] hover:shadow-lg"
                      } ${layout.cardClass}`}
                    >
                  {/* Celebration Sparkle Burst */}
                  <AnimatePresence>
                    {isCelebrating && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center z-20 pointer-events-none p-4"
                      >
                        <div className="text-center space-y-1">
                          <span className="text-4xl block animate-bounce">🎉</span>
                          <span className="font-script text-2xl text-[var(--pink-strong)] block">
                            This one&apos;s yours ♡
                          </span>
                          <span className="font-serif text-xs text-[var(--text-secondary)] block">
                            &ldquo;{celebrationGift.title}&rdquo;
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    {/* Top row: Emoji & Status Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{gift.emoji || "🎁"}</span>
                      {isClaimed ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--pink-strong)] text-white shadow-xs">
                          This one&apos;s yours ♡
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)]">
                          Ready whenever you are
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-2">
                      {gift.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                      {gift.description}
                    </p>
                  </div>

                  {/* Footer Claim Action / Fulfillment Details */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                    {isClaimed ? (
                      <div className="space-y-2">
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-[var(--text-muted)]">
                            Claimed on {claim.claimedAt}
                          </p>
                          {claim.redemptionNote && (
                            <p className="text-xs italic text-[var(--pink-deep)] font-medium">
                              &ldquo;{claim.redemptionNote}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Optional Fulfillment Toggle */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleFulfilled(gift.id)}
                            className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                              isFulfilled
                                ? "bg-emerald-500 text-white shadow-2xs"
                                : "bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--pale-rose)]"
                            }`}
                          >
                            <span>{isFulfilled ? "✓" : "♡"}</span>
                            <span>
                              {isFulfilled
                                ? `Fulfilled on ${fulfilledMap[gift.id]} ✓`
                                : "Mark as fulfilled ♡"}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenClaimModal(gift)}
                        className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                      >
                        I&apos;ll claim this one ♡
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          );
        })()
      )}
      </div>

      {/* Claim Modal with Optional Note */}
      <AnimatePresence>
        {activeClaimModalGift && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveClaimModalGift(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{activeClaimModalGift.emoji || "🎁"}</span>
                  <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                    Claim this promise ♡
                  </h3>
                </div>
                <button
                  onClick={() => setActiveClaimModalGift(null)}
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmClaim} className="space-y-4">
                <div>
                  <p className="font-serif text-lg font-semibold text-[var(--pink-strong)] mb-1">
                    {activeClaimModalGift.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {activeClaimModalGift.description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Add a note to me (optional):
                  </label>
                  <textarea
                    value={redemptionNote}
                    onChange={(e) => setRedemptionNote(e.target.value)}
                    placeholder="e.g. Let's do this tonight! or Can we redeem this Friday?"
                    rows={3}
                    className="w-full text-xs p-3 rounded-2xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none bg-[var(--bg-main)] text-[var(--text-primary)] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveClaimModalGift(null)}
                    className="px-4 py-2 text-xs text-[var(--text-muted)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    I&apos;ll claim this one ♡
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
