"use client";

import { memo, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";
import { MessageSkeleton, TypingIndicator } from "./ChatLoaders";

type Props = {
  hasActiveChat: boolean;
  messages: ChatMessageType[];
  isLoading: boolean;
  isSending: boolean;
  isBootstrapping?: boolean;
};

export const ChatThread = memo(function ChatThread({
  hasActiveChat,
  messages,
  isLoading,
  isSending,
  isBootstrapping = false,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  const last = messages[messages.length - 1];
  const tailLength = last?.content.length ?? 0;
  // Show the dots only while waiting for the first token of a reply.
  const showTyping = isSending && last?.role !== "assistant";

  useEffect(() => {
    // Instant while tokens stream in (smooth scrolling lags behind fast updates).
    endRef.current?.scrollIntoView({ behavior: isSending ? "auto" : "smooth", block: "end" });
  }, [messages.length, tailLength, isSending]);

  if (isBootstrapping || isLoading) {
    return <MessageSkeleton />;
  }

  if (!hasActiveChat && messages.length === 0) {
    return (
      <div className="chat-welcome">
        <div className="chat-welcome__icon">
          <Bot size={28} />
        </div>
        <h1>How can I help you today?</h1>
        <p>Your private, local AI assistant. Start a chat or send a message to begin.</p>
      </div>
    );
  }

  return (
    <div className="chat-thread">
      {messages.length === 0 && !isSending ? (
        <p className="chat-empty">No messages in this conversation yet.</p>
      ) : (
        messages.map((message) => <ChatMessage key={message.id} message={message} />)
      )}
      {showTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
});
