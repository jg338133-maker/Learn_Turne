import { RouteStop } from "../types";
import { ROUTE_STOPS } from "./testRoute";

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
    name: "Ruta 2",
    stops: [],
  },
  {
    id: "ruta-3",
    name: "Ruta 3",
    stops: [],
  },
];
