import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

console.log("Total gifts in database:", db.gifts.length);

const testTitleKeywords = ["test", "e2e", "phase 6", "revoked", "sanctuary", "ordinary public published gift", "draft with revoked"];

function isTestGift(g: any): boolean {
  if (g.id === "gift_world_demo") return false;

  const titleLower = (g.title || "").toLowerCase();
  const slugLower = (g.slug || "").toLowerCase();

  for (const kw of ["test", "e2e", "phase 6", "revoked", "sanctuary", "ordinary public", "duplication target"]) {
    if (titleLower.includes(kw) || slugLower.includes(kw)) {
      return true;
    }
  }

  // Also check if ID starts with gift_17938... or gift_17939... or gift_17940... from test suites
  // Let's see all unique titles among the gifts
  return false;
}

const testGifts: any[] = [];
const nonTestGifts: any[] = [];

for (const g of db.gifts) {
  if (isTestGift(g)) {
    testGifts.push(g);
  } else {
    nonTestGifts.push(g);
  }
}

console.log(`Matching test criteria by title/slug keywords: ${testGifts.length}`);
console.log(`Remaining gifts: ${nonTestGifts.length}`);

console.log("\nRemaining gifts list:");
for (const g of nonTestGifts) {
  console.log(`- [${g.id}] (${g.status}) "${g.title}" | slug: ${g.slug} | createdAt: ${g.createdAt}`);
}

