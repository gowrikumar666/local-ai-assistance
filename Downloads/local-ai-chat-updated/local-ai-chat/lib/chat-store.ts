import { randomUUID } from "node:crypto";
import { getDb } from "./db";

export type ChatRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageAttachment = { name: string; type: string };

export type MessageRecord = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachment?: MessageAttachment;
};

export type DocumentRecord = {
  id: string;
  chatId: string;
  filename: string;
  text: string;
  createdAt: string;
};

type ChatRow = { id: string; title: string; created_at: string; updated_at: string };
type MessageRow = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
};
type DocumentRow = { id: string; chat_id: string; filename: string; text: string; created_at: string };

const now = () => new Date().toISOString();

const toChat = (r: ChatRow): ChatRecord => ({
  id: r.id, title: r.title, createdAt: r.created_at, updatedAt: r.updated_at,
});

const toMessage = (r: MessageRow): MessageRecord => ({
  id: r.id,
  chatId: r.chat_id,
  role: r.role,
  content: r.content,
  createdAt: r.created_at,
  ...(r.attachment_name
    ? { attachment: { name: r.attachment_name, type: r.attachment_type || "application/pdf" } }
    : {}),
});

const toDocument = (r: DocumentRow): DocumentRecord => ({
  id: r.id, chatId: r.chat_id, filename: r.filename, text: r.text, createdAt: r.created_at,
});

// ---- chats ----------------------------------------------------------------

export function listChats(): ChatRecord[] {
  const rows = getDb().prepare("SELECT * FROM chats ORDER BY updated_at DESC").all() as ChatRow[];
  return rows.map(toChat);
}

export function chatExists(id: string): boolean {
  return Boolean(getDb().prepare("SELECT 1 FROM chats WHERE id = ?").get(id));
}

export function createChat(title?: string): ChatRecord {
  const ts = now();
  const chat: ChatRecord = {
    id: randomUUID(),
    title: (title || "New Chat").slice(0, 80),
    createdAt: ts,
    updatedAt: ts,
  };
  getDb()
    .prepare("INSERT INTO chats (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(chat.id, chat.title, ts, ts);
  return chat;
}

export function deleteChat(id: string) {
  // messages + documents are removed by ON DELETE CASCADE
  getDb().prepare("DELETE FROM chats WHERE id = ?").run(id);
}

// ---- messages -------------------------------------------------------------

export function listMessages(chatId: string): MessageRecord[] {
  const rows = getDb()
    .prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY seq ASC")
    .all(chatId) as MessageRow[];
  return rows.map(toMessage);
}

/** The most recent `limit` messages, oldest first. */
export function listRecentMessages(chatId: string, limit: number): MessageRecord[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM (SELECT * FROM messages WHERE chat_id = ? ORDER BY seq DESC LIMIT ?)
       ORDER BY seq ASC`,
    )
    .all(chatId, limit) as MessageRow[];
  return rows.map(toMessage);
}

export function addMessage(input: {
  chatId: string;
  role: "user" | "assistant";
  content: string;
  attachment?: MessageAttachment;
}): MessageRecord {
  const db = getDb();
  const ts = now();
  const id = randomUUID();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO messages (id, chat_id, role, content, attachment_name, attachment_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, input.chatId, input.role, input.content, input.attachment?.name ?? null, input.attachment?.type ?? null, ts);
    db.prepare("UPDATE chats SET updated_at = ? WHERE id = ?").run(ts, input.chatId);
  })();
  return { id, chatId: input.chatId, role: input.role, content: input.content, createdAt: ts, attachment: input.attachment };
}

// ---- documents ------------------------------------------------------------

/** One document per chat: uploading a new PDF replaces the previous one. */
export function saveDocument(chatId: string, filename: string, text: string) {
  getDb()
    .prepare(
      `INSERT INTO documents (id, chat_id, filename, text, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(chat_id) DO UPDATE SET id = excluded.id, filename = excluded.filename,
         text = excluded.text, created_at = excluded.created_at`,
    )
    .run(randomUUID(), chatId, filename, text, now());
}

export function listDocuments(chatId: string): DocumentRecord[] {
  const rows = getDb().prepare("SELECT * FROM documents WHERE chat_id = ?").all(chatId) as DocumentRow[];
  return rows.map(toDocument);
}
