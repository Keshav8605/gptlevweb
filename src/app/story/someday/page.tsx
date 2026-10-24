"use client";

import { BucketListSection } from "@/components/sections/BucketListSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StorySomedayPage() {
  return (
    <div className="w-full">
      <BucketListSection items={defaultGiftConfig.bucketListItems || []} />
      <StoryChapterFooter />
    </div>
  );
}
