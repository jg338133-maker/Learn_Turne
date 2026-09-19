import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OrganizationProfile } from "../types";
import { validateProfile } from "../utils/organization";
import FeatureScreen from "./FeatureScreen";
import TrailerGrid from "./TrailerGrid";

type Props = {
  routeName: string;
  profile: OrganizationProfile;
  onSave: (profile: OrganizationProfile) => void;
  onClose: () => void;
};

export default function OrganizationScreen({ routeName, profile, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<OrganizationProfile>(() => ({
    ...profile,
    sections: profile.sections.map((section) => ({ ...section })),
    slotOrder: [...profile.slotOrder],
  }));
  const [selectedId, setSelectedId] = useState(profile.sections[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const selected = useMemo(
    () => draft.sections.find((section) => section.id === selectedId),
    [draft.sections, selectedId]
  );

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
    const error = validateProfile(draft);
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
        <Text style={styles.step}>1 · DIVISER LA TOURNÉE</Text>
        <Text style={styles.help}>
          Choisissez un secteur puis modifiez son nom et sa plage d'ordre.
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
              <Text style={styles.sectionRange}>{section.startOrder}–{section.endOrder}</Text>
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
            <View style={styles.rangeRow}>
              <View style={styles.rangeField}>
                <Text style={styles.label}>Depuis</Text>
                <TextInput
                  style={styles.input}
                  value={String(selected.startOrder)}
                  onChangeText={(value) => updateSelected({ startOrder: Number(value) || 0 })}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.rangeField}>
                <Text style={styles.label}>Jusqu'à</Text>
                <TextInput
                  style={styles.input}
                  value={String(selected.endOrder)}
                  onChangeText={(value) => updateSelected({ endOrder: Number(value) || 0 })}
                  keyboardType="number-pad"
                />
              </View>
            </View>
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
    </FeatureScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 36 },
  step: { fontSize: 13, fontWeight: "900", letterSpacing: 0.8, color: "#17181a", marginTop: 4 },
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
  rangeRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  rangeField: { flex: 1 },
  label: { fontSize: 12, fontWeight: "700", color: "#6b7280", marginBottom: 4 },
  error: { marginTop: 12, color: "#b91c1c", fontWeight: "700" },
  saveBtn: { marginTop: 18, backgroundColor: "#17181a", padding: 15, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#FFCC00", fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
});
