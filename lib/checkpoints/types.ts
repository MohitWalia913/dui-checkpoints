export const CHECKPOINTS_TABLE = "Checkpoints" as const;

export type Checkpoint = {
  id: number;
  State: string;
  County: string;
  City: string;
  Location: string;
  Description: string;
  Date: string;
  Time: string;
  Source: string;
  created_at: string;
  mapurl: string | null;
  location_id: string | null;
};

export type CheckpointListItem = Pick<
  Checkpoint,
  | "id"
  | "State"
  | "County"
  | "City"
  | "Location"
  | "Date"
  | "Time"
  | "Source"
  | "mapurl"
  | "location_id"
>;

export type CheckpointInsert = Omit<Checkpoint, "id" | "created_at"> & {
  id?: number;
  created_at?: string;
};

export type CheckpointUpdate = Partial<CheckpointInsert>;

export type CheckpointStats = {
  total: number;
  upcoming: number;
  thisWeek: number;
  counties: number;
};

export type CheckpointsListParams = {
  upcoming?: boolean;
  /** Newest first (dashboard fallback when no future dates exist) */
  latest?: boolean;
  county?: string;
  city?: string;
  state?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
};

export type DashboardCheckpointsResponse = {
  data: CheckpointListItem[];
  listType: "upcoming" | "latest";
  error: string | null;
};
