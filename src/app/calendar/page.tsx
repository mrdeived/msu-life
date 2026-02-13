import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";

export default async function CalendarPage() {
  await requireAuth();
  redirect("/home");
}
