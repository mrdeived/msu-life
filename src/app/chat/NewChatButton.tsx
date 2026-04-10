"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "@/lib/toast";

export default function NewChatButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim();
    if (!u || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "User not found", "error");
        return;
      }
      setOpen(false);
      setUsername("");
      router.push(`/chat/${data.id}`);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors"
      >
        <Plus size={16} />
        New Chat
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">New Chat</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStart} className="space-y-3">
              <div className="flex items-center">
                <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-md">@</span>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-r-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-msu-red"
                />
              </div>
              <button
                type="submit"
                disabled={!username.trim() || loading}
                className="w-full py-2 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Starting…" : "Start Conversation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
