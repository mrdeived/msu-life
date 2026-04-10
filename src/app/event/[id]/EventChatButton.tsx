"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "@/lib/toast";

export default function EventChatButton({
  conversationId,
  isParticipant,
}: {
  conversationId: string;
  isParticipant: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (isParticipant) {
      router.push(`/chat/${conversationId}`);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chat/conversations/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not join chat", "error");
        return;
      }
      toast("Joined group chat");
      router.push(`/chat/${conversationId}`);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 disabled:opacity-50 transition-colors"
    >
      <MessageSquare size={15} />
      {isParticipant ? "Open Group Chat" : loading ? "Joining…" : "Join Group Chat"}
    </button>
  );
}
