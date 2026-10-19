"use client";

import React, { useState, useEffect, Suspense } from "react";
import { StoryTransitionProvider } from "@/context/StoryTransitionContext";
import { StoryTransitionOverlay } from "@/components/story/StoryTransitionOverlay";
import { CursorHeartTrail } from "@/components/CursorHeartTrail";
import { GiftNavigation } from "@/components/GiftNavigation";
import { CreatorStudio } from "@/components/creator/CreatorStudio";
import { ParticipantAccessModal } from "@/components/auth/ParticipantAccessModal";

function StoryLayoutInner({ children }: { children: React.ReactNode }) {
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Auto-detect ?invite= parameter for seamless recipient authorization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invite }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.authorized) {
            localStorage.setItem("gift_participant_role", data.role || "recipient");
            localStorage.setItem("gift_participant_name", data.name || "Baby");
            localStorage.setItem("gift_auth_token", invite);
            window.dispatchEvent(new Event("storage"));
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--bg-blush)] selection:text-[var(--text-primary)]">
      {/* Delightful cursor heart trail */}
      <CursorHeartTrail />

      {/* Floating interactive navigation menu */}
      <GiftNavigation
        onOpenCreatorStudio={() => setIsCreatorStudioOpen(true)}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
      />

      {/* Persistent Emotion-Driven Story Transition Overlay */}
      <StoryTransitionOverlay />

      {/* Main Chapter Content Viewport */}
      <main className="relative z-10 w-full min-h-screen">
        {children}
      </main>

      {/* Creator Studio & Response Center Drawer */}
      <CreatorStudio
        isOpen={isCreatorStudioOpen}
        onClose={() => setIsCreatorStudioOpen(false)}
      />

      {/* Couple Access & Switcher Modal */}
      <ParticipantAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--pink-strong)]">Loading our story... ♡</div>}>
      <StoryTransitionProvider>
        <StoryLayoutInner>{children}</StoryLayoutInner>
      </StoryTransitionProvider>
    </Suspense>
  );
}
