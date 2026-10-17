"use client";

import { useSyncExternalStore } from "react";

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  type: "heart" | "sparkle" | "dot";
}

const hearts: Heart[] = [
  { id: 1, x: 8, y: 15, size: 14, opacity: 0.12, duration: 14, delay: 0, type: "heart" },
  { id: 2, x: 22, y: 35, size: 10, opacity: 0.16, duration: 18, delay: 2, type: "sparkle" },
  { id: 3, x: 38, y: 80, size: 6, opacity: 0.22, duration: 12, delay: 4, type: "dot" },
  { id: 4, x: 50, y: 20, size: 16, opacity: 0.14, duration: 16, delay: 1, type: "heart" },
  { id: 5, x: 65, y: 60, size: 12, opacity: 0.18, duration: 20, delay: 5, type: "sparkle" },
  { id: 6, x: 78, y: 25, size: 8, opacity: 0.24, duration: 13, delay: 3, type: "dot" },
  { id: 7, x: 88, y: 75, size: 18, opacity: 0.11, duration: 17, delay: 6, type: "heart" },
  { id: 8, x: 12, y: 88, size: 12, opacity: 0.15, duration: 15, delay: 2.5, type: "heart" },
  { id: 9, x: 92, y: 18, size: 10, opacity: 0.2, duration: 19, delay: 4.5, type: "sparkle" },
  { id: 10, x: 30, y: 55, size: 7, opacity: 0.25, duration: 14, delay: 1.5, type: "dot" },
  { id: 11, x: 70, y: 90, size: 15, opacity: 0.13, duration: 21, delay: 3.5, type: "heart" },
  { id: 12, x: 45, y: 45, size: 11, opacity: 0.17, duration: 16, delay: 5.5, type: "sparkle" },
  { id: 13, x: 82, y: 48, size: 14, opacity: 0.12, duration: 15, delay: 0.5, type: "heart" },
  { id: 14, x: 26, y: 10, size: 9, opacity: 0.2, duration: 18, delay: 6.2, type: "sparkle" },
  { id: 15, x: 58, y: 72, size: 6, opacity: 0.22, duration: 13, delay: 2.8, type: "dot" },
  { id: 16, x: 3, y: 62, size: 16, opacity: 0.12, duration: 19, delay: 4.2, type: "heart" },
];

const emptySubscribe = () => () => {};

export function FloatingHearts() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      suppressHydrationWarning
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-slow"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          {heart.type === "heart" ? (
            <svg
              width={heart.size}
              height={heart.size}
              viewBox="0 0 24 24"
              fill="var(--pink-primary)"
              style={{ opacity: heart.opacity }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : heart.type === "sparkle" ? (
            <svg
              width={heart.size * 0.8}
              height={heart.size * 0.8}
              viewBox="0 0 24 24"
              fill="var(--pink-primary)"
              style={{ opacity: heart.opacity * 1.5 }}
            >
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          ) : (
            <div
              className="rounded-full"
              style={{
                width: heart.size * 0.4,
                height: heart.size * 0.4,
                backgroundColor: "var(--bg-blush)",
                opacity: heart.opacity * 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
