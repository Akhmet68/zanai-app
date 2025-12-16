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
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

const LOGO = require("../../../assets/zanai-logo.png");

function SocialButton({
  icon,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.9 }]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.socialText}>{text}</Text>
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
    // ✅ временно (потом подключим бэк)
    setIsAuthed(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar: back + logo */}
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

          {/* Social */}
          <SocialButton
            icon="logo-apple"
            text="Apple арқылы тіркелу"
            onPress={() => Alert.alert("Скоро", "Apple Sign-In қосамыз (келесі қадам).")}
          />
          <SocialButton
            icon="logo-google"
            text="Google арқылы тіркелу"
            onPress={() => Alert.alert("Скоро", "Google Sign-In қосамыз (келесі қадам).")}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>немесе</Text>
            <View style={styles.orLine} />
          </View>

          {/* Form */}
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

          <View style={{ height: 18 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  logo: { height: 28, width: 150, resizeMode: "contain" },

  title: {
    fontSize: 28,
    fontWeight: "800",
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
  },

  socialBtn: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  socialText: { fontSize: 14, fontWeight: "900", color: colors.text },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
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
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
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
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  bottomText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.navy, fontWeight: "900" },
  guest: { color: colors.navy, fontWeight: "900", fontSize: 13 },
});
