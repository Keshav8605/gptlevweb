"use client";

import { OurSongSection } from "@/components/sections/OurSongSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";

export default function StoryOurSongPage() {
  if (!defaultGiftConfig.featuredSong) return null;

  return (
    <div className="w-full">
      <OurSongSection
        featuredSong={defaultGiftConfig.featuredSong}
        additionalSongs={defaultGiftConfig.additionalSongs}
      />
      <StoryChapterFooter />
    </div>
  );
}
