import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const cleanRaw = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
const db = JSON.parse(cleanRaw);

const inspectCollection = (name: string, items: any[]) => {
  const giftIdCounts: Record<string, number> = {};
  for (const item of items || []) {
    const gid = item.giftId === undefined ? "(undefined)" : item.giftId === "" ? "(empty)" : item.giftId;
    giftIdCounts[gid] = (giftIdCounts[gid] || 0) + 1;
  }
  console.log(`\n[${name}] total: ${items?.length || 0}`);
  for (const [gid, count] of Object.entries(giftIdCounts)) {
    console.log(`  - giftId "${gid}": ${count}`);
  }
};

inspectCollection("comments", db.comments);
inspectCollection("reactions", db.reactions);
inspectCollection("journalEntries", db.journalEntries);
inspectCollection("voiceMessages", db.voiceMessages);
inspectCollection("dateProposals", db.dateProposals);
inspectCollection("dateMemories", db.dateMemories);
inspectCollection("dateNotifications", db.dateNotifications);
inspectCollection("mediaAssets", db.mediaAssets);

