"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chat, ChatAttachment, ChatMessage } from "../types";

const LAST_CHAT_KEY = "morrow:lastChatId";
const MAX_PDF_BYTES = 10 * 1024 * 1024;

function asAttachment(value: unknown): ChatAttachment | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Partial<ChatAttachment>;
  if (!item.name) return undefined;
  return { name: item.name, type: item.type || "application/pdf" };
}

function asChatList(data: unknown): Chat[] {
  return Array.isArray(data) ? (data as Chat[]) : [];
}

function asMessageList(data: unknown, chatId: string): ChatMessage[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => {
    const message = item as Partial<ChatMessage>;
    return {
      id: message.id || `${chatId}-${index}`,
      chatId: message.chatId || chatId,
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content ?? "",
      createdAt: message.createdAt,
      attachment: asAttachment(message.attachment),
    };
  });
}

export function useChatSession() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const skipFetchRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const sendAbortRef = useRef<AbortController | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const inputRef = useRef(input);

  // Keep refs in sync so handleSend always reads the latest values.
  useEffect(() => {
    pendingFileRef.current = pendingFile;
    inputRef.current = input;
  }, [pendingFile, input]);

  const selectPendingFile = useCallback((file: File | null) => {
    if (!file) {
      setPendingFile(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("PDF must be 10MB or smaller.");
      return;
    }

    setError(null);
    setPendingFile(file);
  }, []);

  const messages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : []),
    [activeChatId, messagesByChat],
  );

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const isMessagesLoading = Boolean(
    activeChatId && loadingChatId === activeChatId && messages.length === 0,
  );

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch("/api/chats");
      const data = await response.json();
      const list = asChatList(data)
        .slice()
        .sort((a, b) => {
          const left = Date.parse(b.updatedAt || b.createdAt || "") || 0;
          const right = Date.parse(a.updatedAt || a.createdAt || "") || 0;
          return left - right;
        });
      setChats(list);

      const saved = sessionStorage.getItem(LAST_CHAT_KEY);
      if (saved && list.some((chat) => chat.id === saved)) {
        setActiveChatId(saved);
      } else if (list[0]) {
        setActiveChatId(list[0].id);
      }
    } catch {
      setError("Unable to load your conversations.");
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId: string) => {
    if (skipFetchRef.current === chatId) {
      skipFetchRef.current = null;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingChatId(chatId);

    try {
      const response = await fetch(`/api/chats?chatId=${encodeURIComponent(chatId)}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      const list = asMessageList(data, chatId);

      setMessagesByChat((prev) => {
        const local = prev[chatId] ?? [];
        if (sendingRef.current && local.length > list.length) return prev;
        return { ...prev, [chatId]: list };
      });
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError("Unable to load this conversation.");
    } finally {
      setLoadingChatId((current) => (current === chatId ? null : current));
    }
  }, []);

  useEffect(() => {
    // Initial data load on mount; state is only set after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!activeChatId) return;
    sessionStorage.setItem(LAST_CHAT_KEY, activeChatId);
    void fetchMessages(activeChatId);
  }, [activeChatId, fetchMessages]);

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setMobileNavOpen(false);
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New conversation" }),
      });
      const newChat = (await response.json()) as Chat;
      skipFetchRef.current = newChat.id;
      setChats((prev) => [newChat, ...prev]);
      setMessagesByChat((prev) => ({ ...prev, [newChat.id]: [] }));
      setActiveChatId(newChat.id);
      setMobileNavOpen(false);
    } catch {
      setError("Unable to create a new conversation.");
    }
  }, []);

  const deleteChat = useCallback(async (id: string) => {
    try {
      await fetch(`/api/chats?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      setMessagesByChat((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActiveChatId((current) => {
        if (current !== id) return current;
        sessionStorage.removeItem(LAST_CHAT_KEY);
        return null;
      });
    } catch {
      setError("Unable to delete this conversation.");
    }
  }, []);

  const handleSend = useCallback(async () => {
    const messageText = inputRef.current.trim();
    const file = pendingFileRef.current;
    if ((!messageText && !file) || sendingRef.current) return;

    setInput("");
    setPendingFile(null);
    setError(null);
    sendingRef.current = true;
    setIsSending(true);

    let currentChatId = activeChatId;
    const titleSource = messageText || file?.name || "New conversation";

    try {
      if (!currentChatId) {
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleSource.slice(0, 40) }),
        });
        const chat = (await response.json()) as Chat;
        currentChatId = chat.id;
        skipFetchRef.current = chat.id;
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(chat.id);
      }

      const userMessage: ChatMessage = {
        id: `local-user-${Date.now()}`,
        chatId: currentChatId,
        role: "user",
        content:
          messageText || (file ? `Extract the key information from "${file.name}" accurately.` : ""),
        createdAt: new Date().toISOString(),
        ...(file ? { attachment: { name: file.name, type: file.type || "application/pdf" } } : {}),
      };

      setMessagesByChat((prev) => ({
        ...prev,
        [currentChatId!]: [...(prev[currentChatId!] ?? []), userMessage],
      }));

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId &&
          (chat.title === "New conversation" || chat.title === "New Chat")
            ? { ...chat, title: titleSource.slice(0, 40) }
            : chat,
        ),
      );

      const controller = new AbortController();
      sendAbortRef.current = controller;
      const chatId = currentChatId!;

      let response: Response;
      if (file) {
        const form = new FormData();
        form.append("chatId", chatId);
        form.append("message", messageText);
        form.append("file", file);
        response = await fetch("/api/chat", { method: "POST", body: form, signal: controller.signal });
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message: messageText }),
          signal: controller.signal,
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "AI server error");
      }
      if (!response.body) throw new Error("The server did not return a response stream.");

      // Tokens are batched into one state update per animation frame.
      const assistantId = `local-assistant-${Date.now()}`;
      let pending = "";
      let frame = 0;

      const appendToAssistant = (text: string) => {
        setMessagesByChat((prev) => {
          const list = prev[chatId] ?? [];
          const last = list[list.length - 1];
          if (last && last.id === assistantId) {
            return { ...prev, [chatId]: [...list.slice(0, -1), { ...last, content: last.content + text }] };
          }
          const created: ChatMessage = {
            id: assistantId,
            chatId,
            role: "assistant",
            content: text,
            createdAt: new Date().toISOString(),
          };
          return { ...prev, [chatId]: [...list, created] };
        });
      };

      const flush = () => {
        frame = 0;
        if (!pending) return;
        const text = pending;
        pending = "";
        appendToAssistant(text);
      };

      const result: { error: string | null } = { error: null };
      const handleLine = (line: string) => {
        if (!line.trim()) return;
        let event: { type: string; content?: string; message?: string };
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }
        if (event.type === "token" && event.content) {
          pending += event.content;
          if (!frame) frame = requestAnimationFrame(flush);
        } else if (event.type === "error") {
          result.error = event.message || "AI server error";
        }
      };

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf("\n")) >= 0) {
            handleLine(buffer.slice(0, newline));
            buffer = buffer.slice(newline + 1);
          }
        }
        handleLine(buffer);
      } finally {
        if (frame) cancelAnimationFrame(frame);
        flush();
      }

      if (result.error) throw new Error(result.error);
    } catch (sendError) {
      // Pressing Stop aborts the request on purpose; the partial reply stays visible.
      if (sendError instanceof DOMException && sendError.name === "AbortError") return;
      const message = sendError instanceof Error ? sendError.message : "Something went wrong.";
      setError(message);
      if (currentChatId) {
        setMessagesByChat((prev) => ({
          ...prev,
          [currentChatId!]: [
            ...(prev[currentChatId!] ?? []),
            {
              id: `local-error-${Date.now()}`,
              chatId: currentChatId!,
              role: "assistant",
              content: `Error: ${message}`,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }
    } finally {
      sendAbortRef.current = null;
      sendingRef.current = false;
      setIsSending(false);
      if (currentChatId) {
        // Most recently used conversation goes to the top of the sidebar.
        setChats((prev) => {
          const chat = prev.find((item) => item.id === currentChatId);
          return chat ? [chat, ...prev.filter((item) => item.id !== currentChatId)] : prev;
        });
      }
    }
  }, [activeChatId]);

  const stopSending = useCallback(() => {
    sendAbortRef.current?.abort();
  }, []);

  return {
    chats,
    activeChat,
    activeChatId,
    messages,
    input,
    setInput,
    pendingFile,
    selectPendingFile,
    isSending,
    isChatsLoading,
    isMessagesLoading,
    error,
    setError,
    mobileNavOpen,
    setMobileNavOpen,
    selectChat,
    createNewChat,
    deleteChat,
    handleSend,
    stopSending,
  };
}
