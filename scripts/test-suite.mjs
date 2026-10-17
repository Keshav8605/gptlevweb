// Comprehensive Automated Verification Suite for Phases 1-6
// Tests all End-to-End User Journeys, Security, API endpoints, and Business Logic

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log("==========================================================");
  console.log("  ROMANTIC GIFTING APPLICATION — AUTOMATED TEST SUITE    ");
  console.log(`  Target: ${BASE_URL}                                   `);
  console.log("==========================================================\n");

  let testGiftId = null;
  let testGiftSlug = `test-qa-${Date.now()}`;

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: Application Health & Root Routes
    // ----------------------------------------------------
    console.log("► [Suite 1] Core Route Health Checks");
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Home page loads with status 200");

    const studioRes = await fetch(`${BASE_URL}/studio`);
    assert(studioRes.status === 200, "Creator Studio page loads with status 200");

    const sweetheartRes = await fetch(`${BASE_URL}/gift/sweetheart`);
    assert(sweetheartRes.status === 200, "Default published gift (/gift/sweetheart) loads with status 200");

    // ----------------------------------------------------
    // TEST SUITE 2: Journey A — Create, Save, Preview & Publish Gift
    // ----------------------------------------------------
    console.log("\n► [Suite 2] Journey A: Multi-Gift Creation & Publishing");
    
    // 1. Create a draft gift
    const createRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    assert(createRes.status === 200, "POST /api/gifts returns 200 OK");
    const createData = await createRes.json();
    assert(createData.success && createData.gift?.id, "New gift created with valid ID");
    testGiftId = createData.gift.id;
    assert(createData.gift.status === "draft", "New gift starts in 'draft' status");

    // 2. Update Draft (Autosave / Manual Save)
    const updateRes = await fetch(`${BASE_URL}/api/gifts/${testGiftId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        welcomeMessage: "Updated love message with more tenderness.",
      }),
    });
    assert(updateRes.status === 200, "PUT /api/gifts/[id] updates draft successfully");
    const updateData = await updateRes.json();
    assert(
      updateData.gift.welcomeMessage === "Updated love message with more tenderness.",
      "Draft content persists correctly across updates"
    );

    // 3. Duplicate Gift
    const dupRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceGiftId: testGiftId }),
    });
    assert(dupRes.status === 200, "Gift duplication via sourceGiftId succeeds");
    const dupData = await dupRes.json();
    assert(dupData.gift.title.includes("Copy"), "Duplicated gift receives proper title");
    // Clean up duplicate
    await fetch(`${BASE_URL}/api/gifts/${dupData.gift.id}`, { method: "DELETE" });

    // 4. Verify Draft Protection: Attempt to access draft publicly without auth
    const draftPublicRes = await fetch(`${BASE_URL}/api/gifts/by-slug/${testGiftSlug}`);
    assert(
      draftPublicRes.status === 403,
      "Unpublished draft is protected from unauthorized public access (HTTP 403)"
    );

    // 5. Publish the Gift
    const pubRes = await fetch(`${BASE_URL}/api/gifts/${testGiftId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    assert(pubRes.status === 200, "POST /api/gifts/[id]/publish succeeds");
    const pubData = await pubRes.json();
    assert(pubData.gift.status === "published", "Gift status transitions to 'published'");

    // 6. Access the Published Gift Publicly
    const publishedAccessRes = await fetch(`${BASE_URL}/api/gifts/by-slug/${testGiftSlug}`);
    assert(publishedAccessRes.status === 200, "Published gift is now accessible publicly (HTTP 200)");
    const publishedAccessData = await publishedAccessRes.json();

    // ----------------------------------------------------
    // TEST SUITE 3: Security & Privacy Sanitization
    // ----------------------------------------------------
    console.log("\n► [Suite 3] Security & Privacy Sanitization");
    assert(
      publishedAccessData.gift.privacy.passcode === undefined,
      "Security: Plaintext passcode is stripped from public recipient payload"
    );
    assert(
      publishedAccessData.gift.secretPassword === undefined,
      "Security: Secret World password is stripped from public recipient payload"
    );
    assert(
      publishedAccessData.gift.secretContent === undefined,
      "Security: Secret World private letter is protected and not leaked in initial payload"
    );

    // ----------------------------------------------------
    // TEST SUITE 4: Journey B — Secret World Verification & Rate Limiting
    // ----------------------------------------------------
    console.log("\n► [Suite 4] Journey B: Secret World Rate Limiting & Unlock");
    
    // Test incorrect password
    const wrongSecretRes = await fetch(`${BASE_URL}/api/secret/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrongpassword123" }),
    });
    assert(wrongSecretRes.status === 401, "Incorrect password returns 401 Unauthorized");
    const wrongData = await wrongSecretRes.json();
    assert(wrongData.remainingAttempts !== undefined, "Remaining attempts counter is returned");

    // Test correct password
    const correctSecretRes = await fetch(`${BASE_URL}/api/secret/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "iloveyou" }),
    });
    assert(correctSecretRes.status === 200, "Correct password unlocks secret with 200 OK");
    const correctData = await correctSecretRes.json();
    assert(correctData.success && correctData.content?.letter, "Private letter is successfully revealed upon unlock");

    // ----------------------------------------------------
    // TEST SUITE 5: Journey C — Two-Way Interactions Persistence
    // ----------------------------------------------------
    console.log("\n► [Suite 5] Journey C: Two-Way Interactions Persistence");
    
    // 1. Submit a reaction
    const reactionRes = await fetch(`${BASE_URL}/api/interactions/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "observation",
        targetId: "ob1",
        emoji: "💖",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    assert(reactionRes.status === 200, "POST /api/interactions/reactions succeeds");

    // 2. Submit a love comment
    const commentRes = await fetch(`${BASE_URL}/api/interactions/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "memory",
        targetId: "m1",
        content: "I remember this day so vividly. You looked handsome in the rain.",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    assert(commentRes.status === 200, "POST /api/interactions/comments persists comment");

    // 3. Submit a shared journal entry
    const journalRes = await fetch(`${BASE_URL}/api/notebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Under the stars",
        content: "Listening to the crickets while holding your hand.",
        prompt: "A moment I felt closest to you",
        moodEmoji: "✨",
        author: "recipient",
        authorName: "Juliet",
      }),
    });
    assert(journalRes.status === 200, "POST /api/notebook adds journal entry");

    // 4. Verify Creator Response Center sees the submitted feedback
    const responseCenterRes = await fetch(`${BASE_URL}/api/creator/responses`);
    assert(responseCenterRes.status === 200, "GET /api/creator/responses returns 200");
    const responseJson = await responseCenterRes.json();
    const responseSummary = responseJson.summary || responseJson;
    assert(
      responseSummary.totalRecipientComments > 0,
      "Real persisted comments appear in Creator Response Center"
    );
    assert(
      responseSummary.totalJournalEntries > 0,
      "Real persisted journal entries appear in Creator Response Center"
    );

    // ----------------------------------------------------
    // TEST SUITE 6: Journey D — Date Planner State Machine & Lifecycle
    // ----------------------------------------------------
    console.log("\n► [Suite 6] Journey D: Collaborative Date Planner Workflow");
    
    // 1. Propose a new date
    const proposalRes = await fetch(`${BASE_URL}/api/dates/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Moonlit Seaside Stroll & Gelato",
        proposedDate: "2026-10-25",
        proposedStartTime: "19:30",
        itinerary: [
          {
            title: "Artisan Gelato at Dolceria",
            estimatedDurationMinutes: 45,
            notes: "Two scoops of pistacchio and dark chocolate",
          },
          {
            title: "Seaside Boardwalk Walk",
            estimatedDurationMinutes: 60,
            notes: "Holding hands by the waves",
          },
        ],
        proposerRole: "creator",
        proposerName: "Romeo",
      }),
    });
    assert(proposalRes.status === 200, "POST /api/dates/proposals creates new proposal");
    const proposalData = await proposalRes.json();
    const createdProposalId = proposalData.proposal.id;
    assert(proposalData.proposal.status === "proposed", "New proposal starts with status 'proposed'");

    // 2. Accept Proposal (Partner accepts)
    const acceptRes = await fetch(`${BASE_URL}/api/dates/proposals/${createdProposalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept",
        role: "recipient",
        name: "Juliet",
        note: "I cannot wait for gelato with you!",
      }),
    });
    assert(acceptRes.status === 200, "POST transition 'accept' succeeds");
    const acceptData = await acceptRes.json();
    assert(acceptData.proposal.status === "confirmed", "Proposal transitions to 'confirmed'");
    assert(
      acceptData.proposal.history.some((h) => h.action === "accepted"),
      "Audit history tracks the acceptance action with author details"
    );

    // 3. Reschedule Proposal
    const reschedRes = await fetch(`${BASE_URL}/api/dates/proposals/${createdProposalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reschedule",
        proposedDate: "2026-10-26",
        proposedStartTime: "20:00",
        role: "creator",
        name: "Romeo",
        note: "Moved by 30 mins for the sunset glow",
      }),
    });
    assert(reschedRes.status === 200, "POST transition 'reschedule' succeeds");
    const reschedData = await reschedRes.json();
    assert(reschedData.proposal.proposedDate === "2026-10-26", "Event date updated to rescheduled date");

    // 4. Complete Date
    const completeRes = await fetch(`${BASE_URL}/api/dates/proposals/${createdProposalId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        role: "recipient",
        name: "Juliet",
      }),
    });
    assert(completeRes.status === 200, "POST transition 'complete' succeeds");
    const completeData = await completeRes.json();
    assert(completeData.proposal.status === "completed", "Proposal status marked as 'completed'");

    // 5. Add post-date memory
    const memoryRes = await fetch(`${BASE_URL}/api/dates/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalId: createdProposalId,
        dateTitle: "Moonlit Seaside Stroll & Gelato",
        rating: 5,
        favoriteMoment: "When you wiped gelato off my nose with your thumb and kissed me.",
        authorRole: "recipient",
        authorName: "Juliet",
      }),
    });
    assert(memoryRes.status === 200, "Post-date memory persisted successfully");

    // ----------------------------------------------------
    // TEST SUITE 7: Media Vault Validation & Upload Security
    // ----------------------------------------------------
    console.log("\n► [Suite 7] Media Vault Validation & Upload Security");
    
    // 1. Invalid mime type rejection
    const invalidMimeRes = await fetch(`${BASE_URL}/api/media/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "malicious.exe",
        mimeType: "application/x-msdownload",
        sizeBytes: 1024,
        dataUrl: "data:application/x-msdownload;base64,TVqQAA==",
      }),
    });
    assert(invalidMimeRes.status === 400, "Server rejects invalid/executable MIME types (HTTP 400)");

    // 2. Oversized file rejection (> 10MB)
    const oversizeRes = await fetch(`${BASE_URL}/api/media/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "giant_video.mp4",
        mimeType: "image/jpeg",
        sizeBytes: 12 * 1024 * 1024, // 12 MB
        dataUrl: "data:image/jpeg;base64,...",
      }),
    });
    assert(oversizeRes.status === 400, "Server rejects files exceeding 10MB limit (HTTP 400)");

    // 3. Valid photo asset upload
    const validUploadRes = await fetch(`${BASE_URL}/api/media/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: testGiftId,
        name: "seaside_kiss.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 15400,
        dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
        caption: "By the seaside at sunset",
      }),
    });
    assert(validUploadRes.status === 200, "Valid media asset upload succeeds (HTTP 200)");
    const uploadData = await validUploadRes.json();
    assert(uploadData.asset?.id, "Uploaded asset assigned unique ID");

    // 4. Delete media asset
    const delMediaRes = await fetch(`${BASE_URL}/api/media?id=${uploadData.asset.id}`, {
      method: "DELETE",
    });
    assert(delMediaRes.status === 200, "DELETE /api/media removes asset successfully");

    // ----------------------------------------------------
    // TEST SUITE 8: Journey E — Unpublishing & Access Revocation
    // ----------------------------------------------------
    console.log("\n► [Suite 8] Journey E: Unpublishing & Access Revocation");
    
    // 1. Unpublish gift
    const unpubRes = await fetch(`${BASE_URL}/api/gifts/${testGiftId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "unpublished" }),
    });
    assert(unpubRes.status === 200, "POST /api/gifts/[id]/publish unpublish succeeds");

    // 2. Verify unauthorized public access is immediately blocked
    const unpubCheckRes = await fetch(`${BASE_URL}/api/gifts/by-slug/${testGiftSlug}`);
    assert(
      unpubCheckRes.status === 403,
      "Unpublished gift returns HTTP 403 to public visitors immediately"
    );

    // ----------------------------------------------------
    // CLEANUP: Delete Test Gift
    // ----------------------------------------------------
    console.log("\n► [Cleanup] Removing test gift");
    const cleanupRes = await fetch(`${BASE_URL}/api/gifts/${testGiftId}`, { method: "DELETE" });
    assert(cleanupRes.status === 200, "Test gift cleaned up successfully");

    console.log("\n==========================================================");
    console.log(`  ALL TESTS PASSED! (${passedCount} passed, 0 failed)`);
    console.log("==========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST SUITE RUN TERMINATED WITH ERROR:", err.message);
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(1);
  }
}

runTestSuite();
