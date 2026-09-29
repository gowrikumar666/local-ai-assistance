import { NextResponse } from "next/server";
import { config } from "../../../lib/config";
import { extractPdfText, truncateDocument } from "../../../lib/extract-pdf";
import {
  addMessage,
  chatExists,
  listDocuments,
  listRecentMessages,
  saveDocument,
  type DocumentRecord,
  type MessageRecord,
} from "../../../lib/chat-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENT_SYSTEM_PROMPT = `You are a careful document assistant.
Use ONLY the uploaded PDF text as the source of truth.
Extract and report relevant facts, figures, names, dates, and sections accurately.
Quote or paraphrase closely. If the user asks for something not in the document, say it is not stated.
Do not invent data.`;

/** Events streamed to the browser as newline-delimited JSON. */
type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

type IncomingChat = { chatId: string; message: string; file: File | null };

async function parseIncoming(req: Request): Promise<IncomingChat> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const maybeFile = form.get("file");
    return {
      chatId: String(form.get("chatId") || ""),
      message: String(form.get("message") || ""),
      file: maybeFile instanceof File && maybeFile.size > 0 ? maybeFile : null,
    };
  }

  const body = await req.json();
  return { chatId: String(body.chatId || ""), message: String(body.message || ""), file: null };
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function buildOllamaMessages(history: MessageRecord[], documents: DocumentRecord[]) {
  const messages: { role: string; content: string }[] = [];

  if (documents.length > 0) {
    const source = documents
      .map((doc) => `FILE: ${doc.filename}\n${truncateDocument(doc.text)}`)
      .join("\n\n-----\n\n");
    messages.push({ role: "system", content: `${DOCUMENT_SYSTEM_PROMPT}\n\nSOURCE DOCUMENTS:\n${source}` });
  }

  // A history window can start mid-conversation; the model expects a user turn first.
  const start = history.findIndex((m) => m.role === "user");
  for (const item of start === -1 ? [] : history.slice(start)) {
    const last = messages[messages.length - 1];
    // Merge consecutive same-role turns (e.g. a user message whose reply failed).
    if (last && last.role === item.role) last.content += `\n\n${item.content}`;
    else messages.push({ role: item.role, content: item.content });
  }

  return messages;
}

function json(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  try {
    const { chatId, message, file } = await parseIncoming(req);

    if (!chatId || chatId === "temp") {
      return json("No active chat session. Please create a chat first.", 400);
    }
    if (!chatExists(chatId)) return json("This conversation no longer exists.", 404);

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !file) return json("Message or PDF file is required.", 400);
    if (trimmedMessage.length > config.maxMessageChars) {
      return json(`Message is too long (max ${config.maxMessageChars} characters).`, 400);
    }

    if (file) {
      if (!isPdf(file)) return json("Only PDF files are supported.", 400);
      if (file.size > config.maxPdfBytes) {
        return json(`PDF must be ${Math.round(config.maxPdfBytes / 1024 / 1024)}MB or smaller.`, 400);
      }
    }

    if (file) {
      let extractedText = "";
      try {
        extractedText = await extractPdfText(file);
      } catch {
        return json("Could not read this PDF. It may be corrupted or password protected.", 422);
      }
      if (!extractedText) {
        return json(
          "This PDF has no extractable text. It may be a scanned image. Please upload a text-based PDF.",
          422,
        );
      }
      saveDocument(chatId, file.name, extractedText);
    }

    const visibleMessage =
      trimmedMessage || (file ? `Extract the key information from "${file.name}" accurately.` : "");

    addMessage({
      chatId,
      role: "user",
      content: visibleMessage,
      ...(file ? { attachment: { name: file.name, type: file.type || "application/pdf" } } : {}),
    });

    const ollamaMessages = buildOllamaMessages(
      listRecentMessages(chatId, config.historyLimit),
      listDocuments(chatId),
    );

    // One controller cancels the upstream request on: client disconnect / Stop, or idle timeout.
    const upstreamAbort = new AbortController();
    let timedOut = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const armIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        timedOut = true;
        upstreamAbort.abort();
      }, config.idleTimeoutMs);
    };
    req.signal.addEventListener("abort", () => upstreamAbort.abort());

    let upstream: Response;
    try {
      armIdleTimer();
      upstream = await fetch(`${config.ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: upstreamAbort.signal,
        body: JSON.stringify({
          model: config.ollamaModel,
          messages: ollamaMessages,
          stream: true,
          keep_alive: config.keepAlive,
          options: { num_ctx: config.numCtx },
        }),
      });
    } catch {
      clearTimeout(idleTimer);
      if (timedOut) return json("Ollama took too long to respond.", 504);
      return json(
        `Can't reach Ollama at ${config.ollamaUrl}. Make sure it is running (\`ollama serve\`).`,
        503,
      );
    }

    if (!upstream.ok || !upstream.body) {
      clearTimeout(idleTimer);
      const detail = await upstream.text().catch(() => "");
      console.error("Ollama error response:", upstream.status, detail);
      if (upstream.status === 404) {
        return json(
          `Model "${config.ollamaModel}" not found. Run \`ollama pull ${config.ollamaModel}\`.`,
          502,
        );
      }
      return json(`Ollama error: ${upstream.statusText || upstream.status}`, 502);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: StreamEvent) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            /* client already disconnected */
          }
        };

        let full = "";
        const state: { failure: string | null } = { failure: null };

        const handleLine = (line: string) => {
          if (!line.trim()) return;
          let chunk: { message?: { content?: string }; error?: string };
          try {
            chunk = JSON.parse(line);
          } catch {
            return;
          }
          if (chunk.error) {
            state.failure = chunk.error;
            return;
          }
          const token = chunk.message?.content;
          if (token) {
            full += token;
            send({ type: "token", content: token });
          }
        };

        try {
          let buffer = "";
          while (!state.failure) {
            const { done, value } = await reader.read();
            if (done) break;
            armIdleTimer();
            buffer += decoder.decode(value, { stream: true });
            let newline: number;
            while ((newline = buffer.indexOf("\n")) >= 0) {
              handleLine(buffer.slice(0, newline));
              buffer = buffer.slice(newline + 1);
            }
          }
          handleLine(buffer);
        } catch {
          if (timedOut) state.failure = "Ollama stopped responding.";
          // Otherwise the client pressed Stop / left: keep whatever was generated.
        } finally {
          clearTimeout(idleTimer);
          // Persist the reply, including a partial one if generation was stopped.
          if (full.trim()) {
            try {
              addMessage({ chatId, role: "assistant", content: full });
            } catch {
              /* the chat was deleted while generating */
            }
          }

          if (state.failure) send({ type: "error", message: `Ollama error: ${state.failure}` });
          else if (!full.trim() && !upstreamAbort.signal.aborted) {
            send({ type: "error", message: "The model returned an empty response." });
          } else send({ type: "done" });

          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      },
      cancel() {
        upstreamAbort.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat API crash:", error);
    return json("Server error: " + message, 500);
  }
}
