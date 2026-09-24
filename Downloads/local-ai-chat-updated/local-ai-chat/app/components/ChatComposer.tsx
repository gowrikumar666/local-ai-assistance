"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Paperclip, Send, Square, X } from "lucide-react";
import { Button, IconButton } from "@mui/material";

type Props = {
  value: string;
  disabled: boolean;
  pendingFile: File | null;
  onChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSend: () => void;
  onStop: () => void;
  modelName: string;
};

export const ChatComposer = memo(function ChatComposer({
  value,
  disabled,
  pendingFile,
  onChange,
  onFileChange,
  onSend,
  onStop,
  modelName,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(value.trim() || pendingFile);

  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      onFileChange(file);
      event.target.value = "";
    },
    [onFileChange],
  );

  return (
    <div className="chat-composer">
      <div className="chat-composer__shell">
        {pendingFile && (
          <div className="chat-file-chip">
            <Paperclip size={14} />
            <span className="chat-file-chip__name" title={pendingFile.name}>
              {pendingFile.name}
            </span>
            <button
              type="button"
              className="chat-file-chip__remove"
              aria-label="Remove file"
              disabled={disabled}
              onClick={() => onFileChange(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="chat-composer__inner">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={handleFileInput}
          />
          <IconButton
            aria-label="Upload PDF"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              flexShrink: 0,
              color: pendingFile ? "#ef6f61" : "#64748b",
            }}
          >
            <Paperclip size={18} />
          </IconButton>
          <textarea
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingFile ? "Ask about this PDF..." : "Message Morrow..."}
            rows={1}
            disabled={disabled}
            className="chat-composer-input"
          />
          <Button
            onClick={disabled ? onStop : onSend}
            disabled={!disabled && !canSend}
            aria-label={disabled ? "Stop generating" : "Send message"}
            sx={{
              minWidth: 40,
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              flexShrink: 0,
              borderRadius: 3,
              bgcolor: "#ef6f61",
              color: "white",
              "&:hover": { bgcolor: "#e35e4e" },
              "&:disabled": { bgcolor: "#d1d5db" },
              p: 0,
            }}
          >
            {disabled ? <Square size={16} fill="currentColor" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
      <p className="chat-composer__hint">{`Upload a PDF to extract accurate data • Ollama ${modelName}`}</p>
    </div>
  );
});
