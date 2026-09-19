import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  steps: string[];
  note?: string;
};

export default function InstructionCard({ title, steps, note }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {steps.map((step, index) => (
        <View key={step} style={styles.row}>
          <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
          <Text style={styles.text}>{step}</Text>
        </View>
      ))}
      {!!note && <Text style={styles.note}>💡 {note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff8dc",
    borderWidth: 1,
    borderColor: "#f2c300",
    borderRadius: 14,
    padding: 14,
  },
  title: { fontSize: 16, fontWeight: "900", color: "#17181a", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  number: {
    width: 23, height: 23, borderRadius: 12, marginRight: 9,
    backgroundColor: "#17181a", alignItems: "center", justifyContent: "center",
  },
  numberText: { color: "#FFCC00", fontSize: 12, fontWeight: "900" },
  text: { flex: 1, color: "#374151", fontSize: 13, lineHeight: 19 },
  note: {
    marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#ead17a",
    color: "#5b4a13", fontSize: 12, lineHeight: 17, fontWeight: "600",
  },
});
