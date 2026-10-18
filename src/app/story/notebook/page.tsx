"use client";

import { NotebookSection } from "@/components/sections/NotebookSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryNotebookPage() {
  return (
    <div className="w-full">
      <NotebookSection />
      <StoryChapterFooter />
    </div>
  );
}
