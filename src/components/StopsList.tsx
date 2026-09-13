import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PackageStop, RouteStop } from "../types";

/**
 * Lista LATERAL de todas las paradas de la ruta (scrollable).
 *
 * Cada fila permite:
 *   - Tocar la DIRECCIÓN  -> selecciona esa parada (la marca como actual).
 *   - Tocar la CASILLA    -> carga/quita un paquete en esa parada.
 *   - Tocar el CONTADOR   -> aumenta la cantidad (1 -> 2 -> 3 -> 1) si hay paquete.
 *
 * Así los paquetes del día se "cargan" a mano desde la app, sin editar ficheros.
 */

type Props = {
  stops: RouteStop[];
  packages: PackageStop[];
  currentIndex: number;
  onSelectStop: (index: number) => void;
  onTogglePackage: (stopId: number) => void;
  onCyclePackageCount: (stopId: number) => void;
};

export default function StopsList({
  stops,
  packages,
  currentIndex,
  onSelectStop,
  onTogglePackage,
  onCyclePackageCount,
}: Props) {
  // Mapa rápido stopId -> PackageStop para no recorrer el array en cada fila.
  const pkgById = new Map<number, PackageStop>();
  packages.forEach((p) => pkgById.set(p.routeStopId, p));

  const packagesLoaded = packages.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PARADAS</Text>
        <Text style={styles.headerSub}>
          {stops.length} · 📦 {packagesLoaded}
        </Text>
      </View>

      <FlatList
        data={stops}
        keyExtractor={(s) => String(s.id)}
        initialNumToRender={20}
        windowSize={11}
        renderItem={({ item, index }) => {
          const pkg = pkgById.get(item.id);
          const hasPkg = !!pkg;
          const delivered = !!pkg?.delivered;
          const isCurrent = index === currentIndex;

          return (
            <View
              style={[
                styles.row,
                isCurrent && styles.rowCurrent,
                delivered && styles.rowDelivered,
              ]}
            >
              {/* Dirección: tocar = seleccionar parada */}
              <Pressable
                style={styles.addressArea}
                onPress={() => onSelectStop(index)}
                hitSlop={4}
              >
                <Text style={styles.order}>{item.order}</Text>
                <Text
                  style={[styles.address, delivered && styles.addressDelivered]}
                  numberOfLines={1}
                >
                  {item.address}
                </Text>
              </Pressable>

              {/* Contador de paquetes: tocar = subir cantidad (solo si hay paquete) */}
              {hasPkg && (
                <Pressable
                  style={styles.countBadge}
                  onPress={() => onCyclePackageCount(item.id)}
                  hitSlop={4}
                >
                  <Text style={styles.countText}>×{pkg!.packageCount}</Text>
                </Pressable>
              )}

              {/* Casilla: tocar = cargar/quitar paquete */}
              <Pressable
                style={[styles.checkbox, hasPkg && styles.checkboxOn]}
                onPress={() => onTogglePackage(item.id)}
                hitSlop={8}
              >
                {hasPkg && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 1,
    borderLeftColor: "#dee2e6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#343a40",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerSub: {
    color: "#ced4da",
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  rowCurrent: {
    backgroundColor: "#e7f5ff",
  },
  rowDelivered: {
    backgroundColor: "#ebfbee",
  },
  addressArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  order: {
    width: 34,
    fontSize: 13,
    fontWeight: "800",
    color: "#868e96",
  },
  address: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  addressDelivered: {
    color: "#adb5bd",
    textDecorationLine: "line-through",
  },
  countBadge: {
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#ffe3bf",
  },
  countText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#d9480f",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#adb5bd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "#2f9e44",
    borderColor: "#2f9e44",
  },
  checkMark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
});
