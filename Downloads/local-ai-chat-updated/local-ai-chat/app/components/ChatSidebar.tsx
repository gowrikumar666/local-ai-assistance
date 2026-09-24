"use client";

import { memo } from "react";
import { Bot, Plus, X } from "lucide-react";
import { Avatar, Box, Button, Divider, IconButton, Typography } from "@mui/material";
import type { Chat } from "../types";
import { ChatListItem } from "./ChatListItem";
import { SidebarSkeleton } from "./ChatLoaders";

type Props = {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  onCloseMobile: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
};

export const ChatSidebar = memo(function ChatSidebar({
  chats,
  activeChatId,
  isLoading,
  onCloseMobile,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: Props) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#172a35", color: "#fffaf5" }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, borderRadius: 2 }}>
            <Bot size={19} />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Morrow</Typography>
            <Typography sx={{ color: "#9db0b5", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
              LOCAL AI STUDIO
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onCloseMobile} sx={{ color: "#9db0b5", display: { md: "none" } }} aria-label="Close sidebar">
          <X size={20} />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onNewChat}
          sx={{ justifyContent: "flex-start", px: 2, py: 1.4, boxShadow: "none" }}
        >
          New chat
        </Button>
      </Box>

      <Typography sx={{ px: 3, pt: 1, pb: 1, color: "#769098", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
        CHATS
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, minHeight: 0 }}>
        {isLoading ? (
          <SidebarSkeleton />
        ) : chats.length === 0 ? (
          <Typography sx={{ px: 1.5, py: 2, color: "#769098", fontSize: 13 }}>
            Your conversations will appear here.
          </Typography>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={activeChatId === chat.id}
              onSelect={onSelectChat}
              onDelete={onDeleteChat}
            />
          ))
        )}
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />
        <Typography sx={{ color: "#9db0b5", fontSize: 12 }}>Private by design</Typography>
        <Typography sx={{ color: "#647e84", fontSize: 11, mt: 0.5 }}>Your chats stay on this device.</Typography>
      </Box>
    </Box>
  );
});
