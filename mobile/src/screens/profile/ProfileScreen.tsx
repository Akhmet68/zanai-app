import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  ScrollView,
  Image,
  Linking,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { getTabBarSpace } from "../../ui/CustomTabBar";

const LOGO = require("../../../assets/zanai-logo.png");

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

function hapticLight() {
  Haptics.selectionAsync?.().catch?.(() => {});
}

function Row({ icon, title, subtitle, right, onPress, danger, disabled }: RowProps) {
  return (
    <Pressable
      onPress={() => {
        if (disabled || !onPress) return;
        hapticLight();
        onPress();
      }}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.row,
        (disabled || !onPress) && { opacity: 0.55 },
        pressed && onPress ? { transform: [{ scale: 0.985 }], opacity: 0.85 } : null,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          danger && { borderColor: "#F1B5B5", backgroundColor: "#FFF5F5" },
        ]}
      >
        <Ionicons name={icon} size={20} color={danger ? "#B42318" : colors.text} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: "#B42318" }]}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.rowRight}>
        {right ?? <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
      </View>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.quickCard,
        pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
      ]}
    >
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.text} />
      </View>
      <Text style={styles.quickText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const tabSpace = getTabBarSpace(insets.bottom);

  const [name, setName] = useState("Имя Фамилия");
  const [email] = useState("user@email.com");
  const [plan] = useState<"Free" | "Pro">("Free");
  const [lang, setLang] = useState<"RU" | "KZ">("RU");

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const completeness = useMemo(() => {
    let score = 0;
    if (name.trim().length >= 3) score += 0.25;
    if (email.includes("@")) score += 0.25;
    if (avatarUri) score += 0.25;
    if (biometric || notifications || darkMode) score += 0.25;
    return Math.min(1, score);
  }, [name, email, avatarUri, biometric, notifications, darkMode]);

  const percent = Math.round(completeness * 100);

  const pickAvatar = async () => {
    hapticLight();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Доступ", "Нужен доступ к галерее, чтобы выбрать аватар.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      setAvatarUri(res.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    Alert.alert("Аватар", "Удалить фото?", [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: () => setAvatarUri(null) },
    ]);
  };

  const onEditProfile = () => {
    hapticLight();
    Alert.alert("Профиль", "Тут откроем редактирование профиля (MVP).", [
      { text: "Ок" },
      { text: "Сделать имя “ZanAI User” (demo)", onPress: () => setName("ZanAI User") },
    ]);
  };

  const onLogout = () => {
    Alert.alert("Выход", "Выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: () => Alert.alert("Ок", "Реальный logout сделаем после auth."),
      },
    ]);
  };

  const onSupport = () => {
    const emailTo = "support@zanai.app";
    Linking.openURL(`mailto:${emailTo}?subject=ZanAI%20Support`).catch(() =>
      Alert.alert("Ошибка", "Не удалось открыть почту.")
    );
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabSpace + 24,
        }}
      >
        <LinearGradient
          colors={["#0B1E5B", "#1B2C63", "#FFFFFF"]}
          locations={[0, 0.55, 1]}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Image source={LOGO} style={styles.heroLogo} />

            <View style={styles.heroRight}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  setLang((v) => (v === "RU" ? "KZ" : "RU"));
                }}
                style={({ pressed }) => [styles.langBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.langText}>{lang}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.muted} />
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Поиск", "Подключим поиск позже 🙂")}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="search-outline" size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.title}>Профиль</Text>

          <View style={styles.profileCard}>
            <View style={styles.userRow}>
              <Pressable
                onPress={pickAvatar}
                onLongPress={avatarUri ? removeAvatar : undefined}
                style={({ pressed }) => [
                  styles.avatar,
                  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
                ]}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={26} color={colors.muted} />
                )}

                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={14} color="#111" />
                </View>
              </Pressable>

              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>{email}</Text>

                <View style={styles.badgesRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{plan}</Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: "#F5F7FF" }]}>
                    <Text style={[styles.badgeText, { color: colors.navy }]}>KZ / RU</Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={onEditProfile}
                style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="create-outline" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 14 }}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Заполненность профиля</Text>
                <Text style={styles.progressValue}>{percent}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>

              <Text style={styles.progressHint}>
                Добавь аватар и включи биометрию — профиль будет выглядеть “профи”.
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            <QuickAction icon="diamond-outline" label="Подписка" onPress={() => navigation.navigate("Subscription")} />
            <QuickAction icon="time-outline" label="История" onPress={() => navigation.navigate("Cases")} />
            <QuickAction icon="bookmark-outline" label="Избранное" onPress={() => navigation.navigate("Favorites")} />
            <QuickAction icon="help-circle-outline" label="Помощь" onPress={onSupport} />
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Настройки</Text>

          <Row icon="diamond-outline" title="Подписка" subtitle="Оформить / управлять" onPress={() => navigation.navigate("Subscription")} />

          <View style={styles.divider} />

          <Row
            icon="language-outline"
            title="Язык"
            subtitle={lang === "RU" ? "Русский (RU)" : "Қазақша (KZ)"}
            onPress={() => Alert.alert("Язык", "Сделаем экран выбора языка. Сейчас переключение вверху.")}
          />

          <View style={styles.divider} />

          <Row
            icon="notifications-outline"
            title="Уведомления"
            subtitle="Новости и напоминания"
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => {
                  hapticLight();
                  setNotifications(v);
                }}
                trackColor={{ false: "#E5E7EB", true: "#BBD1FF" }}
                thumbColor={notifications ? colors.navy : "#9CA3AF"}
              />
            }
            onPress={() => setNotifications((v) => !v)}
          />

          <View style={styles.divider} />

          <Row
            icon="moon-outline"
            title="Тёмная тема"
            subtitle="Пока демо-переключатель"
            right={
              <Switch
                value={darkMode}
                onValueChange={(v) => {
                  hapticLight();
                  setDarkMode(v);
                }}
                trackColor={{ false: "#E5E7EB", true: "#BBD1FF" }}
                thumbColor={darkMode ? colors.navy : "#9CA3AF"}
              />
            }
            onPress={() => setDarkMode((v) => !v)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Безопасность</Text>

          <Row icon="key-outline" title="Изменить пароль" subtitle="Рекомендуем раз в 3 месяца" onPress={() => navigation.navigate("ChangePassword")} />

          <View style={styles.divider} />

          <Row icon="phone-portrait-outline" title="Устройства" subtitle="Список активных устройств" onPress={() => navigation.navigate("Devices")} />

          <View style={styles.divider} />

          <Row
            icon="finger-print-outline"
            title={Platform.OS === "ios" ? "Face ID / Touch ID" : "Биометрия"}
            subtitle="Быстрый вход"
            right={
              <Switch
                value={biometric}
                onValueChange={(v) => {
                  hapticLight();
                  setBiometric(v);
                }}
                trackColor={{ false: "#E5E7EB", true: "#BBD1FF" }}
                thumbColor={biometric ? colors.navy : "#9CA3AF"}
              />
            }
            onPress={() => setBiometric((v) => !v)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Помощь</Text>

          <Row icon="chatbubble-ellipses-outline" title="Поддержка" subtitle="Написать в поддержку" onPress={onSupport} />

          <View style={styles.divider} />

          <Row icon="information-circle-outline" title="О приложении" subtitle="Версия 0.1 (MVP)" onPress={() => Alert.alert("ZanAI", "Сюда добавим экран About + политики + условия.")} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Опасная зона</Text>

          <Row icon="log-out-outline" title="Выйти" subtitle="Завершить сессию" onPress={onLogout} danger />

          <View style={styles.divider} />

          <Row
            icon="trash-outline"
            title="Удалить аккаунт"
            subtitle="Пока недоступно (после авторизации)"
            onPress={() => Alert.alert("Недоступно", "Удаление аккаунта включим после авторизации и бэка.")}
            danger
            disabled
          />
        </View>

        <Text style={styles.footerText}>ZanAI • MVP</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  heroLogo: {
    height: 32,
    width: 160,
    resizeMode: "contain",
  },
  heroRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  langText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    marginTop: 6,
    marginBottom: 10,
  },

  profileCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 14,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  userName: { fontSize: 16, fontWeight: "900", color: colors.text },
  userEmail: { marginTop: 2, fontSize: 13, color: colors.muted },

  badgesRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F2F2F2",
  },
  badgeText: { fontSize: 12, fontWeight: "900", color: colors.text },

  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontWeight: "900", color: colors.text },
  progressValue: { fontSize: 12, fontWeight: "900", color: colors.navy },

  progressTrack: {
    marginTop: 8,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#EEF0F3",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.navy },
  progressHint: { marginTop: 8, fontSize: 12, color: colors.muted, lineHeight: 16 },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  quickCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickText: { fontSize: 12, fontWeight: "900", color: colors.text },

  card: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: 10 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F9",
  },
  rowTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  rowSubtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
  rowRight: { marginLeft: 8 },

  divider: { height: 1, backgroundColor: "#EEF0F3" },

  footerText: { marginTop: 12, marginBottom: 18, textAlign: "center", color: colors.muted, fontSize: 12 },
});
