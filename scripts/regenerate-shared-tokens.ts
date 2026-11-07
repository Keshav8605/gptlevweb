import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashInviteToken } from "../src/lib/secrets";

interface Gift {
  id: string;
  slug: string;
  title: string;
  privacy?: {
    recipientInviteToken?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const db = JSON.parse(raw);

const gifts: Gift[] = db.gifts || [];
const DEMO_GIFT_ID = "gift_world_demo";

// 1. Group gifts by current recipientInviteToken hash
const tokenGroups = new Map<string, Gift[]>();
for (const g of gifts) {
  const tok = g.privacy?.recipientInviteToken || "";
  if (!tokenGroups.has(tok)) {
    tokenGroups.set(tok, []);
  }
  tokenGroups.get(tok)!.push(g);
}

// 2. Identify gifts whose invite token is shared with another gift
const regeneratedGifts: Array<{
  id: string;
  slug: string;
  title: string;
  oldHash: string;
  newHash: string;
}> = [];

const existingHashes = new Set<string>();

// Pre-register unique tokens and demo gift token
for (const [tok, group] of tokenGroups.entries()) {
  if (group.length === 1 && tok) {
    existingHashes.add(tok);
  }
}

// Ensure demo gift token is preserved and reserved
const demoGift = gifts.find((g) => g.id === DEMO_GIFT_ID);
if (demoGift?.privacy?.recipientInviteToken) {
  existingHashes.add(demoGift.privacy.recipientInviteToken);
}

for (const [tok, group] of tokenGroups.entries()) {
  // If shared by more than 1 gift
  if (group.length > 1) {
    for (const g of group) {
      // Keep demo gift token untouched
      if (g.id === DEMO_GIFT_ID) {
        continue;
      }

      // Generate a unique random token
      let rawToken = "";
      let newHash = "";
      do {
        rawToken = crypto.randomBytes(32).toString("hex");
        newHash = hashInviteToken(rawToken);
      } while (existingHashes.has(newHash));

      existingHashes.add(newHash);

      if (!g.privacy) {
        g.privacy = {};
      }

      const oldHash = g.privacy.recipientInviteToken || "NO_TOKEN";
      g.privacy.recipientInviteToken = newHash;

      regeneratedGifts.push({
        id: g.id,
        slug: g.slug,
        title: g.title,
        oldHash,
        newHash,
      });
    }
  }
}

// Save back to relationship-database.json
fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");

console.log("================================================================================");
console.log(`  INVITE TOKEN DEDUPLICATION & REGENERATION COMPLETE`);
console.log(`  Total Gifts Processed: ${gifts.length}`);
console.log(`  Gifts with Shared Tokens Regenerated: ${regeneratedGifts.length}`);
console.log("================================================================================\n");

console.log("| # | Gift ID | Slug | Title | Old Hash Prefix | New Hash Prefix |");
console.log("|---|---|---|---|---|---|");

regeneratedGifts.forEach((item, index) => {
  const oldPrefix = item.oldHash.slice(0, 16) + "...";
  const newPrefix = item.newHash.slice(0, 16) + "...";
  console.log(
    `| ${index + 1} | \`${item.id}\` | \`${item.slug}\` | ${item.title.replace(/\|/g, "-")} | \`${oldPrefix}\` | \`${newPrefix}\` |`
  );
});

// Verification check
const verifyTokens = new Set<string>();
let collisionFound = false;
for (const g of db.gifts) {
  const t = g.privacy?.recipientInviteToken;
  if (!t || verifyTokens.has(t)) {
    collisionFound = true;
    console.error(`COLLISION DETECTED for gift ${g.id} token ${t}`);
  }
  verifyTokens.add(t);
}

if (!collisionFound) {
  console.log(`\n✓ Verification SUCCESS: All ${db.gifts.length} gifts now have 100% unique, unshared invite tokens!`);
  const demoAfter = db.gifts.find((g: Gift) => g.id === DEMO_GIFT_ID);
  console.log(`✓ Demo Gift (${DEMO_GIFT_ID}) token hash preserved: ${demoAfter?.privacy?.recipientInviteToken?.slice(0, 20)}...`);
} else {
  console.error("\n❌ Verification FAILED: Collisions detected!");
  process.exit(1);
}

