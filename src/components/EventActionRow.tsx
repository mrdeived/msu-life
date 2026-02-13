"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Bookmark, CalendarCheck } from "lucide-react";
import LoginRequiredModal from "@/components/LoginRequiredModal";

interface Props {
  eventId: string;
  isGuest?: boolean;
  initialAttending: boolean;
  initialBookmarked: boolean;
  initialLiked: boolean;
  attendeeCount: number;
  bookmarkCount: number;
  likeCount: number;
}

export default function EventActionRow({
  eventId,
  isGuest = false,
  initialAttending,
  initialBookmarked,
  initialLiked,
  attendeeCount,
  bookmarkCount,
  likeCount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function toggle(action: "like" | "bookmark" | "attend", active: boolean) {
    if (isGuest) {
      setShowModal(true);
      return;
    }
    setLoading(action);
    await fetch(`/api/events/${eventId}/${action}`, {
      method: active ? "DELETE" : "POST",
    });
    router.refresh();
    setLoading(null);
  }

  const actions = [
    {
      key: "like" as const,
      active: initialLiked,
      count: likeCount,
      Icon: Heart,
      label: "Like",
    },
    {
      key: "bookmark" as const,
      active: initialBookmarked,
      count: bookmarkCount,
      Icon: Bookmark,
      label: "Save",
    },
    {
      key: "attend" as const,
      active: initialAttending,
      count: attendeeCount,
      Icon: CalendarCheck,
      label: "Attend",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-around py-2">
        {actions.map(({ key, active, count, Icon, label }) => (
          <button
            key={key}
            onClick={() => toggle(key, active)}
            disabled={loading !== null}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon
              size={22}
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
              {count} {label}
            </span>
          </button>
        ))}
      </div>
      <LoginRequiredModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
