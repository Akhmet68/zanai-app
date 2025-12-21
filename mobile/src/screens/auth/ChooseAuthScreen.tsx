import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

const LOGO = require("../../../assets/zanai-logo.png");

function SocialBtn({
  icon,
  label,
  variant,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  variant: "dark" | "light";
  onPress: () => void;
}) {
  const dark = variant === "dark";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        dark ? styles.socialDark : styles.socialLight,
        pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] },
      ]}
    >
      <Ionicons name={icon} size={20} color={dark ? "#fff" : colors.text} />
      <Text style={[styles.socialText, dark && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export default function ChooseAuthScreen() {
  const navigation = useNavigation<any>();
  const { continueAsGuest } = useAuth();
  const insets = useSafeAreaInsets();

  const safeNavigate = useCallback(
    (name: string) => {
      try {
        navigation.navigate(name);
      } catch {
        Alert.alert("Навигация", `Экран "${name}" не подключён в навигаторе.`);
      }
    },
    [navigation]
  );

  const onApple = useCallback(() => {
    if (Platform.OS !== "ios") {
      Alert.alert("Apple", "Apple Sign-In доступен на iOS. На Android подключим Google позже.");
      return;
    }
    Alert.alert("Скоро", "Apple Sign-In подключим следующим шагом (через Dev Build).");
  }, []);

  const onGoogle = useCallback(() => {
    Alert.alert("Скоро", "Google Sign-In подключим следующим шагом (через Dev Build).");
  }, []);

  return (
    <Screen contentStyle={{ paddingTop: 0 }} edges={["left", "right"]}>
      <LinearGradient
        colors={["#0B1E5B", "#162A63", "#FFFFFF"]}
        locations={[0, 0.62, 1]}
        style={[styles.bg, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 18 }]}
      >
        <View style={styles.wrap}>
          <Image source={LOGO} style={styles.logo} />

          <Text style={styles.title}>Добро пожаловать</Text>
          <Text style={styles.sub}>Выберите удобный способ входа.</Text>

          <View style={styles.card}>
            <SocialBtn icon="logo-apple" label="Продолжить с Apple" variant="dark" onPress={onApple} />
            <SocialBtn icon="logo-google" label="Продолжить с Google" variant="light" onPress={onGoogle} />

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.or}>или</Text>
              <View style={styles.line} />
            </View>

            <Pressable
              onPress={() => safeNavigate("Login")}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.primaryText}>Войти по почте</Text>
            </Pressable>

            <Pressable
              onPress={() => safeNavigate("Register")}
              style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.secondaryText}>Создать аккаунт</Text>
            </Pressable>

            <Pressable onPress={continueAsGuest} style={{ marginTop: 14 }}>
              <Text style={styles.guest}>Продолжить без входа</Text>
            </Pressable>

            <Text style={styles.terms}>
              Нажимая “Продолжить”, вы принимаете условия и политику конфиденциальности.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },

  logo: { width: 250, height: 62, resizeMode: "contain", alignSelf: "center", marginBottom: 8 },

  title: { fontSize: 30, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { marginTop: 8, marginBottom: 14, fontSize: 14, color: colors.muted, textAlign: "center" },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 14,
  },

  socialBtn: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  socialDark: { backgroundColor: "#0B0B0B", borderColor: "#0B0B0B" },
  socialLight: { backgroundColor: colors.white, borderColor: colors.border },
  socialText: { fontSize: 14, fontWeight: "900", color: colors.text },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.muted, fontWeight: "800", fontSize: 12 },

  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  secondary: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryText: { color: colors.text, fontSize: 16, fontWeight: "900" },

  guest: { textAlign: "center", color: colors.navy, fontWeight: "900" },
  terms: { marginTop: 12, textAlign: "center", color: colors.muted, fontSize: 12, lineHeight: 16 },
});
