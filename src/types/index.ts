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

/** Identificador libre de un sector/espacio del remolque (A1, B2, etc.). */
export type TrailerZone = string;

/** Los paquetes que hay hoy en una parada concreta. */
export type PackageStop = {
  routeStopId: number; // referencia a RouteStop.id
  packageCount: number;
  delivered: boolean;
  loaded?: boolean; // confirmado físicamente dentro del remolque
  trailerZone?: TrailerZone;
};

/** Tramo configurable del recorrido y su ubicación física. */
export type RouteSection = {
  id: string;
  name: string;
  startOrder: number;
  endOrder: number;
  streetNames?: string[];
};

/** Perfil personal guardado independientemente para cada tournée. */
export type OrganizationProfile = {
  routeId: string;
  sections: RouteSection[];
  /** Posiciones: costado 2 izquierda→derecha y costado 1 izquierda→derecha. */
  slotOrder: string[];
};

/** Un par latitud/longitud sencillo. */
export type Coords = {
  latitude: number;
  longitude: number;
};
