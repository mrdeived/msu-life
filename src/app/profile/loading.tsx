import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export default function ProfileLoading() {
  return <PageLoadingSkeleton headerTitle="Profile" backLabel="Home" variant="form" rows={4} />;
}
