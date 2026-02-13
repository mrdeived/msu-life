import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";

export default async function BookmarksPage() {
  await requireAuth();
  redirect("/my-events");
}
