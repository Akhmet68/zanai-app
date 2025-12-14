import React, { useEffect } from "react";
import { View, Text } from "react-native";

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Onboarding"), 800);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>ZanAI</Text>
    </View>
  );
}
