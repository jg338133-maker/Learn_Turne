/**
 * Modelo de datos del MVP.
 *
 * Mantenemos SEPARADOS dos conceptos:
 *  - RouteStop  -> la ruta habitual (relativamente permanente)
 *  - PackageStop -> los paquetes del día (cambian cada jornada)
 *
 * Una parada puede existir en la ruta sin tener ningún paquete.
 * NO modelamos las cartas: solo importan los paquetes.
 */

/** Una parada de la ruta fija. El campo `order` define la secuencia del recorrido. */
export type RouteStop = {
  id: number;
  order: number; // 1, 2, 3, ... define el orden del recorrido
  address: string;
  latitude: number;
  longitude: number;
};

/** Zona física dentro del remolque. Reservado para el futuro (NO se usa aún). */
export type TrailerZone = "A" | "B" | "C";

/** Los paquetes que hay hoy en una parada concreta. */
export type PackageStop = {
  routeStopId: number; // referencia a RouteStop.id
  packageCount: number;
  delivered: boolean;
  trailerZone?: TrailerZone; // futuro: dónde está el paquete dentro del remolque
};

/** Un par latitud/longitud sencillo. */
export type Coords = {
  latitude: number;
  longitude: number;
};
