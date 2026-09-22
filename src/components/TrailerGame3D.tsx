import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OrganizationProfile } from "../types";

type Props = {
  profile: OrganizationProfile;
  selectedId?: string | null;
  expectedId?: string | null;
  parcelLabel?: string;
  onPressSlot?: (sectionId: string) => void;
  disabled?: boolean;
  hideSectionNames?: boolean;
  vehicleType?: "voiture" | "moto";
};

export default function TrailerGame3D({
  profile,
  selectedId,
  expectedId,
  parcelLabel,
  onPressSlot,
  disabled = false,
  hideSectionNames = false,
}: Props) {
  const sections = new Map(profile.sections.map((section) => [section.id, section]));
  const rows = [profile.slotOrder.slice(0, 3), profile.slotOrder.slice(3, 6)];

  const renderSlot = (id: string) => {
    const section = sections.get(id);
    if (!section) return null;
    const selected = selectedId === id;
    const correct = !!expectedId && expectedId === id;
    const wrong = selected && !!expectedId && expectedId !== id;
    return (
      <Pressable
        key={id}
        disabled={disabled || !onPressSlot}
        onPress={() => onPressSlot?.(id)}
        accessibilityRole="button"
        accessibilityLabel={`Compartiment ${id}, ${section.name}`}
        style={({ pressed }) => [
          styles.slot,
          selected && styles.slotSelected,
          correct && styles.slotCorrect,
          wrong && styles.slotWrong,
          pressed && styles.slotPressed,
        ]}
      >
        <View style={styles.slotTop} />
        <Text style={styles.slotId}>{id}</Text>
        {!hideSectionNames && (
          <Text style={styles.slotName} numberOfLines={2}>{section.name}</Text>
        )}
        {selected && parcelLabel ? (
          <View style={[styles.parcel, wrong && styles.parcelWrong]}>
            <View style={styles.parcelTape} />
            <Text style={styles.parcelText}>{parcelLabel}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.scene}>
      <View style={styles.skyGlow} />
      <View style={styles.floorLineOne} />
      <View style={styles.floorLineTwo} />

      <View style={styles.vehicleShadow} />
      <View style={styles.vehicle}>
        <View style={styles.vanRoof} />
        <View style={styles.windscreen} />
        <View style={styles.vanSide}>
          <Text style={styles.postText}>POSTE</Text>
        </View>
        <View style={[styles.wheel, styles.wheelFront]}><View style={styles.hub} /></View>
        <View style={[styles.wheel, styles.wheelRear]}><View style={styles.hub} /></View>
      </View>

      <View style={styles.towBar} />
      <View style={styles.trailerShadow} />
      <View style={styles.trailerBack} />
      <View style={styles.openLid}>
        <Text style={styles.lidText}>OUVERTURE LATÉRALE</Text>
      </View>
      <View style={styles.trailerDeck}>
        {rows.map((row, index) => (
          <View key={index} style={styles.slotRow}>{row.map(renderSlot)}</View>
        ))}
      </View>
      <View style={[styles.trailerWheel, styles.trailerWheelLeft]}><View style={styles.hub} /></View>
      <View style={[styles.trailerWheel, styles.trailerWheelRight]}><View style={styles.hub} /></View>

      {!selectedId && parcelLabel ? (
        <View style={styles.parcelHand}>
          <View style={styles.parcelTape} />
          <Text style={styles.parcelHandCaption}>COLIS À CHARGER</Text>
          <Text style={styles.parcelHandText} numberOfLines={1}>{parcelLabel}</Text>
        </View>
      ) : null}
      <View style={styles.cameraBadge}>
        <View style={styles.cameraDot} />
        <Text style={styles.cameraText}>VUE 3D · CÔTÉ OUVERT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: 390,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#dfe7eb",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    position: "relative",
  },
  skyGlow: {
    position: "absolute", top: -80, left: -30, right: -30, height: 220,
    borderRadius: 140, backgroundColor: "rgba(255,255,255,0.72)",
  },
  floorLineOne: {
    position: "absolute", left: -30, right: -30, bottom: 73, height: 2,
    backgroundColor: "rgba(255,255,255,0.75)", transform: [{ rotate: "-7deg" }],
  },
  floorLineTwo: {
    position: "absolute", left: 80, right: -70, bottom: 22, height: 2,
    backgroundColor: "rgba(255,255,255,0.6)", transform: [{ rotate: "13deg" }],
  },
  vehicleShadow: {
    position: "absolute", top: 104, right: 0, width: "37%", height: 105,
    borderRadius: 50, backgroundColor: "rgba(15,23,42,0.18)", transform: [{ skewX: "-15deg" }],
  },
  vehicle: {
    position: "absolute", top: 57, right: -14, width: "39%", height: 138,
    borderRadius: 22, backgroundColor: "#FFCC00", borderWidth: 3, borderColor: "#17181a",
  },
  vanRoof: {
    position: "absolute", top: -14, left: 28, right: 8, height: 28,
    borderTopLeftRadius: 18, borderTopRightRadius: 24, backgroundColor: "#ffe36b",
    borderWidth: 3, borderColor: "#17181a", transform: [{ skewX: "-18deg" }],
  },
  windscreen: {
    position: "absolute", top: 10, right: 11, width: "37%", height: 49,
    borderRadius: 8, backgroundColor: "#25323a", borderWidth: 3, borderColor: "#17181a",
    transform: [{ skewX: "-8deg" }],
  },
  vanSide: {
    position: "absolute", top: 16, left: 12, width: "48%", height: 74,
    borderRadius: 8, backgroundColor: "#f9c800", borderWidth: 2, borderColor: "#17181a",
    alignItems: "center", justifyContent: "center",
  },
  postText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2, color: "#17181a" },
  wheel: {
    position: "absolute", bottom: -22, width: 45, height: 45, borderRadius: 23,
    backgroundColor: "#17181a", borderWidth: 5, borderColor: "#374151",
    alignItems: "center", justifyContent: "center",
  },
  wheelFront: { right: 17 },
  wheelRear: { left: 18 },
  hub: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#d1d5db", borderWidth: 2, borderColor: "#6b7280" },
  towBar: {
    position: "absolute", top: 173, left: "53%", width: "15%", height: 8,
    borderRadius: 4, backgroundColor: "#17181a", transform: [{ rotate: "-5deg" }],
  },
  trailerShadow: {
    position: "absolute", left: 12, right: "36%", top: 239, height: 83,
    borderRadius: 45, backgroundColor: "rgba(15,23,42,0.2)", transform: [{ skewX: "-16deg" }],
  },
  trailerBack: {
    position: "absolute", left: 17, right: "38%", top: 119, height: 155,
    borderRadius: 15, backgroundColor: "#4b5563", borderWidth: 3, borderColor: "#17181a",
    transform: [{ skewX: "-4deg" }],
  },
  openLid: {
    position: "absolute", left: 23, right: "39%", top: 86, height: 43,
    borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: "#eef1f2",
    borderWidth: 3, borderColor: "#17181a", transform: [{ perspective: 500 }, { rotateX: "42deg" }],
    alignItems: "center", justifyContent: "center",
  },
  lidText: { fontSize: 8, fontWeight: "900", color: "#6b7280", letterSpacing: 0.8 },
  trailerDeck: {
    position: "absolute", left: 29, right: "40%", top: 126, height: 139,
    padding: 5, gap: 5,
    backgroundColor: "#303940", borderRadius: 9,
  },
  slotRow: { flex: 1, flexDirection: "row", gap: 5 },
  slot: {
    flex: 1, minWidth: 0, borderRadius: 7, backgroundColor: "#e7eaec",
    borderWidth: 2, borderColor: "#9ca3af", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 1, overflow: "visible",
  },
  slotTop: {
    position: "absolute", top: -4, left: 3, right: 3, height: 5,
    backgroundColor: "#f8fafc", borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  slotSelected: { backgroundColor: "#FFCC00", borderColor: "#17181a" },
  slotCorrect: { backgroundColor: "#86efac", borderColor: "#15803d" },
  slotWrong: { backgroundColor: "#fecaca", borderColor: "#b91c1c" },
  slotPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  slotId: { fontSize: 16, fontWeight: "900", color: "#17181a" },
  slotName: { fontSize: 7, lineHeight: 9, color: "#4b5563", textAlign: "center" },
  parcel: {
    position: "absolute", width: 32, height: 24, right: -5, bottom: -5,
    backgroundColor: "#b7793f", borderWidth: 2, borderColor: "#744313", borderRadius: 3,
    alignItems: "center", justifyContent: "center", transform: [{ rotate: "-6deg" }], zIndex: 5,
  },
  parcelWrong: { backgroundColor: "#dc6b5f" },
  parcelTape: { position: "absolute", left: "43%", top: 0, bottom: 0, width: 5, backgroundColor: "#f5d99b" },
  parcelText: { fontSize: 7, fontWeight: "900", color: "#17181a", backgroundColor: "rgba(255,255,255,0.75)", paddingHorizontal: 2 },
  trailerWheel: {
    position: "absolute", top: 255, width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#17181a", borderWidth: 5, borderColor: "#374151",
    alignItems: "center", justifyContent: "center",
  },
  trailerWheelLeft: { left: "14%" },
  trailerWheelRight: { left: "44%" },
  parcelHand: {
    position: "absolute", left: 18, right: 18, bottom: 13, height: 58,
    borderRadius: 12, backgroundColor: "#b7793f", borderWidth: 2, borderColor: "#744313",
    justifyContent: "center", paddingHorizontal: 18, shadowColor: "#000", shadowOpacity: 0.2,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  parcelHandCaption: { fontSize: 9, fontWeight: "900", letterSpacing: 1, color: "#5b3514" },
  parcelHandText: { fontSize: 14, fontWeight: "900", color: "#17181a", marginTop: 2 },
  cameraBadge: {
    position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center",
    gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12,
    backgroundColor: "rgba(23,24,26,0.78)",
  },
  cameraDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FFCC00" },
  cameraText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});
