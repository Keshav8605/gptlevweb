"use client";

import { DeluluSection } from "@/components/sections/DeluluSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryDeluluPage() {
  return (
    <div className="w-full">
      <DeluluSection />
      <StoryChapterFooter />
    </div>
  );
}
