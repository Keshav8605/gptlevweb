process.env.DATABASE_FILE = process.env.DATABASE_FILE || "test-database.json";

import { GET as getNotebook, POST as postNotebook } from "../src/app/api/notebook/route";
import { GET as getVoice, POST as postVoice } from "../src/app/api/voice/route";
import { GET as getComments, POST as postComments } from "../src/app/api/interactions/comments/route";
import { GET as getReactions, POST as postReactions } from "../src/app/api/interactions/reactions/route";
import { GET as getMemories, POST as postMemories } from "../src/app/api/dates/memories/route";
import { GET as getProposals, POST as postProposals } from "../src/app/api/dates/proposals/route";
import { GET as getProposalById } from "../src/app/api/dates/proposals/[id]/route";
import { PATCH as patchChecklist } from "../src/app/api/dates/proposals/[id]/checklist/route";
import { POST as postTransition } from "../src/app/api/dates/proposals/[id]/transition/route";
import { GET as getPreferences, POST as postPreferences } from "../src/app/api/dates/preferences/route";
import { GET as getIdeas, POST as postIdeas } from "../src/app/api/dates/ideas/route";
import { GET as getNotifications } from "../src/app/api/dates/notifications/route";
import { GET as getMedia } from "../src/app/api/media/route";
import { GET as getSession } from "../src/app/api/session/route";

const REAL_GIFT_ID = "gift_world_demo";
const FAKE_GIFT_ID = "gift_nonexistent_fake_99999";

interface RouteTest {
  name: string;
  run: (giftId: string) => Promise<{ status: number; body: unknown }>;
}

const tests: RouteTest[] = [
  {
    name: "GET /api/notebook?giftId=",
    run: async (giftId) => {
      const res = await getNotebook(new Request(`http://localhost:3000/api/notebook?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/notebook",
    run: async (giftId) => {
      const res = await postNotebook(
        new Request("http://localhost:3000/api/notebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, content: "Test" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/voice?giftId=",
    run: async (giftId) => {
      const res = await getVoice(new Request(`http://localhost:3000/api/voice?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/voice",
    run: async (giftId) => {
      const res = await postVoice(
        new Request("http://localhost:3000/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, audioData: "data:audio/webm;base64,AAAA" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/interactions/comments?giftId=",
    run: async (giftId) => {
      const res = await getComments(new Request(`http://localhost:3000/api/interactions/comments?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/interactions/comments",
    run: async (giftId) => {
      const res = await postComments(
        new Request("http://localhost:3000/api/interactions/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, targetType: "chapter", targetId: "chap1", content: "Love this!" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/interactions/reactions?giftId=",
    run: async (giftId) => {
      const res = await getReactions(new Request(`http://localhost:3000/api/interactions/reactions?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/interactions/reactions",
    run: async (giftId) => {
      const res = await postReactions(
        new Request("http://localhost:3000/api/interactions/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, targetType: "chapter", targetId: "chap1", emoji: "❤️" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/memories?giftId=",
    run: async (giftId) => {
      const res = await getMemories(new Request(`http://localhost:3000/api/dates/memories?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/dates/memories",
    run: async (giftId) => {
      const res = await postMemories(
        new Request("http://localhost:3000/api/dates/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, dateTitle: "Beach picnic" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/proposals?giftId=",
    run: async (giftId) => {
      const res = await getProposals(new Request(`http://localhost:3000/api/dates/proposals?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/dates/proposals",
    run: async (giftId) => {
      const res = await postProposals(
        new Request("http://localhost:3000/api/dates/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, title: "Dinner" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/proposals/[id]?giftId=",
    run: async (giftId) => {
      const res = await getProposalById(
        new Request(`http://localhost:3000/api/dates/proposals/prop_test_123?giftId=${giftId}`),
        { params: Promise.resolve({ id: "prop_test_123" }) }
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "PATCH /api/dates/proposals/[id]/checklist",
    run: async (giftId) => {
      const res = await patchChecklist(
        new Request(`http://localhost:3000/api/dates/proposals/prop_test_123/checklist?giftId=${giftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, checklist: [] }),
        }),
        { params: Promise.resolve({ id: "prop_test_123" }) }
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/dates/proposals/[id]/transition",
    run: async (giftId) => {
      const res = await postTransition(
        new Request(`http://localhost:3000/api/dates/proposals/prop_test_123/transition?giftId=${giftId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, action: "accept" }),
        }),
        { params: Promise.resolve({ id: "prop_test_123" }) }
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/preferences?giftId=",
    run: async (giftId) => {
      const res = await getPreferences(new Request(`http://localhost:3000/api/dates/preferences?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/dates/preferences",
    run: async (giftId) => {
      const res = await postPreferences(
        new Request("http://localhost:3000/api/dates/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, ideaId: "idea_123" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/ideas?giftId=",
    run: async (giftId) => {
      const res = await getIdeas(new Request(`http://localhost:3000/api/dates/ideas?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "POST /api/dates/ideas",
    run: async (giftId) => {
      const res = await postIdeas(
        new Request("http://localhost:3000/api/dates/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId, title: "Stargazing" }),
        })
      );
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/dates/notifications?giftId=",
    run: async (giftId) => {
      const res = await getNotifications(new Request(`http://localhost:3000/api/dates/notifications?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/media?giftId=",
    run: async (giftId) => {
      const res = await getMedia(new Request(`http://localhost:3000/api/media?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
  {
    name: "GET /api/session?giftId=",
    run: async (giftId) => {
      const res = await getSession(new Request(`http://localhost:3000/api/session?giftId=${giftId}`));
      return { status: res.status, body: await res.json() };
    },
  },
];

async function main() {
  console.log("================================================================================");
  console.log("  COLLABORATIVE ROUTE ENUMERATION ORACLE VERIFICATION (NO TOKEN)");
  console.log(`  Real Gift ID: ${REAL_GIFT_ID}`);
  console.log(`  Fake Gift ID: ${FAKE_GIFT_ID}`);
  console.log("================================================================================\n");

  let allIdentical = true;

  for (const t of tests) {
    const fakeRes = await t.run(FAKE_GIFT_ID);
    const realRes = await t.run(REAL_GIFT_ID);

    const fakeBodyStr = JSON.stringify(fakeRes.body);
    const realBodyStr = JSON.stringify(realRes.body);

    const isMatch =
      fakeRes.status === realRes.status &&
      fakeRes.status === 401 &&
      fakeBodyStr === realBodyStr &&
      fakeBodyStr === JSON.stringify({ error: "Authentication required." });

    if (!isMatch) {
      allIdentical = false;
      console.log(`❌ MISMATCH in [${t.name}]:`);
      console.log(`   Fake Gift -> HTTP ${fakeRes.status}: ${fakeBodyStr}`);
      console.log(`   Real Gift -> HTTP ${realRes.status}: ${realBodyStr}`);
    } else {
      console.log(`✓ [${t.name}]`);
      console.log(`   Fake Gift (${FAKE_GIFT_ID}) -> HTTP ${fakeRes.status} ${fakeBodyStr}`);
      console.log(`   Real Gift (${REAL_GIFT_ID}) -> HTTP ${realRes.status} ${realBodyStr}`);
    }
  }

  console.log("\n================================================================================");
  if (allIdentical) {
    console.log("🎉 ALL COLLABORATIVE ROUTES RETURN IDENTICAL HTTP 401 RESPONSES!");
    console.log('   Zero gift enumeration possible. Body is strictly {"error":"Authentication required."}');
  } else {
    console.log("❌ SOME ROUTES HAD MISMATCHES!");
    process.exit(1);
  }
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

