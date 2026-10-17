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
  welcomeSubtitle: "A little world, just for us ✨",
  welcomeMessage: "Because you deserve to know how special you are to me. Every pixel on this page holds a piece of my heart. Take your time exploring — this is all for you.",
  
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
  ],
  
  letters: [
    {
      id: "l1",
      title: "What I Don't Say Enough",
      content: "I don't say it enough, but you have changed my life in ways I never imagined possible. Before you, I didn't know that love could feel this safe, this exciting, this warm all at once.\n\nYou make the ordinary extraordinary. The way you laugh at your own jokes, the way you hold my hand a little tighter when you're nervous, the way you always remember the little things — these are the details that make my heart overflow.\n\nI promise to keep choosing you. Every single day. In every mood, every season, every version of us that's yet to come.\n\nYou are my favorite story. And I never want it to end.",
      signature: "Forever yours",
    },
    {
      id: "l2",
      title: "The Things I Notice",
      content: "I notice when you push your hair behind your ear when you're concentrating. I notice the way your eyes light up when you talk about something you love. I notice how you always check if I'm okay, even when you're the one having a hard day.\n\nI notice everything. And every little thing makes me fall deeper.",
      signature: "Your biggest admirer",
    },
  ],
  
  openWhenLetters: [
    {
      id: "ow1",
      title: "Open When You're Sad",
      emoji: "🥺",
      content: "Hey beautiful,\n\nI know today feels heavy. I know the world seems a bit too loud and everything feels a bit too much. But I need you to know something:\n\nYou are not alone in this. Not now, not ever.\n\nWhatever is making you sad right now, it will pass. And when it does, I'll still be right here — ready to make you laugh, hold you close, and remind you of all the reasons you are incredible.\n\nClose your eyes. Take a deep breath. And remember that somewhere in this world, there's someone whose whole day gets better just by thinking of you.\n\nThat someone is me. Always.",
      signature: "I love you more than you know",
    },
    {
      id: "ow2",
      title: "Open When You Miss Me",
      emoji: "💭",
      content: "If you're reading this, you miss me. And honestly? That makes me smile.\n\nBecause I probably miss you too. Right now, wherever I am, there's a little ache in my chest that's shaped exactly like you.\n\nBut here's what I want you to remember: distance and time are just details. What we have? That's the real thing. And real things don't weaken — they grow.\n\nSo until we're together again, hold onto this: you are the first thing I think about in the morning and the last thought before I sleep. No amount of miles could change that.\n\nSee you soon, my love.",
      signature: "Counting the moments ❤️",
    },
    {
      id: "ow3",
      title: "Open When You Doubt Yourself",
      emoji: "💪",
      content: "Stop right there.\n\nI know what you're doing. You're being way too hard on yourself again. So let me be your mirror for a moment:\n\nYou are brilliant. You are capable. You are so much stronger than you give yourself credit for.\n\nRemember that time you thought you couldn't do it? You did it. Remember when you were terrified? You showed up anyway. That's not luck — that's YOU.\n\nI believe in you with my whole heart. And I need you to believe in yourself even half as much as I do. Because if you did? You'd be unstoppable.\n\nNow go show the world what I already know.",
      signature: "Your biggest cheerleader 🌟",
    },
    {
      id: "ow4",
      title: "Open When You Can't Sleep",
      emoji: "🌙",
      content: "Can't sleep, huh? \n\nThat's okay. Some nights are like that. So instead of counting sheep, let me give you better things to think about:\n\nThink about our first date and how nervous we both were.\nThink about that time we couldn't stop laughing at absolutely nothing.\nThink about all the adventures we still haven't had.\nThink about how loved you are right at this very second.\n\nNow close your eyes and imagine I'm right there with you. My arms around you, your head on my chest, just breathing together.\n\nSweet dreams, my love. Tomorrow is a new day, and it already loves you.",
      signature: "Goodnight, beautiful ✨",
    },
    {
      id: "ow5",
      title: "Open When You Need a Smile",
      emoji: "😊",
      content: "HI!!! 👋\n\nDid it work? Are you smiling yet?\n\nNo? Okay, let me try harder:\n\nRemember that time I tried to be romantic and completely embarrassed myself? Yeah. That was peak comedy and you know it.\n\nWhat about the time we tried to take a nice photo together and made the most ridiculous faces instead? Those are still my favorites.\n\nYou have the most beautiful smile I have ever seen. And the world genuinely gets a little brighter every time you use it.\n\nSo please, smile for me? 🥺\n\nThere it is. That's the one. That's my favorite view in the whole world.",
      signature: "Forever making you smile 💕",
    },
    {
      id: "ow6",
      title: "Open When You Want to Feel Loved",
      emoji: "❤️",
      content: "You want to feel loved? Come here.\n\nLet me tell you something: You are the most lovable person I have ever known. Not because you're perfect — because you're perfectly you.\n\nI love the way you care too much about everything. I love your random midnight thoughts. I love how you get excited about the smallest things. I love your voice, your laugh, your warmth.\n\nI love you on your best days and your worst days. I love you when you're confident and when you're uncertain. I love you at sunrise and sunset and every single moment in between.\n\nYou are so deeply, completely, impossibly loved.\n\nNever forget that.",
      signature: "Yours, completely ♾️",
    },
  ],
  
  observations: [
    {
      id: "o1",
      title: "Your laugh",
      content: "That real, uncontrollable laugh — not the polite one. The one where you throw your head back and your whole face lights up. That's my favorite sound in the entire universe.",
      emoji: "😄",
      category: "things I adore",
    },
    {
      id: "o2",
      title: "How you care",
      content: "You remember the tiniest details about people. Their coffee order, their allergies, their dog's name. You make everyone feel seen, and you don't even realize how rare that is.",
      emoji: "🤍",
      category: "what makes you special",
    },
    {
      id: "o3",
      title: "Your sleepy voice",
      content: "When you just wake up and your voice is all soft and raspy, asking for five more minutes... I would give you five more lifetimes.",
      emoji: "😴",
      category: "tiny moments",
    },
    {
      id: "o4",
      title: "Your determination",
      content: "When you set your mind to something, nothing can stop you. I've watched you overcome things that would break most people, and you did it with grace. You are so much stronger than you know.",
      emoji: "🔥",
      category: "what I admire",
    },
    {
      id: "o5",
      title: "How you hold my hand",
      content: "You always reach for my hand first. In crowds, during movies, in the car, while walking. It's such a small thing but it tells me everything about how you feel.",
      emoji: "🤝",
      category: "tiny moments",
    },
    {
      id: "o6",
      title: "Your taste in music",
      content: "Your playlists are honestly perfect. You always find the right song for every mood, and every time you say 'you HAVE to listen to this,' I know I'm about to fall in love with a new song.",
      emoji: "🎵",
      category: "things I adore",
    },
  ],
  
  littleReasons: [
    { id: "r1", text: "The way you say my name", emoji: "💕" },
    { id: "r2", text: "Your terrible but adorable puns", emoji: "😂" },
    { id: "r3", text: "How you always steal my fries", emoji: "🍟" },
    { id: "r4", text: "The way you look at me when you think I'm not watching", emoji: "👀" },
    { id: "r5", text: "Your random midnight texts about life", emoji: "🌙" },
    { id: "r6", text: "How you make even boring errands an adventure", emoji: "🛒" },
    { id: "r7", text: "The warmth of your hugs", emoji: "🤗" },
    { id: "r8", text: "Your passion for the things you love", emoji: "🔥" },
    { id: "r9", text: "How safe I feel with you", emoji: "🏠" },
    { id: "r10", text: "Your smile — it still makes my heart skip", emoji: "😊" },
    { id: "r11", text: "The way you always know what I need", emoji: "✨" },
    { id: "r12", text: "Your laugh when something really gets you", emoji: "😆" },
    { id: "r13", text: "How you defend the people you love", emoji: "🛡️" },
    { id: "r14", text: "Your voice notes — I replay them all the time", emoji: "🎤" },
    { id: "r15", text: "The faces you make when you're concentrating", emoji: "🤔" },
    { id: "r16", text: "How you always say exactly what I need to hear", emoji: "💬" },
    { id: "r17", text: "Your kindness — even to strangers", emoji: "🤍" },
    { id: "r18", text: "The silly nicknames you give everything", emoji: "🏷️" },
    { id: "r19", text: "How you make me want to be a better person", emoji: "🌱" },
    { id: "r20", text: "Simply because you're you, and I'm lucky to love you", emoji: "💗" },
  ],
  
  deluluScenarios: [
    {
      id: "d1",
      title: "We get caught in the rain together",
      situation: "We're walking home and suddenly the sky opens up. No umbrella, no shelter nearby, just us and the downpour. What do you do?",
      options: [
        { id: "d1a", text: "Run and scream dramatically 🏃‍♀️", response: "I KNEW IT. You'd be yelling and sprinting and I'd be right behind you, laughing so hard I can barely breathe. We'd burst through the door soaking wet and laughing like maniacs. Best. Rainy day. Ever." },
        { id: "d1b", text: "Pull me close and dance 💃", response: "You romantic disaster. We'd look ridiculous dancing in the rain with no music, completely drenched. But honestly? It would be the most perfect moment. I'd hold you there forever." },
        { id: "d1c", text: "Take shelter and people-watch ☕", response: "We'd find the tiniest café, order hot chocolate, and spend an hour watching everyone scramble. You'd narrate their stories and I'd fall in love with your imagination all over again." },
        { id: "d1d", text: "Just keep walking, who cares 🌧️", response: "That's so us. We'd just keep talking like nothing happened, getting completely soaked, not caring at all. You'd look at me with wet hair and I'd think 'yep, this is my person.'" },
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
    { id: "g1", title: "One Long Hug", description: "Redeemable anytime, anywhere. Minimum duration: until you feel better. No upper limit.", emoji: "🤗" },
    { id: "g2", title: "Movie Night of Your Choice", description: "You pick everything — the movie, the snacks, the blanket arrangement. Zero complaints from me, guaranteed.", emoji: "🎬" },
    { id: "g3", title: "Your Favorite Treat", description: "Whatever you're craving. Ice cream at 2 AM? Fancy coffee? That specific snack from that one place? Done.", emoji: "🍰" },
    { id: "g4", title: "A Day Planned Entirely By You", description: "You're the boss. Whatever you want to do, wherever you want to go. I'm just along for the ride (and I'll love every second).", emoji: "👑" },
    { id: "g5", title: "Uninterrupted Us Time", description: "Phones down, world off. Just us, no distractions, for as long as you want. Quality time, fully charged.", emoji: "📵" },
    { id: "g6", title: "A Surprise Date", description: "Leave everything to me. I'll plan it, organize it, and make sure it's something you'll remember. Just show up and trust me.", emoji: "🎁" },
    { id: "g7", title: "Breakfast in Bed", description: "You stay cozy. I handle everything — your favorite food, coffee exactly how you like it, served with a side of morning kisses.", emoji: "🥞" },
    { id: "g8", title: "A Slow Dance", description: "Right there in the living room. Your favorite song, low lights, just us swaying. No dance skills required.", emoji: "💃" },
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
    title: "Your favorite song",
    artist: "That artist you love",
    dedication: "This song is ours. Every time I hear it, I'm right back in that moment with you.",
    whyItMatters: "Because it was playing the first time I realized I was falling for you.",
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
