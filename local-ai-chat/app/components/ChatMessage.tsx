"use client";

import { memo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Check, Copy, FileText } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types";

type Props = {
  message: ChatMessageType;
};

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return nodeText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function CodeBlock({ children }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nodeText(children).replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) */
    }
  };

  return (
    <div className="md-code">
      <button type="button" className="md-code__copy" onClick={copy} aria-label="Copy code">
        {copied ? <Check size={13} /> : <Copy size={13} />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre>{children}</pre>
    </div>
  );
}

// Defined once so react-markdown doesn't see new component identities on every token.
// react-markdown also passes a `node` prop, which must not reach the DOM element.
type MdProps<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & { node?: unknown };

const markdownComponents = {
  pre: ({ children }: MdProps<"pre">) => <CodeBlock>{children}</CodeBlock>,
  a: ({ node, ...props }: MdProps<"a">) => {
    void node;
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
  table: ({ node, ...props }: MdProps<"table">) => {
    void node;
    return (
      <div className="md-table">
        <table {...props} />
      </div>
    );
  },
};
const remarkPlugins = [remarkGfm];

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
        {isUser ? (
          <p className="chat-bubble__text">{message.content}</p>
        ) : (
          <div className="chat-bubble__text chat-markdown">
            <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </article>
  );
});
