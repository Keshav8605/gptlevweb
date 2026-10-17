"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface CollagePhoto {
  id: string;
  src: string;
  caption: string;
  gridArea: string; // CSS grid area e.g. "1 / 3 / 2 / 5"
  isHero?: boolean;
}

// 30 Curated Romantic Couple Moments forming an 11-column Heart Silhouette
export const heartCollagePhotos: CollagePhoto[] = [
  // --- ROW 1: Top Lobe Peaks ---
  {
    id: "h1",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    caption: "Sunset whisper ♡",
    gridArea: "1 / 3 / 2 / 5", // Left peak
  },
  {
    id: "h2",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    caption: "Gazing into forever",
    gridArea: "1 / 8 / 2 / 10", // Right peak
  },

  // --- ROW 2: Rounded Upper Curves (Center Dip at Col 6) ---
  {
    id: "h3",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    caption: "Golden hour embrace",
    gridArea: "2 / 2 / 3 / 4",
  },
  {
    id: "h4",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    caption: "Sweetest laughter",
    gridArea: "2 / 4 / 3 / 6",
  },
  {
    id: "h5",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    caption: "Our secret smile",
    gridArea: "2 / 7 / 3 / 9",
  },
  {
    id: "h6",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    caption: "My favourite view",
    gridArea: "2 / 9 / 3 / 11",
  },

  // --- ROW 3: Broad Upper Heart ---
  {
    id: "h7",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    caption: "Autumn walks",
    gridArea: "3 / 1 / 4 / 3",
  },
  {
    id: "h8",
    src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    caption: "Holding tight",
    gridArea: "3 / 3 / 4 / 5",
  },
  {
    id: "h9",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    caption: "Little moments with you",
    gridArea: "3 / 5 / 4 / 8", // Center connector
  },
  {
    id: "h10",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    caption: "Stolen glances",
    gridArea: "3 / 8 / 4 / 10",
  },
  {
    id: "h11",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    caption: "Pure sunshine",
    gridArea: "3 / 10 / 4 / 12",
  },

  // --- ROWS 4 & 5: Heart Center with Grand HERO PHOTO in the middle ---
  {
    id: "h12",
    src: "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=400&q=80",
    caption: "Cozy coffee mornings",
    gridArea: "4 / 1 / 6 / 3", // Left side portrait
  },
  {
    id: "h13",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    caption: "Under the twinkling stars",
    gridArea: "4 / 3 / 5 / 5",
  },
  // HERO PHOTO: Central Grand Couple Portrait
  {
    id: "h_hero",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=85",
    caption: "You & Me, Always & Forever ♡",
    gridArea: "4 / 5 / 6 / 8", // Spans 3 cols and 2 rows right in the center!
    isHero: true,
  },
  {
    id: "h14",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&q=80",
    caption: "Forehead kisses",
    gridArea: "4 / 8 / 5 / 10",
  },
  {
    id: "h15",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    caption: "Dancing in the living room",
    gridArea: "4 / 10 / 6 / 12", // Right side portrait
  },
  {
    id: "h16",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    caption: "Laughing at bad jokes",
    gridArea: "5 / 3 / 6 / 5",
  },
  {
    id: "h17",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    caption: "Every day with you is magic",
    gridArea: "5 / 8 / 6 / 10",
  },

  // --- ROW 6: Tapering Lower Body ---
  {
    id: "h18",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    caption: "Road trips & mixtapes",
    gridArea: "6 / 2 / 7 / 4",
  },
  {
    id: "h19",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    caption: "Holding hands in the rain",
    gridArea: "6 / 4 / 7 / 6",
  },
  {
    id: "h20",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    caption: "My safe place",
    gridArea: "6 / 6 / 7 / 8",
  },
  {
    id: "h21",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    caption: "Forever your biggest fan",
    gridArea: "6 / 8 / 7 / 10",
  },

  // --- ROW 7: Narrowing Down ---
  {
    id: "h22",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    caption: "Stargazing blanket",
    gridArea: "7 / 3 / 8 / 5",
  },
  {
    id: "h23",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    caption: "Sweet little memories",
    gridArea: "7 / 5 / 8 / 7",
  },
  {
    id: "h24",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    caption: "Never letting go",
    gridArea: "7 / 7 / 8 / 9",
  },

  // --- ROW 8: Lower V-Shape ---
  {
    id: "h25",
    src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    caption: "Through every season",
    gridArea: "8 / 4 / 9 / 6",
  },
  {
    id: "h26",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    caption: "Just you & me",
    gridArea: "8 / 6 / 9 / 8",
  },

  // --- ROW 9: Heart Tip ---
  {
    id: "h27",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
    caption: "With all my heart ♡",
    gridArea: "9 / 5 / 10 / 7",
  },
];

interface HeartPhotoCollageProps {
  photos?: { id: string; url: string; caption?: string }[];
}

export function HeartPhotoCollage({ photos }: HeartPhotoCollageProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<CollagePhoto | null>(null);

  // Map user photos into grid slots if provided
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
    <div className="relative w-full max-w-4xl mx-auto py-6 sm:py-10 select-none">
      {/* Background soft pink halo glow behind heart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full bg-gradient-to-tr from-[var(--pale-rose)] via-[#FFE0EA] to-[var(--lavender)] opacity-60 blur-3xl animate-pulse-soft" />
      </div>

      {/* Grid of 11 Columns by 9 Rows forming the recognizable heart silhouette */}
      <div
        className="relative z-10 grid gap-1 sm:gap-1.5 md:gap-2 mx-auto"
        style={{
          gridTemplateColumns: "repeat(11, minmax(0, 1fr))",
          gridAutoRows: "clamp(32px, 5.5vw, 68px)",
          width: "100%",
        }}
      >
        {activeTiles.map((tile, idx) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: idx * 0.025,
              ease: "easeOut",
            }}
            whileHover={{
              scale: tile.isHero ? 1.04 : 1.18,
              zIndex: 40,
            }}
            onMouseEnter={() => setHoveredPhoto(tile)}
            onMouseLeave={() => setHoveredPhoto(null)}
            className={`relative rounded-lg sm:rounded-xl overflow-hidden border-[1.5px] border-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
              tile.isHero
                ? "ring-2 ring-[var(--pink-strong)] ring-offset-2 z-20"
                : "hover:ring-2 hover:ring-[var(--pink-primary)]"
            }`}
            style={{
              gridArea: tile.gridArea,
            }}
          >
            {/* Real Photograph with high visual quality */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt={tile.caption}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              onError={(e) => {
                // Tasteful romantic fallback if image URL fails
                e.currentTarget.style.display = "none";
              }}
            />

            {/* Gradient fallback behind image */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--soft-pink)] to-[var(--lavender)] flex items-center justify-center text-xs">
              💕
            </div>

            {/* Hero Badge */}
            {tile.isHero && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-rounded font-bold text-[var(--pink-strong)] shadow-2xs">
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
            className="px-4 py-1.5 rounded-full bg-white/90 border border-[var(--border-subtle)] shadow-sm text-xs font-handwritten text-xl text-[var(--pink-strong)]"
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
