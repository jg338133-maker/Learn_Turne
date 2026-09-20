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
import OrganizationScreen from "./src/components/OrganizationScreen";
import PracticeScreen from "./src/components/PracticeScreen";
import LoadingScreen from "./src/components/LoadingScreen";
import { useLocation } from "./src/hooks/useLocation";
import { ROUTES } from "./src/data/routes";
import { OrganizationProfile, PackageStop, RouteStop } from "./src/types";
import { haversineDistance, formatDistance } from "./src/utils/distance";
import {
  autoAdvanceIndex,
  computeRouteState,
  findNearestStopIndex,
  PACKAGE_ALERT_DISTANCE,
} from "./src/utils/routeLogic";
import { createDefaultProfile, sectionForStop } from "./src/utils/organization";

/** Claves de guardado en el almacenamiento del móvil. */
const SELECTED_ROUTE_KEY = "learn_turne:selectedRoute:v1";
const packagesKey = (routeId: string) => `learn_turne:packages:v1:${routeId}`;
const organizationKey = (routeId: string) => `learn_turne:organization:v1:${routeId}`;
type ScreenMode = "map" | "organization" | "practice" | "loading";

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
  const [organization, setOrganization] = useState<OrganizationProfile>(() =>
    createDefaultProfile(ROUTES[0].id, ROUTES[0].stops)
  );
  const [screenMode, setScreenMode] = useState<ScreenMode>("map");

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

  // Cargar la organización personal de la tournée o crear una por defecto.
  useEffect(() => {
    if (!bootLoaded) return;
    let cancelled = false;
    (async () => {
      let next = createDefaultProfile(activeRoute.id, activeRoute.stops);
      try {
        const raw = await AsyncStorage.getItem(organizationKey(activeRoute.id));
        if (raw) next = JSON.parse(raw) as OrganizationProfile;
      } catch {
        // mantenemos el perfil recomendado
      }
      if (!cancelled) setOrganization(next);
    })();
    return () => { cancelled = true; };
  }, [activeRoute.id, activeRoute.stops, bootLoaded]);

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

  // Paquete activo que ha quedado detrás de la posición actual.
  const missedPackage = useMemo(() => {
    for (let i = 0; i < currentIndex; i += 1) {
      const pkg = packages.find(
        (item) => item.routeStopId === stops[i]?.id && item.packageCount > 0 && !item.delivered
      );
      if (pkg && stops[i]) return { stop: stops[i], pkg, index: i };
    }
    return null;
  }, [currentIndex, packages, stops]);

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
  const markDelivered = (stopId: number) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.routeStopId === stopId ? { ...p, delivered: true } : p
      )
    );
    announcedRef.current.delete(stopId);
  };

  const handleDelivered = () => {
    const target = routeState.nextPackage;
    if (!target) return;
    markDelivered(target.stop.id);

    // Avanzamos la posición de ruta hasta la parada entregada (si va por delante),
    // así "AFTER THAT" pasa a ser el nuevo "NEXT PACKAGE".
    const deliveredIndex = stops.findIndex((s) => s.id === target.stop.id);
    if (deliveredIndex > currentIndex) {
      setCurrentIndex(deliveredIndex);
    }

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
      const stop = stops.find((item) => item.id === stopId);
      const section = stop ? sectionForStop(organization, stop) : undefined;
      return [...prev, {
        routeStopId: stopId,
        packageCount: 1,
        delivered: false,
        loaded: false,
        trailerZone: section?.id,
      }];
    });
    // Si estaba anunciada, permitir que vuelva a avisar.
    announcedRef.current.delete(stopId);
  };

  const handleToggleLoaded = (stopId: number) => {
    setPackages((prev) => prev.map((pkg) =>
      pkg.routeStopId === stopId ? { ...pkg, loaded: !pkg.loaded } : pkg
    ));
  };

  const handleSaveOrganization = (next: OrganizationProfile) => {
    setOrganization(next);
    setPackages((prev) => prev.map((pkg) => {
      const stop = stops.find((item) => item.id === pkg.routeStopId);
      return { ...pkg, trailerZone: stop ? sectionForStop(next, stop)?.id : undefined };
    }));
    AsyncStorage.setItem(organizationKey(selectedRouteId), JSON.stringify(next)).catch(() => {});
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

  // Safari mobile peut terminer le layout de la carte après le premier rendu
  // et laisser le panneau inférieur hors de la zone visible. Réappliquer sa
  // hauteur lorsque la tournée enregistrée est prête garantit que les boutons
  // de navigation sont présents dès l'ouverture, sans changer de tournée.
  useEffect(() => {
    if (!bootLoaded) return;
    setSheetExpanded(false);
    sheetHeight.setValue(COLLAPSED_HEIGHT);
  }, [bootLoaded, selectedRouteId, sheetHeight]);

  // La boîte de permission de Safari modifie temporairement le viewport. Une
  // fois fermée, replacer le panneau avec la nouvelle hauteur visible évite
  // qu'il reste sous la barre du navigateur jusqu'au prochain changement de
  // tournée.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let restoreTimer: ReturnType<typeof setTimeout> | null = null;
    const restoreSheet = () => {
      if (restoreTimer) clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => {
        const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
        sheetHeight.setValue(
          sheetExpanded ? Math.round(visibleHeight * 0.88) : COLLAPSED_HEIGHT
        );
      }, 180);
    };
    const restoreWhenVisible = () => {
      if (document.visibilityState === "visible") restoreSheet();
    };

    window.addEventListener("focus", restoreSheet);
    window.addEventListener("pageshow", restoreSheet);
    window.visualViewport?.addEventListener("resize", restoreSheet);
    document.addEventListener("visibilitychange", restoreWhenVisible);
    return () => {
      if (restoreTimer) clearTimeout(restoreTimer);
      window.removeEventListener("focus", restoreSheet);
      window.removeEventListener("pageshow", restoreSheet);
      window.visualViewport?.removeEventListener("resize", restoreSheet);
      document.removeEventListener("visibilitychange", restoreWhenVisible);
    };
  }, [sheetExpanded, sheetHeight]);

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

  const openFeature = (mode: Exclude<ScreenMode, "map">) => {
    setScreenMode(mode);
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

  if (screenMode === "organization") {
    return (
      <OrganizationScreen
        routeName={activeRoute.name}
        profile={organization}
        stops={stops}
        onSave={handleSaveOrganization}
        onClose={() => setScreenMode("map")}
      />
    );
  }

  if (screenMode === "practice") {
    return (
      <PracticeScreen
        routeName={activeRoute.name}
        stops={stops}
        profile={organization}
        onClose={() => setScreenMode("map")}
      />
    );
  }

  if (screenMode === "loading") {
    return (
      <LoadingScreen
        routeName={activeRoute.name}
        stops={stops}
        packages={packages}
        profile={organization}
        onToggleLoaded={handleToggleLoaded}
        onClose={() => setScreenMode("map")}
      />
    );
  }

  const nextPackageZone = routeState.nextPackage
    ? sectionForStop(organization, routeState.nextPackage.stop)?.id ?? null
    : null;

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
        <Pressable
          style={styles.menuBtn}
          onPress={openDrawer}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
        >
          <Icon name="menu" size={24} color="#17181a" />
        </Pressable>

        {missedPackage && (
          <View style={styles.missedAlert}>
            <View style={styles.missedTextWrap}>
              <Text style={styles.missedTitle}>COLIS OUBLIÉ</Text>
              <Text style={styles.missedAddress} numberOfLines={1}>
                {missedPackage.stop.address} · {sectionForStop(organization, missedPackage.stop)?.id ?? "—"}
              </Text>
            </View>
            <Pressable style={styles.missedSecondary} onPress={() => setCurrentIndex(missedPackage.index)}>
              <Text style={styles.missedSecondaryText}>RETOUR</Text>
            </Pressable>
            <Pressable style={styles.missedPrimary} onPress={() => markDelivered(missedPackage.stop.id)}>
              <Text style={styles.missedPrimaryText}>LIVRÉ</Text>
            </Pressable>
          </View>
        )}

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
            nextPackageZone={nextPackageZone}
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

              <View style={styles.drawerActions}>
                <Pressable style={styles.drawerAction} onPress={() => openFeature("loading")}>
                  <Icon name="package" size={20} color="#17181a" />
                  <View><Text style={styles.drawerActionTitle}>Préparer le chargement</Text><Text style={styles.drawerActionSub}>Placer et confirmer les colis</Text></View>
                </Pressable>
                <Pressable style={styles.drawerAction} onPress={() => openFeature("practice")}>
                  <Icon name="navigation" size={20} color="#17181a" />
                  <View><Text style={styles.drawerActionTitle}>Mode entraînement</Text><Text style={styles.drawerActionSub}>Organiser des colis fictifs</Text></View>
                </Pressable>
                <Pressable style={styles.drawerAction} onPress={() => openFeature("organization")}>
                  <Icon name="list" size={20} color="#17181a" />
                  <View><Text style={styles.drawerActionTitle}>Mon organisation</Text><Text style={styles.drawerActionSub}>Secteurs et remorque</Text></View>
                </Pressable>
              </View>

              <Text style={styles.drawerSectionLabel}>TOURNÉES</Text>

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
    zIndex: 20,
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
    zIndex: 30,
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
  missedAlert: {
    position: "absolute", top: 68, left: 12, right: 12, zIndex: 30,
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#b91c1c", padding: 10, borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 7, elevation: 9,
  },
  missedTextWrap: { flex: 1 },
  missedTitle: { color: "#fff", fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  missedAddress: { color: "#fff", fontSize: 13, fontWeight: "600", marginTop: 2 },
  missedSecondary: { paddingHorizontal: 9, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" },
  missedSecondaryText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  missedPrimary: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: "#fff" },
  missedPrimaryText: { color: "#991b1b", fontSize: 11, fontWeight: "900" },
  drawerActions: { paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  drawerAction: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FFF6D6" },
  drawerActionTitle: { fontSize: 14, fontWeight: "800", color: "#17181a" },
  drawerActionSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  drawerSectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: "#9ca3af", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
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
