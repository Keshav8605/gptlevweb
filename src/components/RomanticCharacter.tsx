"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ROMANTIC_CHARACTERS, CharacterIdentifier } from "@/config/characterAssets";

export interface RomanticCharacterProps {
  character: CharacterIdentifier;
  alt?: string;
  decorative?: boolean;
  size?: number;
  width?: number;
  height?: number;
  animation?: "gentle-float" | "soft-breathe" | "subtle-tilt" | "none";
  hoverResponse?: boolean;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  sparkles?: boolean;
}

export function RomanticCharacter({
  character,
  alt,
  decorative = true,
  size,
  width,
  height,
  animation = "gentle-float",
  hoverResponse = true,
  className = "",
  priority = false,
  onClick,
  sparkles = false,
}: RomanticCharacterProps) {
  const config = ROMANTIC_CHARACTERS[character] || ROMANTIC_CHARACTERS.kissingCouple;
  const [clickedHearts, setClickedHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Dimension calculation
  const computedWidth = width || size || config.defaultWidth;
  // Compute height maintaining aspect ratio if size/width was given
  const ratioParts = config.aspectRatio.split("/").map((p) => parseFloat(p.trim()));
  const aspect = ratioParts.length === 2 && ratioParts[1] ? ratioParts[0] / ratioParts[1] : 1;
  const computedHeight = height || Math.round(computedWidth / aspect);

  // Animation class mapping
  const animationClass =
    animation === "gentle-float"
      ? "animate-gentle-float"
      : animation === "soft-breathe"
      ? "animate-soft-breathe"
      : animation === "subtle-tilt"
      ? "animate-subtle-tilt"
      : "";

  const hoverClass = hoverResponse
    ? "transition-all duration-300 ease-out hover:scale-[1.05] hover:drop-shadow-[0_8px_20px_rgba(255,95,150,0.18)]"
    : "";

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick();
    }
    // Release a few tiny heart bursts on click
    if (sparkles || onClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const newHearts = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i,
        x: clickX + (Math.random() * 40 - 20),
        y: clickY + (Math.random() * 20 - 10),
      }));
      setClickedHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setClickedHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 900);
    }
  };

  return (
    <div
      onClick={onClick || sparkles ? handleClick : undefined}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{ width: computedWidth, height: computedHeight }}
      role={decorative ? "presentation" : undefined}
      aria-hidden={decorative ? "true" : undefined}
    >
      <div
        className={`relative w-full h-full flex items-center justify-center ${animationClass} ${hoverClass}`}
      >
        <Image
          src={config.src}
          alt={decorative ? "" : alt || config.alt}
          width={computedWidth}
          height={computedHeight}
          priority={priority}
          unoptimized // preserves pixel precision of transparent PNG
          className="object-contain max-w-full max-h-full pointer-events-none drop-shadow-[0_4px_12px_rgba(255,182,193,0.15)]"
        />
      </div>

      {/* Tiny heart bursts on interaction */}
      {clickedHearts.map((h) => (
        <span
          key={h.id}
          className="absolute pointer-events-none text-pink-500 animate-float text-sm z-30"
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            animationDuration: "0.85s",
          }}
        >
          ♡
        </span>
      ))}
    </div>
  );
}

export default RomanticCharacter;
