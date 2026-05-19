import { CheckpointsListPage } from "@/components/dashboard/checkpoints-list-page";
import { fetchPastCheckpointsFromApiServer } from "@/lib/checkpoints/server-api-fetch";

export default async function PastCheckpointsPage() {
  const result = await fetchPastCheckpointsFromApiServer(50);

  return (
    <CheckpointsListPage
      title="Past checkpoints"
      description="Previously reported DUI checkpoints, sorted by most recent date first."
      checkpoints={result.data}
      emptyMessage="No past checkpoints found."
      error={result.error}
      isUnauthorized={result.status === 401}
      alternateLink={{
        href: "/dashboard/checkpoints/upcoming",
        label: "View upcoming checkpoints →",
      }}
    />
  );
}
