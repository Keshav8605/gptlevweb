"use client";

import { MemoriesSection } from "@/components/sections/MemoriesSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryMemoriesPage() {
  return (
    <div className="w-full">
      <MemoriesSection memories={defaultGiftConfig.memories} />
      <StoryChapterFooter />
    </div>
  );
}
