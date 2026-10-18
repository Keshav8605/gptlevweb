"use client";

import { OpenWhenSection } from "@/components/sections/OpenWhenSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryOpenWhenPage() {
  return (
    <div className="w-full">
      <OpenWhenSection letters={defaultGiftConfig.openWhenLetters} />
      <StoryChapterFooter />
    </div>
  );
}
