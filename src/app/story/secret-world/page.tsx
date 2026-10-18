"use client";

import { SecretWorldSection } from "@/components/sections/SecretWorldSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StorySecretWorldPage() {
  return (
    <div className="w-full">
      <SecretWorldSection initialHint={defaultGiftConfig.secretHint} />
      <StoryChapterFooter />
    </div>
  );
}
