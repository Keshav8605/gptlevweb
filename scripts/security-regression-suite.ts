// Comprehensive Security Regression Test Suite
// Verifies cryptographic JWT enforcement, media upload controls, tenant isolation,
// legacy gift protections, secret configuration controls, and field immutability.

import crypto from "crypto";
import { ReadableStream } from "stream/web";
import { GET as getGifts, POST as postGifts } from "../src/app/api/gifts/route";
import {
  GET as getGiftById,
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
import { GET as getGiftBySlug } from "../src/app/api/gifts/by-slug/[slug]/route";
import { GET as getMedia, DELETE as deleteMedia } from "../src/app/api/media/route";
import { POST as postMediaUpload } from "../src/app/api/media/upload/route";
import { createGift, addMediaAsset, deleteMediaAsset } from "../src/lib/server-db";
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

    // 2c. Public recipient accessing media for unpublished draft
    const reqPublicWrongGift = new Request(`http://localhost:3000/api/media?giftId=${giftAId}`);
    const resPublicWrongGift = await getMedia(reqPublicWrongGift);
    assert(
      resPublicWrongGift.status === 403,
      `Public recipient accessing media for wrong/unpublished gift rejected with HTTP 403 (got ${resPublicWrongGift.status})`
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
      resOrdinaryMedia.status === 200,
      `Public media access to an ordinary published gift succeeds (HTTP ${resOrdinaryMedia.status})`
    );
    const ordinaryData = await resOrdinaryMedia.json();
    assert(
      Array.isArray(ordinaryData.assets) &&
        ordinaryData.assets.some((a: { id: string }) => a.id === ordinaryMediaId),
      "Ordinary published gift media returned to public visitor"
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
      resPwMediaNoUnlock.status === 403,
      `Public media access to a password-protected published gift without unlocking is rejected (got HTTP ${resPwMediaNoUnlock.status})`
    );

    // Also verify client-controlled boolean ?unlocked=true is not trusted
    const reqFakeUnlocked = new Request(`http://localhost:3000/api/media?giftId=${pwGiftA.id}&unlocked=true`);
    const resFakeUnlocked = await getMedia(reqFakeUnlocked);
    assert(
      resFakeUnlocked.status === 403,
      `Client-controlled boolean ?unlocked=true is rejected with HTTP 403 (got ${resFakeUnlocked.status})`
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
