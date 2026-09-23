"use client";

import { memo } from "react";
import { Menu } from "lucide-react";
import { IconButton, Typography } from "@mui/material";
import type { Chat } from "../types";

type Props = {
  chat: Chat | null;
  onOpenSidebar: () => void;
};

export const ChatHeader = memo(function ChatHeader({ chat, onOpenSidebar }: Props) {
  return (
    <header className="chat-header">
      <IconButton onClick={onOpenSidebar} sx={{ display: { md: "none" }, color: "#1e2c36" }} aria-label="Open chats">
        <Menu size={20} />
      </IconButton>
      <div className="chat-header__meta">
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 15, color: "#0d1b24" }}>
          {chat?.title || "New chat"}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#71808a" }}>Local assistant</Typography>
      </div>
    </header>
  );
});
