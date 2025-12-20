import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
type Lang = "RU" | "KZ";

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

type Settings = { lang: Lang; darkMode: boolean };

export default function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings>({ lang: "RU", darkMode: false });
  const lang = settings.lang;

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

  const onBuy = useCallback(() => {
    Alert.alert(
      t(lang, "Pro скоро", "Pro жақында"),
      t(
        lang,
        "Оплату подключим позже (Stripe/StoreKit/Google Billing). Сейчас это демо-экран.",
        "Төлемді кейін қосамыз (Stripe/StoreKit/Google Billing). Қазір бұл демо-экран."
      ),
      [{ text: "OK" }]
    );
  }, [lang]);

  const onRestore = useCallback(() => {
    Alert.alert(
      t(lang, "Восстановление", "Қалпына келтіру"),
      t(lang, "Сделаем позже.", "Кейін жасаймыз."),
      [{ text: "OK" }]
    );
  }, [lang]);

  return (
    <Screen contentStyle={{ paddingTop: 0, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: insets.top + 8 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.hBtn, { borderColor: theme.border, backgroundColor: theme.card }, pressed && { opacity: 0.85 }]}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </Pressable>

          <Text style={[styles.hTitle, { color: theme.text }]}>{t(lang, "Подписка", "Жазылым")}</Text>

          <View style={{ width: 44 }} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {t(lang, "Выбери план", "Тариф таңда")}
        </Text>
        <Text style={[styles.sub, { color: theme.muted }]}>
          {t(lang, "Free уже работает. Pro добавит больше возможностей.", "Free қазірдің өзінде жұмыс істейді. Pro — көбірек мүмкіндік береді.")}
        </Text>

        {/* Cards */}
        <View style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.planHead}>
            <View style={[styles.planIcon, { borderColor: theme.border, backgroundColor: settings.darkMode ? "#1B1B22" : "#F7F7F9" }]}>
              <Ionicons name="sparkles-outline" size={18} color={theme.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planTitle, { color: theme.text }]}>{t(lang, "Free", "Free")}</Text>
              <Text style={[styles.planPrice, { color: theme.muted }]}>{t(lang, "0 ₸ / мес", "0 ₸ / ай")}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#F5F7FF" }]}>
              <Text style={[styles.badgeText, { color: colors.navy }]}>{t(lang, "Текущий", "Ағымдағы")}</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Новости и статьи", "Жаңалықтар мен мақалалар")}</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Избранное (синхронизация)", "Таңдаулы (синхрондау)")}</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Чат + вложения", "Чат + тіркемелер")}</Text>
          </View>
        </View>

        <View style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.planHead}>
            <View style={[styles.planIcon, { borderColor: theme.border, backgroundColor: settings.darkMode ? "#1B1B22" : "#F7F7F9" }]}>
              <Ionicons name="rocket-outline" size={18} color={theme.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planTitle, { color: theme.text }]}>{t(lang, "Pro", "Pro")}</Text>
              <Text style={[styles.planPrice, { color: theme.muted }]}>{t(lang, "скоро", "жақында")}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#FFF7ED" }]}>
              <Text style={[styles.badgeText, { color: "#9A3412" }]}>{t(lang, "Beta", "Beta")}</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="star-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Больше запросов к AI", "AI сұраулары көбірек")}</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="star-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Продвинутые шаблоны документов", "Құжат үлгілері (Pro)")}</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="star-outline" size={18} color={theme.text} />
            <Text style={[styles.featureText, { color: theme.text }]}>{t(lang, "Приоритетные обновления", "Басым жаңартулар")}</Text>
          </View>

          <Pressable
            onPress={onBuy}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>{t(lang, "Подключить Pro", "Pro қосу")}</Text>
          </Pressable>

          <Pressable
            onPress={onRestore}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: theme.border, backgroundColor: theme.card },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              {t(lang, "Восстановить покупки", "Сатып алуларды қалпына келтіру")}
            </Text>
          </Pressable>

          <Text style={[styles.hint, { color: theme.muted }]}>
            {Platform.OS === "ios"
              ? t(lang, "Оплата будет через App Store.", "Төлем App Store арқылы болады.")
              : t(lang, "Оплата будет через Google Play.", "Төлем Google Play арқылы болады.")}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hTitle: { fontSize: 14, fontWeight: "900" },

  title: { paddingHorizontal: 16, marginTop: 10, fontSize: 32, fontWeight: "900" },
  sub: { paddingHorizontal: 16, marginTop: 6, fontSize: 13, lineHeight: 18 },

  planCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  planHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitle: { fontSize: 16, fontWeight: "900" },
  planPrice: { marginTop: 2, fontSize: 12, fontWeight: "800" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "900" },

  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  featureText: { fontSize: 13, fontWeight: "700" },

  primaryBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  secondaryBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "900" },

  hint: { marginTop: 10, fontSize: 12, fontWeight: "700" },
});
