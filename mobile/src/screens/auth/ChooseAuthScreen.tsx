import React from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

const LOGO = require("../../../assets/zanai-logo.png");

function SocialBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.9 }]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

export default function ChooseAuthScreen() {
  const navigation = useNavigation<any>();
  const { setIsAuthed } = useAuth();

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <View style={styles.wrap}>
        <Image source={LOGO} style={styles.logo} />

        <Text style={styles.title}>Добро пожаловать</Text>
        <Text style={styles.sub}>
          Войдите через Apple/Google или продолжайте по почте.
        </Text>

        <SocialBtn
          icon="logo-apple"
          label="Продолжить с Apple"
          onPress={() => Alert.alert("Скоро", "Apple Sign-In подключим следующим шагом.")}
        />
        <SocialBtn
          icon="logo-google"
          label="Продолжить с Google"
          onPress={() => Alert.alert("Скоро", "Google Sign-In подключим следующим шагом.")}
        />

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>или</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryText}>Войти по почте</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.secondaryText}>Создать аккаунт</Text>
        </Pressable>

        <Pressable onPress={() => setIsAuthed(true)} style={{ marginTop: 16 }}>
          <Text style={styles.guest}>Продолжить без входа</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  logo: { width: 210, height: 50, resizeMode: "contain", alignSelf: "center" },

  title: {
    marginTop: 18,
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
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
});
