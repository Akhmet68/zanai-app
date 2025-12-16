import React, { useMemo, useState } from "react";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

export default function ChangePasswordScreen() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const canSave = useMemo(() => {
    if (!oldPass || !newPass || !repeatPass) return false;
    if (newPass.length < 8) return false;
    if (newPass !== repeatPass) return false;
    if (newPass === oldPass) return false;
    return true;
  }, [oldPass, newPass, repeatPass]);

  const onSave = () => {
    if (!canSave) return;

    Alert.alert(
      "Готово",
      "Пароль обновим после подключения авторизации и сервера.",
      [{ text: "Ок" }]
    );
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <Header rightVariant="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text style={styles.title}>Изменить пароль</Text>
          <Text style={styles.sub}>
            Минимум 8 символов. Лучше: буквы + цифры.
          </Text>

          <View style={styles.card}>
            <Field
              label="Текущий пароль"
              value={oldPass}
              onChangeText={setOldPass}
              secureTextEntry={!showOld}
              rightIcon={showOld ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowOld((v) => !v)}
            />

            <View style={styles.divider} />

            <Field
              label="Новый пароль"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={!showNew}
              rightIcon={showNew ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowNew((v) => !v)}
              helper={
                newPass.length > 0 && newPass.length < 8
                  ? "Слишком короткий пароль (нужно 8+)"
                  : undefined
              }
              helperDanger={newPass.length > 0 && newPass.length < 8}
            />

            <View style={styles.divider} />

            <Field
              label="Повтори новый пароль"
              value={repeatPass}
              onChangeText={setRepeatPass}
              secureTextEntry={!showRepeat}
              rightIcon={showRepeat ? "eye-off-outline" : "eye-outline"}
              onPressRight={() => setShowRepeat((v) => !v)}
              helper={
                repeatPass.length > 0 && repeatPass !== newPass
                  ? "Пароли не совпадают"
                  : undefined
              }
              helperDanger={repeatPass.length > 0 && repeatPass !== newPass}
            />
          </View>

          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.btn,
              !canSave && { opacity: 0.45 },
              pressed && canSave && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.btnText}>Сохранить</Text>
          </Pressable>
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
}) {
  return (
    <View style={{ paddingVertical: 12 }}>
      <Text style={styles.fieldLabel}>{props.label}</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          secureTextEntry={props.secureTextEntry}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        {!!props.rightIcon && (
          <Pressable
            onPress={props.onPressRight}
            hitSlop={10}
            style={({ pressed }) => [
              styles.eyeBtn,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name={props.rightIcon} size={20} color={colors.text} />
          </Pressable>
        )}
      </View>

      {!!props.helper && (
        <Text
          style={[
            styles.helper,
            props.helperDanger && { color: "#B42318" },
          ]}
        >
          {props.helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    marginTop: 4,
  },
  sub: {
    paddingHorizontal: 16,
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
  },

  card: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  divider: { height: 1, backgroundColor: "#EEF0F3" },

  fieldLabel: { fontSize: 12, fontWeight: "900", color: colors.text },
  inputRow: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 16,
    height: 52,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  helper: { marginTop: 8, fontSize: 12, color: colors.muted },

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
});
