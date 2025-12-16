import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

function Feature({ icon, title, desc }: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <LinearGradient
        colors={["#0B1E5B", "#1B2C63", "#FFFFFF"]}
        locations={[0, 0.55, 1]}
        style={[styles.bg, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.wrap}>
          <Image source={LOGO} style={styles.logo} />

          <Text style={styles.title}>ZanAI</Text>
          <Text style={styles.sub}>
            Помощник по законам РК: новости, статьи и AI-чат.
          </Text>

          <View style={styles.card}>
            <Feature
              icon="newspaper-outline"
              title="Новости и статьи"
              desc="Коротко и по делу: важные изменения и гайды."
            />
            <View style={styles.divider} />
            <Feature
              icon="document-text-outline"
              title="Законы"
              desc="Поиск по статьям и понятные объяснения."
            />
            <View style={styles.divider} />
            <Feature
              icon="chatbubbles-outline"
              title="AI-чат"
              desc="Спроси — получишь предварительный разбор ситуации."
            />
          </View>

          <Pressable
            onPress={() => navigation.replace("ChooseAuth")}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.primaryText}>Продолжить</Text>
          </Pressable>

          <Pressable onPress={() => navigation.replace("ChooseAuth")} style={{ marginTop: 14 }}>
            <Text style={styles.skip}>Пропустить</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },

  logo: { width: 240, height: 58, resizeMode: "contain", alignSelf: "center" },

  title: {
    marginTop: 14,
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
    marginBottom: 14,
  },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
  },
  divider: { height: 1, backgroundColor: "#EEF0F3", marginVertical: 10 },

  feature: { flexDirection: "row", gap: 12, alignItems: "center" },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  featureDesc: { marginTop: 2, fontSize: 12, color: colors.muted, lineHeight: 16 },

  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  skip: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "800",
  },
});
