import React from "react";
import { Text, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

export default function LawsHomeScreen() {
  return (
    <Screen>
      <Header />
      <Text style={styles.title}>Законы</Text>
      <Text style={styles.text}>Поиск по статьям / FAQ / категории.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
  },
  text: {
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 16,
    color: colors.muted,
  },
});
