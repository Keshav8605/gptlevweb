"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { SectionWrapper } from "../SectionWrapper";
import type { SongDedication } from "@/lib/gift-data";

interface OurSongSectionProps {
  featuredSong: SongDedication;
  additionalSongs?: SongDedication[];
}

interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
  note: string;
  timestamp: string;
}

// Gentle romantic acoustic melody inspired by Stephen Sanchez - "Until I Found You"
const SONG_MELODY: Array<{ freq: number; duration: number }> = [
  // "Georgia..."
  { freq: 392.0, duration: 700 },   // G4
  { freq: 329.63, duration: 600 },  // E4
  { freq: 293.66, duration: 600 },  // D4
  { freq: 261.63, duration: 900 },  // C4
  // "...wrap me up in all your"
  { freq: 293.66, duration: 550 },  // D4
  { freq: 329.63, duration: 550 },  // E4
  { freq: 392.0, duration: 850 },   // G4
  // "I would never fall in love..."
  { freq: 440.0, duration: 600 },   // A4
  { freq: 523.25, duration: 950 },  // C5
  { freq: 440.0, duration: 600 },   // A4
  { freq: 392.0, duration: 900 },   // G4
  // "...until I found her"
  { freq: 349.23, duration: 600 },  // F4
  { freq: 329.63, duration: 600 },  // E4
  { freq: 293.66, duration: 750 },  // D4
  // "I said, I would never fall..."
  { freq: 261.63, duration: 600 },  // C4
  { freq: 293.66, duration: 600 },  // D4
  { freq: 329.63, duration: 600 },  // E4
  { freq: 392.0, duration: 900 },   // G4
  { freq: 440.0, duration: 600 },   // A4
  { freq: 523.25, duration: 1100 }, // C5
  // "...until I found you ♡"
  { freq: 440.0, duration: 600 },   // A4
  { freq: 392.0, duration: 800 },   // G4
  { freq: 329.63, duration: 700 },  // E4
  { freq: 293.66, duration: 800 },  // D4
  { freq: 261.63, duration: 1800 }, // C4 (warm final resolving chime)
];

export function OurSongSection({ featuredSong, additionalSongs }: OurSongSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  const [suggestions] = useState<SongSuggestion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("gift_song_suggestions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noteIndexRef = useRef(0);

  useEffect(() => {
    noteIndexRef.current = currentNoteIndex;
  }, [currentNoteIndex]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playChimeNote = (freq: number, durationMs: number = 650) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const decayTime = Math.max(0.7, durationMs / 1000 + 0.7);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decayTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + decayTime);
    } catch {
      // AudioContext fallback
    }
  };

  const playNextNote = (index: number) => {
    if (index >= SONG_MELODY.length) {
      setIsPlaying(false);
      setIsCompleted(true);
      setCurrentNoteIndex(SONG_MELODY.length);
      noteIndexRef.current = 0;
      return;
    }

    const note = SONG_MELODY[index];
    playChimeNote(note.freq, note.duration);
    setCurrentNoteIndex(index + 1);
    noteIndexRef.current = index + 1;

    timeoutRef.current = setTimeout(() => {
      playNextNote(index + 1);
    }, note.duration);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsPlaying(false);
    } else {
      // Play, Resume, or Replay
      if (isCompleted) {
        setIsCompleted(false);
        setCurrentNoteIndex(0);
        noteIndexRef.current = 0;
      }
      setIsPlaying(true);
      playNextNote(noteIndexRef.current >= SONG_MELODY.length ? 0 : noteIndexRef.current);
    }
  };

  return (
    <SectionWrapper
      id="ourSong"
      eyebrowLabel="A SONG THAT SOUNDS LIKE US"
      title="Our Song"
      subtitle="Some songs play in the background. This one brings you right back to me."
      emoji="🎵"
      bgVariant="blush"
      chapterNumber={14}
      nextSectionId="finalHeart"
      nextSectionLabel="Reveal our love story ♡"
      nextSectionSubtitle="Every little moment, every tiny reason, every feeling in this world leads back to one thing: us."
      nextSectionEmoji="❤️"
    >
      <div className="max-w-2xl mx-auto">
        {/* Featured song card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden bg-white border border-[var(--border-subtle)] shadow-[0_8px_40px_var(--shadow-pink)]"
        >
          {/* Decorative floating notes */}
          <div className="absolute top-6 left-6 text-3xl opacity-20 animate-float pointer-events-none">
            🎵
          </div>
          <div className="absolute bottom-8 right-8 text-2xl opacity-20 animate-float-slow pointer-events-none">
            🎶
          </div>

          {/* Vinyl record animation */}
          <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{
                duration: 6,
                repeat: isPlaying ? Infinity : 0,
                ease: "linear",
              }}
              className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background:
                  "conic-gradient(from 0deg, #2A1F2D 0%, #49323F 25%, #2A1F2D 50%, #49323F 75%, #2A1F2D 100%)",
                border: "4px solid rgba(255,255,255,0.4)",
              }}
            >
              <div className="w-14 h-14 rounded-full bg-[var(--pale-rose)] flex items-center justify-center border-2 border-white shadow-inner">
                <div className="w-4 h-4 rounded-full bg-[var(--pink-deep)]" />
              </div>
            </motion.div>

            {/* Play/Pause/Replay Button Overlay on Vinyl */}
            <button
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-xs text-[var(--pink-strong)] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title={
                isPlaying
                  ? "Pause our song"
                  : isCompleted
                  ? "Replay our song"
                  : currentNoteIndex > 0
                  ? "Resume our song"
                  : "Play our song"
              }
            >
              {isPlaying ? (
                <span className="text-sm font-bold">❚❚</span>
              ) : isCompleted ? (
                <span className="text-sm font-bold">🔄</span>
              ) : (
                <span className="text-sm ml-0.5 font-bold">▶</span>
              )}
            </button>
          </div>

          {/* Song info */}
          <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-1 text-[var(--text-primary)]">
            {featuredSong.title}
          </h3>
          <p className="text-sm mb-5 text-[var(--text-muted)] font-medium">
            by {featuredSong.artist}
          </p>

          {/* Playback progress bar */}
          {(isPlaying || currentNoteIndex > 0 || isCompleted) && (
            <div className="w-full max-w-xs mx-auto mb-6">
              <div className="h-1.5 w-full bg-[var(--pale-rose)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] rounded-full transition-all duration-300"
                  style={{
                    width: isCompleted
                      ? "100%"
                      : `${Math.round((currentNoteIndex / SONG_MELODY.length) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-rounded mt-1">
                <span>
                  {isPlaying
                    ? "Playing melody..."
                    : isCompleted
                    ? "Melody complete ♡"
                    : "Paused"}
                </span>
                <span>
                  {isCompleted
                    ? "Ended"
                    : `${Math.round((currentNoteIndex / SONG_MELODY.length) * 100)}%`}
                </span>
              </div>
            </div>
          )}

          {/* Dedication */}
          <div className="rounded-2xl p-6 mb-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-left">
            <p className="font-script text-xl mb-2 text-[var(--pink-strong)]">
              A little dedication to you
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
              {featuredSong.dedication || "Every time I hear this, I think of you. Of the moments we've shared, the ones still waiting for us, and all the feelings that are somehow easier to hear in a song."}
            </p>
          </div>

          {/* Why it matters */}
          {featuredSong.whyItMatters && (
            <p className="text-sm italic text-[var(--text-muted)] mb-6">
              &ldquo;{featuredSong.whyItMatters}&rdquo;
            </p>
          )}

          {/* Single clean interactive control */}
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={handleTogglePlay}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white text-xs sm:text-sm font-rounded font-semibold shadow-xs hover:shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <span>Pause our song</span>
                  <span className="text-sm">⏸</span>
                </>
              ) : isCompleted ? (
                <>
                  <span>Replay our song</span>
                  <span className="text-sm">🔄</span>
                </>
              ) : currentNoteIndex > 0 ? (
                <>
                  <span>Resume our song</span>
                  <span className="text-sm">▶</span>
                </>
              ) : (
                <>
                  <span>Play our song</span>
                  <span className="text-sm">▶</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Additional songs */}
        {additionalSongs && additionalSongs.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              More songs that whisper your name
            </p>
            {additionalSongs.map((song, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs hover:border-[var(--pink-primary)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--pale-rose)] flex items-center justify-center text-lg flex-shrink-0">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-[var(--text-primary)]">
                    {song.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {song.artist}
                  </p>
                </div>
                {song.dedication && (
                  <p className="text-xs italic text-[var(--text-muted)] hidden sm:block max-w-[200px] truncate">
                    &ldquo;{song.dedication}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Receiver's Suggested Songs */}
        {suggestions.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl bg-white/70 border border-[var(--border-subtle)]">
            <h4 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span>🎧</span>
              <span>Songs You Dedicate Back</span>
            </h4>
            <div className="space-y-3">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
                >
                  <div className="flex items-center justify-between font-semibold text-[var(--text-primary)] mb-1">
                    <span>{item.title} — {item.artist}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-normal">{item.timestamp}</span>
                  </div>
                  {item.note && <p className="italic text-[var(--pink-deep)]">“{item.note}”</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
