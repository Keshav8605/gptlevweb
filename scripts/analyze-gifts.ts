import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// From our previous run, we recorded the 102 gifts that were regenerated
// Let's inspect all gifts in db.gifts
console.log("Analyzing all gifts in database...");

const testPatterns = [/test/i, /e2e/i, /phase 6/i, /revoked/i, /sanctuary/i, /ordinary/i, /draft-with/i, /alice/i, /bob/i];

let publishedCount = 0;
let draftCount = 0;
const realPartnerGifts: any[] = [];
const testFixtures: any[] = [];

for (const g of db.gifts) {
  const isDemo = g.id === "gift_world_demo";
  const title = g.title || "";
  const slug = g.slug || "";
  const status = g.status || "unknown";

  const isTest = testPatterns.some((p) => p.test(title) || p.test(slug)) || g.id.startsWith("gift_17938") || g.id.startsWith("gift_17939") || g.id.startsWith("gift_17940");

  const item = {
    id: g.id,
    slug,
    title,
    status,
    creatorId: g.creatorId,
    createdAt: g.createdAt,
    senderName: g.senderName || g.senderNickname,
    recipientName: g.recipientName || g.recipientNickname,
    letterPreview: g.letter?.content?.slice(0, 40) || "",
  };

  if (status === "published") publishedCount++;
  else draftCount++;

  if (isTest && !isDemo) {
    testFixtures.push(item);
  } else {
    realPartnerGifts.push(item);
  }
}

console.log(`Total gifts: ${db.gifts.length}`);
console.log(`Published: ${publishedCount}, Draft: ${draftCount}`);
console.log(`Test fixtures: ${testFixtures.length}`);
console.log(`Real partner / base gifts: ${realPartnerGifts.length}`);

console.log("\n=== REAL PARTNER / BASE GIFTS ===");
for (const g of realPartnerGifts) {
  console.log(`- [${g.id}] (${g.status}) "${g.title}" slug: ${g.slug} (Creator: ${g.creatorId || 'none'}, To: ${g.recipientName || 'none'}, From: ${g.senderName || 'none'})`);
}

