"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteEventButton({
  eventId,
  action,
}: {
  eventId: string;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this event? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        aria-label="Delete event"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
