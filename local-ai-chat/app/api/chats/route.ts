import { NextResponse } from "next/server";
import { createChat, deleteChat, listChats, listMessages } from "../../../lib/chat-store";

export const runtime = "nodejs";

function fail(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  try {
    const chatId = new URL(req.url).searchParams.get("chatId");
    return NextResponse.json(chatId ? listMessages(chatId) : listChats());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    return NextResponse.json(createChat(title || undefined));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    deleteChat(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return fail(error);
  }
}
