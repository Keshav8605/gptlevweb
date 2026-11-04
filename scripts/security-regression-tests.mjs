// Automated Security Regression Test Suite
// Verifies authorization boundaries, token isolation, privilege separation, and privacy sanitization

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

function makeTestJwt(sub, email, expired = false) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = expired ? Math.floor(Date.now() / 1000) - 3600 : Math.floor(Date.now() / 1000) + 7200;
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      email,
      role: "authenticated",
      aud: "authenticated",
      exp,
    })
  ).toString("base64url");
  return `${header}.${payload}.signature_test`;
}

async function runSecurityTests() {
  console.log("==========================================================");
  console.log("  GPTLEVWEB — SECURITY REGRESSION TEST SUITE              ");
  console.log(`  Target: ${BASE_URL}                                     `);
  console.log("==========================================================\n");

  const userAToken = makeTestJwt("creator_alice_123", "alice@example.com");
  const userBToken = makeTestJwt("creator_bob_456", "bob@example.com");
  const expiredToken = makeTestJwt("creator_alice_123", "alice@example.com", true);
  const invalidToken = "invalid-unparseable-token-string";
  const recipientToken = "sweetheart";

  let giftAId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Unauthenticated Gift Creation
    // ----------------------------------------------------
    console.log("► [Test 1] Unauthenticated gift creation rejection");
    const unauthCreateRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Attacker Gift Without Auth" }),
    });
    assert(
      unauthCreateRes.status === 401,
      `Unauthenticated gift creation rejected with HTTP 401 (got ${unauthCreateRes.status})`
    );

    // Setup: Create a gift legitimately as User A for subsequent ownership tests
    const legitCreateRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: "Alice's Private Sanctuary ♡",
        senderName: "Alice",
        recipientName: "Wonderland",
        privacy: {
          isPasswordProtected: true,
          passcode: "alice-secret-passcode",
          recipientInviteToken: `alice-invite-${Date.now()}`,
          invitationStatus: "active",
          allowResponses: true,
          allowRecipientContributions: true,
        },
      }),
    });
    assert(legitCreateRes.status === 200, "Legitimate creator Alice can create gift with valid auth");
    const legitCreateData = await legitCreateRes.json();
    giftAId = legitCreateData.gift.id;
    assert(Boolean(giftAId), "Alice's gift created with valid ID");

    // ----------------------------------------------------
    // TEST 2: Unauthenticated Gift Update
    // ----------------------------------------------------
    console.log("\n► [Test 2] Unauthenticated gift update rejection");
    const unauthUpdateRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ welcomeMessage: "Hacked by unauthenticated visitor" }),
    });
    assert(
      unauthUpdateRes.status === 401,
      `Unauthenticated gift update rejected with HTTP 401 (got ${unauthUpdateRes.status})`
    );

    // ----------------------------------------------------
    // TEST 3: Unauthenticated Gift Deletion
    // ----------------------------------------------------
    console.log("\n► [Test 3] Unauthenticated gift deletion rejection");
    const unauthDeleteRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      method: "DELETE",
    });
    assert(
      unauthDeleteRes.status === 401,
      `Unauthenticated gift deletion rejected with HTTP 401 (got ${unauthDeleteRes.status})`
    );

    // ----------------------------------------------------
    // TEST 4: Invalid and Expired Creator Tokens
    // ----------------------------------------------------
    console.log("\n► [Test 4] Invalid and expired creator token rejection");
    const invalidTokenRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${invalidToken}`,
      },
      body: JSON.stringify({ title: "Gift With Invalid Token" }),
    });
    assert(
      invalidTokenRes.status === 401,
      `Invalid creator token rejected with HTTP 401 (got ${invalidTokenRes.status})`
    );

    const expiredTokenRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expiredToken}`,
      },
      body: JSON.stringify({ title: "Gift With Expired Token" }),
    });
    assert(
      expiredTokenRes.status === 401,
      `Expired creator token rejected with HTTP 401 (got ${expiredTokenRes.status})`
    );

    // ----------------------------------------------------
    // TEST 5: Recipient Token Attempting Creator Actions
    // ----------------------------------------------------
    console.log("\n► [Test 5] Recipient token privilege escalation rejection");
    const recipientCreateRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recipientToken}`,
      },
      body: JSON.stringify({ title: "Gift From Recipient" }),
    });
    assert(
      recipientCreateRes.status === 403,
      `Recipient token attempting gift creation rejected with HTTP 403 (got ${recipientCreateRes.status})`
    );

    const recipientPatchConfigRes = await fetch(`${BASE_URL}/api/auth/access`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recipientToken}`,
      },
      body: JSON.stringify({ invitationStatus: "revoked" }),
    });
    assert(
      recipientPatchConfigRes.status === 403,
      `Recipient token attempting config mutation rejected with HTTP 403 (got ${recipientPatchConfigRes.status})`
    );

    const recipientResponsesRes = await fetch(`${BASE_URL}/api/creator/responses?token=${recipientToken}`);
    assert(
      recipientResponsesRes.status === 403,
      `Recipient token attempting responses access rejected with HTTP 403 (got ${recipientResponsesRes.status})`
    );

    // ----------------------------------------------------
    // TEST 6: Cross-Tenant Gift Ownership Enforcement
    // ----------------------------------------------------
    console.log("\n► [Test 6] Authenticated user attempting to access another user's gift");
    // User B tries to read User A's private draft
    const crossReadRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert(
      crossReadRes.status === 403,
      `Bob reading Alice's private draft rejected with HTTP 403 (got ${crossReadRes.status})`
    );

    // User B tries to update User A's gift
    const crossUpdateRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ title: "Bob Hijacked Alice's Gift" }),
    });
    assert(
      crossUpdateRes.status === 403,
      `Bob updating Alice's gift rejected with HTTP 403 (got ${crossUpdateRes.status})`
    );

    // User B tries to publish/unpublish User A's gift
    const crossPublishRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ status: "published" }),
    });
    assert(
      crossPublishRes.status === 403,
      `Bob publishing Alice's gift rejected with HTTP 403 (got ${crossPublishRes.status})`
    );

    // User B tries to delete User A's gift
    const crossDeleteRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert(
      crossDeleteRes.status === 403,
      `Bob deleting Alice's gift rejected with HTTP 403 (got ${crossDeleteRes.status})`
    );

    // User B tries to duplicate Alice's private draft
    const crossDuplicateRes = await fetch(`${BASE_URL}/api/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ sourceGiftId: giftAId }),
    });
    assert(
      crossDuplicateRes.status === 403,
      `Bob duplicating Alice's private draft rejected with HTTP 403 (got ${crossDuplicateRes.status})`
    );

    // ----------------------------------------------------
    // TEST 7: Public Invitation Token Disclosure Prevention
    // ----------------------------------------------------
    console.log("\n► [Test 7] Public invitation token disclosure prevention");
    // 1. GET /api/gifts public listing
    const publicGiftsRes = await fetch(`${BASE_URL}/api/gifts`);
    assert(publicGiftsRes.status === 200, "Public gifts listing returns 200");
    const publicGiftsData = await publicGiftsRes.json();
    const giftsWithInviteToken = (publicGiftsData.gifts || []).filter(
      (g) => g.privacy && g.privacy.recipientInviteToken !== undefined
    );
    assert(
      giftsWithInviteToken.length === 0,
      `Zero invitation tokens disclosed in GET /api/gifts (found: ${giftsWithInviteToken.length})`
    );

    // 2. GET /api/auth/access public endpoint
    const publicAccessRes = await fetch(`${BASE_URL}/api/auth/access`);
    assert(publicAccessRes.status === 200, "GET /api/auth/access returns 200");
    const publicAccessData = await publicAccessRes.json();
    assert(
      publicAccessData.recipientInviteToken === undefined,
      "recipientInviteToken is not exposed in public GET /api/auth/access"
    );
    assert(
      publicAccessData.creatorPasscode === undefined,
      "creatorPasscode is not exposed in public GET /api/auth/access"
    );

    // 3. GET /api/gifts/by-slug/romantic-world
    const publicSlugRes = await fetch(`${BASE_URL}/api/gifts/by-slug/romantic-world`);
    if (publicSlugRes.status === 200) {
      const publicSlugData = await publicSlugRes.json();
      assert(
        publicSlugData.gift?.privacy?.recipientInviteToken === undefined,
        "recipientInviteToken is stripped from published gift payload by slug"
      );
      assert(
        publicSlugData.gift?.privacy?.passcode === undefined,
        "passcode is stripped from published gift payload by slug"
      );
    }

    // ----------------------------------------------------
    // TEST 8: Public Response Data Disclosure Prevention
    // ----------------------------------------------------
    console.log("\n► [Test 8] Public response data disclosure prevention");
    const publicResponsesRes = await fetch(`${BASE_URL}/api/creator/responses`);
    assert(
      publicResponsesRes.status === 401,
      `Unauthenticated access to /api/creator/responses rejected with HTTP 401 (got ${publicResponsesRes.status})`
    );

    // Verify authorized creator Alice CAN read responses
    const authResponsesRes = await fetch(`${BASE_URL}/api/creator/responses`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(authResponsesRes.status === 200, "Authorized creator Alice can access responses center (HTTP 200)");
    const authResponsesData = await authResponsesRes.json();
    assert(
      authResponsesData.summary?.creatorPasscode === undefined,
      "creatorPasscode is completely omitted from responses summary"
    );
    assert(
      authResponsesData.summary?.recipientInviteToken === undefined,
      "recipientInviteToken is completely omitted from responses summary"
    );

    // ----------------------------------------------------
    // TEST 9: Unauthenticated Mark-As-Viewed Request
    // ----------------------------------------------------
    console.log("\n► [Test 9] Unauthenticated mark-as-viewed rejection");
    const unauthMarkRes = await fetch(`${BASE_URL}/api/creator/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(
      unauthMarkRes.status === 401,
      `Unauthenticated mark-as-viewed rejected with HTTP 401 (got ${unauthMarkRes.status})`
    );

    const recipientMarkRes = await fetch(`${BASE_URL}/api/creator/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recipientToken}`,
      },
      body: JSON.stringify({}),
    });
    assert(
      recipientMarkRes.status === 403,
      `Recipient token attempting mark-as-viewed rejected with HTTP 403 (got ${recipientMarkRes.status})`
    );

    // ----------------------------------------------------
    // TEST 10: Unauthorized Secret Configuration Access
    // ----------------------------------------------------
    console.log("\n► [Test 10] Unauthorized secret configuration access");
    // 1. Unauthenticated creator view attempt
    const unauthSecretRes = await fetch(`${BASE_URL}/api/secret/config?role=creator`);
    assert(
      unauthSecretRes.status === 403,
      `Unauthenticated creator secret config access rejected with HTTP 403 (got ${unauthSecretRes.status})`
    );

    // 2. Recipient token attempting creator secret config
    const recipientSecretRes = await fetch(
      `${BASE_URL}/api/secret/config?role=creator&token=${recipientToken}`
    );
    assert(
      recipientSecretRes.status === 403,
      `Recipient token attempting creator secret config rejected with HTTP 403 (got ${recipientSecretRes.status})`
    );

    // 3. User B attempting to view Alice's secret config
    const crossSecretRes = await fetch(
      `${BASE_URL}/api/secret/config?role=creator&giftId=${giftAId}`,
      { headers: { Authorization: `Bearer ${userBToken}` } }
    );
    assert(
      crossSecretRes.status === 403,
      `Bob attempting to access Alice's secret config rejected with HTTP 403 (got ${crossSecretRes.status})`
    );

    // 4. Public access receives only safe hint
    const publicSecretRes = await fetch(`${BASE_URL}/api/secret/config`);
    assert(publicSecretRes.status === 200, "Public secret endpoint returns 200");
    const publicSecretData = await publicSecretRes.json();
    assert(Boolean(publicSecretData.hint), "Public secret endpoint returns hint");
    assert(publicSecretData.password === undefined, "Public secret endpoint NEVER returns password");
    assert(publicSecretData.letter === undefined, "Public secret endpoint NEVER returns private letter");

    // ----------------------------------------------------
    // CLEANUP: Alice removes her test gift
    // ----------------------------------------------------
    console.log("\n► [Cleanup] Removing Alice's test gift");
    const cleanupRes = await fetch(`${BASE_URL}/api/gifts/${giftAId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(cleanupRes.status === 200, "Alice successfully cleans up her own test gift");

    console.log("\n==========================================================");
    console.log(`  ALL 10 SECURITY REGRESSION TESTS PASSED! (${passedCount} passed, 0 failed)`);
    console.log("==========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ SECURITY REGRESSION TEST RUN TERMINATED WITH ERROR:", err.message);
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(1);
  }
}

runSecurityTests();

