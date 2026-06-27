"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

/**
 * Heatmap for the area scan. Renders a Leaflet map with free OpenStreetMap tiles
 * and a heat layer built from the place coordinates the scan returns. No Google
 * Maps load, so it adds zero billing. Leaflet touches `window`, so it is imported
 * dynamically inside the effect and this component is client-only.
 */

type Pt = { lat: number; lng: number };

export function AreaScanMap({
  center,
  radiusMeters,
  points,
}: {
  center: Pt;
  radiusMeters: number;
  points: Pt[];
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      // leaflet.heat is a UMD plugin that patches the global L; set it first.
      (window as unknown as { L: typeof L }).L = L;
      await import("leaflet.heat");
      if (cancelled || !elRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(elRef.current, { scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Scan radius + the center point.
      L.circle([center.lat, center.lng], {
        radius: radiusMeters,
        color: "#4f46e5",
        weight: 1.5,
        fillOpacity: 0.04,
      }).addTo(map);
      L.circleMarker([center.lat, center.lng], {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: "#4f46e5",
        fillOpacity: 1,
      }).addTo(map);

      // The heatmap itself.
      if (points.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (L as any)
          .heatLayer(
            points.map((p) => [p.lat, p.lng, 1]),
            { radius: 28, blur: 20, maxZoom: 17, minOpacity: 0.35 },
          )
          .addTo(map);
      }

      map.fitBounds(L.latLng(center.lat, center.lng).toBounds(radiusMeters * 2.4));
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center.lat, center.lng, radiusMeters, points]);

  return (
    <div
      ref={elRef}
      className="w-full h-80 rounded-2xl border theme-border overflow-hidden relative"
      style={{ zIndex: 0 }}
    />
  );
}
