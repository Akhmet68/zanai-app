import React from "react";
import { Text, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

export default function MyCasesScreen() {
  return (
    <Screen>
      <Header />
      <Text style={styles.title}>Мои дела</Text>
      <Text style={styles.text}>История обращений / кейсы / статусы.</Text>
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
