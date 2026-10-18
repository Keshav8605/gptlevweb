"use client";

import { QuizSection } from "@/components/sections/QuizSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryQuizPage() {
  return (
    <div className="w-full">
      <QuizSection />
      <StoryChapterFooter />
    </div>
  );
}
