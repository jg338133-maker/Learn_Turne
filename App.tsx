import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RouteMap from "./src/components/RouteMap";
import DeliveryPanel from "./src/components/DeliveryPanel";
import StopsList from "./src/components/StopsList";
import { useLocation } from "./src/hooks/useLocation";
import { ROUTE_STOPS } from "./src/data/testRoute";
import { TEST_PACKAGES } from "./src/data/testPackages";
import { PackageStop } from "./src/types";
import { haversineDistance, formatDistance } from "./src/utils/distance";
import {
  autoAdvanceIndex,
  computeRouteState,
  findNearestStopIndex,
  PACKAGE_ALERT_DISTANCE,
} from "./src/utils/routeLogic";

/** Clave con la que se guardan los paquetes del día en el almacenamiento del móvil. */
const PACKAGES_STORAGE_KEY = "learn_turne:packages:v1";

/**
 * Pantalla principal. Junta todas las piezas:
 *  - GPS (useLocation)
 *  - índice actual de la ruta (currentIndex)
 *  - paquetes del día (estado local, mutable al entregar)
 *  - lógica derivada (computeRouteState)
 *  - aviso de proximidad por voz (expo-speech) sin repetir
 */
export default function App() {
  const { coords, accuracy, permissionGranted, errorMsg } = useLocation();

  // Índice de la parada actual dentro de ROUTE_STOPS (empezamos en la 1ª).
  const [currentIndex, setCurrentIndex] = useState(0);

  // Copia local de los paquetes: la mutamos al marcar como entregado.
  const [packages, setPackages] = useState<PackageStop[]>(() =>
    TEST_PACKAGES.map((p) => ({ ...p }))
  );

  // Clave de guardado y flag de "ya cargado desde disco" (evita pisar los datos
  // guardados con el array inicial antes de leerlos).
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Al abrir: recuperar los paquetes guardados en el teléfono (si los hay).
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PACKAGES_STORAGE_KEY);
        if (raw) setPackages(JSON.parse(raw) as PackageStop[]);
      } catch {
        // Si falla la lectura seguimos con la lista vacía.
      } finally {
        setStorageLoaded(true);
      }
    })();
  }, []);

  // Cada vez que cambian los paquetes (y ya hemos cargado): guardar en el teléfono.
  useEffect(() => {
    if (!storageLoaded) return;
    AsyncStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages)).catch(
      () => {}
    );
  }, [packages, storageLoaded]);

  // Recuerda qué paradas ya han "hablado" para no repetir la voz en cada
  // actualización del GPS.
  const announcedRef = useRef<Set<number>>(new Set());

  // Estado derivado que consume la interfaz.
  const routeState = useMemo(
    () => computeRouteState(ROUTE_STOPS, packages, currentIndex),
    [packages, currentIndex]
  );

  // Distancia hasta el próximo paquete (o hasta la siguiente parada si no hay paquete).
  const distanceToNextPackage = useMemo(() => {
    if (!coords || !routeState.nextPackage) return null;
    return haversineDistance(coords, routeState.nextPackage.stop);
  }, [coords, routeState.nextPackage]);

  const alertActive =
    distanceToNextPackage !== null &&
    distanceToNextPackage <= PACKAGE_ALERT_DISTANCE;

  // --- Avance automático de la ruta (ROUTE ORDER + GPS, con ventana) ---
  useEffect(() => {
    if (!coords) return;
    const newIndex = autoAdvanceIndex(coords, ROUTE_STOPS, currentIndex);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [coords, currentIndex]);

  // --- Aviso de proximidad por voz (una sola vez por parada) ---
  useEffect(() => {
    const target = routeState.nextPackage;
    if (!target || distanceToNextPackage === null) return;

    if (
      distanceToNextPackage <= PACKAGE_ALERT_DISTANCE &&
      !announcedRef.current.has(target.stop.id)
    ) {
      announcedRef.current.add(target.stop.id);
      const n = target.pkg.packageCount;
      const frase = `Próxima parada. ${n} ${n === 1 ? "paquete" : "paquetes"}.`;
      Speech.speak(frase, { language: "es-ES" });
    }
  }, [distanceToNextPackage, routeState.nextPackage]);

  // --- Botón DELIVERED: marca el próximo paquete como entregado ---
  const handleDelivered = () => {
    const target = routeState.nextPackage;
    if (!target) return;

    setPackages((prev) =>
      prev.map((p) =>
        p.routeStopId === target.stop.id ? { ...p, delivered: true } : p
      )
    );

    // Avanzamos la posición de ruta hasta la parada entregada (si va por delante),
    // así "AFTER THAT" pasa a ser el nuevo "NEXT PACKAGE".
    const deliveredIndex = ROUTE_STOPS.findIndex((s) => s.id === target.stop.id);
    if (deliveredIndex > currentIndex) {
      setCurrentIndex(deliveredIndex);
    }

    // Permite que esa parada pueda volver a avisar si hiciera falta en el futuro.
    announcedRef.current.delete(target.stop.id);
  };

  // --- Botón NEXT: avanzar manualmente una parada ---
  const handleNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, ROUTE_STOPS.length - 1));
  };

  // --- Botón ATRÁS: retroceder una parada ---
  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  // --- Botón PARADA MÁS CERCANA: colocar el punto actual donde estás ---
  const handleNearest = () => {
    if (!coords) return;
    setCurrentIndex(findNearestStopIndex(coords, ROUTE_STOPS));
  };

  // --- Casilla de la lista: cargar / quitar un paquete en una parada ---
  const handleTogglePackage = (stopId: number) => {
    setPackages((prev) => {
      const exists = prev.some((p) => p.routeStopId === stopId);
      if (exists) {
        return prev.filter((p) => p.routeStopId !== stopId);
      }
      return [
        ...prev,
        { routeStopId: stopId, packageCount: 1, delivered: false },
      ];
    });
    // Si estaba anunciada, permitir que vuelva a avisar.
    announcedRef.current.delete(stopId);
  };

  // --- Contador de la lista: subir cantidad de paquetes (1 → 2 → 3 → 1) ---
  const handleCyclePackageCount = (stopId: number) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.routeStopId === stopId
          ? { ...p, packageCount: (p.packageCount % 3) + 1 }
          : p
      )
    );
  };

  // Texto informativo de GPS.
  const gpsInfo = coords
    ? `GPS: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` +
      (accuracy ? ` · ±${Math.round(accuracy)} m` : "") +
      ` · dist. próxima parada: ${formatDistance(
        routeState.nextStop ? haversineDistance(coords, routeState.nextStop) : null
      )}`
    : errorMsg ?? "Esperando señal GPS…";

  // Diseño VERTICAL tipo mapa: el mapa ocupa toda la pantalla y la lista es un
  // panel deslizable desde abajo (colapsado = mapa grande; desplegado = lista).
  const { height: screenHeight } = useWindowDimensions();
  const COLLAPSED_HEIGHT = 300; // altura del panel colapsado (controles visibles)
  const expandedHeight = Math.round(screenHeight * 0.88);

  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  const toggleSheet = () => {
    const target = sheetExpanded ? COLLAPSED_HEIGHT : expandedHeight;
    Animated.timing(sheetHeight, {
      toValue: target,
      duration: 250,
      useNativeDriver: false, // animamos 'height', no soportado por el driver nativo
    }).start();
    setSheetExpanded((v) => !v);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />

      {!permissionGranted && errorMsg && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{errorMsg}</Text>
        </View>
      )}

      <View style={styles.container}>
        {/* Mapa a pantalla completa (fondo) */}
        <View style={styles.mapFill}>
          <RouteMap
            stops={ROUTE_STOPS}
            packages={packages}
            userCoords={coords}
            currentIndex={currentIndex}
          />
        </View>

        {/* Panel deslizable desde abajo */}
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
          {/* Asa para desplegar/plegar */}
          <Pressable style={styles.handle} onPress={toggleSheet}>
            <View style={styles.grabber} />
            <Text style={styles.handleText}>
              {sheetExpanded ? "▼ Ver mapa" : "▲ Ver lista"}
            </Text>
          </Pressable>

          {/* Controles operativos (siempre visibles) */}
          <DeliveryPanel
            routeState={routeState}
            distanceToNextPackage={distanceToNextPackage}
            alertActive={alertActive}
            gpsInfo={gpsInfo}
            onDelivered={handleDelivered}
            onNext={handleNext}
            onPrev={handlePrev}
            onNearest={handleNearest}
          />

          {/* Lista de paradas (ocupa el resto del panel) */}
          <View style={styles.listFill}>
            <StopsList
              stops={ROUTE_STOPS}
              packages={packages}
              currentIndex={currentIndex}
              onSelectStop={setCurrentIndex}
              onTogglePackage={handleTogglePackage}
              onCyclePackageCount={handleCyclePackageCount}
            />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  mapFill: {
    ...StyleSheet.absoluteFillObject, // el mapa ocupa toda la pantalla
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    // sombra para separar del mapa
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  handle: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ced4da",
    marginBottom: 4,
  },
  handleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#868e96",
    letterSpacing: 0.5,
  },
  listFill: {
    flex: 1, // la lista ocupa el resto del panel
  },
  banner: {
    backgroundColor: "#c92a2a",
    padding: 8,
  },
  bannerText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
