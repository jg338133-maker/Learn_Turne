import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RouteState } from "../utils/routeLogic";
import { formatDistance, formatDuration } from "../utils/distance";

/**
 * Panel operativo COMPACTO.
 *
 * El recordatorio de "próximo paquete" ya no ocupa una caja grande: vive en la
 * lista (las direcciones con paquete salen en rojo). Aquí solo dejamos lo
 * imprescindible para repartir: dónde estás, el botón ENTREGADO (que además
 * indica el próximo paquete y su distancia) y la navegación por la ruta.
 */

type Props = {
  routeState: RouteState;
  distanceToNextPackage: number | null;
  alertActive: boolean; // true cuando estás cerca del próximo paquete
  navDistance: number | null; // distancia por calles a la próxima parada (m)
  navDuration: number | null; // tiempo estimado a la próxima parada (s)
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
  navDistance,
  navDuration,
  gpsInfo,
  onDelivered,
  onNext,
  onPrev,
  onNearest,
}: Props) {
  const { currentStop, nextStop, nextPackage } = routeState;
  const hasNav = navDistance !== null;

  return (
    <View style={styles.panel}>
      {/* Dos líneas de contexto muy compactas */}
      <Text style={styles.line} numberOfLines={1}>
        <Text style={styles.tag}>AHORA </Text>
        {currentStop ? `${currentStop.order} · ${currentStop.address}` : "—"}
      </Text>
      <Text style={styles.line} numberOfLines={1}>
        <Text style={styles.tag}>SIGUIENTE </Text>
        {nextStop ? `${nextStop.order} · ${nextStop.address}` : "Fin de la ruta"}
      </Text>

      {/* Navegación en vivo hasta la próxima parada (se actualiza al moverte) */}
      {hasNav && nextStop && (
        <Text style={styles.navLine} numberOfLines={1}>
          🧭 {formatDistance(navDistance)} · {formatDuration(navDuration)}
        </Text>
      )}

      {/* Botón de entrega: incorpora el recordatorio del próximo paquete */}
      <TouchableOpacity
        style={[
          styles.deliveredButton,
          alertActive && styles.deliveredButtonAlert,
          !nextPackage && styles.buttonDisabled,
        ]}
        onPress={onDelivered}
        disabled={!nextPackage}
      >
        {nextPackage ? (
          <>
            <Text style={styles.buttonText}>ENTREGADO</Text>
            <Text style={styles.buttonSub} numberOfLines={1}>
              📦 {nextPackage.stop.order} · {nextPackage.stop.address} ·{" "}
              {formatDistance(distanceToNextPackage)}
              {alertActive ? "  ⚠️ CERCA" : ""}
            </Text>
          </>
        ) : (
          <Text style={styles.buttonText}>SIN PAQUETES 🎉</Text>
        )}
      </TouchableOpacity>

      {/* Controles de navegación por la ruta */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.navButton} onPress={onPrev}>
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nearestButton]}
          onPress={onNearest}
        >
          <Text style={styles.navButtonText}>📍 CERCANA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={onNext}>
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.gpsInfo} numberOfLines={1}>
        {gpsInfo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  line: {
    fontSize: 15,
    color: "#343a40",
    marginBottom: 2,
  },
  tag: {
    fontSize: 12,
    fontWeight: "800",
    color: "#adb5bd",
    letterSpacing: 0.5,
  },
  navLine: {
    fontSize: 15,
    fontWeight: "800",
    color: "#7048e8",
    marginTop: 2,
  },
  deliveredButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f9e44",
  },
  deliveredButtonAlert: {
    backgroundColor: "#e8590c",
  },
  buttonDisabled: {
    backgroundColor: "#adb5bd",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  buttonSub: {
    color: "#eaffef",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#495057",
  },
  nearestButton: {
    flex: 2,
    backgroundColor: "#1c7ed6",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gpsInfo: {
    fontSize: 11,
    color: "#ced4da",
    marginTop: 6,
    textAlign: "center",
  },
});
