export type ReportCheckpointBody = {
  reporterName: string;
  reporterEmail: string;
  State: string;
  County: string;
  City: string;
  Location: string;
  Description: string;
  Date: string;
  Time: string;
  Source: string;
  mapurl: string;
};

export const REPORT_CHECKPOINT_REQUIRED: (keyof ReportCheckpointBody)[] = [
  "reporterName",
  "reporterEmail",
  "State",
  "County",
  "City",
  "Location",
  "Description",
  "Date",
  "Time",
];

export const REPORT_CHECKPOINT_INITIAL: ReportCheckpointBody = {
  reporterName: "",
  reporterEmail: "",
  State: "California",
  County: "",
  City: "",
  Location: "",
  Description: "",
  Date: "",
  Time: "",
  Source: "",
  mapurl: "",
};

export const REPORT_FIELD_LABELS: Record<keyof ReportCheckpointBody, string> = {
  reporterName: "Full name",
  reporterEmail: "Email address",
  State: "State",
  County: "County",
  City: "City",
  Location: "Checkpoint location",
  Description: "Description",
  Date: "Date",
  Time: "Time",
  Source: "Source URL",
  mapurl: "Google Maps URL",
};
