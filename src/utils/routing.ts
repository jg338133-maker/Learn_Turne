import { Coords } from "../types";

/**
 * Cálculo de ruta por calles usando OSRM (servidor de demo público, gratis y
 * sin API key). Devuelve la geometría del camino + distancia (m) + duración (s).
 *
 * Nota: el servidor de demo solo ofrece el perfil "driving". Para un reparto a
 * pie la geometría por calles sigue siendo una buena aproximación.
 */
export type RouteResult = {
  coords: Coords[];
  distance: number; // metros
  duration: number; // segundos
};

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoute(
  from: Coords,
  to: Coords
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates) return null;
    const coords: Coords[] = route.geometry.coordinates.map(
      (c: [number, number]) => ({ latitude: c[1], longitude: c[0] })
    );
    return { coords, distance: route.distance, duration: route.duration };
  } catch {
    return null;
  }
}
