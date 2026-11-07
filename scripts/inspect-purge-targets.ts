import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".data", "relationship-database.json");
const raw = fs.readFileSync(DATA_FILE, "utf-8");
const cleanRaw = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
const db = JSON.parse(cleanRaw);

const targetGifts = (db.gifts || []).filter(
  (g: any) => g.id !== "gift_world_demo" && (!g.creatorId || g.creatorId.trim() === "")
);
const targetGiftIds = new Set(targetGifts.map((g: any) => g.id));

console.log("=== TARGET GIFTS TO PURGE ===");
console.log(`Total gifts in database: ${db.gifts?.length}`);
console.log(`Target gifts to delete: ${targetGifts.length}`);
targetGifts.forEach((g: any) => console.log(` - ${g.id}: "${g.title}" (slug: ${g.slug})`));

// Check related records
const relatedComments = (db.comments || []).filter((c: any) => targetGiftIds.has(c.giftId));
const relatedReactions = (db.reactions || []).filter((r: any) => targetGiftIds.has(r.giftId));
const relatedJournal = (db.journalEntries || []).filter((j: any) => targetGiftIds.has(j.giftId));
const relatedVoice = (db.voiceMessages || []).filter((v: any) => targetGiftIds.has(v.giftId));
const relatedProposals = (db.dateProposals || []).filter((p: any) => targetGiftIds.has(p.giftId));
const targetProposalIds = new Set(relatedProposals.map((p: any) => p.id));
const relatedMemories = (db.dateMemories || []).filter((m: any) => targetGiftIds.has(m.giftId));
const relatedNotifications = (db.dateNotifications || []).filter(
  (n: any) => n.proposalId && targetProposalIds.has(n.proposalId)
);
const relatedMedia = (db.mediaAssets || []).filter((a: any) => targetGiftIds.has(a.giftId));

console.log("\n=== RELATED RECORDS MATCHING TARGET GIFTS ===");
console.log(`Comments:          ${relatedComments.length} / ${db.comments?.length || 0}`);
console.log(`Reactions:         ${relatedReactions.length} / ${db.reactions?.length || 0}`);
console.log(`Journal (Notebook):${relatedJournal.length} / ${db.journalEntries?.length || 0}`);
console.log(`Voice Messages:    ${relatedVoice.length} / ${db.voiceMessages?.length || 0}`);
console.log(`Date Proposals:    ${relatedProposals.length} / ${db.dateProposals?.length || 0}`);
console.log(`Date Memories:     ${relatedMemories.length} / ${db.dateMemories?.length || 0}`);
console.log(`Date Notifications:${relatedNotifications.length} / ${db.dateNotifications?.length || 0}`);
console.log(`Media Assets:      ${relatedMedia.length} / ${db.mediaAssets?.length || 0}`);

