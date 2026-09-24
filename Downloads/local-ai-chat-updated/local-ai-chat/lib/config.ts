/**
 * Central, env-based server configuration.
 * Copy `.env.example` to `.env.local` to override any of these.
 */
function int(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const config = {
  ollamaUrl: (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, ""),
  ollamaModel: process.env.OLLAMA_MODEL || "llama3",
  /** Context window (tokens). Ollama's default is small and silently truncates prompts. */
  numCtx: int("OLLAMA_NUM_CTX", 8192),
  /** How long Ollama keeps the model loaded after a request (e.g. "30m", "1h", "-1"). */
  keepAlive: process.env.OLLAMA_KEEP_ALIVE || "30m",
  /** Abort if Ollama sends nothing for this long (covers cold model loads). */
  idleTimeoutMs: int("OLLAMA_IDLE_TIMEOUT_MS", 120_000),
  /** Only the most recent N messages are sent to the model. */
  historyLimit: int("CHAT_HISTORY_LIMIT", 20),
  maxPdfBytes: int("MAX_PDF_MB", 10) * 1024 * 1024,
  maxPdfChars: int("MAX_PDF_CHARS", 14_000),
  maxMessageChars: int("MAX_MESSAGE_CHARS", 8_000),
  dbPath: process.env.DB_PATH || "data/chat.db",
};
