import fs from "fs";
import path from "path";
import { loadDatabase, saveDatabase, getDataFilePath, resetDatabaseMemory } from "../src/lib/server-db";

async function main() {
  console.log("================================================================================");
  console.log(" PURGE UNASSIGNED GIFTS & RELATED RECORDS");
  console.log("================================================================================");

  resetDatabaseMemory();
  const dataFile = getDataFilePath();
  const timestamp = Date.now();
  const backupFile = path.join(
    path.dirname(dataFile),
    `relationship-database.backup-before-unassigned-purge-${timestamp}.json`
  );

  // 1. Back up database first
  fs.copyFileSync(dataFile, backupFile);
  const backupStat = fs.statSync(backupFile);
  console.log(`✓ Backup successfully created:`);
  console.log(`  Path: ${backupFile}`);
  console.log(`  Size: ${backupStat.size} bytes\n`);

  // 2. Load database and record BEFORE counts
  const db = loadDatabase();

  const countsBefore = {
    totalGifts: db.gifts?.length || 0,
    demoGift: db.gifts?.filter((g) => g.id === "gift_world_demo").length || 0,
    unassignedNonDemoGifts: db.gifts?.filter(
      (g) => g.id !== "gift_world_demo" && (!g.creatorId || g.creatorId.trim() === "")
    ).length || 0,
    assignedGifts: db.gifts?.filter(
      (g) => g.creatorId && g.creatorId.trim() !== ""
    ).length || 0,
    journalEntries: db.journalEntries?.length || 0,
    voiceMessages: db.voiceMessages?.length || 0,
    comments: db.comments?.length || 0,
    reactions: db.reactions?.length || 0,
    dateProposals: db.dateProposals?.length || 0,
    dateMemories: db.dateMemories?.length || 0,
    dateNotifications: db.dateNotifications?.length || 0,
    mediaAssets: db.mediaAssets?.length || 0,
  };

  // 3. Identify target gifts to purge
  const targetGifts = (db.gifts || []).filter(
    (g) => g.id !== "gift_world_demo" && (!g.creatorId || g.creatorId.trim() === "")
  );
  const targetGiftIds = new Set(targetGifts.map((g) => g.id));
  const targetProposalIds = new Set(
    (db.dateProposals || [])
      .filter((p) => p.giftId && targetGiftIds.has(p.giftId))
      .map((p) => p.id)
  );

  console.log(`Targeting ${targetGifts.length} unassigned gift(s) for deletion:`);
  targetGifts.forEach((g) => {
    console.log(`  - [${g.id}] "${g.title}" (slug: ${g.slug})`);
  });
  console.log("");

  // 4. Cascade delete related records
  db.gifts = (db.gifts || []).filter((g) => !targetGiftIds.has(g.id));
  db.journalEntries = (db.journalEntries || []).filter((j) => !j.giftId || !targetGiftIds.has(j.giftId));
  db.voiceMessages = (db.voiceMessages || []).filter((v) => !v.giftId || !targetGiftIds.has(v.giftId));
  db.comments = (db.comments || []).filter((c) => !c.giftId || !targetGiftIds.has(c.giftId));
  db.reactions = (db.reactions || []).filter((r) => !r.giftId || !targetGiftIds.has(r.giftId));
  db.dateProposals = (db.dateProposals || []).filter((p) => !p.giftId || !targetGiftIds.has(p.giftId));
  db.dateMemories = (db.dateMemories || []).filter((m) => !m.giftId || !targetGiftIds.has(m.giftId));
  db.dateNotifications = (db.dateNotifications || []).filter(
    (n) => !n.proposalId || !targetProposalIds.has(n.proposalId)
  );
  db.mediaAssets = (db.mediaAssets || []).filter((a) => !a.giftId || !targetGiftIds.has(a.giftId));

  // 5. Persist cleanly to disk
  saveDatabase(db);
  resetDatabaseMemory();

  // 6. Reload from disk to verify persistence and record AFTER counts
  const verifiedDb = loadDatabase();

  const countsAfter = {
    totalGifts: verifiedDb.gifts?.length || 0,
    demoGift: verifiedDb.gifts?.filter((g) => g.id === "gift_world_demo").length || 0,
    unassignedNonDemoGifts: verifiedDb.gifts?.filter(
      (g) => g.id !== "gift_world_demo" && (!g.creatorId || g.creatorId.trim() === "")
    ).length || 0,
    assignedGifts: verifiedDb.gifts?.filter(
      (g) => g.creatorId && g.creatorId.trim() !== ""
    ).length || 0,
    journalEntries: verifiedDb.journalEntries?.length || 0,
    voiceMessages: verifiedDb.voiceMessages?.length || 0,
    comments: verifiedDb.comments?.length || 0,
    reactions: verifiedDb.reactions?.length || 0,
    dateProposals: verifiedDb.dateProposals?.length || 0,
    dateMemories: verifiedDb.dateMemories?.length || 0,
    dateNotifications: verifiedDb.dateNotifications?.length || 0,
    mediaAssets: verifiedDb.mediaAssets?.length || 0,
  };

  console.log("================================================================================");
  console.log(" COUNTS BEFORE AND AFTER PURGE");
  console.log("================================================================================");
  console.log(`Record Type               | Before | After | Change`);
  console.log(`--------------------------+--------+-------+-------`);
  console.log(`Total Gifts               |   ${countsBefore.totalGifts.toString().padStart(4)} |  ${countsAfter.totalGifts.toString().padStart(4)} |  -${countsBefore.totalGifts - countsAfter.totalGifts}`);
  console.log(` - Demo Gift (protected)  |   ${countsBefore.demoGift.toString().padStart(4)} |  ${countsAfter.demoGift.toString().padStart(4)} |   0`);
  console.log(` - Unassigned Non-Demo    |   ${countsBefore.unassignedNonDemoGifts.toString().padStart(4)} |  ${countsAfter.unassignedNonDemoGifts.toString().padStart(4)} |  -${countsBefore.unassignedNonDemoGifts}`);
  console.log(` - Assigned Owner Gifts   |   ${countsBefore.assignedGifts.toString().padStart(4)} |  ${countsAfter.assignedGifts.toString().padStart(4)} |   0`);
  console.log(`Notebook (Journal Entries)|   ${countsBefore.journalEntries.toString().padStart(4)} |  ${countsAfter.journalEntries.toString().padStart(4)} |  -${countsBefore.journalEntries - countsAfter.journalEntries}`);
  console.log(`Voice Messages            |   ${countsBefore.voiceMessages.toString().padStart(4)} |  ${countsAfter.voiceMessages.toString().padStart(4)} |  -${countsBefore.voiceMessages - countsAfter.voiceMessages}`);
  console.log(`Comments                  |   ${countsBefore.comments.toString().padStart(4)} |  ${countsAfter.comments.toString().padStart(4)} |  -${countsBefore.comments - countsAfter.comments}`);
  console.log(`Reactions                 |   ${countsBefore.reactions.toString().padStart(4)} |  ${countsAfter.reactions.toString().padStart(4)} |  -${countsBefore.reactions - countsAfter.reactions}`);
  console.log(`Date Proposals            |   ${countsBefore.dateProposals.toString().padStart(4)} |  ${countsAfter.dateProposals.toString().padStart(4)} |  -${countsBefore.dateProposals - countsAfter.dateProposals}`);
  console.log(`Date Memories             |   ${countsBefore.dateMemories.toString().padStart(4)} |  ${countsAfter.dateMemories.toString().padStart(4)} |  -${countsBefore.dateMemories - countsAfter.dateMemories}`);
  console.log(`Date Notifications        |   ${countsBefore.dateNotifications.toString().padStart(4)} |  ${countsAfter.dateNotifications.toString().padStart(4)} |  -${countsBefore.dateNotifications - countsAfter.dateNotifications}`);
  console.log(`Media Assets              |   ${countsBefore.mediaAssets.toString().padStart(4)} |  ${countsAfter.mediaAssets.toString().padStart(4)} |  -${countsBefore.mediaAssets - countsAfter.mediaAssets}`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Purge execution error:", err);
  process.exit(1);
});
