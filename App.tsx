import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
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
import Icon from "./src/components/Icon";
import { useLocation } from "./src/hooks/useLocation";
import { ROUTES } from "./src/data/routes";
import { PackageStop, RouteStop } from "./src/types";
import { haversineDistance, formatDistance } from "./src/utils/distance";
import {
  autoAdvanceIndex,
  computeRouteState,
  findNearestStopIndex,
  PACKAGE_ALERT_DISTANCE,
} from "./src/utils/routeLogic";

/** Claves de guardado en el almacenamiento del móvil. */
const SELECTED_ROUTE_KEY = "learn_turne:selectedRoute:v1";
const packagesKey = (routeId: string) => `learn_turne:packages:v1:${routeId}`;

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

  // Recorrido activo (Ruta 1/2/3). Sus paradas alimentan toda la interfaz.
  const [selectedRouteId, setSelectedRouteId] = useState<string>(ROUTES[0].id);
  const activeRoute =
    ROUTES.find((r) => r.id === selectedRouteId) ?? ROUTES[0];
  const stops = activeRoute.stops;

  // Índice de la parada actual dentro de la ruta activa (empezamos en la 1ª).
  const [currentIndex, setCurrentIndex] = useState(0);

  // Paquetes del día de la ruta activa (se cargan a mano y se guardan por ruta).
  const [packages, setPackages] = useState<PackageStop[]>([]);

  // Flags de carga: bootLoaded = ya sabemos qué ruta estaba elegida;
  // packagesReady = ya cargamos los paquetes de la ruta actual (evita pisarlos).
  const [bootLoaded, setBootLoaded] = useState(false);
  const [packagesReady, setPackagesReady] = useState(false);

  // Al abrir: recuperar qué ruta estaba seleccionada.
  useEffect(() => {
    (async () => {
      try {
        const rid = await AsyncStorage.getItem(SELECTED_ROUTE_KEY);
        if (rid && ROUTES.some((r) => r.id === rid)) setSelectedRouteId(rid);
      } catch {
        // seguimos con la ruta por defecto
      } finally {
        setBootLoaded(true);
      }
    })();
  }, []);

  // Al cambiar de ruta (ya arrancados): cargar SUS paquetes y reiniciar posición.
  useEffect(() => {
    if (!bootLoaded) return;
    let cancelled = false;
    setPackagesReady(false);
    (async () => {
      let loaded: PackageStop[] = [];
      try {
        const raw = await AsyncStorage.getItem(packagesKey(selectedRouteId));
        if (raw) loaded = JSON.parse(raw) as PackageStop[];
      } catch {
        loaded = [];
      }
      if (cancelled) return;
      setPackages(loaded);
      setCurrentIndex(0);
      announcedRef.current.clear();
      setPackagesReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRouteId, bootLoaded]);

  // Guardar la ruta seleccionada.
  useEffect(() => {
    if (!bootLoaded) return;
    AsyncStorage.setItem(SELECTED_ROUTE_KEY, selectedRouteId).catch(() => {});
  }, [selectedRouteId, bootLoaded]);

  // Guardar los paquetes de la ruta activa cuando cambian (ya cargados).
  useEffect(() => {
    if (!packagesReady) return;
    AsyncStorage.setItem(
      packagesKey(selectedRouteId),
      JSON.stringify(packages)
    ).catch(() => {});
  }, [packages, packagesReady, selectedRouteId]);

  // Recuerda qué paradas ya han "hablado" para no repetir la voz en cada
  // actualización del GPS.
  const announcedRef = useRef<Set<number>>(new Set());

  // Estado derivado que consume la interfaz.
  const routeState = useMemo(
    () => computeRouteState(stops, packages, currentIndex),
    [stops, packages, currentIndex]
  );

  // Distancia hasta el próximo paquete (o hasta la siguiente parada si no hay paquete).
  const distanceToNextPackage = useMemo(() => {
    if (!coords || !routeState.nextPackage) return null;
    return haversineDistance(coords, routeState.nextPackage.stop);
  }, [coords, routeState.nextPackage]);

  const alertActive =
    distanceToNextPackage !== null &&
    distanceToNextPackage <= PACKAGE_ALERT_DISTANCE;

  // Distancia (línea recta, sin servicios externos) a la próxima parada.
  const nextStopDistance = useMemo(() => {
    if (!coords || !routeState.nextStop) return null;
    return haversineDistance(coords, routeState.nextStop);
  }, [coords, routeState.nextStop]);

  // --- Avance automático de la ruta (ROUTE ORDER + GPS, con ventana) ---
  useEffect(() => {
    if (!coords) return;
    const newIndex = autoAdvanceIndex(coords, stops, currentIndex);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [coords, currentIndex, stops]);

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
    const deliveredIndex = stops.findIndex((s) => s.id === target.stop.id);
    if (deliveredIndex > currentIndex) {
      setCurrentIndex(deliveredIndex);
    }

    // Permite que esa parada pueda volver a avisar si hiciera falta en el futuro.
    announcedRef.current.delete(target.stop.id);
  };

  // --- Botón NEXT: avanzar manualmente una parada ---
  const handleNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, stops.length - 1));
  };

  // --- Botón ATRÁS: retroceder una parada ---
  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  // --- Botón PARADA MÁS CERCANA: colocar el punto actual donde estás ---
  const handleNearest = () => {
    if (!coords || stops.length === 0) return;
    setCurrentIndex(findNearestStopIndex(coords, stops));
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

  // --- Tocar una dirección: abrir Google Maps con esa parada como destino ---
  const handleOpenMaps = (stop: RouteStop) => {
    const dest = `${stop.latitude},${stop.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
    Linking.openURL(url).catch(() => {});
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
            stops={stops}
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
            <View style={styles.handleRow}>
              <Icon
                name={sheetExpanded ? "chevron-down" : "chevron-up"}
                size={16}
                color="#9ca3af"
              />
              <Text style={styles.handleText}>
                {sheetExpanded ? "Ver mapa" : "Ver lista"}
              </Text>
            </View>
          </Pressable>

          {/* Selector de recorrido (scroll horizontal) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routeBar}
          >
            {ROUTES.map((r) => {
              const active = r.id === selectedRouteId;
              return (
                <Pressable
                  key={r.id}
                  style={[styles.routeChip, active && styles.routeChipActive]}
                  onPress={() => setSelectedRouteId(r.id)}
                >
                  <Text
                    style={[
                      styles.routeChipText,
                      active && styles.routeChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {r.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Controles operativos (siempre visibles) */}
          <DeliveryPanel
            routeState={routeState}
            distanceToNextPackage={distanceToNextPackage}
            alertActive={alertActive}
            nextStopDistance={nextStopDistance}
            gpsInfo={gpsInfo}
            onDelivered={handleDelivered}
            onNext={handleNext}
            onPrev={handlePrev}
            onNearest={handleNearest}
          />

          {/* Lista de paradas (ocupa el resto del panel) */}
          <View style={styles.listFill}>
            <StopsList
              stops={stops}
              packages={packages}
              currentIndex={currentIndex}
              onSelectStop={setCurrentIndex}
              onTogglePackage={handleTogglePackage}
              onCyclePackageCount={handleCyclePackageCount}
              onOpenMaps={handleOpenMaps}
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
    // el mapa ocupa toda la pantalla (fondo)
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingBottom: 6,
    backgroundColor: "#fff",
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 6,
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  handleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 0.3,
  },
  listFill: {
    flex: 1, // la lista ocupa el resto del panel
  },
  routeBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  routeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  routeChipActive: {
    backgroundColor: "#17181a",
  },
  routeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  routeChipTextActive: {
    color: "#fff",
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
