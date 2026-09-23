"use client";

import { memo } from "react";
import { Bot, FileText } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types";

type Props = {
  message: ChatMessageType;
};

export const ChatMessage = memo(function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <article className={`chat-row ${isUser ? "chat-row--user" : "chat-row--assistant"}`}>
      {!isUser && (
        <div className="chat-avatar" aria-hidden>
          <Bot size={15} />
        </div>
      )}
      <div className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"}`}>
        {!isUser && <p className="chat-bubble__label">Assistant</p>}
        {message.attachment && (
          <div className="chat-bubble__file">
            <FileText size={14} />
            <span>{message.attachment.name}</span>
          </div>
        )}
        <p className="chat-bubble__text">{message.content}</p>
      </div>
    </article>
  );
});
