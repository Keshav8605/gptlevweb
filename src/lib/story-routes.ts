/**
 * Story Route Registry & Emotional Transition Mapping
 * 
 * Maps each of the 15 major romantic chapters to its dedicated route,
 * emotional theme, connecting visual element, and transition type.
 */

export type TransitionType =
  | "heart-portal"       // Welcome -> Things I Notice (soft heart reveal, anticipation)
  | "blush-polaroid"      // Things I Notice -> Memories (warm blush & floating tilted polaroid)
  | "heart-padlock"       // Memories -> Secret World (shimmering golden-pink lock unlocking)
  | "bouncing-hearts"     // Secret World -> Delulu (playful bouncing hearts, cheeky laughter)
  | "quiz-sparkle"        // Delulu -> Quiz (glowing question heart burst, playful bonding)
  | "envelope-unfold"     // Quiz -> Letters (vintage envelope opening & paper unfold)
  | "journal-flip"        // Letters -> Notebook (turning journal page, shared quiet intimacy)
  | "voice-ripples"       // Notebook -> Voice (pulsing pastel sound ripples & whisper chimes)
  | "date-postcard"       // Voice -> Plan a Date (turning adventure card, future anticipation)
  | "wax-envelope"        // Plan a Date -> Open When (cluster of wax-sealed comfort envelopes)
  | "petal-spiral"        // Open When -> Reasons (floating blossom & heart petals, overflowing love)
  | "gift-ribbon"         // Reasons -> Little Gifts (silk gift ribbon unraveling, promise vouchers)
  | "vinyl-melody"        // Little Gifts -> Our Song (spinning vinyl record & floating music notes)
  | "grand-portal"        // Our Song -> Final Collage (monumental glowing heart portal & petals)
  | "gentle-fade";        // Clean soft blush crossfade (for backwards or custom jumps)

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  navLabel: string;
  emoji: string;
  nextSlug?: string;
  nextLabel?: string;
  prevSlug?: string;
  prevLabel?: string;
  forwardTransition: TransitionType;
  emotionalTheme: string;
  connectingVisual: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "welcome",
    chapterNumber: 1,
    slug: "welcome",
    path: "/story/welcome",
    title: "You & Me",
    subtitle: "A little world, just for us ✨",
    navLabel: "You & Me",
    emoji: "🧸",
    nextSlug: "things-i-notice",
    nextLabel: "Discover Things I Notice About You",
    forwardTransition: "heart-portal",
    emotionalTheme: "Anticipation, warmth, and entering our shared world",
    connectingVisual: "Organic expanding soft-pink heart reveal",
  },
  {
    id: "observations",
    chapterNumber: 2,
    slug: "things-i-notice",
    path: "/story/things-i-notice",
    title: "Things I Noticed About You",
    subtitle: "Little quirks and gentle habits that make me fall in love all over again ♡",
    navLabel: "Things I Noticed",
    emoji: "👀",
    prevSlug: "welcome",
    prevLabel: "Return to Chapter 1 · You & Me",
    nextSlug: "memories",
    nextLabel: "Open Our Memories Scrapbook",
    forwardTransition: "blush-polaroid",
    emotionalTheme: "Feeling seen, cherished, and intimately known",
    connectingVisual: "Drifting tilted Polaroid frame across warm blush fade",
  },
  {
    id: "memories",
    chapterNumber: 3,
    slug: "memories",
    path: "/story/memories",
    title: "Our Memories Scrapbook",
    subtitle: "Polaroids of the moments I wish I could pause time in ♡",
    navLabel: "Polaroid Scrapbook",
    emoji: "📸",
    prevSlug: "things-i-notice",
    prevLabel: "Return to Things I Notice",
    nextSlug: "secret-world",
    nextLabel: "Unlock Our Secret Haven",
    forwardTransition: "heart-padlock",
    emotionalTheme: "Nostalgia, gratitude, and unforgettable shared moments",
    connectingVisual: "Shimmering golden-pink heart padlock unlocking",
  },
  {
    id: "secretWorld",
    chapterNumber: 4,
    slug: "secret-world",
    path: "/story/secret-world",
    title: "Our Secret Haven",
    subtitle: "A protected corner of the internet meant for nobody else in the universe ♡",
    navLabel: "Secret World",
    emoji: "🔒",
    prevSlug: "memories",
    prevLabel: "Return to Memories Scrapbook",
    nextSlug: "delulu",
    nextLabel: "Enter Delulu Mode",
    forwardTransition: "bouncing-hearts",
    emotionalTheme: "Curiosity, exclusivity, and profound safety",
    connectingVisual: "Two playful bouncing hearts with pastel butterfly sparkles",
  },
  {
    id: "deluluMode",
    chapterNumber: 5,
    slug: "delulu",
    path: "/story/delulu",
    title: "Delulu Mode",
    subtitle: "Because loving you is the best kind of crazy 🦋",
    navLabel: "Delulu Mode",
    emoji: "🦋",
    prevSlug: "secret-world",
    prevLabel: "Return to Secret Haven",
    nextSlug: "our-quiz",
    nextLabel: "Take Our Couple Quiz",
    forwardTransition: "quiz-sparkle",
    emotionalTheme: "Playful affection, inside jokes, and joyful laughter",
    connectingVisual: "Glowing question-heart burst with confetti sparkles",
  },
  {
    id: "quiz",
    chapterNumber: 6,
    slug: "our-quiz",
    path: "/story/our-quiz",
    title: "How Well Do You Know Us?",
    subtitle: "A gentle questionnaire of memories, favorites, and sweet truths ♡",
    navLabel: "Our Quiz",
    emoji: "❓",
    prevSlug: "delulu",
    prevLabel: "Return to Delulu Mode",
    nextSlug: "love-letters",
    nextLabel: "Read My Love Letters",
    forwardTransition: "envelope-unfold",
    emotionalTheme: "Bonding, delightful discovery, and mutual understanding",
    connectingVisual: "Wax-sealed vintage parchment envelope unfolding",
  },
  {
    id: "letters",
    chapterNumber: 7,
    slug: "love-letters",
    path: "/story/love-letters",
    title: "Letters I Don't Say Enough",
    subtitle: "Words that live quietly in my chest, written down so they last forever ♡",
    navLabel: "Love Letters",
    emoji: "💌",
    prevSlug: "our-quiz",
    prevLabel: "Return to Couple Quiz",
    nextSlug: "notebook",
    nextLabel: "Open Our Shared Notebook",
    forwardTransition: "journal-flip",
    emotionalTheme: "Deep vulnerability, pure love, and heartfelt sincerity",
    connectingVisual: "Gently turning journal page with satin bookmark ribbon",
  },
  {
    id: "notebook",
    chapterNumber: 8,
    slug: "notebook",
    path: "/story/notebook",
    title: "Our Shared Notebook",
    subtitle: "A two-way love diary where our thoughts meet between the lines 📖",
    navLabel: "Shared Notebook",
    emoji: "📖",
    prevSlug: "love-letters",
    prevLabel: "Return to Love Letters",
    nextSlug: "voice-messages",
    nextLabel: "Listen to Voice Whispers",
    forwardTransition: "voice-ripples",
    emotionalTheme: "Two-way intimacy, shared whispers, and growing together",
    connectingVisual: "Concentric pastel audio wave ripples and melodic chimes",
  },
  {
    id: "voice",
    chapterNumber: 9,
    slug: "voice-messages",
    path: "/story/voice-messages",
    title: "Voice Message Whispers",
    subtitle: "Recorded audio notes for the late nights and quiet mornings 🎙️",
    navLabel: "Voice Whispers",
    emoji: "🎙️",
    prevSlug: "notebook",
    prevLabel: "Return to Shared Notebook",
    nextSlug: "plan-a-date",
    nextLabel: "Plan Our Next Adventure",
    forwardTransition: "date-postcard",
    emotionalTheme: "Closeness, the comforting sound of each other's voice",
    connectingVisual: "Flipping adventure compass and calendar postcard",
  },
  {
    id: "datePlanner",
    chapterNumber: 10,
    slug: "plan-a-date",
    path: "/story/plan-a-date",
    title: "Plan Our Next Adventure ♡",
    subtitle: "Dreamy ideas, cozy proposals, and milestones waiting for us 🗺️",
    navLabel: "Date Planner",
    emoji: "🗺️",
    prevSlug: "voice-messages",
    prevLabel: "Return to Voice Whispers",
    nextSlug: "open-when",
    nextLabel: "Open Sealed When Letters",
    forwardTransition: "wax-envelope",
    emotionalTheme: "Eager anticipation for our shared future and adventures",
    connectingVisual: "Cluster of floating wax-stamped comfort envelopes",
  },
  {
    id: "openWhenLetters",
    chapterNumber: 11,
    slug: "open-when",
    path: "/story/open-when",
    title: "Open When... Envelopes",
    subtitle: "Sealed letters kept safe for the exact moments you need them most ✉️",
    navLabel: "Open When...",
    emoji: "✉️",
    prevSlug: "plan-a-date",
    prevLabel: "Return to Date Planner",
    nextSlug: "reasons",
    nextLabel: "Discover 100 Reasons Why I Love You",
    forwardTransition: "petal-spiral",
    emotionalTheme: "Constant reassurance, tenderness, and unwavering comfort",
    connectingVisual: "Gentle upward spiral of cherry blossom and heart petals",
  },
  {
    id: "littleReasons",
    chapterNumber: 12,
    slug: "reasons",
    path: "/story/reasons",
    title: "A Hundred Little Reasons",
    subtitle: "Every small reason why loving you is the easiest thing I will ever do 💗",
    navLabel: "Why I Love You",
    emoji: "💗",
    prevSlug: "open-when",
    prevLabel: "Return to Open When Letters",
    nextSlug: "little-gifts",
    nextLabel: "Claim Little Gifts I Owe You",
    forwardTransition: "gift-ribbon",
    emotionalTheme: "Abundant adoration, deep appreciation, and joy",
    connectingVisual: "Silky pink gift ribbon unraveling with starburst sparkles",
  },
  {
    id: "digitalGifts",
    chapterNumber: 13,
    slug: "little-gifts",
    path: "/story/little-gifts",
    title: "Little Gifts I Owe You",
    subtitle: "Redeemable digital vouchers for forehead kisses, midnight hugs, and treats 🎁",
    navLabel: "Gifts For You",
    emoji: "🎁",
    prevSlug: "reasons",
    prevLabel: "Return to Reasons Why I Love You",
    nextSlug: "our-song",
    nextLabel: "Listen to Our Dedicated Melody",
    forwardTransition: "vinyl-melody",
    emotionalTheme: "Generosity, pampering, and loving promises",
    connectingVisual: "Spinning vinyl record silhouette with floating musical notes",
  },
  {
    id: "ourSong",
    chapterNumber: 14,
    slug: "our-song",
    path: "/story/our-song",
    title: "Our Song Dedicated Melody",
    subtitle: "A song that sounds exactly like what being in love with you feels like 🎵",
    navLabel: "Our Song",
    emoji: "🎵",
    prevSlug: "little-gifts",
    prevLabel: "Return to Little Gifts",
    nextSlug: "final-collage",
    nextLabel: "Reveal Our Grand Photo Heart Mosaic",
    forwardTransition: "grand-portal",
    emotionalTheme: "Harmonic nostalgia, sensory connection, and romance",
    connectingVisual: "Monumental glowing heart portal with golden light rays and floating rose petals",
  },
  {
    id: "finalHeart",
    chapterNumber: 15,
    slug: "final-collage",
    path: "/story/final-collage",
    title: "A Thousand Little Moments, One Big Love",
    subtitle: "Every picture, every heartbeat, every step leading right to you ♡",
    navLabel: "Heart Collage",
    emoji: "❤️",
    prevSlug: "our-song",
    prevLabel: "Return to Our Song",
    nextSlug: "welcome",
    nextLabel: "Relive Our Love Story From the Beginning ✨",
    forwardTransition: "heart-portal",
    emotionalTheme: "Emotional climax, eternal devotion, and celebration",
    connectingVisual: "Gentle warm time-turner heart cycle returning to Chapter 1",
  },
];

export function getChapterBySlug(slug: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find((c) => c.slug === slug);
}

export function sectionIdToSlug(id: string): string {
  const chapter = STORY_CHAPTERS.find((c) => c.id === id || c.slug === id);
  return chapter ? chapter.slug : id;
}

export function getChapterById(id: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find((c) => c.id === id || c.slug === id);
}

export function getChapterByPath(path: string): StoryChapter | undefined {
  const cleanPath = path.split("?")[0].replace(/\/$/, "");
  return STORY_CHAPTERS.find((c) => c.path === cleanPath || `/story/${c.slug}` === cleanPath);
}

export function getAdjacentChapters(currentSlug: string) {
  const index = STORY_CHAPTERS.findIndex((c) => c.slug === currentSlug);
  if (index === -1) {
    return {
      current: STORY_CHAPTERS[0],
      prev: undefined,
      next: STORY_CHAPTERS[1],
    };
  }
  return {
    current: STORY_CHAPTERS[index],
    prev: index > 0 ? STORY_CHAPTERS[index - 1] : undefined,
    next: index < STORY_CHAPTERS.length - 1 ? STORY_CHAPTERS[index + 1] : STORY_CHAPTERS[0],
  };
}
