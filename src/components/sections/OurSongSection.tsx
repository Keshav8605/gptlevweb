"use client";

import { motion, AnimatePresence } from "framer-motion";
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

export function OurSongSection({ featuredSong, additionalSongs }: OurSongSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggestArtist, setSuggestArtist] = useState("");
  const [suggestNote, setSuggestNote] = useState("");
  const [suggestions, setSuggestions] = useState<SongSuggestion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("gift_song_suggestions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Audio synthesis reference for delightful ambient melody when played
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playChimeNote = (freq: number) => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      // Play a gentle pentatonic romantic sequence
      const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
      let step = 0;
      playChimeNote(pentatonic[0]);
      intervalRef.current = setInterval(() => {
        step = (step + 1) % pentatonic.length;
        playChimeNote(pentatonic[step]);
      }, 700);
    }
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestTitle.trim()) return;

    const newSuggestion: SongSuggestion = {
      id: Date.now().toString(),
      title: suggestTitle.trim(),
      artist: suggestArtist.trim() || "Unknown Artist",
      note: suggestNote.trim(),
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    const updated = [newSuggestion, ...suggestions];
    setSuggestions(updated);
    try {
      localStorage.setItem("gift_song_suggestions", JSON.stringify(updated));
    } catch {}

    setSuggestSuccess(true);
    setTimeout(() => {
      setSuggestSuccess(false);
      setShowSuggestModal(false);
      setSuggestTitle("");
      setSuggestArtist("");
      setSuggestNote("");
    }, 1500);
  };

  return (
    <SectionWrapper
      id="ourSong"
      title="Our Song"
      subtitle="The melodies that immediately bring every memory of you rushing back"
      emoji="🎵"
      bgVariant="blush"
      chapterNumber={13}
      nextSectionId="finalHeart"
      nextSectionLabel="Our Heart Collage"
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

            {/* Play/Pause Button Overlay */}
            <button
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm text-[var(--pink-strong)] flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
              title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
            >
              {isPlaying ? (
                <span className="text-sm font-bold">❚❚</span>
              ) : (
                <span className="text-sm ml-0.5 font-bold">▶</span>
              )}
            </button>
          </div>

          {/* Song info */}
          <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-1 text-[var(--text-primary)]">
            {featuredSong.title}
          </h3>
          <p className="text-sm mb-6 text-[var(--text-muted)] font-medium">
            by {featuredSong.artist}
          </p>

          {/* Dedication */}
          <div className="rounded-2xl p-6 mb-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-left">
            <p className="font-script text-xl mb-2 text-[var(--pink-strong)]">
              My dedication to you
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
              {featuredSong.dedication}
            </p>
          </div>

          {/* Why it matters */}
          {featuredSong.whyItMatters && (
            <p className="text-sm italic text-[var(--text-muted)] mb-6">
              &ldquo;{featuredSong.whyItMatters}&rdquo;
            </p>
          )}

          {/* Interactive controls & suggest CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="px-6 py-2.5 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--bg-blush)] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>{isPlaying ? "Pause Ambient Music" : "Play Ambient Melody"}</span>
              <span>{isPlaying ? "⏸" : "✨"}</span>
            </button>

            <button
              onClick={() => setShowSuggestModal(true)}
              className="px-6 py-2.5 rounded-full border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--pink-strong)] hover:border-[var(--pink-primary)] text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>+ Suggest a Song for Us</span>
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

      {/* Suggest Song Modal */}
      <AnimatePresence>
        {showSuggestModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuggestModal(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                  Suggest a Song for Us
                </h3>
                <button
                  onClick={() => setShowSuggestModal(false)}
                  className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
                >
                  ✕
                </button>
              </div>

              {suggestSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-4xl animate-bounce inline-block">💖</span>
                  <p className="font-script text-2xl text-[var(--pink-strong)]">
                    Added to our playlist!
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    I can&apos;t wait to listen to this while thinking of you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestTitle}
                      onChange={(e) => setSuggestTitle(e.target.value)}
                      placeholder="e.g. Lover, Golden Hour..."
                      className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={suggestArtist}
                      onChange={(e) => setSuggestArtist(e.target.value)}
                      placeholder="e.g. Taylor Swift, JVKE..."
                      className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Why this song reminds you of us:
                    </label>
                    <textarea
                      value={suggestNote}
                      onChange={(e) => setSuggestNote(e.target.value)}
                      placeholder="Share a sweet memory or feeling connected to this song..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSuggestModal(false)}
                      className="px-4 py-2 text-xs text-[var(--text-muted)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs rounded-xl bg-[var(--pink-strong)] text-white hover:bg-[var(--pink-deep)] font-semibold transition-colors cursor-pointer"
                    >
                      Send Dedication ♡
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
