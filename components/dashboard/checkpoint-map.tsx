"use client";

import type { LatLng } from "@/lib/checkpoints/coordinates";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const alertIcon = L.divIcon({
  className: "",
  html: `<div aria-hidden="true" style="width:36px;height:36px;background:#F57E3A;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(245,126,58,.55)"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

type CheckpointMapProps = {
  coordinates: LatLng;
  label: string;
  city: string;
  zoom?: number;
};

export function CheckpointMap({
  coordinates,
  label,
  city,
  zoom = 15,
}: CheckpointMapProps) {
  return (
    <MapContainer
      center={[coordinates.lat, coordinates.lng]}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
      style={{ background: "#0a1628" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker
        position={[coordinates.lat, coordinates.lng]}
        icon={alertIcon}
      >
        <Popup>
          <div className="font-sans text-sm">
            <p className="font-semibold text-[#040F20]">{label}</p>
            <p className="text-[#5C6573]">{city}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
