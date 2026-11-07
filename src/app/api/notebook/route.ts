import { NextResponse } from "next/server";
import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  addJournalReply,
  updateJournalReply,
  deleteJournalReply,
  toggleJournalReaction,
} from "@/lib/server-db";
import { requireGiftAccess } from "@/lib/access-guard";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId");
    if (!giftId) {
      return NextResponse.json({ error: "giftId parameter is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const entries = getJournalEntries(giftId);
    return NextResponse.json({ success: true, entries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const url = new URL(request.url);
    const giftId = (typeof body?.giftId === "string" ? body.giftId : null) || url.searchParams.get("giftId");
    if (!giftId) {
      return NextResponse.json({ error: "giftId is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const role = access.role;
    const name = access.name;

    // Action: reply to an entry
    if (body.action === "reply") {
      const entryId = typeof body.entryId === "string" ? body.entryId : "";
      const content = typeof body.content === "string" ? body.content : "";
      if (!entryId || !content.trim()) {
        return NextResponse.json({ error: "Missing entryId or content" }, { status: 400 });
      }
      const reply = addJournalReply(entryId, content, role, name);
      return NextResponse.json({ success: true, reply });
    }

    // Action: toggle reaction on an entry
    if (body.action === "react") {
      const entryId = typeof body.entryId === "string" ? body.entryId : "";
      const emoji = typeof body.emoji === "string" ? body.emoji : "";
      if (!entryId || !emoji) {
        return NextResponse.json({ error: "Missing entryId or emoji" }, { status: 400 });
      }
      const reactions = toggleJournalReaction(entryId, emoji, name);
      return NextResponse.json({ success: true, reactions });
    }

    // Default: create new entry
    const content = typeof body.content === "string" ? body.content : "";
    if (!content.trim()) {
      return NextResponse.json({ error: "Journal content cannot be blank" }, { status: 400 });
    }

    const newEntry = addJournalEntry({
      giftId,
      title: typeof body.title === "string" ? body.title : undefined,
      content,
      prompt: typeof body.prompt === "string" ? body.prompt : undefined,
      moodEmoji: typeof body.moodEmoji === "string" ? body.moodEmoji : undefined,
      author: role,
      authorName: name,
    });

    return NextResponse.json({ success: true, entry: newEntry });
  } catch {
    return NextResponse.json({ error: "Failed to process journal request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const url = new URL(request.url);
    let giftId = (typeof body?.giftId === "string" ? body.giftId : null) || url.searchParams.get("giftId");

    // If giftId wasn't sent, locate entry to find associated giftId
    if (!giftId && (body.entryId || body.id)) {
      const targetId = (typeof body.entryId === "string" ? body.entryId : body.id) as string;
      const allEntries = getJournalEntries();
      const match = allEntries.find((e) => e.id === targetId);
      if (match?.giftId) {
        giftId = match.giftId;
      }
    }

    if (!giftId) {
      return NextResponse.json({ error: "giftId is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const role = access.role;
    const name = access.name;

    // Action: update a reply
    if (body.action === "updateReply") {
      const entryId = typeof body.entryId === "string" ? body.entryId : "";
      const replyId = typeof body.replyId === "string" ? body.replyId : "";
      const content = typeof body.content === "string" ? body.content : "";
      if (!entryId || !replyId || !content.trim()) {
        return NextResponse.json({ error: "Missing entryId, replyId, or content" }, { status: 400 });
      }

      const reply = updateJournalReply(
        entryId,
        replyId,
        content,
        role,
        name
      );

      if (!reply) {
        return NextResponse.json({ error: "Unauthorized or reply not found" }, { status: 403 });
      }

      return NextResponse.json({ success: true, reply });
    }

    // Default action: update main entry
    const entryId = typeof body.id === "string" ? body.id : "";
    const content = typeof body.content === "string" ? body.content : "";
    if (!entryId || !content.trim()) {
      return NextResponse.json({ error: "Missing entry ID or content" }, { status: 400 });
    }

    const updated = updateJournalEntry(
      entryId,
      {
        title: typeof body.title === "string" ? body.title : undefined,
        content,
        prompt: typeof body.prompt === "string" ? body.prompt : undefined,
        moodEmoji: typeof body.moodEmoji === "string" ? body.moodEmoji : undefined,
      },
      role,
      name
    );

    if (!updated) {
      return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update entry" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const replyId = url.searchParams.get("replyId");
    let giftId = url.searchParams.get("giftId");

    if (!id && !replyId) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    if (!giftId && id) {
      const allEntries = getJournalEntries();
      const match = allEntries.find((e) => e.id === id);
      if (match?.giftId) {
        giftId = match.giftId;
      }
    }

    if (!giftId) {
      return NextResponse.json({ error: "giftId parameter is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const role = access.role;
    const name = access.name;

    // Delete reply if replyId provided
    if (replyId && id) {
      const deleted = deleteJournalReply(id, replyId, role, name);
      if (!deleted) {
        return NextResponse.json({ error: "Unauthorized or reply not found" }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

    const deleted = deleteJournalEntry(id, role, name);
    if (!deleted) {
      return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 400 });
  }
}
