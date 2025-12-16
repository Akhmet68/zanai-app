import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import { fbResendVerification } from "../../app/firebase/authService";

export default function VerifyEmailScreen() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const onIVerified = async () => {
    try {
      setLoading(true);
      await refreshUser();
      if (!user?.emailVerified) {
        Alert.alert("Ещё не подтверждено", "Если ты уже нажал ссылку в письме — подожди 5–10 сек и попробуй ещё раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    await fbResendVerification();
    Alert.alert("Готово", "Письмо отправлено повторно.");
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>Подтверди почту</Text>
        <Text style={styles.sub}>
          Мы отправили письмо со ссылкой подтверждения.
          {"\n"}Открой почту и нажми на ссылку, затем вернись сюда.
        </Text>

        <Pressable onPress={onIVerified} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.92 }]}>
          <Text style={styles.primaryText}>{loading ? "Проверяем..." : "Я подтвердил — проверить"}</Text>
        </Pressable>

        <Pressable onPress={onResend} style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.92 }]}>
          <Text style={styles.secondaryText}>Отправить письмо снова</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { marginTop: 10, color: colors.muted, textAlign: "center", lineHeight: 20 },
  primary: { height: 56, borderRadius: 18, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", marginTop: 16 },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondary: { height: 56, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", marginTop: 10 },
  secondaryText: { color: colors.text, fontWeight: "900", fontSize: 16 },
});
