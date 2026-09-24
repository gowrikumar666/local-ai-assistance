import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS chats (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  seq             INTEGER PRIMARY KEY AUTOINCREMENT,
  id              TEXT NOT NULL UNIQUE,
  chat_id         TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  attachment_name TEXT,
  attachment_type TEXT,
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, seq);
CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  chat_id    TEXT NOT NULL UNIQUE REFERENCES chats(id) ON DELETE CASCADE,
  filename   TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

type LegacyDB = {
  chats?: { id: string; title: string; createdAt: string; updatedAt: string }[];
  messages?: {
    id: string;
    chatId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    attachment?: { name: string; type: string };
  }[];
  documents?: { id: string; chatId: string; filename: string; text: string; createdAt: string }[];
};

/** One-time import of the old chats.json file, so existing history isn't lost. */
function importLegacyJson(db: Database.Database) {
  const legacyPath = path.join(process.cwd(), "chats.json");
  if (!fs.existsSync(legacyPath)) return;
  if ((db.prepare("SELECT COUNT(*) AS n FROM chats").get() as { n: number }).n > 0) return;

  let legacy: LegacyDB;
  try {
    legacy = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
  } catch {
    return;
  }

  const insertChat = db.prepare(
    "INSERT OR IGNORE INTO chats (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
  );
  const insertMessage = db.prepare(
    `INSERT OR IGNORE INTO messages (id, chat_id, role, content, attachment_name, attachment_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertDoc = db.prepare(
    "INSERT OR IGNORE INTO documents (id, chat_id, filename, text, created_at) VALUES (?, ?, ?, ?, ?)",
  );

  db.transaction(() => {
    const chatIds = new Set<string>();
    for (const c of legacy.chats ?? []) {
      insertChat.run(c.id, c.title, c.createdAt, c.updatedAt);
      chatIds.add(c.id);
    }
    for (const m of legacy.messages ?? []) {
      if (!chatIds.has(m.chatId)) continue; // skip orphans (e.g. the old "temp" chat)
      insertMessage.run(
        m.id, m.chatId, m.role, m.content,
        m.attachment?.name ?? null, m.attachment?.type ?? null, m.createdAt,
      );
    }
    for (const d of legacy.documents ?? []) {
      if (chatIds.has(d.chatId)) insertDoc.run(d.id, d.chatId, d.filename, d.text, d.createdAt);
    }
  })();

  fs.renameSync(legacyPath, `${legacyPath}.migrated`);
  console.log("[db] Imported legacy chats.json (renamed to chats.json.migrated)");
}

// Keep a single connection across Next.js dev hot reloads.
const globalForDb = globalThis as unknown as { __chatDb?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.__chatDb) return globalForDb.__chatDb;

  const file = path.resolve(process.cwd(), config.dbPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  importLegacyJson(db);

  globalForDb.__chatDb = db;
  return db;
}
