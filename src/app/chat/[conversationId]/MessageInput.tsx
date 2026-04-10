"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "@/lib/toast";
import { getPusherClient } from "@/lib/pusher-client";

interface MsgUser {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}

interface Msg {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: MsgUser;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function MessageThread({ conversationId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to Pusher for real-time incoming messages
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured — fall back to current behavior

    const channel = pusher.subscribe(`private-conversation-${conversationId}`);

    channel.bind("message:new", (data: Msg) => {
      setMessages((prev) => {
        // Deduplicate: the sender already added the message from the API response
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");

    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast((data as { error?: string }).error ?? "Failed to send", "error");
        setText(content); // restore input
        return;
      }

      const msg: Msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      toast("Failed to send message", "error");
      setText(content);
    } finally {
      setSending(false);
    }
  }

  // Group messages by day for date separators
  let lastDay = "";

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
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
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Message…"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red max-h-32"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-msu-red text-msu-white hover:bg-msu-red/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
