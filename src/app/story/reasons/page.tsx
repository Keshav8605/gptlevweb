"use client";

import { LittleReasonsSection } from "@/components/sections/LittleReasonsSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryLittleReasonsPage() {
  return (
    <div className="w-full">
      <LittleReasonsSection reasons={defaultGiftConfig.littleReasons} />
      <StoryChapterFooter />
    </div>
  );
}
