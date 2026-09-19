import React, { ReactNode } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Icon from "./Icon";

type Props = { title: string; subtitle?: string; onClose: () => void; children: ReactNode };

export default function FeatureScreen({ title, subtitle, onClose, children }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
          <Icon name="x" size={22} color="#17181a" />
        </Pressable>
      </View>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f6f7f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFCC00",
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 21, fontWeight: "900", color: "#17181a" },
  subtitle: { fontSize: 12, color: "#4b4b45", marginTop: 2 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
