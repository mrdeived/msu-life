"use client";

import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "@/lib/toast";

export default function FollowButton({
  targetId,
  initialFollowing,
}: {
  targetId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/users/${targetId}/follow`, { method });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Something went wrong", "error");
        return;
      }
      setFollowing(data.following);
      toast(data.following ? "Following" : "Unfollowed");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500"
          : "bg-msu-red text-msu-white hover:bg-msu-red/90"
      }`}
    >
      {following ? <UserMinus size={14} /> : <UserPlus size={14} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
