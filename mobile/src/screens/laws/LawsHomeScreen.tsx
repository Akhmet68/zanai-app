import React from "react";
import { Text, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

export default function LawsHomeScreen() {
  return (
    <Screen contentStyle={styles.container}>
      <Text style={styles.title}>Законы</Text>
      <Text style={styles.text}>Поиск по статьям / FAQ / категории.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12, // можно подогнать под макет
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, color: colors.text },
  text: { color: colors.muted },
});
