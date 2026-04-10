"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "@/lib/toast";

export default function MessageButton({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMessage() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not open conversation", "error");
        return;
      }
      router.push(`/chat/${data.id}`);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-msu-red hover:text-msu-red transition-colors disabled:opacity-50"
    >
      <MessageCircle size={14} />
      Message
    </button>
  );
}
