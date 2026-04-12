"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send } from "lucide-react";
import { toast } from "@/lib/toast";
import { useChatContext } from "./ChatContext";

export default function ChatComposer() {
  const { conversationId, addMessage } = useChatContext();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
        setText(content);
        return;
      }

      const msg = await res.json();
      addMessage(msg);
    } catch {
      toast("Failed to send message", "error");
      setText(content);
    } finally {
      setSending(false);
    }
  }

  // createPortal requires the DOM — wait for client mount before rendering
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl
        border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <form onSubmit={handleSend} className="flex items-end gap-2 px-4 py-3">
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
    </div>,
    document.body
  );
}
