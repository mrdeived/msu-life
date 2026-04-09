import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export default function FeedLoading() {
  return <PageLoadingSkeleton headerTitle="Events" backLabel="Home" variant="cards" rows={4} />;
}
