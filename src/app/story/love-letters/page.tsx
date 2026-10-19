"use client";

import { LettersSection } from "@/components/sections/LettersSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryLoveLettersPage() {
  return (
    <div className="w-full">
      <LettersSection letters={defaultGiftConfig.letters} />
      <StoryChapterFooter />
    </div>
  );
}
