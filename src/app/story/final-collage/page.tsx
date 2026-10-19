"use client";

import { FinalHeartSection } from "@/components/sections/FinalHeartSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryFinalCollagePage() {
  return (
    <div className="w-full">
      <FinalHeartSection
        startDate={defaultGiftConfig.dateOfficialCouple || defaultGiftConfig.dateFirstMet}
        milestones={defaultGiftConfig.customMilestones}
        finalLetter={defaultGiftConfig.finalLetter}
        finalMessage={defaultGiftConfig.finalMessage}
        senderName={defaultGiftConfig.senderNickname || defaultGiftConfig.senderName}
      />
      <StoryChapterFooter />
    </div>
  );
}
