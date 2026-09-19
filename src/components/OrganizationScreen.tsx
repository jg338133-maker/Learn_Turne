import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OrganizationProfile, RouteStop } from "../types";
import { validateProfile, withStopAssignments } from "../utils/organization";
import FeatureScreen from "./FeatureScreen";
import InstructionCard from "./InstructionCard";
import TrailerGrid from "./TrailerGrid";

type Props = {
  routeName: string;
  profile: OrganizationProfile;
  stops: RouteStop[];
  onSave: (profile: OrganizationProfile) => void;
  onClose: () => void;
};

export default function OrganizationScreen({ routeName, profile, stops, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<OrganizationProfile>(() => {
    const migrated = withStopAssignments(profile, stops);
    return {
    ...migrated,
    sections: migrated.sections.map((section) => ({ ...section, stopIds: [...(section.stopIds ?? [])] })),
    slotOrder: [...profile.slotOrder],
  }});
  const [selectedId, setSelectedId] = useState(profile.sections[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [picker, setPicker] = useState<"start" | "end" | null>(null);
  const selected = useMemo(
    () => draft.sections.find((section) => section.id === selectedId),
    [draft.sections, selectedId]
  );
  const orderedStops = useMemo(() => [...stops].sort((a, b) => a.order - b.order), [stops]);
  const ownerOf = (stopId: number) => draft.sections.find((section) => section.stopIds?.includes(stopId));
  const assignedStops = orderedStops.filter((stop) => selected?.stopIds?.includes(stop.id));
  const startStop = assignedStops[0];
  const endStop = assignedStops[assignedStops.length - 1];

  const selectBoundary = (stop: RouteStop) => {
    if (!selectedId || !picker) return;
    const pickedIndex = orderedStops.findIndex((item) => item.id === stop.id);
    const currentStart = startStop ? orderedStops.findIndex((item) => item.id === startStop.id) : pickedIndex;
    const currentEnd = endStop ? orderedStops.findIndex((item) => item.id === endStop.id) : pickedIndex;
    const startIndex = picker === "start" ? pickedIndex : Math.min(currentStart, pickedIndex);
    const endIndex = picker === "end" ? pickedIndex : Math.max(currentEnd, pickedIndex);
    const from = Math.min(startIndex, endIndex);
    const to = Math.max(startIndex, endIndex);
    const block = orderedStops.slice(from, to + 1);
    const next: OrganizationProfile = {
      ...draft,
      sections: draft.sections.map((section) => section.id === selectedId
        ? {
            ...section,
            stopIds: block.map((item) => item.id),
            startOrder: block[0].order,
            endOrder: block[block.length - 1].order,
          }
        : section),
    };
    const error = validateProfile(next, orderedStops);
    if (error) {
      setMessage(error);
      Alert.alert("Ordre incorrect", error);
      return;
    }
    setMessage(null);
    setDraft(next);
    setPicker(null);
  };

  const updateSelected = (patch: Partial<NonNullable<typeof selected>>) => {
    if (!selectedId) return;
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === selectedId ? { ...section, ...patch } : section
      ),
    }));
  };

  const moveSelectedTo = (targetId: string) => {
    if (!selectedId) {
      setSelectedId(targetId);
      return;
    }
    if (selectedId === targetId) return;
    setDraft((current) => {
      const next = [...current.slotOrder];
      const from = next.indexOf(selectedId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      [next[from], next[to]] = [next[to], next[from]];
      return { ...current, slotOrder: next };
    });
  };

  const save = () => {
    const error = validateProfile(draft, orderedStops);
    if (error) {
      setMessage(error);
      return;
    }
    onSave(draft);
    onClose();
  };

  return (
    <FeatureScreen title="Mon organisation" subtitle={routeName} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <InstructionCard
          title="Comment organiser votre tournée ?"
          steps={[
            "Touchez un secteur, par exemple A1. La liste complète des adresses s'ouvre dans l'ordre de la tournée.",
            "Choisissez l'adresse de début, puis l'adresse de fin. Toutes les adresses comprises entre les deux seront ajoutées automatiquement.",
            "Vous pouvez placer une limite au milieu d'une rue : seule la position dans l'ordre de la tournée compte.",
            "Une étiquette A1, B2, etc. dans le menu signifie que l'adresse appartient déjà à ce secteur.",
            "Dans le plan de la remorque, touchez le secteur sélectionné puis la case de destination pour échanger leur position.",
            "Terminez avec « Enregistrer l'organisation ». Le chargement et le jeu utiliseront immédiatement cette configuration.",
          ]}
          note="Les secteurs doivent suivre l'ordre A1 → A2 → B1 → B2 → C1 → C2. L'application bloque les trous, les doublons et les croisements."
        />
        <Text style={styles.step}>1 · DIVISER LA TOURNÉE</Text>
        <Text style={styles.help}>
          Choisissez un secteur, puis définissez sa première et sa dernière adresse.
        </Text>
        <View style={styles.sectionList}>
          {draft.sections.map((section) => (
            <Pressable
              key={section.id}
              style={[styles.sectionRow, section.id === selectedId && styles.sectionRowSelected]}
              onPress={() => setSelectedId(section.id)}
            >
              <Text style={styles.sectionId}>{section.id}</Text>
              <Text style={styles.sectionName} numberOfLines={1}>{section.name}</Text>
              <Text style={styles.sectionRange}>{section.stopIds?.length ?? 0} adr. · {section.startOrder}–{section.endOrder}</Text>
            </Pressable>
          ))}
        </View>

        {!!selected && (
          <View style={styles.editor}>
            <Text style={styles.editorTitle}>Modifier {selected.id}</Text>
            <TextInput
              style={styles.input}
              value={selected.name}
              onChangeText={(name) => updateSelected({ name })}
              placeholder="Nom du secteur"
            />
            <Text style={styles.streetTitle}>PLAGE D'ADRESSES</Text>
            <View style={styles.boundaryRow}>
              <View style={styles.boundaryField}>
                <Text style={styles.boundaryLabel}>DE</Text>
                <Pressable style={styles.dropdown} onPress={() => setPicker("start")}>
                  <Text style={styles.dropdownText} numberOfLines={2}>{startStop ? `${startStop.order} · ${startStop.address}` : "Choisir l'adresse A"}</Text>
                  <Text style={styles.chevron}>⌄</Text>
                </Pressable>
              </View>
              <Text style={styles.toArrow}>→</Text>
              <View style={styles.boundaryField}>
                <Text style={styles.boundaryLabel}>À</Text>
                <Pressable style={styles.dropdown} onPress={() => setPicker("end")}>
                  <Text style={styles.dropdownText} numberOfLines={2}>{endStop ? `${endStop.order} · ${endStop.address}` : "Choisir l'adresse B"}</Text>
                  <Text style={styles.chevron}>⌄</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.rangeHelp}>{assignedStops.length} adresses seront incluses automatiquement.</Text>
          </View>
        )}

        <Text style={styles.step}>2 · ORGANISER LA REMORQUE</Text>
        <Text style={styles.help}>
          Sélectionnez un secteur ci-dessus, puis touchez la case avec laquelle vous voulez l'échanger.
        </Text>
        <TrailerGrid profile={draft} selectedId={selectedId} onPressSlot={moveSelectedTo} />

        {!!message && <Text style={styles.error}>{message}</Text>}
        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>ENREGISTRER L'ORGANISATION</Text>
        </Pressable>
      </ScrollView>
      <Modal visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{picker === "start" ? "Adresse de début" : "Adresse de fin"}</Text>
              <Text style={styles.modalSubtitle}>Sélectionnez une adresse dans l'ordre de la tournée</Text>
            </View>
            <Pressable style={styles.modalClose} onPress={() => setPicker(null)}><Text style={styles.modalCloseText}>✕</Text></Pressable>
          </View>
          <FlatList
            data={orderedStops}
            keyExtractor={(item) => String(item.id)}
            initialNumToRender={30}
            renderItem={({ item }) => {
              const owner = ownerOf(item.id);
              return (
                <Pressable style={styles.optionRow} onPress={() => selectBoundary(item)}>
                  <Text style={styles.optionOrder}>{item.order}</Text>
                  <Text style={styles.optionAddress}>{item.address}</Text>
                  {!!owner && <Text style={styles.owner}>{owner.id}</Text>}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </FeatureScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 36 },
  step: { fontSize: 13, fontWeight: "900", letterSpacing: 0.8, color: "#17181a", marginTop: 18 },
  help: { fontSize: 13, color: "#6b7280", marginTop: 5, marginBottom: 12 },
  sectionList: { gap: 6 },
  sectionRow: {
    flexDirection: "row", alignItems: "center", padding: 11, borderRadius: 10,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
  },
  sectionRowSelected: { backgroundColor: "#FFF6D6", borderColor: "#17181a", borderWidth: 2 },
  sectionId: { width: 34, fontSize: 15, fontWeight: "900", color: "#17181a" },
  sectionName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151" },
  sectionRange: { fontSize: 12, color: "#9ca3af" },
  editor: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginVertical: 14 },
  editorTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10, color: "#17181a" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 9, padding: 10, fontSize: 16, color: "#17181a", backgroundColor: "#fff" },
  streetTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8, color: "#6b7280", marginTop: 15, marginBottom: 7 },
  streetRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  streetRowChecked: { backgroundColor: "#fff8dc" },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#9ca3af", alignItems: "center", justifyContent: "center", marginRight: 10 },
  checkboxChecked: { backgroundColor: "#17181a", borderColor: "#17181a" },
  checkmark: { color: "#FFCC00", fontWeight: "900" },
  streetText: { flex: 1 },
  streetName: { fontSize: 14, fontWeight: "800", color: "#17181a" },
  addresses: { fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 15 },
  owner: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#e5e7eb", fontWeight: "900", color: "#4b5563" },
  boundaryRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  boundaryField: { flex: 1 },
  boundaryLabel: { fontSize: 11, fontWeight: "900", color: "#6b7280", marginBottom: 5 },
  dropdown: { minHeight: 62, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#9ca3af", borderRadius: 10, backgroundColor: "#e5e7eb", padding: 10 },
  dropdownText: { flex: 1, color: "#17181a", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  chevron: { fontSize: 22, color: "#6b7280", marginLeft: 5 },
  toArrow: { fontSize: 20, fontWeight: "900", color: "#9ca3af", paddingBottom: 19 },
  rangeHelp: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  modalRoot: { flex: 1, backgroundColor: "#f6f7f8" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFCC00", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#17181a" },
  modalSubtitle: { fontSize: 12, color: "#5b4a13", marginTop: 2 },
  modalClose: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.55)" },
  modalCloseText: { fontSize: 20, fontWeight: "700", color: "#17181a" },
  optionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  optionOrder: { width: 44, fontSize: 13, fontWeight: "900", color: "#9ca3af" },
  optionAddress: { flex: 1, fontSize: 15, fontWeight: "700", color: "#17181a" },
  error: { marginTop: 12, color: "#b91c1c", fontWeight: "700" },
  saveBtn: { marginTop: 18, backgroundColor: "#17181a", padding: 15, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#FFCC00", fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
});
