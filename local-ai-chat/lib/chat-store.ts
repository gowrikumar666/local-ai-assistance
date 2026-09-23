import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "chats.json");

export type ChatRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageAttachment = {
  name: string;
  type: string;
};

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

export type ChatDB = {
  chats: ChatRecord[];
  messages: MessageRecord[];
  documents: DocumentRecord[];
};

export function readDB(): ChatDB {
  if (!fs.existsSync(DB_PATH)) {
    return { chats: [], messages: [], documents: [] };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
    return {
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
    };
  } catch {
    return { chats: [], messages: [], documents: [] };
  }
}

export function writeDB(data: ChatDB) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      {
        chats: data.chats,
        messages: data.messages,
        documents: data.documents ?? [],
      },
      null,
      2,
    ),
  );
}
