"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { DateProposal } from "@/lib/server-db";

interface DateCountdownBannerProps {
  proposals: DateProposal[];
  onViewEvent?: (proposal: DateProposal) => void;
  onExploreIdeas?: () => void;
}

export function DateCountdownBanner({
  proposals,
  onViewEvent,
  onExploreIdeas,
}: DateCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isToday: boolean;
  } | null>(null);

  // Find nearest upcoming confirmed proposal
  const upcomingConfirmed = useMemo(() => {
    return proposals
      .filter((p) => p.status === "confirmed" && p.proposedDate)
      .map((p) => {
        const dateStr = `${p.proposedDate}T${p.proposedStartTime || "18:00"}:00`;
        const eventTime = new Date(dateStr).getTime();
        return { proposal: p, eventTime };
      })
      .filter((item) => !isNaN(item.eventTime))
      .sort((a, b) => a.eventTime - b.eventTime)[0];
  }, [proposals]);

  const targetEventTime = upcomingConfirmed?.eventTime;

  useEffect(() => {
    if (!targetEventTime) {
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetEventTime - now;

      if (difference <= 0) {
        // Happening today or past
        const isToday = Math.abs(difference) < 86400000;
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: !isToday,
          isToday: isToday,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        isToday: days === 0,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetEventTime]);

  if (!upcomingConfirmed || !timeLeft) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white/95 via-[var(--bg-surface)] to-white/95 border border-[var(--border-subtle)] shadow-[var(--shadow-pink)] text-center my-6">
        <div className="max-w-lg mx-auto space-y-3">
          <span className="text-3xl inline-block animate-pulse-soft">✨</span>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            No upcoming date planned yet ♡
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Every great memory begins with a tiny spark. Explore our date ideas or assemble the perfect itinerary together!
          </p>
          {onExploreIdeas && (
            <div className="pt-2">
              <button
                onClick={onExploreIdeas}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>💡</span>
                <span>Explore Date Ideas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const proposal = upcomingConfirmed.proposal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-[var(--bg-surface)] to-[var(--pale-rose)] border border-[var(--pink-primary)]/30 shadow-[var(--shadow-pink-strong)] my-6"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[var(--glow-pink)]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-[var(--lavender)]/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Event Details */}
        <div className="text-center md:text-left space-y-2 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[var(--pink-primary)]/30 text-xs font-semibold text-[var(--pink-strong)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONFIRMED ADVENTURE</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {proposal.title}
          </h3>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span>🗓️ {proposal.proposedDate} at {proposal.proposedStartTime}</span>
            {proposal.itinerary[0]?.location && (
              <span>📍 {proposal.itinerary[0].location}</span>
            )}
            <span>⏳ {proposal.totalEstimatedDurationMinutes} mins</span>
          </p>

          {proposal.personalMessage && (
            <p className="font-script text-lg text-[var(--pink-strong)] italic pt-1">
              &ldquo;{proposal.personalMessage}&rdquo;
            </p>
          )}
        </div>

        {/* Right: Live Countdown Counter */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-script text-xl text-[var(--pink-deep)] font-medium">
            {timeLeft.isToday
              ? "Our adventure is today! ♡"
              : timeLeft.isPast
              ? "Adventure completed! Save your memories ♡"
              : `Only ${timeLeft.days} days until our next adventure ♡`}
          </p>

          {!timeLeft.isPast && (
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { label: "DAYS", value: timeLeft.days },
                { label: "HOURS", value: timeLeft.hours },
                { label: "MINS", value: timeLeft.minutes },
                { label: "SECS", value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="w-14 sm:w-16 py-2 sm:py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[var(--border-medium)] shadow-xs text-center"
                >
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[var(--pink-strong)] leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-wider text-[var(--text-muted)] font-semibold mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {onViewEvent && (
            <button
              onClick={() => onViewEvent(proposal)}
              className="mt-1 px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--pink-deep)] bg-white border border-[var(--border-subtle)] hover:bg-[var(--pale-rose)] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>View Itinerary & Checklist</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
