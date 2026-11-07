import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const db = JSON.parse(raw);

const demo = db.gifts.find((g: any) => g.id === "gift_world_demo");
console.log("Demo Gift ID:", demo?.id);
console.log("Demo Gift Slug:", demo?.slug);
console.log("Demo Gift Token Hash:", demo?.privacy?.recipientInviteToken);

const matches = db.gifts.filter((g: any) => g.privacy?.recipientInviteToken === demo?.privacy?.recipientInviteToken);
console.log("Total gifts sharing Demo Gift Token:", matches.length);
for (const m of matches) {
  console.log(`  - ${m.id} (${m.slug}): "${m.title}"`);
}

