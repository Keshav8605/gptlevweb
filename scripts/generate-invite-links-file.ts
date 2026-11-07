import fs from "fs";
import path from "path";
import crypto from "crypto";
import { hashInviteToken } from "../src/lib/secrets";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const LINKS_FILE = path.join(process.cwd(), ".data", "new-invite-links.txt");
const db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

const groupTitles = [
  "Draft with Revoked Invite Token",
  "Ordinary Public Published Gift",
  "Password Protected Sanctuary A",
  "Password Protected Sanctuary B",
  "Draft with Revoked Token for Media Test",
  "Phase 6 E2E Flow Gift",
];

const lines: string[] = [];
lines.push("# GPTLevWeb — Regenerated Invite Tokens & Links");
lines.push(`# Generated at: ${new Date().toISOString()}`);
lines.push(`# Total Regenerated Gifts: 102\n`);

let regeneratedCount = 0;

for (const g of db.gifts) {
  if (groupTitles.includes(g.title)) {
    regeneratedCount++;
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hash = hashInviteToken(rawToken);

    if (!g.privacy) g.privacy = {};
    g.privacy.recipientInviteToken = hash;

    const inviteUrl = `http://localhost:3000/gift/${g.slug}?token=${rawToken}`;

    lines.push(`Gift #${regeneratedCount}`);
    lines.push(`  ID: ${g.id}`);
    lines.push(`  Title: ${g.title}`);
    lines.push(`  Slug: ${g.slug}`);
    lines.push(`  Status: ${g.status}`);
    lines.push(`  Raw Token: ${rawToken}`);
    lines.push(`  Invite URL: ${inviteUrl}`);
    lines.push(`  Stored Hash: ${hash}\n`);
  }
}

// Save database
fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");

// Save links file
fs.writeFileSync(LINKS_FILE, lines.join("\n"), "utf-8");

console.log(`Successfully wrote ${regeneratedCount} gifts to ${LINKS_FILE}`);
console.log(`File size: ${fs.statSync(LINKS_FILE).size} bytes`);

