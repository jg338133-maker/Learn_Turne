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
      const phrase = `Prochain arrêt. ${n} ${n === 1 ? "colis" : "colis"}.`;
      Speech.speak(phrase, { language: "fr-FR" });
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
    ? `GPS : ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` +
      (accuracy ? ` · ±${Math.round(accuracy)} m` : "") +
      ` · dist. prochain arrêt : ${formatDistance(
        routeState.nextStop ? haversineDistance(coords, routeState.nextStop) : null
      )}`
    : errorMsg ?? "En attente du signal GPS…";

  // Diseño VERTICAL tipo mapa: el mapa ocupa toda la pantalla y la lista es un
  // panel deslizable desde abajo (colapsado = mapa grande; desplegado = lista).
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  // Colapsado: solo los controles (sin lista) → más mapa. Desplegado: + lista.
  const COLLAPSED_HEIGHT = 238;
  const expandedHeight = Math.round(screenHeight * 0.88);

  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  // --- Menú lateral izquierdo (drawer) con las rutas ---
  const DRAWER_WIDTH = Math.min(320, Math.round(screenWidth * 0.82));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerX, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };
  const pickRoute = (id: string) => {
    setSelectedRouteId(id);
    closeDrawer();
  };

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

        {/* Botón de menú (arriba izquierda) */}
        <Pressable style={styles.menuBtn} onPress={openDrawer} hitSlop={8}>
          <Icon name="menu" size={24} color="#17181a" />
        </Pressable>

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
                {sheetExpanded ? "Voir la carte" : "Voir la liste"}
              </Text>
            </View>
          </Pressable>

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

        {/* Menú lateral izquierdo (rutas) */}
        {drawerOpen && (
          <>
            <Pressable style={styles.backdrop} onPress={closeDrawer} />
            <Animated.View
              style={[
                styles.drawer,
                { width: DRAWER_WIDTH, transform: [{ translateX: drawerX }] },
              ]}
            >
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Tournées</Text>
                <Pressable onPress={closeDrawer} hitSlop={8}>
                  <Icon name="x" size={22} color="#6b7280" />
                </Pressable>
              </View>

              {ROUTES.map((r) => {
                const active = r.id === selectedRouteId;
                return (
                  <Pressable
                    key={r.id}
                    style={[styles.drawerRow, active && styles.drawerRowActive]}
                    onPress={() => pickRoute(r.id)}
                  >
                    <View style={styles.drawerRowText}>
                      <Text
                        style={[
                          styles.drawerRowName,
                          active && styles.drawerRowNameActive,
                        ]}
                        numberOfLines={1}
                      >
                        {r.name}
                      </Text>
                      <Text style={styles.drawerRowMeta}>
                        {r.stops.length} arrêts
                      </Text>
                    </View>
                    {active && <Icon name="check" size={20} color="#1a1a1a" />}
                  </Pressable>
                );
              })}
            </Animated.View>
          </>
        )}
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
  menuBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#FFCC00", // amarillo La Poste
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 40,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    paddingTop: 20,
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: 3,
    borderBottomColor: "#FFCC00", // acento La Poste
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17181a",
  },
  drawerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  drawerRowActive: {
    backgroundColor: "#FFF6D6", // amarillo claro La Poste
  },
  drawerRowText: {
    flex: 1,
  },
  drawerRowName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  drawerRowNameActive: {
    color: "#1a1a1a",
    fontWeight: "800",
  },
  drawerRowMeta: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  routeScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  routeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  routeChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
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
