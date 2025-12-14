import React from "react";
import { View, Text } from "react-native";

export default function ChatScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>AI чат</Text>
      <Text style={{ marginTop: 12 }}>Тут будет чат + быстрые подсказки.</Text>
    </View>
  );
}
