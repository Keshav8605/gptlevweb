"use client";

import { DatePlannerSection } from "@/components/planner/DatePlannerSection";
import { StoryChapterFooter } from "@/components/story/StoryChapterFooter";

export default function StoryPlanADatePage() {
  return (
    <div className="w-full">
      <DatePlannerSection />
      <StoryChapterFooter />
    </div>
  );
}
