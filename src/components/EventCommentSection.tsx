"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";

const PREVIEW_COUNT = 3;
const MAX_COMMENT_LENGTH = 500;

interface CommentUser {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}

interface EventComment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

function displayName(user: CommentUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.username ?? "User";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventCommentSection({
  eventId,
  isAuthenticated,
}: {
  eventId: string;
  isAuthenticated: boolean;
}) {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/comments`)
      .then((r) => r.json())
      .then((data: EventComment[]) => setComments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  const hasMore = comments.length > PREVIEW_COUNT;
  const visible = expanded ? comments : comments.slice(0, PREVIEW_COUNT);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error ?? "Failed to post comment";
        setError(msg);
        toast(msg, "error");
        return;
      }

      const newComment: EventComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setText("");
      toast("Comment posted");
      // Keep expanded if we already were, or if the new comment pushes beyond preview
      if (!expanded && comments.length >= PREVIEW_COUNT) {
        setExpanded(true);
      }
      textareaRef.current?.focus();
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 px-5 py-5 space-y-4">
      <h3 className="text-sm font-semibold text-msu-red">
        Comments {!loading && `(${comments.length})`}
      </h3>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {visible.map((c) => (
              <li
                key={c.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 space-y-1"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {displayName(c.user)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {c.content}
                </p>
              </li>
            ))}
          </ul>

          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-msu-red hover:underline font-medium"
            >
              Show {comments.length - PREVIEW_COUNT} more comment
              {comments.length - PREVIEW_COUNT === 1 ? "" : "s"}
            </button>
          )}

          {expanded && hasMore && (
            <button
              onClick={() => setExpanded(false)}
              className="text-sm text-gray-400 hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-msu-red"
          />
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">
              {text.length}/{MAX_COMMENT_LENGTH}
            </span>
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-msu-red text-msu-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <a href="/login" className="text-msu-red hover:underline font-medium">
            Sign in
          </a>{" "}
          to comment.
        </p>
      )}
    </section>
  );
}
