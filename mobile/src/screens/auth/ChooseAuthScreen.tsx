import React from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

const LOGO = require("../../../assets/zanai-logo.png");

type SocialVariant = "apple" | "google";

function SocialBtn({
  variant,
  label,
  onPress,
}: {
  variant: SocialVariant;
  label: string;
  onPress: () => void;
}) {
  const isApple = variant === "apple";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        isApple ? styles.appleBtn : styles.googleBtn,
        pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] },
      ]}
    >
      <Ionicons
        name={isApple ? "logo-apple" : "logo-google"}
        size={20}
        color={isApple ? "#fff" : colors.text}
      />
      <Text style={[styles.socialText, isApple && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export default function ChooseAuthScreen() {
  const navigation = useNavigation<any>();
  const { setIsAuthed } = useAuth();
  const insets = useSafeAreaInsets();

  const onApple = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Apple", "Apple Sign-In доступен на iOS. На Android подключим Google.");
      return;
    }
    Alert.alert("Скоро", "Apple Sign-In подключим следующим шагом (через Dev Build).");
  };

  const onGoogle = () => {
    Alert.alert("Скоро", "Google Sign-In подключим следующим шагом (через Dev Build).");
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <LinearGradient
        colors={["#0B1E5B", "#1B2C63", "#FFFFFF"]}
        locations={[0, 0.55, 1]}
        style={[styles.bg, { paddingTop: insets.top + 14 }]}
      >
        <View style={styles.wrap}>
          <Image source={LOGO} style={styles.logo} />

          <Text style={styles.title}>Добро пожаловать</Text>
          <Text style={styles.sub}>
            Войдите через Apple/Google или продолжайте по почте.
          </Text>

          <SocialBtn variant="apple" label="Продолжить с Apple" onPress={onApple} />
          <SocialBtn variant="google" label="Продолжить с Google" onPress={onGoogle} />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>или</Text>
            <View style={styles.line} />
          </View>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.primaryText}>Войти по почте</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.secondaryText}>Создать аккаунт</Text>
          </Pressable>

          <Pressable onPress={() => setIsAuthed(true)} style={{ marginTop: 16 }}>
            <Text style={styles.guest}>Продолжить без входа</Text>
          </Pressable>

          <Text style={styles.terms}>
            Нажимая “Продолжить”, вы принимаете условия и политику конфиденциальности.
          </Text>
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },

  logo: {
    width: 240,
    height: 58,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
  },

  title: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  sub: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
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
  appleBtn: {
    backgroundColor: "#0B0B0B",
    borderColor: "#0B0B0B",
  },
  googleBtn: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  socialText: { fontSize: 14, fontWeight: "900", color: colors.text },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
  },
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

  guest: {
    textAlign: "center",
    color: colors.navy,
    fontWeight: "900",
  },

  terms: {
    marginTop: 14,
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
