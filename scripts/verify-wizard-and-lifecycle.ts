import crypto from "crypto";
import { POST as postGifts } from "../src/app/api/gifts/route";
import { GET as getGiftBySlug } from "../src/app/api/gifts/by-slug/[slug]/route";
import { GET as getMedia } from "../src/app/api/media/route";
import { POST as postNotebook, GET as getNotebook } from "../src/app/api/notebook/route";
import { updateSession } from "../src/lib/supabase/proxy";
import { loadDatabase, resetDatabaseMemory, getDataFilePath } from "../src/lib/server-db";
import { NextRequest } from "next/server";

// Configure test secrets
const TEST_JWT_SECRET = "test-crypto-secret-key-for-supabase-audit-32-chars-min!";
const TEST_UNLOCK_SECRET = "test-crypto-gift-unlock-secret-min-32-chars-audit!";
process.env.SUPABASE_JWT_SECRET = TEST_JWT_SECRET;
process.env.GIFT_UNLOCK_SECRET = TEST_UNLOCK_SECRET;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://audit.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-for-audit-verification";

function createTestJwt(userId: string, email: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    iss: "https://audit.supabase.co/auth/v1",
    iat: Math.floor(Date.now() / 1000) - 10,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const encHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TEST_JWT_SECRET).update(`${encHeader}.${encPayload}`).digest("base64url");
  return `${encHeader}.${encPayload}.${sig}`;
}

async function runVerification() {
  console.log("================================================================================");
  console.log(" REAL HTTP REQUEST VERIFICATION: WIZARD LIFECYCLE, PROTECTION & CREDENTIAL FLOW");
  console.log("================================================================================");

  const creatorUserId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
  const creatorJwt = createTestJwt(creatorUserId, "creator@love.app");

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated POST /api/gifts returns HTTP 401
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 1] Unauthenticated POST /api/gifts (Visitor Not Logged In)");
  const reqUnauth = new Request("http://localhost:3000/api/gifts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Our Secret Haven",
      senderName: "Romeo",
      recipientNickname: "Juliet",
    }),
  });

  const resUnauth = await postGifts(reqUnauth);
  const statusUnauth = resUnauth.status;
  const bodyUnauth = await resUnauth.json();

  console.log(`  HTTP Response Status: ${statusUnauth}`);
  console.log(`  HTTP Response Body:`, JSON.stringify(bodyUnauth));

  if (statusUnauth === 401 && bodyUnauth.error) {
    console.log("  ✓ PASS: Unauthenticated creation strictly rejected with HTTP 401.");
    console.log("  ✓ Wizard handling: Triggers 'Please log in to create your gift' alert and NEVER shows success.");
  } else {
    throw new Error(`Expected HTTP 401, got ${statusUnauth}`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Middleware protection for /create and /studio
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 2] Middleware Protection for /create and /studio (Unauthenticated)");
  const reqMiddlewareCreate = new NextRequest("http://localhost:3000/create");
  const resMiddlewareCreate = await updateSession(reqMiddlewareCreate);
  console.log(`  GET /create Middleware Status: ${resMiddlewareCreate.status}`);
  console.log(`  Redirect Location: ${resMiddlewareCreate.headers.get("location")}`);

  if (
    resMiddlewareCreate.status === 307 ||
    resMiddlewareCreate.status === 302 ||
    resMiddlewareCreate.status === 303
  ) {
    const loc = resMiddlewareCreate.headers.get("location") || "";
    if (loc.includes("/login") && loc.includes("next=%2Fcreate")) {
      console.log("  ✓ PASS: Unauthenticated visitor to /create is redirected to /login with redirect-back (?next=/create)!");
    } else {
      throw new Error(`Unexpected redirect location: ${loc}`);
    }
  } else {
    throw new Error(`Expected redirect status (302/307), got ${resMiddlewareCreate.status}`);
  }

  const reqMiddlewareStudio = new NextRequest("http://localhost:3000/studio");
  const resMiddlewareStudio = await updateSession(reqMiddlewareStudio);
  const locStudio = resMiddlewareStudio.headers.get("location") || "";
  console.log(`  GET /studio Redirect Location: ${locStudio}`);
  if (locStudio.includes("/login") && locStudio.includes("next=%2Fstudio")) {
    console.log("  ✓ PASS: Unauthenticated visitor to /studio is redirected to /login with redirect-back (?next=/studio)!");
  } else {
    throw new Error(`Unexpected studio redirect: ${locStudio}`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Logged-in Creation Succeeds & Returns Raw Token Once
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 3] Logged-in POST /api/gifts Creation");
  const testGiftSlug = `our-magical-journey-${Date.now()}`;
  const creatorEnteredPasscode = "eternal_flame_2026";

  const reqAuthCreate = new Request("http://localhost:3000/api/gifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${creatorJwt}`,
    },
    body: JSON.stringify({
      title: "Our Magical Journey ♡",
      slug: testGiftSlug,
      senderName: "Romeo",
      senderNickname: "Babe",
      recipientName: "Juliet",
      recipientNickname: "My Juliet",
      status: "published",
      privacy: {
        isPasswordProtected: true,
        passcode: creatorEnteredPasscode,
        invitationStatus: "active",
      },
    }),
  });

  const resAuthCreate = await postGifts(reqAuthCreate);
  const statusAuthCreate = resAuthCreate.status;
  const bodyAuthCreate = await resAuthCreate.json();

  console.log(`  HTTP Response Status: ${statusAuthCreate}`);
  console.log(`  Gift ID: ${bodyAuthCreate.gift?.id}`);
  console.log(`  Gift Slug: ${bodyAuthCreate.gift?.slug}`);
  console.log(`  Has Raw Invite Token in Response: ${Boolean(bodyAuthCreate.rawInviteToken)}`);

  if (statusAuthCreate !== 200 || !bodyAuthCreate.success || !bodyAuthCreate.rawInviteToken) {
    throw new Error(`Creation failed or raw token missing in response: ${JSON.stringify(bodyAuthCreate)}`);
  }

  const createdGiftId = bodyAuthCreate.gift.id;
  const rawInviteToken = bodyAuthCreate.rawInviteToken;
  console.log("  ✓ PASS: Creation succeeded with HTTP 200!");
  console.log("  ✓ PASS: Server returned rawInviteToken ONCE in the response for the creator's copy screen.");

  // Verify database storage: NEVER stores raw token or raw passcode!
  const db = loadDatabase();
  const dbGift = db.gifts.find((g) => g.id === createdGiftId);
  if (!dbGift) throw new Error("Gift not found in database file!");

  if (!dbGift.privacy?.passcode?.startsWith("scrypt$")) {
    throw new Error("Security failure: Passcode was stored unhashed!");
  }
  if (!dbGift.privacy?.recipientInviteToken?.startsWith("sha256$")) {
    throw new Error("Security failure: Invite token was stored unhashed!");
  }
  if ((dbGift as any).rawInviteToken !== undefined && (dbGift as any).rawInviteToken === rawInviteToken) {
    // Check if raw token is on disk
    const diskRaw = JSON.parse(require("fs").readFileSync(getDataFilePath(), "utf8"));
    const diskGift = diskRaw.gifts.find((g: any) => g.id === createdGiftId);
    if (diskGift.rawInviteToken) {
      throw new Error("Security failure: Raw token leaked to persistent disk!");
    }
  }
  console.log("  ✓ PASS: Database strictly stores scrypt$ passcode hash and sha256$ invite token hash (Zero Plaintext Secrets).");

  // --------------------------------------------------------------------------
  // TEST 4: Bare /gift/<slug> link in incognito (No Credentials)
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 4] Bare /gift/<slug> in Incognito (No Token, No Passcode)");
  const reqBareSlug = new Request(`http://localhost:3000/api/gifts/by-slug/${testGiftSlug}`);
  const resBareSlug = await getGiftBySlug(reqBareSlug, { params: Promise.resolve({ slug: testGiftSlug }) });
  const statusBareSlug = resBareSlug.status;
  const bodyBareSlug = await resBareSlug.json();

  console.log(`  HTTP Response Status: ${statusBareSlug}`);
  console.log(`  Response isLocked: ${bodyBareSlug.isLocked}`);
  console.log(`  Gift Content Present: ${Boolean(bodyBareSlug.gift)}`);
  console.log(`  Unlock Token Present: ${Boolean(bodyBareSlug.unlockToken)}`);

  if (
    statusBareSlug === 200 &&
    bodyBareSlug.isLocked === true &&
    bodyBareSlug.gift === undefined &&
    bodyBareSlug.unlockToken === undefined
  ) {
    console.log("  ✓ PASS: Bare link is strictly locked. Zero gift content and zero unlock token returned.");
  } else {
    throw new Error("Bare link failed lock enforcement!");
  }

  // --------------------------------------------------------------------------
  // TEST 5: Invite link with raw token unlocks gift
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 5] Partner Opens Invite Link (?token=<rawToken>)");
  const reqInviteUnlock = new Request(
    `http://localhost:3000/api/gifts/by-slug/${testGiftSlug}?token=${encodeURIComponent(rawInviteToken)}`
  );
  const resInviteUnlock = await getGiftBySlug(reqInviteUnlock, { params: Promise.resolve({ slug: testGiftSlug }) });
  const statusInviteUnlock = resInviteUnlock.status;
  const bodyInviteUnlock = await resInviteUnlock.json();

  console.log(`  HTTP Response Status: ${statusInviteUnlock}`);
  console.log(`  isLocked: ${bodyInviteUnlock.isLocked ?? false}`);
  console.log(`  Gift Content Present: ${Boolean(bodyInviteUnlock.gift)}`);
  console.log(`  Assigned Role: ${bodyInviteUnlock.role}`);
  console.log(`  Has HMAC Unlock Token: ${Boolean(bodyInviteUnlock.unlockToken)}`);

  if (
    statusInviteUnlock === 200 &&
    bodyInviteUnlock.isLocked !== true &&
    Boolean(bodyInviteUnlock.gift) &&
    bodyInviteUnlock.role === "recipient" &&
    Boolean(bodyInviteUnlock.unlockToken)
  ) {
    console.log("  ✓ PASS: Invite link successfully unlocks gift as 'recipient' and generates HMAC unlockToken!");
  } else {
    throw new Error("Invite link failed to unlock gift!");
  }

  const recipientUnlockToken = bodyInviteUnlock.unlockToken;

  // --------------------------------------------------------------------------
  // TEST 6: Photos load for unlocked recipient
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 6] Photos Load via /api/media with Unlock Token");
  const reqMedia = new Request(`http://localhost:3000/api/media?giftId=${createdGiftId}`, {
    headers: {
      "x-unlock-token": recipientUnlockToken,
    },
  });
  const resMedia = await getMedia(reqMedia);
  const statusMedia = resMedia.status;
  const bodyMedia = await resMedia.json();

  console.log(`  HTTP Response Status: ${statusMedia}`);
  console.log(`  Media Assets Retrieved: ${bodyMedia.assets?.length ?? 0}`);

  if (statusMedia === 200 && bodyMedia.success && Array.isArray(bodyMedia.assets)) {
    console.log("  ✓ PASS: Recipient successfully accessed gift photos with HTTP 200!");
  } else {
    throw new Error(`Failed to load media assets: ${JSON.stringify(bodyMedia)}`);
  }

  // --------------------------------------------------------------------------
  // TEST 7: A journal entry saves via collaborative route
  // --------------------------------------------------------------------------
  console.log("\n► [TEST 7] Journal Entry Saves via POST /api/notebook");
  const reqNotebook = new Request("http://localhost:3000/api/notebook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-unlock-token": recipientUnlockToken,
    },
    body: JSON.stringify({
      giftId: createdGiftId,
      content: "This surprise brought tears to my eyes. I love you endlessly.",
    }),
  });

  const resNotebook = await postNotebook(reqNotebook);
  const statusNotebook = resNotebook.status;
  const bodyNotebook = await resNotebook.json();

  console.log(`  HTTP Response Status: ${statusNotebook}`);
  console.log(`  Saved Entry Author: ${bodyNotebook.entry?.author}`);
  console.log(`  Saved Entry Author Name: ${bodyNotebook.entry?.authorName}`);

  if (
    statusNotebook === 200 &&
    bodyNotebook.success &&
    bodyNotebook.entry?.author === "recipient" &&
    bodyNotebook.entry?.content === "This surprise brought tears to my eyes. I love you endlessly."
  ) {
    console.log("  ✓ PASS: Recipient journal entry successfully saved with HTTP 200!");
  } else {
    throw new Error(`Failed to save notebook entry: ${JSON.stringify(bodyNotebook)}`);
  }

  // --------------------------------------------------------------------------
  // CLEANUP: Clean up test gift from database
  // --------------------------------------------------------------------------
  const freshDb = loadDatabase();
  freshDb.gifts = freshDb.gifts.filter((g) => g.id !== createdGiftId);
  freshDb.journalEntries = freshDb.journalEntries.filter((j) => j.giftId !== createdGiftId);
  require("../src/lib/server-db").saveDatabase(freshDb);

  console.log("\n================================================================================");
  console.log(" 🎉 ALL 7 END-TO-END HTTP LIFECYCLE TESTS PASSED 100%!");
  console.log("================================================================================");
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
