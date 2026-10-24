"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CursorHeartTrail } from "@/components/CursorHeartTrail";
import { getInitialCreatorConfig } from "@/lib/creator-defaults";
import type { CreatorConfig } from "@/lib/creator-types";

// Step components
import { WizardWelcome } from "@/components/creator-wizard/WizardWelcome";
import { WizardBasics } from "@/components/creator-wizard/WizardBasics";
import { WizardChapters } from "@/components/creator-wizard/WizardChapters";
import { WizardPersonalize } from "@/components/creator-wizard/WizardPersonalize";
import { WizardPreferences } from "@/components/creator-wizard/WizardPreferences";
import { WizardPreview } from "@/components/creator-wizard/WizardPreview";
import { WizardGenerate } from "@/components/creator-wizard/WizardGenerate";
import { WizardPhotoLibraryModal } from "@/components/creator-wizard/WizardPhotoLibraryModal";

const STORAGE_KEY = "romantic_creator_draft";

export default function CreatorWizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-serif text-[var(--pink-strong)]">Loading Creator... ♡</div>}>
      <CreatorWizardInner />
    </Suspense>
  );
}

function CreatorWizardInner() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<CreatorConfig>(getInitialCreatorConfig);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setConfig(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load draft", err);
    }
  }, []);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Shared Photo Library Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoSelectCallback, setPhotoSelectCallback] = useState<((url: string) => void) | null>(null);
  const [photoModalTitle, setPhotoModalTitle] = useState("Choose a photograph");

  // Auto-save draft to localStorage whenever config changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to auto-save draft", err);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [config]);

  const handleUpdateConfig = useCallback((updates: Partial<CreatorConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const openPhotoLibrary = (callback: (url: string) => void, title = "Choose a photograph") => {
    setPhotoSelectCallback(() => callback);
    setPhotoModalTitle(title);
    setIsPhotoModalOpen(true);
  };

  const stepsList = [
    { num: 1, label: "Welcome" },
    { num: 2, label: "Basics" },
    { num: 3, label: "Chapters" },
    { num: 4, label: "Personalize" },
    { num: 6, label: "Aesthetics" },
    { num: 7, label: "Preview" },
    { num: 8, label: "Create" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)] relative overflow-x-hidden">
      {/* Delicate floating cursor trail */}
      <CursorHeartTrail />

      {/* Top Guided Navigation Bar */}
      {currentStep > 1 && (
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[var(--border-subtle)]/70 py-3 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">💌</span>
              <span className="font-serif font-bold text-base text-[var(--text-primary)]">
                {config.websiteTitle || "Romantic Creator"}
              </span>
            </Link>

            {/* Stepper Dots / Names */}
            <div className="hidden md:flex items-center gap-2">
              {stepsList.map((st, idx) => {
                const isCurrent = currentStep === st.num;
                const isPassed = currentStep > st.num;
                return (
                  <div key={st.num} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(st.num)}
                      className={`text-xs font-rounded font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[var(--pink-strong)] text-white shadow-2xs"
                          : isPassed
                          ? "bg-[var(--pale-rose)] text-[var(--pink-strong)] hover:bg-[var(--soft-pink)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {st.label}
                    </button>
                    {idx < stepsList.length - 1 && (
                      <span className="text-[10px] text-gray-300">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auto-save draft status indicator & Reset */}
            <div className="flex items-center gap-3 text-xs font-rounded text-[var(--text-muted)]">
              <span>{saveStatus === "saving" ? "Saving draft..." : "Draft saved ♡"}</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset creator draft to fresh defaults?")) {
                    const fresh = getInitialCreatorConfig();
                    setConfig(fresh);
                    localStorage.removeItem(STORAGE_KEY);
                    setCurrentStep(1);
                  }
                }}
                className="text-[11px] text-gray-400 hover:text-rose-500 cursor-pointer underline"
              >
                Reset
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Guided Step Canvas with AnimatePresence */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WizardWelcome onStart={() => setCurrentStep(2)} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WizardBasics
                config={config}
                onChange={handleUpdateConfig}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WizardChapters
                config={config}
                onChange={handleUpdateConfig}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WizardPersonalize
                config={config}
                onChange={handleUpdateConfig}
                onOpenPhotoLibrary={openPhotoLibrary}
                onNext={() => setCurrentStep(6)}
                onBack={() => setCurrentStep(3)}
              />
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WizardPreferences
                config={config}
                onChange={handleUpdateConfig}
                onNext={() => setCurrentStep(7)}
                onBack={() => setCurrentStep(4)}
              />
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WizardPreview
                config={config}
                onEditChapter={(chapterId) => {
                  setCurrentStep(4);
                }}
                onReorderChapters={(newOrder) => {
                  handleUpdateConfig({ chapterOrder: newOrder });
                }}
                onNext={() => setCurrentStep(8)}
                onBack={() => setCurrentStep(6)}
              />
            </motion.div>
          )}

          {currentStep === 8 && (
            <motion.div
              key="step-8"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <WizardGenerate
                config={config}
                onBack={() => setCurrentStep(7)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Shared Photo Library Modal Drawer */}
      <WizardPhotoLibraryModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photoLibrary={config.photoLibrary}
        fieldTitle={photoModalTitle}
        onSelectPhoto={(url) => {
          if (photoSelectCallback) photoSelectCallback(url);
          setIsPhotoModalOpen(false);
        }}
        onAddPhotos={(newPhotos) => {
          handleUpdateConfig({
            photoLibrary: [...newPhotos, ...config.photoLibrary],
          });
        }}
        onRemovePhoto={(id) => {
          handleUpdateConfig({
            photoLibrary: config.photoLibrary.filter((p) => p.id !== id),
          });
        }}
        onUpdateLabel={(id, label) => {
          handleUpdateConfig({
            photoLibrary: config.photoLibrary.map((p) =>
              p.id === id ? { ...p, label } : p
            ),
          });
        }}
      />
    </div>
  );
}
