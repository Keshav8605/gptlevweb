/**
 * Story Route Registry & Emotional Transition Mapping
 * 
 * Maps each of the 15 major romantic chapters to its dedicated route,
 * emotional theme, connecting visual element, and transition type.
 */

export type TransitionType =
  | "heart-portal"       // Welcome -> Things I Notice
  | "blush-polaroid"      // Things I Notice -> Secret World
  | "heart-padlock"       // Secret World -> Memories
  | "vinyl-melody"        // Memories -> Our Song
  | "wax-envelope"        // Our Song -> Open When
  | "bouncing-hearts"     // Open When -> Delulu
  | "quiz-sparkle"        // Delulu -> Quiz
  | "envelope-unfold"     // Quiz -> Letters
  | "petal-spiral"        // Letters -> Reasons
  | "gift-ribbon"         // Reasons -> Gifts
  | "journal-flip"        // Gifts -> Notebook
  | "voice-ripples"       // Notebook -> Voice
  | "starlight-wish"      // Voice -> Someday
  | "flower-sparkle"      // Someday -> So You
  | "date-postcard"       // So You -> Date Planner
  | "secret-key"          // Date Planner -> Last Secret
  | "grand-portal"        // Last Secret -> Final Heart
  | "gentle-fade";

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  navLabel: string;
  emoji: string;
  eyebrowLabel?: string;
  transitionEyebrow?: string;
  nextSlug?: string;
  nextLabel?: string;
  nextSubtitle?: string;
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
    title: "Welcome Surprise",
    subtitle: "A little world, just for you",
    navLabel: "01 Welcome Surprise",
    emoji: "💌",
    eyebrowLabel: "A LITTLE WORLD, JUST FOR YOU",
    transitionEyebrow: "THE LITTLE THINGS I KEEP",
    nextSlug: "things-i-notice",
    nextLabel: "Discover the little things I adore ♡",
    nextSubtitle: "There's so much about you that you might not even realize I've fallen in love with.",
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
    subtitle: "The tiny details that make you so wonderfully, unmistakably you.",
    navLabel: "02 Things I Noticed About You",
    emoji: "👀",
    eyebrowLabel: "THE LITTLE THINGS I KEEP",
    prevSlug: "welcome",
    prevLabel: "Return to Chapter 1 · Welcome Surprise",
    transitionEyebrow: "OUR PRIVATE HAVEN",
    nextSlug: "secret-world",
    nextLabel: "Step inside our secret world 🔒",
    nextSubtitle: "Some things belong to the world, but this tiny corner belongs only to us.",
    forwardTransition: "heart-padlock",
    emotionalTheme: "Feeling seen, cherished, and intimately known",
    connectingVisual: "Shimmering golden-pink heart padlock unlocking",
  },
  {
    id: "secretWorld",
    chapterNumber: 3,
    slug: "secret-world",
    path: "/story/secret-world",
    title: "Our Secret World",
    subtitle: "A tiny corner of the universe that feels like ours.",
    navLabel: "03 Our Secret World",
    emoji: "🔒",
    eyebrowLabel: "JUST BETWEEN US",
    prevSlug: "things-i-notice",
    prevLabel: "Return to Things I Noticed About You",
    transitionEyebrow: "LET'S KEEP THESE MOMENTS",
    nextSlug: "memories",
    nextLabel: "Open our memories scrapbook 📸",
    nextSubtitle: "Because the moments we share are the ones I want to hold onto forever.",
    forwardTransition: "blush-polaroid",
    emotionalTheme: "Curiosity, exclusivity, and profound safety",
    connectingVisual: "Drifting tilted Polaroid frame across warm blush fade",
  },
  {
    id: "memories",
    chapterNumber: 4,
    slug: "memories",
    path: "/story/memories",
    title: "Memories",
    subtitle: "A collection of little moments that mean the entire world to me.",
    navLabel: "04 Memories",
    emoji: "📸",
    eyebrowLabel: "OUR LITTLE ARCHIVE",
    prevSlug: "secret-world",
    prevLabel: "Return to Our Secret World",
    transitionEyebrow: "A SONG THAT SOUNDS LIKE US",
    nextSlug: "our-song",
    nextLabel: "Play our song 🎵",
    nextSubtitle: "Every time this melody plays, it brings you right back to me.",
    forwardTransition: "vinyl-melody",
    emotionalTheme: "Nostalgia, gratitude, and unforgettable shared moments",
    connectingVisual: "Spinning vinyl record silhouette with floating musical notes",
  },
  {
    id: "ourSong",
    chapterNumber: 5,
    slug: "our-song",
    path: "/story/our-song",
    title: "Our Song",
    subtitle: "Some songs play in the background. This one brings you right back to me.",
    navLabel: "05 Our Song",
    emoji: "🎵",
    eyebrowLabel: "A SONG THAT SOUNDS LIKE US",
    prevSlug: "memories",
    prevLabel: "Return to Memories",
    transitionEyebrow: "FOR WHATEVER TODAY FEELS LIKE",
    nextSlug: "open-when",
    nextLabel: "Open your letters for every kind of day ✉️",
    nextSubtitle: "Little envelopes sealed with warmth for whenever you need a reminder of my love.",
    forwardTransition: "wax-envelope",
    emotionalTheme: "Harmonic nostalgia, sensory connection, and romance",
    connectingVisual: "Cluster of floating wax-stamped comfort envelopes",
  },
  {
    id: "openWhenLetters",
    chapterNumber: 6,
    slug: "open-when",
    path: "/story/open-when",
    title: "Open When",
    subtitle: "Little letters for the moments when you need a little extra love.",
    navLabel: "06 Open When",
    emoji: "✉️",
    eyebrowLabel: "FOR WHATEVER TODAY FEELS LIKE",
    prevSlug: "our-song",
    prevLabel: "Return to Our Song",
    transitionEyebrow: "OUR IMAGINATION HAS NO CHILL",
    nextSlug: "delulu",
    nextLabel: "Enter our delulu universe 🦋",
    nextSubtitle: "And now, for the version of us that exists in my most ridiculous, happiest daydreams…",
    forwardTransition: "bouncing-hearts",
    emotionalTheme: "Constant reassurance, tenderness, and unwavering comfort",
    connectingVisual: "Two playful bouncing hearts with pastel butterfly sparkles",
  },
  {
    id: "deluluMode",
    chapterNumber: 7,
    slug: "delulu",
    path: "/story/delulu",
    title: "Delulu Mode",
    subtitle: "A few imaginary situations. One very real favorite person.",
    navLabel: "07 Delulu Mode",
    emoji: "🦋",
    eyebrowLabel: "OUR IMAGINATION HAS NO CHILL",
    prevSlug: "open-when",
    prevLabel: "Return to Open When",
    transitionEyebrow: "A VERY IMPORTANT QUESTION",
    nextSlug: "our-quiz",
    nextLabel: "Take our relationship quiz ❓",
    nextSubtitle: "Okay, enough daydreaming for a second. Let's see how well you know us…",
    forwardTransition: "quiz-sparkle",
    emotionalTheme: "Playful affection, inside jokes, and joyful laughter",
    connectingVisual: "Glowing question-heart burst with confetti sparkles",
  },
  {
    id: "quiz",
    chapterNumber: 8,
    slug: "our-quiz",
    path: "/story/our-quiz",
    title: "How Well Do You Know Us?",
    subtitle: "There is one answer I'm secretly hoping for. ♡",
    navLabel: "08 How Well Do You Know Us?",
    emoji: "❓",
    eyebrowLabel: "A VERY IMPORTANT QUESTION",
    prevSlug: "delulu",
    prevLabel: "Return to Delulu Mode",
    transitionEyebrow: "WORDS FROM MY HEART",
    nextSlug: "love-letters",
    nextLabel: "Read the words I wrote for you 💌",
    nextSubtitle: "There are things I can tell you in a moment, and things I want you to be able to keep forever.",
    forwardTransition: "envelope-unfold",
    emotionalTheme: "Bonding, delightful discovery, and mutual understanding",
    connectingVisual: "Wax-sealed vintage parchment envelope unfolding",
  },
  {
    id: "letters",
    chapterNumber: 9,
    slug: "love-letters",
    path: "/story/love-letters",
    title: "Letters I Don’t Say Enough",
    subtitle: "For the things I feel deeply, even when I don't always say them well.",
    navLabel: "09 Letters I Don’t Say Enough",
    emoji: "💌",
    eyebrowLabel: "WORDS FROM MY HEART",
    prevSlug: "our-quiz",
    prevLabel: "Return to How Well Do You Know Us?",
    transitionEyebrow: "A LIST THAT COULD KEEP GROWING",
    nextSlug: "reasons",
    nextLabel: "Discover the reasons I love you 💗",
    nextSubtitle: "There are more reasons than I could ever fit into one letter. So I started a list.",
    forwardTransition: "petal-spiral",
    emotionalTheme: "Deep vulnerability, pure love, and heartfelt sincerity",
    connectingVisual: "Gentle upward spiral of cherry blossom and heart petals",
  },
  {
    id: "littleReasons",
    chapterNumber: 10,
    slug: "reasons",
    path: "/story/reasons",
    title: "A Hundred Little Reasons",
    subtitle: "I started counting. Then I remembered that loving you isn't something I can finish counting.",
    navLabel: "10 A Hundred Little Reasons",
    emoji: "💗",
    eyebrowLabel: "A LIST THAT COULD KEEP GROWING",
    prevSlug: "love-letters",
    prevLabel: "Return to Letters I Don’t Say Enough",
    transitionEyebrow: "A FEW LITTLE PROMISES",
    nextSlug: "little-gifts",
    nextLabel: "Open your little gifts 🎁",
    nextSubtitle: "Because words are lovely, but showing up for each other matters too.",
    forwardTransition: "gift-ribbon",
    emotionalTheme: "Abundant adoration, deep appreciation, and joy",
    connectingVisual: "Silky pink gift ribbon unraveling with starburst sparkles",
  },
  {
    id: "digitalGifts",
    chapterNumber: 11,
    slug: "little-gifts",
    path: "/story/little-gifts",
    title: "Little Gifts I Owe You",
    subtitle: "A few things I'd love to do for you. No expiry date, just love.",
    navLabel: "11 Little Gifts I Owe You",
    emoji: "🎁",
    eyebrowLabel: "A FEW LITTLE PROMISES",
    prevSlug: "reasons",
    prevLabel: "Return to A Hundred Little Reasons",
    transitionEyebrow: "LITTLE THOUGHTS, KEPT TOGETHER",
    nextSlug: "notebook",
    nextLabel: "Open our shared notebook 📖",
    nextSubtitle: "A quiet space for thoughts, memories, and little notes we leave along the way.",
    forwardTransition: "journal-flip",
    emotionalTheme: "Generosity, pampering, and loving promises",
    connectingVisual: "Gently turning journal page with satin bookmark ribbon",
  },
  {
    id: "notebook",
    chapterNumber: 12,
    slug: "notebook",
    path: "/story/notebook",
    title: "Our Little Notebook",
    subtitle: "A place for the thoughts, memories, and tiny love notes we don't want to lose.",
    navLabel: "12 Our Little Notebook",
    emoji: "📖",
    eyebrowLabel: "LITTLE THOUGHTS, KEPT TOGETHER",
    prevSlug: "little-gifts",
    prevLabel: "Return to Little Gifts I Owe You",
    transitionEyebrow: "A LITTLE PIECE OF ME",
    nextSlug: "voice-messages",
    nextLabel: "Listen to my heart 🎙️",
    nextSubtitle: "Some feelings deserve more than a typed sentence. Sometimes, I just want you to hear my voice.",
    forwardTransition: "voice-ripples",
    emotionalTheme: "Two-way intimacy, shared whispers, and growing together",
    connectingVisual: "Concentric pastel audio wave ripples and melodic chimes",
  },
  {
    id: "voice",
    chapterNumber: 13,
    slug: "voice-messages",
    path: "/story/voice-messages",
    title: "If You Could Hear My Heart",
    subtitle: "For the days when a voice feels closer than a message. Save a laugh, a story, or a goodnight.",
    navLabel: "13 If You Could Hear My Heart",
    emoji: "🎙️",
    eyebrowLabel: "A LITTLE PIECE OF ME",
    prevSlug: "notebook",
    prevLabel: "Return to Our Little Notebook",
    transitionEyebrow: "SOMEDAY, WITH YOU",
    nextSlug: "someday",
    nextLabel: "Explore our future dreams 🌈",
    nextSubtitle: "All the places, adventures, and quiet mornings waiting for us in the future.",
    forwardTransition: "starlight-wish",
    emotionalTheme: "Closeness, the comforting sound of each other's voice",
    connectingVisual: "Gentle constellation starlight glow with drifting wish lanterns",
  },
  {
    id: "bucketList",
    chapterNumber: 14,
    slug: "someday",
    path: "/story/someday",
    title: "Someday, With You",
    subtitle: "All the adventures and quiet dreams waiting for us.",
    navLabel: "14 Someday, With You",
    emoji: "🌈",
    eyebrowLabel: "ALL OUR FUTURE WISHES",
    prevSlug: "voice-messages",
    prevLabel: "Return to If You Could Hear My Heart",
    transitionEyebrow: "THE LITTLE THINGS THAT ARE SO YOU",
    nextSlug: "so-you",
    nextLabel: "See the quirks I adore 🌸",
    nextSubtitle: "The habits, preferences, and traits that make you uniquely, adorably you.",
    forwardTransition: "flower-sparkle",
    emotionalTheme: "Eager anticipation for our shared future and adventures",
    connectingVisual: "Blossoming floral petals with soft morning sunbeams",
  },
  {
    id: "personalCards",
    chapterNumber: 15,
    slug: "so-you",
    path: "/story/so-you",
    title: "Little Things That Are So You",
    subtitle: "These quirks and qualities that make you uniquely wonderful.",
    navLabel: "15 Little Things That Are So You",
    emoji: "🌸",
    eyebrowLabel: "EVERY LITTLE QUIRK I LOVE",
    prevSlug: "someday",
    prevLabel: "Return to Someday, With You",
    transitionEyebrow: "OUR NEXT LITTLE ADVENTURE",
    nextSlug: "plan-a-date",
    nextLabel: "Plan our next adventure 🗺️",
    nextSubtitle: "Now let's turn these daydreams into real dates and memories we can look forward to.",
    forwardTransition: "date-postcard",
    emotionalTheme: "Affectionate adoration, deep familiarity, and warmth",
    connectingVisual: "Flipping adventure compass and calendar postcard",
  },
  {
    id: "datePlanner",
    chapterNumber: 16,
    slug: "plan-a-date",
    path: "/story/plan-a-date",
    title: "Plan Our Next Little Adventure",
    subtitle: "Little plans, new places, and memories we haven't made yet.",
    navLabel: "16 Plan Our Next Adventure",
    emoji: "🗺️",
    eyebrowLabel: "OUR NEXT LITTLE ADVENTURE",
    prevSlug: "so-you",
    prevLabel: "Return to Little Things That Are So You",
    transitionEyebrow: "ONE LAST LITTLE SECRET",
    nextSlug: "last-secret",
    nextLabel: "Unlock our final surprise 🤫",
    nextSubtitle: "Before we reach the end, there is one last little secret waiting just for you.",
    forwardTransition: "secret-key",
    emotionalTheme: "Shared anticipation, dating romance, and togetherness",
    connectingVisual: "Golden sparkling secret key turning in an ornate glowing lock",
  },
  {
    id: "lastSecret",
    chapterNumber: 17,
    slug: "last-secret",
    path: "/story/last-secret",
    title: "One Last Little Secret",
    subtitle: "A hidden surprise just between you and me.",
    navLabel: "17 One Last Little Secret",
    emoji: "🤫",
    eyebrowLabel: "JUST BETWEEN US",
    prevSlug: "plan-a-date",
    prevLabel: "Return to Plan Our Next Little Adventure",
    transitionEyebrow: "EVERY LITTLE THING LED HERE",
    nextSlug: "final-collage",
    nextLabel: "Open the final heart mosaic ❤️",
    nextSubtitle: "Every little moment, every reason, every quiet thought leads back to one thing: us.",
    forwardTransition: "grand-portal",
    emotionalTheme: "Anticipation, playful mystery, and tender intimacy",
    connectingVisual: "Monumental glowing heart portal with golden light rays and floating rose petals",
  },
  {
    id: "finalHeart",
    chapterNumber: 18,
    slug: "final-collage",
    path: "/story/final-collage",
    title: "Our Time Together & Final Heart",
    subtitle: "Every picture, every laugh, every little step that brought me closer to you.",
    navLabel: "18 Final Heart & Our Time",
    emoji: "❤️",
    eyebrowLabel: "EVERY LITTLE THING LED HERE",
    prevSlug: "last-secret",
    prevLabel: "Return to One Last Little Secret",
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
  const index = STORY_CHAPTERS.findIndex((c) => c.slug === currentSlug || c.id === currentSlug);
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
    next: index < STORY_CHAPTERS.length - 1 ? STORY_CHAPTERS[index + 1] : undefined,
  };
}
