import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const cleanRaw = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
const db = JSON.parse(cleanRaw);

console.log("=== GIFTS WITH MISSING CREATOR ID IN RELATIONSHIP-DATABASE.JSON ===");
const missingCreatorGifts: any[] = [];
const assignedCreatorGifts: any[] = [];

for (const g of db.gifts || []) {
  if (!g.creatorId || g.creatorId.trim() === "") {
    missingCreatorGifts.push(g);
  } else {
    assignedCreatorGifts.push(g);
  }
}

console.log(`Total gifts in database: ${db.gifts?.length}`);
console.log(`Gifts with MISSING creatorId: ${missingCreatorGifts.length}`);
console.log(`Gifts with ASSIGNED creatorId: ${assignedCreatorGifts.length}\n`);

for (let i = 0; i < missingCreatorGifts.length; i++) {
  const g = missingCreatorGifts[i];
  console.log(`[${i + 1}] ID: ${g.id}`);
  console.log(`    Title: "${g.title}"`);
  console.log(`    Slug: ${g.slug}`);
  console.log(`    Status: ${g.status}`);
  console.log(`    Created: ${g.createdAt || "(unknown)"}`);
  console.log(`    Sender: ${g.senderName || g.senderNickname || "(none)"}`);
  console.log(`    Recipient: ${g.recipientName || g.recipientNickname || "(none)"}`);
  console.log(`    Password Protected: ${Boolean(g.privacy?.isPasswordProtected)}`);
  console.log(`    Has Passcode: ${Boolean(g.privacy?.passcode)}`);
  console.log(`    Has Invite Token: ${Boolean(g.privacy?.recipientInviteToken)}`);
  console.log(`    Invitation Status: ${g.privacy?.invitationStatus || "active"}`);
  console.log("");
}

