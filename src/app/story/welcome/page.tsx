"use client";

import { WelcomeExperience } from "@/components/sections/WelcomeExperience";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";
import { defaultGiftConfig } from "@/lib/gift-data";
import { useStoryTransition } from "@/context/StoryTransitionContext";

export default function StoryWelcomePage() {
  const { navigateWithTransition } = useStoryTransition();

  const handleEnterWorld = () => {
    navigateWithTransition("things-i-notice", "heart-portal");
  };

  return (
    <div className="w-full">
      <WelcomeExperience
        recipientNickname={defaultGiftConfig.recipientNickname}
        title={defaultGiftConfig.welcomeTitle}
        subtitle={defaultGiftConfig.welcomeSubtitle}
        message={defaultGiftConfig.welcomeMessage}
        polaroids={defaultGiftConfig.welcomePolaroids}
        onEnter={handleEnterWorld}
      />
      <StoryChapterFooter />
    </div>
  );
}
