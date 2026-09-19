import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OrganizationProfile } from "../types";

type Props = {
  profile: OrganizationProfile;
  selectedId?: string | null;
  counts?: Record<string, number>;
  onPressSlot?: (sectionId: string) => void;
  compact?: boolean;
};

export default function TrailerGrid({
  profile,
  selectedId,
  counts,
  onPressSlot,
  compact = false,
}: Props) {
  const byId = new Map(profile.sections.map((section) => [section.id, section]));

  return (
    <View>
      <View style={styles.directionRow}>
        <Text style={styles.direction}>AVANT</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.direction}>ARRIÈRE</Text>
      </View>
      <Text style={styles.door}>OUVERTURE · CÔTÉ 2</Text>
      <View style={styles.grid}>
        {profile.slotOrder.map((id) => {
          const section = byId.get(id);
          if (!section) return null;
          const selected = selectedId === id;
          return (
            <Pressable
              key={id}
              style={[styles.cell, compact && styles.cellCompact, selected && styles.cellSelected]}
              onPress={() => onPressSlot?.(id)}
              disabled={!onPressSlot}
            >
              <Text style={styles.cellId}>{id}</Text>
              {!compact && (
                <Text style={styles.cellName} numberOfLines={2}>
                  {section.name}
                </Text>
              )}
              {counts && (
                <Text style={styles.count}>{counts[id] ?? 0} colis</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.door}>OUVERTURE · CÔTÉ 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  directionRow: { flexDirection: "row", justifyContent: "center", gap: 9, marginBottom: 7 },
  direction: { fontSize: 11, fontWeight: "800", color: "#6b7280", letterSpacing: 0.6 },
  arrow: { fontSize: 13, color: "#6b7280" },
  door: {
    textAlign: "center",
    backgroundColor: "#FFCC00",
    color: "#17181a",
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderColor: "#17181a",
    backgroundColor: "#17181a",
    gap: 1,
  },
  cell: {
    width: "33%",
    minHeight: 92,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  cellCompact: { minHeight: 66 },
  cellSelected: { backgroundColor: "#FFCC00" },
  cellId: { fontSize: 18, fontWeight: "900", color: "#17181a" },
  cellName: { marginTop: 4, textAlign: "center", fontSize: 11, color: "#4b5563" },
  count: { marginTop: 4, fontSize: 11, fontWeight: "800", color: "#b45309" },
});
