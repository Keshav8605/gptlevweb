"use client";

import { DigitalGiftsSection } from "@/components/sections/DigitalGiftsSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryDigitalGiftsPage() {
  return (
    <div className="w-full">
      <DigitalGiftsSection gifts={defaultGiftConfig.digitalGifts} />
      <StoryChapterFooter />
    </div>
  );
}
