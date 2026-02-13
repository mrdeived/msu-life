"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Bookmark, CalendarCheck } from "lucide-react";
import LoginRequiredModal from "@/components/LoginRequiredModal";

interface Props {
  eventId: string;
  isGuest?: boolean;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialAttending: boolean;
  initialLikeCount: number;
  initialBookmarkCount: number;
  initialAttendeeCount: number;
}

export default function FeedActionRow({
  eventId,
  isGuest = false,
  initialLiked,
  initialBookmarked,
  initialAttending,
  initialLikeCount,
  initialBookmarkCount,
  initialAttendeeCount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [attending, setAttending] = useState(initialAttending);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [attendeeCount, setAttendeeCount] = useState(initialAttendeeCount);

  async function toggle(
    action: "like" | "bookmark" | "attend",
    active: boolean,
    setActive: (v: boolean) => void,
    setCount: (fn: (n: number) => number) => void,
  ) {
    if (isGuest) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    // Optimistic update
    setActive(!active);
    setCount((n) => n + (active ? -1 : 1));

    try {
      const res = await fetch(`/api/events/${eventId}/${action}`, {
        method: active ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error(`${action} failed`);
      router.refresh();
    } catch (err) {
      // Revert on failure
      console.error(err);
      setActive(active);
      setCount((n) => n + (active ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  const actions = [
    { key: "like" as const, active: liked, count: likeCount, setActive: setLiked, setCount: setLikeCount, Icon: Heart },
    { key: "bookmark" as const, active: bookmarked, count: bookmarkCount, setActive: setBookmarked, setCount: setBookmarkCount, Icon: Bookmark },
    { key: "attend" as const, active: attending, count: attendeeCount, setActive: setAttending, setCount: setAttendeeCount, Icon: CalendarCheck },
  ];

  return (
    <>
      <div
        className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1"
        onClick={(e) => e.preventDefault()}
      >
        {actions.map(({ key, active, count, setActive, setCount, Icon }) => (
          <button
            key={key}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(key, active, setActive, setCount);
            }}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon
              size={15}
              className={
                active
                  ? key === "like"
                    ? "text-red-500 fill-red-500"
                    : "text-msu-green fill-msu-green"
                  : "text-gray-400 dark:text-gray-500"
              }
              strokeWidth={active ? 2.5 : 1.5}
            />
            <span
              className={`text-xs font-medium ${
                active ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>
      <LoginRequiredModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
