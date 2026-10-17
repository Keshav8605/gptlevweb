"use client";

import { useSyncExternalStore } from "react";

interface AmbientParticle {
  id: number;
  x: number; // percentage left
  y: number; // percentage top
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  type: "heart" | "sparkle" | "star" | "petal";
  swayDistance: number;
}

const particles: AmbientParticle[] = [
  { id: 1, x: 5, y: 85, size: 14, opacity: 0.18, duration: 16, delay: 0, color: "#FF5F96", type: "heart", swayDistance: 15 },
  { id: 2, x: 14, y: 70, size: 10, opacity: 0.22, duration: 18, delay: 2, color: "#EDE2FA", type: "sparkle", swayDistance: -12 },
  { id: 3, x: 24, y: 92, size: 8, opacity: 0.25, duration: 13, delay: 4, color: "#FFCADB", type: "star", swayDistance: 10 },
  { id: 4, x: 34, y: 78, size: 16, opacity: 0.16, duration: 19, delay: 1, color: "#E84D85", type: "heart", swayDistance: -18 },
  { id: 5, x: 45, y: 88, size: 12, opacity: 0.2, duration: 22, delay: 5, color: "#EDE2FA", type: "sparkle", swayDistance: 14 },
  { id: 6, x: 55, y: 65, size: 11, opacity: 0.22, duration: 15, delay: 3, color: "#FFCADB", type: "petal", swayDistance: -10 },
  { id: 7, x: 67, y: 82, size: 18, opacity: 0.14, duration: 18, delay: 6, color: "#FF5F96", type: "heart", swayDistance: 20 },
  { id: 8, x: 76, y: 90, size: 12, opacity: 0.18, duration: 17, delay: 2.5, color: "#F7F0FF", type: "sparkle", swayDistance: -15 },
  { id: 9, x: 86, y: 75, size: 10, opacity: 0.24, duration: 21, delay: 4.5, color: "#E84D85", type: "star", swayDistance: 12 },
  { id: 10, x: 94, y: 84, size: 15, opacity: 0.16, duration: 16, delay: 1.5, color: "#FFCADB", type: "heart", swayDistance: -14 },
  { id: 11, x: 18, y: 40, size: 13, opacity: 0.15, duration: 23, delay: 3.5, color: "#EDE2FA", type: "heart", swayDistance: 16 },
  { id: 12, x: 28, y: 30, size: 10, opacity: 0.2, duration: 17, delay: 5.5, color: "#FF5F96", type: "sparkle", swayDistance: -11 },
  { id: 13, x: 60, y: 35, size: 14, opacity: 0.16, duration: 19, delay: 0.5, color: "#FFCADB", type: "heart", swayDistance: 15 },
  { id: 14, x: 80, y: 25, size: 9, opacity: 0.22, duration: 20, delay: 6.2, color: "#EDE2FA", type: "star", swayDistance: -13 },
  { id: 15, x: 90, y: 45, size: 11, opacity: 0.2, duration: 15, delay: 2.8, color: "#FFCADB", type: "petal", swayDistance: 12 },
  { id: 16, x: 3, y: 20, size: 16, opacity: 0.14, duration: 21, delay: 4.2, color: "#FF5F96", type: "heart", swayDistance: -16 },
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
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `ambientDrift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.type === "heart" ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
              style={{
                filter: "drop-shadow(0 2px 4px rgba(255, 95, 150, 0.25))",
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : p.type === "sparkle" ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
            >
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          ) : p.type === "star" ? (
            <svg
              width={p.size * 0.9}
              height={p.size * 0.9}
              viewBox="0 0 24 24"
              fill={p.color}
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ) : (
            <span
              style={{
                fontSize: `${p.size}px`,
                display: "inline-block",
                filter: "drop-shadow(0 1px 2px rgba(255, 150, 180, 0.3))",
              }}
            >
              🌸
            </span>
          )}
        </div>
      ))}

      <style jsx global>{`
        @keyframes ambientDrift {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-25px) translateX(12px) rotate(8deg);
          }
          66% {
            transform: translateY(-50px) translateX(-10px) rotate(-6deg);
          }
          100% {
            transform: translateY(-80px) translateX(6px) rotate(4deg);
          }
        }
      `}</style>
    </div>
  );
}
