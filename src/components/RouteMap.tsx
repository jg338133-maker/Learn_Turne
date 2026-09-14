import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Coords, PackageStop, RouteStop } from "../types";
import { hasActivePackage } from "../utils/routeLogic";

/**
 * Mapa de la ruta.
 *
 * - Muestra tu posición (punto azul del sistema).
 * - Dibuja las 10 paradas con colores según su estado.
 * - Dibuja una Polyline que une las paradas EN ORDEN (no es una ruta calculada,
 *   simplemente conecta nuestras coordenadas fijas).
 *
 * En iPhone usa Apple Maps (PROVIDER_DEFAULT), sin API key.
 */

type Props = {
  stops: RouteStop[];
  packages: PackageStop[];
  userCoords: Coords | null;
  currentIndex: number;
  navRoute?: Coords[] | null; // ruta por calles hasta la próxima parada
};

/** Color del pin según el estado de la parada. Lógica visual sencilla. */
function markerColor(
  index: number,
  currentIndex: number,
  stop: RouteStop,
  packages: PackageStop[]
): string {
  if (index < currentIndex) return "green"; // completada / ya pasada
  if (hasActivePackage(stop.id, packages)) return "red"; // parada con paquete
  if (index === currentIndex) return "blue"; // parada actual
  if (index === currentIndex + 1) return "orange"; // siguiente parada
  return "gray"; // parada normal pendiente
}

export default function RouteMap({
  stops,
  packages,
  userCoords,
  currentIndex,
  navRoute,
}: Props) {
  const mapRef = useRef<MapView>(null);

  // Región inicial: centrada en el usuario si hay GPS, si no en la 1ª parada.
  const center = userCoords ?? stops[0];

  const initialRegion = {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Al cambiar la parada seleccionada (p. ej. al tocar una dirección en la
  // lista, o al avanzar de parada), centramos y acercamos el mapa a ella.
  useEffect(() => {
    if (navRoute && navRoute.length > 1) return; // en navegación manda la ruta
    const stop = stops[currentIndex];
    if (!stop) return;
    mapRef.current?.animateToRegion(
      {
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      },
      400
    );
  }, [currentIndex, stops, navRoute]);

  // Coordenadas ordenadas para la Polyline.
  const routeLine = stops.map((s) => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* La línea del recorrido en el orden establecido */}
        <Polyline
          coordinates={routeLine}
          strokeColor="#1e90ff"
          strokeWidth={4}
        />

        {/* Ruta de navegación por calles hasta la próxima parada */}
        {navRoute && navRoute.length > 1 && (
          <Polyline
            coordinates={navRoute}
            strokeColor="#7048e8"
            strokeWidth={6}
          />
        )}

        {/* Un marcador por parada */}
        {stops.map((stop, index) => {
          const pkg = packages.find((p) => p.routeStopId === stop.id);
          const count = pkg && !pkg.delivered ? pkg.packageCount : 0;
          return (
            <Marker
              key={stop.id}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={`Stop ${stop.order} · ${stop.address}`}
              description={
                count > 0
                  ? `${count} paquete(s)`
                  : "Sin paquetes"
              }
              pinColor={markerColor(index, currentIndex, stop, packages)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
