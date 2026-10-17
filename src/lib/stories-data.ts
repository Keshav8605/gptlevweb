export interface StoryScene {
  id: string;
  sceneNumber: number;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
}

export interface Story {
  id: "mafia-romance" | "enemies-to-lovers";
  genre: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  coverAlt: string;
  accentColor: string;
  themeGlow: string;
  scenes: StoryScene[];
}

export const STORIES: Story[] = [
  {
    id: "mafia-romance",
    genre: "Mafia Romance",
    title: "The City's Most Feared Man Has One Weakness.",
    tagline: "Mystery, vulnerability, and hidden feelings",
    synopsis:
      "A feared, mysterious man keeps everyone at a distance until one person treats him like an ordinary human being. Behind his intimidating reputation lies a vulnerable side that changes their relationship in an unexpected way.",
    coverImage: "/images/stories/mafia-romance-cover.jpg",
    coverAlt: "Brooding man in tailored suit holding a velvet rose by a rain-streaked penthouse window",
    accentColor: "#be123c", // rose-700
    themeGlow: "rgba(190, 18, 60, 0.35)",
    scenes: [
      {
        id: "mr-s1",
        sceneNumber: 1,
        title: "The City's Most Feared Man",
        text:
          "In this city, Julian Vance’s name was spoken only in lowered voices. Men bowed their heads when his sleek black car stopped, terrified of making eye contact with the legendary figure who commanded the waterfront towers. Yet when he entered the quiet rooftop tea gallery where you worked, drenched in rain, you didn’t tremble. You just handed him a dry towel and told him he was dripping on the hardwood.",
        image: "/images/stories/mafia-scene-1-arrival.jpg",
        imageAlt: "Julian Vance drenched in rain entering the warm rooftop tea gallery",
      },
      {
        id: "mr-s2",
        sceneNumber: 2,
        title: "The One Person Who Is Not Impressed",
        text:
          "He froze, unaccustomed to anyone addressing him without rehearsed deference. His dark eyes narrowed, searching your expression for fear or hidden motives. Finding none, a faint crease formed between his brows. You slid a warm porcelain cup toward him before he could speak. 'Black tea with orange peel,' you noted calmly. 'You look like someone who forgot to sleep last night.'",
        image: "/images/stories/mafia-scene-2-tea.jpg",
        imageAlt: "Warm cup of black tea with orange peel on dark wood counter",
      },
      {
        id: "mr-s3",
        sceneNumber: 3,
        title: "An Unexpected Act of Kindness",
        text:
          "Two nights later, the gallery heating failed during a sudden frost. You were rubbing your chilled hands together when Julian stepped quietly through the double doors. Without a word, he draped his heavy charcoal cashmere coat around your shoulders. He also brought a small brass tin of the specific loose-leaf tea you had mentioned loving in passing, carefully setting it on the counter.",
        image: "/images/stories/mafia-scene-penthouse.jpg",
        imageAlt: "Charcoal cashmere coat and brass tea tin in the high-rise penthouse study",
      },
      {
        id: "mr-s4",
        sceneNumber: 4,
        title: "The Secret Behind the Reputation",
        text:
          "Over quiet midnight visits, the truth behind his iron armor began to surface. His ruthless reputation had been carefully constructed to protect his younger sister and shield his family from those who had betrayed his father years ago. The feared titan was merely an exhausted guardian who had spent a decade carrying the weight of an entire empire alone in silence.",
        image: "/images/stories/mafia-scene-4-archive.jpg",
        imageAlt: "Private family study archive with old ledgers and warm antique lamp",
      },
      {
        id: "mr-s5",
        sceneNumber: 5,
        title: "The Moment the Mask Slips",
        text:
          "When an old business associate attempted to seize his family's foundation, Julian spent three sleepless nights negotiating behind closed doors. When he finally appeared on your terrace, his shoulders sagged and his composed mask slipped. He rested his forehead against yours in the stillness of dawn, breathing you in like an anchor in a raging storm, letting his guard fall completely.",
        image: "/images/stories/mafia-scene-5-dawn.jpg",
        imageAlt: "Dawn light breaking over the city skyline through the glass terrace",
      },
      {
        id: "mr-s6",
        sceneNumber: 6,
        title: "The Misunderstanding",
        text:
          "The next evening, rumors circulated that Julian was leaving the country to secure an offshore merger, severing all local ties. A cold knot tightened in your chest, fearing you were just a fleeting distraction to him. But when you confronted him by the rain-streaked windows, Julian looked astonished. 'I wasn't leaving you,' he said softly. 'I was selling those assets so I could finally walk away.'",
        image: "/images/stories/mafia-scene-6-window.jpg",
        imageAlt: "Julian speaking with heartfelt sincerity beside the rain-streaked window",
      },
      {
        id: "mr-s7",
        sceneNumber: 7,
        title: "The Confession",
        text:
          "He drew you close into the warm glow of the penthouse lamps, his fingers gently tracing your jawline. 'Everyone sees the shadow I cast over this city,' he whispered, his voice trembling with rare honesty. 'Only you saw the cold man standing beneath it and offered him warmth. You remembered my tea, challenged my pride, and gave me back my humanity. I love you.'",
        image: "/images/stories/mafia-scene-7-confession.jpg",
        imageAlt: "Warm penthouse interior lamps illuminating an emotional, tender confession",
      },
      {
        id: "mr-s8",
        sceneNumber: 8,
        title: "The Person Behind the Legend",
        text:
          "Out on the terrace beneath the quiet city skyline, a vase of crimson roses caught the midnight breeze. The world below still whispered legends about Julian Vance, but up here, away from watchful eyes, he was simply the man who laughed at your jokes, wrapped you in his coat, and held your hand as if it were the only treasure that truly mattered.",
        image: "/images/stories/mafia-scene-roses.jpg",
        imageAlt: "A vase of crimson velvet roses on the private balcony terrace overlooking city lights",
      },
    ],
  },
  {
    id: "enemies-to-lovers",
    genre: "Enemies to Lovers",
    title: "I Hate Everyone. Unfortunately, I Notice You.",
    tagline: "Rivals, tension, and unexpected romance",
    synopsis:
      "A college rivalry turns into something neither character expected. Small acts of kindness, a rainy-day moment, and one meaningful misunderstanding slowly reveal feelings hidden behind their constant arguments.",
    coverImage: "/images/stories/enemies-lovers-cover.jpg",
    coverAlt: "Two university rivals sharing an umbrella in the rain outside historic collegiate arches",
    accentColor: "#0284c7", // sky-600 / teal
    themeGlow: "rgba(14, 165, 233, 0.35)",
    scenes: [
      {
        id: "el-s1",
        sceneNumber: 1,
        title: "The Most Annoying Person Alive",
        text:
          "Liam Thorne had been your academic rival since freshman year. He had smug brown eyes, messy curls, and a maddening habit of correcting the professor just five seconds after you raised your hand. You competed over top essay marks, debate podiums, and the last good booth in the campus library. If irritation had a face, it was Liam leaning back in his chair, smirking across the lecture hall.",
        image: "/images/stories/enemies-scene-1-lecture.jpg",
        imageAlt: "Historic university lecture hall with tiered wood seats and students",
      },
      {
        id: "el-s2",
        sceneNumber: 2,
        title: "Why Do You Remember That?",
        text:
          "During a tense debate preparation session, you reached into your bag for a mint and came up empty with a disappointed sigh. Without breaking eye contact with his laptop, Liam casually slid a packet of cinnamon mints across the wooden table. 'You only chew those when you're stressed before opening remarks,' he muttered. You stared at him, bewildered that he had ever noticed.",
        image: "/images/stories/enemies-scene-2-debate.jpg",
        imageAlt: "Debate preparation table with open reference books, notes, and fountain pen",
      },
      {
        id: "el-s3",
        sceneNumber: 3,
        title: "Forced to Work Together",
        text:
          "Professor Hayes delivered the cruelest blow of midterm season: you and Liam were assigned as co-leads for the annual humanities symposium. You braced for disaster, yet across endless evenings surrounded by towering library stacks, something unexpected happened. Your quick wit matched his sharp analysis beat for beat. Underneath the relentless teasing was a partner who understood your ambition better than anyone else.",
        image: "/images/stories/enemies-scene-3-stacks.jpg",
        imageAlt: "Towering historic collegiate library stacks during late night research",
      },
      {
        id: "el-s4",
        sceneNumber: 4,
        title: "The Rainy-Day Incident",
        text:
          "A torrential autumn storm trapped students under the campus archway. You had received disheartening news about a fellowship and stood hugging your damp backpack, fighting back tears. Suddenly, a transparent umbrella bloomed overhead. Liam fell into step beside you, not mocking or prodding for once. He gently took your heavy bag, tilted the umbrella so you stayed dry, and walked you across campus in comfortable silence.",
        image: "/images/stories/enemies-scene-rain.jpg",
        imageAlt: "Transparent umbrella on a wooden bench beside wet cobblestones and glowing lanterns",
      },
      {
        id: "el-s5",
        sceneNumber: 5,
        title: "The Detail Nobody Should Have Remembered",
        text:
          "The next morning, you found a hot oat-milk latte with honey sitting on your reserved study desk, beside a highlighted printout of a little-known scholarship grant. You had mentioned wanting that exact funding in a casual vent weeks ago. Tucked beneath the cup was a neat sticky note in Liam’s handwriting: 'Don't let them count you out. You're too stubborn to lose.'",
        image: "/images/stories/enemies-scene-5-latte.jpg",
        imageAlt: "Hot oat-milk latte with heart foam art on a study desk beside highlighted notes",
      },
      {
        id: "el-s6",
        sceneNumber: 6,
        title: "The Misunderstanding",
        text:
          "Victory arrived at the symposium, but joy shattered when you overheard Liam's friends congratulating him on 'securing the top grade by playing nice with the competition.' The words stung like ice. You packed your folders and avoided his calls for days, convinced his kindness had been calculated strategy. When Liam finally cornered you outside the library in the rain, his expression was shattered.",
        image: "/images/stories/enemies-scene-6-steps.jpg",
        imageAlt: "Historic collegiate library steps and plaza illuminated in the rainy night",
      },
      {
        id: "el-s7",
        sceneNumber: 7,
        title: "The Confession",
        text:
          "'Do you really think I spent all those nights memorizing your coffee order and walking three miles in the rain just for a grade?' Liam asked, his voice catching in his throat. The boy who always had an arrogant reply was trembling. 'I don't care about beating you. I haven't for a long time. I hate everyone here, but unfortunately... I can't stop noticing you.'",
        image: "/images/stories/enemies-scene-7-confession.jpg",
        imageAlt: "Liam and his rival standing close under the illuminated umbrella in the rain with intense emotion",
      },
      {
        id: "el-s8",
        sceneNumber: 8,
        title: "The Ending",
        text:
          "Under the glowing amber lamps of the wet quad, your laughter broke the tension. You pulled him by his scarf until his forehead rested against yours. 'You're still the most annoying person alive,' you whispered against his lips. His crooked grin returned, soft and genuinely happy. 'Good,' Liam replied, kissing you softly in the rain. 'Because I intend to annoy you for the rest of our lives.'",
        image: "/images/stories/enemies-scene-8-quad.jpg",
        imageAlt: "Autumn quad cobblestones under warm amber lantern glow reflecting in the rain",
      },
    ],
  },
];
