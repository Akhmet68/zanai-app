import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";

const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
type Lang = "RU" | "KZ";
type Settings = { lang: Lang; darkMode: boolean };

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, guest } = useAuth();

  const [settings, setSettings] = useState<Settings>({ lang: "RU", darkMode: false });
  const lang = settings.lang;

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_PROFILE_SETTINGS);
        if (raw) {
          const s = JSON.parse(raw) as Partial<{ lang: Lang; darkMode: boolean }>;
          setSettings((p) => ({
            lang: (s.lang ?? p.lang) as Lang,
            darkMode: typeof s.darkMode === "boolean" ? s.darkMode : p.darkMode,
          }));
        }
      } catch {}
    })();
  }, []);

  const theme = useMemo(() => {
    const darkMode = settings.darkMode;
    return {
      bg: darkMode ? "#0B0B0D" : colors.white,
      card: darkMode ? "#111115" : colors.white,
      border: darkMode ? "rgba(255,255,255,0.12)" : colors.border,
      text: darkMode ? "#F8FAFC" : colors.text,
      muted: darkMode ? "#A1A1AA" : colors.muted,
      inputBg: darkMode ? "#0F0F14" : colors.white,
    };
  }, [settings.darkMode]);

  const canSave = useMemo(() => {
    if (!oldPass || !newPass || !repeatPass) return false;
    if (newPass.length < 8) return false;
    if (newPass !== repeatPass) return false;
    if (newPass === oldPass) return false;
    return true;
  }, [oldPass, newPass, repeatPass]);

  const strength = useMemo(() => {
    // лёгкая оценка, без тяжёлых вычислений
    let s = 0;
    if (newPass.length >= 8) s += 1;
    if (/[A-ZА-Я]/.test(newPass)) s += 1;
    if (/[0-9]/.test(newPass)) s += 1;
    if (/[^a-zA-Z0-9а-яА-Я]/.test(newPass)) s += 1;
    return Math.min(4, s);
  }, [newPass]);

  const strengthLabel = useMemo(() => {
    if (!newPass) return "";
    if (strength <= 1) return t(lang, "Слабый пароль", "Әлсіз құпиясөз");
    if (strength === 2) return t(lang, "Нормальный", "Жақсы");
    if (strength === 3) return t(lang, "Сильный", "Күшті");
    return t(lang, "Очень сильный", "Өте күшті");
  }, [strength, lang, newPass]);

  const onSave = useCallback(async () => {
    if (!canSave || saving) return;

    if (!user?.uid || guest) {
      Alert.alert(t(lang, "Недоступно", "Қолжетімсіз"), t(lang, "Нужно войти в аккаунт.", "Аккаунтқа кіру керек."));
      return;
    }

    const fbUser: any = user;
    const email = fbUser?.email;

    if (!email) {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Нет email у аккаунта.", "Аккаунтта email жоқ."));
      return;
    }

    setSaving(true);
    try {
      // Достаём модульно, чтобы не зависеть от типов/версий
      const authAny: any = require("firebase/auth");

      const credential = authAny.EmailAuthProvider.credential(email, oldPass);
      await authAny.reauthenticateWithCredential(fbUser, credential);
      await authAny.updatePassword(fbUser, newPass);

      setOldPass("");
      setNewPass("");
      setRepeatPass("");

      Alert.alert(t(lang, "Готово ✅", "Дайын ✅"), t(lang, "Пароль обновлён.", "Құпиясөз жаңартылды."));
      navigation.goBack();
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      Alert.alert(
        t(lang, "Ошибка", "Қате"),
        msg.includes("auth/wrong-password")
          ? t(lang, "Текущий пароль неверный.", "Ағымдағы құпиясөз қате.")
          : msg.includes("auth/requires-recent-login")
            ? t(lang, "Нужен повторный вход. Выйди и зайди снова.", "Қайта кіру керек. Шығып, қайта кір.")
            : t(lang, "Не удалось обновить пароль.", "Құпиясөзді жаңарту мүмкін болмады.")
      );
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, user, guest, oldPass, newPass, lang, navigation]);

  return (
    <Screen contentStyle={{ paddingTop: 0, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, paddingTop: insets.top + 8 }}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.hBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && { opacity: 0.85 },
              ]}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </Pressable>

            <Text style={[styles.hTitle, { color: theme.text }]}>{t(lang, "Изменить пароль", "Құпиясөзді өзгерту")}</Text>
            <View style={{ width: 44 }} />
          </View>

          <Text style={[styles.sub, { color: theme.muted }]}>
            {t(lang, "Минимум 8 символов. Лучше: буквы + цифры + символ.", "Кемі 8 таңба. Жақсысы: әріп + сан + белгі.")}
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Field
              label={t(lang, "Текущий пароль", "Ағымдағы құпиясөз")}
              value={oldPass}
              onChangeText={setOldPass}
              secureTextEntry={!showOld}
              rightIcon={showOld ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowOld((v) => !v)}
              theme={theme}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Field
              label={t(lang, "Новый пароль", "Жаңа құпиясөз")}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={!showNew}
              rightIcon={showNew ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowNew((v) => !v)}
              helper={
                newPass.length > 0 && newPass.length < 8
                  ? t(lang, "Слишком короткий пароль (нужно 8+)", "Тым қысқа (8+ керек)")
                  : strengthLabel || undefined
              }
              helperDanger={newPass.length > 0 && newPass.length < 8}
              theme={theme}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Field
              label={t(lang, "Повтори новый пароль", "Жаңа құпиясөзді қайтала")}
              value={repeatPass}
              onChangeText={setRepeatPass}
              secureTextEntry={!showRepeat}
              rightIcon={showRepeat ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowRepeat((v) => !v)}
              helper={
                repeatPass.length > 0 && repeatPass !== newPass
                  ? t(lang, "Пароли не совпадают", "Құпиясөздер сәйкес емес")
                  : undefined
              }
              helperDanger={repeatPass.length > 0 && repeatPass !== newPass}
              theme={theme}
            />
          </View>

          <Pressable
            onPress={onSave}
            disabled={!canSave || saving}
            style={({ pressed }) => [
              styles.btn,
              (!canSave || saving) && { opacity: 0.45 },
              pressed && canSave && !saving && { opacity: 0.9 },
            ]}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t(lang, "Сохранить", "Сақтау")}</Text>}
          </Pressable>

          {guest ? (
            <Text style={[styles.note, { color: theme.muted }]}>
              {t(lang, "Гостевой режим: смена пароля недоступна.", "Қонақ режимі: құпиясөзді өзгерту қолжетімсіз.")}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPressRight?: () => void;
  helper?: string;
  helperDanger?: boolean;
  theme: { text: string; muted: string; border: string; inputBg: string };
}) {
  const { theme } = props;

  return (
    <View style={{ paddingVertical: 12 }}>
      <Text style={[styles.fieldLabel, { color: theme.text }]}>{props.label}</Text>

      <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          secureTextEntry={props.secureTextEntry}
          placeholder="••••••••"
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {!!props.rightIcon && (
          <Pressable onPress={props.onPressRight} hitSlop={10} style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.75 }]}>
            <Ionicons name={props.rightIcon} size={20} color={theme.text} />
          </Pressable>
        )}
      </View>

      {!!props.helper && (
        <Text style={[styles.helper, { color: props.helperDanger ? "#B42318" : theme.muted }]}>
          {props.helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hBtn: { width: 44, height: 44, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hTitle: { fontSize: 16, fontWeight: "900" },

  sub: { paddingHorizontal: 16, marginTop: 8, fontSize: 13, lineHeight: 18, fontWeight: "700" },

  card: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  divider: { height: 1 },

  fieldLabel: { fontSize: 12, fontWeight: "900" },
  inputRow: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 16,
    height: 52,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
  eyeBtn: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  helper: { marginTop: 8, fontSize: 12, fontWeight: "700" },

  btn: {
    marginTop: 14,
    marginHorizontal: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  note: { paddingHorizontal: 16, marginTop: 10, fontSize: 12, fontWeight: "700" },
});
