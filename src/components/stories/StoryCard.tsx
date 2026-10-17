"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Story } from "@/lib/stories-data";

interface StoryCardProps {
  story: Story;
  onOpen: (storyId: Story["id"]) => void;
}

export function StoryCard({ story, onOpen }: StoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const isMafia = story.id === "mafia-romance";

  return (
    <motion.article
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`group relative flex flex-col w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isMafia
          ? "border border-rose-900/40 hover:border-rose-500/60 shadow-[0_15px_40px_rgba(190,18,60,0.22)]"
          : "border border-teal-900/40 hover:border-sky-500/60 shadow-[0_15px_40px_rgba(14,165,233,0.22)]"
      }`}
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
              background: isMafia
                ? "radial-gradient(circle at center, #3b0717 0%, #0d0407 100%)"
                : "radial-gradient(circle at center, #06283b 0%, #050b12 100%)",
            }}
          >
            <span className="text-4xl mb-3">{isMafia ? "🌹" : "🌧️"}</span>
            <p className="font-serif italic text-lg text-rose-200">{story.genre}</p>
          </div>
        )}

        {/* Ambient Top Shadow & Genre Badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e070c] via-transparent to-black/50 pointer-events-none" />

        <div className="absolute top-4 left-4 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-md ${
              isMafia
                ? "bg-rose-950/80 border border-rose-600/40 text-rose-200"
                : "bg-sky-950/80 border border-sky-600/40 text-sky-200"
            }`}
          >
            <span className="text-[10px]">{isMafia ? "🥀" : "✨"}</span>
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
        <p
          className={`font-serif italic text-xs sm:text-sm mt-1.5 font-medium ${
            isMafia ? "text-rose-300/80" : "text-sky-300/80"
          }`}
        >
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
          className={`w-full py-3 px-5 rounded-2xl font-semibold text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
            isMafia
              ? "bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white shadow-rose-950/60 hover:shadow-rose-600/30"
              : "bg-gradient-to-r from-sky-800 to-sky-600 hover:from-sky-700 hover:to-sky-500 text-white shadow-sky-950/60 hover:shadow-sky-600/30"
          }`}
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
