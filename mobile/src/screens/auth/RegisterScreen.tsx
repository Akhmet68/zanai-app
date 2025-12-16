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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { setIsAuthed } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполни имя, почту и пароль.");
      return;
    }
    setIsAuthed(true);
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
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

            <Text style={styles.title}>Tirkelu</Text>
            <Text style={styles.subtitle}>Жаңа аккаунт жасаңыз</Text>

            <SocialButton
              icon="logo-apple"
              text="Apple арқылы тіркелу"
              variant="dark"
              onPress={() => Alert.alert("Скоро", "Apple Sign-In қосамыз (Dev Build арқылы).")}
            />
            <SocialButton
              icon="logo-google"
              text="Google арқылы тіркелу"
              onPress={() => Alert.alert("Скоро", "Google Sign-In қосамыз (Dev Build арқылы).")}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>немесе</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.field}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Esiminiz"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Poshtanyz"
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
                placeholder="Qupiya soz"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPass}
                style={[styles.input, { paddingRight: 48 }]}
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

            <Pressable onPress={onRegister} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Akkount jasau</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={styles.bottomText}>
                Juiede barsýn ba? <Text style={styles.link}>kiru</Text>
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsAuthed(true)}
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
  logo: { height: 28, width: 165, resizeMode: "contain" },

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

  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.navy,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },

  bottomText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.navy, fontWeight: "900" },
  guest: { color: colors.navy, fontWeight: "900", fontSize: 13 },
});
