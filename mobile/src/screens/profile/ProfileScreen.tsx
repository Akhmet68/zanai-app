import React, { useCallback, useEffect, useMemo, useState } from "react";
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

function hapticLight() {
  Haptics.selectionAsync?.().catch?.(() => {});
}

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

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
      style={({ pressed }) => [styles.quickCard, pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null]}
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

  const theme = useMemo(() => {
    // локальная тема для экрана (не трогаем весь проект)
    return {
      bg: darkMode ? "#0B0B0D" : colors.white,
      card: darkMode ? "#111115" : colors.white,
      border: darkMode ? "rgba(255,255,255,0.12)" : colors.border,
      text: darkMode ? "#F8FAFC" : colors.text,
      muted: darkMode ? "#A1A1AA" : colors.muted,
      heroGrad: darkMode ? (["#0B1E5B", "#111115", "#0B0B0D"] as const) : (["#0B1E5B", "#1B2C63", "#FFFFFF"] as const),
    };
  }, [darkMode]);

  // --- Firestore profile ---
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfileDoc) : null);
    });
  }, [user?.uid]);

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
      // фильтруем по ids, сортируем по дате
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

  const displayName = guest ? t(lang, "Гость", "Қонақ") : profile?.displayName || user?.displayName || "ZanAI User";
  const email = guest ? "—" : profile?.email || user?.email || "—";
  const plan = guest ? "Free" : profile?.plan || "Free";

  const shownAvatar =
    avatarUri || profile?.avatarUrl || (user as any)?.photoURL || null;

  const completeness = useMemo(() => {
    let score = 0;
    if (String(displayName ?? "").trim().length >= 3) score += 0.25;
    if (String(email ?? "").includes("@")) score += 0.25;
    if (shownAvatar) score += 0.25;
    if (biometric || notifications || darkMode) score += 0.25;
    return Math.min(1, score);
  }, [displayName, email, shownAvatar, biometric, notifications, darkMode]);

  const percent = Math.round(completeness * 100);

  const openLangPicker = () => {
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
  };

  const toggleBiometric = async (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (!next) {
      setBiometric(false);
      return;
    }

    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      if (!hasHw) {
        Alert.alert(t(lang, "Недоступно", "Қолжетімсіз"), t(lang, "На устройстве нет биометрии.", "Құрылғыда биометрия жоқ."));
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
  };

  const pickAvatar = async () => {
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

    // локально покажем сразу
    setAvatarUri(uri);
    try {
      await AsyncStorage.setItem(KEY_PROFILE_AVATAR, uri);
    } catch {}

    // если залогинен — загрузим в Storage и запишем в Firestore (реально “как у взрослых”)
    if (user?.uid && !guest) {
      try {
        const up = await uploadUriToStorage({
          uid: user.uid,
          uri,
          folder: "chat-images",
          fileName: `avatar_${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });

        await setDoc(
          doc(db, "users", user.uid),
          { avatarUrl: up.url, displayName, email, lang } as UserProfileDoc,
          { merge: true }
        );

        // после успешной записи можно хранить уже url (чтобы не зависеть от file://)
        setAvatarUri(null);
        await AsyncStorage.setItem(KEY_PROFILE_AVATAR, "");
      } catch {
        // не критично: локально останется
      }
    }
  };

  const removeAvatar = () => {
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
          // (опционально) можно ещё стереть avatarUrl в Firestore — пока не делаем
        },
      },
    ]);
  };

  const openEditName = () => {
    if (guest) return;
    setEditName(String(profile?.displayName || user?.displayName || ""));
    setEditOpen(true);
  };

  const saveName = async () => {
    const n = editName.trim();
    if (n.length < 2) {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Имя слишком короткое.", "Атыңыз тым қысқа."));
      return;
    }
    setEditOpen(false);

    if (!user?.uid) return;

    try {
      await setDoc(doc(db, "users", user.uid), { displayName: n } as UserProfileDoc, { merge: true });
      Alert.alert(t(lang, "Готово ✅", "Дайын ✅"), t(lang, "Имя обновлено.", "Атыңыз жаңартылды."));
    } catch {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось обновить имя.", "Атыңызды жаңарту мүмкін болмады."));
    }
  };

  const onSupport = () => {
    const emailTo = "support@zanai.app";
    Linking.openURL(`mailto:${emailTo}?subject=ZanAI%20Support`).catch(() =>
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось открыть почту.", "Поштаны ашу мүмкін болмады."))
    );
  };

  const onShareApp = async () => {
    try {
      await Share.share({
        message: t(
          lang,
          "ZanAI — удобный помощник по новостям и праву. Попробуй!",
          "ZanAI — жаңалық пен құқыққа арналған ыңғайлы көмекші. Көріп көр!"
        ),
      });
    } catch {}
  };

  const onLogout = () => {
    Alert.alert(t(lang, "Выход", "Шығу"), t(lang, "Выйти из аккаунта?", "Аккаунттан шығасыз ба?"), [
      { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
      { text: t(lang, "Выйти", "Шығу"), style: "destructive", onPress: () => logout() },
    ]);
  };

  const openFavorites = () => {
    // если у тебя есть экран Favorites — будет круто
    try {
      navigation.navigate("Favorites");
    } catch {
      Alert.alert(t(lang, "Избранное", "Таңдаулы"), t(lang, "Экран Favorites пока не подключен.", "Favorites экраны әлі қосылмаған."));
    }
  };

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
            />
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, { borderColor: theme.border }]} onPress={() => setEditOpen(false)}>
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
              <Pressable onPress={openLangPicker} style={({ pressed }) => [styles.langBtn, { borderColor: theme.border }, pressed && { opacity: 0.85 }]}>
                <Text style={[styles.langText, { color: colors.text }]}>{lang}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.muted} />
              </Pressable>

              <Pressable
                onPress={() => Alert.alert(t(lang, "Поиск", "Іздеу"), t(lang, "Подключим позже 🙂", "Кейін қосамыз 🙂"))}
                style={({ pressed }) => [styles.iconBtn, { borderColor: theme.border }, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="search-outline" size={22} color={colors.text} />
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
                  { borderColor: theme.border, backgroundColor: darkMode ? "#1B1B22" : "#F7F7F9" },
                  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
                ]}
              >
                {shownAvatar ? (
                  <Image source={{ uri: shownAvatar }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={26} color={colors.muted} />
                )}
                <View style={[styles.avatarBadge, { borderColor: theme.border }]}>
                  <Ionicons name="camera" size={14} color="#111" />
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
                  <View style={[styles.badge, { backgroundColor: darkMode ? "#1B1B22" : "#F2F2F2" }]}>
                    <Text style={[styles.badgeText, { color: theme.text }]}>{plan}</Text>
                  </View>
                  {guest ? (
                    <View style={[styles.badge, { backgroundColor: "#FFF7ED" }]}>
                      <Text style={[styles.badgeText, { color: "#9A3412" }]}>Guest</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: "#F5F7FF" }]}>
                      <Text style={[styles.badgeText, { color: colors.navy }]}>KZ / RU</Text>
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
                {t(lang, "Добавь аватар и включи биометрию — профиль будет выглядеть “профи”.", "Аватар қосып, биометрияны қоссan — профиль “профи” болады.")}
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            <QuickAction icon="bookmark-outline" label={t(lang, "Избранное", "Таңдаулы")} onPress={openFavorites} />
            <QuickAction icon="help-circle-outline" label={t(lang, "Помощь", "Көмек")} onPress={onSupport} />
            <QuickAction icon="share-social-outline" label={t(lang, "Поделиться", "Бөлісу")} onPress={onShareApp} />
            <QuickAction
              icon="settings-outline"
              label={t(lang, "Настройки", "Баптаулар")}
              onPress={() => Alert.alert(t(lang, "Скоро", "Жақында"), t(lang, "Настройки вынесем отдельно 🙂", "Баптауларды бөлек шығарамыз 🙂"))}
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
              <Text style={[styles.favEmptyTitle, { color: theme.text }]}>
                {t(lang, "Пока нет избранного", "Таңдаулы әзірше жоқ")}
              </Text>
              <Text style={[styles.favEmptySub, { color: theme.muted }]}>
                {t(lang, "Сохраняй новости в ленте — они появятся здесь.", "Лентадан жаңалықты сақта — осында шығады.")}
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 6 }}>
              {(favorites.slice(0, 3) || []).map((it, idx) => {
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
                    <View style={[styles.favIcon, { borderColor: theme.border, backgroundColor: darkMode ? "#1B1B22" : "#F7F7F9" }]}>
                      <Ionicons name="newspaper-outline" size={18} color={colors.text} />
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
                <Pressable style={[styles.smallBtn, { borderColor: theme.border }]} onPress={openFavorites}>
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

          <View style={styles.divider} />

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
        </View>

        {/* Security */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Безопасность", "Қауіпсіздік")}</Text>

          <Row
            icon="key-outline"
            title={t(lang, "Изменить пароль", "Құпиясөзді өзгерту")}
            subtitle={t(lang, "Рекомендуем раз в 3 месяца", "Әр 3 айда бір")}
            onPress={() => navigation.navigate("ChangePassword")}
            disabled={guest}
          />

          <View style={styles.divider} />

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
    backgroundColor: colors.white,
  },
  langText: { fontWeight: "800", fontSize: 12 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
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
    backgroundColor: "#FFFFFF",
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
    borderRadius: 18,
    padding: 14,
  },
  cardHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  sectionTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10 },
  linkText: { fontSize: 12, fontWeight: "900" },

  divider: { height: 1, backgroundColor: "#EEF0F3" },

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
    backgroundColor: colors.white,
  },
  smallBtnText: { fontSize: 12, fontWeight: "900" },

  footerText: { marginTop: 12, marginBottom: 18, textAlign: "center", fontSize: 12 },

  // Modal
  modalBackdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCenter: { flex: 1, justifyContent: "center", paddingHorizontal: 18 },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
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
    backgroundColor: colors.white,
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
