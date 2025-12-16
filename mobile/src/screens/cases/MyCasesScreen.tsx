import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

export default function MyCasesScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Мои дела</Text>
        <Text style={styles.subtitle}>История обращений / кейсы / статусы.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  subtitle: { marginTop: 8, fontSize: 16, color: colors.muted },
});
