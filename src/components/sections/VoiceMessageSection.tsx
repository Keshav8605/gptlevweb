"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import type { VoiceMessage } from "@/lib/server-db";

interface VoiceMessageSectionProps {
  onOpenAccessModal?: () => void;
}

export function VoiceMessageSection({ onOpenAccessModal }: VoiceMessageSectionProps) {
  // Current user role
  const [role, setRole] = useState<"creator" | "recipient">(() => {
    if (typeof window === "undefined") return "recipient";
    return (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
  });
  const [participantName, setParticipantName] = useState<string>(() => {
    if (typeof window === "undefined") return "Baby";
    return localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
  });

  // Voice messages list
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active playing message ID
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voice notes
  const fetchMessages = () => {
    fetch("/api/voice")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Unable to load voice notes right now.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/voice")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load voice notes right now.");
          setIsLoading(false);
        }
      });

    const handleStorage = () => {
      const savedRole = (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
      setRole(savedRole);
      setParticipantName(localStorage.getItem("gift_participant_name") || (savedRole === "creator" ? "Babe" : "Baby"));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Timer logic for recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Request mic & Start Recording
  const startRecording = async () => {
    setRecordingSeconds(0);
    setPermissionError(null);
    setError(null);
    setUploadSuccess(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError("Audio recording is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // fallback to browser default
          }
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setPreviewUrl(url);

        // Stop all media tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // collect every 250ms
      setIsRecording(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Microphone access denied";
      setPermissionError(
        errorMsg.includes("Permission") || errorMsg.includes("denied")
          ? "Microphone access was denied. Please allow microphone permissions in your browser bar."
          : `Microphone error: ${errorMsg}`
      );
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Cancel & Discard
  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecordingSeconds(0);
    setIsRecording(false);
  };

  // Convert Blob to Base64 and send
  const sendVoiceNote = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result as string;
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: base64Audio,
            durationSeconds: recordingSeconds || 5,
            role,
            name: participantName,
          }),
        });

        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => [data.message, ...prev]);
          setUploadSuccess(true);
          setAudioBlob(null);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setRecordingSeconds(0);
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          setError(data.error || "Failed to upload voice message.");
        }
      } catch {
        setError("Network error while delivering voice note. Please retry.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setError("Failed to process audio recording. Please record again.");
    };
  };

  // Playback control for items in list
  const togglePlayMessage = (msg: VoiceMessage) => {
    if (currentlyPlayingId === msg.id) {
      // Pause
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
      }
      setCurrentlyPlayingId(null);
    } else {
      // Play new
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
      }
      const audio = new Audio(msg.audioData);
      activeAudioElementRef.current = audio;
      setCurrentlyPlayingId(msg.id);

      audio.play().catch(() => {
        setCurrentlyPlayingId(null);
      });

      audio.onended = () => {
        setCurrentlyPlayingId(null);
      };
    }
  };

  // Delete voice note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voice note?")) return;
    try {
      const res = await fetch(`/api/voice?id=${id}&role=${role}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (currentlyPlayingId === id && activeAudioElementRef.current) {
          activeAudioElementRef.current.pause();
          setCurrentlyPlayingId(null);
        }
      } else {
        alert(data.error || "Failed to delete.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <SectionWrapper
      id="voice"
      eyebrowLabel="A LITTLE PIECE OF ME"
      title="Voice Notes, Just for Us"
      subtitle="For the days when a voice feels closer than a message. Save a laugh, a little story, or a goodnight for later."
      emoji="🎙️"
      bgVariant="default"
      chapterNumber={9}
      nextSectionId="datePlanner"
      nextSectionLabel="Let's Make a Day of It ♡"
      nextSectionEmoji="🗺️"
    >
      <div className="max-w-4xl mx-auto">
        {/* Sweet voice whispers couple companion */}
        <div className="flex justify-center -mt-3 mb-5">
          <RomanticCharacter
            character="kissingCouple"
            size={180}
            animation="gentle-float"
            sparkles
          />
        </div>

        {/* Current Participant Banner */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-2xs">
            <span>Speaking as:</span>
            <span className="font-semibold text-[var(--pink-strong)]">
              {participantName} ({role === "creator" ? "Creator" : "Recipient"})
            </span>
            {onOpenAccessModal && (
              <button
                onClick={onOpenAccessModal}
                className="text-xs text-[var(--pink-strong)] underline hover:opacity-80 cursor-pointer ml-1"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Recording Station Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-[var(--shadow-card)] relative overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--pink-strong)] animate-pulse" />
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Leave me a whisper
              </h3>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Just between us
            </span>
          </div>

          {/* Permission / General Error */}
          {permissionError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold mb-1">Microphone Access</p>
                <p>{permissionError}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 font-bold hover:opacity-75 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
              <span>✨ Voice note delivered to your sweetheart!</span>
            </div>
          )}

          {/* State 1: Idle - Ready to record */}
          {!isRecording && !previewUrl && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[var(--pale-rose)] to-white border-2 border-[var(--pink-soft)] flex items-center justify-center shadow-md">
                <span className="text-3xl">🎙️</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-2">
                Leave me a whisper
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                Tell me about your day, share a little thought, or just say goodnight.
              </p>
              <button
                onClick={startRecording}
                id="btn-start-voice-recording"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--pink-strong)] to-[var(--pink-hover)] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <span>🎙️</span>
                <span>Record a voice note</span>
              </button>
            </div>
          )}

          {/* State 2: Actively Recording */}
          {isRecording && (
            <div className="text-center py-6">
              <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                {/* Pulsing ripple rings */}
                <span className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
                <span className="absolute -inset-2 rounded-full bg-red-400/10 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                  <span className="text-3xl animate-bounce">🎙️</span>
                </div>
              </div>

              {/* Sound wave bars */}
              <div className="flex items-center justify-center gap-1.5 h-10 mb-4">
                {[12, 28, 40, 20, 36, 16, 32, 24, 38, 14].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [8, height, 10],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i % 3) * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[var(--pink-strong)] to-red-400"
                  />
                ))}
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-base font-bold mb-6">
                I&apos;m listening… {formatSeconds(recordingSeconds)}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={stopRecording}
                  id="btn-stop-voice-recording"
                  className="px-6 py-2.5 rounded-full bg-red-500 text-white font-semibold text-sm shadow-md hover:bg-red-600 transition-all cursor-pointer"
                >
                  ⏹️ Finish recording
                </button>
                <button
                  onClick={cancelRecording}
                  className="px-4 py-2.5 rounded-full bg-[var(--pale-rose)] text-[var(--text-secondary)] font-semibold text-sm hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Start again
                </button>
              </div>
            </div>
          )}

          {/* State 3: Preview & Confirmation */}
          {!isRecording && previewUrl && (
            <div className="py-4">
              <div className="p-4 rounded-2xl bg-[var(--pale-rose)]/50 border border-[var(--border-subtle)] mb-6">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[var(--text-secondary)]">
                  <span>🎧 Listen to your note</span>
                  <span className="font-mono">{formatSeconds(recordingSeconds)}</span>
                </div>

                {/* Audio preview element */}
                <audio
                  ref={previewAudioRef}
                  src={previewUrl}
                  controls
                  className="w-full accent-[var(--pink-strong)]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={cancelRecording}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-zinc-100 cursor-pointer disabled:opacity-50"
                >
                  Start again
                </button>
                <button
                  onClick={sendVoiceNote}
                  disabled={isUploading}
                  id="btn-send-voice-recording"
                  className="px-6 py-2.5 rounded-full bg-[var(--pink-strong)] text-white text-xs font-semibold shadow-md hover:bg-[var(--pink-hover)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending whisper...</span>
                    </>
                  ) : (
                    <>
                      <span>💌</span>
                      <span>Send this little whisper ♡</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Received / Shared Voice Notes Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
              Our voice-note collection ({messages.length})
            </h3>
            <button
              onClick={fetchMessages}
              className="text-xs text-[var(--pink-strong)] font-semibold hover:underline cursor-pointer"
            >
              🔄 Refresh voice notes
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              <span className="inline-block w-5 h-5 border-2 border-[var(--pink-strong)] border-t-transparent rounded-full animate-spin mr-2" />
              Loading voice whispers...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-14 p-8 rounded-3xl bg-white/70 border border-dashed border-[var(--border-subtle)]">
              <span className="text-4xl mb-3 block">🕊️</span>
              <h4 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-1">
                No whispers here just yet
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Leave the first one whenever you&apos;re ready. It&apos;ll be here to revisit when we miss each other.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {messages.map((msg) => {
                  const isPlaying = currentlyPlayingId === msg.id;
                  const isMyMessage = msg.sender === role;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 rounded-3xl bg-white border transition-all ${
                        isPlaying
                          ? "border-[var(--pink-strong)] shadow-md bg-gradient-to-br from-white to-[var(--pale-rose)]/40"
                          : "border-[var(--border-subtle)] shadow-sm hover:shadow"
                      }`}
                    >
                      {/* Note Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-[var(--pale-rose)] flex items-center justify-center text-sm">
                            {msg.sender === "creator" ? "👑" : "🌸"}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-[var(--text-primary)]">
                                {msg.senderName}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  msg.sender === "creator"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-pink-100 text-pink-700"
                                }`}
                              >
                                {msg.sender === "creator" ? "Creator" : "Recipient"}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Delete action (if authorized or creator) */}
                        {(role === "creator" || isMyMessage) && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            title="Delete note"
                            className="text-xs text-zinc-400 hover:text-red-500 cursor-pointer p-1"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      {/* Audio Player Bar */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--pale-rose)]/60 border border-[var(--border-subtle)]">
                        <button
                          onClick={() => togglePlayMessage(msg)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm ${
                            isPlaying
                              ? "bg-red-500 scale-105"
                              : "bg-[var(--pink-strong)] hover:bg-[var(--pink-hover)]"
                          }`}
                        >
                          {isPlaying ? "⏸️" : "▶️"}
                        </button>

                        <div className="flex-1">
                          {/* Visual Waveform */}
                          <div className="flex items-center gap-1 h-6">
                            {[16, 24, 12, 30, 20, 28, 14, 22, 18, 26, 12, 20].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  isPlaying
                                    ? "bg-[var(--pink-strong)] animate-pulse"
                                    : "bg-[var(--pink-soft)]"
                                }`}
                                style={{
                                  height: `${isPlaying ? (h % 16) + 10 : h * 0.7}px`,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-xs font-mono text-[var(--text-secondary)] font-semibold">
                          {formatSeconds(msg.durationSeconds || 5)}
                        </span>
                      </div>

                      {/* Direct Reply Prompt */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>{isPlaying ? "Playing voice note... 🎶" : "Click play to listen"}</span>
                        <button
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            const target = document.getElementById("voice");
                            target?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-[var(--pink-strong)] font-semibold hover:underline cursor-pointer"
                        >
                          Send Voice Reply 💬
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
