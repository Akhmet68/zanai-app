import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
const KEY_FAVORITES = "zanai:favorites";
const KEY_FAVORITES_ITEMS = "zanai:favorites_items";

type Lang = "RU" | "KZ";
type Settings = { lang: Lang; darkMode: boolean };

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

const FavoriteRow = React.memo(function FavoriteRow({
  item,
  lang,
  darkMode,
  onOpen,
  onRemove,
}: {
  item: FavoritePreview;
  lang: Lang;
  darkMode: boolean;
  onOpen: (it: FavoritePreview) => void;
  onRemove: (id: string) => void;
}) {
  const title = lang === "RU" ? item.titleRU : item.titleKZ;
  const subtitle = lang === "RU" ? item.subtitleRU : item.subtitleKZ;

  return (
    <Pressable
      onPress={() => onOpen(item)}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
        darkMode && { backgroundColor: "#111115", borderColor: "rgba(255,255,255,0.12)" },
      ]}
    >
      <View style={[styles.cardIcon, darkMode && { backgroundColor: "#1B1B22", borderColor: "rgba(255,255,255,0.12)" }]}>
        <Ionicons name="bookmark" size={18} color={colors.navy} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, darkMode && { color: "#F8FAFC" }]} numberOfLines={2}>
          {title}
        </Text>

        {!!subtitle && (
          <Text style={[styles.cardSub, darkMode && { color: "#A1A1AA" }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}

        <Text style={[styles.cardMeta, darkMode && { color: "#A1A1AA" }]} numberOfLines={1}>
          {(item.source ? item.source + " • " : "") + (item.createdAtISO ? fmtDate(item.createdAtISO) : "")}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          Alert.alert(
            t(lang, "Удалить", "Жою"),
            t(lang, "Убрать из избранного?", "Таңдаулыдан алып тастау керек пе?"),
            [
              { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
              { text: t(lang, "Удалить", "Жою"), style: "destructive", onPress: () => onRemove(item.id) },
            ]
          )
        }
        hitSlop={10}
        style={styles.trashBtn}
      >
        <Ionicons name="trash-outline" size={18} color={darkMode ? "#A1A1AA" : colors.muted} />
      </Pressable>
    </Pressable>
  );
});

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings>({ lang: "RU", darkMode: false });
  const lang = settings.lang;
  const darkMode = settings.darkMode;

  const [q, setQ] = useState("");
  const [items, setItems] = useState<FavoritePreview[]>([]);
  const [count, setCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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

  const load = useCallback(async () => {
    try {
      const mapRaw = await AsyncStorage.getItem(KEY_FAVORITES);
      const itemsRaw = await AsyncStorage.getItem(KEY_FAVORITES_ITEMS);

      const favMap = mapRaw ? (JSON.parse(mapRaw) as Record<string, boolean>) : {};
      const ids = Object.keys(favMap).filter((k) => favMap[k]);

      setCount(ids.length);

      const stored = itemsRaw ? (JSON.parse(itemsRaw) as FavoritePreview[]) : [];
      const filtered = stored
        .filter((it) => ids.includes(it.id))
        .sort((a, b) => (b.createdAtISO ?? "").localeCompare(a.createdAtISO ?? ""));

      setItems(filtered);
    } catch {
      setCount(0);
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const data = useMemo(() => {
    const t0 = q.trim().toLowerCase();
    if (!t0) return items;

    return items.filter((x) => {
      const title = (lang === "RU" ? x.titleRU : x.titleKZ).toLowerCase();
      const sub = (lang === "RU" ? (x.subtitleRU ?? "") : (x.subtitleKZ ?? "")).toLowerCase();
      return title.includes(t0) || sub.includes(t0);
    });
  }, [items, q, lang]);

  const onOpen = useCallback((it: FavoritePreview) => {
    const title = lang === "RU" ? it.titleRU : it.titleKZ;
    const subtitle = lang === "RU" ? it.subtitleRU : it.subtitleKZ;

    if (it.url) {
      Linking.openURL(it.url).catch(() => {
        Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось открыть ссылку.", "Сілтемені ашу мүмкін болмады."));
      });
      return;
    }

    Alert.alert(title, subtitle || "");
  }, [lang]);

  const onRemove = useCallback(async (id: string) => {
    try {
      const mapRaw = await AsyncStorage.getItem(KEY_FAVORITES);
      const itemsRaw = await AsyncStorage.getItem(KEY_FAVORITES_ITEMS);

      const favMap = mapRaw ? (JSON.parse(mapRaw) as Record<string, boolean>) : {};
      favMap[id] = false;

      // чистим items тоже, чтобы не раздувать storage
      const stored = itemsRaw ? (JSON.parse(itemsRaw) as FavoritePreview[]) : [];
      const storedNext = stored.filter((x) => x.id !== id);

      await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(favMap));
      await AsyncStorage.setItem(KEY_FAVORITES_ITEMS, JSON.stringify(storedNext));

      // локально
      setItems((p) => p.filter((x) => x.id !== id));
      setCount((c) => Math.max(0, c - 1));
    } catch {
      Alert.alert(t(lang, "Ошибка", "Қате"), t(lang, "Не удалось удалить.", "Жою мүмкін болмады."));
    }
  }, [lang]);

  const onClearAll = useCallback(() => {
    if (count === 0) return;

    Alert.alert(
      t(lang, "Очистить", "Тазарту"),
      t(lang, "Удалить всё избранное?", "Барлық таңдаулыны жою керек пе?"),
      [
        { text: t(lang, "Отмена", "Болдырмау"), style: "cancel" },
        {
          text: t(lang, "Удалить", "Жою"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify({}));
              await AsyncStorage.setItem(KEY_FAVORITES_ITEMS, JSON.stringify([]));
              setItems([]);
              setCount(0);
              setQ("");
            } catch {}
          },
        },
      ]
    );
  }, [count, lang]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const bg = darkMode ? "#0B0B0D" : colors.white;
  const text = darkMode ? "#F8FAFC" : colors.text;
  const muted = darkMode ? "#A1A1AA" : colors.muted;

  return (
    <Screen contentStyle={{ paddingTop: 0, backgroundColor: bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.hBtn,
            darkMode && { backgroundColor: "#111115", borderColor: "rgba(255,255,255,0.12)" },
            pressed && { opacity: 0.85 },
          ]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.hTitle, { color: text }]}>{t(lang, "Избранное", "Таңдаулы")}</Text>
          <Text style={[styles.hSub, { color: muted }]}>{t(lang, "сохранено", "сақталған")} • {count}</Text>
        </View>

        <Pressable
          onPress={onClearAll}
          style={({ pressed }) => [styles.hBtn, pressed && { opacity: 0.85 }, darkMode && { backgroundColor: "#111115", borderColor: "rgba(255,255,255,0.12)" }]}
          hitSlop={10}
        >
          <Ionicons name="trash-outline" size={20} color={count ? text : muted} />
        </Pressable>
      </View>

      <View style={[styles.searchRow, darkMode && { backgroundColor: "#111115", borderColor: "rgba(255,255,255,0.12)" }]}>
        <Ionicons name="search-outline" size={18} color={muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t(lang, "Поиск по избранному…", "Таңдаулыдан іздеу…")}
          placeholderTextColor={muted}
          style={[styles.searchInput, { color: text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {!!q && (
          <Pressable onPress={() => setQ("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={muted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={16}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={24} color={muted} />
            <Text style={[styles.emptyTitle, { color: text }]}>
              {count === 0 ? t(lang, "Пока пусто", "Әзірше бос") : t(lang, "Нет превью", "Превью жоқ")}
            </Text>
            <Text style={[styles.emptyText, { color: muted }]}>
              {count === 0
                ? t(lang, "Сохраняй новости — они появятся здесь.", "Жаңалық сақтасаң — осында шығады.")
                : t(lang, "Сохраняй новости в ленте с превью (title/subtitle), чтобы они отображались здесь.", "Лентада превью-мен сақта (title/subtitle) — сонда осында шығады.")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FavoriteRow item={item} lang={lang} darkMode={darkMode} onOpen={onOpen} onRemove={onRemove} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  hTitle: { fontSize: 20, fontWeight: "900" },
  hSub: { marginTop: 2, fontSize: 12, fontWeight: "800" },

  searchRow: {
    marginHorizontal: 16,
    marginBottom: 12,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  cardSub: { marginTop: 4, fontSize: 12, color: colors.muted },
  cardMeta: { marginTop: 6, fontSize: 11, color: colors.muted, fontWeight: "800" },

  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { marginTop: 50, alignItems: "center", paddingHorizontal: 24 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900" },
  emptyText: { marginTop: 6, fontSize: 13, textAlign: "center", lineHeight: 18 },
});
