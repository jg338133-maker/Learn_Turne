import { Coords, PackageStop, RouteStop } from "../types";
import { haversineDistance } from "./distance";

/**
 * LÓGICA DE RUTA = ROUTE ORDER + GPS POSITION.
 *
 * Idea clave: NO elegimos la parada más cercana de TODA la ruta, porque en
 * un reparto postal puedes pasar físicamente cerca de una parada que
 * corresponde mucho más adelante. En su lugar mantenemos un `currentStopIndex`
 * (índice dentro del array de paradas, ordenado por `order`) y solo miramos
 * una VENTANA de paradas alrededor del índice actual.
 */

/** Cuántas paradas hacia delante consideramos al avanzar. */
export const ROUTE_WINDOW = 5;

/** A qué distancia (m) consideramos que "hemos llegado" a una parada. */
export const ARRIVAL_DISTANCE = 25;

/** Distancia (m) a la que avisamos de un paquete próximo. Configurable. */
export const PACKAGE_ALERT_DISTANCE = 80;

/**
 * Avance automático del índice actual, respetando el orden de la ruta.
 *
 * Solo avanza HACIA DELANTE y solo dentro de la ventana [current, current+WINDOW].
 * Avanza paso a paso mientras la parada inmediatamente siguiente esté dentro
 * del radio de llegada. Así nunca "saltamos" a una parada muy posterior
 * aunque el GPS nos ponga cerca de ella.
 *
 * Devuelve el nuevo índice (igual o mayor que el actual).
 */
export function autoAdvanceIndex(
  userCoords: Coords | null,
  stops: RouteStop[],
  currentIndex: number,
  window: number = ROUTE_WINDOW,
  arrivalDistance: number = ARRIVAL_DISTANCE
): number {
  if (!userCoords) return currentIndex;

  let index = currentIndex;
  const maxIndex = Math.min(stops.length - 1, currentIndex + window);

  while (index < maxIndex) {
    const nextStop = stops[index + 1];
    const d = haversineDistance(userCoords, nextStop);
    if (d <= arrivalDistance) {
      index += 1; // hemos llegado a la siguiente: avanzamos una posición
    } else {
      break;
    }
  }
  return index;
}

/**
 * Índice de la parada globalmente MÁS CERCANA a tu posición.
 *
 * A diferencia del avance automático (que respeta el orden y una ventana),
 * esto mira TODA la ruta. Se usa solo cuando TÚ pulsas "Parada más cercana"
 * para colocar el punto de partida donde estás (p. ej. si empiezas a probar
 * desde la mitad). Es una acción manual, por eso aquí sí vale el más cercano.
 */
export function findNearestStopIndex(
  userCoords: Coords,
  stops: RouteStop[]
): number {
  let bestIndex = 0;
  let bestDist = Infinity;
  stops.forEach((s, i) => {
    const d = haversineDistance(userCoords, s);
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  });
  return bestIndex;
}

/** Devuelve el PackageStop de una parada, si existe. */
export function getPackageForStop(
  stopId: number,
  packages: PackageStop[]
): PackageStop | undefined {
  return packages.find((p) => p.routeStopId === stopId);
}

/** Un paquete "activo" = existe, tiene cantidad > 0 y no está entregado. */
export function hasActivePackage(
  stopId: number,
  packages: PackageStop[]
): boolean {
  const pkg = getPackageForStop(stopId, packages);
  return !!pkg && pkg.packageCount > 0 && !pkg.delivered;
}

export type PackageTarget = { stop: RouteStop; pkg: PackageStop };

export type RouteState = {
  currentStop: RouteStop | null;
  nextStop: RouteStop | null;
  nextPackage: PackageTarget | null;
  followingPackage: PackageTarget | null;
};

/**
 * Calcula el estado derivado que necesita la interfaz a partir de:
 *   - la ruta (stops)
 *   - los paquetes (packages)
 *   - el índice actual (currentIndex)
 *
 * currentStop / nextStop son conceptos de RUTA.
 * nextPackage / followingPackage son conceptos de PAQUETES y son distintos:
 * la próxima parada de la ruta puede no tener paquete.
 */
export function computeRouteState(
  stops: RouteStop[],
  packages: PackageStop[],
  currentIndex: number
): RouteState {
  const currentStop = stops[currentIndex] ?? null;
  const nextStop = stops[currentIndex + 1] ?? null;

  // Paradas con paquete activo desde la posición actual hacia delante.
  const upcomingPackages: PackageTarget[] = [];
  for (let i = currentIndex; i < stops.length; i++) {
    const pkg = getPackageForStop(stops[i].id, packages);
    if (pkg && pkg.packageCount > 0 && !pkg.delivered) {
      upcomingPackages.push({ stop: stops[i], pkg });
    }
  }

  return {
    currentStop,
    nextStop,
    nextPackage: upcomingPackages[0] ?? null,
    followingPackage: upcomingPackages[1] ?? null,
  };
}
