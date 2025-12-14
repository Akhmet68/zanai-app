import React from "react";
import { View, Text } from "react-native";

export default function NewsHomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Новости дня</Text>
      <Text style={{ marginTop: 12 }}>Тут будет лента новостей + кнопка “Ещё”.</Text>
    </View>
  );
}
