"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { createEventAction } from "./actions";

export default function CreateEventForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (selectedFile) {
        let uploaded: { url: string; publicId: string };
        try {
          uploaded = await uploadImageToCloudinary(selectedFile);
        } catch {
          setError("Image upload failed. Please try again or remove the image.");
          setSubmitting(false);
          return;
        }
        formData.set("imageUrl", uploaded.url);
        formData.set("imagePublicId", uploaded.publicId);
      }

      const result = await createEventAction(formData);

      if ("error" in result) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      router.push(`/event/${result.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 sm:rounded-lg border-y sm:border border-gray-200 dark:border-gray-800 p-5 sm:p-6 space-y-4"
    >
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="Event name"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          maxLength={120}
          placeholder="Where is it?"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start <span className="text-red-500">*</span>
          </label>
          <input
            id="startAt"
            name="startAt"
            type="datetime-local"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End
          </label>
          <input
            id="endAt"
            name="endAt"
            type="datetime-local"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={4}
          placeholder="Tell people about the event…"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-msu-red/50 focus:border-msu-red resize-y"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image <span className="text-gray-400 font-normal">(optional)</span>
        </label>

        {preview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-md border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="image"
            className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-msu-red/60 transition-colors"
          >
            <span className="text-sm text-gray-400">Click to select an image</span>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium rounded-md bg-msu-red text-msu-white hover:bg-msu-red/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating…" : "Create Event"}
        </button>
        <Link
          href="/home"
          className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
