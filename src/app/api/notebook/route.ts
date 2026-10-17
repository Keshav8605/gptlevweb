import { NextResponse } from "next/server";
import {
  getJournalEntries,
  addJournalEntry,
  addJournalReply,
  toggleJournalReaction,
  deleteJournalEntry,
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token") || "";

    if (!id) return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

    const auth = verifyAccess(token);
    const role = auth.authorized ? auth.role : "recipient";

    const deleted = deleteJournalEntry(id, role as "creator" | "recipient");
    if (!deleted) {
      return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 400 });
  }
}
