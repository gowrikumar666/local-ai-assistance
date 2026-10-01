"use client";

import { memo } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { IconButton, Typography } from "@mui/material";
import type { Chat } from "../types";

type Props = {
  chat: Chat;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export const ChatListItem = memo(function ChatListItem({ chat, active, onSelect, onDelete }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(chat.id);
        }
      }}
      className={`chat-list-item${active ? " is-active" : ""}`}
    >
      <MessageSquare size={15} style={{ flexShrink: 0, opacity: 0.8 }} />
      <Typography noWrap sx={{ flex: 1, ml: 1.25, fontSize: 13, fontWeight: active ? 700 : 500 }}>
        {chat.title}
      </Typography>
      <IconButton
        size="small"
        aria-label={`Delete ${chat.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onDelete(chat.id);
        }}
        sx={{
          color: "#769098",
          p: 0.5,
          opacity: { xs: 1, md: 0 },
          ".chat-list-item:hover &": { opacity: 1 },
          "&:hover": { color: "#ef6f61" },
        }}
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
});
