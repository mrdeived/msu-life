"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
}

interface ChatContextValue {
  conversationId: string;
  currentUserId: string;
  isGroup: boolean;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
}

const ChatCtx = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  conversationId,
  currentUserId,
  isGroup,
  initialMessages,
  children,
}: {
  conversationId: string;
  currentUserId: string;
  isGroup: boolean;
  initialMessages: ChatMessage[];
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }

  return (
    <ChatCtx.Provider value={{ conversationId, currentUserId, isGroup, messages, addMessage }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
