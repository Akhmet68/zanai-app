import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
type Lang = "RU" | "KZ";
type Settings = { lang: Lang; darkMode: boolean };

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

type Session = {
  id: string;
  device: string;
  os: string;
  lastActive: string;
  current?: boolean;
};

const mockSessions: Session[] = [
  { id: "s1", device: "iPhone 14", os: "iOS", lastActive: "только что", current: true },
  { id: "s2", device: "Samsung A54", os: "Android", lastActive: "2 дня назад" },
  { id: "s3", device: "MacBook", os: "Web", lastActive: "7 дней назад" },
];

export default function DevicesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings>({ lang: "RU", darkMode: false });
  const lang = settings.lang;

  const [sessions, setSessions] = useState<Session[]>(mockSessions);

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
    };
  }, [settings.darkMode]);

  const revoke = useCallback((id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s || s.current) return;

    Alert.alert(
      t(lang, "Отключить устройство", "Құрылғыны өшіру"),
      `${s.device} • ${s.os}\n${t(lang, "Сессия будет завершена.", "Сессия аяқталады.")}`,
      [
        { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
        {
          text: t(lang, "Отключить", "Өшіру"),
          style: "destructive",
          onPress: () => setSessions((p) => p.filter((x) => x.id !== id)),
        },
      ]
    );
  }, [lang, sessions]);

  const signOutAll = useCallback(() => {
    Alert.alert(
      t(lang, "Завершить другие сессии", "Басқа сессияларды аяқтау"),
      t(lang, "Сделаем на сервере чуть позже. Сейчас демо.", "Мұны серверде кейін қосамыз. Қазір демо."),
      [{ text: "OK" }]
    );
  }, [lang]);

  return (
    <Screen contentStyle={{ paddingTop: 0, backgroundColor: theme.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.bg }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.hBtn,
            { borderColor: theme.border, backgroundColor: theme.card },
            pressed && { opacity: 0.85 },
          ]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>

        <Text style={[styles.hTitle, { color: theme.text }]}>{t(lang, "Устройства", "Құрылғылар")}</Text>

        <Pressable
          onPress={signOutAll}
          style={({ pressed }) => [
            styles.hBtn,
            { borderColor: theme.border, backgroundColor: theme.card },
            pressed && { opacity: 0.85 },
          ]}
          hitSlop={10}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      <Text style={[styles.sub, { color: theme.muted }]}>
        {t(lang, "Активные сессии аккаунта (демо).", "Аккаунттың белсенді сессиялары (демо).")}
      </Text>

      <FlatList
        data={sessions}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={16}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.icon, { borderColor: theme.border, backgroundColor: settings.darkMode ? "#1B1B22" : "#F7F7F9" }]}>
              <Ionicons
                name={item.os === "iOS" ? "logo-apple" : item.os === "Android" ? "logo-android" : "laptop-outline"}
                size={18}
                color={theme.text}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                  {item.device}
                </Text>
                {item.current ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t(lang, "Это устройство", "Осы құрылғы")}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.meta, { color: theme.muted }]}>
                {item.os} • {t(lang, "последняя активность", "соңғы белсенділік")}: {item.lastActive}
              </Text>
            </View>

            {!item.current && (
              <Pressable
                onPress={() => revoke(item.id)}
                style={({ pressed }) => [styles.kickBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="close-circle-outline" size={22} color="#B42318" />
              </Pressable>
            )}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hBtn: { width: 44, height: 44, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hTitle: { fontSize: 18, fontWeight: "900" },

  sub: { paddingHorizontal: 16, marginBottom: 12, fontSize: 12, fontWeight: "700" },

  card: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  title: { fontSize: 14, fontWeight: "900" },
  meta: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  badge: { backgroundColor: "#F5F7FF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: colors.navy, fontSize: 11, fontWeight: "900" },

  kickBtn: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
