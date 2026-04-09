import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export default function AnnouncementsLoading() {
  return <PageLoadingSkeleton headerTitle="Announcements" backLabel="Home" variant="cards" rows={3} />;
}
