import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SOURCE_FILE = path.join(DATA_DIR, "relationship-database.backup-pre-split-1794039375993.json");
const PROD_FILE = path.join(DATA_DIR, "relationship-database.json");
const TEST_FILE = path.join(DATA_DIR, "test-database.json");

let rawSource = fs.readFileSync(SOURCE_FILE, "utf-8");
if (rawSource.charCodeAt(0) === 0xfeff) rawSource = rawSource.slice(1);
const fullDb = JSON.parse(rawSource);
const totalBefore = fullDb.gifts.length;

const testKeywords = ["test", "e2e", "phase 6", "revoked", "sanctuary", "ordinary public", "alice's", "bob", "duplication target", "unowned legacy"];

const isTestGift = (g: any) => {
  if (g.id === "gift_world_demo") return false;

  const t = (g.title || "").toLowerCase();
  const s = (g.slug || "").toLowerCase();

  const keywordMatch = testKeywords.some((kw) => t.includes(kw) || s.includes(kw));
  const match = g.id.match(/^gift_(\d+)_/);
  const ts = match ? parseInt(match[1], 10) : 0;
  const isAfterFirstTestRun = ts >= 1793800000000;

  return keywordMatch || isAfterFirstTestRun;
};

const prodGifts: any[] = [];
const testGifts: any[] = [];

for (const g of fullDb.gifts) {
  if (isTestGift(g)) {
    testGifts.push(g);
  } else {
    prodGifts.push(g);
  }
}

// Ensure demo gift is in test database so test suites testing demo gift function properly
const demoGift = fullDb.gifts.find((g: any) => g.id === "gift_world_demo");
const testGiftsWithDemo = demoGift && !testGifts.some((g) => g.id === "gift_world_demo")
  ? [demoGift, ...testGifts]
  : testGifts;

// Build test database
const testDb = {
  ...fullDb,
  gifts: testGiftsWithDemo,
};

// Build production database
const prodDb = {
  ...fullDb,
  gifts: prodGifts,
};

// Write files
fs.writeFileSync(TEST_FILE, JSON.stringify(testDb, null, 2), "utf-8");
fs.writeFileSync(PROD_FILE, JSON.stringify(prodDb, null, 2), "utf-8");

console.log("\n=== DATABASE PARTITION RESULTS ===");
console.log(`Gifts count in relationship-database.json BEFORE: ${totalBefore}`);
console.log(`Gifts count in relationship-database.json AFTER:  ${prodDb.gifts.length}`);
console.log(`Gifts count in test-database.json:              ${testDb.gifts.length}`);
console.log(`Test gifts moved:                               ${testGifts.length}`);

