import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();

  const [current, setCurrent] = useState("");
  const [nextPass, setNextPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSave = () => {
    if (!current || !nextPass || !confirm) {
      Alert.alert("Ошибка", "Заполните все поля.");
      return;
    }
    if (nextPass.length < 6) {
      Alert.alert("Ошибка", "Новый пароль должен быть минимум 6 символов.");
      return;
    }
    if (nextPass !== confirm) {
      Alert.alert("Ошибка", "Пароли не совпадают.");
      return;
    }

    Alert.alert("Готово", "Пароль сохранён (пока демо).");
    setCurrent("");
    setNextPass("");
    setConfirm("");
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <Header
        leftVariant="back"
        rightVariant="none"
        onPressLeft={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Изменить пароль</Text>
          <Text style={styles.subtitle}>
            Для безопасности используйте сложный пароль.
          </Text>

          {/* Current */}
          <View style={styles.field}>
            <TextInput
              value={current}
              onChangeText={setCurrent}
              placeholder="Текущий пароль"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showCurrent}
              style={[styles.input, { paddingRight: 48 }]}
            />
            <Pressable
              onPress={() => setShowCurrent((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={12}
            >
              <Ionicons
                name={showCurrent ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.muted}
              />
            </Pressable>
          </View>

          {/* New */}
          <View style={styles.field}>
            <TextInput
              value={nextPass}
              onChangeText={setNextPass}
              placeholder="Новый пароль"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showNext}
              style={[styles.input, { paddingRight: 48 }]}
            />
            <Pressable
              onPress={() => setShowNext((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={12}
            >
              <Ionicons
                name={showNext ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.muted}
              />
            </Pressable>
          </View>

          {/* Confirm */}
          <View style={styles.field}>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Повторите новый пароль"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showConfirm}
              style={[styles.input, { paddingRight: 48 }]}
            />
            <Pressable
              onPress={() => setShowConfirm((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={12}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <Pressable style={styles.primaryBtn} onPress={onSave}>
            <Text style={styles.primaryBtnText}>Сохранить</Text>
          </Pressable>

          <Text style={styles.hint}>
            (Это пока демо-экран. Позже подключим API.)
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, flex: 1 },
  title: { fontSize: 30, fontWeight: "900", color: colors.text },
  subtitle: { marginTop: 6, color: colors.muted, lineHeight: 18 },

  field: {
    position: "relative",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
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
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  hint: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
  },
});
