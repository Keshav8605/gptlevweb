"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface CollagePhoto {
  id: string;
  src: string;
  caption: string;
  r: number; // Row start (1-16)
  c: number; // Col start (1-16)
  rs: number; // Row span (height in units)
  cs: number; // Col span (width in units)
  isHero?: boolean;
  objectPosition?: string;
  gridArea?: string;
}

// 42 Curated Romantic Couple Moments forming a true Printed Photo Collage Heart Mosaic
// Exact 16-Column by 16-Row Deterministic Grid (0 overlaps, 0 interior holes).
// Prioritizes portrait-oriented photographs (2:3, 3:4, 4:5, 1:3), with select squares (1:1) and anchors.
// Center line is between column 8 and 9.
export const heartCollagePhotos: CollagePhoto[] = [
  // --- ROW 1-3: Left Lobe ---
  {
    id: "h01",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    caption: "Sunset whisper ♡",
    r: 1,
    c: 3,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h02",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "Golden hour embrace",
    r: 1,
    c: 5,
    rs: 3,
    cs: 3, // 1:1 Square
    objectPosition: "center",
  },

  // --- ROW 1-3: Right Lobe ---
  {
    id: "h03",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "Gazing into forever",
    r: 1,
    c: 10,
    rs: 3,
    cs: 3, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h04",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    caption: "Sweetest laughter",
    r: 1,
    c: 13,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },

  // --- ROW 2-4: Shoulder Outer Caps ---
  {
    id: "h05",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "Our secret smile",
    r: 2,
    c: 2,
    rs: 3,
    cs: 1, // 1:3 Tall Portrait
    objectPosition: "center",
  },
  {
    id: "h06",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    caption: "My favourite view",
    r: 2,
    c: 15,
    rs: 3,
    cs: 1, // 1:3 Tall Portrait
    objectPosition: "center",
  },

  // --- ROW 3-4: Center Cleft Bridge ---
  {
    id: "h07",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
    caption: "Heart of our story",
    r: 3,
    c: 8,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },

  // --- ROW 4-5: Broad Upper Chest ---
  {
    id: "h08",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    caption: "Autumn walks",
    r: 4,
    c: 3,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h09",
    src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80",
    caption: "Holding tight",
    r: 4,
    c: 5,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h10",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    caption: "Stolen glances",
    r: 4,
    c: 7,
    rs: 1,
    cs: 1, // 1:1 Mini Accent
    objectPosition: "center",
  },
  {
    id: "h11",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    caption: "Forever you",
    r: 4,
    c: 10,
    rs: 1,
    cs: 1, // 1:1 Mini Accent
    objectPosition: "center",
  },
  {
    id: "h12",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    caption: "Pure sunshine",
    r: 4,
    c: 11,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h13",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80",
    caption: "Little moments with you",
    r: 4,
    c: 13,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },

  // --- ROW 5-7: Widest Shoulders (Columns 1 to 16) ---
  {
    id: "h14",
    src: "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=600&q=80",
    caption: "Safe in your arms",
    r: 5,
    c: 1,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },
  {
    id: "h15",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    caption: "Road trips & mixtapes",
    r: 5,
    c: 2,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },
  {
    id: "h16",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    caption: "Dancing in the living room",
    r: 5,
    c: 15,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },
  {
    id: "h17",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    caption: "Morning coffee whispers",
    r: 5,
    c: 16,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },

  // --- ROW 5-9: GRAND CENTER HERO FOCAL ANCHOR (Center of the Heart) ---
  {
    id: "HERO",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=85",
    caption: "You & Me, Always & Forever ♡",
    r: 5,
    c: 7,
    rs: 5,
    cs: 4, // 4:5 Portrait Hero Anchor!
    isHero: true,
    objectPosition: "center",
  },

  // --- ROW 6-8: Flanking Hero Mid-Level ---
  {
    id: "h18",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
    caption: "Under the twinkling stars",
    r: 6,
    c: 3,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h19",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80",
    caption: "Forehead kisses",
    r: 6,
    c: 5,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h20",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    caption: "Laughing at bad jokes",
    r: 6,
    c: 11,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h21",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    caption: "Every day with you is magic",
    r: 6,
    c: 13,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },

  // --- ROW 8-10: Inward Incline Starts ---
  {
    id: "h22",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "Holding hands in the rain",
    r: 8,
    c: 2,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },
  {
    id: "h23",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "Forever your biggest fan",
    r: 8,
    c: 15,
    rs: 3,
    cs: 1, // 1:3 Tall
    objectPosition: "center",
  },

  // --- ROW 9-11: Mid Lower Body ---
  {
    id: "h24",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "Stargazing blanket",
    r: 9,
    c: 3,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h25",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    caption: "Sweet little memories",
    r: 9,
    c: 5,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h26",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    caption: "Never letting go",
    r: 9,
    c: 11,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },
  {
    id: "h27",
    src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80",
    caption: "Through every season",
    r: 9,
    c: 13,
    rs: 3,
    cs: 2, // 2:3 Portrait
    objectPosition: "center",
  },

  // --- ROW 10-12: Sub-Hero Anchor Directly Below Hero ---
  {
    id: "h28",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
    caption: "Just you & me",
    r: 10,
    c: 7,
    rs: 3,
    cs: 4, // 4:3 Anchor Rectangle
    objectPosition: "center",
  },

  // --- ROW 11-12: Taper Stepping Inward ---
  {
    id: "h29",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    caption: "Side by side, always",
    r: 11,
    c: 2,
    rs: 2,
    cs: 1, // 1:2 Tall
    objectPosition: "center",
  },
  {
    id: "h30",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    caption: "My sweetest dream",
    r: 11,
    c: 15,
    rs: 2,
    cs: 1, // 1:2 Tall
    objectPosition: "center",
  },

  // --- ROW 12-13: Narrowing Lower Taper (Columns 3 to 14) ---
  {
    id: "h31",
    src: "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=600&q=80",
    caption: "Cozy laughter",
    r: 12,
    c: 3,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h32",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
    caption: "Warmest hugs",
    r: 12,
    c: 5,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h33",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80",
    caption: "Every heartbeat for you",
    r: 12,
    c: 11,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h34",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    caption: "My whole heart",
    r: 12,
    c: 13,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },

  // --- ROW 13-14: Lower Inward V ---
  {
    id: "h35",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    caption: "Whispering love",
    r: 13,
    c: 7,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },
  {
    id: "h36",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    caption: "Our quiet world",
    r: 13,
    c: 9,
    rs: 2,
    cs: 2, // 1:1 Square
    objectPosition: "center",
  },

  // --- ROW 14: Flanks of the V ---
  {
    id: "h37",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "Counting stars",
    r: 14,
    c: 6,
    rs: 1,
    cs: 1, // 1:1 Accent
    objectPosition: "center",
  },
  {
    id: "h38",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    caption: "Endless horizon",
    r: 14,
    c: 11,
    rs: 1,
    cs: 1, // 1:1 Accent
    objectPosition: "center",
  },

  // --- ROW 15: Pre-Tip (Columns 7 to 10) ---
  {
    id: "h39",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "Tender moments",
    r: 15,
    c: 7,
    rs: 1,
    cs: 2, // 2:1 Mini Shelf
    objectPosition: "center",
  },
  {
    id: "h40",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "Soulmate ♡",
    r: 15,
    c: 9,
    rs: 1,
    cs: 2, // 2:1 Mini Shelf
    objectPosition: "center",
  },

  // --- ROW 16: The Exact Heart Point (Columns 8 to 9) ---
  {
    id: "h41",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80",
    caption: "With all my heart ♡",
    r: 16,
    c: 8,
    rs: 1,
    cs: 2, // 2:1 Point Tip
    objectPosition: "center",
  },
];

interface HeartPhotoCollageProps {
  photos?: { id: string; url: string; caption?: string }[];
}

export function HeartPhotoCollage({ photos }: HeartPhotoCollageProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<CollagePhoto | null>(null);

  // Map user-provided photos if available
  const activeTiles: CollagePhoto[] = heartCollagePhotos.map((tile, idx) => {
    if (photos && photos[idx]) {
      return {
        ...tile,
        src: photos[idx].url || tile.src,
        caption: photos[idx].caption || tile.caption,
      };
    }
    return tile;
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4 sm:py-8 select-none">
      {/* Background romantic pink halo glow behind heart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] sm:w-[520px] md:w-[620px] h-[360px] sm:h-[520px] md:h-[620px] rounded-full bg-gradient-to-tr from-[var(--pale-rose)] via-[#FFE0EA] to-[var(--lavender)] opacity-60 blur-3xl animate-pulse-soft" />
      </div>

      {/* 
        The Printed Photo Mosaic Heart:
        16-Column by 16-Row Deterministic Grid.
        Every tile has exact CSS gridColumn and gridRow spans.
        Tight 3-5px gaps resemble an authentic printed photo collage.
      */}
      <div
        className="relative z-10 grid mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
          gridTemplateRows: "repeat(16, minmax(0, 1fr))",
          gap: "clamp(2px, 0.45vw, 5px)",
          width: "100%",
          maxWidth: "760px",
          aspectRatio: "16 / 15",
        }}
      >
        {activeTiles.map((tile, idx) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
              duration: 0.38,
              delay: idx * 0.012,
              ease: "easeOut",
            }}
            whileHover={{
              scale: tile.isHero ? 1.04 : 1.08,
              zIndex: 50,
              boxShadow: "0 8px 24px rgba(81, 36, 63, 0.28)",
            }}
            onMouseEnter={() => setHoveredPhoto(tile)}
            onMouseLeave={() => setHoveredPhoto(null)}
            className={`relative overflow-hidden border border-white/90 sm:border-[1.5px] border-white rounded-[3px] sm:rounded-[4px] shadow-[0_2px_8px_rgba(81,36,63,0.12)] cursor-pointer transition-shadow duration-300 ${
              tile.isHero
                ? "ring-2 sm:ring-3 ring-[var(--pink-strong)] ring-offset-1 z-20 shadow-md"
                : "hover:border-[var(--pink-primary)]"
            }`}
            style={{
              gridColumn: `${tile.c} / span ${tile.cs}`,
              gridRow: `${tile.r} / span ${tile.rs}`,
            }}
          >
            {/* Real Photograph with object-cover and natural crop */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt={tile.caption}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
              style={{ objectPosition: tile.objectPosition || "center" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {/* Romantic gradient backdrop in case of image lag */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--soft-pink)] to-[var(--lavender)] flex items-center justify-center text-xs">
              💕
            </div>

            {/* Grand Hero Badge */}
            {tile.isHero && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[8px] sm:text-[10px] font-rounded font-bold text-[var(--pink-strong)] shadow-xs">
                Our Center ♡
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Hover Caption Toast floating underneath the heart */}
      <div className="h-10 mt-5 flex items-center justify-center text-center">
        {hoveredPhoto ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-1.5 rounded-full bg-white/95 border border-[var(--border-subtle)] shadow-md text-xs font-handwritten text-xl sm:text-2xl text-[var(--pink-strong)]"
          >
            {hoveredPhoto.caption}
          </motion.div>
        ) : (
          <p className="font-handwritten text-xl sm:text-2xl text-[var(--text-secondary)]">
            Hover over any little picture to read its memory ♡
          </p>
        )}
      </div>
    </div>
  );
}
