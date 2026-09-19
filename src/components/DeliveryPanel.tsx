import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RouteState } from "../utils/routeLogic";
import { formatDistance } from "../utils/distance";
import Icon from "./Icon";

/**
 * Panel operativo compacto y refinado.
 *
 * El recordatorio de paquetes vive en la lista (direcciones en rojo). Aquí solo
 * lo esencial: dónde estás, el botón ENTREGADO (con el próximo paquete) y la
 * navegación por la ruta. Iconos de línea, sin emojis.
 */

type Props = {
  routeState: RouteState;
  distanceToNextPackage: number | null;
  alertActive: boolean;
  nextStopDistance: number | null;
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
  nextStopDistance,
  gpsInfo,
  onDelivered,
  onNext,
  onPrev,
  onNearest,
}: Props) {
  const { currentStop, nextStop, nextPackage } = routeState;

  return (
    <View style={styles.panel}>
      {/* Contexto: ahora / siguiente */}
      <View style={styles.context}>
        <View style={styles.contextRow}>
          <Text style={styles.tag}>ICI</Text>
          <Text style={styles.contextValue} numberOfLines={1}>
            {currentStop
              ? `${currentStop.order} · ${currentStop.address}`
              : "—"}
          </Text>
        </View>
        <View style={styles.contextRow}>
          <Text style={styles.tag}>SUITE</Text>
          <Text style={styles.contextValueMuted} numberOfLines={1}>
            {nextStop
              ? `${nextStop.order} · ${nextStop.address}`
              : "Fin de la tournée"}
            {nextStopDistance !== null ? `  ·  ${formatDistance(nextStopDistance)}` : ""}
          </Text>
        </View>
      </View>

      {/* Botón de entrega */}
      <TouchableOpacity
        style={[
          styles.deliverBtn,
          alertActive && styles.deliverBtnAlert,
          !nextPackage && styles.deliverBtnDisabled,
        ]}
        activeOpacity={0.85}
        onPress={onDelivered}
        disabled={!nextPackage}
      >
        <Icon name="check" size={22} color="#fff" strokeWidth={2.5} />
        <View style={styles.deliverTextWrap}>
          {nextPackage ? (
            <>
              <Text style={styles.deliverTitle}>LIVRÉ</Text>
              <Text style={styles.deliverSub} numberOfLines={1}>
                {nextPackage.stop.order} · {nextPackage.stop.address} ·{" "}
                {formatDistance(distanceToNextPackage)}
                {alertActive ? "  · proche" : ""}
              </Text>
            </>
          ) : (
            <Text style={styles.deliverTitle}>Aucun colis</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Navegación por la ruta */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={onPrev}
        >
          <Icon name="chevron-left" size={22} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nearestBtn}
          activeOpacity={0.85}
          onPress={onNearest}
        >
          <Icon name="map-pin" size={18} color="#1a1a1a" />
          <Text style={styles.nearestText}>Plus proche</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={onNext}
        >
          <Icon name="chevron-right" size={22} color="#374151" />
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
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
  },
  context: {
    marginBottom: 12,
  },
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  tag: {
    width: 52,
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1,
  },
  contextValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#17181a",
  },
  contextValueMuted: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },
  deliverBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  deliverBtnAlert: {
    backgroundColor: "#ea580c",
    shadowColor: "#ea580c",
  },
  deliverBtnDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },
  deliverTextWrap: {
    flex: 1,
  },
  deliverTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deliverSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 12,
  },
  navBtn: {
    width: 56,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  nearestBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFCC00", // amarillo La Poste
  },
  nearestText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "800",
  },
  gpsInfo: {
    fontSize: 11,
    color: "#c2c7cf",
    marginTop: 10,
    textAlign: "center",
  },
});
