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
    title: "You & Me",
    subtitle: "A little world, just for you",
    navLabel: "01 You & Me",
    emoji: "🧸",
    eyebrowLabel: "A LITTLE WORLD, JUST FOR YOU",
    transitionEyebrow: "A LITTLE MORE OF YOU",
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
    prevLabel: "Return to Chapter 1 · You & Me",
    transitionEyebrow: "LET'S KEEP THESE MOMENTS",
    nextSlug: "memories",
    nextLabel: "Open our memory scrapbook 📷",
    nextSubtitle: "Because the smallest memories are often the ones that stay with us the longest.",
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
    subtitle: "A collection of little moments that mean the entire world to me.",
    navLabel: "03 Our Memories Scrapbook",
    emoji: "📸",
    eyebrowLabel: "OUR LITTLE ARCHIVE",
    prevSlug: "things-i-notice",
    prevLabel: "Return to Things I Noticed About You",
    nextSlug: "secret-world",
    nextLabel: "Enter our secret world 🔐",
    nextSubtitle: "Some memories belong in pictures. Some things belong just between us.",
    forwardTransition: "heart-padlock",
    emotionalTheme: "Nostalgia, gratitude, and unforgettable shared moments",
    connectingVisual: "Shimmering golden-pink heart padlock unlocking",
  },
  {
    id: "secretWorld",
    chapterNumber: 4,
    slug: "secret-world",
    path: "/story/secret-world",
    title: "Our Secret World",
    subtitle: "A tiny corner of the universe that feels like ours.",
    navLabel: "04 Our Secret World",
    emoji: "🔒",
    eyebrowLabel: "JUST BETWEEN US",
    prevSlug: "memories",
    prevLabel: "Return to Our Memories Scrapbook",
    nextSlug: "delulu",
    nextLabel: "Enter our delulu universe 🦋",
    nextSubtitle: "And now, for the version of us that exists in my most ridiculous, happiest daydreams…",
    forwardTransition: "bouncing-hearts",
    emotionalTheme: "Curiosity, exclusivity, and profound safety",
    connectingVisual: "Two playful bouncing hearts with pastel butterfly sparkles",
  },
  {
    id: "deluluMode",
    chapterNumber: 5,
    slug: "delulu",
    path: "/story/delulu",
    title: "Delulu Mode ♡",
    subtitle: "A few imaginary situations. One very real favorite person.",
    navLabel: "05 Delulu Mode",
    emoji: "🦋",
    eyebrowLabel: "OUR IMAGINATION HAS NO CHILL",
    prevSlug: "secret-world",
    prevLabel: "Return to Our Secret World",
    nextSlug: "our-quiz",
    nextLabel: "Answer one tiny question 💗",
    nextSubtitle: "Okay, enough daydreaming for a second. I have one very important question for you…",
    forwardTransition: "quiz-sparkle",
    emotionalTheme: "Playful affection, inside jokes, and joyful laughter",
    connectingVisual: "Glowing question-heart burst with confetti sparkles",
  },
  {
    id: "quiz",
    chapterNumber: 6,
    slug: "our-quiz",
    path: "/story/our-quiz",
    title: "Do You Love Me?",
    subtitle: "There is one answer I'm secretly hoping for. ♡",
    navLabel: "06 Do You Love Me?",
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
    chapterNumber: 7,
    slug: "love-letters",
    path: "/story/love-letters",
    title: "Love Letters",
    subtitle: "For the things I feel deeply, even when I don't always say them well.",
    navLabel: "07 Love Letters",
    emoji: "💌",
    eyebrowLabel: "WORDS FROM MY HEART",
    prevSlug: "our-quiz",
    prevLabel: "Return to Do You Love Me?",
    transitionEyebrow: "LITTLE THOUGHTS, KEPT TOGETHER",
    nextSlug: "notebook",
    nextLabel: "Open our shared notebook 📖",
    nextSubtitle: "And because love isn't only what we say. It's also the little things we leave for each other along the way.",
    forwardTransition: "journal-flip",
    emotionalTheme: "Deep vulnerability, pure love, and heartfelt sincerity",
    connectingVisual: "Gently turning journal page with satin bookmark ribbon",
  },
  {
    id: "notebook",
    chapterNumber: 8,
    slug: "notebook",
    path: "/story/notebook",
    title: "Our Little Notebook",
    subtitle: "A place for the thoughts, memories, and tiny love notes we don't want to lose.",
    navLabel: "08 Our Little Notebook",
    emoji: "📖",
    eyebrowLabel: "LITTLE THOUGHTS, KEPT TOGETHER",
    prevSlug: "love-letters",
    prevLabel: "Return to Love Letters",
    transitionEyebrow: "A LITTLE PIECE OF ME",
    nextSlug: "voice-messages",
    nextLabel: "Listen to our little whispers 🎙️",
    nextSubtitle: "Some feelings deserve more than a typed sentence. Sometimes, I just want you to hear my voice.",
    forwardTransition: "voice-ripples",
    emotionalTheme: "Two-way intimacy, shared whispers, and growing together",
    connectingVisual: "Concentric pastel audio wave ripples and melodic chimes",
  },
  {
    id: "voice",
    chapterNumber: 9,
    slug: "voice-messages",
    path: "/story/voice-messages",
    title: "Voice Notes, Just for Us",
    subtitle: "For the days when a voice feels closer than a message. Save a laugh, a little story, or a goodnight for later.",
    navLabel: "09 Voice Notes, Just for Us",
    emoji: "🎙️",
    eyebrowLabel: "A LITTLE PIECE OF ME",
    prevSlug: "notebook",
    prevLabel: "Return to Our Little Notebook",
    transitionEyebrow: "OUR NEXT LITTLE ADVENTURE",
    nextSlug: "plan-a-date",
    nextLabel: "Plan our next adventure 🗺️",
    nextSubtitle: "Now let's turn all these little daydreams into something we can actually look forward to.",
    forwardTransition: "date-postcard",
    emotionalTheme: "Closeness, the comforting sound of each other's voice",
    connectingVisual: "Flipping adventure compass and calendar postcard",
  },
  {
    id: "datePlanner",
    chapterNumber: 10,
    slug: "plan-a-date",
    path: "/story/plan-a-date",
    title: "Our Next Little Adventure",
    subtitle: "Little plans, new places, and memories we haven't made yet.",
    navLabel: "10 Our Next Little Adventure",
    emoji: "🗺️",
    eyebrowLabel: "OUR NEXT LITTLE ADVENTURE",
    prevSlug: "voice-messages",
    prevLabel: "Return to Voice Notes, Just for Us",
    transitionEyebrow: "LETTERS FOR EVERY KIND OF DAY",
    nextSlug: "open-when",
    nextLabel: "Open your letters for every kind of day 💌",
    nextSubtitle: "And for the days when we can't plan an adventure, I still want you to have a little reminder of how loved you are.",
    forwardTransition: "wax-envelope",
    emotionalTheme: "Eager anticipation for our shared future and adventures",
    connectingVisual: "Cluster of floating wax-stamped comfort envelopes",
  },
  {
    id: "openWhenLetters",
    chapterNumber: 11,
    slug: "open-when",
    path: "/story/open-when",
    title: "Open When…",
    subtitle: "Little letters for the moments when you need a little extra love.",
    navLabel: "11 Open When…",
    emoji: "✉️",
    eyebrowLabel: "FOR WHATEVER TODAY FEELS LIKE",
    prevSlug: "plan-a-date",
    prevLabel: "Return to Our Next Little Adventure",
    transitionEyebrow: "A LIST THAT COULD KEEP GROWING",
    nextSlug: "reasons",
    nextLabel: "Discover the reasons I love you ♡",
    nextSubtitle: "There are more reasons than I could ever fit into one letter. So I started a list.",
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
    subtitle: "I started counting. Then I remembered that loving you isn't something I can finish counting.",
    navLabel: "12 A Hundred Little Reasons",
    emoji: "💗",
    eyebrowLabel: "A LIST THAT COULD KEEP GROWING",
    prevSlug: "open-when",
    prevLabel: "Return to Open When…",
    transitionEyebrow: "A FEW LITTLE PROMISES",
    nextSlug: "little-gifts",
    nextLabel: "Open your little gifts 🎁",
    nextSubtitle: "And because words are lovely, but showing up for each other matters too, I have a few little promises for you.",
    forwardTransition: "gift-ribbon",
    emotionalTheme: "Abundant adoration, deep appreciation, and joy",
    connectingVisual: "Silky pink gift ribbon unraveling with starburst sparkles",
  },
  {
    id: "digitalGifts",
    chapterNumber: 13,
    slug: "little-gifts",
    path: "/story/little-gifts",
    title: "Little Gifts, Just for You",
    subtitle: "A few things I'd love to do for you. No expiry date, just love.",
    navLabel: "13 Little Gifts, Just for You",
    emoji: "🎁",
    eyebrowLabel: "A FEW LITTLE PROMISES",
    prevSlug: "reasons",
    prevLabel: "Return to A Hundred Little Reasons",
    transitionEyebrow: "A SONG THAT SOUNDS LIKE US",
    nextSlug: "our-song",
    nextLabel: "Play our song 🎵",
    nextSubtitle: "One last thing before the final surprise: there's a song that makes me think of you.",
    forwardTransition: "vinyl-melody",
    emotionalTheme: "Generosity, pampering, and loving promises",
    connectingVisual: "Spinning vinyl record silhouette with floating musical notes",
  },
  {
    id: "ourSong",
    chapterNumber: 14,
    slug: "our-song",
    path: "/story/our-song",
    title: "Our Song",
    subtitle: "Some songs play in the background. This one brings you right back to me.",
    navLabel: "14 Our Song",
    emoji: "🎵",
    eyebrowLabel: "A SONG THAT SOUNDS LIKE US",
    prevSlug: "little-gifts",
    prevLabel: "Return to Little Gifts, Just for You",
    transitionEyebrow: "EVERY LITTLE THING LED HERE",
    nextSlug: "final-collage",
    nextLabel: "Reveal our love story ♡",
    nextSubtitle: "Every little moment, every tiny reason, every feeling in this world leads back to one thing: us.",
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
    subtitle: "Every picture, every laugh, every little step that brought me closer to you.",
    navLabel: "15 A Thousand Little Moments, One Big Love",
    emoji: "❤️",
    eyebrowLabel: "EVERY LITTLE THING LED HERE",
    prevSlug: "our-song",
    prevLabel: "Return to Our Song",
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
