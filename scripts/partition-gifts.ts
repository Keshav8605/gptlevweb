import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const PROD_FILE = path.join(DATA_DIR, "relationship-database.json");
const db = JSON.parse(fs.readFileSync(PROD_FILE, "utf-8"));

// Real baseline gifts created before the test suites ran (before Nov 4, 2026 / timestamp 1793800000000)
// Or genuine couple gifts
const testKeywords = ["test", "e2e", "phase 6", "revoked", "sanctuary", "ordinary public", "alice's", "bob", "duplication target", "unowned legacy"];

const isTestGift = (g: any) => {
  if (g.id === "gift_world_demo") return false;

  const t = (g.title || "").toLowerCase();
  const s = (g.slug || "").toLowerCase();

  // Keyword match
  const keywordMatch = testKeywords.some((kw) => t.includes(kw) || s.includes(kw));

  // Timestamp check: test suite gifts have IDs starting with 17938... or later
  // Real partner gifts have IDs like gift_1792312304927_l7dz, gift_1792440811382_950o, etc. (1792... or 17931... / 17932...)
  const match = g.id.match(/^gift_(\d+)_/);
  const ts = match ? parseInt(match[1], 10) : 0;
  const isAfterFirstTestRun = ts >= 1793800000000;

  return keywordMatch || isAfterFirstTestRun;
};

const testGifts: any[] = [];
const prodGifts: any[] = [];

for (const g of db.gifts) {
  if (isTestGift(g)) {
    testGifts.push(g);
  } else {
    prodGifts.push(g);
  }
}

console.log("=== PARTITION SUMMARY ===");
console.log(`Total gifts before: ${db.gifts.length}`);
console.log(`Test-created gifts to move: ${testGifts.length}`);
console.log(`Remaining production gifts: ${prodGifts.length}`);

console.log("\n--- Remaining Production Gifts ---");
for (const g of prodGifts) {
  console.log(`- [${g.id}] (${g.status}) "${g.title}" | slug: ${g.slug}`);
}

console.log("\n--- Sample of Test-Created Gifts (first 10) ---");
for (const g of testGifts.slice(0, 10)) {
  console.log(`- [${g.id}] (${g.status}) "${g.title}" | slug: ${g.slug}`);
}

