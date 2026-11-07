/**
 * Admin Script: Assign Gift Owner
 * 
 * Securely sets the `creatorId` (Supabase User UUID) for a gift in the relationship database.
 * Confirms gift existence before assignment, validates UUID format, and protects immutable demo gifts.
 * 
 * Usage:
 *   npx tsx scripts/assign-gift-owner.ts <giftId> <supabase-user-uuid>
 * 
 * Example:
 *   npx tsx scripts/assign-gift-owner.ts gift_1792478519916_wm4v a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 */

import { loadDatabase, saveDatabase, getDataFilePath } from "../src/lib/server-db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function printUsage(): void {
  console.log("================================================================================");
  console.log(" GPTLEVWEB — ADMIN SCRIPT: ASSIGN GIFT OWNER");
  console.log("================================================================================");
  console.log("Usage:");
  console.log("  npx tsx scripts/assign-gift-owner.ts <giftId> <supabase-user-uuid>\n");
  console.log("Arguments:");
  console.log("  <giftId>              The unique ID of the target gift (e.g. gift_1792478519916_wm4v)");
  console.log("  <supabase-user-uuid>  The authentic Supabase Auth User UUID (RFC 4122 format)");
  console.log("================================================================================");
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(1);
  }

  const giftId = args[0].trim();
  const userUuid = args[1].trim();

  if (!giftId) {
    console.error("❌ Error: <giftId> cannot be empty.");
    process.exit(1);
  }

  if (!UUID_REGEX.test(userUuid)) {
    console.error(`❌ Error: Provided userId "${userUuid}" is not a valid Supabase UUID (RFC 4122 format).`);
    process.exit(1);
  }

  if (giftId === "gift_world_demo") {
    console.error("❌ Error: The default demo gift ('gift_world_demo') is immutable and cannot be claimed by a creator.");
    process.exit(1);
  }

  const dataFile = getDataFilePath();
  const db = loadDatabase();

  const gift = db.gifts.find((g) => g.id === giftId);
  if (!gift) {
    console.error(`❌ Error: Gift with ID "${giftId}" not found in database (${dataFile}).`);
    process.exit(1);
  }

  const previousOwner = gift.creatorId || "none (unassigned)";

  // Set the creatorId
  gift.creatorId = userUuid;

  // Persist to database
  saveDatabase(db);

  console.log("================================================================================");
  console.log(" ✓ GIFT OWNER SUCCESSFULLY ASSIGNED");
  console.log("================================================================================");
  console.log(`  Gift ID:        ${gift.id}`);
  console.log(`  Title:          "${gift.title}"`);
  console.log(`  Slug:           ${gift.slug}`);
  console.log(`  Status:         ${gift.status}`);
  console.log(`  Previous Owner: ${previousOwner}`);
  console.log(`  New Owner UUID: ${gift.creatorId}`);
  console.log(`  Database File:  ${dataFile}`);
  console.log("================================================================================");
}

main();

