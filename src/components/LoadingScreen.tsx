import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OrganizationProfile, PackageStop, RouteStop } from "../types";
import { sectionForOrder } from "../utils/organization";
import FeatureScreen from "./FeatureScreen";
import Icon from "./Icon";
import TrailerGrid from "./TrailerGrid";

type Props = {
  routeName: string;
  stops: RouteStop[];
  packages: PackageStop[];
  profile: OrganizationProfile;
  onToggleLoaded: (stopId: number) => void;
  onClose: () => void;
};

export default function LoadingScreen({
  routeName,
  stops,
  packages,
  profile,
  onToggleLoaded,
  onClose,
}: Props) {
  const stopById = useMemo(() => new Map(stops.map((stop) => [stop.id, stop])), [stops]);
  const rows = useMemo(
    () => packages
      .map((pkg) => ({ pkg, stop: stopById.get(pkg.routeStopId) }))
      .filter((row): row is { pkg: PackageStop; stop: RouteStop } => !!row.stop)
      .sort((a, b) => a.stop.order - b.stop.order),
    [packages, stopById]
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const section = sectionForOrder(profile, row.stop.order);
    if (section) counts[section.id] = (counts[section.id] ?? 0) + row.pkg.packageCount;
  }
  const loaded = rows.filter((row) => row.pkg.loaded).length;

  return (
    <FeatureScreen title="Préparer le chargement" subtitle={routeName} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        {!rows.length ? (
          <View style={styles.empty}>
            <Icon name="package" size={42} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Aucun colis sélectionné</Text>
            <Text style={styles.emptyText}>
              Revenez à la liste de la tournée et cochez les adresses qui ont des colis.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryValue}>{loaded}/{rows.length}</Text>
              <Text style={styles.summaryLabel}>adresses chargées</Text>
            </View>
            <TrailerGrid profile={profile} counts={counts} compact />
            <Text style={styles.heading}>ORDRE DE CHARGEMENT</Text>
            <Text style={styles.help}>
              Chargez d'abord les dernières zones. Confirmez chaque adresse quand ses colis sont dans la remorque.
            </Text>
            {[...rows].reverse().map(({ pkg, stop }) => {
              const section = sectionForOrder(profile, stop.order);
              return (
                <Pressable
                  key={stop.id}
                  style={[styles.row, pkg.loaded && styles.rowLoaded]}
                  onPress={() => onToggleLoaded(stop.id)}
                >
                  <View style={[styles.check, pkg.loaded && styles.checkOn]}>
                    {pkg.loaded && <Icon name="check" size={15} color="#fff" strokeWidth={3} />}
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.address}>{stop.address}</Text>
                    <Text style={styles.meta}>Ordre {stop.order} · {pkg.packageCount} colis</Text>
                  </View>
                  <Text style={styles.zone}>{section?.id ?? "—"}</Text>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </FeatureScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 36, gap: 14 },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 28 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: "#17181a", marginTop: 14 },
  emptyText: { textAlign: "center", color: "#6b7280", fontSize: 15, lineHeight: 21, marginTop: 7 },
  summary: { alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 14 },
  summaryValue: { fontSize: 30, fontWeight: "900", color: "#17181a" },
  summaryLabel: { color: "#6b7280", marginTop: 2 },
  heading: { fontSize: 13, fontWeight: "900", letterSpacing: 0.8, color: "#17181a", marginTop: 4 },
  help: { color: "#6b7280", fontSize: 13, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 11 },
  rowLoaded: { opacity: 0.55 },
  check: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  rowText: { flex: 1, marginLeft: 10 },
  address: { fontSize: 15, fontWeight: "700", color: "#17181a" },
  meta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  zone: { fontSize: 18, fontWeight: "900", color: "#b45309", marginLeft: 8 },
});
