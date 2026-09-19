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
import Icon from "./Icon";

/**
 * Lista de paradas refinada, con buscador.
 *
 *   - Nº     -> centra esa parada en el mapa de la app.
 *   - Dirección -> abre Google Maps (en azul). Roja si tiene paquete.
 *   - Casilla -> carga/quita un paquete.
 *   - Badge  -> nº de paquetes (tocar para subir 1→2→3).
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

  const pkgById = new Map<number, PackageStop>();
  packages.forEach((p) => pkgById.set(p.routeStopId, p));
  const packagesLoaded = packages.length;

  const q = query.trim().toLowerCase();
  const data = stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => (q ? stop.address.toLowerCase().includes(q) : true));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arrêts</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>
            {q ? `${data.length}/${stops.length}` : stops.length}
          </Text>
          <View style={styles.headerPkg}>
            <Icon name="package" size={15} color="#f59e0b" strokeWidth={2.2} />
            <Text style={styles.headerPkgText}>{packagesLoaded}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Icon name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.search}
          placeholder="Rechercher une adresse…"
          placeholderTextColor="#9ca3af"
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
              ? "Cette tournée n'a pas encore d'arrêts."
              : "Aucun résultat."}
          </Text>
        }
        renderItem={({ item }) => {
          const { stop, index } = item;
          const pkg = pkgById.get(stop.id);
          const hasPkg = !!pkg;
          const delivered = !!pkg?.delivered;
          const activePkg = hasPkg && !delivered;
          const isCurrent = index === currentIndex;

          return (
            <View style={[styles.row, isCurrent && styles.rowCurrent]}>
              <Pressable
                style={styles.orderArea}
                onPress={() => onSelectStop(index)}
                hitSlop={6}
              >
                <Text style={[styles.order, isCurrent && styles.orderCurrent]}>
                  {stop.order}
                </Text>
              </Pressable>

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

              {hasPkg && (
                <Pressable
                  style={styles.countBadge}
                  onPress={() => onCyclePackageCount(stop.id)}
                  hitSlop={4}
                >
                  <Text style={styles.countText}>{pkg!.packageCount}</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.checkbox, hasPkg && styles.checkboxOn]}
                onPress={() => onTogglePackage(stop.id)}
                hitSlop={8}
              >
                {hasPkg && <Icon name="check" size={16} color="#fff" strokeWidth={3} />}
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#17181a",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCountText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "700",
  },
  headerPkg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerPkgText: {
    color: "#b45309",
    fontSize: 14,
    fontWeight: "800",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  search: {
    flex: 1,
    fontSize: 16,
    color: "#17181a",
    padding: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f4",
    backgroundColor: "#fff",
  },
  rowCurrent: {
    backgroundColor: "#eff6ff",
  },
  orderArea: {
    width: 40,
  },
  order: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9ca3af",
  },
  orderCurrent: {
    color: "#2563eb",
  },
  addressArea: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2563eb",
  },
  addressPackage: {
    color: "#dc2626",
    fontWeight: "700",
  },
  addressDelivered: {
    color: "#c2c7cf",
    textDecorationLine: "line-through",
  },
  countBadge: {
    marginRight: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 15,
    paddingVertical: 28,
  },
});
