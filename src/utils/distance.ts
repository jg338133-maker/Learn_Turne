import { Coords } from "../types";

/**
 * Distancia entre dos coordenadas GPS usando la fórmula de Haversine.
 * Devuelve METROS.
 *
 * Es una utility reutilizable: la usan tanto la lógica de ruta como la
 * detección de proximidad.
 */
export function haversineDistance(a: Coords, b: Coords): number {
  const R = 6371000; // radio de la Tierra en metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Formatea metros para mostrarlos: "95 m" o "1.2 km". */
export function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) return "-- m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
