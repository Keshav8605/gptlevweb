import fs from "fs";
import path from "path";
import type {
  ObservationCard,
  Memory,
  Letter,
  OpenWhenLetter,
  LittleReason,
  DeluluScenario,
  QuizQuestion,
  DigitalGift,
  BucketListItem,
  PersonalCard,
} from "./gift-data";

export interface ParticipantSession {
  role: "creator" | "recipient" | "guest";
  name: string;
}

export interface ContentReaction {
  id: string;
  giftId?: string;
  targetType: "observation" | "memory" | "letter" | "openWhen";
  targetId: string;
  emoji: string;
  author: "creator" | "recipient";
  authorName: string;
  createdAt: string;
}

export interface ContentComment {
  id: string;
  giftId?: string;
  targetType: "observation" | "memory" | "letter" | "openWhen";
  targetId: string;
  content: string;
  author: "creator" | "recipient";
  authorName: string;
  createdAt: string;
  isViewedByCreator: boolean;
}

export interface JournalReply {
  id: string;
  content: string;
  author: "creator" | "recipient";
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntry {
  id: string;
  giftId?: string;
  title?: string;
  content: string;
  prompt?: string;
  moodEmoji?: string;
  author: "creator" | "recipient";
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  reactions: Record<string, string[]>; // emoji -> author names
  replies: JournalReply[];
  isViewedByCreator: boolean;
}

export interface VoiceMessage {
  id: string;
  giftId?: string;
  audioData: string; // Base64 audio data URI
  durationSeconds: number;
  sender: "creator" | "recipient";
  senderName: string;
  createdAt: string;
  isListened: boolean;
}

// ==================== DATE PLANNER INTERFACES ====================

export type DateCategory =
  | "cozy_home"
  | "food_cafes"
  | "outdoor_adventures"
  | "romantic_evenings"
  | "creative_activities"
  | "spontaneous_adventures"
  | "budget_friendly"
  | "special_occasions";

export type DateCostRange = "free" | "low" | "medium" | "high";
export type DateEnvironment = "indoor" | "outdoor" | "both";
export type DatePreferenceState = "really_want" | "sounds_cute" | "maybe_someday" | "none";

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  coverPhoto: string;
  category: DateCategory;
  costRange: DateCostRange;
  costEstimateText: string;
  estimatedDuration: string;
  estimatedDurationMinutes: number;
  environment: DateEnvironment;
  location?: string;
  practicalNotes?: string;
  accessibilityNotes?: string;
  author: "creator" | "recipient";
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  isHidden: boolean;
  sortOrder: number;
  isCustom: boolean;
}

export interface DatePreference {
  id: string;
  ideaId: string;
  participantRole: "creator" | "recipient";
  participantName: string;
  status: DatePreferenceState;
  isFavorite: boolean;
  isShortlisted: boolean;
  personalNote?: string;
  updatedAt: string;
}

export interface ItineraryStop {
  id: string;
  ideaId?: string;
  title: string;
  location?: string;
  estimatedDurationMinutes: number;
  estimatedCostText?: string;
  notes?: string;
  travelOrBreakMinutesAfter?: number;
  travelNotes?: string;
}

export type ProposalStatus =
  | "draft"
  | "proposed"
  | "awaiting_response"
  | "changes_requested"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

export interface ProposalHistoryEntry {
  id: string;
  timestamp: string;
  authorRole: "creator" | "recipient";
  authorName: string;
  action:
    | "proposed"
    | "accepted"
    | "requested_changes"
    | "rescheduled"
    | "declined"
    | "cancelled"
    | "completed"
    | "revealed_surprise"
    | "edited";
  message?: string;
  changeDetails?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
  completedBy?: string;
  assignedTo?: "creator" | "recipient" | "both";
  notes?: string;
  createdAt: string;
}

export interface DateProposal {
  id: string;
  giftId?: string;
  title: string;
  description?: string;
  isSurprise: boolean;
  surpriseVibe?: string;
  surpriseWhatToWear?: string;
  surpriseRevealed: boolean;
  itinerary: ItineraryStop[];
  proposedDate: string; // YYYY-MM-DD
  proposedStartTime: string; // HH:mm
  timeZone: string;
  totalEstimatedDurationMinutes: number;
  estimatedTotalBudget: string;
  proposerRole: "creator" | "recipient";
  proposerName: string;
  targetPartnerRole: "creator" | "recipient";
  targetPartnerName: string;
  personalMessage?: string;
  status: ProposalStatus;
  history: ProposalHistoryEntry[];
  checklist: ChecklistItem[];
  negotiationNote?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  dedupeKey?: string;
}

export interface DateMemory {
  id: string;
  giftId?: string;
  proposalId?: string;
  dateTitle: string;
  completedDate: string;
  photos: string[]; // URLs or base64
  description: string;
  favoriteMoment: string;
  funniestMoment: string;
  personalNote: string;
  ratingEmoji: string; // e.g. "⭐⭐⭐⭐⭐"
  inspiredNextIdea?: string;
  authorRole: "creator" | "recipient";
  authorName: string;
  createdAt: string;
}

export interface DateNotification {
  id: string;
  type:
    | "new_proposal"
    | "proposal_accepted"
    | "changes_requested"
    | "rescheduled"
    | "cancelled"
    | "upcoming_reminder"
    | "post_date_memory_prompt";
  title: string;
  message: string;
  proposalId?: string;
  targetRole: "creator" | "recipient" | "both";
  isRead: boolean;
  createdAt: string;
  dedupeKey?: string;
}

export interface NotificationSettings {
  upcomingReminders: boolean;
  proposalAlerts: boolean;
  memoryPrompts: boolean;
}

// ==================== PHASE 5: CREATOR STUDIO & MULTI-GIFT ====================

export interface GiftRecord {
  id: string;
  creatorId?: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "unpublished";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  senderName: string;
  senderNickname: string;
  recipientName: string;
  recipientNickname: string;
  dateFirstMet?: string;
  dateOfficialCouple?: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeMessage: string;
  welcomePolaroids?: { id?: string; src?: string; caption?: string }[];
  welcomeEyebrow?: string;
  welcomeHandwrittenNote?: string;
  memoriesCollageType?: "heart" | "polaroid";
  memoriesHeartCollage?: {
    centerHeroPhoto?: string;
    centerHeroCaption?: string;
    photos?: string[];
    caption?: string;
  };
  memoriesPolaroidCollage?: {
    centralHeartPhoto?: string;
    centralCaption?: string;
    borderPhotos?: string[];
  };
  enabledSections: string[];
  sectionOrder: string[];
  customMilestones?: { id: string; label: string; date: string }[];
  secretPassword?: string;
  secretHint?: string;
  secretContent?: string;
  featuredSong?: {
    heading?: string;
    subtitle?: string;
    title: string;
    artist: string;
    dedicationHeading?: string;
    dedication: string;
    whyItMatters?: string;
    coverArtwork?: string;
  };
  finalLetter?: string;
  finalMessage?: string;
  customObservations?: ObservationCard[];
  customMemories?: Memory[];
  customLetters?: Letter[];
  customOpenWhenLetters?: OpenWhenLetter[];
  customLittleReasons?: LittleReason[];
  customDeluluScenarios?: DeluluScenario[];
  customQuizQuestions?: QuizQuestion[];
  customDigitalGifts?: DigitalGift[];
  customBucketListItems?: BucketListItem[];
  customPersonalCards?: PersonalCard[];
  customDateIdeas?: DateIdea[];
  lastSecretHeading?: string;
  lastSecretMessage?: string;
  lastSecretPhoto?: string;
  lastSecretButtonLabel?: string;
  lastSecretFinalNote?: string;
  finalHeading?: string;
  finalSignature?: string;
  finalPhoto?: string;
  finalCenterPhoto?: string;
  finalCollagePhotos?: string[];
  designPreferences?: {
    colorPalette?: "blush" | "lavender" | "cream-rose" | "sunset" | string;
    typographyPreset?: "elegant-serif" | "modern-rounded" | "romantic-classic" | string;
    animationIntensity?: "subtle" | "playful" | string;
    mood?: "soft-emotional" | "playful-cute" | "elegant-minimal" | string;
    photoPresentation?: "scrapbook" | "polaroid" | "collage" | string;
    backgroundMusicEnabled?: boolean;
  };
  privacy: {
    isPasswordProtected: boolean;
    passcode?: string;
    recipientInviteToken: string;
    invitationStatus: "active" | "revoked";
    allowResponses: boolean;
    allowRecipientContributions: boolean;
  };
}

export interface MediaAsset {
  id: string;
  giftId?: string;
  creatorId?: string;
  name: string;
  type: "image" | "audio";
  mimeType: string;
  sizeBytes: number;
  dataUrl: string; // Base64 data URI or public url
  caption?: string;
  createdAt: string;
}

export interface RelationshipDatabase {
  config: {
    giftId: string;
    creatorPasscode: string;
    recipientInviteToken: string;
    invitationStatus: "active" | "revoked";
    creatorName: string;
    recipientName: string;
  };
  reactions: ContentReaction[];
  comments: ContentComment[];
  journalEntries: JournalEntry[];
  voiceMessages: VoiceMessage[];
  dateIdeas: DateIdea[];
  datePreferences: DatePreference[];
  dateProposals: DateProposal[];
  dateMemories: DateMemory[];
  dateNotifications: DateNotification[];
  notificationSettings: NotificationSettings;
  gifts: GiftRecord[];
  mediaAssets: MediaAsset[];
}

// ==================== DEFAULT INITIAL SEED DATA ====================

export const defaultDateIdeas: DateIdea[] = [
  {
    "id": "idea_sunset_picnic",
    "title": "Sunset Picnic",
    "description": "Pack a wicker basket with our favorite artisan cheeses, fresh strawberries, and chilled sparkling cider. We'll spread out a soft blanket and watch the sky melt into lavender and gold.",
    "coverPhoto": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "category": "outdoor_adventures",
    "costRange": "low",
    "costEstimateText": "$15 - $25 (Snacks & cider)",
    "estimatedDuration": "2 hours",
    "estimatedDurationMinutes": 120,
    "environment": "outdoor",
    "location": "Scenic Ridge Overlook",
    "practicalNotes": "Bring an extra warm cardigan or throw blanket for when the sun dips below the hills.",
    "accessibilityNotes": "Paved gentle pathway to the picnic knoll with wooden benches nearby.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 1,
    "isCustom": false
  },
  {
    "id": "idea_cafe_hopping",
    "title": "Café Date",
    "description": "Spend a slow afternoon trying three distinct cozy neighborhood cafés. We'll order one specialty beverage and one warm pastry at each spot and score them in our little notebook.",
    "coverPhoto": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "category": "food_cafes",
    "costRange": "low",
    "costEstimateText": "$20 - $35",
    "estimatedDuration": "2.5 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "Old Town Cobblestone Quarter",
    "practicalNotes": "Come with an appetite for matcha lattes, cardamom buns, and deep conversations.",
    "accessibilityNotes": "Level street entrances with comfortable indoor seating.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 2,
    "isCustom": false
  },
  {
    "id": "idea_blanket_fort",
    "title": "Movie Night at Home",
    "description": "Construct a palace out of every soft blanket and fairy light in the apartment. Squeeze inside with warm stove-popped caramel popcorn and binge our favorite films.",
    "coverPhoto": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
    "category": "cozy_home",
    "costRange": "free",
    "costEstimateText": "Free (Zero cost)",
    "estimatedDuration": "3 hours",
    "estimatedDurationMinutes": 180,
    "environment": "indoor",
    "location": "Our Living Room",
    "practicalNotes": "Fairy lights, giant cushions, and pajamas required.",
    "accessibilityNotes": "Ultra relaxed home floor and couch setting.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 3,
    "isCustom": false
  },
  {
    "id": "idea_scenic_drive",
    "title": "Go for a Drive",
    "description": "No strict destination in mind. We roll the windows down, blast the songs we both know every single lyric to, and stop whenever an interesting roadside fruit stand or lookout appears.",
    "coverPhoto": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    "category": "spontaneous_adventures",
    "costRange": "low",
    "costEstimateText": "$15 - $25 (Fuel & treats)",
    "estimatedDuration": "3 hours",
    "estimatedDurationMinutes": 180,
    "environment": "both",
    "location": "Pine Valley & Coastal Highway",
    "practicalNotes": "Charge phones, download our roadtrip playlist, and pack gummy candies.",
    "accessibilityNotes": "Comfortable car ride with accessible viewpoints.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 4,
    "isCustom": false
  },
  {
    "id": "idea_cooking_pasta",
    "title": "Cook Dinner Together",
    "description": "We tie our aprons on, put on soft acoustic jazz, and roll out fresh tagliatelle dough from scratch. Complete with simmering browned-butter sage sauce, freshly grated parmesan, and wine.",
    "coverPhoto": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    "category": "cozy_home",
    "costRange": "low",
    "costEstimateText": "$20 - $30 (Ingredients & wine)",
    "estimatedDuration": "2.5 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "Our Kitchen",
    "practicalNotes": "Expect a little dusting of flour on our noses!",
    "accessibilityNotes": "Kitchen workspace with counter stools.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 5,
    "isCustom": false
  },
  {
    "id": "idea_pottery_painting",
    "title": "Painting or Pottery",
    "description": "Sit side-by-side behind the potter's wheel or in front of twin easels. We'll sculpt or paint something inspired by each other—no artistic skills required, just pure fun and giggles.",
    "coverPhoto": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    "category": "creative_activities",
    "costRange": "medium",
    "costEstimateText": "$45 - $65 (Studio pass & clay)",
    "estimatedDuration": "2 hours",
    "estimatedDurationMinutes": 120,
    "environment": "indoor",
    "location": "The Artisan Studio",
    "practicalNotes": "Wear clothes you wouldn't mind getting a tiny smudge of clay or paint on.",
    "accessibilityNotes": "Seated ceramic studio stations with accessible wash basins.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 6,
    "isCustom": false
  },
  {
    "id": "idea_arcade_bowling",
    "title": "Arcade or Bowling Night",
    "description": "Skeeball, air hockey, and cosmic glow bowling. Winner gets to pick the midnight snack and gets a victory kiss.",
    "coverPhoto": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    "category": "spontaneous_adventures",
    "costRange": "low",
    "costEstimateText": "$25 - $40",
    "estimatedDuration": "2.5 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "Neon Strike Lanes & Arcade",
    "practicalNotes": "Bring your competitive spirit!",
    "accessibilityNotes": "Wheelchair accessible bowling ramps and wide arcade aisles.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 7,
    "isCustom": false
  },
  {
    "id": "idea_midnight_stargazing",
    "title": "Stargazing",
    "description": "Drive away from city lights, lay back on the hood or a thick wool blanket, and gaze up at the Milky Way. We'll identify constellations and make wishes on shooting stars.",
    "coverPhoto": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    "category": "romantic_evenings",
    "costRange": "free",
    "costEstimateText": "Free (Zero cost)",
    "estimatedDuration": "2 hours",
    "estimatedDurationMinutes": 120,
    "environment": "outdoor",
    "location": "Dark Sky Nature Preserve Hill",
    "practicalNotes": "Thermos of hot chocolate, thick jackets, and star-map app.",
    "accessibilityNotes": "Open clearing right next to scenic vehicle pull-off.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 8,
    "isCustom": false
  },
  {
    "id": "idea_recreating_first_date",
    "title": "Revisit Our First Date",
    "description": "Walk the exact steps, sit at the same corner table, and reminisce about how butterflies were fluttering in our chests the first time our eyes met.",
    "coverPhoto": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "category": "special_occasions",
    "costRange": "medium",
    "costEstimateText": "$50 - $80",
    "estimatedDuration": "3.5 hours",
    "estimatedDurationMinutes": 210,
    "environment": "both",
    "location": "Where Our Story Started",
    "practicalNotes": "Bonus points for wearing similar outfits or colors from that magical day.",
    "accessibilityNotes": "Full accessibility according to original venue.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 9,
    "isCustom": false
  },
  {
    "id": "idea_secret_tasting_menu",
    "title": "Try a New Restaurant",
    "description": "Dress to the nines and indulge in a romantic multi-course culinary adventure. Dim lights, soft music, and exquisite desserts.",
    "coverPhoto": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    "category": "romantic_evenings",
    "costRange": "high",
    "costEstimateText": "$80 - $140",
    "estimatedDuration": "2.5 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "Boutique Candlelit Dining Room",
    "practicalNotes": "Semi-formal romantic attire recommended.",
    "accessibilityNotes": "Ground-floor entrance, elevator, spacious dining area.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 10,
    "isCustom": false
  },
  {
    "id": "idea_old_bookstore",
    "title": "Bookstore Date",
    "description": "Get lost between tall mahogany shelves. We each pick one book or poetry piece that reminds us of each other, tuck a secret note inside, and read our favorite paragraphs together in a quiet corner.",
    "coverPhoto": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    "category": "budget_friendly",
    "costRange": "free",
    "costEstimateText": "Free / Under $15 (Coffee & book)",
    "estimatedDuration": "2 hours",
    "estimatedDurationMinutes": 120,
    "environment": "indoor",
    "location": "The Whispering Pages Bookshop",
    "practicalNotes": "Perfect for a slow rainy afternoon.",
    "accessibilityNotes": "Ramps available and cushioned reading armchairs.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 11,
    "isCustom": false
  },
  {
    "id": "idea_sunrise_pastries",
    "title": "Watch the Sunrise",
    "description": "Wake up before the rest of the world, slip into oversized hoodies, pick up fresh morning croissants right as the bakery ovens open, and watch the ocean turn gold.",
    "coverPhoto": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    "category": "outdoor_adventures",
    "costRange": "low",
    "costEstimateText": "$10 - $20",
    "estimatedDuration": "2 hours",
    "estimatedDurationMinutes": 120,
    "environment": "outdoor",
    "location": "East Shore Wooden Pier",
    "practicalNotes": "Set an early alarm and bundle up warm.",
    "accessibilityNotes": "Boardwalk path with railing and benches.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 12,
    "isCustom": false
  },
  {
    "id": "idea_botanical_garden",
    "title": "Walk Through a Garden",
    "description": "Wander hand-in-hand through lush tropical glasshouses, blooming orchid corridors, and hidden stone archways. A tranquil paradise filled with floral scent.",
    "coverPhoto": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    "category": "outdoor_adventures",
    "costRange": "low",
    "costEstimateText": "$20 - $30",
    "estimatedDuration": "3 hours",
    "estimatedDurationMinutes": 180,
    "environment": "both",
    "location": "Glasshouse Conservatory & Gardens",
    "practicalNotes": "Wear comfortable walking shoes and bring a camera for portraits.",
    "accessibilityNotes": "Paved ADA-compliant garden pathways throughout.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 13,
    "isCustom": false
  },
  {
    "id": "idea_surprise_mystery_date",
    "title": "Surprise Date",
    "description": "A curated surprise where every stop is carefully kept secret until we arrive. All you need to do is show up, relax, and let yourself be spoiled.",
    "coverPhoto": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    "category": "special_occasions",
    "costRange": "medium",
    "costEstimateText": "$40 - $70",
    "estimatedDuration": "3.5 hours",
    "estimatedDurationMinutes": 210,
    "environment": "both",
    "location": "Classified Destination 🤫",
    "practicalNotes": "Wear your favorite comfortable yet cute outfit; all logistics are handled.",
    "accessibilityNotes": "Tailored to be comfortable and relaxing.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 14,
    "isCustom": false
  },
  {
    "id": "idea_bowling_night",
    "title": "Bowling Night",
    "description": "Lace up the goofy shoes, grab some nachos, and see who gets the first strike. Loser buys milkshakes!",
    "coverPhoto": "https://images.unsplash.com/photo-1538388149542-5e24932d11a8?auto=format&fit=crop&w=800&q=80",
    "category": "spontaneous_adventures",
    "costRange": "low",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 1.5–2 hours",
    "estimatedDurationMinutes": 105,
    "environment": "indoor",
    "location": "Local bowling alley & arcade lounge.",
    "practicalNotes": "Wear comfortable socks for the bowling shoes!",
    "accessibilityNotes": "Ramps to bowling lanes and lightweight balls available.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 15,
    "isCustom": false
  },
  {
    "id": "idea_movie_theater",
    "title": "Movie Theater Date",
    "description": "Catch the latest release on the big screen, share an oversized buttered popcorn, and whisper during the trailers.",
    "coverPhoto": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    "category": "romantic_evenings",
    "costRange": "low",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 2–2.5 hours",
    "estimatedDurationMinutes": 135,
    "environment": "indoor",
    "location": "Local cinema or indie movie theater.",
    "practicalNotes": "Book seats in the back row center for the best view and cozy cuddling.",
    "accessibilityNotes": "Step-free theater access with companion seating.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 16,
    "isCustom": false
  },
  {
    "id": "idea_mini_golf",
    "title": "Mini Golf",
    "description": "Playful rivalry around windmills and obstacles. Silly trick shots, gentle teasing, and celebratory high-fives.",
    "coverPhoto": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
    "category": "outdoor_adventures",
    "costRange": "low",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 1.5 hours",
    "estimatedDurationMinutes": 90,
    "environment": "both",
    "location": "Outdoor or glow-in-the-dark mini golf course.",
    "practicalNotes": "Winner gets to pick where we get ice cream or snacks afterwards!",
    "accessibilityNotes": "Gradual paved paths between holes.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 17,
    "isCustom": false
  },
  {
    "id": "idea_aquarium_visit",
    "title": "Visit an Aquarium",
    "description": "Wander hand-in-hand under glowing blue underwater arches, watching sea turtles, gliding rays, and jellyfish.",
    "coverPhoto": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    "category": "creative_activities",
    "costRange": "medium",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 2–3 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "City aquarium or oceanarium.",
    "practicalNotes": "Visit during late afternoon feeding times for the best views.",
    "accessibilityNotes": "Fully accessible ramps and elevators throughout the aquarium exhibits.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 18,
    "isCustom": false
  },
  {
    "id": "idea_ice_cream_run",
    "title": "Ice Cream Date",
    "description": "A spontaneous evening trip for our favorite scoops, trying each other's flavors, and walking under streetlights.",
    "coverPhoto": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80",
    "category": "food_cafes",
    "costRange": "low",
    "costEstimateText": "Under ",
    "estimatedDuration": "About 45–60 minutes",
    "estimatedDurationMinutes": 45,
    "environment": "both",
    "location": "Our favorite local gelato or ice cream parlor.",
    "practicalNotes": "Get waffle cones and try at least one new wildcard flavor!",
    "accessibilityNotes": "Street level entrance with outdoor sidewalk tables.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 19,
    "isCustom": false
  },
  {
    "id": "idea_farmers_market",
    "title": "Farmers Market Date",
    "description": "Morning coffees in hand, browsing fresh fruit stalls, artisan bakery pastries, and picking out fresh flowers.",
    "coverPhoto": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    "category": "outdoor_adventures",
    "costRange": "low",
    "costEstimateText": "Under ",
    "estimatedDuration": "About 1.5–2 hours",
    "estimatedDurationMinutes": 100,
    "environment": "outdoor",
    "location": "Weekend downtown farmers market square.",
    "practicalNotes": "Go early in the morning for the freshest warm pastries and coffee.",
    "accessibilityNotes": "Open pedestrian street area with curb ramps.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 20,
    "isCustom": false
  },
  {
    "id": "idea_ice_skating",
    "title": "Ice Skating",
    "description": "Hold onto each other on the ice, laugh when we wobble, and warm up after with rich hot cocoa and marshmallows.",
    "coverPhoto": "https://images.unsplash.com/photo-1487803836022-91054ca05fdd?auto=format&fit=crop&w=800&q=80",
    "category": "romantic_evenings",
    "costRange": "low",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 1.5–2 hours",
    "estimatedDurationMinutes": 105,
    "environment": "both",
    "location": "Seasonal outdoor or indoor ice rink.",
    "practicalNotes": "Wear warm thick socks, gloves, and a soft scarf.",
    "accessibilityNotes": "Wheelchair ice sledges and spectator warming benches available.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 21,
    "isCustom": false
  },
  {
    "id": "idea_board_game_cafe",
    "title": "Board Game Date",
    "description": "Order warm lattes and spend hours challenging each other to hilarious party games and cozy strategy favorites.",
    "coverPhoto": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "category": "cozy_home",
    "costRange": "low",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 2–3 hours",
    "estimatedDurationMinutes": 150,
    "environment": "indoor",
    "location": "Board game lounge or cozy café corner.",
    "practicalNotes": "Ask the staff for beginner-friendly two-player game recommendations.",
    "accessibilityNotes": "Standard table heights and spacious aisle seating.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 22,
    "isCustom": false
  },
  {
    "id": "idea_thrift_challenge",
    "title": "Thrift Store Date",
    "description": "Browse quirky vintage racks, pick surprise outfits for each other to try on, and hunt for hidden treasures.",
    "coverPhoto": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    "category": "budget_friendly",
    "costRange": "low",
    "costEstimateText": "Under ",
    "estimatedDuration": "About 1.5–2 hours",
    "estimatedDurationMinutes": 100,
    "environment": "indoor",
    "location": "Local vintage boutique or thrift marketplace.",
    "practicalNotes": "Set a fun challenge limit for the most unique item found!",
    "accessibilityNotes": "Wide shopping aisles with fitting room access.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 23,
    "isCustom": false
  },
  {
    "id": "idea_amusement_park",
    "title": "Amusement Park Date",
    "description": "Ride the fun rollercoasters, share sweet cotton candy, win a prize, and share a sweet moment at the top of the Ferris wheel.",
    "coverPhoto": "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80",
    "category": "special_occasions",
    "costRange": "medium",
    "costEstimateText": "About  - ",
    "estimatedDuration": "About 3–4 hours",
    "estimatedDurationMinutes": 210,
    "environment": "outdoor",
    "location": "Local theme park, carnival, or seaside boardwalk.",
    "practicalNotes": "Catch the Ferris wheel right as golden hour begins for gorgeous sunset views.",
    "accessibilityNotes": "Paved park paths with ride accessibility passes available.",
    "author": "creator",
    "authorName": "Babe",
    "createdAt": "2026-10-10T12:00:00.000Z",
    "isHidden": false,
    "sortOrder": 24,
    "isCustom": false
  }
];

export const defaultDateProposals: DateProposal[] = [];

// Helper to compute dynamic future date (e.g. 3 days from now)
function getFutureDateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const defaultDateMemories: DateMemory[] = [
  {
    id: "mem_date_1",
    proposalId: "prop_past_pasta",
    dateTitle: "Homemade Tagliatelle & Candlelight Evening",
    completedDate: getPastDateString(6),
    photos: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    ],
    description: "We ended up covering half the kitchen counter in flour, but the pasta was heavenly and we couldn't stop laughing.",
    favoriteMoment: "When you wiped a smudge of flour on my nose and laughed so hard you had to sit down.",
    funniestMoment: "Dropping a single piece of dough on the floor and both staring at it in total silence.",
    personalNote: "I love cooking with you. Even messy kitchens feel like paradise when you're there.",
    ratingEmoji: "⭐⭐⭐⭐⭐",
    inspiredNextIdea: "Let's try making handmade sourdough or pizza next!",
    authorRole: "recipient",
    authorName: "Baby",
    createdAt: new Date(Date.now() - 500000000).toISOString(),
  },
];

export const defaultDateNotifications: DateNotification[] = [];

export const defaultNotificationSettings: NotificationSettings = {
  upcomingReminders: true,
  proposalAlerts: true,
  memoryPrompts: true,
};

export const defaultGifts: GiftRecord[] = [
  {
    id: "gift_world_demo",
    slug: "sweetheart",
    title: "A Little World For You 💕",
    status: "published",
    createdAt: "2026-10-10T12:00:00.000Z",
    updatedAt: new Date().toISOString(),
    publishedAt: "2026-10-10T12:00:00.000Z",
    senderName: "Your Love",
    senderNickname: "Babe",
    recipientName: "My Everything",
    recipientNickname: "Baby",
    dateFirstMet: "2023-06-15",
    dateOfficialCouple: "2023-08-20",
    welcomeTitle: "I Made Something For You",
    welcomeSubtitle: "A little world, just for us ✨",
    welcomeMessage:
      "Because you deserve to know how special you are to me. Every pixel on this page holds a piece of my heart. Take your time exploring — this is all for you.",
    enabledSections: [
      "welcome",
      "observations",
      "memories",
      "secretWorld",
      "deluluMode",
      "quiz",
      "letters",
      "notebook",
      "voice",
      "datePlanner",
      "openWhenLetters",
      "littleReasons",
      "digitalGifts",
      "ourSong",
      "finalHeart",
    ],
    sectionOrder: [
      "welcome",
      "observations",
      "memories",
      "secretWorld",
      "deluluMode",
      "quiz",
      "letters",
      "notebook",
      "voice",
      "datePlanner",
      "openWhenLetters",
      "littleReasons",
      "digitalGifts",
      "ourSong",
      "finalHeart",
    ],
    customMilestones: [
      { id: "1", label: "First Date", date: "2023-07-02" },
      { id: "2", label: "First Trip Together", date: "2024-01-15" },
    ],
    secretPassword: "iloveyou",
    secretHint: "What I whisper before we fall asleep...",
    secretContent: "You are the greatest dream my heart has ever dared to imagine. Forever and always.",
    featuredSong: {
      title: "Golden Hour (Our Melody)",
      artist: "JVKE / Acoustic Lofi",
      dedication: "Dedicated to the golden light in your eyes whenever you laugh.",
      whyItMatters: "Reminds me of our long drive under the twilight sky.",
    },
    finalLetter:
      "If I had to live a thousand lifetimes, I would search for you in every single one of them. Thank you for making my life softer, sweeter, and infinitely brighter.",
    finalMessage: "Forever yours, with all my love.",
    privacy: {
      isPasswordProtected: false,
      passcode: "love2024",
      recipientInviteToken: "sweetheart",
      invitationStatus: "active",
      allowResponses: true,
      allowRecipientContributions: true,
    },
  },
];

export const defaultMediaAssets: MediaAsset[] = [
  {
    id: "media_1",
    giftId: "gift_world_demo",
    name: "Sunlit Picnic Blanket.jpg",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 245000,
    dataUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    caption: "Sunset picnic setup at the ridge overlook",
    createdAt: "2026-10-10T12:00:00.000Z",
  },
  {
    id: "media_2",
    giftId: "gift_world_demo",
    name: "Artisan Coffee & Pastries.jpg",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 310000,
    dataUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    caption: "Our favorite corner bakery table",
    createdAt: "2026-10-10T12:00:00.000Z",
  },
  {
    id: "media_3",
    giftId: "gift_world_demo",
    name: "Stargazing Meadow.jpg",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 198000,
    dataUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    caption: "Midnight constellations preserve",
    createdAt: "2026-10-10T12:00:00.000Z",
  },
];

// Initial state for fallback
const defaultDb: RelationshipDatabase = {
  config: {
    giftId: "gift_world_demo",
    creatorPasscode: "love2024",
    recipientInviteToken: "sweetheart",
    invitationStatus: "active",
    creatorName: "Babe",
    recipientName: "Baby",
  },
  reactions: [
    {
      id: "rx_demo_1",
      targetType: "observation",
      targetId: "ob1",
      emoji: "🥺",
      author: "recipient",
      authorName: "Baby",
      createdAt: new Date().toISOString(),
    },
  ],
  comments: [
    {
      id: "cm_demo_1",
      targetType: "observation",
      targetId: "ob1",
      content: "I didn't think you ever noticed that! You make me blush so hard.",
      author: "recipient",
      authorName: "Baby",
      createdAt: new Date().toISOString(),
      isViewedByCreator: false,
    },
  ],
  journalEntries: [
    {
      id: "jn_demo_1",
      title: "The day you smiled at me like that",
      content:
        "I was thinking about the moment we were sitting in that little corner café, and you started laughing so hard your eyes crinkled. I remember wishing I could pause the whole afternoon, just to stay in that moment a little longer.",
      prompt: "A memory I never want to forget",
      moodEmoji: "☕",
      author: "creator",
      authorName: "Babe",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      reactions: { "❤️": ["Baby"] },
      replies: [
        {
          id: "jnr_demo_1",
          content: "You kept staring at me and I wondered if I had chocolate on my cheek! 🙈 I love you so much.",
          author: "recipient",
          authorName: "Baby",
          createdAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      isViewedByCreator: true,
    },
  ],
  voiceMessages: [],
  dateIdeas: defaultDateIdeas,
  datePreferences: [
    {
      id: "pref_init_1",
      ideaId: "idea_sunset_picnic",
      participantRole: "recipient",
      participantName: "Baby",
      status: "really_want",
      isFavorite: true,
      isShortlisted: true,
      personalNote: "I want to watch the sunset with you so badly!",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "pref_init_2",
      ideaId: "idea_cafe_hopping",
      participantRole: "recipient",
      participantName: "Baby",
      status: "sounds_cute",
      isFavorite: false,
      isShortlisted: true,
      personalNote: "I'll try the matcha latte with oat milk.",
      updatedAt: new Date().toISOString(),
    },
  ],
  dateProposals: defaultDateProposals,
  dateMemories: defaultDateMemories,
  dateNotifications: defaultDateNotifications,
  notificationSettings: defaultNotificationSettings,
  gifts: defaultGifts,
  mediaAssets: defaultMediaAssets,
};

// Data persistence file path
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "relationship-database.json");

let memoryDb: RelationshipDatabase | null = null;

export function loadDatabase(): RelationshipDatabase {
  if (memoryDb) return memoryDb;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      memoryDb = JSON.parse(raw);

      // Auto-migrate if older DB lacks Phase 4 & Phase 5 collections
      let needsSave = false;
      if (!memoryDb!.dateIdeas || memoryDb!.dateIdeas.length === 0) {
        memoryDb!.dateIdeas = JSON.parse(JSON.stringify(defaultDateIdeas));
        needsSave = true;
      }
      if (!memoryDb!.datePreferences) {
        memoryDb!.datePreferences = JSON.parse(JSON.stringify(defaultDb.datePreferences));
        needsSave = true;
      }
      if (!memoryDb!.dateProposals) {
        memoryDb!.dateProposals = JSON.parse(JSON.stringify(defaultDateProposals));
        needsSave = true;
      }
      if (!memoryDb!.dateMemories) {
        memoryDb!.dateMemories = JSON.parse(JSON.stringify(defaultDateMemories));
        needsSave = true;
      }
      if (!memoryDb!.dateNotifications) {
        memoryDb!.dateNotifications = JSON.parse(JSON.stringify(defaultDateNotifications));
        needsSave = true;
      }
      if (!memoryDb!.notificationSettings) {
        memoryDb!.notificationSettings = JSON.parse(JSON.stringify(defaultNotificationSettings));
        needsSave = true;
      }
      if (!memoryDb!.gifts || memoryDb!.gifts.length === 0) {
        memoryDb!.gifts = JSON.parse(JSON.stringify(defaultGifts));
        needsSave = true;
      }
      if (!memoryDb!.mediaAssets) {
        memoryDb!.mediaAssets = JSON.parse(JSON.stringify(defaultMediaAssets));
        needsSave = true;
      }

      if (needsSave) {
        saveDatabase(memoryDb!);
      }

      return memoryDb!;
    }
  } catch (err) {
    console.error("Failed to read database file, using fallback:", err);
  }

  memoryDb = JSON.parse(JSON.stringify(defaultDb));
  saveDatabase(memoryDb!);
  return memoryDb!;
}

export function saveDatabase(db: RelationshipDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const payload = JSON.stringify(db, null, 2);
    const tempFile = path.join(
      DATA_DIR,
      `.tmp-db-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`
    );

    try {
      fs.writeFileSync(tempFile, payload, "utf-8");
      fs.renameSync(tempFile, DATA_FILE);
      memoryDb = db;
    } catch (writeErr) {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch {
          // Ignore temp cleanup error
        }
      }
      throw writeErr;
    }
  } catch (err) {
    console.error("Failed to write database file:", err);
    throw new Error(
      `Database persistence failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ==================== AUTH & ACCESS ====================

export function verifyAccess(tokenOrPasscode: string): {
  authorized: boolean;
  role: "creator" | "recipient" | "guest";
  name: string;
  error?: string;
} {
  const db = loadDatabase();
  const normalized = (tokenOrPasscode || "").trim();

  if (!normalized) {
    return { authorized: false, role: "guest", name: "Guest", error: "Authentication required." };
  }

  // Check creator passcode
  if (normalized === db.config.creatorPasscode) {
    return { authorized: true, role: "creator", name: db.config.creatorName };
  }

  // Check recipient invite token
  if (normalized === db.config.recipientInviteToken) {
    if (db.config.invitationStatus === "revoked") {
      return { authorized: false, role: "guest", name: "Guest", error: "This invitation link has been revoked by the creator." };
    }
    return { authorized: true, role: "recipient", name: db.config.recipientName };
  }

  return { authorized: false, role: "guest", name: "Guest", error: "Invalid access token or passcode." };
}

export function getCoupleConfig() {
  const db = loadDatabase();
  return {
    giftId: db.config.giftId,
    invitationStatus: db.config.invitationStatus,
    creatorName: db.config.creatorName,
    recipientName: db.config.recipientName,
  };
}

export function getFullCoupleConfigForCreator() {
  const db = loadDatabase();
  return {
    giftId: db.config.giftId,
    recipientInviteToken: db.config.recipientInviteToken,
    invitationStatus: db.config.invitationStatus,
    creatorName: db.config.creatorName,
    recipientName: db.config.recipientName,
  };
}

export function updateCoupleConfig(updates: Partial<RelationshipDatabase["config"]>) {
  const db = loadDatabase();
  db.config = { ...db.config, ...updates };
  saveDatabase(db);
  return db.config;
}

// ==================== REACTIONS ====================

export function getReactions(targetType?: string, targetId?: string, giftId?: string) {
  const db = loadDatabase();
  let list = db.reactions;
  if (giftId) list = list.filter((r) => r.giftId === giftId);
  if (targetType) list = list.filter((r) => r.targetType === targetType);
  if (targetId) list = list.filter((r) => r.targetId === targetId);
  return list;
}

export function toggleReaction(
  targetType: ContentReaction["targetType"],
  targetId: string,
  emoji: string,
  author: "creator" | "recipient",
  authorName: string,
  giftId?: string
) {
  const db = loadDatabase();
  const existingIdx = db.reactions.findIndex(
    (r) => r.targetType === targetType && r.targetId === targetId && r.emoji === emoji && r.author === author
  );

  if (existingIdx !== -1) {
    db.reactions.splice(existingIdx, 1);
  } else {
    db.reactions.push({
      id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      giftId,
      targetType,
      targetId,
      emoji,
      author,
      authorName,
      createdAt: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return db.reactions.filter((r) => r.targetType === targetType && r.targetId === targetId);
}

// ==================== COMMENTS ====================

export function getComments(targetType?: string, targetId?: string, giftId?: string) {
  const db = loadDatabase();
  let list = db.comments;
  if (giftId) list = list.filter((c) => c.giftId === giftId);
  if (targetType) list = list.filter((c) => c.targetType === targetType);
  if (targetId) list = list.filter((c) => c.targetId === targetId);
  return list;
}

export function addComment(
  targetType: ContentComment["targetType"],
  targetId: string,
  content: string,
  author: "creator" | "recipient",
  authorName: string,
  giftId?: string
) {
  const db = loadDatabase();
  const newComment: ContentComment = {
    id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId,
    targetType,
    targetId,
    content: content.trim(),
    author,
    authorName,
    createdAt: new Date().toISOString(),
    isViewedByCreator: author === "creator",
  };
  db.comments.push(newComment);
  saveDatabase(db);
  return newComment;
}

export function deleteComment(id: string, role: "creator" | "recipient") {
  const db = loadDatabase();
  const idx = db.comments.findIndex((c) => c.id === id);
  if (idx === -1) return false;

  if (role !== "creator" && db.comments[idx].author !== role) {
    return false;
  }

  db.comments.splice(idx, 1);
  saveDatabase(db);
  return true;
}

// ==================== NOTEBOOK ====================

export function getJournalEntries(giftId?: string): JournalEntry[] {
  const db = loadDatabase();
  let list = db.journalEntries;
  if (giftId) list = list.filter((j) => j.giftId === giftId);
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addJournalEntry(entry: {
  giftId?: string;
  title?: string;
  content: string;
  prompt?: string;
  moodEmoji?: string;
  author: "creator" | "recipient";
  authorName: string;
}) {
  const db = loadDatabase();
  const newEntry: JournalEntry = {
    id: `jn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId: entry.giftId,
    title: entry.title?.trim() || undefined,
    content: entry.content.trim(),
    prompt: entry.prompt?.trim() || undefined,
    moodEmoji: entry.moodEmoji || "🤍",
    author: entry.author,
    authorName: entry.authorName,
    createdAt: new Date().toISOString(),
    reactions: {},
    replies: [],
    isViewedByCreator: entry.author === "creator",
  };

  db.journalEntries.push(newEntry);
  saveDatabase(db);
  return newEntry;
}

export function addJournalReply(
  entryId: string,
  content: string,
  author: "creator" | "recipient",
  authorName: string
) {
  const db = loadDatabase();
  const entry = db.journalEntries.find((j) => j.id === entryId);
  if (!entry) return null;

  const newReply: JournalReply = {
    id: `jnr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    content: content.trim(),
    author,
    authorName,
    createdAt: new Date().toISOString(),
  };

  entry.replies.push(newReply);
  if (author === "recipient") {
    entry.isViewedByCreator = false;
  }
  saveDatabase(db);
  return newReply;
}

export function toggleJournalReaction(
  entryId: string,
  emoji: string,
  authorName: string
) {
  const db = loadDatabase();
  const entry = db.journalEntries.find((j) => j.id === entryId);
  if (!entry) return null;

  if (!entry.reactions) entry.reactions = {};
  const currentList = entry.reactions[emoji] || [];

  if (currentList.includes(authorName)) {
    entry.reactions[emoji] = currentList.filter((n) => n !== authorName);
    if (entry.reactions[emoji].length === 0) {
      delete entry.reactions[emoji];
    }
  } else {
    entry.reactions[emoji] = [...currentList, authorName];
  }

  saveDatabase(db);
  return entry.reactions;
}

export function updateJournalEntry(
  id: string,
  updates: {
    title?: string;
    content: string;
    prompt?: string;
    moodEmoji?: string;
  },
  role: "creator" | "recipient",
  authorName?: string
) {
  const db = loadDatabase();
  const entry = db.journalEntries.find((j) => j.id === id);
  if (!entry) return null;

  const isMatch =
    role === "creator" ||
    entry.author === role ||
    Boolean(authorName && entry.authorName?.trim().toLowerCase() === authorName.trim().toLowerCase());

  if (!isMatch) {
    return null;
  }

  if (updates.title !== undefined) entry.title = updates.title.trim() || undefined;
  if (updates.content !== undefined) entry.content = updates.content.trim();
  if (updates.prompt !== undefined) entry.prompt = updates.prompt.trim() || undefined;
  if (updates.moodEmoji !== undefined) entry.moodEmoji = updates.moodEmoji;
  entry.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return entry;
}

export function deleteJournalEntry(id: string, role: "creator" | "recipient", authorName?: string) {
  const db = loadDatabase();
  const idx = db.journalEntries.findIndex((j) => j.id === id);
  if (idx === -1) return false;

  const entry = db.journalEntries[idx];
  const isMatch =
    role === "creator" ||
    entry.author === role ||
    Boolean(authorName && entry.authorName?.trim().toLowerCase() === authorName.trim().toLowerCase());

  if (!isMatch) {
    return false;
  }

  db.journalEntries.splice(idx, 1);
  saveDatabase(db);
  return true;
}

export function updateJournalReply(
  entryId: string,
  replyId: string,
  content: string,
  role: "creator" | "recipient",
  authorName?: string
) {
  const db = loadDatabase();
  const entry = db.journalEntries.find((j) => j.id === entryId);
  if (!entry) return null;

  const reply = entry.replies.find((r) => r.id === replyId);
  if (!reply) return null;

  const isMatch =
    role === "creator" ||
    reply.author === role ||
    Boolean(authorName && reply.authorName?.trim().toLowerCase() === authorName.trim().toLowerCase());

  if (!isMatch) {
    return null;
  }

  reply.content = content.trim();
  reply.updatedAt = new Date().toISOString();

  saveDatabase(db);
  return reply;
}

export function deleteJournalReply(
  entryId: string,
  replyId: string,
  role: "creator" | "recipient",
  authorName?: string
) {
  const db = loadDatabase();
  const entry = db.journalEntries.find((j) => j.id === entryId);
  if (!entry) return false;

  const rIdx = entry.replies.findIndex((r) => r.id === replyId);
  if (rIdx === -1) return false;

  const reply = entry.replies[rIdx];
  const isMatch =
    role === "creator" ||
    reply.author === role ||
    Boolean(authorName && reply.authorName?.trim().toLowerCase() === authorName.trim().toLowerCase());

  if (!isMatch) {
    return false;
  }

  entry.replies.splice(rIdx, 1);
  saveDatabase(db);
  return true;
}

// ==================== VOICE MESSAGES ====================

export function getVoiceMessages(giftId?: string): VoiceMessage[] {
  const db = loadDatabase();
  let list = db.voiceMessages;
  if (giftId) list = list.filter((v) => v.giftId === giftId);
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addVoiceMessage(
  audioData: string,
  durationSeconds: number,
  sender: "creator" | "recipient",
  senderName: string,
  giftId?: string
): VoiceMessage {
  const db = loadDatabase();
  const newMsg: VoiceMessage = {
    id: `vm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId,
    audioData,
    durationSeconds: Math.round(durationSeconds) || 5,
    sender,
    senderName,
    createdAt: new Date().toISOString(),
    isListened: false,
  };

  db.voiceMessages.push(newMsg);
  saveDatabase(db);
  return newMsg;
}

export function deleteVoiceMessage(id: string, role: "creator" | "recipient") {
  const db = loadDatabase();
  const idx = db.voiceMessages.findIndex((v) => v.id === id);
  if (idx === -1) return false;

  if (role !== "creator" && db.voiceMessages[idx].sender !== role) {
    return false;
  }

  db.voiceMessages.splice(idx, 1);
  saveDatabase(db);
  return true;
}

// ==================== DATE PLANNER: IDEAS ====================

export function getDateIdeas(includeHidden = false): DateIdea[] {
  const db = loadDatabase();
  let list = db.dateIdeas;
  if (!includeHidden) {
    list = list.filter((item) => !item.isHidden);
  }
  return [...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function addDateIdea(
  data: Partial<DateIdea>,
  author: "creator" | "recipient",
  authorName: string
): DateIdea {
  const db = loadDatabase();
  const newIdea: DateIdea = {
    id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: (data.title || "New Romantic Date Idea").trim(),
    description: (data.description || "").trim(),
    coverPhoto: data.coverPhoto?.trim() || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    category: data.category || "spontaneous_adventures",
    costRange: data.costRange || "low",
    costEstimateText: (data.costEstimateText || "$20 - $40").trim(),
    estimatedDuration: (data.estimatedDuration || "2 hours").trim(),
    estimatedDurationMinutes: data.estimatedDurationMinutes || 120,
    environment: data.environment || "both",
    location: data.location?.trim() || undefined,
    practicalNotes: data.practicalNotes?.trim() || undefined,
    accessibilityNotes: data.accessibilityNotes?.trim() || undefined,
    author,
    authorName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isHidden: false,
    sortOrder: (db.dateIdeas.length || 0) + 1,
    isCustom: true,
  };

  db.dateIdeas.push(newIdea);
  saveDatabase(db);
  return newIdea;
}

export function updateDateIdea(
  id: string,
  updates: Partial<DateIdea>,
  role: "creator" | "recipient"
): DateIdea | null {
  const db = loadDatabase();
  const idx = db.dateIdeas.findIndex((item) => item.id === id);
  if (idx === -1) return null;

  const existing = db.dateIdeas[idx];
  // Permissions: creator can edit any idea; recipient can edit their custom ideas
  if (role !== "creator" && existing.author !== role && !existing.isCustom) {
    return null;
  }

  const updated: DateIdea = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.dateIdeas[idx] = updated;
  saveDatabase(db);
  return updated;
}

export function deleteDateIdea(id: string, role: "creator" | "recipient"): boolean {
  const db = loadDatabase();
  const idx = db.dateIdeas.findIndex((item) => item.id === id);
  if (idx === -1) return false;

  const idea = db.dateIdeas[idx];
  // If custom idea, delete completely if authorized
  if (idea.isCustom) {
    if (role !== "creator" && idea.author !== role) return false;
    db.dateIdeas.splice(idx, 1);
  } else {
    // Seed ideas are marked hidden instead of deleting completely
    if (role !== "creator") return false;
    idea.isHidden = true;
  }

  saveDatabase(db);
  return true;
}

// ==================== DATE PLANNER: PREFERENCES & SHORTLIST ====================

export function getDatePreferences(participantRole: "creator" | "recipient"): DatePreference[] {
  const db = loadDatabase();
  return db.datePreferences.filter((p) => p.participantRole === participantRole);
}

export function updateDatePreference(
  ideaId: string,
  updates: Partial<DatePreference>,
  role: "creator" | "recipient",
  name: string
): DatePreference {
  const db = loadDatabase();
  const existingIdx = db.datePreferences.findIndex(
    (p) => p.ideaId === ideaId && p.participantRole === role
  );

  if (existingIdx !== -1) {
    const existing = db.datePreferences[existingIdx];
    const updated: DatePreference = {
      ...existing,
      ...updates,
      participantName: name,
      updatedAt: new Date().toISOString(),
    };
    db.datePreferences[existingIdx] = updated;
    saveDatabase(db);
    return updated;
  }

  // Create new preference record
  const newPref: DatePreference = {
    id: `pref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ideaId,
    participantRole: role,
    participantName: name,
    status: updates.status || "none",
    isFavorite: updates.isFavorite ?? false,
    isShortlisted: updates.isShortlisted ?? false,
    personalNote: updates.personalNote?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  db.datePreferences.push(newPref);
  saveDatabase(db);
  return newPref;
}

// ==================== DATE PLANNER: PROPOSALS & NEGOTIATION ====================

// Mask surprise details for recipient if surprise mode is active and unrevealed
function maskSurpriseForRecipient(
  proposal: DateProposal,
  viewerRole?: "creator" | "recipient" | "guest"
): DateProposal {
  if (
    proposal.isSurprise &&
    !proposal.surpriseRevealed &&
    viewerRole === proposal.targetPartnerRole
  ) {
    return {
      ...proposal,
      title: "Secret Adventure Planned Just For You 🤫✨",
      description: proposal.surpriseVibe || "A magical surprise prepared with all my love. Details hidden until we get there!",
      itinerary: proposal.itinerary.map((stop, i) => ({
        id: stop.id,
        title: `Surprise Stop #${i + 1} ✨`,
        location: "Destination Secret 🗺️",
        estimatedDurationMinutes: stop.estimatedDurationMinutes,
        estimatedCostText: stop.estimatedCostText,
        notes: "Kept secret to surprise you! ♡",
      })),
    };
  }
  return proposal;
}

export function getDateProposals(viewerRole?: "creator" | "recipient" | "guest"): DateProposal[] {
  const db = loadDatabase();
  return db.dateProposals
    .map((p) => maskSurpriseForRecipient(p, viewerRole))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getDateProposal(
  id: string,
  viewerRole?: "creator" | "recipient" | "guest"
): DateProposal | null {
  const db = loadDatabase();
  const proposal = db.dateProposals.find((p) => p.id === id);
  if (!proposal) return null;
  return maskSurpriseForRecipient(proposal, viewerRole);
}

export function createDateProposal(
  data: Partial<DateProposal>,
  proposerRole: "creator" | "recipient",
  proposerName: string,
  dedupeKey?: string
): DateProposal {
  const db = loadDatabase();

  // Deduplication check
  if (dedupeKey) {
    const existing = db.dateProposals.find(
      (p) => p.dedupeKey === dedupeKey && Date.now() - new Date(p.createdAt).getTime() < 60000
    );
    if (existing) return existing;
  }

  const targetPartnerRole = proposerRole === "creator" ? "recipient" : "creator";
  const targetPartnerName = proposerRole === "creator" ? db.config.recipientName : db.config.creatorName;

  const initialHistory: ProposalHistoryEntry = {
    id: `hist_${Date.now()}_1`,
    timestamp: new Date().toISOString(),
    authorRole: proposerRole,
    authorName: proposerName,
    action: "proposed",
    message: data.personalMessage || `Proposed date for ${data.proposedDate || "an upcoming adventure"}.`,
  };

  const newProposal: DateProposal = {
    id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId: data.giftId,
    title: (data.title || "Our Next Little Adventure").trim(),
    description: data.description?.trim(),
    isSurprise: data.isSurprise ?? false,
    surpriseVibe: data.surpriseVibe?.trim(),
    surpriseWhatToWear: data.surpriseWhatToWear?.trim(),
    surpriseRevealed: !(data.isSurprise ?? false),
    itinerary: data.itinerary && data.itinerary.length > 0 ? data.itinerary : [
      {
        id: `stop_${Date.now()}`,
        title: data.title || "Romantic Outing",
        estimatedDurationMinutes: data.totalEstimatedDurationMinutes || 120,
        notes: "Main event",
      },
    ],
    proposedDate: data.proposedDate || getFutureDateString(3),
    proposedStartTime: data.proposedStartTime || "18:00",
    timeZone: data.timeZone || "America/New_York",
    totalEstimatedDurationMinutes: data.totalEstimatedDurationMinutes || 120,
    estimatedTotalBudget: data.estimatedTotalBudget || "$30 - $50",
    proposerRole,
    proposerName,
    targetPartnerRole,
    targetPartnerName,
    personalMessage: data.personalMessage?.trim(),
    status: data.status || "proposed",
    history: [initialHistory],
    checklist: data.checklist || [
      {
        id: `chk_${Date.now()}_1`,
        task: "Confirm arrival time and pick an outfit",
        isCompleted: false,
        assignedTo: "both",
        createdAt: new Date().toISOString(),
      },
    ],
    negotiationNote: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dedupeKey,
  };

  db.dateProposals.push(newProposal);

  // Send Notification to target partner
  createNotificationInternal(db, {
    type: "new_proposal",
    title: "New Date Proposal! 💌",
    message: `${proposerName} proposed "${newProposal.title}" for ${newProposal.proposedDate} at ${newProposal.proposedStartTime}.`,
    proposalId: newProposal.id,
    targetRole: targetPartnerRole,
    dedupeKey: `notif_prop_${newProposal.id}`,
  });

  saveDatabase(db);
  return newProposal;
}

export function transitionDateProposal(
  id: string,
  action: "accept" | "request_changes" | "reschedule" | "decline" | "cancel" | "complete" | "reveal_surprise",
  payload: {
    note?: string;
    proposedDate?: string;
    proposedStartTime?: string;
    itinerary?: ItineraryStop[];
    reason?: string;
  },
  role: "creator" | "recipient",
  name: string
): { success: boolean; proposal?: DateProposal; error?: string } {
  const db = loadDatabase();
  const idx = db.dateProposals.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: "Proposal not found" };

  const proposal = db.dateProposals[idx];
  const otherRole = role === "creator" ? "recipient" : "creator";
  const now = new Date().toISOString();

  switch (action) {
    case "accept": {
      // Must not be self-accepted! Proposer cannot accept their own proposal.
      if (proposal.proposerRole === role && proposal.status === "proposed") {
        return { success: false, error: "Only the invited partner can accept this date proposal." };
      }

      if (proposal.status !== "proposed" && proposal.status !== "changes_requested") {
        return { success: false, error: `Cannot accept proposal in status: ${proposal.status}` };
      }

      proposal.status = "confirmed";
      proposal.confirmedAt = now;
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "accepted",
        message: payload.note || "Accepted date proposal! Adventure confirmed ♡",
      });

      // Notify the proposer
      createNotificationInternal(db, {
        type: "proposal_accepted",
        title: "Proposal Accepted! 🎉",
        message: `${name} accepted "${proposal.title}" for ${proposal.proposedDate}! Adventure confirmed ♡`,
        proposalId: proposal.id,
        targetRole: proposal.proposerRole,
        dedupeKey: `accept_${proposal.id}`,
      });
      break;
    }

    case "request_changes": {
      proposal.status = "changes_requested";
      proposal.updatedAt = now;
      if (payload.proposedDate) proposal.proposedDate = payload.proposedDate;
      if (payload.proposedStartTime) proposal.proposedStartTime = payload.proposedStartTime;
      if (payload.note) proposal.negotiationNote = payload.note;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "requested_changes",
        message: payload.note || "Suggested different timing or itinerary changes.",
        changeDetails: payload.proposedDate ? `Suggested new date: ${payload.proposedDate} at ${payload.proposedStartTime || proposal.proposedStartTime}` : undefined,
      });

      createNotificationInternal(db, {
        type: "changes_requested",
        title: "Date Timing / Change Request 💬",
        message: `${name} suggested adjustments for "${proposal.title}": ${payload.note || "Check the proposed timing."}`,
        proposalId: proposal.id,
        targetRole: otherRole,
        dedupeKey: `change_${proposal.id}_${Date.now()}`,
      });
      break;
    }

    case "reschedule": {
      if (payload.proposedDate) proposal.proposedDate = payload.proposedDate;
      if (payload.proposedStartTime) proposal.proposedStartTime = payload.proposedStartTime;
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "rescheduled",
        message: payload.note || `Rescheduled to ${proposal.proposedDate} at ${proposal.proposedStartTime}.`,
      });

      createNotificationInternal(db, {
        type: "rescheduled",
        title: "Date Rescheduled 🗓️",
        message: `${name} rescheduled "${proposal.title}" to ${proposal.proposedDate} at ${proposal.proposedStartTime}.`,
        proposalId: proposal.id,
        targetRole: otherRole,
        dedupeKey: `resched_${proposal.id}_${Date.now()}`,
      });
      break;
    }

    case "decline": {
      proposal.status = "declined";
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "declined",
        message: payload.note || "Politely declined date proposal.",
      });

      createNotificationInternal(db, {
        type: "cancelled",
        title: "Proposal Update 💌",
        message: `${name} declined "${proposal.title}": ${payload.note || "Let's plan something else soon!"}`,
        proposalId: proposal.id,
        targetRole: proposal.proposerRole,
        dedupeKey: `decline_${proposal.id}`,
      });
      break;
    }

    case "cancel": {
      proposal.status = "cancelled";
      proposal.cancelledAt = now;
      proposal.cancellationReason = payload.reason || payload.note;
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "cancelled",
        message: payload.reason || "Cancelled date event.",
      });

      createNotificationInternal(db, {
        type: "cancelled",
        title: "Date Cancelled",
        message: `${name} cancelled "${proposal.title}". Reason: ${payload.reason || "Schedule conflict."}`,
        proposalId: proposal.id,
        targetRole: otherRole,
        dedupeKey: `cancel_${proposal.id}`,
      });
      break;
    }

    case "complete": {
      proposal.status = "completed";
      proposal.completedAt = now;
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "completed",
        message: "Marked date as completed! Ready to save memories ♡",
      });

      createNotificationInternal(db, {
        type: "post_date_memory_prompt",
        title: "How was our date? 📸💕",
        message: `"${proposal.title}" is complete! Add photographs and favorite memories to our scrapbook.`,
        proposalId: proposal.id,
        targetRole: "both",
        dedupeKey: `complete_${proposal.id}`,
      });
      break;
    }

    case "reveal_surprise": {
      // Only proposer can reveal surprise
      if (proposal.proposerRole !== role && role !== "creator") {
        return { success: false, error: "Only the planner can reveal the surprise." };
      }
      proposal.surpriseRevealed = true;
      proposal.updatedAt = now;

      proposal.history.push({
        id: `hist_${Date.now()}`,
        timestamp: now,
        authorRole: role,
        authorName: name,
        action: "revealed_surprise",
        message: "Revealed surprise date details! ✨",
      });
      break;
    }

    default:
      return { success: false, error: "Invalid action" };
  }

  saveDatabase(db);
  return { success: true, proposal };
}

// ==================== DATE PLANNER: CHECKLIST ====================

export function updateProposalChecklist(
  proposalId: string,
  checklist: ChecklistItem[],
  role?: string,
  name?: string
): ChecklistItem[] | null {
  const db = loadDatabase();
  const proposal = db.dateProposals.find((p) => p.id === proposalId);
  if (!proposal) return null;

  proposal.checklist = checklist;
  proposal.updatedAt = new Date().toISOString();

  if (role && name) {
    if (!proposal.history) proposal.history = [];
    proposal.history.push({
      id: `hist_${Date.now()}`,
      timestamp: proposal.updatedAt,
      authorRole: role as "creator" | "recipient",
      authorName: name,
      action: "edited",
      message: `Updated checklist (${checklist.filter((c) => c.isCompleted).length}/${checklist.length} completed)`,
    });
  }

  saveDatabase(db);
  return proposal.checklist;
}

// ==================== DATE PLANNER: MEMORIES ====================

export function getDateMemories(): DateMemory[] {
  const db = loadDatabase();
  return [...db.dateMemories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addDateMemory(
  data: Partial<DateMemory>,
  authorRole: "creator" | "recipient",
  authorName: string
): DateMemory {
  const db = loadDatabase();

  const newMemory: DateMemory = {
    id: `dmem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId: data.giftId,
    proposalId: data.proposalId,
    dateTitle: (data.dateTitle || "Our Little Adventure").trim(),
    completedDate: data.completedDate || new Date().toISOString().split("T")[0],
    photos: Array.isArray(data.photos) ? data.photos : [],
    description: (data.description || "").trim(),
    favoriteMoment: (data.favoriteMoment || "").trim(),
    funniestMoment: (data.funniestMoment || "").trim(),
    personalNote: (data.personalNote || "").trim(),
    ratingEmoji: data.ratingEmoji || "⭐⭐⭐⭐⭐",
    inspiredNextIdea: data.inspiredNextIdea?.trim() || undefined,
    authorRole,
    authorName,
    createdAt: new Date().toISOString(),
  };

  db.dateMemories.push(newMemory);
  saveDatabase(db);
  return newMemory;
}

export function deleteDateMemory(id: string, role: "creator" | "recipient"): boolean {
  const db = loadDatabase();
  const idx = db.dateMemories.findIndex((m) => m.id === id);
  if (idx === -1) return false;

  const mem = db.dateMemories[idx];
  if (role !== "creator" && mem.authorRole !== role) {
    return false;
  }

  db.dateMemories.splice(idx, 1);
  saveDatabase(db);
  return true;
}

// ==================== DATE PLANNER: NOTIFICATIONS ====================

function createNotificationInternal(
  db: RelationshipDatabase,
  data: Omit<DateNotification, "id" | "createdAt" | "isRead">
) {
  // Deduplication check
  if (data.dedupeKey) {
    const existing = db.dateNotifications.find((n) => n.dedupeKey === data.dedupeKey);
    if (existing) return existing;
  }

  const newNotif: DateNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: data.type,
    title: data.title,
    message: data.message,
    proposalId: data.proposalId,
    targetRole: data.targetRole,
    isRead: false,
    createdAt: new Date().toISOString(),
    dedupeKey: data.dedupeKey,
  };

  db.dateNotifications.unshift(newNotif);
  // Keep last 50 notifications
  if (db.dateNotifications.length > 50) {
    db.dateNotifications = db.dateNotifications.slice(0, 50);
  }
  return newNotif;
}

export function createNotification(
  data: Omit<DateNotification, "id" | "createdAt" | "isRead">
): DateNotification {
  const db = loadDatabase();
  const notif = createNotificationInternal(db, data);
  saveDatabase(db);
  return notif;
}

export function getDateNotifications(targetRole?: "creator" | "recipient" | "guest"): DateNotification[] {
  const db = loadDatabase();
  if (!targetRole || targetRole === "guest") return [];
  return db.dateNotifications.filter(
    (n) => n.targetRole === targetRole || n.targetRole === "both"
  );
}

export function markNotificationsAsRead(
  ids: string[] | "all",
  targetRole: "creator" | "recipient"
): boolean {
  const db = loadDatabase();
  db.dateNotifications.forEach((n) => {
    if (n.targetRole === targetRole || n.targetRole === "both") {
      if (ids === "all" || ids.includes(n.id)) {
        n.isRead = true;
      }
    }
  });
  saveDatabase(db);
  return true;
}

export function getNotificationSettings(): NotificationSettings {
  const db = loadDatabase();
  return db.notificationSettings || defaultNotificationSettings;
}

export function updateNotificationSettings(updates: Partial<NotificationSettings>): NotificationSettings {
  const db = loadDatabase();
  db.notificationSettings = {
    ...db.notificationSettings,
    ...updates,
  };
  saveDatabase(db);
  return db.notificationSettings;
}

// ==================== CREATOR RESPONSE CENTER ====================

export function getCreatorResponseSummary(creatorId?: string, giftId?: string) {
  const db = loadDatabase();

  const creatorGifts = creatorId
    ? db.gifts.filter((g) => Boolean(g.creatorId) && g.creatorId === creatorId)
    : db.gifts;
  const creatorGiftIds = new Set(creatorGifts.map((g) => g.id));

  // If specific giftId is requested, verify the creator owns it
  if (giftId && !creatorGiftIds.has(giftId)) {
    return {
      totalRecipientReactions: 0,
      totalRecipientComments: 0,
      unreadCommentsCount: 0,
      totalJournalEntries: 0,
      unreadJournalCount: 0,
      totalVoiceMessages: 0,
      unreadVoiceCount: 0,
      totalDateProposals: 0,
      activeProposalsCount: 0,
      confirmedEventsCount: 0,
      totalDateMemories: 0,
      recentComments: [],
      recentJournal: [],
      voiceMessages: [],
      invitationStatus: "active" as const,
    };
  }

  const targetGiftIds = giftId ? new Set([giftId]) : creatorGiftIds;
  const matchGift = (itemGiftId?: string) => {
    if (itemGiftId) return targetGiftIds.has(itemGiftId);
    return targetGiftIds.has("gift_world_demo");
  };

  const scopedComments = db.comments.filter((c) => matchGift(c.giftId));
  const unreadComments = scopedComments.filter((c) => c.author === "recipient" && !c.isViewedByCreator);
  const scopedEntries = db.journalEntries.filter((j) => matchGift(j.giftId));
  const unreadEntries = scopedEntries.filter((j) => j.author === "recipient" && !j.isViewedByCreator);
  const scopedVoice = db.voiceMessages.filter((v) => matchGift(v.giftId));
  const unlistenedVoice = scopedVoice.filter((v) => v.sender === "recipient" && !v.isListened);
  const scopedProposals = db.dateProposals.filter((p) => matchGift(p.giftId));
  const scopedMemories = db.dateMemories.filter((m) => matchGift(m.giftId));
  const scopedReactions = db.reactions.filter((r) => matchGift(r.giftId));

  return {
    totalRecipientReactions: scopedReactions.filter((r) => r.author === "recipient").length,
    totalRecipientComments: scopedComments.filter((c) => c.author === "recipient").length,
    unreadCommentsCount: unreadComments.length,
    totalJournalEntries: scopedEntries.length,
    unreadJournalCount: unreadEntries.length,
    totalVoiceMessages: scopedVoice.length,
    unreadVoiceCount: unlistenedVoice.length,
    totalDateProposals: scopedProposals.length,
    activeProposalsCount: scopedProposals.filter((p) => p.status === "proposed" || p.status === "changes_requested").length,
    confirmedEventsCount: scopedProposals.filter((p) => p.status === "confirmed").length,
    totalDateMemories: scopedMemories.length,
    recentComments: scopedComments.filter((c) => c.author === "recipient").slice(-10).reverse(),
    recentJournal: scopedEntries.slice(-10),
    voiceMessages: scopedVoice,
    invitationStatus: db.config.invitationStatus,
  };
}

export function markResponsesAsViewed(creatorId?: string, giftId?: string) {
  const db = loadDatabase();
  const creatorGifts = creatorId
    ? db.gifts.filter((g) => Boolean(g.creatorId) && g.creatorId === creatorId)
    : db.gifts;
  const creatorGiftIds = new Set(creatorGifts.map((g) => g.id));
  const targetGiftIds = giftId ? new Set([giftId]) : creatorGiftIds;
  const matchGift = (itemGiftId?: string) => {
    if (itemGiftId) return targetGiftIds.has(itemGiftId);
    return targetGiftIds.has("gift_world_demo");
  };

  let markedCount = 0;
  db.comments.forEach((c) => {
    if (c.author === "recipient" && matchGift(c.giftId) && !c.isViewedByCreator) {
      c.isViewedByCreator = true;
      markedCount++;
    }
  });
  db.journalEntries.forEach((j) => {
    if (j.author === "recipient" && matchGift(j.giftId) && !j.isViewedByCreator) {
      j.isViewedByCreator = true;
      markedCount++;
    }
  });
  db.voiceMessages.forEach((v) => {
    if (v.sender === "recipient" && matchGift(v.giftId) && !v.isListened) {
      v.isListened = true;
      markedCount++;
    }
  });
  if (markedCount > 0) saveDatabase(db);
  return { success: true, markedCount };
}

// ==================== PHASE 5: GIFT MANAGEMENT ====================

export function getGifts(creatorId?: string) {
  const db = loadDatabase();
  const totalResponses =
    db.comments.length +
    db.reactions.length +
    db.journalEntries.length +
    db.voiceMessages.length +
    db.dateProposals.length;

  let list = db.gifts;
  if (creatorId) {
    list = list.filter((g) => g.creatorId === creatorId || (!g.creatorId && g.id === "gift_world_demo"));
  }

  return list.map((g) => ({
    id: g.id,
    creatorId: g.creatorId,
    slug: g.slug,
    title: g.title,
    status: g.status,
    senderName: g.senderName,
    senderNickname: g.senderNickname,
    recipientName: g.recipientName,
    recipientNickname: g.recipientNickname,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    publishedAt: g.publishedAt,
    enabledSections: g.enabledSections || [],
    sectionCount: g.enabledSections?.length || 15,
    responseActivityCount: g.id === "gift_world_demo" ? totalResponses : 0,
    privacy: {
      isPasswordProtected: g.privacy.isPasswordProtected,
      invitationStatus: g.privacy.invitationStatus,
      allowResponses: g.privacy.allowResponses,
      allowRecipientContributions: g.privacy.allowRecipientContributions,
      // recipientInviteToken is NOT leaked in the gifts list
    },
  })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getGiftById(id: string): GiftRecord | null {
  const db = loadDatabase();
  return db.gifts.find((g) => g.id === id) || null;
}

export function getGiftBySlug(slug: string): GiftRecord | null {
  const db = loadDatabase();
  const normalized = (slug || "").trim().toLowerCase();
  return db.gifts.find((g) => g.slug.toLowerCase() === normalized) || null;
}

function generateSlug(title: string, db: RelationshipDatabase): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "romantic-gift";

  let candidate = base;
  let counter = 1;
  while (db.gifts.some((g) => g.slug.toLowerCase() === candidate.toLowerCase())) {
    candidate = `${base}-${counter}`;
    counter++;
  }
  return candidate;
}

export function createGift(data: Partial<GiftRecord>, creatorId?: string): GiftRecord {
  const db = loadDatabase();
  const title = (data.title || "My Romantic Gift ♡").trim();
  const slug = data.slug ? data.slug.trim().toLowerCase() : generateSlug(title, db);
  const now = new Date().toISOString();

  const allDefaultSections = [
    "welcome",
    "observations",
    "memories",
    "secretWorld",
    "deluluMode",
    "quiz",
    "letters",
    "notebook",
    "voice",
    "datePlanner",
    "openWhenLetters",
    "littleReasons",
    "digitalGifts",
    "ourSong",
    "finalHeart",
  ];

  const newGift: GiftRecord = {
    id: `gift_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    creatorId: creatorId || data.creatorId,
    slug,
    title,
    status: data.status || "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : undefined,
    senderName: (data.senderName || "Your Love").trim(),
    senderNickname: (data.senderNickname || "Babe").trim(),
    recipientName: (data.recipientName || "My Everything").trim(),
    recipientNickname: (data.recipientNickname || "Baby").trim(),
    dateFirstMet: data.dateFirstMet || undefined,
    dateOfficialCouple: data.dateOfficialCouple || undefined,
    welcomeTitle: data.welcomeTitle || "I Made Something Special For You",
    welcomeSubtitle: data.welcomeSubtitle || "A little world just for us ✨",
    welcomeMessage:
      data.welcomeMessage ||
      "Every single pixel on this page was crafted with you in my heart. Take your time exploring, my love.",
    welcomePolaroids: data.welcomePolaroids,
    welcomeEyebrow: data.welcomeEyebrow,
    welcomeHandwrittenNote: data.welcomeHandwrittenNote,
    memoriesCollageType: data.memoriesCollageType,
    memoriesHeartCollage: data.memoriesHeartCollage,
    memoriesPolaroidCollage: data.memoriesPolaroidCollage,
    enabledSections: data.enabledSections && data.enabledSections.length > 0 ? data.enabledSections : allDefaultSections,
    sectionOrder: data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : allDefaultSections,
    customMilestones: data.customMilestones,
    secretPassword: data.secretPassword || "iloveyou",
    secretHint: data.secretHint || "What I always whisper to you...",
    secretContent: data.secretContent || "You are the greatest dream my heart has ever dared to imagine.",
    featuredSong: data.featuredSong || {
      title: "Golden Hour (Our Melody)",
      artist: "JVKE / Acoustic Lofi",
      dedication: "Dedicated to the brightest light in my world.",
    },
    finalLetter: data.finalLetter || "Thank you for making my life softer, sweeter, and infinitely brighter. Forever yours.",
    finalMessage: data.finalMessage || "Forever and always yours.",
    customObservations: data.customObservations,
    customMemories: data.customMemories,
    customLetters: data.customLetters,
    customOpenWhenLetters: data.customOpenWhenLetters,
    customLittleReasons: data.customLittleReasons,
    customDeluluScenarios: data.customDeluluScenarios,
    customQuizQuestions: data.customQuizQuestions,
    customDigitalGifts: data.customDigitalGifts,
    customBucketListItems: data.customBucketListItems,
    customPersonalCards: data.customPersonalCards,
    customDateIdeas: data.customDateIdeas,
    lastSecretHeading: data.lastSecretHeading,
    lastSecretMessage: data.lastSecretMessage,
    lastSecretPhoto: data.lastSecretPhoto,
    lastSecretButtonLabel: data.lastSecretButtonLabel,
    lastSecretFinalNote: data.lastSecretFinalNote,
    finalHeading: data.finalHeading,
    finalSignature: data.finalSignature,
    finalPhoto: data.finalPhoto || data.finalCenterPhoto,
    finalCenterPhoto: data.finalCenterPhoto || data.finalPhoto,
    finalCollagePhotos: data.finalCollagePhotos,
    designPreferences: data.designPreferences,
    privacy: {
      isPasswordProtected: data.privacy?.isPasswordProtected ?? false,
      passcode: data.privacy?.passcode || "love2024",
      recipientInviteToken: data.privacy?.recipientInviteToken || `sweetheart-${Math.random().toString(36).slice(2, 6)}`,
      invitationStatus: data.privacy?.invitationStatus || "active",
      allowResponses: data.privacy?.allowResponses ?? true,
      allowRecipientContributions: data.privacy?.allowRecipientContributions ?? true,
    },
  };

  db.gifts.push(newGift);
  saveDatabase(db);
  return newGift;
}

export const EDITABLE_GIFT_FIELDS = [
  "title",
  "slug",
  "senderName",
  "senderNickname",
  "recipientName",
  "recipientNickname",
  "dateFirstMet",
  "dateOfficialCouple",
  "welcomeTitle",
  "welcomeSubtitle",
  "welcomeMessage",
  "welcomePolaroids",
  "welcomeEyebrow",
  "welcomeHandwrittenNote",
  "memoriesCollageType",
  "memoriesHeartCollage",
  "memoriesPolaroidCollage",
  "enabledSections",
  "sectionOrder",
  "customMilestones",
  "secretPassword",
  "secretHint",
  "secretContent",
  "featuredSong",
  "finalLetter",
  "finalMessage",
  "customObservations",
  "customMemories",
  "customLetters",
  "customOpenWhenLetters",
  "customLittleReasons",
  "customDeluluScenarios",
  "customQuizQuestions",
  "customDigitalGifts",
  "customBucketListItems",
  "customPersonalCards",
  "customDateIdeas",
  "lastSecretHeading",
  "lastSecretMessage",
  "lastSecretPhoto",
  "lastSecretButtonLabel",
  "lastSecretFinalNote",
  "finalHeading",
  "finalSignature",
  "finalPhoto",
  "finalCenterPhoto",
  "finalCollagePhotos",
  "designPreferences",
] as const;

const ALLOWED_TOP_LEVEL_FIELDS = new Set<string>([
  ...EDITABLE_GIFT_FIELDS,
  "privacy",
  "id",
  "creatorId",
  "createdAt",
  "updatedAt",
  "status",
  "publishedAt",
  "sectionCount",
  "responseActivityCount",
]);

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function validateStringField(
  val: unknown,
  fieldName: string,
  maxLen: number,
  required = false
): string | null {
  if (val === undefined || val === null) {
    if (required) return `Field '${fieldName}' is required.`;
    return null;
  }
  if (typeof val !== "string") {
    return `Field '${fieldName}' must be a string.`;
  }
  if (val.length > maxLen) {
    return `Field '${fieldName}' exceeds maximum length of ${maxLen} characters.`;
  }
  return null;
}

function validateBooleanField(
  val: unknown,
  fieldName: string
): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val !== "boolean") {
    return `Field '${fieldName}' must be a boolean.`;
  }
  return null;
}

function validateNumberField(
  val: unknown,
  fieldName: string,
  min = -10000,
  max = 1000000
): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    return `Field '${fieldName}' must be a valid number.`;
  }
  if (val < min || val > max) {
    return `Field '${fieldName}' must be between ${min} and ${max}.`;
  }
  return null;
}

function validateStringArray(
  arr: unknown,
  fieldName: string,
  maxCount: number,
  maxItemLen: number
): string | null {
  if (arr === undefined || arr === null) return null;
  if (!Array.isArray(arr)) {
    return `Field '${fieldName}' must be an array of strings.`;
  }
  if (arr.length > maxCount) {
    return `Field '${fieldName}' exceeds maximum limit of ${maxCount} items.`;
  }
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (typeof item !== "string") {
      return `Item at index ${i} in '${fieldName}' must be a string.`;
    }
    if (item.length > maxItemLen) {
      return `Item at index ${i} in '${fieldName}' exceeds maximum length of ${maxItemLen} characters.`;
    }
  }
  return null;
}

export function validateGiftUpdates(updates: unknown): { valid: boolean; error?: string } {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return { valid: false, error: "Request body must be a valid JSON object." };
  }

  // Check overall payload size to prevent DOS
  try {
    const jsonStr = JSON.stringify(updates);
    if (jsonStr.length > 25 * 1024 * 1024) {
      return { valid: false, error: "Update payload exceeds maximum allowed size of 25MB." };
    }
  } catch {
    return { valid: false, error: "Failed to serialize update payload." };
  }

  const record = updates as Record<string, unknown>;

  // Reject unknown top-level fields
  for (const key of Object.keys(record)) {
    if (!ALLOWED_TOP_LEVEL_FIELDS.has(key)) {
      return { valid: false, error: `Unknown top-level field '${key}' in update payload.` };
    }
  }

  // 1. Validate String Fields
  const STRING_FIELD_LIMITS: Record<string, number> = {
    title: 200,
    slug: 100,
    senderName: 100,
    senderNickname: 100,
    recipientName: 100,
    recipientNickname: 100,
    dateFirstMet: 100,
    dateOfficialCouple: 100,
    welcomeTitle: 300,
    welcomeSubtitle: 500,
    welcomeMessage: 20000,
    welcomeEyebrow: 200,
    welcomeHandwrittenNote: 10000,
    secretPassword: 100,
    secretHint: 500,
    secretContent: 20000,
    finalLetter: 50000,
    finalMessage: 20000,
    lastSecretHeading: 300,
    lastSecretMessage: 20000,
    lastSecretPhoto: 5000000,
    lastSecretButtonLabel: 100,
    lastSecretFinalNote: 10000,
    finalHeading: 300,
    finalSignature: 200,
    finalPhoto: 5000000,
    finalCenterPhoto: 5000000,
  };

  for (const [field, limit] of Object.entries(STRING_FIELD_LIMITS)) {
    if (field in record && record[field] !== undefined) {
      const err = validateStringField(record[field], field, limit);
      if (err) return { valid: false, error: err };
    }
  }

  // 2. Validate String Array Fields
  const STRING_ARRAY_FIELDS = ["enabledSections", "sectionOrder", "finalCollagePhotos"] as const;
  for (const field of STRING_ARRAY_FIELDS) {
    if (field in record && record[field] !== undefined) {
      const err = validateStringArray(record[field], field, 100, 5000);
      if (err) return { valid: false, error: err };
    }
  }

  // 3. Field-Level Validation for Collections

  // welcomePolaroids
  if ("welcomePolaroids" in record && record.welcomePolaroids !== undefined) {
    if (!Array.isArray(record.welcomePolaroids)) {
      return { valid: false, error: "Field 'welcomePolaroids' must be an array of objects." };
    }
    if (record.welcomePolaroids.length > 50) {
      return { valid: false, error: "Field 'welcomePolaroids' exceeds maximum limit of 50 items." };
    }
    for (let i = 0; i < record.welcomePolaroids.length; i++) {
      const p = record.welcomePolaroids[i];
      if (!isRecord(p)) {
        return { valid: false, error: `Item at index ${i} in 'welcomePolaroids' must be a valid object.` };
      }
      const err =
        validateStringField(p.id, `welcomePolaroids[${i}].id`, 100) ||
        validateStringField(p.src, `welcomePolaroids[${i}].src`, 5000000) ||
        validateStringField(p.caption, `welcomePolaroids[${i}].caption`, 500);
      if (err) return { valid: false, error: err };
    }
  }

  // customMilestones
  if ("customMilestones" in record && record.customMilestones !== undefined) {
    if (!Array.isArray(record.customMilestones)) {
      return { valid: false, error: "Field 'customMilestones' must be an array of objects." };
    }
    if (record.customMilestones.length > 50) {
      return { valid: false, error: "Field 'customMilestones' exceeds maximum limit of 50 items." };
    }
    for (let i = 0; i < record.customMilestones.length; i++) {
      const m = record.customMilestones[i];
      if (!isRecord(m)) {
        return { valid: false, error: `Item at index ${i} in 'customMilestones' must be a valid object.` };
      }
      const err =
        validateStringField(m.id, `customMilestones[${i}].id`, 100) ||
        validateStringField(m.label, `customMilestones[${i}].label`, 200) ||
        validateStringField(m.date, `customMilestones[${i}].date`, 100);
      if (err) return { valid: false, error: err };
    }
  }

  // customObservations
  if ("customObservations" in record && record.customObservations !== undefined) {
    if (!Array.isArray(record.customObservations)) {
      return { valid: false, error: "Field 'customObservations' must be an array of objects." };
    }
    if (record.customObservations.length > 100) {
      return { valid: false, error: "Field 'customObservations' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customObservations.length; i++) {
      const ob = record.customObservations[i];
      if (!isRecord(ob)) {
        return { valid: false, error: `Item at index ${i} in 'customObservations' must be a valid object.` };
      }
      const err =
        validateStringField(ob.id, `customObservations[${i}].id`, 100) ||
        validateStringField(ob.title, `customObservations[${i}].title`, 200) ||
        validateStringField(ob.content, `customObservations[${i}].content`, 5000) ||
        validateStringField(ob.photo, `customObservations[${i}].photo`, 5000000) ||
        validateStringField(ob.category, `customObservations[${i}].category`, 100) ||
        validateStringField(ob.emoji, `customObservations[${i}].emoji`, 20);
      if (err) return { valid: false, error: err };
    }
  }

  // customMemories
  if ("customMemories" in record && record.customMemories !== undefined) {
    if (!Array.isArray(record.customMemories)) {
      return { valid: false, error: "Field 'customMemories' must be an array of objects." };
    }
    if (record.customMemories.length > 100) {
      return { valid: false, error: "Field 'customMemories' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customMemories.length; i++) {
      const mem = record.customMemories[i];
      if (!isRecord(mem)) {
        return { valid: false, error: `Item at index ${i} in 'customMemories' must be a valid object.` };
      }
      const err =
        validateStringField(mem.id, `customMemories[${i}].id`, 100) ||
        validateStringField(mem.title, `customMemories[${i}].title`, 200) ||
        validateStringField(mem.description, `customMemories[${i}].description`, 5000) ||
        validateStringField(mem.date, `customMemories[${i}].date`, 100) ||
        validateStringArray(mem.photos, `customMemories[${i}].photos`, 20, 5000000) ||
        validateStringArray(mem.captions, `customMemories[${i}].captions`, 20, 500) ||
        validateStringField(mem.location, `customMemories[${i}].location`, 200) ||
        validateStringField(mem.category, `customMemories[${i}].category`, 100) ||
        validateStringField(mem.emoji, `customMemories[${i}].emoji`, 20);
      if (err) return { valid: false, error: err };
    }
  }

  // customLetters
  if ("customLetters" in record && record.customLetters !== undefined) {
    if (!Array.isArray(record.customLetters)) {
      return { valid: false, error: "Field 'customLetters' must be an array of objects." };
    }
    if (record.customLetters.length > 100) {
      return { valid: false, error: "Field 'customLetters' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customLetters.length; i++) {
      const l = record.customLetters[i];
      if (!isRecord(l)) {
        return { valid: false, error: `Item at index ${i} in 'customLetters' must be a valid object.` };
      }
      const err =
        validateStringField(l.id, `customLetters[${i}].id`, 100) ||
        validateStringField(l.title, `customLetters[${i}].title`, 200) ||
        validateStringField(l.content, `customLetters[${i}].content`, 20000) ||
        validateStringField(l.date, `customLetters[${i}].date`, 100) ||
        validateStringField(l.signature, `customLetters[${i}].signature`, 200) ||
        validateStringField(l.photo, `customLetters[${i}].photo`, 5000000);
      if (err) return { valid: false, error: err };
    }
  }

  // customOpenWhenLetters
  if ("customOpenWhenLetters" in record && record.customOpenWhenLetters !== undefined) {
    if (!Array.isArray(record.customOpenWhenLetters)) {
      return { valid: false, error: "Field 'customOpenWhenLetters' must be an array of objects." };
    }
    if (record.customOpenWhenLetters.length > 100) {
      return { valid: false, error: "Field 'customOpenWhenLetters' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customOpenWhenLetters.length; i++) {
      const l = record.customOpenWhenLetters[i];
      if (!isRecord(l)) {
        return { valid: false, error: `Item at index ${i} in 'customOpenWhenLetters' must be a valid object.` };
      }
      const err =
        validateStringField(l.id, `customOpenWhenLetters[${i}].id`, 100) ||
        validateStringField(l.title, `customOpenWhenLetters[${i}].title`, 200) ||
        validateStringField(l.heading, `customOpenWhenLetters[${i}].heading`, 200) ||
        validateStringField(l.opening, `customOpenWhenLetters[${i}].opening`, 500) ||
        validateStringField(l.emoji, `customOpenWhenLetters[${i}].emoji`, 20) ||
        validateStringField(l.content, `customOpenWhenLetters[${i}].content`, 20000) ||
        validateStringField(l.photo, `customOpenWhenLetters[${i}].photo`, 5000000) ||
        validateStringField(l.signature, `customOpenWhenLetters[${i}].signature`, 200) ||
        validateBooleanField(l.isOpened, `customOpenWhenLetters[${i}].isOpened`) ||
        validateStringField(l.character, `customOpenWhenLetters[${i}].character`, 100);
      if (err) return { valid: false, error: err };
    }
  }

  // customLittleReasons
  if ("customLittleReasons" in record && record.customLittleReasons !== undefined) {
    if (!Array.isArray(record.customLittleReasons)) {
      return { valid: false, error: "Field 'customLittleReasons' must be an array of objects." };
    }
    if (record.customLittleReasons.length > 200) {
      return { valid: false, error: "Field 'customLittleReasons' exceeds maximum limit of 200 items." };
    }
    for (let i = 0; i < record.customLittleReasons.length; i++) {
      const r = record.customLittleReasons[i];
      if (!isRecord(r)) {
        return { valid: false, error: `Item at index ${i} in 'customLittleReasons' must be a valid object.` };
      }
      const err =
        validateStringField(r.id, `customLittleReasons[${i}].id`, 100) ||
        validateStringField(r.title, `customLittleReasons[${i}].title`, 200) ||
        validateStringField(r.supportingText, `customLittleReasons[${i}].supportingText`, 2000) ||
        validateStringField(r.text, `customLittleReasons[${i}].text`, 2000) ||
        validateStringField(r.emoji, `customLittleReasons[${i}].emoji`, 20);
      if (err) return { valid: false, error: err };
    }
  }

  // customDeluluScenarios
  if ("customDeluluScenarios" in record && record.customDeluluScenarios !== undefined) {
    if (!Array.isArray(record.customDeluluScenarios)) {
      return { valid: false, error: "Field 'customDeluluScenarios' must be an array of objects." };
    }
    if (record.customDeluluScenarios.length > 50) {
      return { valid: false, error: "Field 'customDeluluScenarios' exceeds maximum limit of 50 items." };
    }
    for (let i = 0; i < record.customDeluluScenarios.length; i++) {
      const s = record.customDeluluScenarios[i];
      if (!isRecord(s)) {
        return { valid: false, error: `Item at index ${i} in 'customDeluluScenarios' must be a valid object.` };
      }
      const err =
        validateStringField(s.id, `customDeluluScenarios[${i}].id`, 100) ||
        validateStringField(s.title, `customDeluluScenarios[${i}].title`, 200) ||
        validateStringField(s.situation, `customDeluluScenarios[${i}].situation`, 5000) ||
        validateStringField(s.image, `customDeluluScenarios[${i}].image`, 5000000);
      if (err) return { valid: false, error: err };

      if (s.options !== undefined) {
        if (!Array.isArray(s.options)) {
          return { valid: false, error: `Field 'options' in customDeluluScenarios[${i}] must be an array.` };
        }
        if (s.options.length > 10) {
          return { valid: false, error: `Field 'options' in customDeluluScenarios[${i}] exceeds limit of 10 items.` };
        }
        for (let j = 0; j < s.options.length; j++) {
          const opt = s.options[j];
          if (!isRecord(opt)) {
            return { valid: false, error: `Option at index ${j} in customDeluluScenarios[${i}] must be a valid object.` };
          }
          const optErr =
            validateStringField(opt.id, `customDeluluScenarios[${i}].options[${j}].id`, 100) ||
            validateStringField(opt.text, `customDeluluScenarios[${i}].options[${j}].text`, 500) ||
            validateStringField(opt.response, `customDeluluScenarios[${i}].options[${j}].response`, 2000);
          if (optErr) return { valid: false, error: optErr };
        }
      }
    }
  }

  // customQuizQuestions
  if ("customQuizQuestions" in record && record.customQuizQuestions !== undefined) {
    if (!Array.isArray(record.customQuizQuestions)) {
      return { valid: false, error: "Field 'customQuizQuestions' must be an array of objects." };
    }
    if (record.customQuizQuestions.length > 50) {
      return { valid: false, error: "Field 'customQuizQuestions' exceeds maximum limit of 50 items." };
    }
    for (let i = 0; i < record.customQuizQuestions.length; i++) {
      const q = record.customQuizQuestions[i];
      if (!isRecord(q)) {
        return { valid: false, error: `Item at index ${i} in 'customQuizQuestions' must be a valid object.` };
      }
      const err =
        validateStringField(q.id, `customQuizQuestions[${i}].id`, 100) ||
        validateStringField(q.question, `customQuizQuestions[${i}].question`, 500) ||
        validateStringField(q.type, `customQuizQuestions[${i}].type`, 50) ||
        validateStringArray(q.options, `customQuizQuestions[${i}].options`, 10, 200) ||
        validateStringField(q.creatorAnswer, `customQuizQuestions[${i}].creatorAnswer`, 500);
      if (err) return { valid: false, error: err };
    }
  }

  // customDigitalGifts
  if ("customDigitalGifts" in record && record.customDigitalGifts !== undefined) {
    if (!Array.isArray(record.customDigitalGifts)) {
      return { valid: false, error: "Field 'customDigitalGifts' must be an array of objects." };
    }
    if (record.customDigitalGifts.length > 50) {
      return { valid: false, error: "Field 'customDigitalGifts' exceeds maximum limit of 50 items." };
    }
    for (let i = 0; i < record.customDigitalGifts.length; i++) {
      const g = record.customDigitalGifts[i];
      if (!isRecord(g)) {
        return { valid: false, error: `Item at index ${i} in 'customDigitalGifts' must be a valid object.` };
      }
      const err =
        validateStringField(g.id, `customDigitalGifts[${i}].id`, 100) ||
        validateStringField(g.title, `customDigitalGifts[${i}].title`, 200) ||
        validateStringField(g.description, `customDigitalGifts[${i}].description`, 5000) ||
        validateStringField(g.emoji, `customDigitalGifts[${i}].emoji`, 20) ||
        validateStringField(g.image, `customDigitalGifts[${i}].image`, 5000000) ||
        validateBooleanField(g.isClaimed, `customDigitalGifts[${i}].isClaimed`) ||
        validateStringField(g.claimedAt, `customDigitalGifts[${i}].claimedAt`, 100) ||
        validateBooleanField(g.isFulfilled, `customDigitalGifts[${i}].isFulfilled`) ||
        validateStringField(g.fulfilledAt, `customDigitalGifts[${i}].fulfilledAt`, 100);
      if (err) return { valid: false, error: err };
    }
  }

  // customBucketListItems
  if ("customBucketListItems" in record && record.customBucketListItems !== undefined) {
    if (!Array.isArray(record.customBucketListItems)) {
      return { valid: false, error: "Field 'customBucketListItems' must be an array of objects." };
    }
    if (record.customBucketListItems.length > 100) {
      return { valid: false, error: "Field 'customBucketListItems' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customBucketListItems.length; i++) {
      const b = record.customBucketListItems[i];
      if (!isRecord(b)) {
        return { valid: false, error: `Item at index ${i} in 'customBucketListItems' must be a valid object.` };
      }
      const err =
        validateStringField(b.id, `customBucketListItems[${i}].id`, 100) ||
        validateStringField(b.title, `customBucketListItems[${i}].title`, 200) ||
        validateStringField(b.description, `customBucketListItems[${i}].description`, 5000) ||
        validateStringField(b.image, `customBucketListItems[${i}].image`, 5000000) ||
        validateStringField(b.creator, `customBucketListItems[${i}].creator`, 50) ||
        validateStringField(b.status, `customBucketListItems[${i}].status`, 50) ||
        validateStringField(b.targetDate, `customBucketListItems[${i}].targetDate`, 100);
      if (err) return { valid: false, error: err };
    }
  }

  // customPersonalCards
  if ("customPersonalCards" in record && record.customPersonalCards !== undefined) {
    if (!Array.isArray(record.customPersonalCards)) {
      return { valid: false, error: "Field 'customPersonalCards' must be an array of objects." };
    }
    if (record.customPersonalCards.length > 100) {
      return { valid: false, error: "Field 'customPersonalCards' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customPersonalCards.length; i++) {
      const c = record.customPersonalCards[i];
      if (!isRecord(c)) {
        return { valid: false, error: `Item at index ${i} in 'customPersonalCards' must be a valid object.` };
      }
      const err =
        validateStringField(c.id, `customPersonalCards[${i}].id`, 100) ||
        validateStringField(c.category, `customPersonalCards[${i}].category`, 100) ||
        validateStringField(c.title, `customPersonalCards[${i}].title`, 200) ||
        validateStringField(c.content, `customPersonalCards[${i}].content`, 5000) ||
        validateStringField(c.emoji, `customPersonalCards[${i}].emoji`, 20) ||
        validateStringField(c.photo, `customPersonalCards[${i}].photo`, 5000000);
      if (err) return { valid: false, error: err };
    }
  }

  // customDateIdeas
  if ("customDateIdeas" in record && record.customDateIdeas !== undefined) {
    if (!Array.isArray(record.customDateIdeas)) {
      return { valid: false, error: "Field 'customDateIdeas' must be an array of objects." };
    }
    if (record.customDateIdeas.length > 100) {
      return { valid: false, error: "Field 'customDateIdeas' exceeds maximum limit of 100 items." };
    }
    for (let i = 0; i < record.customDateIdeas.length; i++) {
      const d = record.customDateIdeas[i];
      if (!isRecord(d)) {
        return { valid: false, error: `Item at index ${i} in 'customDateIdeas' must be a valid object.` };
      }
      const err =
        validateStringField(d.id, `customDateIdeas[${i}].id`, 100) ||
        validateStringField(d.title, `customDateIdeas[${i}].title`, 200) ||
        validateStringField(d.description, `customDateIdeas[${i}].description`, 5000) ||
        validateStringField(d.coverPhoto, `customDateIdeas[${i}].coverPhoto`, 5000000) ||
        validateStringField(d.image, `customDateIdeas[${i}].image`, 5000000) ||
        validateStringField(d.category, `customDateIdeas[${i}].category`, 100) ||
        validateStringField(d.costRange, `customDateIdeas[${i}].costRange`, 100) ||
        validateStringField(d.costEstimateText, `customDateIdeas[${i}].costEstimateText`, 100) ||
        validateStringField(d.estimatedBudget, `customDateIdeas[${i}].estimatedBudget`, 100) ||
        validateStringField(d.estimatedDuration, `customDateIdeas[${i}].estimatedDuration`, 100) ||
        validateStringField(d.duration, `customDateIdeas[${i}].duration`, 100) ||
        validateNumberField(d.estimatedDurationMinutes, `customDateIdeas[${i}].estimatedDurationMinutes`, 0, 10080) ||
        validateStringField(d.environment, `customDateIdeas[${i}].environment`, 100) ||
        validateStringField(d.location, `customDateIdeas[${i}].location`, 200) ||
        validateStringField(d.practicalNotes, `customDateIdeas[${i}].practicalNotes`, 2000) ||
        validateStringField(d.accessibilityNotes, `customDateIdeas[${i}].accessibilityNotes`, 2000) ||
        validateStringField(d.author, `customDateIdeas[${i}].author`, 50) ||
        validateStringField(d.authorName, `customDateIdeas[${i}].authorName`, 100) ||
        validateStringField(d.createdAt, `customDateIdeas[${i}].createdAt`, 100) ||
        validateStringField(d.updatedAt, `customDateIdeas[${i}].updatedAt`, 100) ||
        validateBooleanField(d.isHidden, `customDateIdeas[${i}].isHidden`) ||
        validateNumberField(d.sortOrder, `customDateIdeas[${i}].sortOrder`, -1000, 1000) ||
        validateBooleanField(d.isCustom, `customDateIdeas[${i}].isCustom`) ||
        validateBooleanField(d.isIndoor, `customDateIdeas[${i}].isIndoor`) ||
        validateBooleanField(d.isFavorited, `customDateIdeas[${i}].isFavorited`);
      if (err) return { valid: false, error: err };
    }
  }

  // 4. Validate Nested Plain Objects

  // featuredSong
  if ("featuredSong" in record && record.featuredSong !== undefined) {
    if (!isRecord(record.featuredSong)) {
      return { valid: false, error: "Field 'featuredSong' must be a valid object." };
    }
    const s = record.featuredSong;
    const err =
      validateStringField(s.title, "featuredSong.title", 200) ||
      validateStringField(s.artist, "featuredSong.artist", 200) ||
      validateStringField(s.heading, "featuredSong.heading", 200) ||
      validateStringField(s.subtitle, "featuredSong.subtitle", 200) ||
      validateStringField(s.dedicationHeading, "featuredSong.dedicationHeading", 200) ||
      validateStringField(s.dedication, "featuredSong.dedication", 2000) ||
      validateStringField(s.whyItMatters, "featuredSong.whyItMatters", 2000) ||
      validateStringField(s.coverArtwork, "featuredSong.coverArtwork", 5000000) ||
      validateStringField(s.embedUrl, "featuredSong.embedUrl", 1000);
    if (err) return { valid: false, error: err };
  }

  // designPreferences
  if ("designPreferences" in record && record.designPreferences !== undefined) {
    if (!isRecord(record.designPreferences)) {
      return { valid: false, error: "Field 'designPreferences' must be a valid object." };
    }
    const dp = record.designPreferences;
    const err =
      validateStringField(dp.colorPalette, "designPreferences.colorPalette", 100) ||
      validateStringField(dp.typographyPreset, "designPreferences.typographyPreset", 100) ||
      validateStringField(dp.animationIntensity, "designPreferences.animationIntensity", 100) ||
      validateStringField(dp.mood, "designPreferences.mood", 100) ||
      validateStringField(dp.photoPresentation, "designPreferences.photoPresentation", 100) ||
      validateBooleanField(dp.backgroundMusicEnabled, "designPreferences.backgroundMusicEnabled");
    if (err) return { valid: false, error: err };
  }

  // memoriesHeartCollage
  if ("memoriesHeartCollage" in record && record.memoriesHeartCollage !== undefined) {
    if (!isRecord(record.memoriesHeartCollage)) {
      return { valid: false, error: "Field 'memoriesHeartCollage' must be a valid object." };
    }
    const hc = record.memoriesHeartCollage;
    const err =
      validateStringField(hc.centerHeroPhoto, "memoriesHeartCollage.centerHeroPhoto", 5000000) ||
      validateStringField(hc.centerHeroCaption, "memoriesHeartCollage.centerHeroCaption", 500) ||
      validateStringArray(hc.photos, "memoriesHeartCollage.photos", 50, 5000000) ||
      validateStringField(hc.caption, "memoriesHeartCollage.caption", 500);
    if (err) return { valid: false, error: err };
  }

  // memoriesPolaroidCollage
  if ("memoriesPolaroidCollage" in record && record.memoriesPolaroidCollage !== undefined) {
    if (!isRecord(record.memoriesPolaroidCollage)) {
      return { valid: false, error: "Field 'memoriesPolaroidCollage' must be a valid object." };
    }
    const pc = record.memoriesPolaroidCollage;
    const err =
      validateStringField(pc.centralHeartPhoto, "memoriesPolaroidCollage.centralHeartPhoto", 5000000) ||
      validateStringField(pc.centralCaption, "memoriesPolaroidCollage.centralCaption", 500) ||
      validateStringArray(pc.borderPhotos, "memoriesPolaroidCollage.borderPhotos", 50, 5000000);
    if (err) return { valid: false, error: err };
  }

  // 5. Validate memoriesCollageType
  if ("memoriesCollageType" in record && record.memoriesCollageType !== undefined) {
    if (record.memoriesCollageType !== "heart" && record.memoriesCollageType !== "polaroid") {
      return { valid: false, error: "Field 'memoriesCollageType' must be either 'heart' or 'polaroid'." };
    }
  }

  // 6. Validate Privacy Settings
  if ("privacy" in record && record.privacy !== undefined) {
    if (!isRecord(record.privacy)) {
      return { valid: false, error: "Field 'privacy' must be a valid object." };
    }
    const priv = record.privacy as Record<string, unknown>;

    if (priv.isPasswordProtected !== undefined && typeof priv.isPasswordProtected !== "boolean") {
      return { valid: false, error: "Field 'privacy.isPasswordProtected' must be a boolean." };
    }

    if (priv.passcode !== undefined) {
      if (typeof priv.passcode !== "string") {
        return { valid: false, error: "Field 'privacy.passcode' must be a string." };
      }
      if (priv.passcode.length > 50) {
        return { valid: false, error: "Field 'privacy.passcode' exceeds maximum length of 50 characters." };
      }
    }

    if (priv.allowResponses !== undefined && typeof priv.allowResponses !== "boolean") {
      return { valid: false, error: "Field 'privacy.allowResponses' must be a boolean." };
    }

    if (priv.allowRecipientContributions !== undefined && typeof priv.allowRecipientContributions !== "boolean") {
      return { valid: false, error: "Field 'privacy.allowRecipientContributions' must be a boolean." };
    }

    if (priv.invitationStatus !== undefined) {
      if (priv.invitationStatus !== "active" && priv.invitationStatus !== "revoked") {
        return { valid: false, error: "Field 'privacy.invitationStatus' must be either 'active' or 'revoked'." };
      }
    }
  }

  return { valid: true };
}

export function updateGift(id: string, updates: Partial<GiftRecord>): GiftRecord | null {
  const validation = validateGiftUpdates(updates);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid gift update data.");
  }

  const currentDb = loadDatabase();
  const idx = currentDb.gifts.findIndex((g) => g.id === id);
  if (idx === -1) return null;

  const existing = currentDb.gifts[idx];
  const now = new Date().toISOString();

  // If slug is being updated, ensure uniqueness
  let slug = existing.slug;
  if (updates.slug && typeof updates.slug === "string" && updates.slug.trim() !== existing.slug) {
    const candidate = updates.slug.trim().toLowerCase();
    const isTaken = currentDb.gifts.some((g) => g.id !== id && g.slug.toLowerCase() === candidate);
    if (!isTaken) {
      slug = candidate;
    }
  }

  // Validate and sanitize privacy settings without allowing recipientInviteToken tampering
  const safePrivacy = {
    ...existing.privacy,
    ...(updates.privacy?.isPasswordProtected !== undefined
      ? { isPasswordProtected: Boolean(updates.privacy.isPasswordProtected) }
      : {}),
    ...(typeof updates.privacy?.passcode === "string"
      ? { passcode: updates.privacy.passcode.slice(0, 50) }
      : {}),
    ...(updates.privacy?.allowResponses !== undefined
      ? { allowResponses: Boolean(updates.privacy.allowResponses) }
      : {}),
    ...(updates.privacy?.allowRecipientContributions !== undefined
      ? { allowRecipientContributions: Boolean(updates.privacy.allowRecipientContributions) }
      : {}),
    ...(updates.privacy?.invitationStatus === "active" || updates.privacy?.invitationStatus === "revoked"
      ? { invitationStatus: updates.privacy.invitationStatus }
      : {}),
    // CRITICAL: recipientInviteToken cannot be overwritten by client updates
    recipientInviteToken: existing.privacy.recipientInviteToken,
  };

  // Pick ONLY allowlisted editable fields
  const sanitizedUpdates: Partial<GiftRecord> = {};
  for (const field of EDITABLE_GIFT_FIELDS) {
    if (field in updates && (updates as Record<string, unknown>)[field] !== undefined) {
      (sanitizedUpdates as Record<string, unknown>)[field] = (updates as Record<string, unknown>)[field];
    }
  }

  const updated: GiftRecord = {
    ...existing,
    ...sanitizedUpdates,
    // Explicitly lock protected system fields
    id: existing.id,
    creatorId: existing.creatorId,
    createdAt: existing.createdAt,
    updatedAt: now,
    publishedAt: existing.publishedAt,
    status: existing.status,
    slug,
    privacy: safePrivacy,
  };

  // Work on a deep clone so memoryDb is not mutated if persistence fails
  const newDb: RelationshipDatabase = JSON.parse(JSON.stringify(currentDb));
  newDb.gifts[idx] = updated;

  // Let persistence errors throw so callers know persistence failed
  saveDatabase(newDb);
  return updated;
}

export function duplicateGift(id: string, newCreatorId?: string): GiftRecord | null {
  const currentDb = loadDatabase();
  const existing = currentDb.gifts.find((g) => g.id === id);
  if (!existing) return null;

  const title = `${existing.title} (Copy)`;
  const slug = generateSlug(title, currentDb);
  const now = new Date().toISOString();

  const cloned: GiftRecord = {
    ...JSON.parse(JSON.stringify(existing)),
    id: `gift_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    creatorId: newCreatorId || existing.creatorId,
    title,
    slug,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: undefined,
    privacy: {
      ...existing.privacy,
      recipientInviteToken: `sweetheart-${Math.random().toString(36).slice(2, 6)}`,
      invitationStatus: "active",
    },
  };

  const newDb: RelationshipDatabase = JSON.parse(JSON.stringify(currentDb));
  newDb.gifts.push(cloned);
  saveDatabase(newDb);
  return cloned;
}

export function deleteGift(id: string): boolean {
  const currentDb = loadDatabase();
  const idx = currentDb.gifts.findIndex((g) => g.id === id);
  if (idx === -1) return false;

  // Cannot delete the primary demo gift
  if (id === "gift_world_demo") {
    return false;
  }

  // Cannot delete if it's the only remaining gift
  if (currentDb.gifts.length <= 1) {
    return false;
  }

  // Work on a deep clone so memoryDb is not mutated if persistence fails
  const newDb: RelationshipDatabase = JSON.parse(JSON.stringify(currentDb));
  const newIdx = newDb.gifts.findIndex((g) => g.id === id);
  if (newIdx === -1) return false;

  // Identify proposal IDs belonging to this gift for notification cascade
  const giftProposalIds = new Set(
    (newDb.dateProposals || [])
      .filter((p) => p.giftId === id)
      .map((p) => p.id)
  );

  // Cascade delete associated gift-scoped child records
  newDb.comments = (newDb.comments || []).filter((c) => c.giftId !== id);
  newDb.reactions = (newDb.reactions || []).filter((r) => r.giftId !== id);
  newDb.journalEntries = (newDb.journalEntries || []).filter((j) => j.giftId !== id);
  newDb.voiceMessages = (newDb.voiceMessages || []).filter((v) => v.giftId !== id);
  newDb.dateProposals = (newDb.dateProposals || []).filter((p) => p.giftId !== id);
  newDb.dateMemories = (newDb.dateMemories || []).filter((m) => m.giftId !== id);
  newDb.dateNotifications = (newDb.dateNotifications || []).filter(
    (n) => !n.proposalId || !giftProposalIds.has(n.proposalId)
  );
  newDb.mediaAssets = (newDb.mediaAssets || []).filter((a) => a.giftId !== id);

  newDb.gifts.splice(newIdx, 1);

  try {
    saveDatabase(newDb);
    return true;
  } catch (err) {
    console.error(`Failed to persist gift deletion for ${id}:`, err);
    return false;
  }
}

export function publishGift(
  id: string,
  publish: boolean
): { success: boolean; gift?: GiftRecord; error?: string } {
  const db = loadDatabase();
  const idx = db.gifts.findIndex((g) => g.id === id);
  if (idx === -1) return { success: false, error: "Gift not found" };

  const gift = db.gifts[idx];
  const now = new Date().toISOString();

  if (publish) {
    // Validate required fields
    if (!gift.title || !gift.title.trim()) {
      return { success: false, error: "Gift title is required before publishing." };
    }
    if (!gift.recipientName && !gift.recipientNickname) {
      return { success: false, error: "Recipient name is required before publishing." };
    }

    gift.status = "published";
    gift.publishedAt = now;
    gift.updatedAt = now;
  } else {
    gift.status = "unpublished";
    gift.updatedAt = now;
  }

  saveDatabase(db);
  return { success: true, gift };
}

// ==================== PHASE 5: MEDIA LIBRARY ====================

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/x-m4a",
];

const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function getMediaAssets(giftId?: string): MediaAsset[] {
  const db = loadDatabase();
  let list = db.mediaAssets || [];
  if (giftId) {
    // Strictly return only assets belonging to this specific gift; never include unassigned assets
    list = list.filter((a) => a.giftId === giftId);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addMediaAsset(
  asset: Omit<MediaAsset, "id" | "createdAt">
): { success: boolean; asset?: MediaAsset; error?: string } {
  const db = loadDatabase();

  const isImage = ALLOWED_IMAGE_MIMES.includes(asset.mimeType);
  const isAudio = ALLOWED_AUDIO_MIMES.includes(asset.mimeType);

  if (!isImage && !isAudio) {
    return {
      success: false,
      error: `Invalid file format (${asset.mimeType}). Supported: JPG, PNG, WEBP, GIF, MP3, WAV, OGG, WEBM.`,
    };
  }

  if (asset.sizeBytes > MAX_MEDIA_SIZE_BYTES) {
    return {
      success: false,
      error: "File exceeds 10MB limit. Please upload a smaller file.",
    };
  }

  if (!asset.dataUrl) {
    return { success: false, error: "Missing media payload." };
  }

  const newAsset: MediaAsset = {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    giftId: asset.giftId,
    creatorId: asset.creatorId,
    name: asset.name.trim() || (isImage ? "Uploaded Image" : "Uploaded Audio"),
    type: isImage ? "image" : "audio",
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    dataUrl: asset.dataUrl,
    caption: asset.caption?.trim(),
    createdAt: new Date().toISOString(),
  };

  const currentDb = loadDatabase();
  const newDb: RelationshipDatabase = JSON.parse(JSON.stringify(currentDb));
  newDb.mediaAssets.push(newAsset);
  // Keep last 100 assets
  if (newDb.mediaAssets.length > 100) {
    newDb.mediaAssets = newDb.mediaAssets.slice(newDb.mediaAssets.length - 100);
  }

  try {
    saveDatabase(newDb);
    return { success: true, asset: newAsset };
  } catch (err) {
    console.error("Failed to persist media asset:", err);
    return { success: false, error: "Database persistence failed for media upload." };
  }
}

export function getMediaAssetById(id: string): MediaAsset | null {
  const db = loadDatabase();
  return (db.mediaAssets || []).find((a) => a.id === id) || null;
}

export function deleteMediaAsset(id: string): boolean {
  const currentDb = loadDatabase();
  const idx = currentDb.mediaAssets.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  const newDb: RelationshipDatabase = JSON.parse(JSON.stringify(currentDb));
  newDb.mediaAssets.splice(idx, 1);
  try {
    saveDatabase(newDb);
    return true;
  } catch (err) {
    console.error(`Failed to persist media asset deletion for ${id}:`, err);
    return false;
  }
}

