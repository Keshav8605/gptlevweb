// Direct in-process E2E Regression Suite for existing application functionality
// Tests all business logic journeys across Phase 1-6

import crypto from "crypto";
import { POST as postGifts } from "../src/app/api/gifts/route";
import {
  PUT as putGiftById,
  DELETE as deleteGiftById,
} from "../src/app/api/gifts/[id]/route";
import { POST as postPublishGift } from "../src/app/api/gifts/[id]/publish/route";
import { GET as getGiftBySlug } from "../src/app/api/gifts/by-slug/[slug]/route";
import { POST as postSecretVerify } from "../src/app/api/secret/verify/route";
import { POST as postReaction } from "../src/app/api/interactions/reactions/route";
import { POST as postComment } from "../src/app/api/interactions/comments/route";
import { POST as postNotebook } from "../src/app/api/notebook/route";
import { GET as getResponses } from "../src/app/api/creator/responses/route";
import { POST as postDateProposals } from "../src/app/api/dates/proposals/route";
import { POST as postDateTransition } from "../src/app/api/dates/proposals/[id]/transition/route";
import { POST as postDateMemory } from "../src/app/api/dates/memories/route";
import { POST as postMediaUpload } from "../src/app/api/media/upload/route";
import { DELETE as deleteMedia } from "../src/app/api/media/route";

const TEST_JWT_SECRET = "test-crypto-secret-key-for-supabase-audit-32-chars-min!";
process.env.SUPABASE_JWT_SECRET = TEST_JWT_SECRET;
process.env.GIFT_UNLOCK_SECRET = "test-crypto-gift-unlock-secret-min-32-chars-long!";
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

function makeGenuineTestJwt(sub: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 7200;
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      email,
      role: "authenticated",
      aud: "authenticated",
      iss: "https://audit.supabase.co/auth/v1",
      exp,
    })
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

async function runRegressionSuite() {
  console.log("==========================================================");
  console.log("  GPTLEVWEB — EXISTING APPLICATION REGRESSION SUITE       ");
  console.log("==========================================================\n");

  const creatorToken = makeGenuineTestJwt("test_creator_e2e_id", "creator@example.com");
  const creatorHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${creatorToken}`,
  };

  let testGiftId = "";
  const testGiftSlug = `test-e2e-${Date.now()}`;

  try {
    // ----------------------------------------------------
    // JOURNEY A: Gift Lifecycle (Create, Save, Publish, Draft Protection)
    // ----------------------------------------------------
    console.log("► [Journey A] Gift Lifecycle (Create, Save, Preview & Publish)");
    const reqCreate = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({
        title: "Test Romantic Sanctuary ♡",
        senderName: "Romeo",
        senderNickname: "Babe",
        recipientName: "Juliet",
        recipientNickname: "My Love",
        welcomeTitle: "A Secret Garden",
        welcomeSubtitle: "Just for you",
        welcomeMessage: "Every flower here blooms because of you.",
        slug: testGiftSlug,
        enabledSections: ["welcome", "observations", "memories", "secretWorld", "finalHeart"],
        sectionOrder: ["welcome", "observations", "memories", "secretWorld", "finalHeart"],
        privacy: {
          isPasswordProtected: false,
          passcode: "qa-pass-123",
          recipientInviteToken: `inv-${Date.now()}`,
          invitationStatus: "active",
          allowResponses: true,
          allowRecipientContributions: true,
        },
      }),
    });
    const resCreate = await postGifts(reqCreate);
    assert(resCreate.status === 200, "POST /api/gifts creates draft gift with status 200");
    const dataCreate = await resCreate.json();
    testGiftId = dataCreate.gift.id;
    assert(dataCreate.gift.status === "draft", "New gift starts in 'draft' status");

    // 2. Update Draft
    const reqUpdate = new Request(`http://localhost:3000/api/gifts/${testGiftId}`, {
      method: "PUT",
      headers: creatorHeaders,
      body: JSON.stringify({
        welcomeMessage: "Updated love message with more tenderness.",
      }),
    });
    const resUpdate = await putGiftById(reqUpdate, { params: Promise.resolve({ id: testGiftId }) });
    assert(resUpdate.status === 200, "PUT /api/gifts/[id] updates draft successfully");
    const dataUpdate = await resUpdate.json();
    assert(
      dataUpdate.gift.welcomeMessage === "Updated love message with more tenderness.",
      "Draft content persists correctly across updates"
    );

    // 3. Duplicate Gift
    const reqDup = new Request("http://localhost:3000/api/gifts", {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({ sourceGiftId: testGiftId }),
    });
    const resDup = await postGifts(reqDup);
    assert(resDup.status === 200, "Gift duplication via sourceGiftId succeeds");
    const dataDup = await resDup.json();
    assert(dataDup.gift.title.includes("Copy"), "Duplicated gift receives proper title");
    // Clean up duplicate
    const reqDupDel = new Request(`http://localhost:3000/api/gifts/${dataDup.gift.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    await deleteGiftById(reqDupDel, { params: Promise.resolve({ id: dataDup.gift.id }) });

    // 4. Draft Protection: Attempt to access draft publicly without auth
    const reqDraftPub = new Request(`http://localhost:3000/api/gifts/by-slug/${testGiftSlug}`);
    const resDraftPub = await getGiftBySlug(reqDraftPub, { params: Promise.resolve({ slug: testGiftSlug }) });
    assert(
      resDraftPub.status === 403,
      "Unpublished draft is protected from unauthorized public access (HTTP 403)"
    );

    // 5. Publish the Gift
    const reqPub = new Request(`http://localhost:3000/api/gifts/${testGiftId}/publish`, {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({ status: "published" }),
    });
    const resPub = await postPublishGift(reqPub, { params: Promise.resolve({ id: testGiftId }) });
    assert(resPub.status === 200, "POST /api/gifts/[id]/publish succeeds");
    const dataPub = await resPub.json();
    assert(dataPub.gift.status === "published", "Gift status transitions to 'published'");

    // 6. Access Published Gift Publicly
    const reqPubAccess = new Request(`http://localhost:3000/api/gifts/by-slug/${testGiftSlug}`);
    const resPubAccess = await getGiftBySlug(reqPubAccess, { params: Promise.resolve({ slug: testGiftSlug }) });
    assert(resPubAccess.status === 200, "Published gift is now accessible publicly (HTTP 200)");
    const dataPubAccess = await resPubAccess.json();
    assert(
      dataPubAccess.gift.privacy.passcode === undefined,
      "Plaintext passcode is stripped from public recipient payload"
    );
    assert(
      dataPubAccess.gift.privacy.recipientInviteToken === undefined,
      "recipientInviteToken is stripped from public recipient payload"
    );

    // ----------------------------------------------------
    // JOURNEY B: Secret World Verification & Rate Limiting
    // ----------------------------------------------------
    console.log("\n► [Journey B] Secret World Verification & Rate Limiting");
    const reqWrongSecret = new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrongpassword123" }),
    });
    const resWrongSecret = await postSecretVerify(reqWrongSecret);
    assert(resWrongSecret.status === 401, "Incorrect password returns 401 Unauthorized");
    const dataWrongSecret = await resWrongSecret.json();
    assert(dataWrongSecret.remainingAttempts !== undefined, "Remaining attempts counter is returned");

    const reqCorrectSecret = new Request("http://localhost:3000/api/secret/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "iloveyou" }),
    });
    const resCorrectSecret = await postSecretVerify(reqCorrectSecret);
    assert(resCorrectSecret.status === 200, "Correct password unlocks secret with 200 OK");
    const dataCorrectSecret = await resCorrectSecret.json();
    assert(Boolean(dataCorrectSecret.content?.letter), "Private letter is successfully revealed upon unlock");

    // ----------------------------------------------------
    // JOURNEY C: Two-Way Interactions Persistence
    // ----------------------------------------------------
    console.log("\n► [Journey C] Two-Way Interactions (Reactions, Comments, Notebook)");
    const reqReaction = new Request("http://localhost:3000/api/interactions/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        targetType: "observation",
        targetId: "ob1",
        emoji: "💖",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    const resReaction = await postReaction(reqReaction);
    assert(resReaction.status === 200, "POST /api/interactions/reactions succeeds");

    const reqComment = new Request("http://localhost:3000/api/interactions/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        targetType: "memory",
        targetId: "m1",
        content: "I remember this day so vividly. You looked handsome in the rain.",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    const resComment = await postComment(reqComment);
    assert(resComment.status === 200, "POST /api/interactions/comments persists comment");

    const reqNotebook = new Request("http://localhost:3000/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        title: "Under the stars",
        content: "Listening to the crickets while holding your hand.",
        prompt: "A moment I felt closest to you",
        moodEmoji: "✨",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    const resNotebook = await postNotebook(reqNotebook);
    assert(resNotebook.status === 200, "POST /api/notebook adds journal entry");

    const reqRespSummary = new Request(`http://localhost:3000/api/creator/responses?giftId=${testGiftId}`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const resRespSummary = await getResponses(reqRespSummary);
    assert(resRespSummary.status === 200, "Creator Response Center retrieves submitted feedback (HTTP 200)");
    const dataRespSummary = await resRespSummary.json();
    assert(dataRespSummary.summary.totalRecipientComments > 0, "Real comments appear in Creator Response Center");
    assert(dataRespSummary.summary.totalJournalEntries > 0, "Real journal entries appear in Creator Response Center");

    // ----------------------------------------------------
    // JOURNEY D: Collaborative Date Planner Workflow
    // ----------------------------------------------------
    console.log("\n► [Journey D] Collaborative Date Planner Workflow");
    const reqProposal = new Request("http://localhost:3000/api/dates/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        title: "Moonlit Seaside Stroll & Gelato",
        proposedDate: "2026-10-25",
        proposedStartTime: "19:30",
        itinerary: [
          {
            title: "Artisan Gelato at Dolceria",
            estimatedDurationMinutes: 45,
            notes: "Two scoops of pistacchio and dark chocolate",
          },
        ],
        proposerRole: "creator",
        proposerName: "Romeo",
      }),
    });
    const resProposal = await postDateProposals(reqProposal);
    assert(resProposal.status === 200, "POST /api/dates/proposals creates new proposal");
    const dataProposal = await resProposal.json();
    const createdProposalId = dataProposal.proposal.id;

    // Transition Accept
    const reqAccept = new Request(`http://localhost:3000/api/dates/proposals/${createdProposalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept",
        role: "recipient",
        name: "Juliet",
        note: "I cannot wait for gelato with you!",
      }),
    });
    const resAccept = await postDateTransition(reqAccept, { params: Promise.resolve({ id: createdProposalId }) });
    assert(resAccept.status === 200, "POST transition 'accept' succeeds");
    const dataAccept = await resAccept.json();
    assert(dataAccept.proposal.status === "confirmed", "Proposal transitions to 'confirmed'");

    // Transition Complete
    const reqComplete = new Request(`http://localhost:3000/api/dates/proposals/${createdProposalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        role: "recipient",
        name: "Juliet",
      }),
    });
    const resComplete = await postDateTransition(reqComplete, { params: Promise.resolve({ id: createdProposalId }) });
    assert(resComplete.status === 200, "POST transition 'complete' succeeds");

    // Add Memory
    const reqMemory = new Request("http://localhost:3000/api/dates/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        proposalId: createdProposalId,
        dateTitle: "Moonlit Seaside Stroll & Gelato",
        rating: 5,
        favoriteMoment: "When you wiped gelato off my nose with your thumb and kissed me.",
        authorRole: "recipient",
        authorName: "Juliet",
      }),
    });
    const resMemory = await postDateMemory(reqMemory);
    assert(resMemory.status === 200, "Post-date memory persisted successfully");

    // ----------------------------------------------------
    // JOURNEY E: Media Vault Upload & Delete
    // ----------------------------------------------------
    console.log("\n► [Journey E] Media Vault Upload & Validation");
    // Invalid MIME
    const reqInvalidMime = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({
        giftId: testGiftId,
        name: "malicious.exe",
        mimeType: "application/x-msdownload",
        sizeBytes: 1024,
        dataUrl: "data:application/x-msdownload;base64,TVqQAA==",
      }),
    });
    const resInvalidMime = await postMediaUpload(reqInvalidMime);
    assert(resInvalidMime.status === 400, "Server rejects invalid/executable MIME types (HTTP 400)");

    // Valid upload with genuine JPEG magic bytes
    const validJpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const validJpgDataUrl = `data:image/jpeg;base64,${validJpgBuf.toString("base64")}`;

    const reqValidMedia = new Request("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({
        giftId: testGiftId,
        name: "seaside_kiss.jpg",
        mimeType: "image/jpeg",
        sizeBytes: validJpgBuf.length,
        dataUrl: validJpgDataUrl,
        caption: "By the seaside at sunset",
      }),
    });
    const resValidMedia = await postMediaUpload(reqValidMedia);
    assert(resValidMedia.status === 200, "Valid media asset upload succeeds (HTTP 200)");
    const dataValidMedia = await resValidMedia.json();

    // Delete media
    const reqDelMedia = new Request(`http://localhost:3000/api/media?id=${dataValidMedia.asset.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const resDelMedia = await deleteMedia(reqDelMedia);
    assert(resDelMedia.status === 200, "DELETE /api/media removes asset successfully");

    // ----------------------------------------------------
    // JOURNEY F: Unpublishing & Access Revocation
    // ----------------------------------------------------
    console.log("\n► [Journey F] Unpublishing & Access Revocation");
    const reqUnpub = new Request(`http://localhost:3000/api/gifts/${testGiftId}/publish`, {
      method: "POST",
      headers: creatorHeaders,
      body: JSON.stringify({ status: "unpublished" }),
    });
    const resUnpub = await postPublishGift(reqUnpub, { params: Promise.resolve({ id: testGiftId }) });
    assert(resUnpub.status === 200, "POST /api/gifts/[id]/publish unpublish succeeds");

    const reqUnpubCheck = new Request(`http://localhost:3000/api/gifts/by-slug/${testGiftSlug}`);
    const resUnpubCheck = await getGiftBySlug(reqUnpubCheck, { params: Promise.resolve({ slug: testGiftSlug }) });
    assert(resUnpubCheck.status === 403, "Unpublished gift returns HTTP 403 to public visitors immediately");

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log("\n► [Cleanup] Removing test gift");
    const reqCleanup = new Request(`http://localhost:3000/api/gifts/${testGiftId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const resCleanup = await deleteGiftById(reqCleanup, { params: Promise.resolve({ id: testGiftId }) });
    assert(resCleanup.status === 200, "Test gift cleaned up successfully");

    console.log("\n==========================================================");
    console.log(`  ALL REGRESSION TESTS PASSED! (${passedCount} passed, 0 failed)`);
    console.log("==========================================================\n");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("\n❌ REGRESSION TEST SUITE TERMINATED WITH ERROR:", errorMsg);
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(1);
  }
}

runRegressionSuite();
