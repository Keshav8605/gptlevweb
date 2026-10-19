"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Story } from "@/lib/stories-data";

interface StoryCardProps {
  story: Story;
  onOpen: (storyId: Story["id"]) => void;
}

interface GenreStyle {
  borderHover: string;
  badgeClass: string;
  badgeEmoji: string;
  fallbackGradient: string;
  fallbackEmoji: string;
  taglineClass: string;
  buttonClass: string;
}

const GENRE_STYLES: Record<Story["id"], GenreStyle> = {
  "mafia-romance": {
    borderHover: "border border-rose-900/40 hover:border-rose-500/60 shadow-[0_15px_40px_rgba(190,18,60,0.22)]",
    badgeClass: "bg-rose-950/80 border border-rose-600/40 text-rose-200",
    badgeEmoji: "🥀",
    fallbackGradient: "radial-gradient(circle at center, #3b0717 0%, #0d0407 100%)",
    fallbackEmoji: "🌹",
    taglineClass: "text-rose-300/80",
    buttonClass: "bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white shadow-rose-950/60 hover:shadow-rose-600/30",
  },
  "enemies-to-lovers": {
    borderHover: "border border-teal-900/40 hover:border-sky-500/60 shadow-[0_15px_40px_rgba(14,165,233,0.22)]",
    badgeClass: "bg-sky-950/80 border border-sky-600/40 text-sky-200",
    badgeEmoji: "✨",
    fallbackGradient: "radial-gradient(circle at center, #06283b 0%, #050b12 100%)",
    fallbackEmoji: "🌧️",
    taglineClass: "text-sky-300/80",
    buttonClass: "bg-gradient-to-r from-sky-800 to-sky-600 hover:from-sky-700 hover:to-sky-500 text-white shadow-sky-950/60 hover:shadow-sky-600/30",
  },
  "fantasy-romance": {
    borderHover: "border border-purple-900/40 hover:border-purple-500/60 shadow-[0_15px_40px_rgba(139,92,246,0.25)]",
    badgeClass: "bg-purple-950/80 border border-purple-600/40 text-purple-200",
    badgeEmoji: "🔮",
    fallbackGradient: "radial-gradient(circle at center, #2e1065 0%, #090314 100%)",
    fallbackEmoji: "👑",
    taglineClass: "text-purple-300/80",
    buttonClass: "bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white shadow-purple-950/60 hover:shadow-purple-600/30",
  },
  "campus-romance": {
    borderHover: "border border-amber-900/40 hover:border-amber-500/60 shadow-[0_15px_40px_rgba(217,119,6,0.25)]",
    badgeClass: "bg-amber-950/80 border border-amber-600/40 text-amber-200",
    badgeEmoji: "☕",
    fallbackGradient: "radial-gradient(circle at center, #451a03 0%, #0f0702 100%)",
    fallbackEmoji: "🍂",
    taglineClass: "text-amber-300/80",
    buttonClass: "bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white shadow-amber-950/60 hover:shadow-amber-600/30",
  },
  "celebrity-romance": {
    borderHover: "border border-fuchsia-900/40 hover:border-fuchsia-500/60 shadow-[0_15px_40px_rgba(192,38,211,0.25)]",
    badgeClass: "bg-fuchsia-950/80 border border-fuchsia-600/40 text-fuchsia-200",
    badgeEmoji: "🎤",
    fallbackGradient: "radial-gradient(circle at center, #4a044e 0%, #0d010e 100%)",
    fallbackEmoji: "✨",
    taglineClass: "text-fuchsia-300/80",
    buttonClass: "bg-gradient-to-r from-fuchsia-800 to-fuchsia-600 hover:from-fuchsia-700 hover:to-fuchsia-500 text-white shadow-fuchsia-950/60 hover:shadow-fuchsia-600/30",
  },
  "supernatural-mystery": {
    borderHover: "border border-cyan-900/40 hover:border-cyan-500/60 shadow-[0_15px_40px_rgba(6,182,212,0.25)]",
    badgeClass: "bg-cyan-950/80 border border-cyan-600/40 text-cyan-200",
    badgeEmoji: "🗝️",
    fallbackGradient: "radial-gradient(circle at center, #083344 0%, #020b0f 100%)",
    fallbackEmoji: "🕰️",
    taglineClass: "text-cyan-300/80",
    buttonClass: "bg-gradient-to-r from-cyan-800 to-cyan-600 hover:from-cyan-700 hover:to-cyan-500 text-white shadow-cyan-950/60 hover:shadow-cyan-600/30",
  },
};

export function StoryCard({ story, onOpen }: StoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const style = GENRE_STYLES[story.id] || GENRE_STYLES["mafia-romance"];

  return (
    <motion.article
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`group relative flex flex-col w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${style.borderHover}`}
      style={{
        background: "linear-gradient(180deg, rgba(20, 10, 16, 0.95) 0%, rgba(12, 6, 10, 0.98) 100%)",
      }}
    >
      {/* Upper Portion: Large Artwork */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
        {!imageError ? (
          <Image
            src={story.coverImage}
            alt={story.coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          /* Graceful Fallback if image fails or is loading */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            style={{
              background: style.fallbackGradient,
            }}
          >
            <span className="text-4xl mb-3">{style.fallbackEmoji}</span>
            <p className="font-serif italic text-lg text-rose-200">{story.genre}</p>
          </div>
        )}

        {/* Ambient Top Shadow & Genre Badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e070c] via-transparent to-black/50 pointer-events-none" />

        <div className="absolute top-4 left-4 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-md ${style.badgeClass}`}
          >
            <span className="text-[10px]">{style.badgeEmoji}</span>
            {story.genre}
          </span>
        </div>
      </div>

      {/* Lower Portion: Dark Title & Synopsis Panel */}
      <div className="flex flex-col flex-1 p-6 sm:p-7 relative z-10 -mt-6 rounded-t-3xl bg-gradient-to-b from-[#140a12]/95 to-[#0b0509] backdrop-blur-md border-t border-white/5">
        {/* Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-rose-50 leading-snug tracking-tight group-hover:text-rose-200 transition-colors">
          {story.title}
        </h3>

        {/* Italic Tagline */}
        <p className={`font-serif italic text-xs sm:text-sm mt-1.5 font-medium ${style.taglineClass}`}>
          {story.tagline}
        </p>

        {/* Delicate Ornamental Divider */}
        <div className="flex items-center justify-center gap-3 my-4 opacity-60">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-400/50" />
          <span className="text-rose-400/80 text-xs">✦ ❖ ✦</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-400/50" />
        </div>

        {/* Synopsis (~4-5 lines) */}
        <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-sans line-clamp-5 flex-1 mb-6">
          {story.synopsis}
        </p>

        {/* Action Button: Open */}
        <button
          onClick={() => onOpen(story.id)}
          className={`w-full py-3 px-5 rounded-2xl font-semibold text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${style.buttonClass}`}
          aria-label={`Open ${story.title}`}
          id={`btn-open-${story.id}`}
        >
          <span>Open Story</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </motion.article>
  );
}
