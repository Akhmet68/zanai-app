import React from "react";
import { View, Text } from "react-native";

export default function OnboardingScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "flex-end" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>ZanAI</Text>
      <Text style={{ marginBottom: 24 }}>Юридический помощник: AI чат, ДТП, документы и кейсы.</Text>
      <Text
        onPress={() => navigation.navigate("ChooseAuth")}
        style={{ textAlign: "center", padding: 14, borderWidth: 1, borderRadius: 12 }}
      >
        Bastau
      </Text>
    </View>
  );
}
