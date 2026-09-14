import { useEffect, useRef, useState } from "react";
import { Coords } from "../types";
import { haversineDistance } from "../utils/distance";
import { fetchRoute, RouteResult } from "../utils/routing";

/**
 * Hook de navegación: mantiene la ruta por calles desde tu posición hasta el
 * destino y la recalcula CUANDO TE MUEVES, con límites para no saturar OSRM:
 *   - Siempre recalcula si cambia el destino.
 *   - Si sigues yendo al mismo sitio, solo recalcula cuando te has movido
 *     > 30 m y han pasado > 8 s desde el último cálculo.
 */
export type NavigationState = {
  route: RouteResult | null;
  loading: boolean;
};

const MIN_MOVE_METERS = 30;
const MIN_INTERVAL_MS = 8000;

export function useNavigation(
  userCoords: Coords | null,
  destination: Coords | null
): NavigationState {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const last = useRef<{ at: number; from: Coords | null; destKey: string | null }>(
    { at: 0, from: null, destKey: null }
  );

  useEffect(() => {
    if (!userCoords || !destination) {
      setRoute(null);
      last.current = { at: 0, from: null, destKey: null };
      return;
    }

    const destKey = `${destination.latitude},${destination.longitude}`;
    const now = Date.now();
    const destChanged = last.current.destKey !== destKey;
    const movedEnough =
      !last.current.from ||
      haversineDistance(last.current.from, userCoords) > MIN_MOVE_METERS;
    const intervalOk = now - last.current.at > MIN_INTERVAL_MS;

    if (!destChanged && !(movedEnough && intervalOk)) return;

    last.current = { at: now, from: userCoords, destKey };
    let cancelled = false;
    setLoading(true);
    fetchRoute(userCoords, destination).then((r) => {
      if (cancelled) return;
      if (r) setRoute(r); // si falla, conservamos la última ruta válida
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userCoords, destination]);

  return { route, loading };
}
