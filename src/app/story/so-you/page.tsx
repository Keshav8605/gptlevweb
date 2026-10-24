"use client";

import { PersonalCardsSection } from "@/components/sections/PersonalCardsSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StorySoYouPage() {
  return (
    <div className="w-full">
      <PersonalCardsSection cards={defaultGiftConfig.personalCards || []} />
      <StoryChapterFooter />
    </div>
  );
}
