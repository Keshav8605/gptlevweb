"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreatorPhoto } from "@/lib/creator-types";

interface WizardPhotoLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoLibrary: CreatorPhoto[];
  onSelectPhoto: (photoUrl: string) => void;
  onAddPhotos: (newPhotos: CreatorPhoto[]) => void;
  onRemovePhoto: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  fieldTitle?: string;
}

export function WizardPhotoLibraryModal({
  isOpen,
  onClose,
  photoLibrary,
  onSelectPhoto,
  onAddPhotos,
  onRemovePhoto,
  onUpdateLabel,
  fieldTitle = "Choose a photograph",
}: WizardPhotoLibraryModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    const newPhotos: CreatorPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate format
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`"${file.name}" is not a supported image. Please upload JPG, PNG, WebP, or GIF.`);
        continue;
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" is too large (over 5MB). Please choose a smaller photo.`);
        continue;
      }

      try {
        // Upload to server media endpoint or fallback to dataUrl
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", file.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.asset?.dataUrl) {
            newPhotos.push({
              id: data.asset.id || `photo_${Date.now()}_${i}`,
              url: data.asset.dataUrl,
              name: file.name,
              label: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
              sizeBytes: file.size,
              uploadedAt: new Date().toISOString(),
            });
            continue;
          }
        }

        // Fallback to local FileReader
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newPhotos.push({
          id: `photo_${Date.now()}_${i}`,
          url: dataUrl,
          name: file.name,
          label: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to upload photo", err);
        setErrorMessage(`Could not process "${file.name}". Please try another image.`);
      }
    }

    if (newPhotos.length > 0) {
      onAddPhotos(newPhotos);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-[var(--border-subtle)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--pink-strong)] font-rounded block">
                Shared Photo Library
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                {fieldTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--pale-rose)] text-[var(--text-secondary)] hover:text-[var(--pink-strong)] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--pink-light)] hover:border-[var(--pink-primary)] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white/70 hover:bg-white"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-3xl block mb-2">📸</span>
              <p className="text-xs sm:text-sm font-rounded font-bold text-[var(--text-primary)]">
                {isUploading ? "Uploading photos..." : "Click or drag photos here to upload"}
              </p>
              <p className="text-[11px] font-rounded text-[var(--text-muted)] mt-1">
                Supports JPG, PNG, WebP, GIF up to 5MB. Upload once, reuse across any chapter.
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs font-rounded text-rose-500 font-semibold mt-2 text-center">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Photo Gallery Grid */}
          <div className="p-6 overflow-y-auto flex-1">
            {photoLibrary.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)] font-rounded text-sm">
                <span className="text-4xl block mb-2">🖼️</span>
                No photos in your library yet. Upload your first memory above!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoLibrary.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-2xl border border-[var(--border-subtle)] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => onSelectPhoto(photo.url)}
                      className="aspect-square w-full bg-[var(--soft-pink)] relative cursor-pointer overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-white text-[11px] font-rounded font-bold text-[var(--pink-strong)] shadow-xs">
                          Choose Photo
                        </span>
                      </div>
                    </div>

                    {/* Label / Name */}
                    <div className="p-2.5 flex items-center justify-between gap-1 text-[11px] font-rounded">
                      <input
                        type="text"
                        value={photo.label || photo.name}
                        onChange={(e) => onUpdateLabel(photo.id, e.target.value)}
                        placeholder="Add a label..."
                        className="w-full truncate bg-transparent focus:outline-none text-[var(--text-secondary)] focus:text-[var(--text-primary)]"
                        title={photo.label || photo.name}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePhoto(photo.id);
                        }}
                        className="text-[var(--text-muted)] hover:text-rose-500 cursor-pointer p-1"
                        title="Remove from library"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs font-rounded text-[var(--text-muted)]">
            <span>{photoLibrary.length} photographs in library</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[var(--border-subtle)] bg-white text-xs font-rounded font-semibold text-[var(--text-secondary)] hover:bg-[var(--pale-rose)] cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
