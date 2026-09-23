import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../lib/chat-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  try {
    const db = readDB();
    if (chatId) {
      const messages = db.messages.filter((m) => m.chatId === chatId);
      return NextResponse.json(messages);
    }
    return NextResponse.json(db.chats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const db = readDB();
    const newChat = {
      id: Date.now().toString(),
      title: title || "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.chats.push(newChat);
    writeDB(db);
    return NextResponse.json(newChat);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const db = readDB();
    db.chats = db.chats.filter((c) => c.id !== id);
    db.messages = db.messages.filter((m) => m.chatId !== id);
    db.documents = db.documents.filter((d) => d.chatId !== id);
    writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
