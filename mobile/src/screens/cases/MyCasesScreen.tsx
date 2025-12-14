import React from "react";
import { View, Text } from "react-native";

export default function MyCasesScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Кейсы</Text>
      <Text style={{ marginTop: 12 }}>Тут будет список обращений пользователя.</Text>
    </View>
  );
}
