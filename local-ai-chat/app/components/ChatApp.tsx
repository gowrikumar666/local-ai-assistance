"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Box, CssBaseline, Drawer, ThemeProvider } from "@mui/material";
import { appTheme } from "../theme";
import { useChatSession } from "../hooks/useChatSession";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import { ChatComposer } from "./ChatComposer";

export default function ChatApp({ modelName }: { modelName: string }) {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const {
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
  } = useChatSession();

  const sidebar = (
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      isLoading={isChatsLoading}
      onCloseMobile={() => setMobileNavOpen(false)}
      onNewChat={createNewChat}
      onSelectChat={selectChat}
      onDeleteChat={deleteChat}
    />
  );

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100dvh",
          maxWidth: "100vw",
          display: "flex",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          component="nav"
          aria-label="Chat history"
          sx={{
            width: { xs: 0, md: desktopSidebarOpen ? 288 : 0 },
            flexShrink: 0,
            minHeight: 0,
            overflow: "hidden",
            display: { xs: "none", md: "block" },
            transition: "width 180ms ease",
          }}
        >
          {sidebar}
        </Box>
        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: "min(288px, 86vw)", border: 0 } }}
        >
          {sidebar}
        </Drawer>

        <Box
          component="main"
          className="chat-pane"
          sx={{
            minWidth: 0,
            minHeight: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {error && (
            <div className="chat-error">
              <div className="chat-error__inner">
                <AlertCircle size={20} />
                <span className="chat-error__text">{error}</span>
                <button type="button" onClick={() => setError(null)} className="chat-error__close">
                  ✕
                </button>
              </div>
            </div>
          )}

          <ChatHeader
            chat={activeChat}
            desktopSidebarOpen={desktopSidebarOpen}
            onOpenMobileSidebar={() => setMobileNavOpen(true)}
            onToggleDesktopSidebar={() => setDesktopSidebarOpen((open) => !open)}
          />

          <div className="chat-thread-scroll">
            <ChatThread
              hasActiveChat={Boolean(activeChatId)}
              messages={messages}
              isLoading={isMessagesLoading}
              isSending={isSending}
              isBootstrapping={isChatsLoading && !activeChatId}
            />
          </div>

          <ChatComposer
            value={input}
            disabled={isSending}
            pendingFile={pendingFile}
            onChange={setInput}
            onFileChange={selectPendingFile}
            onSend={handleSend}
            onStop={stopSending}
            modelName={modelName}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
