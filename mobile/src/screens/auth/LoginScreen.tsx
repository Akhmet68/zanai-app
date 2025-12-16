import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import { fbLogin, fbResendVerification } from "../../app/firebase/authService";

const LOGO = require("../../../assets/zanai-logo.png");

function SocialButton({
  icon,
  text,
  onPress,
  variant = "light",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  variant?: "light" | "dark";
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
      <Text style={[styles.socialText, dark && { color: "#fff" }]}>{text}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { continueAsGuest, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const e = email.trim();
    const p = password.trim();

    if (!e || !p) return Alert.alert("Ошибка", "Заполни почту и пароль.");
    if (!e.includes("@")) return Alert.alert("Ошибка", "Почта выглядит некорректно.");
    if (p.length < 6) return Alert.alert("Ошибка", "Пароль минимум 6 символов.");

    try {
      setLoading(true);

      const user = await fbLogin(e, p);

      // ⚠️ После клика по ссылке подтверждения Firebase НЕ обновляет user в приложении автоматически.
      // Нужно принудительно обновить currentUser (reload), иначе emailVerified останется false.
      await refreshUser();

      // Важно: user из fbLogin может быть "старым" (emailVerified=false) до reload.
      // Поэтому используем актуальное значение из auth.currentUser внутри refreshUser.
      // Но тут уже можем ориентироваться на user из fbLogin как на первичный сигнал.
      if (!user.emailVerified) {
        Alert.alert(
          "Подтверди почту",
          "Мы отправили письмо со ссылкой подтверждения. Открой почту и нажми на ссылку, затем вернись сюда и нажми “Жүйеге кіру” снова.\n\nЕсли уже подтвердил — нажми “Я подтвердил” на следующем экране.",
          [
            { text: "Ок", onPress: () => navigation.navigate("VerifyEmail") },
            {
              text: "Отправить снова",
              onPress: async () => {
                try {
                  await fbResendVerification();
                  Alert.alert("Готово", "Письмо отправлено повторно.");
                } catch (err: any) {
                  Alert.alert("Ошибка", err?.message ?? "Не удалось отправить письмо снова.");
                }
              },
            },
          ]
        );
        return;
      }

      // ✅ Если подтверждено — RootNavigator сам переведет в Main, потому что isAuthed станет true
      // (через onAuthStateChanged + emailVerified после reload).
    } catch (err: any) {
      Alert.alert("Ошибка входа", err?.message ?? "Не удалось войти.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.white }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 18,
              paddingHorizontal: 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={28} color={colors.text} />
              </Pressable>
              <Image source={LOGO} style={styles.logo} />
            </View>

            <View style={{ height: 10 }} />

            <Text style={styles.title}>Кіру</Text>
            <Text style={styles.subtitle}>
              Пошта арқылы кіріңіз (Google/Apple кейін қосамыз)
            </Text>

            <SocialButton
              icon="logo-apple"
              text="Apple арқылы кіру"
              variant="dark"
              onPress={() => Alert.alert("Кейін", "Apple Sign-In Dev Build арқылы қосамыз.")}
            />
            <SocialButton
              icon="logo-google"
              text="Google арқылы кіру"
              onPress={() => Alert.alert("Кейін", "Google Sign-In Dev Build арқылы қосамыз.")}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>немесе</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.field}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Поштаңыз (email)"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Құпия сөз"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPass}
                style={[styles.input, { paddingRight: 52 }]}
              />
              <Pressable
                onPress={() => setShowPass((v) => !v)}
                hitSlop={12}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => Alert.alert("Кейін", "Құпия сөзді қалпына келтіруді кейін қосамыз.")}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Құпия сөзді қалпына келтіру</Text>
            </Pressable>

            <Pressable
              onPress={onLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || loading) && { opacity: 0.92 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Жүйеге кіру</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={styles.bottomText}>
                Аккаунт жоқ па? <Text style={styles.link}>Тіркелу</Text>
              </Text>
            </Pressable>

            <Pressable
              onPress={continueAsGuest}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={styles.guest}>Кірусіз жалғастыру</Text>
            </Pressable>

            <View style={{ height: 16 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { height: 44, justifyContent: "center", alignItems: "center" },
  backBtn: {
    position: "absolute",
    left: 0,
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: { height: 30, width: 175, resizeMode: "contain" },

  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: colors.text,
    marginBottom: 6,
    marginTop: 6,
  },
  subtitle: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },

  socialBtn: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  socialLight: { borderColor: colors.border, backgroundColor: colors.white },
  socialDark: { borderColor: "#0B0B0B", backgroundColor: "#0B0B0B" },
  socialText: { fontSize: 14, fontWeight: "900", color: colors.text },

  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 12, color: colors.muted, fontWeight: "800" },

  field: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  input: { height: 56, paddingHorizontal: 16, fontSize: 16, color: colors.text },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },

  forgotBtn: { alignItems: "center", marginTop: 6, marginBottom: 16 },
  forgotText: { fontSize: 13, color: colors.muted },

  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },

  bottomText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.navy, fontWeight: "900" },
  guest: { color: colors.navy, fontWeight: "900", fontSize: 13 },
});