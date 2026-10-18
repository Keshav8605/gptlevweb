"use client";

import { VoiceMessageSection } from "@/components/sections/VoiceMessageSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryVoiceMessagesPage() {
  return (
    <div className="w-full">
      <VoiceMessageSection />
      <StoryChapterFooter />
    </div>
  );
}
