"use client";

import { Bot } from "lucide-react";

export function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton" aria-label="Loading conversations">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="sidebar-skeleton__row">
          <div className="sidebar-skeleton__icon skeleton-shimmer" />
          <div className="sidebar-skeleton__line skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="chat-thread" aria-label="Loading messages">
      <div className="chat-row chat-row--user">
        <div className="message-skeleton-user skeleton-shimmer" />
      </div>
      <div className="chat-row chat-row--assistant">
        <div className="chat-avatar skeleton-shimmer" style={{ background: "#e5e7eb" }} />
        <div className="chat-bubble chat-bubble--assistant message-skeleton-lines">
          <div className="message-skeleton-line skeleton-shimmer" style={{ width: "92%" }} />
          <div className="message-skeleton-line skeleton-shimmer" style={{ width: "78%" }} />
          <div className="message-skeleton-line skeleton-shimmer" style={{ width: "64%" }} />
        </div>
      </div>
      <div className="chat-row chat-row--user">
        <div className="message-skeleton-user skeleton-shimmer" style={{ height: "2.5rem", width: "40%", maxWidth: 160 }} />
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="chat-row chat-row--assistant">
      <div className="chat-avatar">
        <Bot size={15} />
        <span className="sr-only">Assistant is typing</span>
      </div>
      <div className="typing-chip">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
