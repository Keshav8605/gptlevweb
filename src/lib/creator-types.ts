import type {
  Memory,
  Letter,
  OpenWhenLetter,
  ObservationCard,
  LittleReason,
  DeluluScenario,
  QuizQuestion,
  DigitalGift,
  BucketListItem,
  DateIdea,
  PersonalCard,
} from "./gift-data";

export interface CreatorPhoto {
  id: string;
  url: string;
  name: string;
  label?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface CreatorObservationItem extends ObservationCard {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorMemoryItem extends Memory {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorOpenWhenItem extends OpenWhenLetter {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorDeluluItem extends DeluluScenario {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorQuizItem extends QuizQuestion {
  selected: boolean;
  isCustom?: boolean;
  explanation?: string;
  image?: string;
}

export interface CreatorLetterItem extends Letter {
  greeting?: string;
  closingLine?: string;
  paperStyle?: "vintage" | "blush" | "minimal";
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorReasonItem extends LittleReason {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorGiftItem extends DigitalGift {
  conditions?: string;
  expiryDate?: string;
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorNotebookItem {
  id: string;
  title?: string;
  content: string;
  date?: string;
  authorName?: string;
  moodEmoji?: string;
  photo?: string;
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorBucketListItem extends BucketListItem {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorPersonalCardItem extends PersonalCard {
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorDateItem extends DateIdea {
  coverPhoto?: string;
  costEstimateText?: string;
  estimatedDuration?: string;
  personalNote?: string;
  selected: boolean;
  isCustom?: boolean;
}

export interface CreatorConfig {
  // Step 2: Basic Details
  senderName: string;
  senderNickname: string;
  recipientName: string;
  recipientNickname: string;
  relationshipLabel?: "girlfriend" | "boyfriend" | "partner" | "spouse" | "custom" | string;
  customRelationshipLabel?: string;
  websiteTitle: string;
  tagline: string;
  openingLine: string;
  anniversaryDate?: string;
  preferredLanguage: string;
  closingSignature?: string;

  // Step 3: Chapter Selection
  selectedChapterIds: string[];
  chapterOrder: string[];

  // Step 4: Chapter Details
  welcome: {
    heading: string;
    eyebrowLabel: string;
    message: string;
    quote: string;
    buttonText: string;
    handwrittenNote?: string;
    subtitle?: string;
    signature?: string;
    coverPhoto?: string;
    couplePhoto?: string;
    selectedIllustration?: string;
    polaroids?: Array<{
      id: string;
      src: string;
      caption: string;
    }>;
  };

  observations: {
    items: CreatorObservationItem[];
  };

  secretWorld: {
    nicknames: string[];
    insideJokes: Array<{ id: string; title: string; explanation: string; photo?: string }>;
    traditions: Array<{ id: string; title: string; description: string }>;
    sharedPhrases: string[];
    password?: string;
    hint?: string;
    secretLetter?: string;
    secretPhotos?: string[];
  };

  memories: {
    layoutStyle: "scrapbook" | "collage" | "timeline" | "single";
    collageType?: "heart" | "polaroid";
    heartCollage?: {
      centerHeroPhoto?: string;
      centerHeroCaption?: string;
      photos?: string[];
      caption?: string;
    };
    polaroidCollage?: {
      centralHeartPhoto?: string;
      centralCaption?: string;
      borderPhotos?: string[];
    };
    items: CreatorMemoryItem[];
  };

  ourSong: {
    title: string;
    artist: string;
    whyItMatters: string;
    dedication: string;
    coverArtwork?: string;
    audioUrl?: string;
  };

  openWhen: {
    items: CreatorOpenWhenItem[];
  };

  delulu: {
    items: CreatorDeluluItem[];
  };

  quiz: {
    questions: CreatorQuizItem[];
  };

  letters: {
    items: CreatorLetterItem[];
  };

  littleReasons: {
    items: CreatorReasonItem[];
  };

  digitalGifts: {
    items: CreatorGiftItem[];
  };

  notebook: {
    notes: CreatorNotebookItem[];
  };

  voice: {
    mainMessage: string;
    audioTitle?: string;
    audioUrl?: string;
    transcript?: string;
    photo?: string;
  };

  bucketList: {
    items: CreatorBucketListItem[];
  };

  personalCards: {
    items: CreatorPersonalCardItem[];
  };

  datePlanner: {
    items: CreatorDateItem[];
  };

  lastSecret: {
    revealHeading: string;
    revealMessage: string;
    surprisePhoto?: string;
    buttonLabel: string;
    finalNote?: string;
    revealStyle: "card-flip" | "heart-burst" | "password-unlock";
    secretPasscode?: string;
  };

  finalHeart: {
    closingHeading: string;
    finalMessage: string;
    closingButtonLabel: string;
    signature: string;
    startDate?: string;
    finalPhoto?: string;
    collagePhotos: string[];
    collageStyle: "heart" | "grid";
  };

  // Step 5: Shared Photo Library
  photoLibrary: CreatorPhoto[];

  // Step 6: Design & Experience Preferences
  preferences: {
    colorPalette: "blush" | "lavender" | "cream-rose" | "sunset";
    typographyPreset: "elegant-serif" | "modern-rounded" | "romantic-classic";
    animationIntensity: "subtle" | "playful";
    mood: "soft-emotional" | "playful-cute" | "elegant-minimal";
    photoPresentation: "scrapbook" | "polaroid" | "collage";
    backgroundMusicEnabled: boolean;
  };
}
