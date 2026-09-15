import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coords, PackageStop, RouteStop } from "../types";
import { hasActivePackage } from "../utils/routeLogic";
import { snapToPolyline } from "../utils/geo";

/**
 * Versión WEB del mapa (Leaflet + OpenStreetMap, gratis y sin API key).
 *
 * - Dibuja la línea de la ruta y cada parada como círculo de color.
 * - Tu posición se muestra como una FLECHA que se desliza sobre la línea azul
 *   (proyectamos el GPS sobre la ruta y la orientamos en el sentido de avance).
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

/** Icono de flecha (apunta al norte por defecto; se rota con `bearing`). */
function arrowIcon(bearing: number): L.DivIcon {
  const html =
    `<div style="transform: rotate(${bearing}deg); width:34px; height:34px; ` +
    `display:flex; align-items:center; justify-content:center;">` +
    `<svg width="32" height="32" viewBox="0 0 24 24">` +
    `<circle cx="12" cy="12" r="11" fill="#1c7ed6" stroke="#ffffff" stroke-width="2"/>` +
    `<path d="M12 4.5 L17.5 18 L12 14.5 L6.5 18 Z" fill="#ffffff"/>` +
    `</svg></div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
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
  const userArrow = useRef<L.Marker | null>(null);
  const routeLayer = useRef<L.Polyline | null>(null);
  const routeLine = useRef<Coords[]>([]);

  // Coordenadas de la línea de ruta (estáticas).
  routeLine.current = stops.map((s) => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  // --- Inicializar el mapa una sola vez ---
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Centro inicial: tu GPS, si no la 1ª parada, y si la ruta está vacía, Bulle.
    const start = userCoords ?? stops[0] ?? { latitude: 46.6163, longitude: 7.0575 };
    const map = L.map(containerRef.current).setView(
      [start.latitude, start.longitude],
      16
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Leaflet no carga teselas si el contenedor tenía tamaño 0 al iniciar.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Redibujar la línea del recorrido cuando cambia la ruta ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeLayer.current) {
      routeLayer.current.remove();
      routeLayer.current = null;
    }
    if (stops.length > 1) {
      routeLayer.current = L.polyline(
        stops.map((s) => [s.latitude, s.longitude] as [number, number]),
        { color: "#1e90ff", weight: 4, opacity: 0.8 }
      ).addTo(map);
    }
  }, [stops]);

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

  // --- Flecha que se desliza sobre la línea azul ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) return;

    const snap = snapToPolyline(userCoords, routeLine.current);
    const pos: [number, number] = snap
      ? [snap.latitude, snap.longitude]
      : [userCoords.latitude, userCoords.longitude];
    const bearing = snap ? snap.bearing : 0;

    if (!userArrow.current) {
      userArrow.current = L.marker(pos, {
        icon: arrowIcon(bearing),
        interactive: false,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userArrow.current.setLatLng(pos);
      userArrow.current.setIcon(arrowIcon(bearing));
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
