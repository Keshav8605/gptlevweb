// Security Hardening Verification Suite — Phase 1 through Phase 4
// Verifies all 9 core security hardening scenarios mandated by Phase 5.

import fs from "fs";
import path from "path";
import crypto from "crypto";

import { GET as getGifts, POST as postGifts } from "../src/app/api/gifts/route";
import { GET as getGiftBySlug } from "../src/app/api/gifts/by-slug/[slug]/route";
import {
  GET as getNotebook,
  POST as postNotebook,
  DELETE as deleteNotebook,
} from "../src/app/api/notebook/route";
import { POST as postVoice } from "../src/app/api/voice/route";
import { POST as postComment } from "../src/app/api/interactions/comments/route";
import { POST as postReaction } from "../src/app/api/interactions/reactions/route";
import { POST as postProposal } from "../src/app/api/dates/proposals/route";
import { POST as postMemory } from "../src/app/api/dates/memories/route";
import { POST as postSecretVerify } from "../src/app/api/secret/verify/route";
import {
  GET as getNotifSettings,
  POST as postNotifSettings,
} from "../src/app/api/dates/notifications/settings/route";
import { GET as getSession } from "../src/app/api/session/route";
import { deleteGift } from "../src/lib/server-db";
import { createGiftUnlockToken } from "../src/lib/auth-guard";

const TEST_JWT_SECRET = "test-crypto-secret-key-for-supabase-audit-32-chars-min!";
const TEST_UNLOCK_SECRET = "test-crypto-gift-unlock-secret-min-32-chars-audit!";
process.env.SUPABASE_JWT_SECRET = TEST_JWT_SECRET;
process.env.GIFT_UNLOCK_SECRET = TEST_UNLOCK_SECRET;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://audit.supabase.co";
process.env.DATABASE_FILE = process.env.DATABASE_FILE || "test-database.json";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

function createTestJwt(sub: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 7200;
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      email,
      role: "authenticated",
      aud: "authenticated",
      iss: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      exp,
    })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${sig}`;
}

async function runPhase2SecuritySuite() {
  console.log("==========================================================");
  console.log("  GPTLEVWEB — SECURITY HARDENING PHASE 1–4 AUDIT SUITE    ");
  console.log("==========================================================");

  const creatorAId = `creator_a_${Date.now()}`;
  const creatorBId = `creator_b_${Date.now()}`;
  const tokenA = createTestJwt(creatorAId, "creatorA@example.com");
  const tokenB = createTestJwt(creatorBId, "creatorB@example.com");

  // Create Gift A (owned by Creator A)
  const reqCreateA = new Request("http://localhost:3000/api/gifts", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Gift For Juliet",
      senderName: "Romeo",
      recipientNickname: "My Juliet",
      status: "published",
      privacy: {
        isPasswordProtected: true,
        passcode: "starcrossed2026",
        recipientInviteToken: `juliet-token-${Date.now()}`,
        invitationStatus: "active",
      },
      secretPassword: "our-wedding-day",
      secretContent: "You are my eternal haven.",
    }),
  });
  const resCreateA = await postGifts(reqCreateA);
  assert(resCreateA.status === 200, "Created Gift A for Creator A");
  const dataCreateA = await resCreateA.json();
  const giftAId = dataCreateA.gift.id;
  const giftASlug = dataCreateA.gift.slug;

  // Create Gift B (owned by Creator B)
  const reqCreateB = new Request("http://localhost:3000/api/gifts", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Gift For Guinevere",
      senderName: "Lancelot",
      recipientNickname: "Guinevere",
      status: "published",
      privacy: {
        isPasswordProtected: true,
        passcode: "camelot777",
        recipientInviteToken: `guinevere-token-${Date.now()}`,
        invitationStatus: "active",
      },
    }),
  });
  const resCreateB = await postGifts(reqCreateB);
  assert(resCreateB.status === 200, "Created Gift B for Creator B");
  const dataCreateB = await resCreateB.json();
  const giftBId = dataCreateB.gift.id;

  // Create Gift C (owned by Creator A, isPasswordProtected: false)
  const giftCToken = `unprotected-invite-${Date.now()}`;
  const reqCreateC = new Request("http://localhost:3000/api/gifts", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Gift Without Passcode Protection",
      senderName: "Romeo",
      recipientNickname: "My Dearest",
      status: "published",
      privacy: {
        isPasswordProtected: false,
        recipientInviteToken: giftCToken,
        invitationStatus: "active",
      },
    }),
  });
  const resCreateC = await postGifts(reqCreateC);
  assert(resCreateC.status === 200, "Created Gift C (isPasswordProtected: false)");
  const dataCreateC = await resCreateC.json();
  const giftCId = dataCreateC.gift.id;
  const giftCSlug = dataCreateC.gift.slug;

  const unlockTokenA = createGiftUnlockToken(giftAId);

  // --------------------------------------------------------------------------
  // SCENARIO 1: GET /api/gifts Isolation & Public Demo Protection
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 1] GET /api/gifts Access Controls");
  const resPubGifts = await getGifts(new Request("http://localhost:3000/api/gifts"));
  assert(resPubGifts.status === 200, "Public unauthenticated GET /api/gifts returns HTTP 200");
  const dataPubGifts = await resPubGifts.json();
  assert(
    dataPubGifts.gifts.every((g: Record<string, unknown>) => g.id === "gift_world_demo"),
    "Public visitor only receives public demo gift (zero private gifts exposed)"
  );
  assert(
    dataPubGifts.gifts.every((g: Record<string, unknown>) => g.creatorId === undefined && g.privacy === undefined),
    "Public demo gift exposes safe fields only (id, title, slug)"
  );

  const resCreatorAGifts = await getGifts(
    new Request("http://localhost:3000/api/gifts", {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
  );
  const dataCreatorAGifts = await resCreatorAGifts.json();
  assert(
    dataCreatorAGifts.gifts.some((g: Record<string, unknown>) => g.id === giftAId),
    "Creator A sees their own Gift A"
  );
  assert(
    !dataCreatorAGifts.gifts.some((g: Record<string, unknown>) => g.id === giftBId),
    "Creator A CANNOT see Creator B's Gift B"
  );

  const resRecipientGifts = await getGifts(
    new Request("http://localhost:3000/api/gifts", {
      headers: { "x-gift-unlock-token": unlockTokenA },
    })
  );
  assert(
    resRecipientGifts.status === 403 || (await resRecipientGifts.json()).gifts.length <= 1,
    "Recipient unlock token cannot list creator gifts (rejected or safe fallback)"
  );

  // --------------------------------------------------------------------------
  // SCENARIO 2: GET /api/gifts/by-slug/[slug] Security & Sanitization
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 2] GET /api/gifts/by-slug/[slug] Passcode & Token Unlock");
  const resLocked = await getGiftBySlug(
    new Request(`http://localhost:3000/api/gifts/by-slug/${giftASlug}`),
    { params: Promise.resolve({ slug: giftASlug }) }
  );
  const dataLocked = await resLocked.json();
  assert(dataLocked.isLocked === true, "Password-protected gift without credentials returns isLocked: true");
  assert(dataLocked.gift === undefined, "Locked gift reveals zero gift content");

  const resWrongPass = await getGiftBySlug(
    new Request(`http://localhost:3000/api/gifts/by-slug/${giftASlug}`, {
      headers: { "x-gift-passcode": "incorrectpass" },
    }),
    { params: Promise.resolve({ slug: giftASlug }) }
  );
  const dataWrongPass = await resWrongPass.json();
  assert(dataWrongPass.isLocked === true, "Wrong passcode returns isLocked: true");

  const resUnlocked = await getGiftBySlug(
    new Request(`http://localhost:3000/api/gifts/by-slug/${giftASlug}`, {
      headers: { "x-gift-passcode": "starcrossed2026" },
    }),
    { params: Promise.resolve({ slug: giftASlug }) }
  );
  assert(resUnlocked.status === 200, "Correct passcode returns HTTP 200");
  const dataUnlocked = await resUnlocked.json();
  assert(Boolean(dataUnlocked.gift), "Unlocked gift content returned");
  assert(dataUnlocked.role === "recipient", "Passcode unlock assigns role 'recipient'");
  assert(Boolean(dataUnlocked.unlockToken), "Passcode unlock returns HMAC unlockToken");
  assert(dataUnlocked.gift.privacy.passcode === undefined, "Response never exposes raw passcode");
  assert(dataUnlocked.gift.privacy.recipientInviteToken === undefined, "Response never exposes invite token");
  assert(dataUnlocked.gift.secretPassword === undefined, "Response never exposes secretPassword");

  // Policy verification: non-demo gift with isPasswordProtected: false without credentials returns isLocked: true
  const resUnprotectedLocked = await getGiftBySlug(
    new Request(`http://localhost:3000/api/gifts/by-slug/${giftCSlug}`),
    { params: Promise.resolve({ slug: giftCSlug }) }
  );
  assert(resUnprotectedLocked.status === 200, "Uncredentialed non-demo gift returns HTTP 200");
  const dataUnprotectedLocked = await resUnprotectedLocked.json();
  assert(dataUnprotectedLocked.isLocked === true, "Unprotected non-demo gift returns isLocked: true without credentials");
  assert(dataUnprotectedLocked.gift === undefined, "Locked unprotected non-demo gift returns zero gift content");
  assert(dataUnprotectedLocked.unlockToken === undefined, "Locked unprotected non-demo gift does not issue unlockToken");
  assert(dataUnprotectedLocked.role === undefined, "Locked unprotected non-demo gift does not issue role");
  assert(dataUnprotectedLocked.title === "Gift Without Passcode Protection", "Safe field 'title' returned");
  assert(dataUnprotectedLocked.recipientNickname === "My Dearest", "Safe field 'recipientNickname' returned");

  // Unprotected non-demo gift unlocks with valid recipient invite token
  const resUnprotectedUnlocked = await getGiftBySlug(
    new Request(`http://localhost:3000/api/gifts/by-slug/${giftCSlug}`, {
      headers: { "x-invitation-token": giftCToken },
    }),
    { params: Promise.resolve({ slug: giftCSlug }) }
  );
  assert(resUnprotectedUnlocked.status === 200, "Invite token unlocks unprotected gift (HTTP 200)");
  const dataUnprotectedUnlocked = await resUnprotectedUnlocked.json();
  assert(Boolean(dataUnprotectedUnlocked.gift), "Unlocked gift returns full content");
  assert(dataUnprotectedUnlocked.role === "recipient", "Invite token unlock assigns role 'recipient'");
  assert(Boolean(dataUnprotectedUnlocked.unlockToken), "Invite token unlock returns HMAC unlockToken");

  // Public demo gift verification: stays open for preview without credentials
  const resDemo = await getGiftBySlug(
    new Request("http://localhost:3000/api/gifts/by-slug/sweetheart"),
    { params: Promise.resolve({ slug: "sweetheart" }) }
  );
  assert(resDemo.status === 200, "GET /api/gifts/by-slug/sweetheart returns HTTP 200");
  const dataDemo = await resDemo.json();
  assert(dataDemo.isLocked !== true, "Demo gift is NOT locked for anonymous preview");
  assert(Boolean(dataDemo.gift), "Demo gift content is returned to anonymous visitors");
  assert(dataDemo.role === "guest", "Anonymous visitor on demo gift is assigned role 'guest'");
  assert(dataDemo.unlockToken === undefined, "Anonymous visitor on demo gift is NOT issued an unlockToken");

  // --------------------------------------------------------------------------
  // SCENARIO 3: Collaborative Endpoints Closed Against Strangers
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 3] Collaborative Endpoints Reject Unauthenticated Requests");
  const resNoGiftId = await getNotebook(new Request("http://localhost:3000/api/notebook"));
  assert(resNoGiftId.status === 400, "GET /api/notebook without giftId returns HTTP 400");

  const resNoAuthNotebook = await getNotebook(
    new Request(`http://localhost:3000/api/notebook?giftId=${giftAId}`)
  );
  assert(
    resNoAuthNotebook.status === 401 || resNoAuthNotebook.status === 403,
    "GET /api/notebook?giftId without token returns 401/403"
  );

  const resNoAuthPostNotebook = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, content: "Hacked entry" }),
    })
  );
  assert(
    resNoAuthPostNotebook.status === 401 || resNoAuthPostNotebook.status === 403,
    "POST /api/notebook without token returns 401/403"
  );

  const resNoAuthVoice = await postVoice(
    new Request("http://localhost:3000/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, audioData: "data:audio/webm;base64,GkXfo5" }),
    })
  );
  assert(
    resNoAuthVoice.status === 401 || resNoAuthVoice.status === 403,
    "POST /api/voice without token returns 401/403"
  );

  const resNoAuthComment = await postComment(
    new Request("http://localhost:3000/api/interactions/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, targetType: "memory", targetId: "m1", content: "hello" }),
    })
  );
  assert(
    resNoAuthComment.status === 401 || resNoAuthComment.status === 403,
    "POST /api/interactions/comments without token returns 401/403"
  );

  const resNoAuthReaction = await postReaction(
    new Request("http://localhost:3000/api/interactions/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, targetType: "observation", targetId: "o1", emoji: "❤️" }),
    })
  );
  assert(
    resNoAuthReaction.status === 401 || resNoAuthReaction.status === 403,
    "POST /api/interactions/reactions without token returns 401/403"
  );

  const resNoAuthProposal = await postProposal(
    new Request("http://localhost:3000/api/dates/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, title: "Date", proposedDate: "2026-12-01" }),
    })
  );
  assert(
    resNoAuthProposal.status === 401 || resNoAuthProposal.status === 403,
    "POST /api/dates/proposals without token returns 401/403"
  );

  const resNoAuthMemory = await postMemory(
    new Request("http://localhost:3000/api/dates/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, dateTitle: "Beach Trip" }),
    })
  );
  assert(
    resNoAuthMemory.status === 401 || resNoAuthMemory.status === 403,
    "POST /api/dates/memories without token returns 401/403"
  );

  // Verify collaborative writes to public demo gift are strictly rejected without credentials
  const resDemoNoAuthNotebook = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: "gift_world_demo", content: "Anonymous vandal" }),
    })
  );
  assert(resDemoNoAuthNotebook.status === 401, "POST /api/notebook to demo gift without token returns HTTP 401");

  const resDemoNoAuthReaction = await postReaction(
    new Request("http://localhost:3000/api/interactions/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: "gift_world_demo", targetType: "memory", targetId: "m1", emoji: "❤️" }),
    })
  );
  assert(resDemoNoAuthReaction.status === 401, "POST /api/interactions/reactions to demo gift without token returns HTTP 401");

  const resDemoNoAuthVoice = await postVoice(
    new Request("http://localhost:3000/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: "gift_world_demo", audioData: "data:audio/webm;base64,GkXfo5" }),
    })
  );
  assert(resDemoNoAuthVoice.status === 401, "POST /api/voice to demo gift without token returns HTTP 401");

  const resDemoNoAuthProposal = await postProposal(
    new Request("http://localhost:3000/api/dates/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: "gift_world_demo", title: "Date", proposedDate: "2026-12-01" }),
    })
  );
  assert(resDemoNoAuthProposal.status === 401, "POST /api/dates/proposals to demo gift without token returns HTTP 401");

  // --------------------------------------------------------------------------
  // SCENARIO 4: Recipient Collaborative Operations & Cross-Gift Rejection
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 4] Recipient Unlock Token Binding & Integrity");
  const resRecipientEntry = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gift-unlock-token": unlockTokenA,
      },
      body: JSON.stringify({
        giftId: giftAId,
        content: "A secret love note for Romeo.",
        author: "creator", // Malicious spoof attempt
        authorName: "Attacker", // Malicious spoof attempt
      }),
    })
  );
  assert(resRecipientEntry.status === 200, "Recipient with Gift A unlock token posts notebook entry");
  const dataRecipientEntry = await resRecipientEntry.json();
  assert(
    dataRecipientEntry.entry.author === "recipient",
    "Server overrides forged role with authentic 'recipient'"
  );
  assert(
    dataRecipientEntry.entry.authorName === "My Juliet",
    "Server binds authorName to configured gift recipient nickname ('My Juliet')"
  );

  const resCrossGiftEntry = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gift-unlock-token": unlockTokenA, // Token is for Gift A, but targeting Gift B!
      },
      body: JSON.stringify({
        giftId: giftBId,
        content: "Attempt to contaminate Gift B with Gift A's token.",
      }),
    })
  );
  assert(
    resCrossGiftEntry.status === 403,
    "Gift A unlock token targeting Gift B is strictly rejected (HTTP 403)"
  );

  // --------------------------------------------------------------------------
  // SCENARIO 5: Creator Operations & Cross-Creator Boundary
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 5] Creator Collaborative Privileges & Tenant Isolation");
  const resCreatorAEntry = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        giftId: giftAId,
        content: "Romeo writing back to Juliet.",
      }),
    })
  );
  assert(resCreatorAEntry.status === 200, "Creator A posts entry with JWT");
  const dataCreatorAEntry = await resCreatorAEntry.json();
  assert(dataCreatorAEntry.entry.author === "creator", "Entry author is 'creator'");

  // Creator A can delete any entry in their own gift
  const resDeleteEntry = await deleteNotebook(
    new Request(
      `http://localhost:3000/api/notebook?id=${dataRecipientEntry.entry.id}&giftId=${giftAId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenA}` },
      }
    )
  );
  assert(resDeleteEntry.status === 200, "Creator A can delete entry in their own gift");

  // Creator A attempting to write to Creator B's Gift B rejected
  const resCrossCreator = await postNotebook(
    new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        giftId: giftBId,
        content: "Creator A tampering with Creator B's gift.",
      }),
    })
  );
  assert(
    resCrossCreator.status === 403,
    "Creator A writing to Creator B's gift rejected with HTTP 403"
  );

  // --------------------------------------------------------------------------
  // SCENARIO 6: Secret Chamber Verification & Lockout Rate Limiting
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 6] Secret Chamber Verification & Rate Limiting");
  const clientIp = `test-ip-${Date.now()}`;

  const resWrongSecret = await postSecretVerify(
    new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": clientIp },
      body: JSON.stringify({ password: "wrong-password", giftId: giftAId }),
    })
  );
  assert(resWrongSecret.status === 401, "Wrong secret returns HTTP 401");
  const dataWrongSecret = await resWrongSecret.json();
  assert(dataWrongSecret.remainingAttempts !== undefined, "Remaining attempts returned");

  // Default "iloveyou" must NOT unlock a gift configured with a different password
  const resDefaultSecret = await postSecretVerify(
    new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": clientIp },
      body: JSON.stringify({ password: "iloveyou", giftId: giftAId }),
    })
  );
  assert(
    resDefaultSecret.status === 401,
    "Default password 'iloveyou' fails for gift with custom password"
  );

  // Correct secret succeeds
  const clientIp2 = `test-ip2-${Date.now()}`;
  const resCorrectSecret = await postSecretVerify(
    new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": clientIp2 },
      body: JSON.stringify({ password: "our-wedding-day", giftId: giftAId }),
    })
  );
  assert(resCorrectSecret.status === 200, "Correct secret unlocks chamber (HTTP 200)");
  const dataCorrectSecret = await resCorrectSecret.json();
  assert(
    dataCorrectSecret.content?.letter === "You are my eternal haven.",
    "Private letter revealed upon secret unlock"
  );

  // Rate limiting lockout after 5 failures
  const clientIpLockout = `test-ip-lockout-${Date.now()}`;
  for (let i = 0; i < 4; i++) {
    await postSecretVerify(
      new Request("http://localhost:3000/api/secret/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": clientIpLockout },
        body: JSON.stringify({ password: "bad", giftId: giftAId }),
      })
    );
  }
  const resLockout = await postSecretVerify(
    new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": clientIpLockout },
      body: JSON.stringify({ password: "bad", giftId: giftAId }),
    })
  );
  assert(resLockout.status === 429, "5th failed attempt triggers HTTP 429 lockout");

  // --------------------------------------------------------------------------
  // SCENARIO 7: Passcode Hashing Verification in Database File
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 7] Database Secret Hashing & Zero Plaintext Secrets");
  const dbFile = process.env.DATABASE_FILE || "test-database.json";
  const dbRaw = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), ".data", dbFile), "utf8")
  );

  let unhashedPasscodes = 0;
  let unhashedTokens = 0;

  for (const gift of dbRaw.gifts || []) {
    if (gift.privacy?.passcode && !gift.privacy.passcode.startsWith("scrypt$")) {
      unhashedPasscodes++;
    }
    if (gift.privacy?.recipientInviteToken && !gift.privacy.recipientInviteToken.startsWith("sha256$")) {
      unhashedTokens++;
    }
    if (gift.secretPassword && !gift.secretPassword.startsWith("scrypt$")) {
      unhashedPasscodes++;
    }
  }

  assert(unhashedPasscodes === 0, `Zero plaintext passcodes found in database file (unhashed: ${unhashedPasscodes})`);
  assert(unhashedTokens === 0, `Zero plaintext invite tokens found in database file (unhashed: ${unhashedTokens})`);

  // --------------------------------------------------------------------------
  // SCENARIO 8: Notification Settings Guard & Payload Whitelist
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 8] Notification Settings Creator Authorization");
  const resUnauthNotif = await getNotifSettings(
    new Request("http://localhost:3000/api/dates/notifications/settings")
  );
  assert(resUnauthNotif.status === 401, "GET /api/dates/notifications/settings without JWT returns HTTP 401");

  const resInvalidNotifBody = await postNotifSettings(
    new Request("http://localhost:3000/api/dates/notifications/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
      body: JSON.stringify({ maliciousKey: true }),
    })
  );
  assert(resInvalidNotifBody.status === 400, "POST notification settings with unknown key rejected (HTTP 400)");

  const resValidNotifBody = await postNotifSettings(
    new Request("http://localhost:3000/api/dates/notifications/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
      body: JSON.stringify({ upcomingReminders: true, proposalAlerts: false }),
    })
  );
  assert(resValidNotifBody.status === 200, "POST notification settings with valid keys succeeds (HTTP 200)");

  // --------------------------------------------------------------------------
  // SCENARIO 9: Session Resolution Endpoint
  // --------------------------------------------------------------------------
  console.log("\n► [Scenario 9] GET /api/session Verification");
  const resSessionMissing = await getSession(new Request("http://localhost:3000/api/session"));
  assert(resSessionMissing.status === 400, "GET /api/session without giftId returns HTTP 400");

  const resSessionRecipient = await getSession(
    new Request(`http://localhost:3000/api/session?giftId=${giftAId}`, {
      headers: { "x-gift-unlock-token": unlockTokenA },
    })
  );
  assert(resSessionRecipient.status === 200, "GET /api/session with unlock token returns HTTP 200");
  const dataSessionRecipient = await resSessionRecipient.json();
  assert(dataSessionRecipient.role === "recipient", "Session resolves to 'recipient'");
  assert(dataSessionRecipient.name === "My Juliet", "Session resolves recipient name");

  const resSessionCreator = await getSession(
    new Request(`http://localhost:3000/api/session?giftId=${giftAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
  );
  assert(resSessionCreator.status === 200, "GET /api/session with creator JWT returns HTTP 200");
  const dataSessionCreator = await resSessionCreator.json();
  assert(dataSessionCreator.role === "creator", "Session resolves to 'creator'");

  // Cleanup
  deleteGift(giftAId);
  deleteGift(giftBId);
  deleteGift(giftCId);

  console.log("\n==========================================================");
  console.log(`  ALL PHASE 1–4 SECURITY AUDIT TESTS PASSED! (${passedCount} passed, ${failedCount} failed)`);
  console.log("==========================================================");
}

runPhase2SecuritySuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
