import { CheckpointDetailView } from "@/components/dashboard/checkpoint-detail-view";
import { resolveCheckpointCoordinates } from "@/lib/checkpoints/coordinates";
import { getCheckpointById } from "@/lib/checkpoints/repository";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckpointDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const { data: checkpoint, error } = await getCheckpointById(id);

  if (error || !checkpoint) {
    notFound();
  }

  const coordinates = resolveCheckpointCoordinates(checkpoint);

  return (
    <CheckpointDetailView checkpoint={checkpoint} coordinates={coordinates} />
  );
}
