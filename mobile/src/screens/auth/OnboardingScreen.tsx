import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <View style={styles.wrap}>
        <Image source={LOGO} style={styles.logo} />

        <Text style={styles.title}>ZanAI</Text>
        <Text style={styles.sub}>
          Помощник по законам РК: новости, статьи и AI-чат.
        </Text>

        <Pressable
          onPress={() => navigation.replace("ChooseAuth")}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryText}>Продолжить</Text>
        </Pressable>

        <Pressable onPress={() => navigation.replace("ChooseAuth")}>
          <Text style={styles.skip}>Пропустить</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  logo: { width: 200, height: 48, resizeMode: "contain", alignSelf: "center" },

  title: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  skip: {
    marginTop: 14,
    textAlign: "center",
    color: colors.muted,
    fontWeight: "800",
  },
});
