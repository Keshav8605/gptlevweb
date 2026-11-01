"use client";

import { motion } from "framer-motion";

export interface CollagePhoto {
  id: string;
  src: string;
  caption: string;
  r: number; // Row start (1-8)
  c: number; // Col start (1-9)
  rs: number; // Row span
  cs: number; // Col span
  isHero?: boolean;
  objectPosition?: string;
}

// 29 Curated Romantic Couple Moments forming a true Printed Photo Collage Heart Mosaic
// Exact 9-Column by 8-Row Modular Matrix (0 overlaps, 0 interior holes).
// Modeled directly on the reference photo mosaic:
// - Grand Central Hero Photo (3 cols x 4 rows = 3:4 portrait)
// - Balanced Upper Lobes with deep V-cleft dip at Column 5
// - Flanking Medium Anchors (2 cols x 2 rows)
// - 29 completely unique authentic photos (zero duplicates anywhere)
// - Progressive 1-step inward taper from shoulders (width 9) to bottom tip (width 1)
export const heartCollagePhotos: CollagePhoto[] = [
  // ==========================================
  // ROW 1: Rounded Top Lobes (Dip at C4, C5, C6)
  // ==========================================
  {
    id: "h01",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    caption: "Sunset whisper ♡",
    r: 1,
    c: 2,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h02",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    caption: "Golden hour glow",
    r: 1,
    c: 3,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h03",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
    caption: "Under open skies",
    r: 1,
    c: 7,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h04",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    caption: "Our quiet place",
    r: 1,
    c: 8,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROW 2: Upper Shoulders & Cleft Incline
  // (C5 empty creates the natural heart cleft)
  // ==========================================
  {
    id: "h05",
    src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    caption: "Our secret smile",
    r: 2,
    c: 1,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h06",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    caption: "My favourite view",
    r: 2,
    c: 2,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h07",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
    caption: "Heart of our story",
    r: 2,
    c: 3,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h08",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    caption: "Autumn walks",
    r: 2,
    c: 4,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h09",
    src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80",
    caption: "Holding tight",
    r: 2,
    c: 6,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h10",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    caption: "Stolen glances",
    r: 2,
    c: 7,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h11",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    caption: "Forever you",
    r: 2,
    c: 8,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h12",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    caption: "Pure sunshine",
    r: 2,
    c: 9,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROWS 3-6: GRAND CENTRAL HERO ANCHOR
  // (Spans 3 cols x 4 rows = 3:4 portrait)
  // Joyful couple embrace laughing together
  // ==========================================
  {
    id: "HERO",
    src: "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=800&q=85",
    caption: "You & Me, Always & Forever ♡",
    r: 3,
    c: 4,
    rs: 4,
    cs: 3,
    isHero: true,
    objectPosition: "center 20%",
  },

  // ==========================================
  // ROWS 3-4: Mid-Section Wings & Anchors
  // ==========================================
  {
    id: "h13",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80",
    caption: "Mountain horizons",
    r: 3,
    c: 1,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h14",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    caption: "Safe in your arms",
    r: 4,
    c: 1,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h15",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
    caption: "Walking in joy together",
    r: 3,
    c: 2,
    rs: 2,
    cs: 2,
    objectPosition: "center",
  },
  {
    id: "h16",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    caption: "Dancing in the living room",
    r: 3,
    c: 7,
    rs: 2,
    cs: 2,
    objectPosition: "center 20%",
  },
  {
    id: "h17",
    src: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    caption: "Library whispers",
    r: 3,
    c: 9,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h18",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    caption: "Road trips with you",
    r: 4,
    c: 9,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROW 5: Mid-Lower Body (Tapering to C2..C8)
  // ==========================================
  {
    id: "h19",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    caption: "Sunset beach walk",
    r: 5,
    c: 2,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h20",
    src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
    caption: "Stargazing blanket",
    r: 5,
    c: 3,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h21",
    src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
    caption: "Candlelit dinner",
    r: 5,
    c: 7,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h22",
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    caption: "Morning coffee smiles",
    r: 5,
    c: 8,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROW 6: Inward Sloping Flanks (C3 & C7)
  // ==========================================
  {
    id: "h23",
    src: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    caption: "Botanical garden day",
    r: 6,
    c: 3,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h24",
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    caption: "Baking together",
    r: 6,
    c: 7,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROW 7: Sub-Hero Triplet Directly Below Hero
  // (C4, C5, C6)
  // ==========================================
  {
    id: "h25",
    src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
    caption: "Making memories together",
    r: 7,
    c: 4,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h26",
    src: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    caption: "Late night cinema date",
    r: 7,
    c: 5,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
  {
    id: "h27",
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    caption: "Sweetest celebrations",
    r: 7,
    c: 6,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },

  // ==========================================
  // ROW 8: Pointed Center Tip (C5)
  // ==========================================
  {
    id: "h28",
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80",
    caption: "With all my heart ♡",
    r: 8,
    c: 5,
    rs: 1,
    cs: 1,
    objectPosition: "center",
  },
];

export interface HeartPhotoCollageProps {
  centerPhoto?: string;
  centerCaption?: string;
  photos?: (string | { id?: string; url: string; caption?: string })[];
  caption?: string;
}

export function HeartPhotoCollage({
  centerPhoto,
  centerCaption,
  photos,
  caption,
}: HeartPhotoCollageProps) {
  // Normalize custom photos
  const customUrls = (photos || [])
    .map((p) => (typeof p === "string" ? p : p.url))
    .filter(Boolean);

  let mosaicIdx = 0;
  const activeTiles: CollagePhoto[] = heartCollagePhotos.map((tile) => {
    if (tile.isHero) {
      return {
        ...tile,
        src: centerPhoto || tile.src,
        caption: centerCaption || tile.caption,
      };
    }
    if (customUrls.length > 0) {
      const customUrl = customUrls[mosaicIdx % customUrls.length];
      mosaicIdx++;
      return {
        ...tile,
        src: customUrl || tile.src,
      };
    }
    return tile;
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4 sm:py-8 select-none">
      {/* Background romantic pink halo glow behind heart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] sm:w-[500px] md:w-[600px] h-[340px] sm:h-[460px] md:h-[540px] rounded-full bg-gradient-to-tr from-[var(--pale-rose)] via-[#FFE0EA] to-[var(--lavender)] opacity-60 blur-3xl animate-pulse-soft" />
      </div>

      {/* 
        The Printed Photo Mosaic Heart:
        9-Column by 8-Row Modular Deterministic Grid.
        Every tile has exact CSS gridColumn and gridRow coordinates.
        Consistent 3-4px gaps recreate an authentic printed photo mosaic.
      */}
      <div
        className="relative z-10 grid mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          gridTemplateRows: "repeat(8, minmax(0, 1fr))",
          gap: "clamp(2.5px, 0.45vw, 4.5px)",
          width: "100%",
          maxWidth: "680px",
          aspectRatio: "9 / 8",
        }}
      >
        {activeTiles.map((tile, idx) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{
              duration: 0.35,
              delay: idx * 0.012,
              ease: "easeOut",
            }}
            whileHover={{
              scale: tile.isHero ? 1.03 : 1.07,
              zIndex: 50,
              boxShadow: "0 8px 24px rgba(81, 36, 63, 0.25)",
            }}
            className={`relative overflow-hidden border border-white/95 sm:border-[1.5px] border-white rounded-[2px] sm:rounded-[3px] shadow-[0_2px_8px_rgba(81,36,63,0.12)] cursor-pointer transition-shadow duration-300 ${
              tile.isHero
                ? "ring-2 ring-[var(--pink-strong)]/50 ring-offset-1 z-20 shadow-md"
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
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-106"
              style={{ objectPosition: tile.objectPosition || "center" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {/* Romantic gradient backdrop in case of image lag */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--soft-pink)] to-[var(--lavender)] flex items-center justify-center text-xs">
              💕
            </div>

            {/* Subtle, delicate Grand Hero Badge */}
            {tile.isHero && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[8px] sm:text-[10px] font-rounded font-bold text-[var(--pink-strong)] shadow-xs pointer-events-none">
                Our Center ♡
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Universal Loving Caption underneath the heart */}
      <div className="h-10 mt-5 flex items-center justify-center text-center">
        <div className="px-5 py-1.5 rounded-full bg-white/95 border border-[var(--border-subtle)] shadow-sm font-handwritten text-xl sm:text-2xl text-[var(--pink-strong)]">
          {caption || "You & Me, Always & Forever ♡"}
        </div>
      </div>
    </div>
  );
}
