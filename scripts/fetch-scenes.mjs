import fs from "node:fs";
import path from "node:path";

const scenes = [
  // Campus Romance
  {
    id: "campus-scene-2-ramen.jpg",
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-3-busstop.jpg",
    url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-4-party.jpg",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-5-sketchbook.jpg",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-6-pizza.jpg",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-7-confession.jpg",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "campus-scene-8-kitchen.jpg",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1280&q=80",
  },

  // Celebrity Romance
  {
    id: "celebrity-scene-1-stage.jpg",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-2-tailor.jpg",
    url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-3-diner.jpg",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-4-paparazzi.jpg",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-5-wardrobe.jpg",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-6-jacket.jpg",
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-7-arena.jpg",
    url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "celebrity-scene-8-rooftop.jpg",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1280&q=80",
  },

  // Supernatural Mystery
  {
    id: "supernatural-scene-1-clock.jpg",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-2-spirit.jpg",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-3-hydrangeas.jpg",
    url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-4-manor.jpg",
    url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-5-musicbox.jpg",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-6-solstice.jpg",
    url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-7-kiss.jpg",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80",
  },
  {
    id: "supernatural-scene-8-dawn.jpg",
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1280&q=80",
  },
];

const destDir = path.resolve("public/images/stories");

async function downloadAll() {
  console.log(`Starting download of ${scenes.length} scene images to ${destDir}...`);
  for (const item of scenes) {
    const destPath = path.join(destDir, item.id);
    console.log(`Fetching ${item.id}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`  Saved ${item.id} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  FAILED ${item.id}:`, err.message);
    }
  }
  console.log("Finished downloading scene images!");
}

downloadAll();
