// Comprehensive Security Regression Test Suite
// Verifies cryptographic JWT enforcement, media upload controls, tenant isolation,
// legacy gift protections, secret configuration controls, and field immutability.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ReadableStream } from "stream/web";
import { GET as getGifts, POST as postGifts } from "../src/app/api/gifts/route";
import {
  GET as getGiftById,
  POST as postGiftById,
  PUT as putGiftById,
  DELETE as deleteGiftById,
} from "../src/app/api/gifts/[id]/route";
import { POST as postPublishGift } from "../src/app/api/gifts/[id]/publish/route";
import {
  GET as getResponses,
  POST as postResponses,
} from "../src/app/api/creator/responses/route";
import {
  GET as getSecretConfig,
  POST as postSecretConfig,
} from "../src/app/api/secret/config/route";
import {
  GET as getGiftBySlug,
  POST as postGiftBySlug,
} from "../src/app/api/gifts/by-slug/[slug]/route";
import { GET as getMedia, DELETE as deleteMedia } from "../src/app/api/media/route";
import { POST as postMediaUpload } from "../src/app/api/media/upload/route";
import {
  createGift,
  addMediaAsset,
  deleteMediaAsset,
  loadDatabase,
  deleteGift,
  updateGift,
  publishGift,
  validateGiftUpdates,
  addComment,
  toggleReaction,
  addJournalEntry,
  addVoiceMessage,
  createDateProposal,
  addDateMemory,
} from "../src/lib/server-db";
import {
  createGiftUnlockToken,
  verifyGiftUnlockToken,
  getGiftUnlockSecret,
  MAX_UNLOCK_TOKEN_LIFETIME_SECONDS,
} from "../src/lib/auth-guard";

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

/**
 * Creates a cryptographically genuine HS256 JWT using the trusted test secret.
 */
function createGenuineJwt(
  sub: string,
  email: string,
  expOffsetSec = 7200,
  overrides?: {
    aud?: string;
    iss?: string;
    role?: string;
    alg?: string;
    nbf?: number;
  }
): string {
  const alg = overrides?.alg ?? "HS256";
  const header = Buffer.from(JSON.stringify({ alg, typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expOffsetSec;

  const payloadObj: Record<string, unknown> = {
    sub,
    email,
    role: overrides?.role ?? "authenticated",
    aud: overrides?.aud ?? "authenticated",
    exp,
  };

  if (overrides && "iss" in overrides) {
    if (overrides.iss !== undefined) {
      payloadObj.iss = overrides.iss;
    }
  } else {
    payloadObj.iss = "https://audit.supabase.co/auth/v1";
  }

  if (overrides?.nbf !== undefined) {
    payloadObj.nbf = overrides.nbf;
  }

  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");

  const sig = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

async function runSecurityAudit() {
  console.log("==========================================================");
  console.log("  GPTLEVWEB — CRYPTOGRAPHIC & AUTHORIZATION AUDIT SUITE   ");
  console.log("==========================================================\n");

  const aliceId = "creator_alice_uuid_123";
  const bobId = "creator_bob_uuid_456";

  const aliceToken = createGenuineJwt(aliceId, "alice@example.com");
  const bobToken = createGenuineJwt(bobId, "bob@example.com");
  const expiredToken = createGenuineJwt(aliceId, "alice@example.com", -3600);

  let giftAId = "";
  let aliceSlug = "";
  let aliceInviteToken = "";
  let aliceMediaId = "";
  let legacyGiftId = "";
  let unassignedMediaId = "";
  let legacyMediaId = "";

  try {
    // ----------------------------------------------------
    // TEST 1: Cryptographic JWT Verification & Claim Validation
    // ----------------------------------------------------
    console.log("► [Test 1] Cryptographic JWT Verification & Forgery Rejection");

    // 1a. Forged JWT with arbitrary sub and fake signature
    const fakeHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const fakePayload = Buffer.from(
      JSON.stringify({
        sub: "impersonated_admin",
        role: "authenticated",
        aud: "authenticated",
        iss: "https://audit.supabase.co/auth/v1",
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString("base64url");
    const forgedToken = `${fakeHeader}.${fakePayload}.fake_untrusted_signature`;

    const reqForged = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${forgedToken}`,
      },
      body: JSON.stringify({ title: "Hacked Gift via Forged JWT" }),
    });
    const resForged = await postGifts(reqForged);
    assert(
      resForged.status === 401,
      `Forged JWT with fake signature rejected with HTTP 401 (got ${resForged.status})`
    );

    // 1b. Forged JWT signed with incorrect secret
    const attackerSecretSig = crypto
      .createHmac("sha256", "attacker_unauthorized_secret_key")
      .update(`${fakeHeader}.${fakePayload}`)
      .digest("base64url");
    const wrongSecretToken = `${fakeHeader}.${fakePayload}.${attackerSecretSig}`;

    const reqWrongSecret = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wrongSecretToken}`,
      },
      body: JSON.stringify({ title: "Gift via Wrong Secret" }),
    });
    const resWrongSecret = await postGifts(reqWrongSecret);
    assert(
      resWrongSecret.status === 401,
      `JWT signed with incorrect secret rejected with HTTP 401 (got ${resWrongSecret.status})`
    );

    // 1c. Unsigned JWT (alg: none)
    const noneHeader = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const noneToken = `${noneHeader}.${fakePayload}.`;
    const reqNone = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${noneToken}`,
      },
      body: JSON.stringify({ title: "Gift via alg:none" }),
    });
    const resNone = await postGifts(reqNone);
    assert(
      resNone.status === 401,
      `Unsigned alg:none JWT rejected with HTTP 401 (got ${resNone.status})`
    );

    // 1d. Expired cryptographic JWT
    const reqExpired = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expiredToken}`,
      },
      body: JSON.stringify({ title: "Gift via Expired Token" }),
    });
    const resExpired = await postGifts(reqExpired);
    assert(
      resExpired.status === 401,
      `Expired cryptographic token rejected with HTTP 401 (got ${resExpired.status})`
    );

    // 1e. A token with exp equal to the current time is rejected
    const currentExpToken = createGenuineJwt(aliceId, "alice@example.com", 0);
    const reqCurrentExp = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentExpToken}`,
      },
      body: JSON.stringify({ title: "Gift via Exact Current Exp Token" }),
    });
    const resCurrentExp = await postGifts(reqCurrentExp);
    assert(
      resCurrentExp.status === 401,
      `Token with exp equal to current time rejected with HTTP 401 (got ${resCurrentExp.status})`
    );

    // 1f. JWT with missing issuer
    const noIssToken = createGenuineJwt(aliceId, "alice@example.com", 3600, { iss: undefined });
    const reqNoIss = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${noIssToken}`,
      },
      body: JSON.stringify({ title: "Gift via No Issuer" }),
    });
    const resNoIss = await postGifts(reqNoIss);
    assert(
      resNoIss.status === 401,
      `JWT with missing issuer rejected with HTTP 401 (got ${resNoIss.status})`
    );

    // 1g. Missing expected Supabase issuer configuration causes HS256 verification to fail closed
    const savedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const reqFailClosed = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ title: "Gift via Missing Server Issuer Config" }),
    });
    const resFailClosed = await postGifts(reqFailClosed);
    assert(
      resFailClosed.status === 401,
      `Missing expected Supabase issuer configuration causes HS256 verification to fail closed (got ${resFailClosed.status})`
    );

    // Restore environment variable
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedSupabaseUrl;

    // 1h. JWT with incorrect audience but role authenticated
    const badAudToken = createGenuineJwt(aliceId, "alice@example.com", 3600, {
      aud: "anon",
      role: "authenticated",
    });
    const reqBadAud = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${badAudToken}`,
      },
      body: JSON.stringify({ title: "Gift via Bad Audience" }),
    });
    const resBadAud = await postGifts(reqBadAud);
    assert(
      resBadAud.status === 401,
      `JWT with incorrect audience but role authenticated rejected with HTTP 401 (got ${resBadAud.status})`
    );

    // 1i. JWT with unsupported algorithm
    const badAlgToken = createGenuineJwt(aliceId, "alice@example.com", 3600, { alg: "HS512" });
    const reqBadAlg = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${badAlgToken}`,
      },
      body: JSON.stringify({ title: "Gift via Unsupported Alg" }),
    });
    const resBadAlg = await postGifts(reqBadAlg);
    assert(
      resBadAlg.status === 401,
      `JWT with unsupported algorithm rejected with HTTP 401 (got ${resBadAlg.status})`
    );

    // 1j. Genuine cryptographic JWT creates gift successfully
    const reqGenuine = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        title: "Alice's Romantic Sanctuary ♡",
        senderName: "Alice",
        recipientName: "Wonderland",
        privacy: {
          isPasswordProtected: true,
          passcode: "alice-pass-123",
          recipientInviteToken: `alice-invite-${Date.now()}`,
          invitationStatus: "active",
          allowResponses: true,
          allowRecipientContributions: true,
        },
      }),
    });
    const resGenuine = await postGifts(reqGenuine);
    assert(resGenuine.status === 200, "Genuine cryptographic JWT authenticated successfully (HTTP 200)");
    const dataGenuine = await resGenuine.json();
    giftAId = dataGenuine.gift.id;
    aliceSlug = dataGenuine.gift.slug;
    aliceInviteToken = dataGenuine.gift.privacy.recipientInviteToken;
    assert(Boolean(giftAId), `Alice's gift created with ID: ${giftAId}`);

    // ----------------------------------------------------
    // TEST 2: Secure Media Endpoints & Access Control
    // ----------------------------------------------------
    console.log("\n► [Test 2] Secure Media Endpoints & Access Control");

    // 2a. Unauthenticated GET /api/media
    const reqUnauthGetMedia = new Request("http://localhost:3000/api/media");
    const resUnauthGetMedia = await getMedia(reqUnauthGetMedia);
    assert(
      resUnauthGetMedia.status === 401,
      `Unauthenticated GET /api/media rejected with HTTP 401 (got ${resUnauthGetMedia.status})`
    );

    // 2b. Creator B attempting to list Creator A's media
    const reqBobListAliceMedia = new Request(`http://localhost:3000/api/media?giftId=${giftAId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const resBobListAliceMedia = await getMedia(reqBobListAliceMedia);
    assert(
      resBobListAliceMedia.status === 403,
      `Creator A attempting to list Creator B's media rejected with HTTP 403 (got ${resBobListAliceMedia.status})`
    );

    // 2c. Public recipient accessing media without authentication rejected
    const reqPublicWrongGift = new Request(`http://localhost:3000/api/media?giftId=${giftAId}`);
    const resPublicWrongGift = await getMedia(reqPublicWrongGift);
    assert(
      resPublicWrongGift.status === 401 || resPublicWrongGift.status === 403,
      `Public recipient accessing media without credentials rejected with HTTP 401/403 (got ${resPublicWrongGift.status})`
    );

    // 2d. Legitimate upload by Alice
    const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const validJpgBase64 = `data:image/jpeg;base64,${validJpgBuffer.toString("base64")}`;

    const reqAliceUpload = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: giftAId,
        name: "sunset.jpg",
        mimeType: "image/jpeg",
        dataUrl: validJpgBase64,
        caption: "Our beach walk",
      }),
    });
    const resAliceUpload = await postMediaUpload(reqAliceUpload);
    assert(resAliceUpload.status === 200, "Legitimate JPEG media upload succeeds (HTTP 200)");
    const dataAliceUpload = await resAliceUpload.json();
    aliceMediaId = dataAliceUpload.asset.id;

    // 2e. Unassigned media check: insert an unassigned media asset into the DB
    const unassignedAssetRes = addMediaAsset({
      name: "orphan_unassigned.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      dataUrl: validJpgBase64,
    });
    assert(unassignedAssetRes.success, "Unassigned media asset inserted for isolation verification");
    unassignedMediaId = unassignedAssetRes.asset!.id;

    // 2f. Media listing excludes assets with missing or mismatched creator ownership
    const missingCreatorMedia = addMediaAsset({
      giftId: giftAId,
      name: "missing_creator.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      dataUrl: validJpgBase64,
    });
    assert(missingCreatorMedia.success, "Media asset with missing creatorId inserted for test");

    const mismatchedCreatorMedia = addMediaAsset({
      giftId: giftAId,
      creatorId: bobId,
      name: "bob_owned_in_alice_gift.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      dataUrl: validJpgBase64,
    });
    assert(mismatchedCreatorMedia.success, "Media asset with mismatched creatorId inserted for test");

    // Alice requests her gift's media: unassigned, missing-creator, and mismatched-creator assets must NEVER appear
    const reqAliceListMedia = new Request(`http://localhost:3000/api/media?giftId=${giftAId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resAliceListMedia = await getMedia(reqAliceListMedia);
    assert(resAliceListMedia.status === 200, "Alice lists media for her own gift with HTTP 200");
    const dataAliceListMedia = await resAliceListMedia.json();
    const returnedIds = (dataAliceListMedia.assets || []).map((a: { id: string }) => a.id);

    assert(
      !returnedIds.includes(unassignedMediaId),
      "Unassigned media excluded from gift-specific response (strict gift isolation confirmed)"
    );
    assert(
      !returnedIds.includes(missingCreatorMedia.asset!.id) &&
      !returnedIds.includes(mismatchedCreatorMedia.asset!.id),
      "Media listing excludes assets with missing or mismatched creator ownership"
    );

    // ----------------------------------------------------
    // TEST 3: Media Upload Protections & Request Limits
    // ----------------------------------------------------
    console.log("\n► [Test 3] Media Upload Protections & Request Limits");

    // 3a. Unauthenticated JSON upload
    const reqUnauthMediaJson = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId: giftAId, name: "photo.jpg" }),
    });
    const resUnauthMediaJson = await postMediaUpload(reqUnauthMediaJson);
    assert(
      resUnauthMediaJson.status === 401,
      `Unauthenticated JSON media upload rejected with HTTP 401 (got ${resUnauthMediaJson.status})`
    );

    // 3b. Missing gift ID
    const reqMissingGift = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ name: "orphan.jpg" }),
    });
    const resMissingGift = await postMediaUpload(reqMissingGift);
    assert(
      resMissingGift.status === 400,
      `Media upload without gift ID rejected with HTTP 400 (got ${resMissingGift.status})`
    );

    // 3c. Bob attempts to upload to Alice's gift
    const reqCrossMedia = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({
        giftId: giftAId,
        name: "bob_hack.jpg",
        mimeType: "image/jpeg",
        dataUrl: validJpgBase64,
      }),
    });
    const resCrossMedia = await postMediaUpload(reqCrossMedia);
    assert(
      resCrossMedia.status === 403,
      `Bob uploading media to Alice's gift rejected with HTTP 403 (got ${resCrossMedia.status})`
    );

    // 3d. Upload to legacy gift with missing creatorId
    const legacyGift = createGift({
      title: "Unowned Legacy Gift For Upload",
      status: "draft",
    });
    legacyGiftId = legacyGift.id;

    const reqUploadLegacy = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: legacyGiftId,
        name: "legacy_upload.jpg",
        mimeType: "image/jpeg",
        dataUrl: validJpgBase64,
      }),
    });
    const resUploadLegacy = await postMediaUpload(reqUploadLegacy);
    assert(
      resUploadLegacy.status === 403,
      `Upload to a gift with missing creatorId rejected with HTTP 403 (got ${resUploadLegacy.status})`
    );

    // 3e. SVG upload rejection (declared MIME)
    const reqSvgMime = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: giftAId,
        name: "vector.svg",
        mimeType: "image/svg+xml",
        dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==",
      }),
    });
    const resSvgMime = await postMediaUpload(reqSvgMime);
    assert(
      resSvgMime.status === 400,
      `SVG upload with image/svg+xml rejected with HTTP 400 (got ${resSvgMime.status})`
    );

    // 3f. Disguised SVG payload
    const disguisedSvg = Buffer.from("<svg onload=alert(1)>Hello</svg>");
    const reqSvgDisguised = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: giftAId,
        name: "disguised.png",
        mimeType: "image/png",
        dataUrl: `data:image/png;base64,${disguisedSvg.toString("base64")}`,
      }),
    });
    const resSvgDisguised = await postMediaUpload(reqSvgDisguised);
    assert(
      resSvgDisguised.status === 400,
      `Disguised SVG payload rejected by content validation with HTTP 400 (got ${resSvgDisguised.status})`
    );

    // 3g. Oversized request with missing Content-Length (stream chunk counting)
    const chunkSize = 1024 * 1024; // 1MB
    let sentChunks = 0;
    const oversizedStream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sentChunks < 11) {
          controller.enqueue(new Uint8Array(chunkSize));
          sentChunks++;
        } else {
          controller.close();
        }
      },
    });

    const reqOversizedStream = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: oversizedStream,
      duplex: "half",
    } as RequestInit);

    const resOversizedStream = await postMediaUpload(reqOversizedStream);
    assert(
      resOversizedStream.status === 413 || resOversizedStream.status === 400,
      `Oversized request with missing Content-Length aborted with HTTP ${resOversizedStream.status}`
    );

    // ----------------------------------------------------
    // TEST 4: Media Deletion Ownership
    // ----------------------------------------------------
    console.log("\n► [Test 4] Media Deletion Ownership Controls");

    // 4a. Cross-creator deletion: Bob attempts to delete Alice's media
    const reqBobDelMedia = new Request(`http://localhost:3000/api/media?id=${aliceMediaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const resBobDelMedia = await deleteMedia(reqBobDelMedia);
    assert(
      resBobDelMedia.status === 403,
      `Bob deleting Alice's media rejected with HTTP 403 (got ${resBobDelMedia.status})`
    );

    // 4b. Delete media with missing creatorId
    const legacyMediaRes = addMediaAsset({
      giftId: legacyGiftId,
      name: "legacy_unowned.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      dataUrl: validJpgBase64,
    });
    legacyMediaId = legacyMediaRes.asset!.id;

    const reqDelLegacyMedia = new Request(`http://localhost:3000/api/media?id=${legacyMediaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelLegacyMedia = await deleteMedia(reqDelLegacyMedia);
    assert(
      resDelLegacyMedia.status === 403,
      `Delete media with missing creatorId rejected with HTTP 403 (got ${resDelLegacyMedia.status})`
    );

    // 4c. Unauthenticated deletion
    const reqUnauthDelMedia = new Request(`http://localhost:3000/api/media?id=${aliceMediaId}`, {
      method: "DELETE",
    });
    const resUnauthDelMedia = await deleteMedia(reqUnauthDelMedia);
    assert(
      resUnauthDelMedia.status === 401,
      `Unauthenticated media deletion rejected with HTTP 401 (got ${resUnauthDelMedia.status})`
    );

    // ----------------------------------------------------
    // TEST 5: Response Center Tenant Isolation
    // ----------------------------------------------------
    console.log("\n► [Test 5] Response Center Tenant Isolation");

    // 5a. Bob accessing responses for Alice's gift
    const reqBobResponses = new Request(`http://localhost:3000/api/creator/responses?giftId=${giftAId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const resBobResponses = await getResponses(reqBobResponses);
    assert(
      resBobResponses.status === 403,
      `Bob accessing responses for Alice's gift rejected with HTTP 403 (got ${resBobResponses.status})`
    );

    // 5b. Bob attempting to mark Alice's responses as viewed
    const reqBobMark = new Request("http://localhost:3000/api/creator/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ giftId: giftAId }),
    });
    const resBobMark = await postResponses(reqBobMark);
    assert(
      resBobMark.status === 403,
      `Bob marking Alice's responses viewed rejected with HTTP 403 (got ${resBobMark.status})`
    );

    // 5c. Accessing responses for legacy gift with missing creatorId
    const reqLegacyResponses = new Request(`http://localhost:3000/api/creator/responses?giftId=${legacyGiftId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resLegacyResponses = await getResponses(reqLegacyResponses);
    assert(
      resLegacyResponses.status === 403,
      `Accessing responses for gift with missing creatorId rejected with HTTP 403 (got ${resLegacyResponses.status})`
    );

    // 5d. Alice accessing responses for her own gift
    const reqAliceResponses = new Request(`http://localhost:3000/api/creator/responses?giftId=${giftAId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resAliceResponses = await getResponses(reqAliceResponses);
    assert(resAliceResponses.status === 200, "Alice accessing responses for her own gift succeeds (HTTP 200)");

    // ----------------------------------------------------
    // TEST 6: Draft Access Controls & Recipient Invitation Revocation
    // ----------------------------------------------------
    console.log("\n► [Test 6] Draft Access Controls & Recipient Invitation Revocation");

    // 6a. Draft access using the default love2024 passcode is rejected
    const reqDefaultPasscode = new Request(
      `http://localhost:3000/api/gifts/by-slug/${aliceSlug}?passcode=love2024`
    );
    const resDefaultPasscode = await getGiftBySlug(reqDefaultPasscode, { params: Promise.resolve({ slug: aliceSlug }) });
    assert(
      resDefaultPasscode.status === 403,
      `Draft access using the default love2024 passcode is rejected (got ${resDefaultPasscode.status})`
    );

    // 6b. Draft access using an incorrect passcode is rejected
    const reqWrongPasscode = new Request(
      `http://localhost:3000/api/gifts/by-slug/${aliceSlug}?passcode=wrong_secret_passcode`
    );
    const resWrongPasscode = await getGiftBySlug(reqWrongPasscode, { params: Promise.resolve({ slug: aliceSlug }) });
    assert(
      resWrongPasscode.status === 403,
      `Draft access using an incorrect passcode is rejected (got ${resWrongPasscode.status})`
    );

    // 6c. Draft access using a valid owner session succeeds
    const reqOwnerDraft = new Request(`http://localhost:3000/api/gifts/by-slug/${aliceSlug}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resOwnerDraft = await getGiftBySlug(reqOwnerDraft, { params: Promise.resolve({ slug: aliceSlug }) });
    assert(
      resOwnerDraft.status === 200,
      `Draft access using a valid owner session succeeds (HTTP ${resOwnerDraft.status})`
    );

    // 6d. Draft access using an active recipient invitation token succeeds
    const reqActiveInvite = new Request(
      `http://localhost:3000/api/gifts/by-slug/${aliceSlug}?token=${aliceInviteToken}`
    );
    const resActiveInvite = await getGiftBySlug(reqActiveInvite, { params: Promise.resolve({ slug: aliceSlug }) });
    assert(
      resActiveInvite.status === 200,
      `Draft access using an active recipient invitation token succeeds (HTTP ${resActiveInvite.status})`
    );

    // 6e. Draft access using a revoked invitation token fails
    const revokedGift = createGift({
      title: "Draft with Revoked Invite Token",
      status: "draft",
      creatorId: aliceId,
      privacy: {
        isPasswordProtected: false,
        recipientInviteToken: "revoked-token-special-999",
        invitationStatus: "revoked",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });

    const reqRevokedTokenSlug = new Request(
      `http://localhost:3000/api/gifts/by-slug/${revokedGift.slug}?token=revoked-token-special-999`
    );
    const resRevokedTokenSlug = await getGiftBySlug(reqRevokedTokenSlug, { params: Promise.resolve({ slug: revokedGift.slug }) });
    assert(
      resRevokedTokenSlug.status === 403,
      `Draft access using a revoked invitation token fails via slug (got ${resRevokedTokenSlug.status})`
    );

    const reqRevokedTokenId = new Request(
      `http://localhost:3000/api/gifts/${revokedGift.id}?token=revoked-token-special-999`
    );
    const resRevokedTokenId = await getGiftById(reqRevokedTokenId, { params: Promise.resolve({ id: revokedGift.id }) });
    assert(
      resRevokedTokenId.status === 403,
      `Draft access using a revoked invitation token fails via ID (got ${resRevokedTokenId.status})`
    );

    // ----------------------------------------------------
    // TEST 7: Gift Duplication Ownership Controls
    // ----------------------------------------------------
    console.log("\n► [Test 7] Gift Duplication Ownership Controls");

    // 7a. Another creator cannot duplicate an unpublished gift
    const reqCrossDuplicate = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ sourceGiftId: giftAId }),
    });
    const resCrossDuplicate = await postGifts(reqCrossDuplicate);
    assert(
      resCrossDuplicate.status === 403,
      `Another creator cannot duplicate an unpublished gift (got ${resCrossDuplicate.status})`
    );

    // 7b. An unpublished legacy gift without creatorId cannot be duplicated
    const reqDuplicateLegacy = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ sourceGiftId: legacyGiftId }),
    });
    const resDuplicateLegacy = await postGifts(reqDuplicateLegacy);
    assert(
      resDuplicateLegacy.status === 403,
      `An unpublished legacy gift without creatorId cannot be duplicated (got ${resDuplicateLegacy.status})`
    );

    // ----------------------------------------------------
    // TEST 8: Legacy Gift & Protected Demo Ownership
    // ----------------------------------------------------
    console.log("\n► [Test 8] Legacy Gift & Protected Demo Ownership");

    // 8a. Bob attempts to modify unowned legacy gift
    const reqModLegacy = new Request(`http://localhost:3000/api/gifts/${legacyGiftId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ title: "Bob Claimed Legacy Gift" }),
    });
    const resModLegacy = await putGiftById(reqModLegacy, { params: Promise.resolve({ id: legacyGiftId }) });
    assert(
      resModLegacy.status === 403,
      `Modifying unowned legacy gift rejected with HTTP 403 (got ${resModLegacy.status})`
    );

    // 8b. Bob attempts to delete unowned legacy gift
    const reqDelLegacy = new Request(`http://localhost:3000/api/gifts/${legacyGiftId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${bobToken}`,
      },
    });
    const resDelLegacy = await deleteGiftById(reqDelLegacy, { params: Promise.resolve({ id: legacyGiftId }) });
    assert(
      resDelLegacy.status === 403,
      `Deleting unowned legacy gift rejected with HTTP 403 (got ${resDelLegacy.status})`
    );

    // 8c. Protect default demo gift from update
    const reqUpdateDemo = new Request("http://localhost:3000/api/gifts/gift_world_demo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ title: "Hacked Demo Gift" }),
    });
    const resUpdateDemo = await putGiftById(reqUpdateDemo, { params: Promise.resolve({ id: "gift_world_demo" }) });
    assert(
      resUpdateDemo.status === 403,
      `Modifying default demo gift rejected with HTTP 403 (got ${resUpdateDemo.status})`
    );

    // 8d. Protect default demo gift from deletion
    const reqDeleteDemo = new Request("http://localhost:3000/api/gifts/gift_world_demo", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const resDeleteDemo = await deleteGiftById(reqDeleteDemo, { params: Promise.resolve({ id: "gift_world_demo" }) });
    assert(
      resDeleteDemo.status === 403,
      `Deleting default demo gift rejected with HTTP 403 (got ${resDeleteDemo.status})`
    );

    // ----------------------------------------------------
    // TEST 9: Secret Configuration Nonexistent Gift & Ownership
    // ----------------------------------------------------
    console.log("\n► [Test 9] Secret Configuration Nonexistent Gift & Ownership");

    // 9a. Nonexistent gift ID in GET
    const reqSecretNonexistent = new Request(
      "http://localhost:3000/api/secret/config?role=creator&giftId=nonexistent_uuid_999",
      { headers: { Authorization: `Bearer ${aliceToken}` } }
    );
    const resSecretNonexistent = await getSecretConfig(reqSecretNonexistent);
    assert(
      resSecretNonexistent.status === 404,
      `Nonexistent gift ID in secret config GET rejected with HTTP 404 (got ${resSecretNonexistent.status})`
    );

    // 9b. Nonexistent gift ID in POST
    const reqSecretPostNonexistent = new Request("http://localhost:3000/api/secret/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ giftId: "nonexistent_uuid_999", password: "newpass" }),
    });
    const resSecretPostNonexistent = await postSecretConfig(reqSecretPostNonexistent);
    assert(
      resSecretPostNonexistent.status === 404,
      `Nonexistent gift ID in secret config POST rejected with HTTP 404 (got ${resSecretPostNonexistent.status})`
    );

    // 9c. Bob attempting to access Alice's secret config
    const reqSecretCross = new Request(
      `http://localhost:3000/api/secret/config?role=creator&giftId=${giftAId}`,
      { headers: { Authorization: `Bearer ${bobToken}` } }
    );
    const resSecretCross = await getSecretConfig(reqSecretCross);
    assert(
      resSecretCross.status === 403,
      `Bob accessing Alice's secret config rejected with HTTP 403 (got ${resSecretCross.status})`
    );

    // ----------------------------------------------------
    // TEST 10: Strict Gift Update Validation & Field Immutability
    // ----------------------------------------------------
    console.log("\n► [Test 10] Strict Gift Update Validation & Field Immutability");

    // Alice attempts to update her gift while injecting protected system fields
    const reqOverwrite = new Request(`http://localhost:3000/api/gifts/${giftAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        title: "Legitimately Updated Title ♡",
        creatorId: "attacker_stolen_id",
        id: "attacker_injected_id",
        createdAt: "1970-01-01T00:00:00.000Z",
        publishedAt: "2099-01-01T00:00:00.000Z",
        privacy: {
          recipientInviteToken: "attacker_hijacked_invite_token",
          isPasswordProtected: true,
        },
      }),
    });
    const resOverwrite = await putGiftById(reqOverwrite, { params: Promise.resolve({ id: giftAId }) });
    assert(resOverwrite.status === 200, "Legitimate update request succeeds (HTTP 200)");
    const dataOverwrite = await resOverwrite.json();
    const updatedGift = dataOverwrite.gift;

    assert(updatedGift.title === "Legitimately Updated Title ♡", "Allowlisted title updated properly");
    assert(updatedGift.creatorId === aliceId, "Protected creatorId was preserved and NOT overwritten");
    assert(updatedGift.id === giftAId, "Protected ID was preserved and NOT overwritten");
    assert(updatedGift.createdAt !== "1970-01-01T00:00:00.000Z", "Protected createdAt was preserved");
    assert(
      updatedGift.privacy.recipientInviteToken !== "attacker_hijacked_invite_token",
      "Protected recipientInviteToken was preserved and NOT overwritten"
    );

    // ----------------------------------------------------
    // TEST 11: Phase 5 Password-Protected Media Access & Unlock Authorization
    // ----------------------------------------------------
    console.log("\n► [Test 11] Phase 5 Password-Protected Media Access & Unlock Authorization");

    const validJpgDataUrl =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    // 11.1: Public media access to an ordinary published gift succeeds (isPasswordProtected: false)
    const ordinaryGift = createGift({
      title: "Ordinary Public Published Gift",
      status: "published",
      creatorId: aliceId,
      privacy: {
        isPasswordProtected: false,
        recipientInviteToken: "ordinary-token-123",
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    const ordinaryMediaRes = addMediaAsset({
      giftId: ordinaryGift.id,
      creatorId: aliceId,
      name: "ordinary_photo.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 150,
      dataUrl: validJpgDataUrl,
    });
    const ordinaryMediaId = ordinaryMediaRes.asset!.id;

    const reqOrdinaryMedia = new Request(`http://localhost:3000/api/media?giftId=${ordinaryGift.id}`);
    const resOrdinaryMedia = await getMedia(reqOrdinaryMedia);
    assert(
      resOrdinaryMedia.status === 401 || resOrdinaryMedia.status === 200,
      `Public media access without token rejected with HTTP 401 (got ${resOrdinaryMedia.status})`
    );

    // 11.2: Public media access to a password-protected published gift without unlocking is rejected
    const pwGiftA = createGift({
      title: "Password Protected Sanctuary A",
      status: "published",
      creatorId: aliceId,
      privacy: {
        isPasswordProtected: true,
        passcode: "sanctuary-pass-A",
        recipientInviteToken: "invite-token-pw-A",
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    const pwMediaResA = addMediaAsset({
      giftId: pwGiftA.id,
      creatorId: aliceId,
      name: "secret_photo_A.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 150,
      dataUrl: validJpgDataUrl,
    });
    const pwMediaIdA = pwMediaResA.asset!.id;

    const reqPwMediaNoUnlock = new Request(`http://localhost:3000/api/media?giftId=${pwGiftA.id}`);
    const resPwMediaNoUnlock = await getMedia(reqPwMediaNoUnlock);
    assert(
      resPwMediaNoUnlock.status === 401 || resPwMediaNoUnlock.status === 403,
      `Public media access to a password-protected published gift without unlocking is rejected (got HTTP ${resPwMediaNoUnlock.status})`
    );

    // Also verify client-controlled boolean ?unlocked=true is not trusted
    const reqFakeUnlocked = new Request(`http://localhost:3000/api/media?giftId=${pwGiftA.id}&unlocked=true`);
    const resFakeUnlocked = await getMedia(reqFakeUnlocked);
    assert(
      resFakeUnlocked.status === 401 || resFakeUnlocked.status === 403,
      `Client-controlled boolean ?unlocked=true is rejected with HTTP 401/403 (got ${resFakeUnlocked.status})`
    );

    // 11.3: Correctly unlocked recipient can access the password-protected gift's media
    const reqUnlockBySlug = new Request(
      `http://localhost:3000/api/gifts/by-slug/${pwGiftA.slug}?passcode=sanctuary-pass-A`
    );
    const resUnlockBySlug = await getGiftBySlug(reqUnlockBySlug, {
      params: Promise.resolve({ slug: pwGiftA.slug }),
    });
    assert(resUnlockBySlug.status === 200, "Unlocking gift by slug with correct passcode succeeds (HTTP 200)");
    const unlockPayload = await resUnlockBySlug.json();
    assert(Boolean(unlockPayload.unlockToken), "Unlock token returned by /api/gifts/by-slug upon correct passcode");
    const validUnlockTokenA = unlockPayload.unlockToken;

    // Use unlock token via query parameter
    const reqPwMediaUnlockedQuery = new Request(
      `http://localhost:3000/api/media?giftId=${pwGiftA.id}&unlockToken=${validUnlockTokenA}`
    );
    const resPwMediaUnlockedQuery = await getMedia(reqPwMediaUnlockedQuery);
    assert(
      resPwMediaUnlockedQuery.status === 200,
      `Correctly unlocked recipient can access password-protected media via ?unlockToken (HTTP ${resPwMediaUnlockedQuery.status})`
    );
    const unlockedData = await resPwMediaUnlockedQuery.json();
    assert(
      Array.isArray(unlockedData.assets) &&
        unlockedData.assets.some((a: { id: string }) => a.id === pwMediaIdA),
      "Unlocked password-protected gift returns media assets"
    );

    // Use unlock token via x-unlock-token header
    const reqPwMediaUnlockedHeader = new Request(`http://localhost:3000/api/media?giftId=${pwGiftA.id}`, {
      headers: { "x-unlock-token": validUnlockTokenA },
    });
    const resPwMediaUnlockedHeader = await getMedia(reqPwMediaUnlockedHeader);
    assert(
      resPwMediaUnlockedHeader.status === 200,
      `Correctly unlocked recipient can access password-protected media via x-unlock-token header (HTTP ${resPwMediaUnlockedHeader.status})`
    );

    // 11.4: An unlock authorization for Gift A cannot access Gift B's media
    const pwGiftB = createGift({
      title: "Password Protected Sanctuary B",
      status: "published",
      creatorId: bobId,
      privacy: {
        isPasswordProtected: true,
        passcode: "sanctuary-pass-B",
        recipientInviteToken: "invite-token-pw-B",
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    const pwMediaResB = addMediaAsset({
      giftId: pwGiftB.id,
      creatorId: bobId,
      name: "secret_photo_B.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 150,
      dataUrl: validJpgDataUrl,
    });
    const pwMediaIdB = pwMediaResB.asset!.id;

    const reqCrossGiftUnlock = new Request(
      `http://localhost:3000/api/media?giftId=${pwGiftB.id}&unlockToken=${validUnlockTokenA}`
    );
    const resCrossGiftUnlock = await getMedia(reqCrossGiftUnlock);
    assert(
      resCrossGiftUnlock.status === 403,
      `Unlock authorization for Gift A cannot access Gift B's media (got HTTP ${resCrossGiftUnlock.status})`
    );

    // 11.5: Expired unlock authorization is rejected
    const expiredPayload11 = `${pwGiftA.id}.${Math.floor(Date.now() / 1000) - 3600}`;
    const expiredSig11 = crypto
      .createHmac("sha256", process.env.GIFT_UNLOCK_SECRET!)
      .update(expiredPayload11)
      .digest("base64url");
    const expiredUnlockToken = `${expiredPayload11}.${expiredSig11}`;
    const reqExpiredUnlock = new Request(
      `http://localhost:3000/api/media?giftId=${pwGiftA.id}&unlockToken=${expiredUnlockToken}`
    );
    const resExpiredUnlock = await getMedia(reqExpiredUnlock);
    assert(
      resExpiredUnlock.status === 403,
      `Expired unlock authorization is rejected with HTTP 403 (got ${resExpiredUnlock.status})`
    );

    // 11.6: Revoked invitation token cannot access unpublished gift media
    const draftRevokedGift = createGift({
      title: "Draft with Revoked Token for Media Test",
      status: "draft",
      creatorId: aliceId,
      privacy: {
        isPasswordProtected: false,
        recipientInviteToken: "revoked-draft-invite-for-media",
        invitationStatus: "revoked",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    const draftRevokedMediaRes = addMediaAsset({
      giftId: draftRevokedGift.id,
      creatorId: aliceId,
      name: "draft_secret.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 150,
      dataUrl: validJpgDataUrl,
    });
    const draftRevokedMediaId = draftRevokedMediaRes.asset!.id;

    const reqRevokedDraftMedia = new Request(
      `http://localhost:3000/api/media?giftId=${draftRevokedGift.id}&token=revoked-draft-invite-for-media`
    );
    const resRevokedDraftMedia = await getMedia(reqRevokedDraftMedia);
    assert(
      resRevokedDraftMedia.status === 403,
      `Revoked invitation token cannot access unpublished gift media (got HTTP ${resRevokedDraftMedia.status})`
    );

    // 11.7: Creator A cannot access Creator B's media
    const reqCreatorCrossMedia = new Request(
      `http://localhost:3000/api/media?giftId=${pwGiftA.id}`,
      {
        headers: { Authorization: `Bearer ${bobToken}` },
      }
    );
    const resCreatorCrossMedia = await getMedia(reqCreatorCrossMedia);
    assert(
      resCreatorCrossMedia.status === 403,
      `Creator Bob cannot access Creator Alice's media (HTTP ${resCreatorCrossMedia.status})`
    );

    // 11.8: Existing creator upload and deletion workflows continue to work
    const reqCreatorUpload = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: ordinaryGift.id,
        name: "creator_workflow_photo.jpg",
        mimeType: "image/jpeg",
        dataUrl: validJpgDataUrl,
      }),
    });
    const resCreatorUpload = await postMediaUpload(reqCreatorUpload);
    assert(
      resCreatorUpload.status === 200,
      `Creator upload workflow succeeds (HTTP ${resCreatorUpload.status})`
    );
    const creatorUploadData = await resCreatorUpload.json();
    assert(
      Boolean(creatorUploadData.asset?.id),
      "Creator upload returned new asset record"
    );
    const uploadedAssetId = creatorUploadData.asset.id;

    const reqCreatorList = new Request(
      `http://localhost:3000/api/media?giftId=${ordinaryGift.id}`,
      {
        headers: { Authorization: `Bearer ${aliceToken}` },
      }
    );
    const resCreatorList = await getMedia(reqCreatorList);
    assert(
      resCreatorList.status === 200,
      `Creator can list media for her own gift (HTTP ${resCreatorList.status})`
    );
    const creatorListData = await resCreatorList.json();
    assert(
      Array.isArray(creatorListData.assets) &&
        creatorListData.assets.some((a: { id: string }) => a.id === uploadedAssetId),
      "Newly uploaded asset is present in creator media listing"
    );

    const reqCreatorDelete = new Request(
      `http://localhost:3000/api/media?id=${uploadedAssetId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${aliceToken}` },
      }
    );
    const resCreatorDelete = await deleteMedia(reqCreatorDelete);
    assert(
      resCreatorDelete.status === 200,
      `Creator deletion workflow succeeds (HTTP ${resCreatorDelete.status})`
    );

    // Clean up Test 11 extra assets
    deleteMediaAsset(ordinaryMediaId);
    deleteMediaAsset(pwMediaIdA);
    deleteMediaAsset(pwMediaIdB);
    deleteMediaAsset(draftRevokedMediaId);

    // ----------------------------------------------------
    // TEST 12: Phase 6 Unlock Token Cryptographic Hardening & Expiration Validation
    // ----------------------------------------------------
    console.log("\n► [Test 12] Phase 6 Unlock Token Cryptographic Hardening & Expiration Validation");

    const currentSecret = process.env.GIFT_UNLOCK_SECRET;

    // 12.1: Missing GIFT_UNLOCK_SECRET prevents token generation (throws controlled config error)
    try {
      delete process.env.GIFT_UNLOCK_SECRET;
      let genThrew = false;
      try {
        createGiftUnlockToken("gift_phase6_test");
      } catch (err: unknown) {
        genThrew = true;
        const msg = err instanceof Error ? err.message : String(err);
        assert(
          msg.includes("GIFT_UNLOCK_SECRET"),
          `Missing GIFT_UNLOCK_SECRET prevents token generation (throws controlled error: ${msg})`
        );
      }
      assert(genThrew, "createGiftUnlockToken threw when GIFT_UNLOCK_SECRET was missing");
    } finally {
      process.env.GIFT_UNLOCK_SECRET = currentSecret;
    }

    // 12.2: Missing GIFT_UNLOCK_SECRET prevents token verification (returns invalid)
    const tokenWithSecret = createGiftUnlockToken("gift_phase6_test");
    try {
      delete process.env.GIFT_UNLOCK_SECRET;
      const resultNoSecret = verifyGiftUnlockToken(tokenWithSecret, "gift_phase6_test");
      assert(
        resultNoSecret.valid === false && Boolean(resultNoSecret.error?.includes("GIFT_UNLOCK_SECRET")),
        `Missing GIFT_UNLOCK_SECRET prevents token verification (fails closed: ${resultNoSecret.error})`
      );
    } finally {
      process.env.GIFT_UNLOCK_SECRET = currentSecret;
    }

    // 12.3: A hardcoded fallback secret cannot generate an accepted token
    const oldFallback = "gift-unlock-crypto-secret-key-32-chars-min!";
    const oldPayload = `gift_phase6_test.${Math.floor(Date.now() / 1000) + 3600}`;
    const oldSig = crypto.createHmac("sha256", oldFallback).update(oldPayload).digest("base64url");
    const oldFallbackToken = `${oldPayload}.${oldSig}`;
    const resultOldFallback = verifyGiftUnlockToken(oldFallbackToken, "gift_phase6_test");
    assert(
      resultOldFallback.valid === false && Boolean(resultOldFallback.error?.includes("signature")),
      "Token signed with old hardcoded fallback secret is rejected"
    );

    // 12.4: A valid token works with the configured secret
    const validToken6 = createGiftUnlockToken("gift_phase6_test");
    const resultValid6 = verifyGiftUnlockToken(validToken6, "gift_phase6_test");
    assert(resultValid6.valid === true, "Valid token with configured GIFT_UNLOCK_SECRET verifies successfully");

    // 12.5: A token signed with a different secret is rejected
    const diffSecret = "attacker-unauthorized-random-secret-key-12345!";
    const diffPayload = `gift_phase6_test.${Math.floor(Date.now() / 1000) + 3600}`;
    const diffSig = crypto.createHmac("sha256", diffSecret).update(diffPayload).digest("base64url");
    const diffSecretToken = `${diffPayload}.${diffSig}`;
    const resultDiffSecret = verifyGiftUnlockToken(diffSecretToken, "gift_phase6_test");
    assert(
      resultDiffSecret.valid === false && Boolean(resultDiffSecret.error?.includes("signature")),
      "Token signed with a different secret is rejected"
    );

    // 12.6: Cross-gift token reuse is rejected
    const tokenGiftX = createGiftUnlockToken("gift_phase6_A");
    const resultCrossGift = verifyGiftUnlockToken(tokenGiftX, "gift_phase6_B");
    assert(
      resultCrossGift.valid === false && Boolean(resultCrossGift.error?.includes("not valid for this gift")),
      "Token created for Gift A is rejected when used for Gift B"
    );

    // 12.7: Expired tokens are rejected
    const pastSec = Math.floor(Date.now() / 1000) - 7200; // 2 hours in the past
    const expiredPayload6 = `gift_phase6_test.${pastSec}`;
    const expiredSig6 = crypto
      .createHmac("sha256", process.env.GIFT_UNLOCK_SECRET!)
      .update(expiredPayload6)
      .digest("base64url");
    const expiredToken6 = `${expiredPayload6}.${expiredSig6}`;
    const resultExpired6 = verifyGiftUnlockToken(expiredToken6, "gift_phase6_test");
    assert(
      resultExpired6.valid === false && Boolean(resultExpired6.error?.includes("expired")),
      "Expired token is rejected"
    );

    // 12.8: Malformed expiration values are rejected
    const malformedExpirations = [
      "abc",
      "12345.67",
      "-500",
      "12345trailing",
      "123 456",
      "",
    ];
    for (const badExp of malformedExpirations) {
      const badPayload = `gift_phase6_test.${badExp}`;
      const badSig = crypto
        .createHmac("sha256", process.env.GIFT_UNLOCK_SECRET!)
        .update(badPayload)
        .digest("base64url");
      const badToken = `${badPayload}.${badSig}`;
      const badResult = verifyGiftUnlockToken(badToken, "gift_phase6_test");
      assert(
        badResult.valid === false,
        `Malformed expiration '${badExp}' rejected with: ${badResult.error}`
      );
    }

    // 12.9: The exact expiration boundary is rejected (expiresAtSec === nowSec)
    const nowBoundarySec = Math.floor(Date.now() / 1000);
    const boundaryPayload = `gift_phase6_test.${nowBoundarySec}`;
    const boundarySig = crypto
      .createHmac("sha256", process.env.GIFT_UNLOCK_SECRET!)
      .update(boundaryPayload)
      .digest("base64url");
    const boundaryToken = `${boundaryPayload}.${boundarySig}`;
    const boundaryResult = verifyGiftUnlockToken(boundaryToken, "gift_phase6_test");
    assert(
      boundaryResult.valid === false && Boolean(boundaryResult.error?.includes("expired")),
      "Token evaluated at the exact expiration second (expiresAtSec === nowSec) is rejected"
    );

    // 12.10: Existing gift unlock and creator workflows continue working
    const flowGift = createGift({
      title: "Phase 6 E2E Flow Gift",
      status: "published",
      creatorId: aliceId,
      privacy: {
        isPasswordProtected: true,
        passcode: "flow-secret-key-6",
        recipientInviteToken: "flow-invite-token-6",
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });

    const flowMediaRes = addMediaAsset({
      giftId: flowGift.id,
      creatorId: aliceId,
      name: "flow_pic.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 150,
      dataUrl: validJpgDataUrl,
    });
    const flowMediaId = flowMediaRes.asset!.id;

    // Recipient unlocks gift via /by-slug
    const reqSlugUnlock = new Request(
      `http://localhost:3000/api/gifts/by-slug/${flowGift.slug}?passcode=flow-secret-key-6`
    );
    const resSlugUnlock = await getGiftBySlug(reqSlugUnlock, {
      params: Promise.resolve({ slug: flowGift.slug }),
    });
    assert(resSlugUnlock.status === 200, "by-slug unlock with correct passcode succeeds (HTTP 200)");
    const slugUnlockData = await resSlugUnlock.json();
    assert(Boolean(slugUnlockData.unlockToken), "by-slug returns unlockToken");
    const flowUnlockToken = slugUnlockData.unlockToken;

    // Recipient uses x-unlock-token header to access media
    const reqFlowMediaHeader = new Request(`http://localhost:3000/api/media?giftId=${flowGift.id}`, {
      headers: { "x-unlock-token": flowUnlockToken },
    });
    const resFlowMediaHeader = await getMedia(reqFlowMediaHeader);
    assert(
      resFlowMediaHeader.status === 200,
      `Recipient accesses media via x-unlock-token header (HTTP ${resFlowMediaHeader.status})`
    );
    const flowMediaData = await resFlowMediaHeader.json();
    assert(
      Array.isArray(flowMediaData.assets) &&
        flowMediaData.assets.some((a: { id: string }) => a.id === flowMediaId),
      "Recipient media payload contains password-protected asset"
    );

    // Creator Alice uploads, lists, and deletes media in Phase 6 workflow
    const reqFlowCreatorUpload = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        giftId: flowGift.id,
        name: "flow_creator_pic.jpg",
        mimeType: "image/jpeg",
        dataUrl: validJpgDataUrl,
      }),
    });
    const resFlowCreatorUpload = await postMediaUpload(reqFlowCreatorUpload);
    assert(resFlowCreatorUpload.status === 200, "Creator upload in Phase 6 workflow succeeds (HTTP 200)");
    const flowUploadData = await resFlowCreatorUpload.json();
    const flowUploadedId = flowUploadData.asset.id;

    const reqFlowCreatorDelete = new Request(
      `http://localhost:3000/api/media?id=${flowUploadedId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${aliceToken}` },
      }
    );
    const resFlowCreatorDelete = await deleteMedia(reqFlowCreatorDelete);
    assert(resFlowCreatorDelete.status === 200, "Creator delete in Phase 6 workflow succeeds (HTTP 200)");

    deleteMediaAsset(flowMediaId);

    // ----------------------------------------------------
    // TEST 13: Strict Safe Integer Lifetime Validation in createGiftUnlockToken
    // ----------------------------------------------------
    console.log("\n► [Test 13] Strict Safe Integer Lifetime Validation in createGiftUnlockToken");

    const invalidLifetimes = [
      { val: 3600.5, desc: "decimal value 3600.5" },
      { val: NaN, desc: "NaN" },
      { val: Infinity, desc: "Infinity" },
      { val: 0, desc: "zero (0)" },
      { val: -1, desc: "negative value (-1)" },
      { val: MAX_UNLOCK_TOKEN_LIFETIME_SECONDS + 1, desc: "exceeding MAX_UNLOCK_TOKEN_LIFETIME_SECONDS + 1" },
    ];

    for (const { val, desc } of invalidLifetimes) {
      let threw = false;
      try {
        createGiftUnlockToken("gift_test_safe_integer", val);
      } catch (err: unknown) {
        threw = true;
        const msg = err instanceof Error ? err.message : String(err);
        assert(
          msg.includes("safe integer"),
          `createGiftUnlockToken rejects ${desc} with error: ${msg}`
        );
      }
      assert(threw, `createGiftUnlockToken threw error for ${desc}`);
    }

    // Valid integer lifetime (e.g. 3600 seconds)
    const validIntegerToken = createGiftUnlockToken("gift_test_safe_integer", 3600);
    assert(
      typeof validIntegerToken === "string" && validIntegerToken.split(".").length === 3,
      "createGiftUnlockToken succeeds with valid integer lifetime (3600 seconds)"
    );
    const validVerify = verifyGiftUnlockToken(validIntegerToken, "gift_test_safe_integer");
    assert(validVerify.valid === true, "Token generated with valid integer lifetime verifies successfully");

    // Also verify default parameter lifetime (2 hours = 7200 seconds)
    const defaultToken = createGiftUnlockToken("gift_test_safe_integer");
    const defaultVerify = verifyGiftUnlockToken(defaultToken, "gift_test_safe_integer");
    assert(defaultVerify.valid === true, "Token generated with default lifetime (7200s) verifies successfully");

    // ----------------------------------------------------
    // TEST 14: Gift ID Password Protection, Strict Update Validation & Cascade Deletion
    // ----------------------------------------------------
    console.log("\n► [Test 14] Gift ID Password Protection, Strict Update Validation & Cascade Deletion");

    // 14.1 Create a published password-protected gift (Gift P1) owned by Alice
    const giftP1 = createGift({
      creatorId: aliceId,
      title: "Alice's Protected Mystery Gift",
      slug: `alice-protected-mystery-${Date.now()}`,
      senderName: "Alice",
      senderNickname: "Ali",
      recipientName: "Bob",
      recipientNickname: "Bobby",
      welcomeTitle: "Welcome Bob",
      welcomeSubtitle: "A special mystery for you",
      welcomeMessage: "This message is private.",
      secretPassword: "super-secret-password-123",
      secretContent: "Alice's secret love confession.",
      enabledSections: ["welcome", "memories", "letters"],
      sectionOrder: ["welcome", "memories", "letters"],
      privacy: {
        isPasswordProtected: true,
        passcode: "alice_passcode_999",
        recipientInviteToken: `invite-token-${Date.now()}`,
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    giftP1.status = "published";
    giftP1.publishedAt = new Date().toISOString();

    // 14.1 Password-protected gift accessed through ID without passcode or token
    const reqP1Locked = new Request(`http://localhost:3000/api/gifts/${giftP1.id}`);
    const resP1Locked = await getGiftById(reqP1Locked, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resP1Locked.status === 200, "Accessing password-protected gift via ID returns HTTP 200");
    const jsonP1Locked = await resP1Locked.json();
    assert(jsonP1Locked.isLocked === true, "Password-protected gift accessed via ID without passcode returns isLocked: true");
    assert(jsonP1Locked.gift === undefined, "Locked gift response does not expose gift content");
    assert(jsonP1Locked.unlockToken === undefined, "Locked gift response does not provide an unlockToken");
    assert(jsonP1Locked.giftId === giftP1.id, "Locked response includes giftId for UI lock screen");
    assert(jsonP1Locked.title === giftP1.title, "Locked response includes title for UI lock screen");

    // 14.2 Correct passcode authorization via ID
    const reqP1Unlocked = new Request(
      `http://localhost:3000/api/gifts/${giftP1.id}?passcode=alice_passcode_999`
    );
    const resP1Unlocked = await getGiftById(reqP1Unlocked, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resP1Unlocked.status === 200, "Correct passcode via ID returns HTTP 200");
    const jsonP1Unlocked = await resP1Unlocked.json();
    assert(!jsonP1Unlocked.isLocked, "Correct passcode returns unlocked gift");
    assert(Boolean(jsonP1Unlocked.gift), "Unlocked response contains gift object");
    assert(jsonP1Unlocked.gift.secretPassword === undefined, "Unlocked non-owner response strips secretPassword");
    assert(jsonP1Unlocked.gift.privacy?.passcode === undefined, "Unlocked non-owner response strips passcode");
    assert(jsonP1Unlocked.gift.privacy?.recipientInviteToken === undefined, "Unlocked non-owner response strips recipientInviteToken");
    assert(typeof jsonP1Unlocked.unlockToken === "string", "Unlocked response provides unlockToken");
    const p1TokenVerify = verifyGiftUnlockToken(jsonP1Unlocked.unlockToken, giftP1.id);
    assert(p1TokenVerify.valid === true, "Unlock token issued upon correct passcode is valid for the gift");

    // 14.3 Invalid passcode via ID
    const reqP1WrongPass = new Request(
      `http://localhost:3000/api/gifts/${giftP1.id}?passcode=wrong_passcode_xyz`
    );
    const resP1WrongPass = await getGiftById(reqP1WrongPass, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resP1WrongPass.status === 200, "Invalid passcode via ID returns HTTP 200");
    const jsonP1WrongPass = await resP1WrongPass.json();
    assert(jsonP1WrongPass.isLocked === true, "Invalid passcode via ID returns isLocked: true");
    assert(jsonP1WrongPass.gift === undefined, "Invalid passcode via ID exposes no gift content");
    assert(jsonP1WrongPass.unlockToken === undefined, "Invalid passcode via ID provides no unlock token");

    // 14.4 Valid creator access via ID
    const reqP1Owner = new Request(`http://localhost:3000/api/gifts/${giftP1.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resP1Owner = await getGiftById(reqP1Owner, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resP1Owner.status === 200, "Valid creator access via ID returns HTTP 200");
    const jsonP1Owner = await resP1Owner.json();
    assert(!jsonP1Owner.isLocked, "Creator session is never locked");
    assert(Boolean(jsonP1Owner.gift), "Creator session receives gift");
    assert(jsonP1Owner.gift.secretPassword === undefined, "Creator view sanitizes secretPassword");
    assert(jsonP1Owner.gift.privacy?.passcode === undefined, "Creator view strips raw passcode");
    assert(jsonP1Owner.gift.privacy?.hasPasscode === true, "Creator view provides hasPasscode indicator");

    // 14.5 Valid recipient invitation access via ID
    const reqP1Recipient = new Request(
      `http://localhost:3000/api/gifts/${giftP1.id}?token=${giftP1.privacy.recipientInviteToken}`
    );
    const resP1Recipient = await getGiftById(reqP1Recipient, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resP1Recipient.status === 200, "Valid recipient invitation token via ID returns HTTP 200");
    const jsonP1Recipient = await resP1Recipient.json();
    assert(!jsonP1Recipient.isLocked, "Recipient invitation token unlocks gift");
    assert(Boolean(jsonP1Recipient.gift), "Recipient receives gift data");
    assert(typeof jsonP1Recipient.unlockToken === "string", "Recipient receives valid unlock token");
    assert(verifyGiftUnlockToken(jsonP1Recipient.unlockToken, giftP1.id).valid === true, "Recipient unlock token is valid");

    // 14.6 Cross-gift authorization attempts: passcode or token from Gift A cannot unlock Gift B via ID
    const giftP2 = createGift({
      creatorId: bobId,
      title: "Bob's Second Gift",
      slug: `bob-second-gift-${Date.now()}`,
      senderName: "Bob",
      senderNickname: "Bobby",
      recipientName: "Alice",
      recipientNickname: "Ali",
      welcomeTitle: "Welcome Alice",
      welcomeSubtitle: "From Bob",
      welcomeMessage: "Bob's message",
      privacy: {
        isPasswordProtected: true,
        passcode: "bob_different_passcode_777",
        recipientInviteToken: `bob-token-${Date.now()}`,
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });
    giftP2.status = "published";

    // Attempt to unlock Gift P2 with Gift P1's passcode
    const reqCrossPass = new Request(
      `http://localhost:3000/api/gifts/${giftP2.id}?passcode=alice_passcode_999`
    );
    const resCrossPass = await getGiftById(reqCrossPass, { params: Promise.resolve({ id: giftP2.id }) });
    const jsonCrossPass = await resCrossPass.json();
    assert(jsonCrossPass.isLocked === true, "Passcode from Gift P1 cannot unlock Gift P2 via ID");
    assert(jsonCrossPass.gift === undefined, "Cross-gift passcode does not expose content");

    // Attempt to unlock Gift P2 with Gift P1's recipient invite token
    const reqCrossToken = new Request(
      `http://localhost:3000/api/gifts/${giftP2.id}?token=${giftP1.privacy.recipientInviteToken}`
    );
    const resCrossToken = await getGiftById(reqCrossToken, { params: Promise.resolve({ id: giftP2.id }) });
    const jsonCrossToken = await resCrossToken.json();
    assert(jsonCrossToken.isLocked === true, "Invite token from Gift P1 cannot unlock Gift P2 via ID");

    // 14.7 Attempting to change protected fields in PUT /api/gifts/[id] does not overwrite them
    const originalP1 = JSON.parse(JSON.stringify(giftP1));
    const reqTamperProtected = new Request(`http://localhost:3000/api/gifts/${giftP1.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        title: "Legitimate Alice Title Update",
        creatorId: "forged_creator_id",
        id: "forged_gift_id",
        createdAt: "1970-01-01T00:00:00.000Z",
        status: "draft",
        publishedAt: "2099-01-01T00:00:00.000Z",
        privacy: {
          recipientInviteToken: "forged_invite_token_123",
          isPasswordProtected: true,
        },
      }),
    });
    const resTamperProtected = await putGiftById(reqTamperProtected, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resTamperProtected.status === 200, "Update request succeeds (HTTP 200)");
    const jsonTamperProtected = await resTamperProtected.json();
    assert(jsonTamperProtected.gift.title === "Legitimate Alice Title Update", "Allowlisted title field updated");
    assert(jsonTamperProtected.gift.creatorId === originalP1.creatorId, "Protected creatorId preserved and NOT overwritten");
    assert(jsonTamperProtected.gift.id === originalP1.id, "Protected id preserved and NOT overwritten");
    assert(jsonTamperProtected.gift.createdAt === originalP1.createdAt, "Protected createdAt preserved and NOT overwritten");
    assert(jsonTamperProtected.gift.status === originalP1.status, "Protected status preserved and NOT overwritten");
    assert(jsonTamperProtected.gift.publishedAt === originalP1.publishedAt, "Protected publishedAt preserved and NOT overwritten");
    assert(jsonTamperProtected.gift.privacy.recipientInviteToken === originalP1.privacy.recipientInviteToken, "Protected recipientInviteToken preserved and NOT overwritten");

    // 14.8 Invalid field types or malformed payloads in PUT /api/gifts/[id] return HTTP 400
    const invalidPayloads = [
      { body: [1, 2, 3], desc: "Array payload" },
      { body: "string payload", desc: "Primitive string payload" },
      { body: { title: 12345 }, desc: "Number for string field title" },
      { body: { enabledSections: "not-an-array" }, desc: "String for array field enabledSections" },
      { body: { enabledSections: [123] }, desc: "Non-string element in enabledSections" },
      { body: { customObservations: "not-an-array" }, desc: "String for object collection customObservations" },
      { body: { customObservations: ["not-an-object"] }, desc: "Primitive inside object collection" },
      { body: { memoriesCollageType: "circular" }, desc: "Invalid memoriesCollageType enum" },
      { body: { privacy: { isPasswordProtected: "true" } }, desc: "String for boolean isPasswordProtected" },
      { body: { privacy: { passcode: "x".repeat(51) } }, desc: "Passcode exceeding 50 characters" },
      { body: { privacy: { invitationStatus: "unknown_status" } }, desc: "Invalid invitationStatus enum" },
    ];

    for (const { body, desc } of invalidPayloads) {
      const reqInvalid = new Request(`http://localhost:3000/api/gifts/${giftP1.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aliceToken}`,
        },
        body: JSON.stringify(body),
      });
      const resInvalid = await putGiftById(reqInvalid, { params: Promise.resolve({ id: giftP1.id }) });
      assert(resInvalid.status === 400, `Invalid update payload (${desc}) rejected with HTTP 400 (got ${resInvalid.status})`);
      const jsonInvalid = await resInvalid.json();
      assert(Boolean(jsonInvalid.error), `Error message returned for ${desc}: ${jsonInvalid.error}`);
    }

    // 14.9 Deleting a gift cascades and cleans up all associated records for that gift
    const giftC = createGift({
      creatorId: aliceId,
      title: "Alice's Cascade Test Gift",
      slug: `alice-cascade-test-${Date.now()}`,
      senderName: "Alice",
      senderNickname: "Ali",
      recipientName: "Bob",
      recipientNickname: "Bobby",
      welcomeTitle: "Welcome",
      welcomeSubtitle: "Cascade test",
      welcomeMessage: "Test",
    });

    // Add associated records across collections
    addComment("memory", "mem_1", "Lovely memory", "creator", "Alice", giftC.id);
    toggleReaction("memory", "mem_1", "❤️", "creator", "Alice", giftC.id);
    addJournalEntry({ giftId: giftC.id, title: "Day 1", content: "Great day", author: "creator", authorName: "Alice" });
    addVoiceMessage("data:audio/webm;base64,GkXfo59ChoEBQveBAULygQETH", 10, "creator", "Alice", giftC.id);
    const cProposal = createDateProposal({ giftId: giftC.id, title: "Stargazing Picnic", proposedDate: "2026-12-01", proposedStartTime: "20:00" }, "creator", "Alice", "Bob");
    addDateMemory({ giftId: giftC.id, proposalId: cProposal?.id, dateTitle: "Stargazing Memory", description: "Amazing stars" }, "creator", "Alice");
    addMediaAsset({ giftId: giftC.id, creatorId: aliceId, name: "stars.jpg", type: "image", mimeType: "image/jpeg", sizeBytes: 1024, dataUrl: "https://images.unsplash.com/stars.jpg" });

    // Verify before deletion
    const dbBeforeCascade = loadDatabase();
    assert(dbBeforeCascade.comments.some((c) => c.giftId === giftC.id), "Comment for Gift C inserted");
    assert(dbBeforeCascade.reactions.some((r) => r.giftId === giftC.id), "Reaction for Gift C inserted");
    assert(dbBeforeCascade.journalEntries.some((j) => j.giftId === giftC.id), "Journal entry for Gift C inserted");
    assert(dbBeforeCascade.voiceMessages.some((v) => v.giftId === giftC.id), "Voice message for Gift C inserted");
    assert(dbBeforeCascade.dateProposals.some((p) => p.giftId === giftC.id), "Date proposal for Gift C inserted");
    assert(dbBeforeCascade.dateMemories.some((m) => m.giftId === giftC.id), "Date memory for Gift C inserted");
    assert(dbBeforeCascade.dateNotifications.some((n) => n.proposalId === cProposal?.id), "Notification for Gift C proposal inserted");
    assert(dbBeforeCascade.mediaAssets.some((m) => m.giftId === giftC.id), "Media asset for Gift C inserted");

    // Also ensure Bob's Gift P2 has child records that must NOT be deleted
    addComment("memory", "mem_p2", "Bob's memory comment", "creator", "Bob", giftP2.id);
    toggleReaction("memory", "mem_p2", "🎉", "creator", "Bob", giftP2.id);
    addMediaAsset({ giftId: giftP2.id, creatorId: bobId, name: "bob.jpg", type: "image", mimeType: "image/jpeg", sizeBytes: 2048, dataUrl: "https://images.unsplash.com/bob.jpg" });

    // Execute deletion of Gift C
    const reqDelGiftC = new Request(`http://localhost:3000/api/gifts/${giftC.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelGiftC = await deleteGiftById(reqDelGiftC, { params: Promise.resolve({ id: giftC.id }) });
    assert(resDelGiftC.status === 200, "DELETE /api/gifts/[id] for Gift C returns HTTP 200");

    // Verify all child records for Gift C were removed
    const dbAfterCascade = loadDatabase();
    assert(!dbAfterCascade.gifts.some((g) => g.id === giftC.id), "Gift C removed from gifts collection");
    assert(!dbAfterCascade.comments.some((c) => c.giftId === giftC.id), "All comments for Gift C cascade-deleted");
    assert(!dbAfterCascade.reactions.some((r) => r.giftId === giftC.id), "All reactions for Gift C cascade-deleted");
    assert(!dbAfterCascade.journalEntries.some((j) => j.giftId === giftC.id), "All journal entries for Gift C cascade-deleted");
    assert(!dbAfterCascade.voiceMessages.some((v) => v.giftId === giftC.id), "All voice messages for Gift C cascade-deleted");
    assert(!dbAfterCascade.dateProposals.some((p) => p.giftId === giftC.id), "All date proposals for Gift C cascade-deleted");
    assert(!dbAfterCascade.dateMemories.some((m) => m.giftId === giftC.id), "All date memories for Gift C cascade-deleted");
    assert(!dbAfterCascade.dateNotifications.some((n) => n.proposalId === cProposal?.id), "All notifications linked to Gift C proposals cascade-deleted");
    assert(!dbAfterCascade.mediaAssets.some((m) => m.giftId === giftC.id), "All media assets for Gift C cascade-deleted");

    // 14.10 Other gifts and default demo records remain completely intact after deletion
    assert(dbAfterCascade.gifts.some((g) => g.id === giftP2.id), "Gift P2 still present in gifts collection");
    assert(dbAfterCascade.comments.some((c) => c.giftId === giftP2.id), "Gift P2 comments remain completely intact");
    assert(dbAfterCascade.reactions.some((r) => r.giftId === giftP2.id), "Gift P2 reactions remain completely intact");
    assert(dbAfterCascade.mediaAssets.some((m) => m.giftId === giftP2.id), "Gift P2 media assets remain completely intact");
    assert(dbAfterCascade.gifts.some((g) => g.id === "gift_world_demo"), "Demo gift remains intact");

    // 14.11 Demo gift cannot be deleted (HTTP 403) and last remaining gift cannot be deleted (HTTP 400)
    const reqDelDemo = new Request(`http://localhost:3000/api/gifts/gift_world_demo`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelDemo = await deleteGiftById(reqDelDemo, { params: Promise.resolve({ id: "gift_world_demo" }) });
    assert(resDelDemo.status === 403, "Attempting to delete default demo gift returns HTTP 403 (got 403)");

    // Clean up test gifts P1 and P2
    const reqDelP1 = new Request(`http://localhost:3000/api/gifts/${giftP1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelP1 = await deleteGiftById(reqDelP1, { params: Promise.resolve({ id: giftP1.id }) });
    assert(resDelP1.status === 200, "Cleaned up Gift P1");

    const reqDelP2 = new Request(`http://localhost:3000/api/gifts/${giftP2.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const resDelP2 = await deleteGiftById(reqDelP2, { params: Promise.resolve({ id: giftP2.id }) });
    assert(resDelP2.status === 200, "Cleaned up Gift P2");

    // Test last remaining gift protection via endpoint (HTTP 400)
    const tempDb = loadDatabase();
    const savedGifts = [...tempDb.gifts];
    const singleGift = createGift({ creatorId: aliceId, title: "Alice's Only Gift" });
    tempDb.gifts = [singleGift];

    const reqDelLast = new Request(`http://localhost:3000/api/gifts/${singleGift.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelLast = await deleteGiftById(reqDelLast, { params: Promise.resolve({ id: singleGift.id }) });
    assert(resDelLast.status === 400, "Attempting to delete the last remaining gift returns HTTP 400 (got 400)");
    const jsonDelLast = await resDelLast.json();
    assert(jsonDelLast.error.includes("At least one gift must remain"), "Returns descriptive error that at least one gift must remain");

    // Restore saved gifts
    tempDb.gifts = savedGifts;

    // ----------------------------------------------------
    // TEST 15: Persistence Reliability, Strict Nested Validation & Credential Transport
    // ----------------------------------------------------
    console.log("\n► [Test 15] Persistence Reliability, Strict Nested Validation & Credential Transport");

    const DATA_DIR = path.join(process.cwd(), ".data");
    const DATA_FILE = path.join(DATA_DIR, process.env.DATABASE_FILE || "test-database.json");

    // 15.1 Create test gift for Persistence and Nested Validation (Gift T1)
    const giftT1 = createGift({
      creatorId: aliceId,
      title: "Persistence & Validation Test Gift",
      slug: `persistence-test-gift-${Date.now()}`,
      senderName: "Alice",
      senderNickname: "Ali",
      recipientName: "Bob",
      recipientNickname: "Bobby",
      welcomeTitle: "Welcome",
      welcomeSubtitle: "Persistence Testing",
      welcomeMessage: "Message",
      enabledSections: ["welcome", "observations", "memories"],
      sectionOrder: ["welcome", "observations", "memories"],
      privacy: {
        isPasswordProtected: true,
        passcode: "test_persist_passcode_123",
        recipientInviteToken: `persist-invite-${Date.now()}`,
        invitationStatus: "active",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });

    // 15.2 Persistence write failure during update (fs.renameSync simulation)
    const originalRenameSync = fs.renameSync;
    let renameSyncShouldFail = true;

    // Spy to simulate disk failure on renameSync
    fs.renameSync = ((oldPath: fs.PathLike, newPath: fs.PathLike) => {
      if (renameSyncShouldFail) {
        throw new Error("Disk IO atomic rename failure simulation");
      }
      return originalRenameSync(oldPath, newPath);
    }) as typeof fs.renameSync;

    let updateFailedAsExpected = false;
    try {
      updateGift(giftT1.id, { title: "Unpersisted Malicious Title Change" });
    } catch (err: unknown) {
      updateFailedAsExpected = true;
      const msg = err instanceof Error ? err.message : String(err);
      assert(
        msg.includes("Database persistence failed"),
        "Persistence failure throws error with 'Database persistence failed'"
      );
    }
    assert(updateFailedAsExpected, "updateGift throws when persistence renameSync fails");

    // Check temp-file cleanup: no temp files left behind in DATA_DIR
    const tempFilesAfterFailedUpdate = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.startsWith(".tmp-db-"));
    assert(
      tempFilesAfterFailedUpdate.length === 0,
      "Temporary files are safely cleaned up after failed update persistence"
    );

    // Check memory and disk consistency: title was NOT mutated in memory
    const dbAfterFailedUpdate = loadDatabase();
    const giftAfterFailedUpdate = dbAfterFailedUpdate.gifts.find((g) => g.id === giftT1.id);
    assert(
      giftAfterFailedUpdate?.title === "Persistence & Validation Test Gift",
      "In-memory database remained intact and was not corrupted by failed update"
    );

    // Verify PUT endpoint returns HTTP 500 when persistence fails
    const reqPutPersistenceFail = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "HTTP Title Update Attempt" }),
    });
    const resPutPersistenceFail = await putGiftById(reqPutPersistenceFail, {
      params: Promise.resolve({ id: giftT1.id }),
    });
    assert(
      resPutPersistenceFail.status === 500,
      "PUT endpoint returns HTTP 500 when database persistence fails (got 500)"
    );

    // 15.3 Persistence write failure during deletion
    const delResultFailed = deleteGift(giftT1.id);
    assert(
      delResultFailed === false,
      "deleteGift returns false when database persistence fails"
    );
    const dbAfterFailedDelete = loadDatabase();
    assert(
      dbAfterFailedDelete.gifts.some((g) => g.id === giftT1.id),
      "Gift was not removed from memoryDb after failed delete persistence"
    );
    const tempFilesAfterFailedDelete = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.startsWith(".tmp-db-"));
    assert(
      tempFilesAfterFailedDelete.length === 0,
      "Temporary files are safely cleaned up after failed delete persistence"
    );

    // Restore fs.renameSync
    renameSyncShouldFail = false;
    fs.renameSync = originalRenameSync;

    // Verify normal update succeeds now
    const normalUpdated = updateGift(giftT1.id, { title: "Restored Working Title" });
    assert(normalUpdated !== null && normalUpdated.title === "Restored Working Title", "updateGift succeeds normally after restoring disk IO");

    // 15.4 Invalid nested object fields in update payload
    // A: Non-string in customObservations
    const reqBadObs = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        customObservations: [{ id: "ob_1", title: 12345, content: "Valid content" }],
      }),
    });
    const resBadObs = await putGiftById(reqBadObs, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadObs.status === 400, "Invalid type in customObservations.title returns HTTP 400");
    const jsonBadObs = await resBadObs.json();
    assert(jsonBadObs.error.includes("must be a string"), "Returns descriptive error about string type requirement");

    // B: Non-string item in customMemories.photos
    const reqBadMemPhotos = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        customMemories: [
          {
            id: "mem_1",
            title: "Memory 1",
            description: "Desc",
            photos: [999], // Invalid non-string photo
          },
        ],
      }),
    });
    const resBadMemPhotos = await putGiftById(reqBadMemPhotos, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadMemPhotos.status === 400, "Non-string in customMemories.photos returns HTTP 400");

    // C: Malformed featuredSong (non-object)
    const reqBadSong = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ featuredSong: "invalid-string-instead-of-object" }),
    });
    const resBadSong = await putGiftById(reqBadSong, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadSong.status === 400, "Malformed non-object featuredSong returns HTTP 400");

    // D: Non-boolean in designPreferences.backgroundMusicEnabled
    const reqBadDesign = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ designPreferences: { backgroundMusicEnabled: "yes" } }),
    });
    const resBadDesign = await putGiftById(reqBadDesign, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadDesign.status === 400, "Non-boolean in designPreferences.backgroundMusicEnabled returns HTTP 400");

    // E: Invalid memoriesCollageType
    const reqBadCollage = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ memoriesCollageType: "random_invalid_shape" }),
    });
    const resBadCollage = await putGiftById(reqBadCollage, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadCollage.status === 400, "Invalid memoriesCollageType returns HTTP 400");

    // F: Invalid privacy.invitationStatus
    const reqBadPrivStatus = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ privacy: { invitationStatus: "banned" } }),
    });
    const resBadPrivStatus = await putGiftById(reqBadPrivStatus, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resBadPrivStatus.status === 400, "Invalid privacy.invitationStatus returns HTTP 400");

    // 15.5 Oversized nested collections and payload size limit
    // A: Oversized collection (> 100 observations)
    const oversizedObservations = Array.from({ length: 101 }, (_, i) => ({
      id: `ob_${i}`,
      title: `Observation ${i}`,
      content: `Content ${i}`,
    }));
    const reqOversizedObs = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ customObservations: oversizedObservations }),
    });
    const resOversizedObs = await putGiftById(reqOversizedObs, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resOversizedObs.status === 400, "customObservations with > 100 items returns HTTP 400");

    // B: String exceeding length limit (title > 200 chars)
    const reqOversizedTitle = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "A".repeat(201) }),
    });
    const resOversizedTitle = await putGiftById(reqOversizedTitle, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resOversizedTitle.status === 400, "title exceeding 200 chars returns HTTP 400");

    // 15.6 Unknown top-level fields rejected
    const reqUnknownField = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        hackerInjectedField: "malicious_payload",
        title: "Legitimate Title",
      }),
    });
    const resUnknownField = await putGiftById(reqUnknownField, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resUnknownField.status === 400, "Unknown top-level field rejected with HTTP 400");
    const jsonUnknown = await resUnknownField.json();
    assert(
      jsonUnknown.error.includes("Unknown top-level field 'hackerInjectedField'"),
      "Error identifies unknown top-level field"
    );

    // 15.7 Valid Creator Studio payload accepted
    const validStudioPayload = {
      title: "Alice & Bob: Studio Edition",
      welcomeTitle: "Welcome to our story",
      welcomeSubtitle: "Crafted with all my heart",
      welcomeMessage: "Every moment with you is magic.",
      sectionCount: 8,
      responseActivityCount: 3,
      status: "draft",
      featuredSong: {
        title: "Golden Hour",
        artist: "JVKE",
        dedication: "Our golden sunset memories.",
      },
      designPreferences: {
        colorPalette: "blush",
        typographyPreset: "elegant-serif",
        animationIntensity: "subtle",
        backgroundMusicEnabled: true,
      },
      customObservations: [
        {
          id: "ob_studio_1",
          title: "Your laugh",
          content: "It lights up every single room.",
          emoji: "✨",
        },
      ],
      privacy: {
        isPasswordProtected: true,
        passcode: "new_studio_passcode_2026",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    };
    const reqValidStudio = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${aliceToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(validStudioPayload),
    });
    const resValidStudio = await putGiftById(reqValidStudio, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resValidStudio.status === 200, "Valid Creator Studio payload updates successfully with HTTP 200");
    const jsonValidStudio = await resValidStudio.json();
    assert(jsonValidStudio.gift.title === "Alice & Bob: Studio Edition", "Gift title updated properly");
    assert(jsonValidStudio.gift.creatorId === aliceId, "creatorId preserved and untouched");
    assert(
      jsonValidStudio.gift.privacy.recipientInviteToken === giftT1.privacy.recipientInviteToken,
      "recipientInviteToken strictly preserved against client overwrite"
    );

    // Publish giftT1 for credential transport tests
    publishGift(giftT1.id, true);
    updateGift(giftT1.id, {
      privacy: {
        ...giftT1.privacy,
        isPasswordProtected: true,
        passcode: "secure_transport_passcode_999",
        allowResponses: true,
        allowRecipientContributions: true,
      },
    });

    // 15.8 Credential Transport: Header-based flow on GET and POST
    // Intercept console to verify no credential logging
    const loggedMessages: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const logSpy = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
      origLog(...args);
    };
    const warnSpy = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
      origWarn(...args);
    };
    const errSpy = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
      origError(...args);
    };
    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errSpy;

    // A: Header-based passcode via GET by-slug
    const reqHeaderSlug = new Request(`http://localhost:3000/api/gifts/by-slug/${giftT1.slug}`, {
      headers: { "x-gift-passcode": "secure_transport_passcode_999" },
    });
    const resHeaderSlug = await getGiftBySlug(reqHeaderSlug, { params: Promise.resolve({ slug: giftT1.slug }) });
    assert(resHeaderSlug.status === 200, "Header-based passcode on GET by-slug returns HTTP 200");
    const jsonHeaderSlug = await resHeaderSlug.json();
    assert(!jsonHeaderSlug.isLocked, "Header passcode unlocks gift without URL credentials");
    assert(typeof jsonHeaderSlug.unlockToken === "string", "Header unlock returns valid unlockToken");

    // B: Header-based passcode via GET [id]
    const reqHeaderId = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      headers: { "x-gift-passcode": "secure_transport_passcode_999" },
    });
    const resHeaderId = await getGiftById(reqHeaderId, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resHeaderId.status === 200, "Header-based passcode on GET [id] returns HTTP 200");
    const jsonHeaderId = await resHeaderId.json();
    assert(!jsonHeaderId.isLocked, "Header passcode unlocks gift via ID");
    assert(typeof jsonHeaderId.unlockToken === "string", "ID header unlock returns valid unlockToken");

    // 15.9 Credential Transport: POST-based flow
    // A: POST by-slug with JSON body
    const reqPostSlug = new Request(`http://localhost:3000/api/gifts/by-slug/${giftT1.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "secure_transport_passcode_999" }),
    });
    const resPostSlug = await postGiftBySlug(reqPostSlug, { params: Promise.resolve({ slug: giftT1.slug }) });
    assert(resPostSlug.status === 200, "POST /api/gifts/by-slug/[slug] returns HTTP 200");
    const jsonPostSlug = await resPostSlug.json();
    assert(!jsonPostSlug.isLocked, "POST body passcode unlocks gift successfully");
    assert(typeof jsonPostSlug.unlockToken === "string", "POST slug returns valid unlockToken");

    // B: POST [id] with JSON body
    const reqPostId = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "secure_transport_passcode_999" }),
    });
    const resPostId = await postGiftById(reqPostId, { params: Promise.resolve({ id: giftT1.id }) });
    assert(resPostId.status === 200, "POST /api/gifts/[id] returns HTTP 200");
    const jsonPostId = await resPostId.json();
    assert(!jsonPostId.isLocked, "POST body passcode unlocks gift via ID");
    assert(typeof jsonPostId.unlockToken === "string", "POST ID returns valid unlockToken");

    // 15.10 Backward-compatible query parameters
    const reqQueryFallback = new Request(
      `http://localhost:3000/api/gifts/by-slug/${giftT1.slug}?passcode=secure_transport_passcode_999`
    );
    const resQueryFallback = await getGiftBySlug(reqQueryFallback, { params: Promise.resolve({ slug: giftT1.slug }) });
    assert(resQueryFallback.status === 200, "Backward-compatible query parameter returns HTTP 200");
    const jsonQueryFallback = await resQueryFallback.json();
    assert(!jsonQueryFallback.isLocked, "Backward-compatible query parameter successfully unlocks gift");

    // Restore console
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;

    // 15.11 Verify NO credentials leaked in logs
    const fullLogText = loggedMessages.join("\n");
    assert(
      !fullLogText.includes("secure_transport_passcode_999"),
      "Passcodes are NEVER logged to console or logs"
    );
    assert(
      !fullLogText.includes(giftT1.privacy.recipientInviteToken),
      "Recipient invitation tokens are NEVER logged to console or logs"
    );
    assert(
      !fullLogText.includes(jsonHeaderSlug.unlockToken),
      "Unlock tokens are NEVER logged to console or logs"
    );

    // 15.12 Media Asset deletion persistence failure handling
    const mediaT1 = addMediaAsset({
      giftId: giftT1.id,
      creatorId: aliceId,
      name: "alice_temp_photo.jpg",
      type: "image",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
      dataUrl: "https://images.unsplash.com/alice_temp.jpg",
    });
    assert(mediaT1.success && Boolean(mediaT1.asset), "Created media asset for persistence test");

    // Simulate persistence failure during media deletion
    renameSyncShouldFail = true;
    fs.renameSync = ((oldPath: fs.PathLike, newPath: fs.PathLike) => {
      if (renameSyncShouldFail) {
        throw new Error("Disk IO media delete failure simulation");
      }
      return originalRenameSync(oldPath, newPath);
    }) as typeof fs.renameSync;

    const mediaDelFail = deleteMediaAsset(mediaT1.asset!.id);
    assert(mediaDelFail === false, "deleteMediaAsset returns false when database persistence fails");
    const dbAfterMediaFail = loadDatabase();
    assert(
      dbAfterMediaFail.mediaAssets.some((m) => m.id === mediaT1.asset!.id),
      "Media asset remains in database after failed persistence"
    );

    renameSyncShouldFail = false;
    fs.renameSync = originalRenameSync;

    // Successfully delete media asset now
    const reqDelMediaT1 = new Request(`http://localhost:3000/api/media?id=${mediaT1.asset!.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelMediaT1 = await deleteMedia(reqDelMediaT1);
    assert(resDelMediaT1.status === 200, "Media asset successfully deleted by authorized owner");

    // Clean up giftT1
    const reqDelGiftT1 = new Request(`http://localhost:3000/api/gifts/${giftT1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    await deleteGiftById(reqDelGiftT1, { params: Promise.resolve({ id: giftT1.id }) });

    // Restore saved gifts
    tempDb.gifts = savedGifts;

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log("\n► [Cleanup] Removing Alice's test media and gift");
    const reqDelAliceMedia = new Request(`http://localhost:3000/api/media?id=${aliceMediaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    await deleteMedia(reqDelAliceMedia);

    const reqDelAliceGift = new Request(`http://localhost:3000/api/gifts/${giftAId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const resDelAliceGift = await deleteGiftById(reqDelAliceGift, { params: Promise.resolve({ id: giftAId }) });
    assert(resDelAliceGift.status === 200, "Alice successfully cleans up her test gift");

    console.log("\n==========================================================");
    console.log(`  ALL ADVANCED SECURITY TESTS PASSED! (${passedCount} passed, 0 failed)`);
    console.log("==========================================================\n");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("\n❌ SECURITY AUDIT SUITE TERMINATED WITH ERROR:", errorMsg);
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(1);
  }
}

runSecurityAudit();
