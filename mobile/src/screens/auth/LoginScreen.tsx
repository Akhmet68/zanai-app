import React from "react";
import { View, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Kiru</Text>
      <Text>Здесь будет форма логина (email + пароль).</Text>
    </View>
  );
}
