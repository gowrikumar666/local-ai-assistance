import { NextResponse } from "next/server";
import { extractPdfText, truncateDocument } from "../../../lib/extract-pdf";
import { readDB, writeDB, type DocumentRecord, type MessageRecord } from "../../../lib/chat-store";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const DOCUMENT_SYSTEM_PROMPT = `You are a careful document assistant.
Use ONLY the uploaded PDF text as the source of truth.
Extract and report relevant facts, figures, names, dates, and sections accurately.
Quote or paraphrase closely. If the user asks for something not in the document, say it is not stated.
Do not invent data.`;

type IncomingChat = {
  chatId: string;
  message: string;
  file: File | null;
};

async function parseIncoming(req: Request): Promise<IncomingChat> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const chatId = String(form.get("chatId") || "");
    const message = String(form.get("message") || "");
    const maybeFile = form.get("file");
    const file = maybeFile instanceof File && maybeFile.size > 0 ? maybeFile : null;
    return { chatId, message, file };
  }

  const body = await req.json();
  return {
    chatId: String(body.chatId || ""),
    message: String(body.message || ""),
    file: null,
  };
}

function isPdf(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

function buildOllamaMessages(
  history: MessageRecord[],
  documents: DocumentRecord[],
) {
  const messages: { role: string; content: string }[] = [];

  if (documents.length > 0) {
    const source = documents
      .map((doc) => `FILE: ${doc.filename}\n${truncateDocument(doc.text)}`)
      .join("\n\n-----\n\n");
    messages.push({
      role: "system",
      content: `${DOCUMENT_SYSTEM_PROMPT}\n\nSOURCE DOCUMENTS:\n${source}`,
    });
  }

  for (const item of history) {
    messages.push({ role: item.role, content: item.content });
  }

  return messages;
}

export async function POST(req: Request) {
  try {
    const { chatId, message, file } = await parseIncoming(req);

    if (!chatId || chatId === "temp") {
      return NextResponse.json(
        { error: "No active chat session. Please create a chat first." },
        { status: 400 },
      );
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !file) {
      return NextResponse.json({ error: "Message or PDF file is required." }, { status: 400 });
    }

    if (file) {
      if (!isPdf(file)) {
        return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: "PDF must be 10MB or smaller." }, { status: 400 });
      }
    }

    const db = readDB();
    let extractedText = "";

    if (file) {
      extractedText = await extractPdfText(file);
      if (!extractedText) {
        return NextResponse.json(
          {
            error:
              "This PDF has no extractable text. It may be a scanned image. Please upload a text-based PDF.",
          },
          { status: 422 },
        );
      }

      db.documents = db.documents.filter((doc) => doc.chatId !== chatId);
      db.documents.push({
        id: Date.now().toString(),
        chatId,
        filename: file.name,
        text: extractedText,
        createdAt: new Date().toISOString(),
      });
    }

    const visibleMessage =
      trimmedMessage ||
      (file ? `Extract the key information from "${file.name}" accurately.` : "");

    const userMsg: MessageRecord = {
      id: Date.now().toString(),
      chatId,
      role: "user",
      content: visibleMessage,
      createdAt: new Date().toISOString(),
      ...(file ? { attachment: { name: file.name, type: file.type || "application/pdf" } } : {}),
    };
    db.messages.push(userMsg);
    writeDB(db);

    const history = db.messages.filter((m) => m.chatId === chatId);
    const documents = db.documents.filter((d) => d.chatId === chatId);
    const ollamaMessages = buildOllamaMessages(history, documents);

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama Error Response:", errorText);
      return NextResponse.json({ error: `Ollama AI error: ${response.statusText}` }, { status: 502 });
    }

    const data = await response.json();
    const aiResponse = data.message?.content || "I'm sorry, I couldn't generate a response.";

    const dbUpdated = readDB();
    const aiMsg: MessageRecord = {
      id: (Date.now() + 1).toString(),
      chatId,
      role: "assistant",
      content: aiResponse,
      createdAt: new Date().toISOString(),
    };
    dbUpdated.messages.push(aiMsg);
    writeDB(dbUpdated);

    return NextResponse.json({
      content: aiResponse,
      attachment: userMsg.attachment || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat API Crash:", error);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
