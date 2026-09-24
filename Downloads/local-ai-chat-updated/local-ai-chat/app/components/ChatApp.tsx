"use client";

import { AlertCircle } from "lucide-react";
import { Box, CssBaseline, Drawer, ThemeProvider } from "@mui/material";
import { appTheme } from "../theme";
import { useChatSession } from "../hooks/useChatSession";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import { ChatComposer } from "./ChatComposer";

export default function ChatApp({ modelName }: { modelName: string }) {
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
          sx={{ width: { md: 288 }, flexShrink: 0, minHeight: 0, display: { xs: "none", md: "block" } }}
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

          <ChatHeader chat={activeChat} onOpenSidebar={() => setMobileNavOpen(true)} />

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
