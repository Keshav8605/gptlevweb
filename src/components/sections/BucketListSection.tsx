"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SectionWrapper } from "../SectionWrapper";
import { RomanticCharacter } from "../RomanticCharacter";
import type { BucketListItem } from "@/lib/gift-data";

interface BucketListSectionProps {
  items: BucketListItem[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  idea: { label: "Dream", color: "var(--text-muted)", bg: "var(--bg-surface)", emoji: "💭" },
  shortlisted: { label: "Shortlisted", color: "var(--pink-strong)", bg: "var(--pale-rose)", emoji: "⭐" },
  planned: { label: "Planned!", color: "#6B8E5D", bg: "#E5F0E0", emoji: "📅" },
  completed: { label: "Done!", color: "#8B7EC0", bg: "var(--lavender)", emoji: "✅" },
};

export function BucketListSection({ items }: BucketListSectionProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredItems = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <SectionWrapper
      id="bucketList"
      title="Someday, With You"
      subtitle="All the adventures waiting for us"
      emoji="🌈"
      bgVariant="default"
    >
      {/* Cozy dreams character companion */}
      <div className="flex justify-center -mt-3 mb-6">
        <RomanticCharacter
          character="cozyCouple"
          size={140}
          animation="gentle-float"
          sparkles
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {["all", "idea", "shortlisted", "planned", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
            style={{
              background: filter === status
                ? "linear-gradient(135deg, var(--pink-primary), var(--pink-strong))"
                : "var(--white)",
              color: filter === status ? "white" : "var(--text-secondary)",
              border: `1px solid ${filter === status ? "var(--pink-strong)" : "var(--border-subtle)"}`,
            }}
          >
            {status === "all" ? "All ✨" : `${statusConfig[status].emoji} ${statusConfig[status].label}`}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {filteredItems.map((item, i) => {
          const config = statusConfig[item.status];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ x: 4 }}
              className="rounded-2xl p-5 md:p-6 flex items-start gap-4 group"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 2px 12px var(--shadow-pink)",
              }}
            >
              {/* Status emoji */}
              <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-200">
                {config.emoji}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3
                    className="font-serif text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: config.bg, color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>

                {item.description && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
                  >
                    {item.description}
                  </p>
                )}

                {item.targetDate && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    🗓️ Target: {item.targetDate}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-4">🌟</span>
          <p style={{ color: "var(--text-muted)" }}>No items in this category yet</p>
        </div>
      )}
    </SectionWrapper>
  );
}
