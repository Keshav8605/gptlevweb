"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { MediaAsset } from "@/lib/server-db";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (mediaUrl: string) => void;
  giftId?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectMedia,
  giftId,
}: MediaLibraryModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "image" | "audio">("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/media${giftId ? `?giftId=${giftId}` : ""}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data.assets) setAssets(data.assets);
        }
      } catch {
        // ignore
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, giftId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit. Please choose a smaller file.");
      setIsUploading(false);
      return;
    }

    // Validate MIME
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    if (!isImage && !isAudio) {
      setUploadError("Only image (JPG, PNG, WEBP, GIF, SVG) and audio (MP3, WAV, OGG, WEBM) files are allowed.");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (giftId) formData.append("giftId", giftId);
      formData.append("caption", file.name);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.asset) {
        setAssets((prev) => [data.asset, ...prev]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network error while uploading media.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to remove this media asset?")) return;

    try {
      const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {}
  };

  const handlePlayAudio = (asset: MediaAsset) => {
    if (playingAudioId === asset.id) {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      const audio = new Audio(asset.dataUrl);
      audioPlayerRef.current = audio;
      setPlayingAudioId(asset.id);
      audio.play().catch(() => setPlayingAudioId(null));
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (selectedTypeFilter === "image") return a.type === "image";
    if (selectedTypeFilter === "audio") return a.type === "audio";
    return true;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 border border-[var(--border-subtle)] max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📸</span>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Media Library
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Upload, preview, and select photographs and audio recordings for your gift.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Upload & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Filter pills */}
            <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setSelectedTypeFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-all ${
                  selectedTypeFilter === "all"
                    ? "bg-[var(--pink-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
                }`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter("image")}
                className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-all ${
                  selectedTypeFilter === "image"
                    ? "bg-[var(--pink-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
                }`}
              >
                Photos ({assets.filter((a) => a.type === "image").length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter("audio")}
                className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-all ${
                  selectedTypeFilter === "audio"
                    ? "bg-[var(--pink-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--pink-strong)]"
                }`}
              >
                Audio ({assets.filter((a) => a.type === "audio").length})
              </button>
            </div>

            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media_upload_input"
              />
              <label
                htmlFor="media_upload_input"
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] hover:shadow-md cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>⬆️</span>
                <span>{isUploading ? "Uploading..." : "Upload Photo or Audio"}</span>
              </label>
            </div>
          </div>

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              ⚠️ {uploadError}
            </div>
          )}

          {/* Assets Grid */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLoading ? (
              <div className="py-20 text-center space-y-2">
                <span className="text-3xl block animate-bounce">💖</span>
                <p className="font-serif text-sm text-[var(--text-muted)]">Loading assets...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-4xl block">🖼️</span>
                <p className="font-serif text-base font-semibold text-[var(--text-primary)]">
                  No media assets uploaded yet
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Upload photographs of special memories or voice dedication audio files up to 10MB.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--pink-primary)] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Media Thumbnail or Audio Box */}
                    <div className="relative h-32 w-full bg-white flex items-center justify-center overflow-hidden">
                      {asset.type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={asset.dataUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-center p-3 space-y-2">
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(asset)}
                            className="w-12 h-12 mx-auto rounded-full bg-[var(--pink-primary)] text-white text-lg flex items-center justify-center hover:scale-105 transition-all shadow-xs cursor-pointer"
                          >
                            {playingAudioId === asset.id ? "⏸" : "▶"}
                          </button>
                          <span className="text-[10px] text-[var(--text-muted)] block font-medium">
                            {playingAudioId === asset.id ? "Playing..." : "Click to Preview"}
                          </span>
                        </div>
                      )}

                      {/* Type Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/50 text-white backdrop-blur-xs">
                        {asset.type.toUpperCase()}
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-red-600 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete asset"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Metadata & Select Action */}
                    <div className="p-3 bg-white space-y-2 border-t border-[var(--border-subtle)]">
                      <div>
                        <span className="block text-xs font-semibold text-[var(--text-primary)] truncate" title={asset.name}>
                          {asset.name}
                        </span>
                        <span className="block text-[10px] text-[var(--text-muted)]">
                          {(asset.sizeBytes / 1024).toFixed(0)} KB • {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {onSelectMedia && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectMedia(asset.dataUrl);
                            onClose();
                          }}
                          className="w-full py-1.5 rounded-xl text-xs font-semibold text-[var(--pink-strong)] bg-[var(--pale-rose)] hover:bg-[var(--bg-blush)] transition-colors cursor-pointer"
                        >
                          Use in Section ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
