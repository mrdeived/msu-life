"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "@/lib/toast";

export default function LeaveChatButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not leave chat", "error");
        return;
      }
      toast("You left the chat");
      router.push("/chat");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="text-xs font-medium text-msu-white/70 hover:text-msu-white disabled:opacity-50 transition-colors flex items-center gap-1"
    >
      <LogOut size={13} />
      {loading ? "Leaving…" : "Leave"}
    </button>
  );
}
