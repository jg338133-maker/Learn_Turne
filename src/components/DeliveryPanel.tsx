import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteState } from "../utils/routeLogic";
import { formatDistance } from "../utils/distance";

/**
 * Panel operativo (mitad inferior de la pantalla).
 *
 * Pensado para usarse mientras repartes: texto grande, botones grandes,
 * mínima interacción. Muestra:
 *   - NEXT ROUTE STOP  (concepto de ruta)
 *   - NEXT PACKAGE     (concepto de paquete + distancia)
 *   - AFTER THAT       (el siguiente paquete)
 *   - Botones DELIVERED y NEXT
 */

type Props = {
  routeState: RouteState;
  distanceToNextPackage: number | null;
  alertActive: boolean; // true cuando estás cerca del próximo paquete
  gpsInfo: string;
  onDelivered: () => void;
  onNext: () => void;
  onPrev: () => void;
  onNearest: () => void;
};

export default function DeliveryPanel({
  routeState,
  distanceToNextPackage,
  alertActive,
  gpsInfo,
  onDelivered,
  onNext,
  onPrev,
  onNearest,
}: Props) {
  const { currentStop, nextStop, nextPackage, followingPackage } = routeState;

  return (
    <View style={styles.panel}>
      {/* Posición actual en la ruta */}
      <Text style={styles.smallLabel}>CURRENT ROUTE POSITION</Text>
      <Text style={styles.currentValue}>
        {currentStop ? `Stop ${currentStop.order} · ${currentStop.address}` : "—"}
      </Text>

      {/* Siguiente parada de la ruta */}
      <Text style={styles.smallLabel}>NEXT ROUTE STOP</Text>
      <Text style={styles.value}>
        {nextStop ? `Stop ${nextStop.order} · ${nextStop.address}` : "Fin de la ruta"}
      </Text>

      {/* Próximo paquete: destacado */}
      <View style={[styles.packageBox, alertActive && styles.packageBoxAlert]}>
        <Text style={styles.smallLabel}>NEXT PACKAGE</Text>
        {nextPackage ? (
          <>
            <Text style={styles.packageValue}>
              Stop {nextPackage.stop.order} · {nextPackage.stop.address}
            </Text>
            <Text style={styles.packageCount}>
              {nextPackage.pkg.packageCount} PAQUETE
              {nextPackage.pkg.packageCount > 1 ? "S" : ""}
            </Text>
            <Text style={styles.distance}>
              {formatDistance(distanceToNextPackage)}
            </Text>
            {alertActive && (
              <Text style={styles.alertText}>⚠️ ¡PAQUETE CERCA!</Text>
            )}
          </>
        ) : (
          <Text style={styles.packageValue}>No quedan paquetes 🎉</Text>
        )}
      </View>

      {/* El siguiente paquete después */}
      <Text style={styles.smallLabel}>AFTER THAT</Text>
      <Text style={styles.value}>
        {followingPackage
          ? `Stop ${followingPackage.stop.order} · ${followingPackage.stop.address} · ${followingPackage.pkg.packageCount} paquete${
              followingPackage.pkg.packageCount > 1 ? "s" : ""
            }`
          : "—"}
      </Text>

      {/* Botón grande de entrega */}
      <TouchableOpacity
        style={[styles.deliveredButton, !nextPackage && styles.buttonDisabled]}
        onPress={onDelivered}
        disabled={!nextPackage}
      >
        <Text style={styles.buttonText}>DELIVERED</Text>
      </TouchableOpacity>

      {/* Controles de navegación por la ruta */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.navButton]} onPress={onPrev}>
          <Text style={styles.navButtonText}>◀ ATRÁS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, styles.nearestButton]} onPress={onNearest}>
          <Text style={styles.navButtonText}>📍 CERCANA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton]} onPress={onNext}>
          <Text style={styles.navButtonText}>NEXT ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Info GPS discreta abajo */}
      <Text style={styles.gpsInfo}>{gpsInfo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginTop: 8,
    letterSpacing: 1,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  packageBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff4e6",
    borderWidth: 2,
    borderColor: "#ffb266",
  },
  packageBoxAlert: {
    backgroundColor: "#ffe0e0",
    borderColor: "#ff4d4d",
  },
  packageValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  packageCount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#d9480f",
    marginTop: 2,
  },
  distance: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111",
    marginTop: 2,
  },
  alertText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#c92a2a",
    marginTop: 4,
  },
  deliveredButton: {
    marginTop: 14,
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f9e44",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#495057",
  },
  nearestButton: {
    backgroundColor: "#1c7ed6",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gpsInfo: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 10,
    textAlign: "center",
  },
});
