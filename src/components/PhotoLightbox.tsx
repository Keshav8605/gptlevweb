"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LightboxPhoto {
  src: string;
  caption?: string;
  alt?: string;
}

interface PhotoLightboxProps {
  isOpen: boolean;
  photos: LightboxPhoto[];
  initialIndex?: number;
  onClose: () => void;
}

export function PhotoLightbox({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    },
    [isOpen, onClose, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo Lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center h-screen h-dvh select-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close photo view"
            className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-50 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs text-xl shadow-lg"
          >
            ✕
          </button>

          {/* Previous Button (if multiple photos) */}
          {photos.length > 1 && (
            <button
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 z-50 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs text-xl shadow-lg"
            >
              ‹
            </button>
          )}

          {/* Next Button (if multiple photos) */}
          {photos.length > 1 && (
            <button
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 z-50 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs text-xl shadow-lg"
            >
              ›
            </button>
          )}

          {/* Photo Content with Swipe Gestures */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (photos.length <= 1) return;
              if (info.offset.x > 60 || info.velocity.x > 300) {
                handlePrev();
              } else if (info.offset.x < -60 || info.velocity.x < -300) {
                handleNext();
              }
            }}
            className="relative z-40 max-w-[92vw] sm:max-w-2xl lg:max-w-4xl max-h-[80dvh] flex flex-col items-center justify-center p-2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt || currentPhoto.caption || "Romantic memory"}
                className="max-h-[68dvh] max-w-full object-contain pointer-events-none rounded-xl"
                decoding="async"
              />
            </div>

            {/* Caption & Counter */}
            <div className="mt-3 text-center px-4 max-w-md">
              {currentPhoto.caption && (
                <p className="font-handwritten text-lg sm:text-xl text-rose-100 font-semibold drop-shadow-md">
                  {currentPhoto.caption}
                </p>
              )}
              {photos.length > 1 && (
                <p className="text-xs text-white/60 font-rounded mt-1">
                  {currentIndex + 1} of {photos.length}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
