import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import Database from "better-sqlite3";
import { config } from "./config";

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (db) return db;

  const filename = config.dbPath === ":memory:"
    ? config.dbPath
    : isAbsolute(config.dbPath)
      ? config.dbPath
      : resolve(process.cwd(), config.dbPath);

  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });

  const connection = new Database(filename);
  connection.pragma("foreign_keys = ON");
  connection.pragma("journal_mode = WAL");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL UNIQUE,
      chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      attachment_name TEXT,
      attachment_type TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS messages_chat_seq ON messages(chat_id, seq);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL UNIQUE REFERENCES chats(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db = connection;
  return connection;
}