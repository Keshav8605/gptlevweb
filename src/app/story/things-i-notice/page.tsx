"use client";

import { ObservationsSection } from "@/components/sections/ObservationsSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryObservationsPage() {
  return (
    <div className="w-full">
      <ObservationsSection observations={defaultGiftConfig.observations} />
      <StoryChapterFooter />
    </div>
  );
}
