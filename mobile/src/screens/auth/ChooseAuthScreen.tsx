import React from "react";
import { View, Text } from "react-native";

export default function ChooseAuthScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", textAlign: "center" }}>ZanAI</Text>

      <Text onPress={() => navigation.navigate("Login")}
        style={{ textAlign: "center", padding: 14, borderWidth: 1, borderRadius: 12 }}>
        Kiru
      </Text>

      <Text onPress={() => navigation.navigate("Register")}
        style={{ textAlign: "center", padding: 14, borderWidth: 1, borderRadius: 12 }}>
        Tirkelu
      </Text>
    </View>
  );
}
