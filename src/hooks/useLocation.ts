import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Coords } from "../types";

/**
 * Hook de GPS (solo mientras la app está abierta, sin background).
 *
 * - Pide permiso de ubicación al usuario.
 * - Escucha la posición en tiempo real con watchPositionAsync.
 * - Expone coords, accuracy, estado del permiso y posibles errores.
 */
export type LocationState = {
  coords: Coords | null;
  accuracy: number | null;
  permissionGranted: boolean;
  errorMsg: string | null;
};

export function useLocation(): LocationState {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permiso de ubicación denegado. Actívalo en Ajustes.");
          return;
        }
        if (cancelled) return;
        setPermissionGranted(true);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, // como mucho, una lectura cada 2 s
            distanceInterval: 3, // o cada 3 metros de movimiento
          },
          (loc) => {
            setCoords({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            setAccuracy(loc.coords.accuracy ?? null);
          }
        );
      } catch (e) {
        setErrorMsg("No se pudo obtener la ubicación: " + String(e));
      }
    })();

    // Limpieza: dejar de escuchar el GPS al desmontar.
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { coords, accuracy, permissionGranted, errorMsg };
}
