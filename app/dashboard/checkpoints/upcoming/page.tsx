import { CheckpointsListPage } from "@/components/dashboard/checkpoints-list-page";
import { fetchUpcomingCheckpointsFromApiServer } from "@/lib/checkpoints/server-api-fetch";

export default async function UpcomingCheckpointsPage() {
  const result = await fetchUpcomingCheckpointsFromApiServer(50);

  return (
    <CheckpointsListPage
      title="Upcoming checkpoints"
      description="Scheduled DUI checkpoints on or after today, sorted by date."
      checkpoints={result.data}
      emptyMessage="No upcoming checkpoints scheduled."
      error={result.error}
      isUnauthorized={result.status === 401}
      alternateLink={{
        href: "/dashboard/checkpoints/past",
        label: "View past checkpoints →",
      }}
    />
  );
}
