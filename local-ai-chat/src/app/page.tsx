"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageSquareText,
  Mic,
  Paperclip,
  Plus,
  Search,
  SendHorizonal,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const chatList = [
  { id: 1, name: "Product strategy", active: true, preview: "Let's refine the launch plan." },
  { id: 2, name: "UX feedback", active: false, preview: "Try a simpler onboarding flow." },
  { id: 3, name: "Email draft", active: false, preview: "Write a warm follow-up note." },
  { id: 4, name: "Research notes", active: false, preview: "Summarize the key takeaways." },
];

const quickPrompts = [
  "Brainstorm ideas",
  "Draft a message",
  "Summarize notes",
  "Plan next steps",
];

const initialMessages = [
  {
    id: 1,
    from: "assistant",
    text: "Hi! I can help you plan, write, and refine ideas. What would you like to work on today?",
  },
  {
    id: 2,
    from: "user",
    text: "Can you help me simplify the onboarding flow for new users?",
  },
  {
    id: 3,
    from: "assistant",
    text: "Absolutely. I’d start by reducing decision points, clarifying the first action, and keeping progress visible.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const newUserMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, newUserMessage]);
    setInput("");
    setIsSending(true);

    window.setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        from: "assistant",
        text: "That sounds good. I’d suggest keeping the step simple, reducing friction, and making the outcome clear for the user.",
      };

      setMessages((current) => [...current, reply]);
      setIsSending(false);
    }, 900);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    setInput(event.target.value);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f1ff_0%,#f4f7ff_40%,#eef2ff_100%)] text-slate-800">
      <div className="mx-auto flex h-screen max-w-[1500px] flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:p-6">
        <aside className="hidden w-full shrink-0 rounded-[26px] border border-violet-100 bg-white/80 p-3 shadow-[0_14px_50px_rgba(99,102,241,0.08)] backdrop-blur-xl lg:flex lg:w-[300px] lg:flex-col lg:p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                <h1 className="text-base font-semibold text-slate-900">ChatFlow</h1>
              </div>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-violet-700">
              <span>Today</span>
              <Star className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium text-slate-700">Team sync</p>
            <p className="mt-1 text-xs text-slate-500">3 new thoughts from your chats</p>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Recent chats</h2>
          </div>

          <div className="space-y-2 overflow-hidden">
            {chatList.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                  chat.active
                    ? "border-violet-200 bg-violet-50 shadow-sm"
                    : "border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{chat.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{chat.preview}</p>
                </div>
                <div className="ml-3 h-2.5 w-2.5 rounded-full bg-violet-400" />
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-violet-100 bg-white/80 shadow-[0_30px_80px_rgba(99,102,241,0.08)] backdrop-blur-sm sm:rounded-[30px]">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-3 py-3 sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-200 sm:h-11 sm:w-11">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Local assistant</p>
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">Product strategy</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
                <Search className="h-4 w-4" />
                Search
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white sm:h-10 sm:w-10">
                <User className="h-4 w-4" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.12),transparent_30%),linear-gradient(to_bottom,#ffffff,#faf7ff)] p-3 sm:p-4 lg:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto max-w-3xl">
              <div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 sm:text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-[22px] px-3 py-3 shadow-sm sm:max-w-[85%] sm:px-4 ${
                        message.from === "user"
                          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-slate-200"
                          : "border border-slate-200 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] opacity-70 sm:text-[11px]">
                        {message.from === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        {message.from === "user" ? "You" : "Assistant"}
                      </div>
                      <p className="break-words text-sm leading-6 [overflow-wrap:anywhere] sm:leading-7">{message.text}</p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        maxWidth: { xs: "90%", sm: "85%" },
                        px: { xs: 1.5, sm: 2 },
                        py: 1.5,
                        borderRadius: "22px",
                        color: "#64748b",
                      }}
                    >
                      <CircularProgress size={16} thickness={5} sx={{ color: "#8b5cf6" }} />
                      <Typography variant="body2">Assistant is thinking...</Typography>
                    </Paper>
                  </Box>
                )}

                <div ref={endRef} />
              </div>
            </div>
          </div>

          <Box sx={{ borderTop: "1px solid #f1f5f9", bgcolor: "#fff", px: { xs: 1.5, sm: 2, lg: 3 }, py: { xs: 1.5, sm: 2, lg: 2.5 } }}>
            <Box sx={{ maxWidth: 768, mx: "auto", border: "1px solid #e2e8f0", borderRadius: { xs: 3, sm: 4 }, bgcolor: "#f8fafc", p: { xs: 1.25, sm: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, px: 0.5, color: "#94a3b8" }}>
                <MessageSquareText size={14} />
                <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  New message
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "flex-end" }}>
                <IconButton aria-label="Attach file" sx={{ display: { xs: "none", sm: "inline-flex" }, width: 44, height: 44, flexShrink: 0, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "#fff", color: "#64748b" }}>
                  <Paperclip size={17} />
                </IconButton>

                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={6}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  size="small"
                  sx={{
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      minHeight: 48,
                      alignItems: "flex-start",
                      borderRadius: 3,
                      bgcolor: "#fff",
                      fontSize: { xs: 14, sm: 15 },
                      pr: 1,
                    },
                    "& .MuiOutlinedInput-input": { py: 1.5 },
                  }}
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton aria-label="Voice input" sx={{ width: 44, height: 44, flexShrink: 0, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "#fff", color: "#64748b" }}>
                    <Mic size={17} />
                  </IconButton>
                  <IconButton
                    aria-label="Send message"
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 3, bgcolor: "#7c3aed", color: "#fff", "&:hover": { bgcolor: "#6d28d9" }, "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#fff" } }}
                  >
                    {isSending ? <CircularProgress size={19} sx={{ color: "#fff" }} /> : <SendHorizonal size={18} />}
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </section>
      </div>
    </main>
  );
}
