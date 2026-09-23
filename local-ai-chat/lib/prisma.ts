import fs from 'fs';
import path from 'path';

// We are moving away from Prisma completely to avoid the version/generation issues
// and use the JSON storage system we implemented in the API routes.

const DB_PATH = path.join(process.cwd(), 'chats.json');

export default {
  findMany: async (args: any) => {
    if (!fs.existsSync(DB_PATH)) return [];
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (args.where?.chatId) {
      return db.messages.filter((m: any) => m.chatId === args.where.chatId);
    }
    return db.chats;
  },
  create: async (args: any) => {
    const db = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : { chats: [], messages: [] };
    if (args.data.title) {
      const newChat = { id: Date.now().toString(), ...args.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.chats.push(newChat);
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      return newChat;
    } else {
      const newMsg = { id: Date.now().toString(), ...args.data, createdAt: new Date().toISOString() };
      db.messages.push(newMsg);
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      return newMsg;
    }
  },
  delete: async (args: any) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db.chats = db.chats.filter((c: any) => c.id !== args.where.id);
    db.messages = db.messages.filter((m: any) => m.chatId !== args.where.id);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return { success: true };
  }
};
