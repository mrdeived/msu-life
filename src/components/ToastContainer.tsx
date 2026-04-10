"use client";

import { useEffect, useState } from "react";
import { _registerToastListener, ToastPayload } from "@/lib/toast";

interface ToastItem extends ToastPayload {
  id: number;
  exiting: boolean;
}

let _id = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _registerToastListener((payload) => {
      const id = ++_id;
      setToasts((prev) => [...prev.slice(-2), { ...payload, id, exiting: false }]);

      // Start exit animation after 3s
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
      }, 3000);

      // Remove from DOM after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3350);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2.5 px-4 py-2.5
            rounded-full shadow-lg border backdrop-blur-sm
            text-sm font-medium whitespace-nowrap
            transition-all duration-300
            ${t.exiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
            ${t.type === "success"
              ? "bg-white/95 dark:bg-gray-900/95 border-green-200 dark:border-green-800 text-gray-900 dark:text-gray-100"
              : "bg-white/95 dark:bg-gray-900/95 border-red-200 dark:border-red-800 text-gray-900 dark:text-gray-100"
            }
          `}
          style={{ animation: t.exiting ? undefined : "toastIn 0.25s ease-out" }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              t.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {t.message}
        </div>
      ))}
    </div>
  );
}
