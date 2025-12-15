import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MyCasesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои дела</Text>
      <Text>История обращений / кейсы / статусы.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
});
