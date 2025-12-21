import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Modal,
  TextInput,
  Share,
  LayoutAnimation,
  UIManager,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { getTabBarSpace } from "../../ui/CustomTabBar";
import { useAuth } from "../../app/auth/AuthContext";
import { db } from "../../app/firebase/firebase";
import { uploadUriToStorage } from "../../app/firebase/storageService";

const LOGO = require("../../../assets/zanai-logo.png");

// --- AsyncStorage keys ---
const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
const KEY_PROFILE_AVATAR = "zanai:profile:avatar";
const KEY_FAVORITES = "zanai:favorites";
const KEY_FAVORITES_ITEMS = "zanai:favorites_items";

type Lang = "RU" | "KZ";

type UserProfileDoc = {
  displayName?: string;
  email?: string;
  plan?: string;
  avatarUrl?: string;
  lang?: Lang;
};

type FavoritePreview = {
  id: string;
  titleRU: string;
  titleKZ: string;
  subtitleRU?: string;
  subtitleKZ?: string;
  source?: string;
  createdAtISO?: string;
  url?: string;
};

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function hapticLight() {
  // безопасно, без крэшей на девайсах без haptics
  Haptics.selectionAsync?.().catch?.(() => {});
}

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Row = React.memo(function Row({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
  disabled,
}: RowProps) {
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
      <View style={[styles.rowIcon, danger && { borderColor: "#F1B5B5", backgroundColor: "#FFF5F5" }]}>
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
});

const QuickAction = React.memo(function QuickAction({
  icon,
  label,
  onPress,
  bg,
  border,
  textColor,
  softBg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  bg: string;
  border: string;
  textColor: string;
  softBg: string;
}) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.quickCard,
        { backgroundColor: bg, borderColor: border },
        pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: softBg, borderColor: border }]}>
        <Ionicons name={icon} size={20} color={textColor} />
      </View>
      <Text style={[styles.quickText, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const tabSpace = getTabBarSpace(insets.bottom);

  const { user, guest, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfileDoc | null>(null);

  const [lang, setLang] = useState<Lang>("RU");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // избранные новости
  const [favorites, setFavorites] = useState<FavoritePreview[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // edit name modal
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");

  // --- Theme ---
  const theme = useMemo(() => {
    const bg = darkMode ? "#0B0B0D" : colors.white;
    const card = darkMode ? "#111115" : colors.white;
    const border = darkMode ? "rgba(255,255,255,0.12)" : colors.border;
    const text = darkMode ? "#F8FAFC" : colors.text;
    const muted = darkMode ? "#A1A1AA" : colors.muted;
    const soft = darkMode ? "#1B1B22" : "#F7F7F9";

    // ВАЖНО: LinearGradient.colors требует tuple (минимум 2 цвета)
    const heroGrad: readonly [string, string, string] = darkMode
      ? ["#0B1E5B", "#111115", "#0B0B0D"]
      : ["#0B1E5B", "#1B2C63", "#FFFFFF"];

    return { bg, card, border, text, muted, soft, heroGrad };
  }, [darkMode]);

  // --- Safe navigate helper (чтобы не ловить NAVIGATE warning) ---
  const routeNamesRef = useRef<Set<string>>(new Set());

  const rebuildRouteNames = useCallback(() => {
    try {
      const state = navigation.getState?.();
      const names = new Set<string>();

      const walk = (s: any) => {
        if (!s?.routes) return;
        for (const r of s.routes) {
          if (r?.name) names.add(r.name);
          if (r?.state) walk(r.state);
        }
      };

      walk(state);
      routeNamesRef.current = names;
    } catch {
      // если что — просто не блокируем навигацию
      routeNamesRef.current = new Set();
    }
  }, [navigation]);

  useEffect(() => {
    rebuildRouteNames();
    const unsub = navigation.addListener?.("state", rebuildRouteNames);
    return unsub;
  }, [navigation, rebuildRouteNames]);

  const navigateSafe = useCallback(
    (name: string, params?: any) => {
      const names = routeNamesRef.current;
      // если не смогли собрать state — не мешаем
      if (names.size > 0 && !names.has(name)) {
        Alert.alert(
          t(lang, "Экран не подключен", "Экран қосылмаған"),
          t(
            lang,
            `Навигация на "${name}" не настроена. Добавь экран в navigator.`,
            `Навигация "${name}" бапталмаған. Экранды navigator-ға қос.`
          )
        );
        return;
      }
      navigation.navigate(name, params);
    },
    [navigation, lang]
  );

  // --- Firestore profile ---
  useEffect(() => {
    if (!user?.uid || guest) {
      setProfile(null);
      return;
    }
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfileDoc) : null);
    });
  }, [user?.uid, guest]);

  // --- Load settings (persisted) ---
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_PROFILE_SETTINGS);
        if (raw) {
          const s = JSON.parse(raw) as Partial<{
            lang: Lang;
            notifications: boolean;
            darkMode: boolean;
            biometric: boolean;
          }>;
          if (s.lang) setLang(s.lang);
          if (typeof s.notifications === "boolean") setNotifications(s.notifications);
          if (typeof s.darkMode === "boolean") setDarkMode(s.darkMode);
          if (typeof s.biometric === "boolean") setBiometric(s.biometric);
        }

        const av = await AsyncStorage.getItem(KEY_PROFILE_AVATAR);
        if (av) setAvatarUri(av);
      } catch {}
    })();
  }, []);

  // --- Save settings ---
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          KEY_PROFILE_SETTINGS,
          JSON.stringify({ lang, notifications, darkMode, biometric })
        );
      } catch {}
    })();
  }, [lang, notifications, darkMode, biometric]);

  // --- Favorites loader (on focus) ---
  const loadFavorites = useCallback(async () => {
    try {
      const mapRaw = await AsyncStorage.getItem(KEY_FAVORITES);
      const itemsRaw = await AsyncStorage.getItem(KEY_FAVORITES_ITEMS);

      const favMap = mapRaw ? (JSON.parse(mapRaw) as Record<string, boolean>) : {};
      const ids = Object.keys(favMap).filter((k) => favMap[k]);
      setFavoritesCount(ids.length);

      const items = itemsRaw ? (JSON.parse(itemsRaw) as FavoritePreview[]) : [];
      const filtered = items
        .filter((it) => ids.includes(it.id))
        .sort((a, b) => (b.createdAtISO ?? "").localeCompare(a.createdAtISO ?? ""));

      setFavorites(filtered);
    } catch {
      setFavoritesCount(0);
      setFavorites([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const displayName = useMemo(() => {
    if (guest) return t(lang, "Гость", "Қонақ");
    return profile?.displayName || user?.displayName || "ZanAI User";
  }, [guest, lang, profile?.displayName, user?.displayName]);

  const email = useMemo(() => (guest ? "—" : profile?.email || user?.email || "—"), [guest, profile?.email, user?.email]);
  const plan = useMemo(() => (guest ? "Free" : profile?.plan || "Free"), [guest, profile?.plan]);

  const shownAvatar = avatarUri || profile?.avatarUrl || (user as any)?.photoURL || null;

  const completeness = useMemo(() => {
    let score = 0;
    if (String(displayName ?? "").trim().length >= 3) score += 0.25;
    if (String(email ?? "").includes("@")) score += 0.25;
    if (shownAvatar) score += 0.25;
    if (biometric || notifications || darkMode) score += 0.25;
    return Math.min(1, score);
  }, [displayName, email, shownAvatar, biometric, notifications, darkMode]);

  const percent = Math.round(completeness * 100);

  const openLangPicker = useCallback(() => {
    Alert.alert(
      t(lang, "Язык", "Тіл"),
      t(lang, "Выберите язык интерфейса", "Интерфейс тілін таңдаңыз"),
      [
        {
          text: "Русский",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLang("RU");
          },
        },
        {
          text: "Қазақша",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLang("KZ");
          },
        },
        { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
      ]
    );
  }, [lang]);

  const toggleBiometric = useCallback(
    async (next: boolean) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if (!next) {
        setBiometric(false);
        return;
      }

      try {
        const hasHw = await LocalAuthentication.hasHardwareAsync();
        if (!hasHw) {
          Alert.alert(
            t(lang, "Недоступно", "Қолжетімсіз"),
            t(lang, "На устройстве нет биометрии.", "Құрылғыда биометрия жоқ.")
          );
          setBiometric(false);
          return;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert(
            t(lang, "Нужно настроить", "Баптау керек"),
            t(lang, "Добавьте Face ID / Touch ID в настройках телефона.", "Телефон баптауларында Face ID / Touch ID қосыңыз.")
          );
          setBiometric(false);
          return;
        }

        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: t(lang, "Подтвердите биометрию", "Биометрияны растаңыз"),
          cancelLabel: t(lang, "Отмена", "Болдырмау"),
          disableDeviceFallback: false,
        });

        if (!res.success) {
          setBiometric(false);
          return;
        }

        setBiometric(true);
        Alert.alert(t(lang, "Готово ✅", "Дайын ✅"), t(lang, "Биометрия включена.", "Биометрия қосылды."));
      } catch {
        setBiometric(false);
        Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось включить биометрию.", "Биометрияны қосу мүмкін болмады."));
      }
    },
    [lang]
  );

  const pickAvatar = useCallback(async () => {
    hapticLight();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t(lang, "Доступ", "Қолжетімділік"), t(lang, "Нужен доступ к галерее.", "Галереяға рұқсат керек."));
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (res.canceled || !res.assets?.[0]?.uri) return;

    const uri = res.assets[0].uri;

    // локально показываем сразу
    setAvatarUri(uri);
    try {
      await AsyncStorage.setItem(KEY_PROFILE_AVATAR, uri);
    } catch {}

    // если залогинен — загрузим в Storage и запишем в Firestore
    if (user?.uid && !guest) {
      try {
        const up = await uploadUriToStorage({
          uid: user.uid,
          uri,
          folder: "profile" as any,
          fileName: `avatar_${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });

        await setDoc(
          doc(db, "users", user.uid),
          { avatarUrl: up.url, displayName, email, lang } as UserProfileDoc,
          { merge: true }
        );

        // после успешной записи — не зависим от file://
        setAvatarUri(null);
        await AsyncStorage.removeItem(KEY_PROFILE_AVATAR);
      } catch {
        // не критично: локально останется
      }
    }
  }, [lang, user?.uid, guest, displayName, email]);

  const removeAvatar = useCallback(() => {
    Alert.alert(t(lang, "Аватар", "Аватар"), t(lang, "Удалить фото?", "Фотосуретті жою керек пе?"), [
      { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
      {
        text: t(lang, "Удалить", "Жою"),
        style: "destructive",
        onPress: async () => {
          setAvatarUri(null);
          try {
            await AsyncStorage.removeItem(KEY_PROFILE_AVATAR);
          } catch {}
        },
      },
    ]);
  }, [lang]);

  const openEditName = useCallback(() => {
    if (guest) return;
    setEditName(String(profile?.displayName || user?.displayName || ""));
    setEditOpen(true);
  }, [guest, profile?.displayName, user?.displayName]);

  const saveName = useCallback(async () => {
    const n = editName.trim();
    if (n.length < 2) {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Имя слишком короткое.", "Атыңыз тым қысқа."));
      return;
    }
    setEditOpen(false);

    if (!user?.uid || guest) return;

    try {
      await setDoc(doc(db, "users", user.uid), { displayName: n, lang } as UserProfileDoc, { merge: true });
      Alert.alert(t(lang, "Готово ✅", "Дайын ✅"), t(lang, "Имя обновлено.", "Атыңыз жаңартылды."));
    } catch {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось обновить имя.", "Атыңызды жаңарту мүмкін болмады."));
    }
  }, [editName, lang, user?.uid, guest]);

  const onSupport = useCallback(() => {
    const emailTo = "support@zanai.app";
    Linking.openURL(`mailto:${emailTo}?subject=ZanAI%20Support`).catch(() =>
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось открыть почту.", "Поштаны ашу мүмкін болмады."))
    );
  }, [lang]);

  const onShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: t(
          lang,
          "ZanAI — удобный помощник по новостям и праву. Попробуй!",
          "ZanAI — жаңалық пен құқыққа арналған ыңғайлы көмекші. Көріп көр!"
        ),
      });
    } catch {}
  }, [lang]);

  const onLogout = useCallback(() => {
    Alert.alert(t(lang, "Выход", "Шығу"), t(lang, "Выйти из аккаунта?", "Аккаунттан шығасыз ба?"), [
      { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
      { text: t(lang, "Выйти", "Шығу"), style: "destructive", onPress: () => logout() },
    ]);
  }, [lang, logout]);

  const openFavorites = useCallback(() => {
    navigateSafe("Favorites");
  }, [navigateSafe]);

  const openSubscription = useCallback(() => {
    navigateSafe("Subscription");
  }, [navigateSafe]);

  const openDevices = useCallback(() => {
    navigateSafe("Devices");
  }, [navigateSafe]);

  const openChangePassword = useCallback(() => {
    navigateSafe("ChangePassword");
  }, [navigateSafe]);

  const openPolicy = useCallback(() => {
    // поставь свой реальный URL политики
    const url = "https://example.com/privacy";
    Linking.openURL(url).catch(() => {});
  }, []);

  return (
    <Screen contentStyle={{ paddingTop: 0, backgroundColor: theme.bg }}>
      {/* Edit name modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditOpen(false)} />
        <View style={styles.modalCenter}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t(lang, "Имя профиля", "Профиль аты")}</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder={t(lang, "Введите имя", "Атыңызды енгізіңіз")}
              placeholderTextColor={theme.muted}
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => setEditOpen(false)}>
                <Text style={[styles.modalBtnText, { color: theme.text }]}>{t(lang, "Отмена", "Болдырмау")}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtnPrimary]} onPress={saveName}>
                <Text style={styles.modalBtnPrimaryText}>{t(lang, "Сохранить", "Сақтау")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabSpace + 24 }}>
        <LinearGradient colors={theme.heroGrad} locations={[0, 0.55, 1]} style={[styles.hero, { borderColor: theme.border }]}>
          <View style={styles.heroTop}>
            <Image source={LOGO} style={styles.heroLogo} />
            <View style={styles.heroRight}>
              <Pressable
                onPress={openLangPicker}
                style={({ pressed }) => [
                  styles.langBtn,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>{lang}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.muted} />
              </Pressable>

              <Pressable
                onPress={onShareApp}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name="share-outline" size={22} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{t(lang, "Профиль", "Профиль")}</Text>

          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.userRow}>
              <Pressable
                onPress={pickAvatar}
                onLongPress={shownAvatar ? removeAvatar : undefined}
                style={({ pressed }) => [
                  styles.avatar,
                  { borderColor: theme.border, backgroundColor: theme.soft },
                  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
                ]}
              >
                {shownAvatar ? (
                  <Image source={{ uri: shownAvatar }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={26} color={theme.muted} />
                )}
                <View style={[styles.avatarBadge, { borderColor: theme.border, backgroundColor: theme.card }]}>
                  <Ionicons name="camera" size={14} color={theme.text} />
                </View>
              </Pressable>

              <View style={{ flex: 1 }}>
                <Pressable onPress={openEditName} disabled={guest}>
                  <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
                  {!guest && (
                    <Text style={[styles.tapToEdit, { color: theme.muted }]}>
                      {t(lang, "Нажми чтобы изменить", "Өзгерту үшін бас")}
                    </Text>
                  )}
                </Pressable>

                <Text style={[styles.userEmail, { color: theme.muted }]}>{email}</Text>

                <View style={styles.badgesRow}>
                  <View style={[styles.badge, { backgroundColor: theme.soft }]}>
                    <Text style={[styles.badgeText, { color: theme.text }]}>{plan}</Text>
                  </View>
                  {guest ? (
                    <View style={[styles.badge, { backgroundColor: "#FFF7ED" }]}>
                      <Text style={[styles.badgeText, { color: "#9A3412" }]}>Guest</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: "rgba(96,165,250,0.12)" }]}>
                      <Text style={[styles.badgeText, { color: theme.text }]}>KZ / RU</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>{t(lang, "Заполненность профиля", "Профиль толуы")}</Text>
                <Text style={[styles.progressValue, { color: colors.navy }]}>{percent}%</Text>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: darkMode ? "#1B1B22" : "#EEF0F3" }]}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>

              <Text style={[styles.progressHint, { color: theme.muted }]}>
                {t(lang, "Добавь аватар и включи биометрию — профиль выглядит “профи”.", "Аватар қосып, биометрияны қоссan — профиль “профи” болады.")}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.stat, { borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.text }]}>{favoritesCount}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>{t(lang, "в избранном", "таңдаулыда")}</Text>
              </View>
              <View style={[styles.stat, { borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.text }]}>{guest ? "—" : "OK"}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>{t(lang, "аккаунт", "аккаунт")}</Text>
              </View>
              <View style={[styles.stat, { borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.text }]}>{biometric ? "ON" : "OFF"}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>{t(lang, "биометрия", "биометрия")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickRow}>
            <QuickAction
              icon="bookmark-outline"
              label={t(lang, "Избранное", "Таңдаулы")}
              onPress={openFavorites}
              bg={theme.card}
              border={theme.border}
              textColor={theme.text}
              softBg={theme.soft}
            />
            <QuickAction
              icon="rocket-outline"
              label={t(lang, "Подписка", "Жазылым")}
              onPress={openSubscription}
              bg={theme.card}
              border={theme.border}
              textColor={theme.text}
              softBg={theme.soft}
            />
            <QuickAction
              icon="help-circle-outline"
              label={t(lang, "Поддержка", "Қолдау")}
              onPress={onSupport}
              bg={theme.card}
              border={theme.border}
              textColor={theme.text}
              softBg={theme.soft}
            />
            <QuickAction
              icon="shield-checkmark-outline"
              label={t(lang, "Политика", "Саясат")}
              onPress={openPolicy}
              bg={theme.card}
              border={theme.border}
              textColor={theme.text}
              softBg={theme.soft}
            />
          </View>
        </LinearGradient>

        {/* Favorites preview */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeadRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Избранные новости", "Таңдаулы жаңалықтар")}</Text>
            <Pressable onPress={openFavorites} hitSlop={10}>
              <Text style={[styles.linkText, { color: colors.navy }]}>{t(lang, "Все", "Барлығы")}</Text>
            </Pressable>
          </View>

          {favoritesCount === 0 ? (
            <View style={styles.favEmpty}>
              <Ionicons name="bookmark-outline" size={22} color={theme.muted} />
              <Text style={[styles.favEmptyTitle, { color: theme.text }]}>{t(lang, "Пока нет избранного", "Таңдаулы әзірше жоқ")}</Text>
              <Text style={[styles.favEmptySub, { color: theme.muted }]}>
                {t(lang, "Сохраняй новости в ленте — они появятся здесь.", "Лентадан жаңалықты сақта — осында шығады.")}
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 6 }}>
              {favorites.slice(0, 3).map((it, idx) => {
                const title = lang === "RU" ? it.titleRU : it.titleKZ;
                const subtitle = lang === "RU" ? it.subtitleRU : it.subtitleKZ;
                return (
                  <Pressable
                    key={it.id}
                    onPress={() => {
                      if (it.url) {
                        Linking.openURL(it.url).catch(() => {});
                      } else {
                        Alert.alert(title, subtitle || "");
                      }
                    }}
                    style={[
                      styles.favRow,
                      idx !== 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                    ]}
                  >
                    <View style={[styles.favIcon, { borderColor: theme.border, backgroundColor: theme.soft }]}>
                      <Ionicons name="newspaper-outline" size={18} color={theme.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.favTitle, { color: theme.text }]} numberOfLines={2}>
                        {title}
                      </Text>
                      {!!subtitle && (
                        <Text style={[styles.favSub, { color: theme.muted }]} numberOfLines={2}>
                          {subtitle}
                        </Text>
                      )}
                      <Text style={[styles.favMeta, { color: theme.muted }]}>
                        {(it.source ? it.source + " • " : "") + (it.createdAtISO ? fmtDate(it.createdAtISO) : "")}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                  </Pressable>
                );
              })}

              {favoritesCount > 3 && (
                <Pressable style={[styles.smallBtn, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={openFavorites}>
                  <Text style={[styles.smallBtnText, { color: theme.text }]}>
                    {t(lang, "Открыть все", "Барлығын ашу")} ({favoritesCount})
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Настройки", "Баптаулар")}</Text>

          <Row
            icon="notifications-outline"
            title={t(lang, "Уведомления", "Хабарламалар")}
            subtitle={t(lang, "Сохраняем настройку (push подключим позже)", "Баптауды сақтаймыз (push кейін)")}
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

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Row
            icon="moon-outline"
            title={t(lang, "Тёмная тема", "Қараңғы тақырып")}
            subtitle={t(lang, "Работает на этом экране + сохраняется", "Осы экранда жұмыс істейді + сақталады")}
            right={
              <Switch
                value={darkMode}
                onValueChange={(v) => {
                  hapticLight();
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setDarkMode(v);
                }}
                trackColor={{ false: "#E5E7EB", true: "#BBD1FF" }}
                thumbColor={darkMode ? colors.navy : "#9CA3AF"}
              />
            }
            onPress={() => setDarkMode((v) => !v)}
          />

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Row
            icon="finger-print-outline"
            title={Platform.OS === "ios" ? "Face ID / Touch ID" : t(lang, "Биометрия", "Биометрия")}
            subtitle={t(lang, "Реальная проверка + сохранение", "Нақты тексеріс + сақтау")}
            right={
              <Switch
                value={biometric}
                onValueChange={(v) => {
                  hapticLight();
                  toggleBiometric(v);
                }}
                trackColor={{ false: "#E5E7EB", true: "#BBD1FF" }}
                thumbColor={biometric ? colors.navy : "#9CA3AF"}
              />
            }
            onPress={() => toggleBiometric(!biometric)}
          />
        </View>

        {/* Account */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Аккаунт", "Аккаунт")}</Text>

          <Row
            icon="key-outline"
            title={t(lang, "Изменить пароль", "Құпиясөзді өзгерту")}
            subtitle={t(lang, "Рекомендуем раз в 3 месяца", "Әр 3 айда бір")}
            onPress={openChangePassword}
            disabled={guest}
          />

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Row
            icon="phone-portrait-outline"
            title={t(lang, "Устройства", "Құрылғылар")}
            subtitle={t(lang, "Активные сессии (демо)", "Белсенді сессиялар (демо)")}
            onPress={openDevices}
            disabled={guest}
          />

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Row
            icon="card-outline"
            title={t(lang, "Подписка", "Жазылым")}
            subtitle={t(lang, "Free / Pro (демо)", "Free / Pro (демо)")}
            onPress={openSubscription}
          />
        </View>

        {/* Danger zone */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Опасная зона", "Қауіпті аймақ")}</Text>
          <Row
            icon="log-out-outline"
            title={t(lang, "Выйти", "Шығу")}
            subtitle={t(lang, "Завершить сессию", "Сессияны аяқтау")}
            onPress={onLogout}
            danger
          />
        </View>

        <Text style={[styles.footerText, { color: theme.muted }]}>ZanAI • MVP</Text>
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
    borderWidth: 1,
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 },
  heroLogo: { height: 32, width: 160, resizeMode: "contain" },
  heroRight: { flexDirection: "row", alignItems: "center", gap: 10 },

  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  langText: { fontWeight: "800", fontSize: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 34, fontWeight: "900", marginTop: 6, marginBottom: 10 },

  profileCard: { borderWidth: 1, borderRadius: 20, padding: 14 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 1,
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  userName: { fontSize: 16, fontWeight: "900" },
  tapToEdit: { marginTop: 2, fontSize: 11, fontWeight: "800" },
  userEmail: { marginTop: 6, fontSize: 13 },

  badgesRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "900" },

  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontWeight: "900" },
  progressValue: { fontSize: 12, fontWeight: "900" },
  progressTrack: { marginTop: 8, height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.navy },
  progressHint: { marginTop: 8, fontSize: 12, lineHeight: 16 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 10 },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { marginTop: 4, fontSize: 11, fontWeight: "800" },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  quickCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickText: { fontSize: 12, fontWeight: "900" },

  card: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  sectionTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10 },
  linkText: { fontSize: 12, fontWeight: "900" },

  divider: { height: 1 },

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

  // Favorites
  favEmpty: { paddingVertical: 10, alignItems: "center" },
  favEmptyTitle: { marginTop: 8, fontSize: 13, fontWeight: "900" },
  favEmptySub: { marginTop: 6, fontSize: 12, textAlign: "center", lineHeight: 18 },

  favRow: { flexDirection: "row", gap: 12, paddingVertical: 12, alignItems: "center" },
  favIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  favTitle: { fontSize: 13, fontWeight: "900" },
  favSub: { marginTop: 4, fontSize: 12 },
  favMeta: { marginTop: 6, fontSize: 11, fontWeight: "800" },

  smallBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { fontSize: 12, fontWeight: "900" },

  footerText: { marginTop: 12, marginBottom: 18, textAlign: "center", fontSize: 12 },

  // Modal
  modalBackdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCenter: { flex: 1, justifyContent: "center", paddingHorizontal: 18 },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
  modalTitle: { fontSize: 14, fontWeight: "900" },
  modalInput: {
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 12 },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: { fontSize: 13, fontWeight: "900" },
  modalBtnPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  modalBtnPrimaryText: { color: "#fff", fontSize: 13, fontWeight: "900" },
});
