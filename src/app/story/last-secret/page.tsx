"use client";

import { LastSecretSection } from "@/components/sections/LastSecretSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryLastSecretPage() {
  return (
    <div className="w-full">
      <LastSecretSection />
      <StoryChapterFooter />
    </div>
  );
}
