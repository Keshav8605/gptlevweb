import { hundredReasonsList } from "./reasons-data";

export interface HeroPolaroidConfig {
  id?: string;
  src?: string;
  caption?: string;
}

// Gift data types and configuration
export interface GiftConfig {
  // People
  senderName: string;
  senderNickname: string;
  recipientName: string;
  recipientNickname: string;
  
  // Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeMessage: string;
  welcomePolaroids?: HeroPolaroidConfig[];
  
  // Relationship dates
  dateFirstMet?: string;
  dateFirstTalked?: string;
  dateOfficialCouple?: string;
  customMilestones?: Milestone[];
  
  // Content
  memories: Memory[];
  letters: Letter[];
  openWhenLetters: OpenWhenLetter[];
  observations: ObservationCard[];
  littleReasons: LittleReason[];
  deluluScenarios: DeluluScenario[];
  quizQuestions: QuizQuestion[];
  digitalGifts: DigitalGift[];
  bucketListItems: BucketListItem[];
  dateIdeas: DateIdea[];
  personalCards: PersonalCard[];
  
  // Music
  featuredSong?: SongDedication;
  additionalSongs?: SongDedication[];
  
  // Secret
  secretPassword?: string;
  secretHint?: string;
  secretContent?: string;
  
  // Final
  finalLetter?: string;
  finalMessage?: string;
  
  // Settings
  sectionOrder: string[];
  hiddenSections: string[];
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date?: string;
  photos: string[];
  captions?: string[];
  location?: string;
  category?: 'funny' | 'romantic' | 'memorable' | 'ordinary-but-special';
  emoji?: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  date?: string;
  signature?: string;
  photo?: string;
}

export interface OpenWhenLetter {
  id: string;
  title: string;
  heading?: string;
  opening?: string;
  emoji: string;
  content: string;
  photo?: string;
  signature?: string;
  isOpened?: boolean;
}

export interface ObservationCard {
  id: string;
  title: string;
  content: string;
  photo?: string;
  category?: string;
  emoji?: string;
}

export interface LittleReason {
  id: string;
  title?: string;
  supportingText?: string;
  text: string;
  emoji?: string;
}

export interface DeluluScenario {
  id: string;
  title: string;
  situation: string;
  options: DeluluOption[];
  image?: string;
}

export interface DeluluOption {
  id: string;
  text: string;
  response: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'free-text';
  options?: string[];
  creatorAnswer?: string;
}

export interface DigitalGift {
  id: string;
  title: string;
  description: string;
  emoji: string;
  image?: string;
  isClaimed?: boolean;
  claimedAt?: string;
  isFulfilled?: boolean;
  fulfilledAt?: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  creator: 'sender' | 'receiver';
  status: 'idea' | 'shortlisted' | 'planned' | 'completed';
  targetDate?: string;
}

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  estimatedBudget?: string;
  duration?: string;
  location?: string;
  isIndoor?: boolean;
  isFavorited?: boolean;
}

export interface PersonalCard {
  id: string;
  category: string;
  title: string;
  content: string;
  emoji?: string;
  photo?: string;
}

export interface SongDedication {
  title: string;
  artist: string;
  dedication: string;
  whyItMatters?: string;
  embedUrl?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  author: 'sender' | 'receiver';
  createdAt: string;
  reactions?: string[];
}

// Default demo data
export const defaultGiftConfig: GiftConfig = {
  senderName: "Your Love",
  senderNickname: "Babe",
  recipientName: "My Everything",
  recipientNickname: "Baby",
  
  welcomeTitle: "You & Me",
  welcomeSubtitle: "A little world made from my favorite person, our little moments, and all the things I sometimes struggle to put into words.",
  welcomeMessage: "“Of all the stories life could give me, you're the one I'd choose to keep living.”",
  welcomePolaroids: [
    {
      id: "p1",
      src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
      caption: "A moment I'd choose all over again.",
    },
    {
      id: "p2",
      src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
      caption: "Somehow, my heart always finds its way back to you.",
    },
    {
      id: "p3",
      src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
      caption: "The world feels softer when I share it with you.",
    },
    {
      id: "p4",
      src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
      caption: "My favorite person, in a thousand little ways.",
    },
  ],
  
  dateFirstMet: "2023-06-15",
  dateOfficialCouple: "2023-08-20",
  customMilestones: [
    { id: "1", label: "First Date", date: "2023-07-02" },
    { id: "2", label: "First Trip Together", date: "2024-01-15" },
  ],
  
  memories: [
    {
      id: "m1",
      title: "The Day We First Met",
      description: "I still remember exactly how you looked. My heart skipped a beat and I knew right then that something beautiful was beginning. The world felt different from that moment on.",
      date: "2023-06-15",
      photos: [],
      location: "Where it all began",
      category: "romantic",
      emoji: "💕",
    },
    {
      id: "m2",
      title: "Our First Real Laugh Together",
      description: "We were trying to cook dinner and everything went wrong — burnt pasta, smoke alarm going off, and somehow we ended up sitting on the kitchen floor laughing until we cried. That's when I knew you were my person.",
      date: "2023-07-20",
      photos: [],
      category: "funny",
      emoji: "😂",
    },
    {
      id: "m3",
      title: "That Night Under the Stars",
      description: "You pulled over and said 'let's just look at the sky for a minute.' We stayed for two hours, talking about everything and nothing. The stars had nothing on you.",
      date: "2023-09-14",
      photos: [],
      location: "Our secret spot",
      category: "romantic",
      emoji: "🌟",
    },
    {
      id: "m4",
      title: "When You Surprised Me",
      description: "I had the worst day ever and you showed up at my door with my favorite food and that ridiculous stuffed animal. You didn't even ask what was wrong — you just knew I needed you there.",
      date: "2024-02-10",
      photos: [],
      category: "memorable",
      emoji: "🥺",
    },
    {
      id: "m5",
      title: "Just a Normal Tuesday",
      description: "We were grocery shopping, and you were arguing about which cereal was better. You got so passionate about it, and I was standing there thinking 'I want every Tuesday to be like this.'",
      photos: [],
      category: "ordinary-but-special",
      emoji: "🛒",
    },
    {
      id: "m6",
      title: "Our Quiet Beach Walk",
      description: "The waves were whispering against our feet, the sky turned a deep lavender, and you held my hand like you never wanted to let go. In that quiet moment, everything made sense.",
      date: "2024-05-18",
      photos: [],
      location: "By the water at sunset",
      category: "romantic",
      emoji: "🌅",
    },
  ],
  
  letters: [
    {
      id: "l1",
      title: "What I Don't Say Enough",
      content: "My love,\n\nI don't think I tell you often enough how much you mean to me.\n\nYou have a way of making ordinary days feel special. It's in the way you laugh, the little things you remember, and the comfort I feel just knowing you're there.\n\nI love the big moments we share, but I think I love the little ones just as much. The random conversations, the silly jokes, the quiet moments when we don't need to say much at all.\n\nI can't promise that every day will be perfect. But I can promise to keep showing up, to keep learning you, to listen when you need me, and to keep choosing us through all the versions of life still waiting for us.\n\nI hope you never have to wonder whether you matter to me. You do. In more ways than I can fit into one letter.\n\nAnd if I ever forget to say it out loud, I hope you can come back here and feel it again.",
      signature: "All my love, always. ♡",
    },
    {
      id: "l2",
      title: "The Little Things I Notice",
      content: "My sweetheart,\n\nI notice when you push your hair behind your ear when you're concentrating. I notice the way your eyes light up when you talk about something you love. I notice how you always check if I'm okay, even when you're the one having a hard day.\n\nI notice the way you hum softly without realizing it, how your fingers find mine in the dark, and how the simplest things make you smile.\n\nI notice everything. And every little thing makes me fall for you all over again.",
      signature: "Your biggest admirer ♡",
    },
    {
      id: "l3",
      title: "For the Days You Forget How Loved You Are",
      content: "My dearest,\n\nOn the days when everything feels heavy and you're being too hard on yourself, take a deep breath.\n\nYou don't have to carry the whole world on your shoulders. You don't have to be perfect to deserve the gentlest love.\n\nI love you when you're laughing, and I love you when you're quiet and tired. You are so deeply cherished, exactly as you are.",
      signature: "Always in your corner. ♡",
    },
  ],
  
  openWhenLetters: [
    {
      id: "ow1",
      title: "Open when you're feeling low",
      heading: "A gentle reminder that it's okay to slow down",
      opening: "My love,",
      emoji: "🌧️",
      content: "My love,\n\nSometimes the world is just heavy, and you don't even have to have a clear reason why. If today feels quiet or gray, please don't force yourself to carry more than you can handle.\n\nYou don't need to put on a brave face with me. It is completely okay to take off the armor, let your shoulders drop, and just take things one slow breath at a time. Be gentle with yourself today.\n\nWhenever you need a quiet corner or a listening ear, I'm here. Drink a glass of water, wrap yourself in warmth, and remember this day will pass.\n\nHolding you close, always. ♡",
      signature: "Holding you close, always. ♡",
    },
    {
      id: "ow2",
      title: "Open when you miss me",
      heading: "When the distance feels a little too loud",
      opening: "My sweet love,",
      emoji: "💭",
      content: "My sweet love,\n\nI know that quiet ache when you wish we could just reach out and hold each other. If you're missing me right now, know with certainty that I'm carrying you in my thoughts too.\n\nDistance and busy hours can keep us in different rooms, but they don't change how tightly my heart belongs to you. Close your eyes for three seconds and imagine my arms around you, because that's where I want to be.\n\nWe will be together again soon, catching up on every little detail and laughing until our sides hurt. Until then, hold onto this whisper: you are loved across every mile.\n\nCounting down the moments until I see you. ♡",
      signature: "Counting down the moments until I see you. ♡",
    },
    {
      id: "ow3",
      title: "Open when you doubt yourself",
      heading: "For the days you forget how wonderful you are",
      opening: "My love,",
      emoji: "🌱",
      content: "My love,\n\nI wish you could see yourself through my eyes for just a moment. Not because you need to become someone else, or because you need to prove anything, but because I hope you'd recognize how much good is already in you.\n\nYou don't have to get everything right today. You don't have to be the strongest person in every room. You are allowed to rest, to learn, to feel unsure, and to begin again.\n\nWhatever today looks like, I hope you remember this: one difficult day doesn't define you, and one mistake can never erase all the beautiful things that make you who you are.\n\nI'm cheering for you, always. ♡",
      signature: "I'm cheering for you, always. ♡",
    },
    {
      id: "ow4",
      title: "Open when you can't sleep",
      heading: "A quiet lullaby for a wandering mind",
      opening: "My darling,",
      emoji: "🌙",
      content: "My darling,\n\nLate nights have a way of echoing every little thought. If your mind is running in circles right now, let this be your permission to set tomorrow down.\n\nWhatever didn't get done today can wait. You don't have to solve your whole life before midnight. You did enough, and right now, your only job is to rest.\n\nTake a slow, deep breath in, and let it out. Imagine the rhythm of the rain or a warm room where you feel completely safe. I am thinking of you, wishing you the sweetest dreams and the gentlest rest.\n\nSleep peacefully, my favorite person. ♡",
      signature: "Sleep peacefully, my favorite person. ♡",
    },
    {
      id: "ow5",
      title: "Open when you need a smile",
      heading: "A tiny spark of joy, just for you",
      opening: "Hey you,",
      emoji: "😊",
      content: "Hey you,\n\nIf today has been dull, serious, or just a little draining, I hope this little note brings a grin to that gorgeous face of yours.\n\nRemember that ridiculous moment when we couldn't stop laughing at something completely silly? The world is full of little surprises waiting to make us laugh, and having you by my side makes life a hundred times more joyful.\n\nYou have a smile that lights up entire rooms, and I consider it my life's mission to keep that smile safe. Go on, let yourself chuckle. You deserve every ounce of sweetness today.\n\nYour personal goofball and biggest fan. ♡",
      signature: "Your personal goofball and biggest fan. ♡",
    },
    {
      id: "ow6",
      title: "Open when you need a reminder of how loved you are",
      heading: "For when the world feels too quiet",
      opening: "My whole heart,",
      emoji: "❤️",
      content: "My whole heart,\n\nIf you ever wonder whether you are cherished, let this letter answer you without a single doubt: you are loved beyond words.\n\nI love you for your bright moments and your tired ones. I love the quiet kindness you give to the world, the funny little expressions you make, and the sincere warmth you bring into my life every single day.\n\nYou are not hard to love; loving you is the most natural, effortless thing my heart has ever learned. You matter to me deeply, today and through every tomorrow.\n\nForever and always yours. ♡",
      signature: "Forever and always yours. ♡",
    },
  ],
  
  observations: [
    {
      id: "o1",
      title: "Your laugh",
      content: "The kind of laugh that makes me forget what I was worrying about. Sometimes I fall in love with you all over again just watching you be happy.",
      emoji: "😄",
      category: "01 · THE THINGS YOU DO",
    },
    {
      id: "o2",
      title: "Your thoughtful heart",
      content: "You remember the little things. You notice when someone needs kindness, even when they don't ask for it. I hope you know how special that is.",
      emoji: "🤍",
      category: "02 · THE WAY YOU LOVE",
    },
    {
      id: "o3",
      title: "Your sleepy voice",
      content: "There's something about your sleepy little voice that makes me want to stay on the phone just a little longer, even when neither of us has anything left to say.",
      emoji: "🌙",
      category: "03 · THE MOMENTS ONLY I GET",
    },
    {
      id: "o4",
      title: "Your determination",
      content: "When you set your mind to something, nothing can stop you. I've watched you overcome things that would break most people, and you did it with grace. You are so much stronger than you know.",
      emoji: "🔥",
      category: "04 · WHAT I ADMIRE",
    },
    {
      id: "o5",
      title: "How you hold my hand",
      content: "You always reach for my hand first. In crowds, during movies, in the car, while walking. It's such a small thing but it tells me everything about how you feel.",
      emoji: "🤝",
      category: "05 · THE LITTLE MOMENTS",
    },
    {
      id: "o6",
      title: "Your taste in music",
      content: "Your playlists are honestly perfect. You always find the right song for every mood, and every time you say 'you HAVE to listen to this,' I know I'm about to fall in love with a new song.",
      emoji: "🎵",
      category: "06 · THE SWEET HARMONY",
    },
  ],
  
  littleReasons: hundredReasonsList,
  
  deluluScenarios: [
    {
      id: "d1",
      title: "Caught in the Rain",
      situation: "We get caught in a sudden downpour together. What do we do?",
      options: [
        {
          id: "d1a",
          text: "Grab your hands and dance right there in the rain. Who needs an umbrella?",
          response: "Of course you would. Five minutes in the rain with you would become one of my favorite memories. ♡",
        },
        {
          id: "d1b",
          text: "Run for the nearest café and share the tiniest corner under my jacket.",
          response: "Maximum cozy romance. Squeezing close while shivering and laughing... I wouldn't trade that for anything. ☕💕",
        },
        {
          id: "d1c",
          text: "Declare it a puddle-splashing championship. Winner gets a kiss. ♡",
          response: "Chaotic and adorable, exactly like you. Spoiler: either way, I'm making sure you get that kiss. 💦🥰",
        },
      ],
    },
    {
      id: "d2",
      title: "We have a completely free day",
      situation: "No plans, no responsibilities, no alarms. Twenty-four hours of pure freedom. Just us. What's the vibe?",
      options: [
        { id: "d2a", text: "Sleep in, movies, takeout 🍿", response: "A whole day in our own little bubble? You'd pick the most random movie marathon, we'd argue about toppings, and by 3 PM we still wouldn't have changed out of pajamas. Absolute perfection." },
        { id: "d2b", text: "Spontaneous road trip 🚗", response: "I'd love that! No destination, just driving with music blasting and snacks. We'd find some tiny town or hidden spot and pretend we discovered a secret world. With you, every road leads somewhere beautiful." },
        { id: "d2c", text: "Cook together, music, vibes 🎶", response: "You chopping vegetables while I handle the playlist, bumping hips in the kitchen, taste-testing everything. We'd make a mess and it would be the best meal we ever had. Not because of the food — because of the company." },
        { id: "d2d", text: "Explore something we've never tried ✨", response: "THAT'S the spirit! Whether it's pottery, hiking a new trail, or finding some weird museum — I love that you're always up for an adventure. Life with you is never boring." },
      ],
    },
    {
      id: "d3",
      title: "It's 2 AM and neither of us can sleep",
      situation: "The world is quiet. It's just us, the darkness, and that strange 2 AM energy. What happens?",
      options: [
        { id: "d3a", text: "Deep conversations about life 🌌", response: "This is where the magic happens. 2 AM conversations with you are my favorite. We'd talk about fears, dreams, and the meaning of everything. I learn something new about you every time, and I never want to stop learning." },
        { id: "d3b", text: "Midnight snack mission 🍩", response: "We'd tiptoe to the kitchen like we're on a secret mission, make the most chaotic snack plate in history, and eat it cross-legged on the floor. Our midnight adventures are honestly underrated." },
        { id: "d3c", text: "Watch random YouTube videos 📱", response: "We'd start with one video and end up in the weirdest rabbit hole three hours later. You'd show me some obscure documentary and I'd show you cat compilations. Equal exchange." },
        { id: "d3d", text: "Just lie there and enjoy the quiet 🤫", response: "Sometimes the best moments are the ones with no words at all. Just lying there in the dark, knowing you're right there, hearing you breathe. That quiet comfort is everything to me." },
      ],
    },
    {
      id: "d4",
      title: "We suddenly win a free trip",
      situation: "Surprise! We just won an all-expenses-paid trip anywhere in the world. Where are we going?",
      options: [
        { id: "d4a", text: "Paris, obviously 🗼", response: "The city of love with the love of my life? We'd eat croissants by the Seine, get lost in tiny streets, and I'd kiss you under the Eiffel Tower because some clichés exist for a reason." },
        { id: "d4b", text: "A tropical island 🏝️", response: "Just us, turquoise water, and no schedule. We'd spend mornings in hammocks and evenings watching sunsets. I'd build you the worst sandcastle and you'd love it anyway because you're kind like that." },
        { id: "d4c", text: "Japan! 🇯🇵", response: "Cherry blossoms, ramen shops, temples, and chaos. We'd try everything, get lost in translation, and take a million photos. Your excitement about every new experience is one of my favorite things about you." },
        { id: "d4d", text: "Somewhere no one's heard of 🗺️", response: "Of course you'd pick the road less traveled. We'd find some tiny village or hidden spot that doesn't even show up on most maps. Making our own adventure, our own story. So perfectly us." },
      ],
    },
    {
      id: "d5",
      title: "We're old and arguing about something silly",
      situation: "Fast forward fifty years. We're old, adorable, and arguing about something completely ridiculous. What is it?",
      options: [
        { id: "d5a", text: "Who snores louder 😤", response: "We'd literally record each other sleeping just to win this argument. The grandkids would take sides. It would be a multi-generational debate. And honestly? It's definitely you. (Don't fight me on this.)" },
        { id: "d5b", text: "Who fell in love first 💘", response: "Fifty years later and we're STILL arguing about this? I love it. For the record — it was me. I fell first and I fell HARD. But you fell deeper, and that's what matters. 😏" },
        { id: "d5c", text: "The thermostat 🌡️", response: "The ultimate couple argument, perfected over decades. I want it warmer, you want it cooler (or vice versa), and we've been having this exact fight since day one. Some things never change, and I wouldn't want them to." },
        { id: "d5d", text: "Whose turn it is to make tea ☕", response: "We'd have an elaborate system of whose turn it is, complete with a whiteboard scoreboard, and we'd STILL argue about it. But secretly, I'd always make yours first because old me still can't resist taking care of you." },
      ],
    },
  ],
  
  quizQuestions: [
    {
      id: "q1",
      question: "Who caught feelings first?",
      type: "multiple-choice",
      options: ["I did, obviously", "You did, and you know it", "It was mutual — instant connection", "Still figuring it out honestly"],
      creatorAnswer: "You did, and you know it",
    },
    {
      id: "q2",
      question: "What's our funniest memory together?",
      type: "free-text",
      creatorAnswer: "That time we tried to cook dinner and set off the smoke alarm three times",
    },
    {
      id: "q3",
      question: "What little thing about me makes you happiest?",
      type: "free-text",
      creatorAnswer: "Your smile when you see something cute",
    },
    {
      id: "q4",
      question: "What would our perfect day look like?",
      type: "free-text",
      creatorAnswer: "Sleeping in, breakfast in bed, a long walk, cooking together, movie night, and falling asleep on the couch",
    },
    {
      id: "q5",
      question: "What song reminds you of us?",
      type: "free-text",
      creatorAnswer: "You'll have to guess 😏",
    },
  ],
  
  digitalGifts: [
    { id: "g1", title: "One really good hug", description: "Available whenever you need one. No rushing, no clock-watching. Just a hug until you feel a little better.", emoji: "🤗" },
    { id: "g2", title: "A movie night, your way", description: "You choose the movie, the snacks, and the blanket arrangement. I'll try not to complain about your choice. Much.", emoji: "🎬" },
    { id: "g3", title: "Your favorite treat", description: "That one snack or dessert you've been craving? Consider it a little mission for me.", emoji: "🧁" },
    { id: "g4", title: "A day planned entirely for you", description: "You tell me what kind of day your heart wants. I'll take care of the little details.", emoji: "👑" },
    { id: "g5", title: "An uninterrupted us day", description: "Phones away, distractions down, and time to be together without rushing anywhere.", emoji: "📵" },
    { id: "g6", title: "A surprise date", description: "Give me a little hint about your mood, and let me plan something thoughtful for us.", emoji: "🎁" },
    { id: "g7", title: "Breakfast in bed", description: "Your favorite breakfast, made with love and served with a side of morning kisses.", emoji: "🥞" },
    { id: "g8", title: "One slow dance", description: "Our favorite song, a little space in the living room, and absolutely no need to know how to dance.", emoji: "💃" },
  ],
  
  bucketListItems: [
    { id: "b1", title: "Watch the sunrise together", description: "Set an alarm, grab blankets, find the perfect spot, and watch the sky change color.", creator: "sender", status: "idea" },
    { id: "b2", title: "Learn to cook something fancy", description: "Pick a ridiculously complicated recipe and try to make it together. The chaos will be half the fun.", creator: "sender", status: "idea" },
    { id: "b3", title: "Take a trip with no plan", description: "Just pick a direction and drive. No reservations, no itinerary, just us and the open road.", creator: "sender", status: "shortlisted" },
    { id: "b4", title: "Write each other real letters", description: "Sit down, pen and paper, and write what we feel. Then exchange and read them together.", creator: "sender", status: "idea" },
    { id: "b5", title: "Build a blanket fort", description: "Yes, we're adults. Yes, we're building a blanket fort. Yes, it will be epic.", creator: "sender", status: "idea" },
    { id: "b6", title: "Visit a place we've always talked about", description: "That one place we keep saying 'someday' about? Let's make someday a date.", creator: "sender", status: "shortlisted" },
  ],
  
  dateIdeas: [
    { id: "di1", title: "Sunset Picnic", description: "Pack our favorite foods, find a beautiful spot, and watch the sun go down together.", category: "romantic", estimatedBudget: "$", duration: "2-3 hours", isIndoor: false },
    { id: "di2", title: "Café Hopping", description: "Spend an afternoon trying different cafés, rating their coffee and pastries.", category: "adventure", estimatedBudget: "$$", duration: "3-4 hours", isIndoor: true },
    { id: "di3", title: "Movie Night at Home", description: "Build the ultimate cozy setup — blankets, snacks, candles, and our favorite films.", category: "cozy", estimatedBudget: "$", duration: "4+ hours", isIndoor: true },
    { id: "di4", title: "Cooking Challenge", description: "Pick a cuisine neither of us knows, find a recipe, and figure it out together.", category: "adventure", estimatedBudget: "$$", duration: "2-3 hours", isIndoor: true },
    { id: "di5", title: "Stargazing", description: "Drive somewhere away from city lights and spend the night looking at stars.", category: "romantic", estimatedBudget: "$", duration: "3+ hours", isIndoor: false },
    { id: "di6", title: "Art & Paint Together", description: "Get some canvases and paint, put on music, and see what we create.", category: "creative", estimatedBudget: "$$", duration: "2-3 hours", isIndoor: true },
  ],
  
  personalCards: [
    { id: "pc1", category: "Cute Habit", title: "Nose Scrunch", content: "You do this tiny nose scrunch when you're happy and it literally melts me every single time.", emoji: "🐰" },
    { id: "pc2", category: "Signature Expression", title: "The Look", content: "You have this one look — raised eyebrow, slight smirk — that says 'I love you but you're being ridiculous.' I live for that look.", emoji: "😏" },
    { id: "pc3", category: "Favorite Activity", title: "Late Night Talks", content: "My absolute favorite thing we do is stay up way too late talking about absolutely everything. Time stops when we're in those conversations.", emoji: "🌙" },
    { id: "pc4", category: "Funny Quirk", title: "The Food Thing", content: "The way you have to taste everything on everyone's plate. You say you're 'just trying it' but you always end up eating half. I've accepted this about you and I love it.", emoji: "🍽️" },
  ],
  
  featuredSong: {
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    dedication: "Every time I hear this, I think of you. Of the moments we've shared, the ones still waiting for us, and all the feelings that are somehow easier to hear in a song.",
    whyItMatters: "Because some songs feel like home the second they start playing.",
  },
  
  secretPassword: "iloveyou",
  secretHint: "Three words, no spaces, all lowercase — the simplest truth I know 💕",
  secretContent: "You found it. 🥺\n\nThis secret space is just for us. No one else in the world knows this exists.\n\nI wanted you to have a place where you know, without any doubt, how much you mean to me. Not in big gestures or fancy words — but in the quiet, honest truth:\n\nYou are my favorite person. My best friend. My safe place. My greatest adventure.\n\nI don't need the world to know. I just need YOU to know.\n\nI love you. Endlessly. Completely. Always.",
  
  finalLetter: "My Dearest,\n\nIf you've made it here, you've explored every little corner of this world I built for you. And I hope you felt it — every word, every memory, every silly game and heartfelt letter — it's all real. It's all us.\n\nI made this because you deserve to see yourself through my eyes. You deserve to know that someone thinks about you this much, cares about you this deeply, and loves you this completely.\n\nThis isn't just a website. It's a love letter disguised as a world. And every time you come back to it, I want you to remember:\n\nYou are enough. You are loved. You are home.\n\nThank you for being you. Thank you for being mine.\n\nWith every heartbeat,\nYours forever ❤️",
  
  finalMessage: "This was made with all my heart, just for you. I love you more than any website could ever express. 💕",
  
  sectionOrder: [
    "welcome",
    "observations",
    "memories",
    "letters",
    "openWhenLetters",
    "ourSong",
    "secretWorld",
    "deluluMode",
    "quiz",
    "littleReasons",
    "digitalGifts",
    "personalCards",
    "bucketList",
    "datePlanner",
    "notebook",
    "timeline",
    "finalHeart",
  ],
  hiddenSections: [],
};
