import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OrganizationProfile, RouteStop } from "../types";
import { sectionForStop } from "../utils/organization";
import FeatureScreen from "./FeatureScreen";
import InstructionCard from "./InstructionCard";
import TrailerGame3D from "./TrailerGame3D";

type Difficulty = "debutant" | "normal" | "examen";
type Answer = { stop: RouteStop; chosenId: string; expectedId: string };

type Props = {
  routeName: string;
  stops: RouteStop[];
  profile: OrganizationProfile;
  onClose: () => void;
};

const COUNTS: Record<Difficulty, number> = { debutant: 8, normal: 16, examen: 24 };

function randomStops(stops: RouteStop[], count: number): RouteStop[] {
  const pool = [...stops];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export default function PracticeScreen({ routeName, stops, profile, onClose }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>("debutant");
  const [targets, setTargets] = useState<RouteStop[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedback, setFeedback] = useState<{ chosen: string; expected: string } | null>(null);

  const current = targets[answers.length];
  const finished = targets.length > 0 && answers.length === targets.length;
  const score = useMemo(
    () => answers.filter((answer) => answer.chosenId === answer.expectedId).length,
    [answers]
  );

  const start = () => {
    const playableStops = stops.filter((stop) => sectionForStop(profile, stop));
    setTargets(randomStops(playableStops, COUNTS[difficulty]));
    setAnswers([]);
    setFeedback(null);
  };

  const choose = (chosenId: string) => {
    if (!current || feedback) return;
    const expected = sectionForStop(profile, current);
    if (!expected) return;
    const answer = { stop: current, chosenId, expectedId: expected.id };
    if (difficulty === "examen") {
      setAnswers((value) => [...value, answer]);
    } else {
      setFeedback({ chosen: chosenId, expected: expected.id });
    }
  };

  const next = () => {
    if (!current || !feedback) return;
    setAnswers((value) => [
      ...value,
      { stop: current, chosenId: feedback.chosen, expectedId: feedback.expected },
    ]);
    setFeedback(null);
  };

  if (!targets.length) {
    return (
      <FeatureScreen title="Mode entraînement" subtitle={routeName} onClose={onClose}>
        <ScrollView contentContainerStyle={styles.setup}>
          <Text style={styles.hero}>Entraînez votre mémoire de chargement</Text>
          <Text style={styles.help}>
            Des colis fictifs seront générés. Placez chaque adresse dans la bonne case de votre remorque.
          </Text>
          <View style={styles.prerequisite}>
            <Text style={styles.prerequisiteTitle}>AVANT DE JOUER</Text>
            <Text style={styles.prerequisiteText}>
              Vous devez d'abord organiser la tournée dans « Mon organisation ». Divisez les adresses en secteurs continus dans l'ordre du parcours, puis choisissez leur position dans la remorque. Le jeu reprendra exactement votre organisation personnelle.
            </Text>
          </View>
          <InstructionCard
            title="Comment jouer ?"
            steps={[
              "Vérifiez que les adresses sont réparties dans l'ordre entre vos secteurs A1, A2, B1, B2, C1 et C2.",
              "Choisissez une difficulté : Débutant affiche aussi le numéro d'ordre, Normal masque cet indice et Examen cache également les noms des rues dans les cases.",
              "Appuyez sur « Commencer la partie ». Une adresse et un colis fictif apparaissent.",
              "Touchez la case de la remorque où vous chargeriez réellement ce colis.",
              "Vert signifie que le placement est correct. Rouge indique votre choix et la bonne case s'allume en vert.",
              "Appuyez sur « Suivant » jusqu'au résultat final.",
            ]}
            note="Il n'existe pas une seule bonne division : utilisez les secteurs qui correspondent à votre façon réelle de charger et de mémoriser la tournée."
          />
          <View style={styles.levels}>
            {([
              ["debutant", "Débutant", "8 colis · correction immédiate"],
              ["normal", "Normal", "16 colis · correction immédiate"],
              ["examen", "Examen", "24 colis · cases sans noms · résultat à la fin"],
            ] as const).map(([id, title, subtitle]) => (
              <Pressable
                key={id}
                style={[styles.level, difficulty === id && styles.levelSelected]}
                onPress={() => setDifficulty(id)}
              >
                <Text style={styles.levelTitle}>{title}</Text>
                <Text style={styles.levelSub}>{subtitle}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primary} onPress={start}>
            <Text style={styles.primaryText}>COMMENCER LA PARTIE</Text>
          </Pressable>
          <TrailerGame3D profile={profile} hideSectionNames={difficulty === "examen"} />
        </ScrollView>
      </FeatureScreen>
    );
  }

  if (finished) {
    const mistakes = answers.filter((answer) => answer.chosenId !== answer.expectedId);
    return (
      <FeatureScreen title="Résultat" subtitle={routeName} onClose={onClose}>
        <ScrollView contentContainerStyle={styles.setup}>
          <Text style={styles.score}>{score}/{answers.length}</Text>
          <Text style={styles.scoreLabel}>colis placés correctement</Text>
          {mistakes.map((answer) => (
            <View key={answer.stop.id} style={styles.mistake}>
              <Text style={styles.mistakeAddress}>{answer.stop.address}</Text>
              <Text style={styles.mistakeDetail}>{answer.chosenId} → {answer.expectedId}</Text>
            </View>
          ))}
          {!mistakes.length && <Text style={styles.perfect}>Parfait — aucune erreur.</Text>}
          <Pressable style={styles.primary} onPress={start}>
            <Text style={styles.primaryText}>RECOMMENCER</Text>
          </Pressable>
        </ScrollView>
      </FeatureScreen>
    );
  }

  return (
    <FeatureScreen
      title="Placer le colis"
      subtitle={`${answers.length + 1} sur ${targets.length}`}
      onClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.practice}>
        <View style={styles.packageCard}>
          <Text style={styles.packageLabel}>COLIS FICTIF</Text>
          <Text style={styles.address}>{current.address}</Text>
          {difficulty === "debutant" && (
            <Text style={styles.order}>Ordre {current.order}</Text>
          )}
        </View>
        <Text style={styles.question}>Dans quelle case le placeriez-vous ?</Text>
        <Text style={styles.gameHint}>Lisez l'adresse, puis touchez directement une case de la remorque.</Text>
        <TrailerGame3D
          profile={profile}
          selectedId={feedback?.chosen}
          expectedId={feedback?.expected}
          parcelLabel={`N° ${current.order}`}
          onPressSlot={choose}
          disabled={!!feedback}
          hideSectionNames={difficulty === "examen"}
        />
        {!!feedback && (
          <View style={[styles.feedback, feedback.chosen === feedback.expected ? styles.correct : styles.wrong]}>
            <Text style={styles.feedbackTitle}>
              {feedback.chosen === feedback.expected ? "Correct" : `À placer en ${feedback.expected}`}
            </Text>
            <Pressable style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextText}>SUIVANT</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </FeatureScreen>
  );
}

const styles = StyleSheet.create({
  setup: { flexGrow: 1, padding: 18, gap: 14 },
  practice: { padding: 18, gap: 16 },
  hero: { fontSize: 24, fontWeight: "900", color: "#17181a" },
  help: { fontSize: 15, lineHeight: 21, color: "#6b7280" },
  prerequisite: { backgroundColor: "#17181a", borderRadius: 14, padding: 14, borderLeftWidth: 6, borderLeftColor: "#FFCC00" },
  prerequisiteTitle: { color: "#FFCC00", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  prerequisiteText: { color: "#fff", fontSize: 14, lineHeight: 20, marginTop: 6, fontWeight: "600" },
  levels: { gap: 8 },
  level: { padding: 13, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  levelSelected: { backgroundColor: "#FFF6D6", borderColor: "#17181a", borderWidth: 2 },
  levelTitle: { fontSize: 16, fontWeight: "800", color: "#17181a" },
  levelSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  primary: { backgroundColor: "#17181a", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 4 },
  primaryText: { color: "#FFCC00", fontWeight: "900", letterSpacing: 0.5 },
  packageCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, borderLeftWidth: 6, borderLeftColor: "#FFCC00" },
  packageLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1, color: "#9ca3af" },
  address: { fontSize: 23, fontWeight: "900", color: "#17181a", marginTop: 8 },
  order: { fontSize: 14, color: "#6b7280", marginTop: 5 },
  question: { fontSize: 16, fontWeight: "700", color: "#374151", textAlign: "center" },
  gameHint: { marginTop: -10, fontSize: 12, lineHeight: 17, color: "#6b7280", textAlign: "center" },
  feedback: { borderRadius: 12, padding: 14, alignItems: "center" },
  correct: { backgroundColor: "#dcfce7" },
  wrong: { backgroundColor: "#fee2e2" },
  feedbackTitle: { fontSize: 17, fontWeight: "900", color: "#17181a" },
  nextBtn: { marginTop: 10, backgroundColor: "#17181a", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  nextText: { color: "#fff", fontWeight: "800" },
  score: { fontSize: 56, fontWeight: "900", textAlign: "center", color: "#17181a" },
  scoreLabel: { fontSize: 16, textAlign: "center", color: "#6b7280", marginBottom: 8 },
  mistake: { flexDirection: "row", justifyContent: "space-between", gap: 12, backgroundColor: "#fff", padding: 12, borderRadius: 10 },
  mistakeAddress: { flex: 1, fontWeight: "700", color: "#374151" },
  mistakeDetail: { color: "#b91c1c", fontWeight: "900" },
  perfect: { backgroundColor: "#dcfce7", color: "#166534", padding: 14, borderRadius: 12, textAlign: "center", fontWeight: "800" },
});
