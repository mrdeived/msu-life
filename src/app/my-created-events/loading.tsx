import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export default function MyCreatedEventsLoading() {
  return <PageLoadingSkeleton headerTitle="My Events" backLabel="Home" variant="cards" rows={3} />;
}
