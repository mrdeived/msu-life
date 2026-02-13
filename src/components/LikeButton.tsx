"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LikeButton({ eventId, initialLiked }: { eventId: string; initialLiked: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/events/${eventId}/like`, {
      method: initialLiked ? "DELETE" : "POST",
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 text-sm rounded-md border transition-colors disabled:opacity-50 ${
        initialLiked
          ? "bg-msu-green text-msu-white border-msu-green hover:bg-msu-green/80"
          : "border-msu-red text-msu-red hover:bg-msu-red hover:text-msu-white"
      }`}
    >
      {loading ? "…" : initialLiked ? "Liked" : "Like"}
    </button>
  );
}
