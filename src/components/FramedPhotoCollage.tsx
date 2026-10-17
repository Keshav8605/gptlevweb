"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface BorderPhotoConfig {
  id: string;
  src: string;
  caption: string;
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  w: number; // percentage width
  h: number; // percentage height
  rot: number; // degrees
  z: number; // z-index
  objectPosition?: string;
}

// 129 Curated Surrounding Polaroid Prints forming the dense scrapbook frame
// Exactly matching the target reference composition (Image 1):
// - Central couple photograph visible through an organic, irregular HEART opening
// - Top border dips down into the center cleft notch
// - Dense clusters fill the top-left and top-right corners outside the lobes
// - Dense multi-layered triangular mesh fills the entire bottom-left and bottom-right corners (zero gaps)
// - The inner edges of the polaroids form an inward diagonal taper meeting at the bottom tip
export const defaultBorderPhotos: BorderPhotoConfig[] = [
  {
    "id": "top_1",
    "src": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset whisper ♡",
    "top": -0.5,
    "left": 0,
    "w": 7.2,
    "h": 9.2,
    "rot": -4,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "top_2",
    "src": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    "caption": "Golden hour glow",
    "top": 0.3,
    "left": 6.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 6,
    "z": 11,
    "objectPosition": "center"
  },
  {
    "id": "top_3",
    "src": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    "caption": "Under open skies",
    "top": -0.5,
    "left": 13,
    "w": 7.2,
    "h": 9.2,
    "rot": -3,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "top_4",
    "src": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    "caption": "Our quiet place",
    "top": 0.3,
    "left": 19.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 5,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "top_5",
    "src": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    "caption": "Our secret smile",
    "top": -0.5,
    "left": 26,
    "w": 7.2,
    "h": 9.2,
    "rot": -6,
    "z": 11,
    "objectPosition": "center"
  },
  {
    "id": "top_6",
    "src": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "caption": "My favourite view",
    "top": 0.3,
    "left": 32.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 4,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "top_7",
    "src": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    "caption": "Heart of our story",
    "top": -0.5,
    "left": 39,
    "w": 7.2,
    "h": 9.2,
    "rot": -5,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "top_8",
    "src": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "caption": "Autumn walks",
    "top": 0.3,
    "left": 45.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 6,
    "z": 11,
    "objectPosition": "center"
  },
  {
    "id": "top_9",
    "src": "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    "caption": "Holding tight",
    "top": -0.5,
    "left": 52,
    "w": 7.2,
    "h": 9.2,
    "rot": -6,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "top_10",
    "src": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "caption": "Stolen glances",
    "top": 0.3,
    "left": 58.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 5,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "top_11",
    "src": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "caption": "Forever you",
    "top": -0.5,
    "left": 65,
    "w": 7.2,
    "h": 9.2,
    "rot": -4,
    "z": 11,
    "objectPosition": "center"
  },
  {
    "id": "top_12",
    "src": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    "caption": "Pure sunshine",
    "top": 0.3,
    "left": 71.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 6,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "top_13",
    "src": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80",
    "caption": "Library whispers",
    "top": -0.5,
    "left": 78,
    "w": 7.2,
    "h": 9.2,
    "rot": -5,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "top_14",
    "src": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset beach walk",
    "top": 0.3,
    "left": 84.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 4,
    "z": 11,
    "objectPosition": "center"
  },
  {
    "id": "top_15",
    "src": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
    "caption": "Road trips with you",
    "top": -0.5,
    "left": 91,
    "w": 7.2,
    "h": 9.2,
    "rot": -6,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "top_16",
    "src": "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&q=80",
    "caption": "Mountain horizons",
    "top": 0.3,
    "left": 93.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 3,
    "z": 10,
    "objectPosition": "center"
  },
  {
    "id": "tlc_1",
    "src": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "caption": "Safe in your arms",
    "top": 5.5,
    "left": 1,
    "w": 7.5,
    "h": 9.5,
    "rot": 8,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "tlc_2",
    "src": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "caption": "Dancing in the living room",
    "top": 6.2,
    "left": 7.2,
    "w": 7.5,
    "h": 9.2,
    "rot": -7,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "tlc_3",
    "src": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    "caption": "Walking in joy together",
    "top": 7,
    "left": 13.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 6,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "tlc_4",
    "src": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80",
    "caption": "Candlelit dinner",
    "top": 11.5,
    "left": 0.8,
    "w": 7.5,
    "h": 9.5,
    "rot": -9,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "tlc_5",
    "src": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    "caption": "Morning coffee smiles",
    "top": 12,
    "left": 7,
    "w": 7.4,
    "h": 9.2,
    "rot": 10,
    "z": 15,
    "objectPosition": "center"
  },
  {
    "id": "tlc_6",
    "src": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    "caption": "Botanical garden day",
    "top": 12.8,
    "left": 13.2,
    "w": 7.2,
    "h": 9,
    "rot": -8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "trc_1",
    "src": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
    "caption": "Baking together",
    "top": 5.5,
    "left": 91.5,
    "w": 7.5,
    "h": 9.5,
    "rot": -8,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "trc_2",
    "src": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    "caption": "Making memories together",
    "top": 6.2,
    "left": 85,
    "w": 7.5,
    "h": 9.2,
    "rot": 7,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "trc_3",
    "src": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    "caption": "Late night cinema date",
    "top": 7,
    "left": 78.8,
    "w": 7.2,
    "h": 9.2,
    "rot": -6,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "trc_4",
    "src": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    "caption": "Sweetest celebrations",
    "top": 11.5,
    "left": 91.8,
    "w": 7.5,
    "h": 9.5,
    "rot": 9,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "trc_5",
    "src": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
    "caption": "With all my heart ♡",
    "top": 12,
    "left": 85.2,
    "w": 7.4,
    "h": 9.2,
    "rot": -10,
    "z": 15,
    "objectPosition": "center"
  },
  {
    "id": "trc_6",
    "src": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    "caption": "Little adventures",
    "top": 12.8,
    "left": 79,
    "w": 7.2,
    "h": 9,
    "rot": 8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "tlb_1",
    "src": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    "caption": "Summer laughter",
    "top": 4.8,
    "left": 20.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -8,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "tlb_2",
    "src": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    "caption": "Cozy moments together",
    "top": 4.2,
    "left": 27,
    "w": 7.4,
    "h": 9.2,
    "rot": 6,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "tlb_3",
    "src": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
    "caption": "Stargazing blanket",
    "top": 5,
    "left": 33.5,
    "w": 7.2,
    "h": 9,
    "rot": -5,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "trb_1",
    "src": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "caption": "You and only you ♡",
    "top": 5,
    "left": 59.5,
    "w": 7.2,
    "h": 9,
    "rot": 5,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "trb_2",
    "src": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80",
    "caption": "Lover's stroll",
    "top": 4.2,
    "left": 65.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -6,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "trb_3",
    "src": "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
    "caption": "Endless adventures",
    "top": 4.8,
    "left": 72,
    "w": 7.4,
    "h": 9.2,
    "rot": 8,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "cleft_l1",
    "src": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "caption": "Warm embrace",
    "top": 6.8,
    "left": 38.6,
    "w": 7,
    "h": 8.8,
    "rot": 18,
    "z": 18,
    "objectPosition": "center"
  },
  {
    "id": "cleft_l2",
    "src": "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=400&q=80",
    "caption": "First light with you",
    "top": 9.8,
    "left": 42.1,
    "w": 6.8,
    "h": 8.6,
    "rot": 28,
    "z": 20,
    "objectPosition": "center"
  },
  {
    "id": "cleft_l3",
    "src": "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80",
    "caption": "Peaceful quiet mornings",
    "top": 13,
    "left": 44.8,
    "w": 6.4,
    "h": 8.2,
    "rot": 35,
    "z": 22,
    "objectPosition": "center"
  },
  {
    "id": "cleft_r1",
    "src": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80",
    "caption": "Blossoming love",
    "top": 6.8,
    "left": 54.6,
    "w": 7,
    "h": 8.8,
    "rot": -18,
    "z": 18,
    "objectPosition": "center"
  },
  {
    "id": "cleft_r2",
    "src": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset whisper ♡",
    "top": 9.8,
    "left": 51.1,
    "w": 6.8,
    "h": 8.6,
    "rot": -28,
    "z": 20,
    "objectPosition": "center"
  },
  {
    "id": "cleft_r3",
    "src": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    "caption": "Golden hour glow",
    "top": 13,
    "left": 48.8,
    "w": 6.4,
    "h": 8.2,
    "rot": -35,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "cleft_top",
    "src": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    "caption": "Under open skies",
    "top": 1.5,
    "left": 46.5,
    "w": 7,
    "h": 8.8,
    "rot": -2,
    "z": 15,
    "objectPosition": "center"
  },
  {
    "id": "lf_out1",
    "src": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    "caption": "Our quiet place",
    "top": 18,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 7,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "lf_out2",
    "src": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    "caption": "Our secret smile",
    "top": 24.5,
    "left": 0.5,
    "w": 7.5,
    "h": 9.5,
    "rot": -9,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "lf_out3",
    "src": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "caption": "My favourite view",
    "top": 31,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 8,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "lf_out4",
    "src": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    "caption": "Heart of our story",
    "top": 37.5,
    "left": 0.5,
    "w": 7.5,
    "h": 9.5,
    "rot": -7,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "lf_out5",
    "src": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "caption": "Autumn walks",
    "top": 44,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 9,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "lf_out6",
    "src": "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    "caption": "Holding tight",
    "top": 50.5,
    "left": 0.8,
    "w": 7.5,
    "h": 9.5,
    "rot": -8,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "lf_in1",
    "src": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "caption": "Stolen glances",
    "top": 17.5,
    "left": 6.8,
    "w": 7.2,
    "h": 9.2,
    "rot": -12,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "lf_in2",
    "src": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "caption": "Forever you",
    "top": 23.5,
    "left": 7.5,
    "w": 7,
    "h": 9,
    "rot": 14,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "lf_in3",
    "src": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    "caption": "Pure sunshine",
    "top": 30,
    "left": 6.2,
    "w": 7.2,
    "h": 9,
    "rot": -10,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "lf_in4",
    "src": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80",
    "caption": "Library whispers",
    "top": 36.5,
    "left": 5.8,
    "w": 7.2,
    "h": 9,
    "rot": 11,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "lf_in5",
    "src": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset beach walk",
    "top": 43,
    "left": 6.2,
    "w": 7.2,
    "h": 9.2,
    "rot": -12,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "lf_in6",
    "src": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
    "caption": "Road trips with you",
    "top": 49.5,
    "left": 7.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 14,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "rf_out1",
    "src": "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&q=80",
    "caption": "Mountain horizons",
    "top": 18,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -7,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "rf_out2",
    "src": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "caption": "Safe in your arms",
    "top": 24.5,
    "left": 92,
    "w": 7.5,
    "h": 9.5,
    "rot": 9,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "rf_out3",
    "src": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "caption": "Dancing in the living room",
    "top": 31,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -8,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "rf_out4",
    "src": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    "caption": "Walking in joy together",
    "top": 37.5,
    "left": 92,
    "w": 7.5,
    "h": 9.5,
    "rot": 7,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "rf_out5",
    "src": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80",
    "caption": "Candlelit dinner",
    "top": 44,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -9,
    "z": 12,
    "objectPosition": "center"
  },
  {
    "id": "rf_out6",
    "src": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    "caption": "Morning coffee smiles",
    "top": 50.5,
    "left": 91.8,
    "w": 7.5,
    "h": 9.5,
    "rot": 8,
    "z": 13,
    "objectPosition": "center"
  },
  {
    "id": "rf_in1",
    "src": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    "caption": "Botanical garden day",
    "top": 17.5,
    "left": 86,
    "w": 7.2,
    "h": 9.2,
    "rot": 12,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "rf_in2",
    "src": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
    "caption": "Baking together",
    "top": 23.5,
    "left": 85.5,
    "w": 7,
    "h": 9,
    "rot": -14,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "rf_in3",
    "src": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    "caption": "Making memories together",
    "top": 30,
    "left": 86.8,
    "w": 7.2,
    "h": 9,
    "rot": 10,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "rf_in4",
    "src": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    "caption": "Late night cinema date",
    "top": 36.5,
    "left": 87,
    "w": 7.2,
    "h": 9,
    "rot": -11,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "rf_in5",
    "src": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    "caption": "Sweetest celebrations",
    "top": 43,
    "left": 86.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 12,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "rf_in6",
    "src": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
    "caption": "With all my heart ♡",
    "top": 49.5,
    "left": 85.2,
    "w": 7.2,
    "h": 9.2,
    "rot": -14,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r55_1",
    "src": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    "caption": "Little adventures",
    "top": 54,
    "left": 0.5,
    "w": 7.6,
    "h": 9.5,
    "rot": 8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "bl_r55_2",
    "src": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    "caption": "Summer laughter",
    "top": 53.5,
    "left": 7.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -12,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r55_d",
    "src": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    "caption": "Cozy moments together",
    "top": 54,
    "left": 13,
    "w": 7.2,
    "h": 9,
    "rot": -28,
    "z": 22,
    "objectPosition": "center"
  },
  {
    "id": "bl_r61_1",
    "src": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
    "caption": "Stargazing blanket",
    "top": 60.5,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -9,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "bl_r61_2",
    "src": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "caption": "You and only you ♡",
    "top": 60,
    "left": 6.8,
    "w": 7.4,
    "h": 9.2,
    "rot": 11,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r61_3",
    "src": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80",
    "caption": "Lover's stroll",
    "top": 60.5,
    "left": 13,
    "w": 7.2,
    "h": 9.2,
    "rot": -14,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "bl_r61_d",
    "src": "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
    "caption": "Endless adventures",
    "top": 59.5,
    "left": 18.5,
    "w": 7,
    "h": 9,
    "rot": -32,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "bl_r67_1",
    "src": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "caption": "Warm embrace",
    "top": 66.5,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "bl_r67_2",
    "src": "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=400&q=80",
    "caption": "First light with you",
    "top": 66,
    "left": 6.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r67_3",
    "src": "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80",
    "caption": "Peaceful quiet mornings",
    "top": 66.5,
    "left": 12.8,
    "w": 7.2,
    "h": 9.2,
    "rot": 12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "bl_r67_4",
    "src": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80",
    "caption": "Blossoming love",
    "top": 66,
    "left": 19,
    "w": 7.2,
    "h": 9,
    "rot": -15,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "bl_r67_d",
    "src": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset whisper ♡",
    "top": 65.5,
    "left": 24.5,
    "w": 7,
    "h": 9,
    "rot": -32,
    "z": 24,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_1",
    "src": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    "caption": "Golden hour glow",
    "top": 72.5,
    "left": 0,
    "w": 7.6,
    "h": 9.5,
    "rot": -8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_2",
    "src": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    "caption": "Under open skies",
    "top": 72,
    "left": 6.2,
    "w": 7.4,
    "h": 9.2,
    "rot": 10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_3",
    "src": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    "caption": "Our quiet place",
    "top": 72.5,
    "left": 12.5,
    "w": 7.2,
    "h": 9.2,
    "rot": -11,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_4",
    "src": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    "caption": "Our secret smile",
    "top": 72,
    "left": 18.5,
    "w": 7.2,
    "h": 9,
    "rot": 13,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_5",
    "src": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "caption": "My favourite view",
    "top": 72.5,
    "left": 24.5,
    "w": 7,
    "h": 9,
    "rot": -14,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "bl_r73_d",
    "src": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    "caption": "Heart of our story",
    "top": 71.5,
    "left": 30.5,
    "w": 6.8,
    "h": 8.8,
    "rot": -28,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_1",
    "src": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "caption": "Autumn walks",
    "top": 78.5,
    "left": 0.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 9,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_2",
    "src": "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    "caption": "Holding tight",
    "top": 78,
    "left": 6.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_3",
    "src": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "caption": "Stolen glances",
    "top": 78.5,
    "left": 12.8,
    "w": 7.2,
    "h": 9.2,
    "rot": 12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_4",
    "src": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "caption": "Forever you",
    "top": 78,
    "left": 18.8,
    "w": 7.2,
    "h": 9,
    "rot": -11,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_5",
    "src": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    "caption": "Pure sunshine",
    "top": 78.5,
    "left": 24.8,
    "w": 7,
    "h": 9,
    "rot": 14,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_6",
    "src": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80",
    "caption": "Library whispers",
    "top": 78,
    "left": 30.5,
    "w": 6.8,
    "h": 8.8,
    "rot": -12,
    "z": 24,
    "objectPosition": "center"
  },
  {
    "id": "bl_r79_d",
    "src": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset beach walk",
    "top": 77.5,
    "left": 36.5,
    "w": 6.8,
    "h": 8.8,
    "rot": -25,
    "z": 26,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_1",
    "src": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
    "caption": "Road trips with you",
    "top": 84.5,
    "left": 0,
    "w": 7.6,
    "h": 9.5,
    "rot": -8,
    "z": 15,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_2",
    "src": "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&q=80",
    "caption": "Mountain horizons",
    "top": 84,
    "left": 6.2,
    "w": 7.4,
    "h": 9.2,
    "rot": 9,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_3",
    "src": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "caption": "Safe in your arms",
    "top": 84.5,
    "left": 12.5,
    "w": 7.2,
    "h": 9.2,
    "rot": -12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_4",
    "src": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "caption": "Dancing in the living room",
    "top": 84,
    "left": 18.5,
    "w": 7.2,
    "h": 9,
    "rot": 10,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_5",
    "src": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    "caption": "Walking in joy together",
    "top": 84.5,
    "left": 24.5,
    "w": 7,
    "h": 9,
    "rot": -13,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_6",
    "src": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80",
    "caption": "Candlelit dinner",
    "top": 84,
    "left": 30.5,
    "w": 6.8,
    "h": 8.8,
    "rot": 12,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_7",
    "src": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    "caption": "Morning coffee smiles",
    "top": 84.5,
    "left": 36.5,
    "w": 6.8,
    "h": 8.8,
    "rot": -14,
    "z": 26,
    "objectPosition": "center"
  },
  {
    "id": "bl_r85_d",
    "src": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    "caption": "Botanical garden day",
    "top": 83.5,
    "left": 42.5,
    "w": 6.6,
    "h": 8.6,
    "rot": -20,
    "z": 28,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_1",
    "src": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
    "caption": "Baking together",
    "top": 91,
    "left": 0,
    "w": 7.6,
    "h": 9.5,
    "rot": 10,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_2",
    "src": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    "caption": "Making memories together",
    "top": 91.2,
    "left": 6.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -9,
    "z": 18,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_3",
    "src": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    "caption": "Late night cinema date",
    "top": 90.8,
    "left": 13,
    "w": 7.4,
    "h": 9.2,
    "rot": 8,
    "z": 20,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_4",
    "src": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    "caption": "Sweetest celebrations",
    "top": 91.2,
    "left": 19.5,
    "w": 7.2,
    "h": 9,
    "rot": -10,
    "z": 22,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_5",
    "src": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
    "caption": "With all my heart ♡",
    "top": 90.8,
    "left": 26,
    "w": 7.2,
    "h": 9,
    "rot": 9,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_6",
    "src": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    "caption": "Little adventures",
    "top": 91.2,
    "left": 32.5,
    "w": 7,
    "h": 8.8,
    "rot": -8,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_7",
    "src": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    "caption": "Summer laughter",
    "top": 90.8,
    "left": 39,
    "w": 7,
    "h": 8.8,
    "rot": 10,
    "z": 27,
    "objectPosition": "center"
  },
  {
    "id": "bl_r91_d",
    "src": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    "caption": "Cozy moments together",
    "top": 88,
    "left": 44.5,
    "w": 6.6,
    "h": 8.6,
    "rot": -14,
    "z": 29,
    "objectPosition": "center"
  },
  {
    "id": "br_r55_1",
    "src": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
    "caption": "Stargazing blanket",
    "top": 54,
    "left": 92.4,
    "w": 7.6,
    "h": 9.5,
    "rot": -8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "br_r55_2",
    "src": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "caption": "You and only you ♡",
    "top": 53.5,
    "left": 85.5,
    "w": 7.4,
    "h": 9.2,
    "rot": 12,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r55_d",
    "src": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80",
    "caption": "Lover's stroll",
    "top": 54,
    "left": 79.8,
    "w": 7.2,
    "h": 9,
    "rot": 28,
    "z": 22,
    "objectPosition": "center"
  },
  {
    "id": "br_r61_1",
    "src": "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
    "caption": "Endless adventures",
    "top": 60.5,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": 9,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "br_r61_2",
    "src": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "caption": "Warm embrace",
    "top": 60,
    "left": 85.8,
    "w": 7.4,
    "h": 9.2,
    "rot": -11,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r61_3",
    "src": "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=400&q=80",
    "caption": "First light with you",
    "top": 60.5,
    "left": 79.8,
    "w": 7.2,
    "h": 9.2,
    "rot": 14,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "br_r61_d",
    "src": "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80",
    "caption": "Peaceful quiet mornings",
    "top": 59.5,
    "left": 74.5,
    "w": 7,
    "h": 9,
    "rot": 32,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "br_r67_1",
    "src": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80",
    "caption": "Blossoming love",
    "top": 66.5,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "br_r67_2",
    "src": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset whisper ♡",
    "top": 66,
    "left": 86,
    "w": 7.4,
    "h": 9.2,
    "rot": 10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r67_3",
    "src": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    "caption": "Golden hour glow",
    "top": 66.5,
    "left": 80,
    "w": 7.2,
    "h": 9.2,
    "rot": -12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "br_r67_4",
    "src": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=80",
    "caption": "Under open skies",
    "top": 66,
    "left": 73.8,
    "w": 7.2,
    "h": 9,
    "rot": 15,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "br_r67_d",
    "src": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
    "caption": "Our quiet place",
    "top": 65.5,
    "left": 68.5,
    "w": 7,
    "h": 9,
    "rot": 32,
    "z": 24,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_1",
    "src": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    "caption": "Our secret smile",
    "top": 72.5,
    "left": 92.4,
    "w": 7.6,
    "h": 9.5,
    "rot": 8,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_2",
    "src": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "caption": "My favourite view",
    "top": 72,
    "left": 86.4,
    "w": 7.4,
    "h": 9.2,
    "rot": -10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_3",
    "src": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    "caption": "Heart of our story",
    "top": 72.5,
    "left": 80.2,
    "w": 7.2,
    "h": 9.2,
    "rot": 11,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_4",
    "src": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "caption": "Autumn walks",
    "top": 72,
    "left": 74.2,
    "w": 7.2,
    "h": 9,
    "rot": -13,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_5",
    "src": "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=400&q=80",
    "caption": "Holding tight",
    "top": 72.5,
    "left": 68.5,
    "w": 7,
    "h": 9,
    "rot": 14,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "br_r73_d",
    "src": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "caption": "Stolen glances",
    "top": 71.5,
    "left": 62.7,
    "w": 6.8,
    "h": 8.8,
    "rot": 28,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_1",
    "src": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "caption": "Forever you",
    "top": 78.5,
    "left": 92.2,
    "w": 7.6,
    "h": 9.5,
    "rot": -9,
    "z": 14,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_2",
    "src": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    "caption": "Pure sunshine",
    "top": 78,
    "left": 86,
    "w": 7.4,
    "h": 9.2,
    "rot": 10,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_3",
    "src": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80",
    "caption": "Library whispers",
    "top": 78.5,
    "left": 80,
    "w": 7.2,
    "h": 9.2,
    "rot": -12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_4",
    "src": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "caption": "Sunset beach walk",
    "top": 78,
    "left": 74,
    "w": 7.2,
    "h": 9,
    "rot": 11,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_5",
    "src": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
    "caption": "Road trips with you",
    "top": 78.5,
    "left": 68.2,
    "w": 7,
    "h": 9,
    "rot": -14,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_6",
    "src": "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&q=80",
    "caption": "Mountain horizons",
    "top": 78,
    "left": 62.7,
    "w": 6.8,
    "h": 8.8,
    "rot": 12,
    "z": 24,
    "objectPosition": "center"
  },
  {
    "id": "br_r79_d",
    "src": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "caption": "Safe in your arms",
    "top": 77.5,
    "left": 56.7,
    "w": 6.8,
    "h": 8.8,
    "rot": 25,
    "z": 26,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_1",
    "src": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "caption": "Dancing in the living room",
    "top": 84.5,
    "left": 92.4,
    "w": 7.6,
    "h": 9.5,
    "rot": 8,
    "z": 15,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_2",
    "src": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
    "caption": "Walking in joy together",
    "top": 84,
    "left": 86.4,
    "w": 7.4,
    "h": 9.2,
    "rot": -9,
    "z": 17,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_3",
    "src": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80",
    "caption": "Candlelit dinner",
    "top": 84.5,
    "left": 80.2,
    "w": 7.2,
    "h": 9.2,
    "rot": 12,
    "z": 19,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_4",
    "src": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    "caption": "Morning coffee smiles",
    "top": 84,
    "left": 74.2,
    "w": 7.2,
    "h": 9,
    "rot": -10,
    "z": 21,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_5",
    "src": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    "caption": "Botanical garden day",
    "top": 84.5,
    "left": 68.5,
    "w": 7,
    "h": 9,
    "rot": 13,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_6",
    "src": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
    "caption": "Baking together",
    "top": 84,
    "left": 62.7,
    "w": 6.8,
    "h": 8.8,
    "rot": -12,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_7",
    "src": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    "caption": "Making memories together",
    "top": 84.5,
    "left": 56.7,
    "w": 6.8,
    "h": 8.8,
    "rot": 14,
    "z": 26,
    "objectPosition": "center"
  },
  {
    "id": "br_r85_d",
    "src": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    "caption": "Late night cinema date",
    "top": 83.5,
    "left": 50.8,
    "w": 6.6,
    "h": 8.6,
    "rot": 20,
    "z": 28,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_1",
    "src": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    "caption": "Sweetest celebrations",
    "top": 91,
    "left": 92.4,
    "w": 7.6,
    "h": 9.5,
    "rot": -10,
    "z": 16,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_2",
    "src": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
    "caption": "With all my heart ♡",
    "top": 91.2,
    "left": 86,
    "w": 7.4,
    "h": 9.2,
    "rot": 9,
    "z": 18,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_3",
    "src": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    "caption": "Little adventures",
    "top": 90.8,
    "left": 79.5,
    "w": 7.4,
    "h": 9.2,
    "rot": -8,
    "z": 20,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_4",
    "src": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    "caption": "Summer laughter",
    "top": 91.2,
    "left": 73.2,
    "w": 7.2,
    "h": 9,
    "rot": 10,
    "z": 22,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_5",
    "src": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    "caption": "Cozy moments together",
    "top": 90.8,
    "left": 66.8,
    "w": 7.2,
    "h": 9,
    "rot": -9,
    "z": 23,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_6",
    "src": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
    "caption": "Stargazing blanket",
    "top": 91.2,
    "left": 60.5,
    "w": 7,
    "h": 8.8,
    "rot": 8,
    "z": 25,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_7",
    "src": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "caption": "You and only you ♡",
    "top": 90.8,
    "left": 54,
    "w": 7,
    "h": 8.8,
    "rot": -10,
    "z": 27,
    "objectPosition": "center"
  },
  {
    "id": "br_r91_d",
    "src": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80",
    "caption": "Lover's stroll",
    "top": 88,
    "left": 48.8,
    "w": 6.6,
    "h": 8.6,
    "rot": 14,
    "z": 29,
    "objectPosition": "center"
  },
  {
    "id": "tip_center",
    "src": "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
    "caption": "Endless adventures",
    "top": 92,
    "left": 46.5,
    "w": 7.2,
    "h": 9.2,
    "rot": 0,
    "z": 30,
    "objectPosition": "center"
  }
];

export interface FramedPhotoCollageProps {
  centralPhoto?: {
    src: string;
    caption?: string;
  };
  borderPhotos?: {
    url: string;
    caption?: string;
  }[];
}

export function FramedPhotoCollage({
  centralPhoto,
  borderPhotos,
}: FramedPhotoCollageProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<BorderPhotoConfig | null>(null);

  // Default romantic couple central photograph
  const heroSrc =
    centralPhoto?.src ||
    "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=1200&q=85";
  const heroCaption = centralPhoto?.caption || "You & Me, Always & Forever ♡";

  // Map user-provided custom photos to border positions if available
  const activeBorderPhotos: BorderPhotoConfig[] = defaultBorderPhotos.map(
    (tile, idx) => {
      if (borderPhotos && borderPhotos[idx]) {
        return {
          ...tile,
          src: borderPhotos[idx].url || tile.src,
          caption: borderPhotos[idx].caption || tile.caption,
        };
      }
      return tile;
    }
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4 sm:py-8 select-none">
      {/* Background romantic pink halo glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] sm:w-[540px] md:w-[640px] h-[380px] sm:h-[540px] md:h-[640px] rounded-full bg-gradient-to-tr from-[var(--pale-rose)] via-[#FFE0EA] to-[var(--lavender)] opacity-60 blur-3xl animate-pulse-soft" />
      </div>

      {/* 
        The Framed Scrapbook Collage Canvas:
        - Outer clean square photo-print board
        - LAYER A: Grand Central HEART-SHAPED couple photograph clipped via precise SVG heart geometry
        - LAYER B: 129 Surrounding Polaroid prints wrapping tightly around the outside contour of the heart,
          filling the top cleft, lobes, outer flanks, and the large bottom-left/right triangular wedges!
      */}
      <div className="relative z-10 w-full max-w-[720px] mx-auto aspect-square bg-white p-2 sm:p-3 rounded-2xl shadow-[0_16px_48px_rgba(81,36,63,0.18)] border border-pink-100/90 overflow-hidden">
        {/* ========================================================= */}
        {/* LAYER A — GENUINE HEART-SHAPED CENTRAL COUPLE PHOTOGRAPH   */}
        {/* ========================================================= */}
        <div className="absolute inset-0 z-0">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{
              filter: "drop-shadow(0 10px 24px rgba(81, 36, 63, 0.22))",
            }}
          >
            <defs>
              {/* 
                Heart path matching the inner contour in 100x100 viewBox:
                - Notch at top center (50, 19)
                - Rounded left lobe curving to (30, 8) and (7, 36)
                - Smooth inward diagonal curve down to pointed tip at (50, 88)
                - Bilaterally symmetric right lobe
              */}
              <clipPath id="centralHeartClip">
                <path d="M 50,19 C 42,12 36,8 30,8 C 20,8 8,18 7,36 C 6,50 20,68 50,88 C 80,68 94,50 93,36 C 92,18 80,8 70,8 C 64,8 58,12 50,19 Z" />
              </clipPath>
            </defs>

            {/* Background romantic blush fill behind image */}
            <path
              d="M 50,19 C 42,12 36,8 30,8 C 20,8 8,18 7,36 C 6,50 20,68 50,88 C 80,68 94,50 93,36 C 92,18 80,8 70,8 C 64,8 58,12 50,19 Z"
              fill="#FFE0EA"
            />

            {/* Real Couple Photograph precisely clipped to the heart silhouette */}
            <image
              href={heroSrc}
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#centralHeartClip)"
            />

            {/* Soft inner vignette overlay for photographic depth */}
            <path
              d="M 50,19 C 42,12 36,8 30,8 C 20,8 8,18 7,36 C 6,50 20,68 50,88 C 80,68 94,50 93,36 C 92,18 80,8 70,8 C 64,8 58,12 50,19 Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* ========================================================= */}
        {/* LAYER B — SURROUNDING 129 POLAROID PRINTS                 */}
        {/* Dense Scrapbook Frame contouring tightly around heart     */}
        {/* ========================================================= */}
        <div className="absolute inset-0 pointer-events-auto">
          {activeBorderPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: idx * 0.003,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.25,
                zIndex: 80,
                rotate: 0,
                boxShadow: "0 10px 28px rgba(81, 36, 63, 0.35)",
              }}
              onMouseEnter={() => setHoveredPhoto(photo)}
              onMouseLeave={() => setHoveredPhoto(null)}
              className="absolute p-0.5 sm:p-1 bg-white border border-white rounded-[2px] sm:rounded-[3px] shadow-[0_2px_8px_rgba(40,20,30,0.22)] cursor-pointer transition-shadow duration-200"
              style={{
                top: `${photo.top}%`,
                left: `${photo.left}%`,
                width: `${photo.w}%`,
                height: `${photo.h}%`,
                transform: `rotate(${photo.rot}deg)`,
                zIndex: photo.z,
              }}
            >
              {/* Photo inside Polaroid white frame */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover rounded-[1px] transition-transform duration-300"
                style={{ objectPosition: photo.objectPosition || "center" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Romantic soft pink fallback backdrop */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFE0EA] to-[#EDE2FA] flex items-center justify-center text-[8px]">
                💕
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hover Caption Toast floating underneath the framed collage */}
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
            Every little moment, one beautiful story ♡
          </p>
        )}
      </div>
    </div>
  );
}
