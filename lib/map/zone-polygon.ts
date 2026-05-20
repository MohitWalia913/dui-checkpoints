import type { LatLng } from "@/lib/checkpoints/coordinates";

/** Approximate checkpoint zone as a closed polygon (meters from center). */
export function createZonePolygon(
  center: LatLng,
  radiusMeters = 420,
  points = 36,
): [number, number][] {
  const coords: [number, number][] = [];
  const latRad = (center.lat * Math.PI) / 180;
  const meterToLat = 1 / 111_320;
  const meterToLng = 1 / (111_320 * Math.cos(latRad));

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const lat = center.lat + Math.sin(angle) * radiusMeters * meterToLat;
    const lng = center.lng + Math.cos(angle) * radiusMeters * meterToLng;
    coords.push([lat, lng]);
  }

  return coords;
}
