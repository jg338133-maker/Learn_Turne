import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PackageStop, RouteStop } from "../types";

/**
 * Lista de paradas con buscador.
 *
 * Cada fila permite:
 *   - Tocar el NÚMERO   -> centra esa parada en el mapa de la app.
 *   - Tocar la DIRECCIÓN -> abre Google Maps con esa parada como destino.
 *   - Tocar la CASILLA   -> carga/quita un paquete (la dirección se pone roja).
 *   - Tocar el CONTADOR  -> aumenta la cantidad (1 → 2 → 3 → 1).
 *
 * El buscador filtra por dirección sin perder la numeración original.
 */

type Props = {
  stops: RouteStop[];
  packages: PackageStop[];
  currentIndex: number;
  onSelectStop: (index: number) => void;
  onTogglePackage: (stopId: number) => void;
  onCyclePackageCount: (stopId: number) => void;
  onOpenMaps: (stop: RouteStop) => void;
};

export default function StopsList({
  stops,
  packages,
  currentIndex,
  onSelectStop,
  onTogglePackage,
  onCyclePackageCount,
  onOpenMaps,
}: Props) {
  const [query, setQuery] = useState("");

  // Mapa rápido stopId -> PackageStop.
  const pkgById = new Map<number, PackageStop>();
  packages.forEach((p) => pkgById.set(p.routeStopId, p));

  const packagesLoaded = packages.length;

  // Filtramos manteniendo el índice ORIGINAL de cada parada.
  const q = query.trim().toLowerCase();
  const data = stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) =>
      q ? stop.address.toLowerCase().includes(q) : true
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PARADAS</Text>
        <Text style={styles.headerSub}>
          {q ? `${data.length}/${stops.length}` : stops.length} · 📦{" "}
          {packagesLoaded}
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Buscar dirección…"
          placeholderTextColor="#adb5bd"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.stop.id)}
        initialNumToRender={20}
        windowSize={11}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>
            {stops.length === 0
              ? "Esta ruta aún no tiene paradas."
              : "Sin resultados para la búsqueda."}
          </Text>
        }
        renderItem={({ item }) => {
          const { stop, index } = item;
          const pkg = pkgById.get(stop.id);
          const hasPkg = !!pkg;
          const delivered = !!pkg?.delivered;
          const activePkg = hasPkg && !delivered; // paquete pendiente → rojo
          const isCurrent = index === currentIndex;

          return (
            <View
              style={[
                styles.row,
                isCurrent && styles.rowCurrent,
                delivered && styles.rowDelivered,
              ]}
            >
              {/* Número: centra la parada en el mapa de la app */}
              <Pressable
                style={styles.orderArea}
                onPress={() => onSelectStop(index)}
                hitSlop={6}
              >
                <Text style={styles.order}>{stop.order}</Text>
              </Pressable>

              {/* Dirección: abre Google Maps con el destino puesto */}
              <Pressable
                style={styles.addressArea}
                onPress={() => onOpenMaps(stop)}
                hitSlop={4}
              >
                <Text
                  style={[
                    styles.address,
                    activePkg && styles.addressPackage,
                    delivered && styles.addressDelivered,
                  ]}
                  numberOfLines={1}
                >
                  {stop.address}
                </Text>
              </Pressable>

              {/* Contador de paquetes (solo si hay paquete) */}
              {hasPkg && (
                <Pressable
                  style={styles.countBadge}
                  onPress={() => onCyclePackageCount(stop.id)}
                  hitSlop={4}
                >
                  <Text style={styles.countText}>×{pkg!.packageCount}</Text>
                </Pressable>
              )}

              {/* Casilla: cargar/quitar paquete */}
              <Pressable
                style={[styles.checkbox, hasPkg && styles.checkboxOn]}
                onPress={() => onTogglePackage(stop.id)}
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
  searchWrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f1f3f5",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dee2e6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#212529",
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
  orderArea: {
    width: 38,
  },
  order: {
    fontSize: 13,
    fontWeight: "800",
    color: "#868e96",
  },
  addressArea: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c7ed6", // azul: indica que es tocable (abre Google Maps)
  },
  addressPackage: {
    color: "#e03131",
    fontWeight: "800",
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
  empty: {
    textAlign: "center",
    color: "#868e96",
    fontSize: 15,
    paddingVertical: 24,
  },
});
