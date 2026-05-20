import { CheckpointsLocatorDynamic } from "@/components/map/checkpoints-locator-dynamic";
import { fetchMapCheckpointsFromApiServer } from "@/lib/checkpoints/server-api-fetch";

export default async function DashboardMapPage() {
  const result = await fetchMapCheckpointsFromApiServer(250);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CheckpointsLocatorDynamic
        initialCheckpoints={result.data}
        loadError={result.error}
      />
    </div>
  );
}
