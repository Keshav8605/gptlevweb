import assert from "node:assert";
import { STORIES } from "../src/lib/stories-data.ts";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

console.log("==========================================================");
console.log("  STORY UNIVERSE 6-STORY VERIFICATION SUITE");
console.log(`  Target: ${BASE_URL}`);
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log("► [Suite A] Delulu Mode Entry Message Verification");

  await itAsync("Home page loads with status 200", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
  });

  await itAsync("Home page contains Delulu promo headline 'One click. Endless worlds.'", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert.ok(
      html.includes("One click.") && html.includes("Endless worlds."),
      "Expected Delulu section to include 'One click.' and 'Endless worlds.'"
    );
  });

  await itAsync("Home page contains supporting line 'Stories made for your kind of delulu.'", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert.ok(
      html.includes("Stories made for your kind of delulu."),
      "Expected Delulu section to include supporting line"
    );
  });

  await itAsync("Home page contains CTA 'Explore Other Worlds →' linking to /story-universe", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert.ok(
      html.includes("Explore Other Worlds") && html.includes("/story-universe"),
      "Expected CTA button linking to /story-universe"
    );
  });

  console.log("\n► [Suite B] Story Universe Route & Gallery Verification");

  await itAsync("/story-universe route loads with status 200", async () => {
    const res = await fetch(`${BASE_URL}/story-universe`);
    assert.strictEqual(res.status, 200);
  });

  await itAsync("Story Universe page contains 'Story Universe' header", async () => {
    const res = await fetch(`${BASE_URL}/story-universe`);
    const html = await res.text();
    assert.ok(html.includes("Story Universe"), "Expected title Story Universe");
  });

  await itAsync("Story Universe gallery contains updated return button '← Okay, Enough Delulu for Today 😭💗'", async () => {
    const res = await fetch(`${BASE_URL}/story-universe`);
    const html = await res.text();
    assert.ok(
      html.includes("Okay, Enough Delulu for Today 😭💗"),
      "Expected 'Okay, Enough Delulu for Today 😭💗' return button on gallery"
    );
  });

  await itAsync("Story reading view contains updated return button '← Take Me Back to Reality 😂💕'", async () => {
    const res = await fetch(`${BASE_URL}/story-universe?story=mafia-romance&scene=1`);
    const html = await res.text();
    assert.ok(
      html.includes("Take Me Back to Reality 😂💕"),
      "Expected 'Take Me Back to Reality 😂💕' return button inside story view"
    );
  });

  const expectedStories = [
    { id: "mafia-romance", titleMatch: "The City" },
    { id: "enemies-to-lovers", titleMatch: "I Hate Everyone" },
    { id: "fantasy-romance", titleMatch: "The Prince Who Could Hear My Heart" },
    { id: "campus-romance", titleMatch: "My Roommate Is My Almost" },
    { id: "celebrity-romance", titleMatch: "Falling for the Boy on Every Billboard" },
    { id: "supernatural-mystery", titleMatch: "The Ghost Who Fell in Love With Me" },
  ];

  for (const exp of expectedStories) {
    await itAsync(`Story Universe gallery displays story: ${exp.id}`, async () => {
      const res = await fetch(`${BASE_URL}/story-universe`);
      const html = await res.text();
      assert.ok(
        html.includes(exp.titleMatch) || html.includes(encodeURIComponent(exp.id)) || html.includes(`btn-open-${exp.id}`),
        `Expected gallery to display ${exp.id}`
      );
    });

    await itAsync(`Story reading view loads for: ${exp.id} at Scene 1`, async () => {
      const res = await fetch(`${BASE_URL}/story-universe?story=${exp.id}&scene=1`);
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      const cleanHtml = html.replace(/<!-- -->/g, "");
      assert.ok(cleanHtml.includes("Scene 1 of 8"), `Expected 'Scene 1 of 8' in ${exp.id}`);
    });
  }

  console.log("\n► [Suite C] Static Story Data Integrity & Word Counts");

  it("Story collection contains exactly six stories", () => {
    assert.strictEqual(STORIES.length, 6, `Expected exactly 6 stories, found ${STORIES.length}`);
  });

  for (const s of STORIES) {
    it(`Story '${s.id}' (${s.genre}) has exactly 8 scenes`, () => {
      assert.strictEqual(s.scenes.length, 8, `Story ${s.id} does not have 8 scenes`);
    });

    it(`Story '${s.id}' total word count is within target 400–550 words`, () => {
      const totalWords = s.scenes.reduce(
        (acc, scene) => acc + scene.text.trim().split(/\s+/).length,
        0
      );
      console.log(`    ('${s.title}' word count: ${totalWords} words)`);
      assert.ok(
        totalWords >= 400 && totalWords <= 550,
        `Word count ${totalWords} for '${s.id}' out of bounds (expected 400-550)`
      );
    });
  }

  it("Stories do not contain placeholder or undefined tokens", () => {
    for (const s of STORIES) {
      assert.ok(!s.title.includes("undefined"), `Title of ${s.id} has undefined`);
      assert.ok(!s.synopsis.includes("undefined"), `Synopsis of ${s.id} has undefined`);
      for (const scene of s.scenes) {
        assert.ok(!scene.text.includes("undefined"), `Scene ${scene.id} text has undefined`);
        assert.ok(!scene.text.includes("[Name]"), `Scene ${scene.id} text has [Name] placeholder`);
        assert.ok(!scene.title.includes("undefined"), `Scene ${scene.id} title has undefined`);
        assert.ok(scene.text.length > 50, `Scene ${scene.id} text is too short`);
      }
    }
  });

  it("Every scene across all six stories has a 100% unique illustration (48 distinct scene images)", () => {
    const allSceneImages = STORIES.flatMap((s) => s.scenes.map((sc) => sc.image));
    assert.strictEqual(allSceneImages.length, 48, `Expected 48 total scene images, found ${allSceneImages.length}`);

    const uniqueSceneImages = new Set(allSceneImages);
    assert.strictEqual(
      uniqueSceneImages.size,
      48,
      `Expected 48 unique scene images, but got ${uniqueSceneImages.size}`
    );

    // Verify covers are not reused as scene images
    const covers = STORIES.map((s) => s.coverImage);
    assert.strictEqual(new Set(covers).size, 6, "Expected 6 unique covers");
    for (const cover of covers) {
      assert.ok(
        !uniqueSceneImages.has(cover),
        `Cover image ${cover} must not be reused as a scene image!`
      );
    }

    // Verify gallery backdrop is not reused in any scene
    assert.ok(
      !uniqueSceneImages.has("/images/stories/gallery-backdrop.jpg"),
      "Gallery backdrop must not be reused as a scene image!"
    );
  });

  console.log("\n► [Suite D] Local Static Asset Availability");

  for (const s of STORIES) {
    await itAsync(`Cover image for '${s.id}' is accessible (HTTP 200)`, async () => {
      const res = await fetch(`${BASE_URL}${s.coverImage}`);
      assert.strictEqual(res.status, 200, `Cover ${s.coverImage} returned status ${res.status}`);
    });
  }

  await itAsync("Gallery backdrop image is accessible (HTTP 200)", async () => {
    const res = await fetch(`${BASE_URL}/images/stories/gallery-backdrop.jpg`);
    assert.strictEqual(res.status, 200);
  });

  for (const s of STORIES) {
    for (const scene of s.scenes) {
      await itAsync(`Scene image for ${s.id} - ${scene.id} is accessible (HTTP 200)`, async () => {
        const res = await fetch(`${BASE_URL}${scene.image}`);
        assert.strictEqual(res.status, 200, `Asset ${scene.image} failed to load (HTTP ${res.status})`);
      });
    }
  }

  console.log("\n==========================================================");
  console.log(`  VERIFICATION FINISHED: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
