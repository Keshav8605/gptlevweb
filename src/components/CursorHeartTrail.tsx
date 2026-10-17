"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";

interface TrailHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  type: "heart" | "sparkle" | "flower";
}

const emptySubscribe = () => () => {};

export function CursorHeartTrail() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [hearts, setHearts] = useState<TrailHeart[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const idCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!isClient) return;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const colors = [
      "var(--pink-primary, #FF5F96)",
      "var(--pink-strong, #E84D85)",
      "var(--light-rose, #FFCADB)",
      "var(--lavender, #EDE2FA)",
      "#FF94BA",
      "#FBCFE8",
    ];

    const types: ("heart" | "sparkle" | "flower")[] = [
      "heart",
      "heart",
      "heart",
      "sparkle",
      "flower",
    ];

    const spawnHeart = (x: number, y: number, count = 1) => {
      const newHearts: TrailHeart[] = [];
      for (let i = 0; i < count; i++) {
        idCounterRef.current += 1;
        const offsetDist = count > 1 ? (Math.random() - 0.5) * 36 : (Math.random() - 0.5) * 16;
        newHearts.push({
          id: idCounterRef.current,
          x: x + offsetDist,
          y: y + offsetDist,
          size: Math.floor(Math.random() * 8) + 12, // 12px - 20px
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: (Math.random() - 0.5) * 45,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }

      setHearts((prev) => [...prev.slice(-25), ...newHearts]);

      // Remove after 900ms
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 900);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      const dist = Math.hypot(e.clientX - lastPosRef.current.x, e.clientY - lastPosRef.current.y);

      // Throttle: only create if pointer moved at least 22px and at least 70ms passed
      if (dist > 22 && now - lastPosRef.current.time > 70) {
        lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
        spawnHeart(e.clientX, e.clientY, 1);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Tap or click bursts 3 little hearts
      spawnHeart(e.clientX, e.clientY, 3);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isClient]);

  if (!isClient || hearts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
      suppressHydrationWarning
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            animation: "cursorFloat 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
          }}
        >
          {heart.type === "heart" ? (
            <svg
              width={heart.size}
              height={heart.size}
              viewBox="0 0 24 24"
              fill={heart.color}
              style={{
                transform: `rotate(${heart.rotation}deg)`,
                filter: "drop-shadow(0 2px 4px rgba(255, 95, 150, 0.3))",
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : heart.type === "sparkle" ? (
            <svg
              width={heart.size}
              height={heart.size}
              viewBox="0 0 24 24"
              fill={heart.color}
              style={{
                transform: `rotate(${heart.rotation}deg)`,
              }}
            >
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          ) : (
            <span
              style={{
                fontSize: `${heart.size}px`,
                display: "inline-block",
                transform: `rotate(${heart.rotation}deg)`,
              }}
            >
              🌸
            </span>
          )}
        </div>
      ))}

      <style jsx global>{`
        @keyframes cursorFloat {
          0% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(0.6) translateY(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1) translateY(-18px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8) translateY(-42px);
          }
        }
      `}</style>
    </div>
  );
}
