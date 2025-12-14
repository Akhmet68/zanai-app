import React from "react";
import { View, Text } from "react-native";

export default function LawsHomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Законы</Text>
      <Text style={{ marginTop: 12 }}>Тут будет “Конституция РК” и другие документы.</Text>
    </View>
  );
}
