import assert from "node:assert";
import { STORIES } from "../src/lib/stories-data.ts";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

console.log("==========================================================");
console.log("  STORY UNIVERSE & DELULU REFRESH VERIFICATION SUITE");
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

  await itAsync("Story Universe contains Story 1: 'The City&#x27;s Most Feared Man Has One Weakness.'", async () => {
    const res = await fetch(`${BASE_URL}/story-universe`);
    const html = await res.text();
    assert.ok(
      html.includes("The City&#x27;s Most Feared Man Has One Weakness") ||
      html.includes("The City's Most Feared Man Has One Weakness"),
      "Expected Story 1 title"
    );
  });

  await itAsync("Story Universe contains Story 2: 'I Hate Everyone. Unfortunately, I Notice You.'", async () => {
    const res = await fetch(`${BASE_URL}/story-universe`);
    const html = await res.text();
    assert.ok(
      html.includes("I Hate Everyone. Unfortunately, I Notice You."),
      "Expected Story 2 title"
    );
  });

  console.log("\n► [Suite C] Static Story Data Integrity & Word Counts");

  it("Story collection contains exactly two stories", () => {
    assert.strictEqual(STORIES.length, 2);
  });

  it("Story 1 is Mafia Romance with 8 scenes", () => {
    const s1 = STORIES.find((s) => s.id === "mafia-romance");
    assert.ok(s1, "Mafia Romance story not found");
    assert.strictEqual(s1.genre, "Mafia Romance");
    assert.strictEqual(s1.scenes.length, 8);
  });

  it("Story 1 total word count is within target 400–550 words", () => {
    const s1 = STORIES.find((s) => s.id === "mafia-romance");
    const totalWords = s1.scenes.reduce((acc, scene) => acc + scene.text.trim().split(/\s+/).length, 0);
    console.log(`    (Story 1 word count: ${totalWords} words)`);
    assert.ok(totalWords >= 400 && totalWords <= 550, `Word count ${totalWords} out of bounds`);
  });

  it("Story 2 is Enemies to Lovers with 8 scenes", () => {
    const s2 = STORIES.find((s) => s.id === "enemies-to-lovers");
    assert.ok(s2, "Enemies to Lovers story not found");
    assert.strictEqual(s2.genre, "Enemies to Lovers");
    assert.strictEqual(s2.scenes.length, 8);
  });

  it("Story 2 total word count is within target 400–550 words", () => {
    const s2 = STORIES.find((s) => s.id === "enemies-to-lovers");
    const totalWords = s2.scenes.reduce((acc, scene) => acc + scene.text.trim().split(/\s+/).length, 0);
    console.log(`    (Story 2 word count: ${totalWords} words)`);
    assert.ok(totalWords >= 400 && totalWords <= 550, `Word count ${totalWords} out of bounds`);
  });

  it("Stories do not contain placeholder or undefined tokens", () => {
    for (const s of STORIES) {
      assert.ok(!s.title.includes("undefined"), "Title has undefined");
      assert.ok(!s.synopsis.includes("undefined"), "Synopsis has undefined");
      for (const scene of s.scenes) {
        assert.ok(!scene.text.includes("undefined"), `Scene ${scene.id} has undefined`);
        assert.ok(!scene.text.includes("[Name]"), `Scene ${scene.id} has [Name] placeholder`);
        assert.ok(!scene.title.includes("undefined"), `Scene ${scene.id} title has undefined`);
      }
    }
  });

  it("Every scene across both stories has a 100% unique illustration (16 distinct scene images)", () => {
    const allSceneImages = STORIES.flatMap((s) => s.scenes.map((sc) => sc.image));
    assert.strictEqual(allSceneImages.length, 16, "Expected 16 total scene images");

    const uniqueSceneImages = new Set(allSceneImages);
    assert.strictEqual(
      uniqueSceneImages.size,
      16,
      `Expected 16 unique scene images, but got ${uniqueSceneImages.size}`
    );

    // Verify neither cover is reused in any scene
    const covers = STORIES.map((s) => s.coverImage);
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

  await itAsync("Cover image for Mafia Romance is accessible (HTTP 200)", async () => {
    const res = await fetch(`${BASE_URL}/images/stories/mafia-romance-cover.jpg`);
    assert.strictEqual(res.status, 200);
  });

  await itAsync("Cover image for Enemies to Lovers is accessible (HTTP 200)", async () => {
    const res = await fetch(`${BASE_URL}/images/stories/enemies-lovers-cover.jpg`);
    assert.strictEqual(res.status, 200);
  });

  await itAsync("Gallery backdrop image is accessible (HTTP 200)", async () => {
    const res = await fetch(`${BASE_URL}/images/stories/gallery-backdrop.jpg`);
    assert.strictEqual(res.status, 200);
  });

  for (const s of STORIES) {
    for (const scene of s.scenes) {
      await itAsync(`Scene image for ${scene.id} is accessible (HTTP 200)`, async () => {
        const res = await fetch(`${BASE_URL}${scene.image}`);
        assert.strictEqual(res.status, 200, `Asset ${scene.image} failed to load`);
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
