"use client";

import React from "react";

/**
 * Adorable character illustrations inspired by Bubu & Dudu style
 * Pure SVG vectors with soft pastel fills, rosy cheeks, and gentle micro-animations.
 */

interface IllustrationProps {
  className?: string;
  size?: number;
}

// 1. Teddy Bear & Panda Sitting Together (Inspired by Reference 2)
export function BubuDuduSittingTogether({ className = "", size = 180 }: IllustrationProps) {
  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size * 0.65 }}>
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Soft shadow underneath */}
        <ellipse cx="120" cy="148" rx="85" ry="10" fill="#E8B4C9" opacity="0.4" />

        {/* --- LEFT: Cute Brown Teddy Bear (Dudu) --- */}
        <g className="animate-bob" style={{ transformOrigin: "85px 95px" }}>
          {/* Bear Ears */}
          <circle cx="58" cy="52" r="14" fill="#C49A7A" stroke="#4A2E20" strokeWidth="3" />
          <circle cx="58" cy="52" r="8" fill="#E8C4A8" />
          <circle cx="108" cy="50" r="14" fill="#C49A7A" stroke="#4A2E20" strokeWidth="3" />
          <circle cx="108" cy="50" r="8" fill="#E8C4A8" />

          {/* Bear Body */}
          <ellipse cx="85" cy="118" rx="36" ry="28" fill="#DDB08E" stroke="#4A2E20" strokeWidth="3" />
          <ellipse cx="85" cy="120" rx="22" ry="16" fill="#F3DCBE" />

          {/* Bear Feet */}
          <ellipse cx="62" cy="142" rx="14" ry="9" fill="#C49A7A" stroke="#4A2E20" strokeWidth="3" />
          <ellipse cx="100" cy="142" rx="14" ry="9" fill="#C49A7A" stroke="#4A2E20" strokeWidth="3" />

          {/* Bear Head */}
          <ellipse cx="83" cy="80" rx="35" ry="30" fill="#DDB08E" stroke="#4A2E20" strokeWidth="3" />

          {/* Bear Face: Eyes & Snout */}
          <circle cx="72" cy="78" r="4" fill="#2D1A10" />
          <circle cx="71" cy="76" r="1.5" fill="#FFFFFF" />
          <circle cx="94" cy="78" r="4" fill="#2D1A10" />
          <circle cx="93" cy="76" r="1.5" fill="#FFFFFF" />

          {/* Bear Snout */}
          <ellipse cx="83" cy="88" rx="10" ry="7" fill="#F3DCBE" />
          <ellipse cx="83" cy="85" rx="4" ry="2.5" fill="#4A2E20" />
          <path d="M83 87.5V91M80 91C81.5 92.5 84.5 92.5 86 91" stroke="#4A2E20" strokeWidth="2" strokeLinecap="round" />

          {/* Bear Blush */}
          <ellipse cx="64" cy="86" rx="6" ry="3.5" fill="#FF8BA7" opacity="0.7" />
          <ellipse cx="102" cy="86" rx="6" ry="3.5" fill="#FF8BA7" opacity="0.7" />

          {/* Bear Arms holding tiny nail polish bottle */}
          <path d="M102 96C112 98 118 106 114 112" stroke="#4A2E20" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="114" cy="112" rx="6" ry="5" fill="#DDB08E" stroke="#4A2E20" strokeWidth="2.5" />
        </g>

        {/* Tiny nail polish bottle being shared */}
        <g>
          <rect x="117" y="106" width="6" height="11" rx="2" fill="#FF5F96" stroke="#4A2E20" strokeWidth="1.5" />
          <rect x="119" y="101" width="2" height="5" fill="#4A2E20" />
        </g>

        {/* --- RIGHT: Cute White Panda (Bubu) --- */}
        <g className="animate-bob" style={{ transformOrigin: "155px 95px", animationDelay: "-1.5s" }}>
          {/* Panda Black Ears */}
          <circle cx="132" cy="48" r="14" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />
          <circle cx="182" cy="50" r="14" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />

          {/* Panda Body */}
          <ellipse cx="155" cy="118" rx="36" ry="28" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />

          {/* Panda Feet */}
          <ellipse cx="140" cy="142" rx="14" ry="9" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />
          <ellipse cx="178" cy="142" rx="14" ry="9" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />

          {/* Panda Head */}
          <ellipse cx="155" cy="80" rx="35" ry="30" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />

          {/* Panda Eyes with dark eye patches */}
          <ellipse cx="142" cy="78" rx="7" ry="8" fill="#2E242B" transform="rotate(-10 142 78)" />
          <circle cx="143" cy="78" r="3" fill="#FFFFFF" />
          <circle cx="144" cy="77" r="1.5" fill="#2E242B" />

          <ellipse cx="168" cy="78" rx="7" ry="8" fill="#2E242B" transform="rotate(10 168 78)" />
          <circle cx="167" cy="78" r="3" fill="#FFFFFF" />
          <circle cx="166" cy="77" r="1.5" fill="#2E242B" />

          {/* Panda Snout & Smiling Mouth */}
          <ellipse cx="155" cy="85" rx="3.5" ry="2.5" fill="#1A1218" />
          <path d="M152 89C153.5 91 156.5 91 158 89" stroke="#1A1218" strokeWidth="2" strokeLinecap="round" />

          {/* Panda Cute Rosy Blush */}
          <ellipse cx="136" cy="87" rx="7" ry="4" fill="#FF8BA7" opacity="0.8" />
          <ellipse cx="174" cy="87" rx="7" ry="4" fill="#FF8BA7" opacity="0.8" />

          {/* Panda Paws holding out paw */}
          <ellipse cx="127" cy="114" rx="7" ry="6" fill="#2E242B" stroke="#1A1218" strokeWidth="2.5" />
        </g>

        {/* Floating Mini Hearts above them */}
        <g className="animate-pulse-soft">
          <path
            d="M118 42C116 38 111 38 109 42C107 46 111 50 118 55C125 50 129 46 127 42C125 38 120 38 118 42Z"
            fill="#FF5F96"
          />
          <path
            d="M130 30C128.5 27 124.5 27 123 30C121.5 33 124.5 36 130 40C135.5 36 138.5 33 137 30C135.5 27 131.5 27 130 30Z"
            fill="#FFCADB"
          />
        </g>
      </svg>
    </div>
  );
}

// 2. Panda Hugging Giant Pink Heart (Inspired by Reference 3)
export function PandaHuggingHeart({ className = "", size = 160, heartText = "I Love You" }: IllustrationProps & { heartText?: string }) {
  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size * 0.95 }}>
      <svg
        viewBox="0 0 200 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Soft Shadow */}
        <ellipse cx="100" cy="180" rx="65" ry="8" fill="#E8B4C9" opacity="0.4" />

        {/* Panda Head & Body behind heart */}
        <g className="animate-bob">
          {/* Black Ears */}
          <circle cx="58" cy="45" r="18" fill="#2E242B" stroke="#1A1218" strokeWidth="3.5" />
          <circle cx="142" cy="45" r="18" fill="#2E242B" stroke="#1A1218" strokeWidth="3.5" />

          {/* Head */}
          <ellipse cx="100" cy="78" rx="48" ry="42" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3.5" />

          {/* Left Eye: Winking! */}
          <path d="M72 76C75 72 82 72 85 76" stroke="#1A1218" strokeWidth="3.5" strokeLinecap="round" />

          {/* Right Eye: Wide open sparkly */}
          <ellipse cx="120" cy="74" rx="7" ry="8.5" fill="#2E242B" />
          <circle cx="122" cy="73" r="3.5" fill="#FFFFFF" />
          <circle cx="123" cy="77" r="1.5" fill="#FFFFFF" />

          {/* Nose & Cute Open Happy Mouth */}
          <ellipse cx="98" cy="83" rx="4" ry="3" fill="#1A1218" />
          <path d="M93 88C95 94 101 94 103 88" fill="#FF5F96" stroke="#1A1218" strokeWidth="2.5" strokeLinecap="round" />

          {/* Big Rosy Blushes */}
          <ellipse cx="72" cy="88" rx="9" ry="5.5" fill="#FF8BA7" opacity="0.85" />
          <ellipse cx="126" cy="88" rx="9" ry="5.5" fill="#FF8BA7" opacity="0.85" />

          {/* Waving Paw on right */}
          <path d="M142 85C152 75 160 80 156 92C152 100 144 98 140 92" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />
        </g>

        {/* Big Pink Hugged Heart */}
        <g className="animate-pulse-soft">
          <path
            d="M100 162C45 125 35 88 55 68C72 50 94 62 100 74C106 62 128 50 145 68C165 88 155 125 100 162Z"
            fill="url(#heartGradient)"
            stroke="#1A1218"
            strokeWidth="3.5"
          />

          {/* Text inside Heart */}
          <text
            x="100"
            y="114"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Fredoka', 'Nunito', sans-serif"
            fontWeight="bold"
            fontSize="18"
            letterSpacing="0.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}
          >
            {heartText}
          </text>

          {/* Panda Paws holding heart */}
          <ellipse cx="62" cy="115" rx="9" ry="8" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />
          <ellipse cx="138" cy="115" rx="9" ry="8" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="heartGradient" x1="50" y1="60" x2="150" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7CA3" />
            <stop offset="1" stopColor="#E84D85" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// 3. Shy Happy Panda with Hands Together (Inspired by Reference 4)
export function ShyHappyPanda({ className = "", size = 140 }: IllustrationProps) {
  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size * 0.9 }}>
      <svg
        viewBox="0 0 160 145"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Soft ground shadow */}
        <ellipse cx="80" cy="138" rx="45" ry="6" fill="#E8B4C9" opacity="0.35" />

        <g className="animate-bob">
          {/* Black Ears */}
          <circle cx="42" cy="38" r="14" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />
          <circle cx="118" cy="38" r="14" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />

          {/* Body */}
          <ellipse cx="80" cy="108" rx="35" ry="26" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />

          {/* Head */}
          <ellipse cx="80" cy="70" rx="42" ry="36" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />

          {/* Cute Happy Arched Eyes (closed smiling) */}
          <path d="M58 66C61 62 67 62 70 66" stroke="#1A1218" strokeWidth="3" strokeLinecap="round" />
          <path d="M90 66C93 62 99 62 102 66" stroke="#1A1218" strokeWidth="3" strokeLinecap="round" />

          {/* Nose & Sweet Cat-like Mouth :3 */}
          <ellipse cx="80" cy="72" rx="3" ry="2" fill="#1A1218" />
          <path d="M74 76C76.5 78.5 79.5 78.5 80 76C80.5 78.5 83.5 78.5 86 76" stroke="#1A1218" strokeWidth="2" strokeLinecap="round" />

          {/* Rosy Cheeks */}
          <ellipse cx="56" cy="76" rx="8" ry="4.5" fill="#FF8BA7" opacity="0.8" />
          <ellipse cx="104" cy="76" rx="8" ry="4.5" fill="#FF8BA7" opacity="0.8" />

          {/* Shy Paws held together under chin */}
          <ellipse cx="73" cy="98" rx="7" ry="9" fill="#FFFFFF" stroke="#1A1218" strokeWidth="2.5" transform="rotate(-15 73 98)" />
          <ellipse cx="87" cy="98" rx="7" ry="9" fill="#FFFFFF" stroke="#1A1218" strokeWidth="2.5" transform="rotate(15 87 98)" />
        </g>

        {/* Tiny Sparkles around */}
        <g className="animate-pulse-soft">
          <circle cx="28" cy="50" r="2.5" fill="#FF5F96" />
          <circle cx="135" cy="46" r="3" fill="#FF5F96" />
          <circle cx="128" cy="85" r="2" fill="#EDE2FA" />
        </g>
      </svg>
    </div>
  );
}

// 4. Loving Bears Hugging Tight (Inspired by Reference 5 "YAYYY I knew it all along")
export function BearPandaHuggingLoving({ className = "", size = 160 }: IllustrationProps) {
  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size * 0.9 }}>
      <svg
        viewBox="0 0 180 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <ellipse cx="90" cy="150" rx="55" ry="8" fill="#E8B4C9" opacity="0.4" />

        <g className="animate-heartbeat">
          {/* Brown Bear (behind hugging) */}
          <circle cx="120" cy="46" r="14" fill="#C49A7A" stroke="#4A2E20" strokeWidth="3" />
          <circle cx="120" cy="46" r="8" fill="#E8C4A8" />
          <ellipse cx="115" cy="95" rx="34" ry="32" fill="#DDB08E" stroke="#4A2E20" strokeWidth="3" />

          {/* Bear Face enjoying hug */}
          <ellipse cx="112" cy="75" rx="28" ry="25" fill="#DDB08E" stroke="#4A2E20" strokeWidth="3" />
          <path d="M116 72C118 69 123 69 125 72" stroke="#4A2E20" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="125" cy="78" rx="6" ry="3.5" fill="#FF8BA7" opacity="0.8" />

          {/* White Panda (hugging into bear) */}
          <circle cx="56" cy="48" r="14" fill="#2E242B" stroke="#1A1218" strokeWidth="3" />
          <ellipse cx="70" cy="98" rx="35" ry="32" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />
          <ellipse cx="68" cy="78" rx="30" ry="26" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />

          {/* Panda closed happy eyes */}
          <path d="M56 75C58 71 63 71 65 75" stroke="#1A1218" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="54" cy="82" rx="7" ry="4" fill="#FF8BA7" opacity="0.8" />

          {/* Arms wrapping around each other */}
          <path d="M85 88C95 86 106 92 104 100C102 108 88 108 80 102" fill="#DDB08E" stroke="#4A2E20" strokeWidth="3" />
          <path d="M58 92C68 90 78 94 76 102C74 110 60 110 52 104" fill="#FFFFFF" stroke="#1A1218" strokeWidth="3" />
        </g>

        {/* Sweet Heart Floating above */}
        <g className="animate-pulse-soft">
          <path
            d="M90 28C88 23 81 23 79 28C77 33 82 38 90 44C98 38 103 33 101 28C99 23 92 23 90 28Z"
            fill="#FF5F96"
          />
        </g>
      </svg>
    </div>
  );
}

// 5. Cute Bear Holding a Flower
export function LittleBearHoldingFlower({ className = "", size = 120 }: IllustrationProps) {
  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <ellipse cx="60" cy="110" rx="35" ry="5" fill="#E8B4C9" opacity="0.3" />
        <g className="animate-bob">
          <circle cx="42" cy="38" r="10" fill="#C49A7A" stroke="#4A2E20" strokeWidth="2" />
          <circle cx="78" cy="38" r="10" fill="#C49A7A" stroke="#4A2E20" strokeWidth="2" />
          <ellipse cx="60" cy="62" rx="26" ry="22" fill="#DDB08E" stroke="#4A2E20" strokeWidth="2.5" />
          <circle cx="53" cy="60" r="3" fill="#2D1A10" />
          <circle cx="67" cy="60" r="3" fill="#2D1A10" />
          <ellipse cx="60" cy="67" rx="8" ry="5.5" fill="#F3DCBE" />
          <ellipse cx="60" cy="65" rx="3" ry="2" fill="#4A2E20" />
          <ellipse cx="48" cy="66" rx="5" ry="3" fill="#FF8BA7" opacity="0.8" />
          <ellipse cx="72" cy="66" rx="5" ry="3" fill="#FF8BA7" opacity="0.8" />
          <ellipse cx="60" cy="90" rx="22" ry="18" fill="#DDB08E" stroke="#4A2E20" strokeWidth="2.5" />
          <ellipse cx="60" cy="90" rx="14" ry="11" fill="#F3DCBE" />

          {/* Little Flower in paw */}
          <path d="M74 88C78 84 84 76 82 70" stroke="#48BB78" strokeWidth="2" strokeLinecap="round" />
          <circle cx="82" cy="68" r="4" fill="#FFD700" />
          <circle cx="82" cy="62" r="3.5" fill="#FF5F96" />
          <circle cx="87" cy="66" r="3.5" fill="#FF5F96" />
          <circle cx="86" cy="72" r="3.5" fill="#FF5F96" />
          <circle cx="78" cy="72" r="3.5" fill="#FF5F96" />
          <circle cx="77" cy="66" r="3.5" fill="#FF5F96" />
        </g>
      </svg>
    </div>
  );
}
