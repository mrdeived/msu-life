import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Chat</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <MessageCircle size={48} className="text-gray-300 dark:text-gray-700" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon</p>
        </div>
      </main>
    </div>
  );
}
