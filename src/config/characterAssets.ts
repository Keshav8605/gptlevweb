/**
 * Centralized Romantic Character Assets Configuration
 * 
 * Maps the 4 authentic transparent PNG illustrations to semantic roles
 * across the romantic gift experience.
 * 
 * Original Asset Files (in public/images/ and images/):
 * 1. 519-5196830_cute-cat-png.png: Ecstatic leaping hug with floating hearts (Peach & Goma)
 * 2. 506-5064307_cute-cats-png.png: Cozy under heart blanket kissing (Peach & Goma)
 * 3. 528-5288220_kawaii-tumblr-png.png: Sweet cheek kiss with heart & daydream clouds (Bubu & Dudu)
 * 4. 534-5341290_heart-pink-png.png: Gentle, tender forehead kiss with two floating hearts (Bubu & Dudu)
 */

export type CharacterIdentifier =
  | "huggingCouple"     // 519-5196830_cute-cat-png.png: Ecstatic, joyful leap-into-arms embrace
  | "cozyCouple"        // 506-5064307_cute-cats-png.png: Snuggled cozy under pink heart blanket kissing
  | "kissingCouple"      // 528-5288220_kawaii-tumblr-png.png: Sweet cheek kiss with heart & daydream clouds
  | "tenderCouple";     // 534-5341290_heart-pink-png.png: Gentle, tender forehead kiss with floating hearts

export interface CharacterAssetConfig {
  id: CharacterIdentifier;
  src: string;
  originalFilename: string;
  title: string;
  alt: string;
  aspectRatio: string;
  defaultWidth: number;
  defaultHeight: number;
  mood: string;
}

export const ROMANTIC_CHARACTERS: Record<CharacterIdentifier, CharacterAssetConfig> = {
  huggingCouple: {
    id: "huggingCouple",
    src: "/images/519-5196830_cute-cat-png.png",
    originalFilename: "519-5196830_cute-cat-png.png",
    title: "Joyful Leaping Hug",
    alt: "Two adorable characters leaping into a loving embrace with sweet hearts above",
    aspectRatio: "540 / 510",
    defaultWidth: 180,
    defaultHeight: 170,
    mood: "Ecstatic celebration, overwhelming love, joyful reunion",
  },
  cozyCouple: {
    id: "cozyCouple",
    src: "/images/506-5064307_cute-cats-png.png",
    originalFilename: "506-5064307_cute-cats-png.png",
    title: "Cozy Blanket Snuggle & Kisses",
    alt: "Two cute characters snuggled under a pink heart blanket sharing sweet kisses",
    aspectRatio: "640 / 480",
    defaultWidth: 190,
    defaultHeight: 142,
    mood: "Cozy comfort, bedtime dreams, gentle closeness, quiet intimacy",
  },
  kissingCouple: {
    id: "kissingCouple",
    src: "/images/528-5288220_kawaii-tumblr-png.png",
    originalFilename: "528-5288220_kawaii-tumblr-png.png",
    title: "Sweet Cheek Kiss & Daydreams",
    alt: "Cute bear kissing partner's cheek with a floating pink heart and dreamy thoughts",
    aspectRatio: "300 / 260",
    defaultWidth: 170,
    defaultHeight: 147,
    mood: "Playful romance, sweet daydreaming, storybook affection",
  },
  tenderCouple: {
    id: "tenderCouple",
    src: "/images/534-5341290_heart-pink-png.png",
    originalFilename: "534-5341290_heart-pink-png.png",
    title: "Tender Forehead Kiss",
    alt: "Loving character giving a tender forehead kiss with two pink floating hearts",
    aspectRatio: "500 / 480",
    defaultWidth: 175,
    defaultHeight: 168,
    mood: "Deep devotion, gentle comfort, heartfelt promise, romantic tenderness",
  },
};
