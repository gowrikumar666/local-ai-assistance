function positiveInteger(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

const maxPdfMb = positiveInteger("MAX_PDF_MB", 10);

export const config = {
  ollamaUrl: (process.env.OLLAMA_URL?.trim() || "http://localhost:11434").replace(/\/+$/, ""),
  ollamaModel: process.env.OLLAMA_MODEL?.trim() || "llama3",
  numCtx: positiveInteger("OLLAMA_NUM_CTX", 8192),
  keepAlive: process.env.OLLAMA_KEEP_ALIVE?.trim() || "30m",
  idleTimeoutMs: positiveInteger("OLLAMA_IDLE_TIMEOUT_MS", 120000),
  historyLimit: positiveInteger("CHAT_HISTORY_LIMIT", 20),
  maxPdfBytes: maxPdfMb * 1024 * 1024,
  maxPdfChars: positiveInteger("MAX_PDF_CHARS", 14000),
  maxMessageChars: 20000,
  dbPath: process.env.DB_PATH?.trim() || "data/chat.db",
};