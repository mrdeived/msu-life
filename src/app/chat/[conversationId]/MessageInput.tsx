"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { useChatContext, type ChatMessage } from "./ChatContext";

function senderLabel(sender: { firstName: string | null; lastName: string | null; username: string | null }): string {
  if (sender.username) return `@${sender.username}`;
  if (sender.firstName && sender.lastName) return `${sender.firstName} ${sender.lastName}`;
  if (sender.firstName) return sender.firstName;
  return "Unknown";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function MessageThread() {
  const { conversationId, currentUserId, isGroup, messages, addMessage } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitial = useRef(true);

  // Subscribe to Pusher for real-time incoming messages
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-conversation-${conversationId}`);
    channel.bind("message:new", (data: ChatMessage) => {
      addMessage(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId]);

  // Scroll to bottom on mount (immediate) and on new messages (smooth)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      bottomRef.current?.scrollIntoView();
      return;
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages.length]);

  let lastDay = "";

  return (
    // pb-44 clears the fixed composer (~60px tall at bottom-[4.5rem]=72px) and the BottomNav
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-44 space-y-1">
      {messages.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
          No messages yet. Say hello!
        </p>
      )}

      {messages.map((msg) => {
        const mine = msg.senderId === currentUserId;
        const day = formatDay(msg.createdAt);
        const showDay = day !== lastDay;
        lastDay = day;

        return (
          <div key={msg.id}>
            {showDay && (
              <div className="flex items-center gap-2 py-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{day}</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}

            <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-1`}>
              <div className={`max-w-[78%] ${!mine ? "space-y-0.5" : ""}`}>
                {isGroup && !mine && (
                  <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-1">
                    {senderLabel(msg.sender)}
                  </p>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    mine
                      ? "bg-msu-red text-msu-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${mine ? "text-msu-white/70 text-right" : "text-gray-400 dark:text-gray-500"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
