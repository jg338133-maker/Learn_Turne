import { RouteStop } from "../types";
import { ROUTE_STOPS } from "./testRoute";
import { ROUTE2_STOPS } from "./route2";
import { ROUTE3_STOPS } from "./route3";

/**
 * Catálogo de recorridos disponibles en la app.
 *
 * Cada recorrido tiene su propia lista de paradas (en orden). Los paquetes del
 * día y la posición NO van aquí: se cargan a mano y se guardan por separado para
 * cada ruta (ver App.tsx / AsyncStorage).
 *
 * Ruta 1 = recorrido real geocodificado (Moléson → Montsalvens, 238 paradas).
 * Rutas 2 y 3 = pendientes: se rellenarán con las direcciones de sus fotos,
 * geocodificadas con OpenStreetMap igual que la primera.
 */
export type Route = {
  id: string;
  name: string;
  stops: RouteStop[];
};

export const ROUTES: Route[] = [
  {
    id: "moleson-montsalvens",
    name: "Moléson → Montsalvens",
    stops: ROUTE_STOPS,
  },
  {
    id: "ruta-2",
    name: "Tournée 136",
    stops: ROUTE2_STOPS,
  },
  {
    id: "ruta-3",
    name: "Tournée 112",
    stops: ROUTE3_STOPS,
  },
];
