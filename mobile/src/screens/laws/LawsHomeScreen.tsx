import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LawsHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Законы</Text>
      <Text>Поиск по статьям / FAQ / категории.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
});
