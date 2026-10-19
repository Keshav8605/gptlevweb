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
  verifyAccess,
} from "@/lib/server-db";

export async function GET() {
  const entries = getJournalEntries();
  return NextResponse.json({ success: true, entries });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const auth = verifyAccess(token);

    const role = auth.authorized ? auth.role : (body.role || "recipient");
    const name = auth.authorized ? auth.name : (body.name || (role === "creator" ? "Babe" : "Baby"));

    // Action: reply to an entry
    if (body.action === "reply") {
      if (!body.entryId || !body.content?.trim()) {
        return NextResponse.json({ error: "Missing entryId or content" }, { status: 400 });
      }
      const reply = addJournalReply(body.entryId, body.content, role as "creator" | "recipient", name);
      return NextResponse.json({ success: true, reply });
    }

    // Action: toggle reaction on an entry
    if (body.action === "react") {
      if (!body.entryId || !body.emoji) {
        return NextResponse.json({ error: "Missing entryId or emoji" }, { status: 400 });
      }
      const reactions = toggleJournalReaction(body.entryId, body.emoji, name);
      return NextResponse.json({ success: true, reactions });
    }

    // Default: create new entry
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Journal content cannot be blank" }, { status: 400 });
    }

    const newEntry = addJournalEntry({
      title: body.title,
      content: body.content,
      prompt: body.prompt,
      moodEmoji: body.moodEmoji,
      author: role as "creator" | "recipient",
      authorName: name,
    });

    return NextResponse.json({ success: true, entry: newEntry });
  } catch {
    return NextResponse.json({ error: "Failed to process journal request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const auth = verifyAccess(token);

    const role = auth.authorized ? auth.role : (body.role || "recipient");
    const name = auth.authorized ? auth.name : (body.name || (role === "creator" ? "Babe" : "Baby"));

    // Action: update a reply
    if (body.action === "updateReply") {
      if (!body.entryId || !body.replyId || !body.content?.trim()) {
        return NextResponse.json({ error: "Missing entryId, replyId, or content" }, { status: 400 });
      }

      const reply = updateJournalReply(
        body.entryId,
        body.replyId,
        body.content,
        role as "creator" | "recipient",
        name
      );

      if (!reply) {
        return NextResponse.json({ error: "Unauthorized or reply not found" }, { status: 403 });
      }

      return NextResponse.json({ success: true, reply });
    }

    // Default action: update main entry
    if (!body.id || !body.content?.trim()) {
      return NextResponse.json({ error: "Missing entry ID or content" }, { status: 400 });
    }

    const updated = updateJournalEntry(
      body.id,
      {
        title: body.title,
        content: body.content,
        prompt: body.prompt,
        moodEmoji: body.moodEmoji,
      },
      role as "creator" | "recipient",
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
    const token = url.searchParams.get("token") || "";

    const auth = verifyAccess(token);
    const role = auth.authorized ? auth.role : (url.searchParams.get("role") || "recipient");
    const name = auth.authorized ? auth.name : (url.searchParams.get("name") || (role === "creator" ? "Babe" : "Baby"));

    // Delete reply if replyId provided
    if (replyId && id) {
      const deleted = deleteJournalReply(id, replyId, role as "creator" | "recipient", name);
      if (!deleted) {
        return NextResponse.json({ error: "Unauthorized or reply not found" }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

    const deleted = deleteJournalEntry(id, role as "creator" | "recipient", name);
    if (!deleted) {
      return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 400 });
  }
}
