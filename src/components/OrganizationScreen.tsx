import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OrganizationProfile, RouteStop } from "../types";
import { streetNameFromAddress, validateProfile, withStreetAssignments } from "../utils/organization";
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
    const migrated = withStreetAssignments(profile, stops);
    return {
    ...migrated,
    sections: migrated.sections.map((section) => ({ ...section, streetNames: [...(section.streetNames ?? [])] })),
    slotOrder: [...profile.slotOrder],
  }});
  const [selectedId, setSelectedId] = useState(profile.sections[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const selected = useMemo(
    () => draft.sections.find((section) => section.id === selectedId),
    [draft.sections, selectedId]
  );
  const streets = useMemo(() => {
    const groups = new Map<string, RouteStop[]>();
    for (const stop of stops) {
      const street = streetNameFromAddress(stop.address);
      groups.set(street, [...(groups.get(street) ?? []), stop]);
    }
    return [...groups.entries()].map(([name, addresses]) => ({ name, addresses }));
  }, [stops]);
  const ownerOf = (street: string) => draft.sections.find((section) => section.streetNames?.includes(street));

  const toggleStreet = (street: string) => {
    if (!selectedId) return;
    const owner = ownerOf(street);
    if (owner && owner.id !== selectedId) {
      const text = `La rue « ${street} » appartient déjà au secteur ${owner.id}. Retirez-la d'abord de ce secteur pour éviter un chevauchement.`;
      setMessage(text);
      Alert.alert("Chevauchement impossible", text);
      return;
    }
    setMessage(null);
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === selectedId
        ? { ...section, streetNames: section.streetNames?.includes(street)
            ? section.streetNames.filter((name) => name !== street)
            : [...(section.streetNames ?? []), street] }
        : section),
    }));
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
        <InstructionCard
          title="Comment organiser votre tournée ?"
          steps={[
            "Touchez un secteur, par exemple A1. La liste de toutes les rues de la tournée s'ouvre dessous.",
            "Cochez les rues que vous rangerez dans ce secteur. Toutes les adresses de la rue seront incluses automatiquement.",
            "Une étiquette A1, B2, etc. signifie que la rue appartient déjà à un autre secteur.",
            "Pour déplacer une rue, décochez-la d'abord dans son secteur actuel, puis cochez-la dans le nouveau.",
            "Dans le plan de la remorque, touchez le secteur sélectionné puis la case de destination pour échanger leur position.",
            "Terminez avec « Enregistrer l'organisation ». Le chargement et le jeu utiliseront immédiatement cette configuration.",
          ]}
          note="Une rue ne peut jamais appartenir à deux secteurs. L'application bloque les chevauchements et affiche une alerte."
        />
        <Text style={styles.step}>1 · DIVISER LA TOURNÉE</Text>
        <Text style={styles.help}>
          Choisissez un secteur, puis sélectionnez les rues qui lui appartiennent.
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
              <Text style={styles.sectionRange}>{section.streetNames?.length ?? 0} rues</Text>
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
            <Text style={styles.streetTitle}>RUES ET ADRESSES</Text>
            {streets.map(({ name, addresses }) => {
              const owner = ownerOf(name);
              const checked = owner?.id === selected.id;
              return (
                <Pressable key={name} style={[styles.streetRow, checked && styles.streetRowChecked]} onPress={() => toggleStreet(name)}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    <Text style={styles.checkmark}>{checked ? "✓" : ""}</Text>
                  </View>
                  <View style={styles.streetText}>
                    <Text style={styles.streetName}>{name}</Text>
                    <Text style={styles.addresses} numberOfLines={2}>{addresses.map((stop) => stop.address).join(" · ")}</Text>
                  </View>
                  {!!owner && owner.id !== selected.id && <Text style={styles.owner}>{owner.id}</Text>}
                </Pressable>
              );
            })}
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
  error: { marginTop: 12, color: "#b91c1c", fontWeight: "700" },
  saveBtn: { marginTop: 18, backgroundColor: "#17181a", padding: 15, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#FFCC00", fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
});
