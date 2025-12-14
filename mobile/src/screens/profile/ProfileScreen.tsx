import React from "react";
import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Профиль</Text>
      <Text style={{ marginTop: 12 }}>Язык, настройки, роль (user/lawyer).</Text>
    </View>
  );
}
