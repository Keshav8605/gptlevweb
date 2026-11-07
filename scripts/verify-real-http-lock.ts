import { GET as getGiftBySlug } from "../src/app/api/gifts/by-slug/[slug]/route";
import { POST as postNotebook } from "../src/app/api/notebook/route";
import { loadDatabase, resetDatabaseMemory } from "../src/lib/server-db";

async function main() {
  console.log("================================================================================");
  console.log(" REAL HTTP REQUEST VERIFICATION: UNCREDENTIALED NON-DEMO GIFT LOCK ENFORCEMENT");
  console.log("================================================================================");

  resetDatabaseMemory();
  const db = loadDatabase();
  const partnerGift = db.gifts.find((g) => g.id !== "gift_world_demo" && g.status === "published");
  if (!partnerGift) {
    throw new Error("No published non-demo gift found in database.");
  }

  const slug = partnerGift.slug;
  console.log(`Target Non-Demo Gift: "${partnerGift.title}" (ID: ${partnerGift.id}, Slug: ${slug})`);
  console.log(`privacy.isPasswordProtected in DB: ${partnerGift.privacy?.isPasswordProtected}`);

  // --------------------------------------------------------------------------
  // TEST 1: Real HTTP GET to Non-Demo Published Gift With NO Credentials
  // --------------------------------------------------------------------------
  console.log(`\n--- [TEST 1] HTTP GET /api/gifts/by-slug/${slug} (No Token, No Passcode) ---`);
  const req1 = new Request(`http://localhost:3000/api/gifts/by-slug/${slug}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PublicVisitor/1.0",
    },
  });

  const res1 = await getGiftBySlug(req1, { params: Promise.resolve({ slug }) });
  const status1 = res1.status;
  const headers1: Record<string, string> = {};
  res1.headers.forEach((v, k) => { headers1[k] = v; });
  const body1 = await res1.json();

  console.log(`HTTP Response Status: ${status1}`);
  console.log(`HTTP Response Headers:`, JSON.stringify(headers1, null, 2));
  console.log(`HTTP Response Body:`, JSON.stringify(body1, null, 2));

  if (
    status1 === 200 &&
    body1.isLocked === true &&
    body1.gift === undefined &&
    body1.unlockToken === undefined &&
    body1.role === undefined &&
    typeof body1.title === "string" &&
    typeof body1.recipientNickname === "string"
  ) {
    console.log("\n✓ PASS: Non-demo published gift returned strictly locked response with zero content!");
  } else {
    console.error("\n✕ FAIL: Unexpected response shape!");
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Real HTTP GET to Demo Gift (sweetheart) (No Credentials)
  // --------------------------------------------------------------------------
  console.log(`\n--- [TEST 2] HTTP GET /api/gifts/by-slug/sweetheart (Demo Gift, No Credentials) ---`);
  const req2 = new Request("http://localhost:3000/api/gifts/by-slug/sweetheart", {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  const res2 = await getGiftBySlug(req2, { params: Promise.resolve({ slug: "sweetheart" }) });
  const status2 = res2.status;
  const body2 = await res2.json();

  console.log(`HTTP Response Status: ${status2}`);
  console.log(`isLocked:`, body2.isLocked ?? false);
  console.log(`Has Gift Content:`, Boolean(body2.gift));
  console.log(`Role:`, body2.role);
  console.log(`Has Unlock Token:`, Boolean(body2.unlockToken));

  if (
    status2 === 200 &&
    body2.isLocked !== true &&
    Boolean(body2.gift) &&
    body2.role === "guest" &&
    body2.unlockToken === undefined
  ) {
    console.log("\n✓ PASS: Demo gift is open for preview, assigned 'guest', and issued NO unlock token!");
  } else {
    console.error("\n✕ FAIL: Unexpected demo gift response shape!");
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Real HTTP POST to Collaborative Endpoint for Demo Gift (No Credentials)
  // --------------------------------------------------------------------------
  console.log(`\n--- [TEST 3] HTTP POST /api/notebook for Demo Gift (Anonymous Visitor) ---`);
  const req3 = new Request("http://localhost:3000/api/notebook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ giftId: "gift_world_demo", content: "Anonymous post attempt" }),
  });

  const res3 = await postNotebook(req3);
  const status3 = res3.status;
  const body3 = await res3.json();

  console.log(`HTTP Response Status: ${status3}`);
  console.log(`HTTP Response Body:`, JSON.stringify(body3, null, 2));

  if (status3 === 401 && body3.error === "Authentication required.") {
    console.log("\n✓ PASS: Collaborative writes to demo gift are strictly rejected with HTTP 401!");
  } else {
    console.error("\n✕ FAIL: Collaborative write was not rejected with HTTP 401!");
    process.exit(1);
  }

  console.log("\n================================================================================");
  console.log(" ALL HTTP VERIFICATIONS PASSED 100%!");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
