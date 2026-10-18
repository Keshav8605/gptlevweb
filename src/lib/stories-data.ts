export interface StoryScene {
  id: string;
  sceneNumber: number;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
}

export type StoryId =
  | "mafia-romance"
  | "enemies-to-lovers"
  | "fantasy-romance"
  | "campus-romance"
  | "celebrity-romance"
  | "supernatural-mystery";

export interface Story {
  id: StoryId;
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
  {
    id: "fantasy-romance",
    genre: "Fantasy Romance",
    title: "The Prince Who Could Hear My Heart",
    tagline: "Magic, vulnerability, and a destiny neither of them expected",
    synopsis:
      "He could hear every heartbeat in the kingdom. Except his own, whenever she was near. When an ordinary woman's silence unravels his magical gift, an ancient secret binds their fates together.",
    coverImage: "/images/stories/fantasy-romance-cover.jpg",
    coverAlt: "An enchanted kingdom terrace under a moonlit sky with swirling violet stardust as a prince looks at his beloved",
    accentColor: "#8b5cf6", // violet-500
    themeGlow: "rgba(139, 92, 246, 0.35)",
    scenes: [
      {
        id: "fr-s1",
        sceneNumber: 1,
        title: "The Gift of the Resonance",
        text:
          "Prince Keith possessed the ancient hereditary gift of the Resonance. Standing high above Eldoria's glittering towers, he could hear the true emotion within every heartbeat in the realm—the shallow flutter of deceit, the heavy thud of greed, and the frantic tempo of fear. To the kingdom, he was an omniscient sovereign; to Keith, the world was a deafening roar of exhaustion.",
        image: "/images/stories/fantasy-scene-1-capital.jpg",
        imageAlt: "Prince Keith standing on a high marble balcony overlooking the moonlit fantasy capital",
      },
      {
        id: "fr-s2",
        sceneNumber: 2,
        title: "The Silent Glasshouse",
        text:
          "Seeking solace from the relentless chorus, Keith walked through the secluded glass conservatory one midnight. There, tending silver lunar lilies, stood Valerie. When Keith stepped near, he braced for the familiar rush of her inner thoughts. Instead, there was absolute stillness. Her chest rose and fell, yet her heart was completely silent to his magic, like quiet snowfall on quiet water.",
        image: "/images/stories/fantasy-scene-2-conservatory.jpg",
        imageAlt: "Valerie tending glowing lunar lilies beneath the glass conservatory arches",
      },
      {
        id: "fr-s3",
        sceneNumber: 3,
        title: "Glass and Starlight",
        text:
          "Drawn by the first true peace he had ever known, Keith returned each evening without his royal mantle. Valerie treated him like any ordinary gardener, scolding him when he stepped on delicate moss and teaching him to prune crystal stems. When their fingertips brushed over a blooming glass orchid, a sudden harmonic chime echoed between them, warm and luminous as liquid starlight.",
        image: "/images/stories/fantasy-scene-3-starlight.jpg",
        imageAlt: "Intimate touch between hands amidst glowing magical blossoms",
      },
      {
        id: "fr-s4",
        sceneNumber: 4,
        title: "The Council's Demand",
        text:
          "Duty soon intruded upon the quiet conservatory. At the solstice assembly, the High Council demanded Keith select a noble bride to fortify the realm's fading magical barrier. Every eligible court lady stepped forward, their heartbeats screaming with ambition and calculating pride. Keith sat on his gilded throne in suffocating silence, longing only for the girl whose quiet soul gave him peace.",
        image: "/images/stories/fantasy-scene-4-council.jpg",
        imageAlt: "High Council assembly with stained glass and courtiers in the royal hall",
      },
      {
        id: "fr-s5",
        sceneNumber: 5,
        title: "The Forbidden Chronicle",
        text:
          "Desperate for answers, Keith snuck into the kingdom's forbidden archives beneath the palace. In an illuminated chronicle sealed with celestial gold, he found the truth: the royal gift deafened only in the presence of one’s destined soulmate, whose spirit resonated on the exact same mystical frequency. Valerie was not an anomaly—she was the realm's counterpart to his heart.",
        image: "/images/stories/fantasy-scene-5-archives.jpg",
        imageAlt: "Prince Keith studying glowing ancient scrolls in the forbidden library archives",
      },
      {
        id: "fr-s6",
        sceneNumber: 6,
        title: "The Celestial Eclipse",
        text:
          "The night of the Celestial Eclipse arrived with sudden violently shifting winds, fracturing Eldoria's protective ward. Keith raced to the ramparts, terrified Valerie might flee or come to harm. He found her standing against the storm, looking back at him without a shred of fear. 'You don't have to carry this kingdom alone,' she shouted over the howling gale. 'Let me stand with you.'",
        image: "/images/stories/fantasy-scene-6-eclipse.jpg",
        imageAlt: "Valerie and Keith standing together against the cosmic eclipse wind on the terrace",
      },
      {
        id: "fr-s7",
        sceneNumber: 7,
        title: "The Symphony of Truth",
        text:
          "Valerie stepped forward and placed Keith's trembling hand gently against her chest. 'You couldn't hear my heart, Keith, because it stopped beating for itself the night you walked into the glasshouse—it only beats in rhythm with yours.' As their lips met, a brilliant burst of silver and violet harmony surged between them, restoring the kingdom's barrier with blinding, everlasting radiance.",
        image: "/images/stories/fantasy-scene-7-harmony.jpg",
        imageAlt: "Blinding silver and violet harmonic magic erupting from their romantic embrace",
      },
      {
        id: "fr-s8",
        sceneNumber: 8,
        title: "A Melody Beyond Words",
        text:
          "At daybreak, the storm cleared to reveal a pastel dawn over the sparkling city spires. Keith stood on the terrace with Valerie, her hand clasped firmly in his. The court's whispers still echoed below, but Keith no longer cared about the thousand fleeting pulses of the world. He had found the only melody he ever wanted to hear for the rest of his life.",
        image: "/images/stories/fantasy-scene-8-dawn.jpg",
        imageAlt: "Keith and Valerie hand in hand watching the peaceful pastel sunrise over the magical city",
      },
    ],
  },
  {
    id: "campus-romance",
    genre: "Campus Romance",
    title: "My Roommate Is My Almost",
    tagline: "Late-night conversations, stolen hoodies, and feelings left unsaid",
    synopsis:
      "They shared a room, borrowed each other's hoodies, argued about the smallest things, and somehow never talked about the almost-kiss that changed everything. Now, silence isn't safe anymore.",
    coverImage: "/images/stories/campus-romance-cover.jpg",
    coverAlt: "Two college students sitting by a dorm window at golden sunset with warm coffee and notebooks",
    accentColor: "#d97706", // amber-600
    themeGlow: "rgba(217, 119, 6, 0.35)",
    scenes: [
      {
        id: "cr-s1",
        sceneNumber: 1,
        title: "The Oversized Grey Hoodie",
        text:
          "Living with Noah was supposed to be strictly practical. Split rent on a drafty off-campus apartment, take turns scrubbing the tiny stove, and never touch each other’s groceries. But within three weeks, his oversized heather-grey college hoodie had permanently migrated to your shoulders, smelling like cedar and freshly roasted coffee. 'It just fits better,' you told him. Noah only chuckled, his dark eyes lingering a beat too long.",
        image: "/images/stories/campus-scene-1-hoodie.jpg",
        imageAlt: "Noah and his roommate laughing amid moving boxes and books in the sunlit apartment",
      },
      {
        id: "cr-s2",
        sceneNumber: 2,
        title: "2:00 AM Instant Noodles",
        text:
          "Midterm week turned the apartment into an obstacle course of blueprints and annotated essays. At two in the morning, when your eyes burned from reading, Noah would wordlessly slide a steaming bowl of spicy ramen onto the floor between your crossed legs. You traded cracked jokes and childhood secrets while the radiator clanked, whispering in the quiet dark as if daylight would shatter the comfort you built together.",
        image: "/images/stories/campus-scene-2-ramen.jpg",
        imageAlt: "Steaming ramen bowl surrounded by study notebooks and warm lamplight",
      },
      {
        id: "cr-s3",
        sceneNumber: 3,
        title: "The Rainy Bus Stop Almost",
        text:
          "Then came the October deluge that flooded the quad. Stranded under the leaky glass bus shelter, shivering in damp jeans, Noah pulled his heavy jacket over both of your heads. In that tiny enclosed world, your noses bumped and your breath mingled into warm mist. His hand shifted to your waist, trembling slightly. You were two inches from kissing when the screech of shuttle brakes broke the spell.",
        image: "/images/stories/campus-scene-3-busstop.jpg",
        imageAlt: "Rain streaming down glass shelter at night with glowing street lamps",
      },
      {
        id: "cr-s4",
        sceneNumber: 4,
        title: "The Friday Night Party",
        text:
          "Neither of you spoke of the bus stop. Instead, you drifted into guarded silence. At a crowded engineering house party the next Friday, you watched from across the living room as a girl from his studio leaned close to laugh at Noah's jokes. A sharp, stinging ache hit your throat. You set your red plastic cup down and slipped out into the cool night, unable to watch anymore.",
        image: "/images/stories/campus-scene-4-party.jpg",
        imageAlt: "Crowded university party with warm string lights and bokeh",
      },
      {
        id: "cr-s5",
        sceneNumber: 5,
        title: "The Forgotten Sketchbook",
        text:
          "Back at the empty apartment, looking for a highlighter on Noah's drafting desk, your elbow bumped his spiral sketchbook onto the floor. It fell open to a page dated weeks ago: a detailed charcoal sketch of you curled on the sofa, asleep over open notes. Flipping backwards, your breath caught. Dozens of pages were filled with your smile, your messy bun, and you wearing his favorite oversized sweater.",
        image: "/images/stories/campus-scene-5-sketchbook.jpg",
        imageAlt: "Architectural sketchpad and charcoal pencils beside study books",
      },
      {
        id: "cr-s6",
        sceneNumber: 6,
        title: "Cold Pizza and Truth",
        text:
          "The front door swung open. Noah stood there, breathless and soaked from running all six blocks from the party. He stopped dead when he saw the open sketchbook in your trembling hands. 'Maya, let me explain,' he began, panic flashing across his features. 'I'm tired of pretending,' you interrupted, your voice cracking. 'I'm tired of being your almost, Noah. Tell me what this is.'",
        image: "/images/stories/campus-scene-6-pizza.jpg",
        imageAlt: "Apartment living room coffee table with pizza box under warm lamplight",
      },
      {
        id: "cr-s7",
        sceneNumber: 7,
        title: "No More Almosts",
        text:
          "Noah crossed the living room in two strides, cupping your face with hands still cold from the autumn rain. 'You were never an almost to me,' he said fiercely, his eyes shining with unshed tears. 'I was just terrified that if I crossed the line, I'd lose my best friend.' When his mouth found yours, every unspoken late-night longing dissolved into the sweetest, most breathtaking reality you had ever known.",
        image: "/images/stories/campus-scene-7-confession.jpg",
        imageAlt: "Couple standing close in romantic silhouette under warm ambient room lighting",
      },
      {
        id: "cr-s8",
        sceneNumber: 8,
        title: "Ours",
        text:
          "The next morning, honey-colored sunlight poured across the cluttered kitchen counter. You sat on the barstool sipping hot coffee, wearing his grey hoodie—not borrowed anymore, but yours. Noah flipped chocolate-chip pancakes at the stove, turning around to press a soft kiss to your forehead before sliding a plate over with a broad, easy grin. The almost was over; your real story had finally begun.",
        image: "/images/stories/campus-scene-8-kitchen.jpg",
        imageAlt: "Warm breakfast table in bright morning sunlight in the cozy kitchen",
      },
    ],
  },
  {
    id: "celebrity-romance",
    genre: "Celebrity Romance",
    title: "Falling for the Boy on Every Billboard",
    tagline: "Millions knew his face. She wanted to know the person behind it",
    synopsis:
      "He was the global pop star on every screen, exhausted by constant perfection. She was the backstage costume tailor who treated him like an ordinary person. But fame never stays quiet for long.",
    coverImage: "/images/stories/celebrity-romance-cover.jpg",
    coverAlt: "A pop superstar backstage in a dark jacket smiling intimately at a young tailor holding shears amidst concert lights",
    accentColor: "#c026d3", // fuchsia-600
    themeGlow: "rgba(192, 38, 211, 0.35)",
    scenes: [
      {
        id: "cbr-s1",
        sceneNumber: 1,
        title: "The Billboard Prince",
        text:
          "Leo Vance was everywhere. His face commanded thirty-foot LED billboards in Times Square, his singles topped every global playlist, and screaming stadiums chanted his lyrics until the floorboards rattled. Yet twenty minutes before curtain call in his private dressing room, Leo sat slouched in a plush leather armchair, staring blankly at the polished mirror, completely starved of real human connection in an empire of manufactured adoration.",
        image: "/images/stories/celebrity-scene-1-stage.jpg",
        imageAlt: "Massive concert arena stage with blinding spotlights and roaring crowd silhouette",
      },
      {
        id: "cbr-s2",
        sceneNumber: 2,
        title: "Shears and Sincerity",
        text:
          "You entered with a pincushion on your wrist and silver tailoring shears in hand to repair a split seam on his sequined tour jacket. While publicists fussed and bodyguards hovered, you knelt at his side and told him bluntly to stop slouching or the embroidery would rip. Leo blinked in sheer astonishment, then let out the first genuine, hearty laugh anyone had heard from him in six months.",
        image: "/images/stories/celebrity-scene-2-tailor.jpg",
        imageAlt: "Backstage costume wardrobe racks and tailoring shears in wardrobe room",
      },
      {
        id: "cbr-s3",
        sceneNumber: 3,
        title: "Midnight at the Neon Diner",
        text:
          "Three cities later, Leo tapped on your hotel door wearing an oversized baseball cap and worn sneakers. You snuck past paparazzi to a fluorescent-lit 24-hour diner on the edge of town. Over lukewarm cherry pie and black coffee, the world's biggest pop icon peeled away his persona, talking passionately about the quiet grandmother who taught him piano and the paralyzing loneliness of waking up in empty luxury suites.",
        image: "/images/stories/celebrity-scene-3-diner.jpg",
        imageAlt: "Retro 24-hour city diner booth glowing under neon lights at night",
      },
      {
        id: "cbr-s4",
        sceneNumber: 4,
        title: "The Flash of Cameras",
        text:
          "Pushing open the diner back door into the drizzling alleyway, camera shutters suddenly exploded like lightning. Paparazzi shouted invasive questions, lunging forward with zoom lenses. Leo reacted on pure instinct, pulling his jacket over your head and shielding your body with his own as he guided you safely into his tinted SUV. By dawn, blurry tabloid headlines screamed about his mystery girl, turning your private sanctuary into a circus.",
        image: "/images/stories/celebrity-scene-4-paparazzi.jpg",
        imageAlt: "Wet city street at night reflecting car headlights and camera flashbulbs",
      },
      {
        id: "cbr-s5",
        sceneNumber: 5,
        title: "The PR Ultimatum",
        text:
          "Backstage at the arena, Leo's management team was in full crisis mode. They demanded a public statement branding you merely a careless junior wardrobe assistant to protect his marketable bachelor image. Seeing the agonizing pressure in Leo's strained eyes, you made the decision for him. You packed your sewing kit and quieted your heart, unwilling to let your love drag down his dreams.",
        image: "/images/stories/celebrity-scene-5-wardrobe.jpg",
        imageAlt: "Backstage vanity mirror with glowing lightbulbs and quiet dressing room",
      },
      {
        id: "cbr-s6",
        sceneNumber: 6,
        title: "The Handwritten Note",
        text:
          "Ten minutes before taking the stage for fifty thousand screaming fans, Leo discovered his finished custom jacket hanging on the wardrobe rail. Tucked inside the breast pocket where his heart beat was a tiny handwritten note in your handwriting: 'You're more than their billboard, Leo. Shine bright tonight, just as yourself.' Reading those words, his world clicked into sudden, unshakeable clarity.",
        image: "/images/stories/celebrity-scene-6-jacket.jpg",
        imageAlt: "Custom leather tour jacket hanging on a wardrobe rail with soft lighting",
      },
      {
        id: "cbr-s7",
        sceneNumber: 7,
        title: "Fifty Thousand Witnesses",
        text:
          "Under the blinding arena spotlights during the acoustic encore, Leo stepped off the center riser and walked straight down the wings into the backstage shadows. Before fifty thousand stunned fans watching the stadium screens, he found you standing by the exit. Dropping his microphone to his side, he gathered you into his arms and kissed you fiercely, choosing true love over safe applause for the entire world to see.",
        image: "/images/stories/celebrity-scene-7-arena.jpg",
        imageAlt: "Singer under arena spotlight on catwalk with cheering crowd in backdrop",
      },
      {
        id: "cbr-s8",
        sceneNumber: 8,
        title: "Beyond the Spotlight",
        text:
          "Later that night on a secluded rooftop high above the glittering city skyline, the world felt peaceful and still. Leo leaned his head against your shoulder, softly picking chords on an old acoustic guitar while the summer breeze tousled your hair. The posters on the skyscrapers below would eventually fade, but the boy behind the billboards was yours, finally home where he belonged.",
        image: "/images/stories/celebrity-scene-8-rooftop.jpg",
        imageAlt: "City skyline view from a high quiet rooftop terrace under starry night sky",
      },
    ],
  },
  {
    id: "supernatural-mystery",
    genre: "Supernatural Mystery",
    title: "The Ghost Who Fell in Love With Me",
    tagline: "He appeared every night at 11:11. Every night, he remembered a little less",
    synopsis:
      "Every night at 11:11, an ethereal spirit appears in an overgrown Victorian conservatory, fading a little more each dawn. Helping him uncover the truth behind his death leads to a heart-wrenching secret.",
    coverImage: "/images/stories/supernatural-mystery-cover.jpg",
    coverAlt: "An ethereal translucent ghostly young man reaching toward a young woman holding a silver pocket watch in a moonlit conservatory",
    accentColor: "#06b6d4", // cyan-500
    themeGlow: "rgba(6, 182, 212, 0.35)",
    scenes: [
      {
        id: "sn-s1",
        sceneNumber: 1,
        title: "11:11 in the Conservatory",
        text:
          "As an archivist cataloging the crumbling Blackwood Manor, you spent your evenings in the overgrown glass conservatory. At exactly 11:11 each night, the temperature plummeted, frosting the fern leaves. From the swirling blue mist emerged Julian—translucent, dressed in a 1920s waistcoat, his silver pocket watch stopped permanently at eleven past eleven. He didn’t haunt; he simply stood beneath the moon, watching you with fathomless sorrow.",
        image: "/images/stories/supernatural-scene-1-clock.jpg",
        imageAlt: "Antique silver pocket watch resting on dark wood frozen at 11:11",
      },
      {
        id: "sn-s2",
        sceneNumber: 2,
        title: "The Fading Gentleman",
        text:
          "He remembered his name and the scent of night rain, but each dawn erased another fragment of who he had been. 'Help me remember why I remained,' he whispered, his voice like rustling autumn leaves. 'Before I dissolve into nothingness.' You set down your cataloging ledgers and agreed, captivated by the gentleman spirit whose touch left tiny sparks of spectral warmth against your skin.",
        image: "/images/stories/supernatural-scene-2-spirit.jpg",
        imageAlt: "Misty Victorian glass conservatory illuminated by cool ethereal moonbeams",
      },
      {
        id: "sn-s3",
        sceneNumber: 3,
        title: "The Language of Hydrangeas",
        text:
          "Night after night, you brought estate letters and historical records into the glasshouse. When you mentioned the manor's legendary blue hydrangeas, Julian's translucent eyes widened with poignant recognition. As he reached out toward a dormant plant, spectral blue blossoms unfurled in a cascade of eerie, glowing petals. For the first time in a century, Julian smiled, leaning close enough that you felt the ghost of his breath.",
        image: "/images/stories/supernatural-scene-3-hydrangeas.jpg",
        imageAlt: "Lush blooming blue hydrangeas glowing in the dark moonlit garden",
      },
      {
        id: "sn-s4",
        sceneNumber: 4,
        title: "The Stolen Inheritance",
        text:
          "In the dusty county library archives, you uncovered the dark secret buried in 1924. Julian had not died of illness as official family records claimed; his greedy cousins had poisoned his wine to seize the estate and sealed his true will inside the manor walls. Julian listened in the shadowy conservatory, phantom grief trembling through his luminous form as the injustice of his past was finally laid bare.",
        image: "/images/stories/supernatural-scene-4-manor.jpg",
        imageAlt: "Historic gothic Victorian manor estate enveloped in twilight mist",
      },
      {
        id: "sn-s5",
        sceneNumber: 5,
        title: "The Secret Compartment",
        text:
          "Following Julian's recovered memories, you prised loose a hollow marble slab beneath the conservatory fountain. Inside lay a carved rosewood box holding Julian’s authentic deed and a miniature oval locket portrait. When you opened the gold clasp, your heart stopped. The girl painted in 1924 wearing a silver chain was your identical double. Julian hadn’t lingered to haunt his murderers—he had waited a century for your soul to return.",
        image: "/images/stories/supernatural-scene-5-musicbox.jpg",
        imageAlt: "Antique carved wooden box and vintage handwritten letter with vintage key",
      },
      {
        id: "sn-s6",
        sceneNumber: 6,
        title: "The Centennial Midnight",
        text:
          "It was the hundredth anniversary of his passing. Julian’s form flickered violently like a dying candle, the edges of his hands dissolving into starry particles. 'My time has run out, my love,' he said softly, a single spectral tear tracing his jaw. 'I kept my promise to find you again, but now the veil is pulling me back into the dark.'",
        image: "/images/stories/supernatural-scene-6-solstice.jpg",
        imageAlt: "Misty garden under midnight starry sky with ancient stone lanterns glowing",
      },
      {
        id: "sn-s7",
        sceneNumber: 7,
        title: "The Touch Across Time",
        text:
          "Refusing to let the void claim him, you pressed the silver pocket watch between your palms and threw your arms around Julian's shimmering neck. 'I remember you now, Julian,' you sobbed. Defying the laws of death, your living warmth solidified his form. As you kissed him beneath the glass dome, the clock hands spun forward, shattering the century-old curse in a brilliant cascade of golden celestial sparks.",
        image: "/images/stories/supernatural-scene-7-kiss.jpg",
        imageAlt: "Golden celestial light sparks swirling in the dark conservatory during climactic embrace",
      },
      {
        id: "sn-s8",
        sceneNumber: 8,
        title: "Morning in the Glasshouse",
        text:
          "Warm golden sunlight flooded the conservatory as morning birds sang in the revived gardens. On the iron bench rested the pocket watch, now ticking in steady rhythm with the living world. Standing beside you in the morning warmth, solid and breathing with life, Julian interlaced his fingers with yours, pressing a fresh blue hydrangea into your hand. The mystery was solved; love had conquered time itself.",
        image: "/images/stories/supernatural-scene-8-dawn.jpg",
        imageAlt: "Warm golden morning sunlight streaming through the conservatory glass over lush greenery",
      },
    ],
  },
];
