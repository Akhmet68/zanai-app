import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert, Platform, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { auth } from "../../app/firebase/firebase";
import { useAuth } from "../../app/auth/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const LOGO = require("../../../assets/zanai-logo.png");

function SocialBtn({
  icon,
  label,
  variant,
  onPress,
  loading,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  variant: "dark" | "light";
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const dark = variant === "dark";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.socialBtn,
        dark ? styles.socialDark : styles.socialLight,
        (pressed || loading) && { opacity: 0.92, transform: [{ scale: 0.995 }] },
        disabled && { opacity: 0.55 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={dark ? "#fff" : colors.text} />
      ) : (
        <Ionicons name={icon} size={20} color={dark ? "#fff" : colors.text} />
      )}
      <Text style={[styles.socialText, dark && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export default function ChooseAuthScreen() {
  const { continueAsGuest } = useAuth();
  const insets = useSafeAreaInsets();

  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: expoClientId,
      iosClientId,
      androidClientId,
      redirectUri,
      scopes: ["profile", "email"],
      responseType: AuthSession.ResponseType.IdToken,
      selectAccount: true,
    }
  );

  const googleReady = !!expoClientId || !!iosClientId || !!androidClientId;

  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;
      const idToken = (response as any)?.params?.id_token;
      if (!idToken) {
        Alert.alert("Google", "Не получили id_token. Проверь client_id и настройки OAuth.");
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } catch (e: any) {
        Alert.alert("Google", e?.message ?? "Не удалось войти через Google.");
      }
    })();
  }, [response]);

  const onApple = () => {
    Alert.alert(
      "Apple Sign-In",
      "В Expo Go Apple Sign-In обычно не доводится. Сделаем Dev Build/EAS — тогда подключим Apple на 100%."
    );
  };

  const onGoogle = async () => {
    if (!googleReady) {
      Alert.alert(
        "Google Sign-In",
        "Добавь env переменные client_id (EXPO_PUBLIC_GOOGLE_*_CLIENT_ID), потом перезапусти Expo."
      );
      return;
    }
    await promptAsync();
  };

  const GRAD = ["#0B1E5B", "#162A63", "#FFFFFF"] as const;

  return (
    <Screen contentStyle={{ paddingTop: 0 }} edges={["left", "right"]}>
      <LinearGradient
        colors={GRAD}
        locations={[0, 0.62, 1]}
        style={[styles.bg, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 18 }]}
      >
        <View style={styles.wrap}>
          <Image source={LOGO} style={styles.logo} />

          <Text style={styles.title}>Добро пожаловать</Text>
          <Text style={styles.sub}>Выберите удобный способ входа.</Text>

          <View style={styles.card}>
            <SocialBtn icon="logo-apple" label="Продолжить с Apple" variant="dark" onPress={onApple} />
            <SocialBtn
              icon="logo-google"
              label="Продолжить с Google"
              variant="light"
              onPress={onGoogle}
              disabled={!request}
            />

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.or}>или</Text>
              <View style={styles.line} />
            </View>

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

  guest: { textAlign: "center", color: colors.navy, fontWeight: "900" },
  terms: { marginTop: 12, textAlign: "center", color: colors.muted, fontSize: 12, lineHeight: 16 },
});
