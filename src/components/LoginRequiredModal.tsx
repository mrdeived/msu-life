"use client";

import Link from "next/link";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Login required</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          To like, bookmark, or attend events, please log in.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/login"
            className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors"
          >
            Go to Login
          </Link>
          <button
            onClick={onClose}
            className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
