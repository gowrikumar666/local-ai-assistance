export type Chat = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatAttachment = {
  name: string;
  type: string;
};

export type ChatMessage = {
  id: string;
  chatId?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  attachment?: ChatAttachment;
};
