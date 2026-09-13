import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coords, PackageStop, RouteStop } from "../types";
import { hasActivePackage } from "../utils/routeLogic";

/**
 * Versión WEB del mapa (Expo elige este archivo .web.tsx automáticamente).
 *
 * Usa Leaflet + OpenStreetMap (gratis, sin API key). Dibuja la ruta como una
 * línea, cada parada como un círculo de color según su estado, y la posición
 * del usuario como un círculo azul.
 *
 * La versión nativa (react-native-maps) sigue en RouteMap.tsx para el móvil.
 */

type Props = {
  stops: RouteStop[];
  packages: PackageStop[];
  userCoords: Coords | null;
  currentIndex: number;
};

/** Mismo criterio de color que el mapa nativo. Devuelve un color CSS. */
function markerColor(
  index: number,
  currentIndex: number,
  stop: RouteStop,
  packages: PackageStop[]
): string {
  if (hasActivePackage(stop.id, packages)) return "#e03131"; // paquete activo → rojo
  if (index < currentIndex) return "#2f9e44"; // ya pasada → verde
  if (index === currentIndex) return "#1c7ed6"; // actual → azul
  if (index === currentIndex + 1) return "#f76707"; // siguiente → naranja
  return "#868e96"; // pendiente → gris
}

export default function RouteMap({
  stops,
  packages,
  userCoords,
  currentIndex,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const userMarker = useRef<L.CircleMarker | null>(null);

  // --- Inicializar el mapa una sola vez ---
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const start = userCoords ?? stops[0];
    const map = L.map(containerRef.current).setView(
      [start.latitude, start.longitude],
      16
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    // Línea del recorrido (estática).
    L.polyline(
      stops.map((s) => [s.latitude, s.longitude] as [number, number]),
      { color: "#1e90ff", weight: 4, opacity: 0.8 }
    ).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Leaflet no carga teselas si el contenedor tenía tamaño 0 al iniciar
    // (habitual en layouts flex). Forzamos un recálculo cuando ya tiene tamaño
    // y ante cualquier cambio de dimensiones.
    const invalidate = () => map.invalidateSize();
    const t = setTimeout(invalidate, 100);
    const ro = new ResizeObserver(invalidate);
    ro.observe(containerRef.current);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Redibujar los marcadores de parada cuando cambian estado/selección ---
  useEffect(() => {
    const layer = markersLayer.current;
    if (!layer) return;
    layer.clearLayers();

    stops.forEach((stop, index) => {
      const pkg = packages.find((p) => p.routeStopId === stop.id);
      const count = pkg && !pkg.delivered ? pkg.packageCount : 0;
      const color = markerColor(index, currentIndex, stop, packages);

      L.circleMarker([stop.latitude, stop.longitude], {
        radius: index === currentIndex ? 9 : 6,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      })
        .bindPopup(
          `<b>Stop ${stop.order}</b> · ${stop.address}<br/>${
            count > 0 ? `${count} paquete(s)` : "Sin paquetes"
          }`
        )
        .addTo(layer);
    });
  }, [stops, packages, currentIndex]);

  // --- Posición del usuario ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) return;
    const latlng: [number, number] = [
      userCoords.latitude,
      userCoords.longitude,
    ];
    if (!userMarker.current) {
      userMarker.current = L.circleMarker(latlng, {
        radius: 8,
        color: "#1c7ed6",
        weight: 3,
        fillColor: "#4dabf7",
        fillOpacity: 1,
      }).addTo(map);
    } else {
      userMarker.current.setLatLng(latlng);
    }
  }, [userCoords]);

  // --- Centrar el mapa en la parada seleccionada (al tocar una dirección) ---
  useEffect(() => {
    const map = mapRef.current;
    const stop = stops[currentIndex];
    if (!map || !stop) return;
    map.setView([stop.latitude, stop.longitude], 17, { animate: true });
  }, [currentIndex, stops]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#e9ecef" }}
    />
  );
}
