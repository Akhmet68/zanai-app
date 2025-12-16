import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import { fbResendVerification } from "../../app/firebase/authService";

export default function VerifyEmailScreen() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onIVerified = async () => {
    try {
      setLoading(true);

      // важно: сначала обновляем currentUser из Firebase
      await refreshUser();

      // user из контекста мог обновиться чуть позже, поэтому читаем флаг безопасно
      const verifiedNow = !!user?.emailVerified;

      if (verifiedNow) {
        Alert.alert("Готово!", "Почта подтверждена. Теперь можно войти в систему.");
      } else {
        Alert.alert(
          "Ещё не подтверждено",
          "Если ты уже нажал ссылку в письме — подожди 5–10 сек и нажми ещё раз."
        );
      }
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось проверить подтверждение.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      setResending(true);
      await fbResendVerification();
      Alert.alert("Готово", "Письмо отправлено повторно.");
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить письмо снова.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>Подтверди почту</Text>
        <Text style={styles.sub}>
          Мы отправили письмо со ссылкой подтверждения.
          {"\n"}Открой почту и нажми на ссылку, затем вернись сюда.
        </Text>

        <Pressable
          onPress={onIVerified}
          disabled={loading}
          style={({ pressed }) => [
            styles.primary,
            (pressed || loading) && { opacity: 0.92 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Я подтвердил — проверить</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onResend}
          disabled={resending}
          style={({ pressed }) => [
            styles.secondary,
            (pressed || resending) && { opacity: 0.92 },
          ]}
        >
          {resending ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.secondaryText}>Отправить письмо снова</Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { marginTop: 10, color: colors.muted, textAlign: "center", lineHeight: 20 },

  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },

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
  secondaryText: { color: colors.text, fontWeight: "900", fontSize: 16 },
});