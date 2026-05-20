import type { CheckpointMapStatus } from "@/lib/checkpoints/map-checkpoint";
import type { DivIcon, DivIconOptions } from "leaflet";

type LeafletIconApi = {
  divIcon: (options: DivIconOptions) => DivIcon;
};

const UPCOMING_COLOR = "#10B981";
const PAST_COLOR = "#64748B";
const ACTIVE_RING = "#F57E3A";

function markerHtml(
  fill: string,
  active: boolean,
  hovered: boolean,
): string {
  const scale = active ? 1.15 : hovered ? 1.08 : 1;
  const ring = active ? ACTIVE_RING : "#ffffff";
  const shadow = active
    ? "0 0 0 4px rgba(245,126,58,0.35), 0 8px 20px rgba(0,0,0,0.35)"
    : "0 4px 14px rgba(0,0,0,0.28)";

  return `<div aria-hidden="true" style="
    width:32px;height:32px;
    background:${fill};
    border:3px solid ${ring};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg) scale(${scale});
    box-shadow:${shadow};
    transition:transform 0.2s ease, box-shadow 0.2s ease;
  "></div>`;
}

export function createCheckpointMarkerIcon(
  L: LeafletIconApi,
  status: CheckpointMapStatus,
  options?: { active?: boolean; hovered?: boolean },
): DivIcon {
  const fill = status === "upcoming" ? UPCOMING_COLOR : PAST_COLOR;
  const active = options?.active ?? false;
  const hovered = options?.hovered ?? false;

  return L.divIcon({
    className: "checkpoint-map-marker",
    html: markerHtml(fill, active, hovered),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function createClusterIcon(
  L: LeafletIconApi,
  cluster: {
    getChildCount: () => number;
  },
): DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 25 ? 46 : 52;

  return L.divIcon({
    className: "checkpoint-cluster-marker",
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:rgba(4,15,32,0.88);
      border:2px solid #F57E3A;
      border-radius:50%;
      color:#fff;
      font:600 13px/1 Montserrat, sans-serif;
      box-shadow:0 6px 18px rgba(0,0,0,0.35);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
