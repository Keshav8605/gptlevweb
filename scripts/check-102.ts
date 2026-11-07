import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Read regenerate script to see what groups were shared
const oldSharedHashes = [
  "sha256$c898b9f20", // Draft with Revoked Invite Token (22 gifts)
  "sha256$ce6b716cc", // Ordinary Public Published Gift (17 gifts)
  "sha256$d02261e8f", // Password Protected Sanctuary A (16 gifts)
  "sha256$c2f21665e", // Password Protected Sanctuary B (16 gifts)
  "sha256$d9e954382", // Draft with Revoked Token for Media Test (16 gifts)
  "sha256$c7d17a875", // Phase 6 E2E Flow Gift (15 gifts)
];

console.log("Checking the 102 regenerated gifts...");
const titlesMap = new Map<string, { count: number; status: string }>();

// Let's inspect the gifts whose titles correspond to the 6 shared groups
const groupTitles = [
  "Draft with Revoked Invite Token",
  "Ordinary Public Published Gift",
  "Password Protected Sanctuary A",
  "Password Protected Sanctuary B",
  "Draft with Revoked Token for Media Test",
  "Phase 6 E2E Flow Gift",
];

let totalRegenerated = 0;
let publishedRegenerated = 0;
let draftRegenerated = 0;

for (const g of db.gifts) {
  if (groupTitles.includes(g.title)) {
    totalRegenerated++;
    if (g.status === "published") {
      publishedRegenerated++;
    } else {
      draftRegenerated++;
    }
    const key = `${g.title} (${g.status})`;
    if (!titlesMap.has(key)) titlesMap.set(key, { count: 0, status: g.status });
    titlesMap.get(key)!.count++;
  }
}

console.log(`Total matching regenerated groups: ${totalRegenerated}`);
console.log(`Published: ${publishedRegenerated}`);
console.log(`Drafts: ${draftRegenerated}`);
console.log("\nBreakdown by Title and Status:");
for (const [k, v] of titlesMap.entries()) {
  console.log(`  - ${k}: ${v.count} gifts`);
}

