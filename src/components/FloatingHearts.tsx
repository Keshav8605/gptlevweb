"use client";

import { useSyncExternalStore } from "react";

interface FloatingHeartItem {
  id: number;
  x: number; // percentage left across screen (0 - 100%)
  size: number; // delicate small size: 9px - 16px
  opacity: number; // classy, translucent romantic opacity
  duration: number; // floating duration: 15s - 26s
  delay: number; // negative delay so hearts are pre-distributed on load
  sway: number; // horizontal sway distance (-20px to +20px)
  rot: number; // subtle rotation angle (-15deg to +15deg)
  color: string;
  isOutline?: boolean;
  hideOnMobile?: boolean;
}

// 22 delicately calibrated small pink love hearts
const ambientHearts: FloatingHeartItem[] = [
  { id: 1, x: 3, size: 11, opacity: 0.28, duration: 18, delay: -3, sway: 14, rot: 12, color: "#FF85A1" },
  { id: 2, x: 8, size: 14, opacity: 0.22, duration: 22, delay: -11, sway: -18, rot: -10, color: "#FFA6C1" },
  { id: 3, x: 14, size: 9, opacity: 0.32, duration: 16, delay: -7, sway: 12, rot: 8, color: "#FF6584" },
  { id: 4, x: 19, size: 13, opacity: 0.25, duration: 20, delay: -15, sway: -14, rot: -14, color: "#FDA4AF" },
  { id: 5, x: 25, size: 10, opacity: 0.30, duration: 17, delay: -4, sway: 16, rot: 10, color: "#F472B6", isOutline: true },
  { id: 6, x: 31, size: 15, opacity: 0.20, duration: 24, delay: -19, sway: -16, rot: -8, color: "#FF85A1" },
  { id: 7, x: 37, size: 12, opacity: 0.28, duration: 19, delay: -8, sway: 15, rot: 15, color: "#FFA6C1" },
  { id: 8, x: 43, size: 9, opacity: 0.34, duration: 15, delay: -13, sway: -12, rot: -12, color: "#FF6584" },
  { id: 9, x: 49, size: 14, opacity: 0.24, duration: 21, delay: -2, sway: 18, rot: 9, color: "#FDA4AF" },
  { id: 10, x: 55, size: 11, opacity: 0.28, duration: 18, delay: -16, sway: -15, rot: -15, color: "#F472B6", isOutline: true },
  { id: 11, x: 61, size: 13, opacity: 0.26, duration: 23, delay: -6, sway: 14, rot: 11, color: "#FF85A1" },
  { id: 12, x: 67, size: 10, opacity: 0.32, duration: 16, delay: -12, sway: -16, rot: -9, color: "#FFA6C1" },
  { id: 13, x: 73, size: 16, opacity: 0.22, duration: 25, delay: -21, sway: 20, rot: 14, color: "#FF6584" },
  { id: 14, x: 79, size: 12, opacity: 0.28, duration: 19, delay: -5, sway: -13, rot: -11, color: "#FDA4AF" },
  { id: 15, x: 85, size: 9, opacity: 0.34, duration: 17, delay: -14, sway: 15, rot: 13, color: "#F472B6" },
  { id: 16, x: 91, size: 14, opacity: 0.24, duration: 22, delay: -9, sway: -17, rot: -13, color: "#FF85A1" },
  { id: 17, x: 96, size: 11, opacity: 0.30, duration: 18, delay: -18, sway: 12, rot: 10, color: "#FFA6C1", isOutline: true },
  // Additional subtle depth layers for larger viewports
  { id: 18, x: 6, size: 12, opacity: 0.24, duration: 20, delay: -17, sway: 16, rot: -10, color: "#FF85A1", hideOnMobile: true },
  { id: 19, x: 22, size: 15, opacity: 0.20, duration: 26, delay: -10, sway: -20, rot: 12, color: "#FDA4AF", hideOnMobile: true },
  { id: 20, x: 46, size: 10, opacity: 0.32, duration: 16, delay: -23, sway: 13, rot: -14, color: "#FF6584", hideOnMobile: true },
  { id: 21, x: 70, size: 13, opacity: 0.26, duration: 21, delay: -1, sway: -15, rot: 10, color: "#FFA6C1", hideOnMobile: true },
  { id: 22, x: 88, size: 11, opacity: 0.30, duration: 17, delay: -20, sway: 14, rot: -8, color: "#F472B6", hideOnMobile: true },
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
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none"
      aria-hidden="true"
      suppressHydrationWarning
    >
      {ambientHearts.map((h) => (
        <div
          key={h.id}
          className={`absolute ${h.hideOnMobile ? "hidden sm:block" : ""}`}
          style={
            {
              left: `${h.x}%`,
              top: 0,
              animation: `floatHeartGentle ${h.duration}s linear infinite`,
              animationDelay: `${h.delay}s`,
              ["--target-opacity" as string]: h.opacity,
              ["--sway-x" as string]: `${h.sway}px`,
              ["--rot" as string]: `${h.rot}deg`,
              willChange: "transform, opacity",
            } as React.CSSProperties
          }
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.isOutline ? "none" : h.color}
            stroke={h.isOutline ? h.color : "none"}
            strokeWidth={h.isOutline ? 1.8 : 0}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(255, 95, 150, 0.22))",
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      <style jsx global>{`
        @keyframes floatHeartGentle {
          0% {
            transform: translate3d(0, 106vh, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          8% {
            opacity: var(--target-opacity, 0.28);
          }
          32% {
            transform: translate3d(var(--sway-x, 12px), 70vh, 0) rotate(var(--rot, 8deg)) scale(1);
          }
          65% {
            transform: translate3d(calc(var(--sway-x, 12px) * -0.7), 35vh, 0) rotate(calc(var(--rot, 8deg) * -0.8)) scale(1.03);
          }
          88% {
            opacity: var(--target-opacity, 0.28);
          }
          100% {
            transform: translate3d(calc(var(--sway-x, 12px) * 0.4), -10vh, 0) rotate(var(--rot, 8deg)) scale(0.9);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fixed [style*="floatHeartGentle"] {
            animation: none !important;
            opacity: 0.15 !important;
            transform: translate3d(0, 50vh, 0) !important;
          }
        }
      `}</style>
    </div>
  );
}
