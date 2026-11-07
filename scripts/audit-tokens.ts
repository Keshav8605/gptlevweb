import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const db = JSON.parse(raw);

const tokenMap = new Map<string, Array<{ id: string; slug: string; title: string }>>();

for (const g of db.gifts || []) {
  const tok = g.privacy?.recipientInviteToken || "NO_TOKEN";
  if (!tokenMap.has(tok)) {
    tokenMap.set(tok, []);
  }
  tokenMap.get(tok)!.push({ id: g.id, slug: g.slug, title: g.title });
}

console.log("Total gifts:", (db.gifts || []).length);
console.log("Unique tokens:", tokenMap.size);

let sharedGroupCount = 0;
for (const [tok, list] of tokenMap.entries()) {
  if (list.length > 1) {
    sharedGroupCount++;
    console.log(`\nShared token (${list.length} gifts): ${tok.slice(0, 20)}...`);
    for (const item of list) {
      console.log(`  - [${item.id}] (slug: ${item.slug}) "${item.title}"`);
    }
  }
}

if (sharedGroupCount === 0) {
  console.log("\nAll gifts have completely unique recipientInviteTokens!");
}

