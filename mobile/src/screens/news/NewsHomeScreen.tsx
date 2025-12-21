import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColorValue, ViewStyle } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  RefreshControl,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
  Share,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

const KEY_PROFILE_SETTINGS = "zanai:profile:settings";
const KEY_FAVORITES = "zanai:favorites";
const KEY_FAVORITES_ITEMS = "zanai:favorites_items";

type Lang = "RU" | "KZ";
type Settings = { lang: Lang; darkMode: boolean };

type Chip = { key: string; labelRU: string; labelKZ: string };

type NewsItem = {
  id: string;
  titleRU: string;
  titleKZ: string;
  subtitleRU: string;
  subtitleKZ: string;
  category: "law" | "tech" | "soc" | "biz";
  source: string;
  minutes: number;
  createdAtISO: string; // для демо
  url?: string;
  bodyRU: string;
  bodyKZ: string;
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

function fmtDate(iso: string, _lang: Lang) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

function buildMockNews(): NewsItem[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const items: NewsItem[] = [
    {
      id: "n1",
      category: "law",
      source: "Gov.kz",
      minutes: 3,
      createdAtISO: new Date(now - day * 0.2).toISOString(),
      titleRU: "Токаев подписал закон об искусственном интеллекте",
      titleKZ: "Тоқаев жасанды интеллект туралы заңға қол қойды",
      subtitleRU: "Документ вводит понятия, правила и ответственность в сфере ИИ…",
      subtitleKZ: "Құжат ЖИ саласына қатысты ұғымдар мен ережелерді енгізеді…",
      bodyRU:
        "Коротко: закон задаёт базовые определения, общие принципы и рамки ответственности.\n\nДалее: появятся подзаконные акты, требования к безопасности, защите данных и прозрачности.\n\nЧто это значит для бизнеса: нужно будет учитывать риски, источники данных и соответствие требованиям.",
      bodyKZ:
        "Қысқаша: заң негізгі ұғымдарды, қағидаларды және жауапкершілік шектерін анықтайды.\n\nКелесі қадам: қауіпсіздік, деректерді қорғау және ашықтық талаптары бойынша қаулылар шығады.\n\nБизнес үшін: тәуекелдерді, дереккөздерді және талаптарға сәйкестікті ескеру қажет болады.",
      url: "https://example.com",
    },
    {
      id: "n2",
      category: "law",
      source: "Parlam.kz",
      minutes: 4,
      createdAtISO: new Date(now - day * 0.35).toISOString(),
      titleRU: "Сенат вернул в Мажилис на доработку законопроект",
      titleKZ: "Сенат заң жобасын Мәжіліске қайтарды",
      subtitleRU: "Отдельные пункты отправили на доработку и уточнение формулировок…",
      subtitleKZ: "Кейбір тармақтар нақтылау үшін қайта қарауға жіберілді…",
      bodyRU:
        "Сенат предложил уточнить формулировки и привести нормы к единому стандарту.\n\nОбычно это означает: будет ещё один раунд обсуждений и поправок.\n\nСледи за версией законопроекта — финальный текст может отличаться.",
      bodyKZ:
        "Сенат тұжырымдарды нақтылауды және нормаларды бірыңғай стандартқа келтіруді ұсынды.\n\nКөбіне бұл: тағы бір талқылау және түзету кезеңі болатынын білдіреді.\n\nЗаң жобасының соңғы мәтіні өзгеруі мүмкін — жаңартуларды қадағала.",
    },
    {
      id: "n3",
      category: "tech",
      source: "Tech.kz",
      minutes: 5,
      createdAtISO: new Date(now - day * 0.6).toISOString(),
      titleRU: "ИИ в госуслугах: пилотные кейсы и эффекты",
      titleKZ: "Мемқызметте ЖИ: пилоттық кейстер және әсері",
      subtitleRU: "Какие сервисы ускоряются и где важна проверка человеком…",
      subtitleKZ: "Қай сервистер жылдамдайды және адам тексеруі қайда маңызды…",
      bodyRU:
        "ИИ чаще всего применяют для сортировки обращений, подсказок, автозаполнения и аналитики.\n\nКритично: качество данных и контроль ошибок, особенно в юридических сервисах.",
      bodyKZ:
        "ЖИ көбіне өтініштерді сұрыптау, кеңес беру, автотолтыру және аналитика үшін қолданылады.\n\nМаңыздысы: деректер сапасы және қателерді бақылау, әсіресе құқықтық сервистерде.",
    },
    {
      id: "n4",
      category: "soc",
      source: "Society.kz",
      minutes: 6,
      createdAtISO: new Date(now - day * 0.9).toISOString(),
      titleRU: "Обсуждают цифровые права: что меняется",
      titleKZ: "Цифрлық құқықтар талқылануда: не өзгереді",
      subtitleRU: "От персональных данных до прозрачности алгоритмов…",
      subtitleKZ: "Жеке деректерден бастап алгоритмдердің ашықтығына дейін…",
      bodyRU:
        "Фокус обсуждений: персональные данные, согласие, сроки хранения и право на объяснение.\n\nЕсли внедряешь алгоритмы — готовь документацию и логику принятия решений.",
      bodyKZ:
        "Талқылау өзегі: жеке деректер, келісім, сақтау мерзімі және түсіндірме құқығы.\n\nАлгоритм енгізсең — құжаттама мен шешім логикасын дайында.",
    },
    {
      id: "n5",
      category: "biz",
      source: "Biznews",
      minutes: 4,
      createdAtISO: new Date(now - day * 1.3).toISOString(),
      titleRU: "Бизнес адаптируется к новым правилам ИИ",
      titleKZ: "Бизнес ЖИ ережелеріне бейімделуде",
      subtitleRU: "Компании пересматривают процессы комплаенса и безопасности…",
      subtitleKZ: "Компаниялар комплаенс пен қауіпсіздік процестерін жаңартуда…",
      bodyRU:
        "В фокусе: комплаенс, контроль рисков, аудит датасетов и безопасность.\n\nПрактика: создают внутренние политики и назначают ответственных.",
      bodyKZ:
        "Негізгі бағыт: комплаенс, тәуекелді бақылау, датасеттер аудиті және қауіпсіздік.\n\nТәжірибе: ішкі саясат қабылдап, жауапты тұлғаларды тағайындайды.",
    },
  ];

  const extra: NewsItem[] = Array.from({ length: 18 }).map((_, i) => {
    const id = `nx${i + 1}`;
    const cats: NewsItem["category"][] = ["law", "tech", "soc", "biz"];
    const category = cats[i % cats.length];
    const createdAtISO = new Date(now - day * (1.8 + i * 0.12)).toISOString();
    return {
      id,
      category,
      source: ["ZanAI Digest", "News.kz", "OpenData", "Daily KZ"][i % 4],
      minutes: 3 + (i % 6),
      createdAtISO,
      titleRU:
        category === "law"
          ? `Юрпрактика: частый вопрос №${i + 1}`
          : category === "tech"
          ? `AI-обзор недели №${i + 1}`
          : category === "soc"
          ? `Общество: тренд обсуждения №${i + 1}`
          : `Бизнес: кейс компании №${i + 1}`,
      titleKZ:
        category === "law"
          ? `Құқық: жиі сұрақ №${i + 1}`
          : category === "tech"
          ? `ЖИ апталық шолу №${i + 1}`
          : category === "soc"
          ? `Қоғам: талқылау тренді №${i + 1}`
          : `Бизнес: компания кейсі №${i + 1}`,
      subtitleRU: "Короткое описание новости для демонстрации интерфейса…",
      subtitleKZ: "Интерфейсті көрсетуге арналған қысқа сипаттама…",
      bodyRU:
        "Демо-текст новости.\n\nПозже здесь будет реальный контент из API/Firebase.\n\nСейчас это помогает сделать экран живым и готовым к интеграции.",
      bodyKZ:
        "Демо жаңалық мәтіні.\n\nКейін бұл жерде API/Firebase-тен нақты контент болады.\n\nҚазір экранды “тірі” етіп көрсету үшін.",
    };
  });

  return [...items, ...extra];
}

type ChipKey = "all" | "law" | "tech" | "soc" | "biz";

const CHIPS: Chip[] = [
  { key: "all", labelRU: "Все", labelKZ: "Барлығы" },
  { key: "law", labelRU: "Закон", labelKZ: "Құқық" },
  { key: "tech", labelRU: "AI", labelKZ: "ЖИ" },
  { key: "soc", labelRU: "Общество", labelKZ: "Қоғам" },
  { key: "biz", labelRU: "Бизнес", labelKZ: "Бизнес" },
];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NewsHomeScreen() {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings>({ lang: "RU", darkMode: false });
  const lang = settings.lang;

  const [chip, setChip] = useState<ChipKey>("all");

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [read, setRead] = useState<Record<string, boolean>>({});

  const allNewsRef = useRef<NewsItem[]>(buildMockNews());
  const allNews = allNewsRef.current;

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookmarksRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  const theme = useMemo(() => {
    const dark = settings.darkMode;
    return {
      dark,
      bg: dark ? "#0B0B0D" : colors.white,
      card: dark ? "#111115" : colors.white,
      border: dark ? "rgba(255,255,255,0.12)" : colors.border,
      text: dark ? "#F8FAFC" : colors.text,
      muted: dark ? "#A1A1AA" : colors.muted,
      soft: dark ? "#1B1B22" : "#F7F7F9",
      badgeBg: dark ? "rgba(96,165,250,0.10)" : "#F5F7FF",
      badgeText: colors.navy,
    };
  }, [settings.darkMode]);

  // ✅ FIX #1: Screen.style у тебя ожидает ViewStyle (не массив). Делаем flatten -> ViewStyle.
  const screenStyle = useMemo<ViewStyle>(() => {
    return StyleSheet.flatten([styles.screen, { backgroundColor: theme.bg }]) as ViewStyle;
  }, [theme.bg]);

  const bookmarkCount = useMemo(() => Object.values(bookmarks).filter(Boolean).length, [bookmarks]);

  const dayNews = useMemo(() => allNews.slice(0, 2), [allNews]);
  const trending = useMemo(() => allNews.slice(2, 8), [allNews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allNews
      .filter((n) => (chip === "all" ? true : n.category === chip))
      .filter((n) => {
        if (!q) return true;
        const title = (lang === "RU" ? n.titleRU : n.titleKZ).toLowerCase();
        const sub = (lang === "RU" ? n.subtitleRU : n.subtitleKZ).toLowerCase();
        return title.includes(q) || sub.includes(q);
      });
  }, [allNews, chip, query, lang]);

  const list = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const [active, setActive] = useState<NewsItem | null>(null);

  const openItem = useCallback((n: NewsItem) => {
    setRead((prev) => (prev[n.id] ? prev : { ...prev, [n.id]: true }));
    setActive(n);
  }, []);

  const buildFavoritesPreview = useCallback((map: Record<string, boolean>) => {
    const savedIds = Object.keys(map).filter((id) => map[id]);
    if (savedIds.length === 0) return [] as FavoritePreview[];

    const byId = new Map<string, NewsItem>();
    for (const n of allNewsRef.current) byId.set(n.id, n);

    const res: FavoritePreview[] = [];
    for (const id of savedIds) {
      const n = byId.get(id);
      if (!n) continue;
      res.push({
        id: n.id,
        titleRU: n.titleRU,
        titleKZ: n.titleKZ,
        subtitleRU: n.subtitleRU,
        subtitleKZ: n.subtitleKZ,
        source: n.source,
        createdAtISO: n.createdAtISO,
        url: n.url,
      });
    }

    res.sort((a, b) => (b.createdAtISO ?? "").localeCompare(a.createdAtISO ?? ""));
    return res;
  }, []);

  const persistFavoritesDebounced = useCallback(
    (next: Record<string, boolean>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const previews = buildFavoritesPreview(next);
          await AsyncStorage.multiSet([
            [KEY_FAVORITES, JSON.stringify(next)],
            [KEY_FAVORITES_ITEMS, JSON.stringify(previews)],
          ]);
        } catch {
          // молча
        }
      }, 220);
    },
    [buildFavoritesPreview]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBookmarks((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        persistFavoritesDebounced(next);
        return next;
      });
    },
    [persistFavoritesDebounced]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 650));

    const head = allNewsRef.current.slice(0, 6);
    const tail = allNewsRef.current.slice(6).sort(() => Math.random() - 0.5);
    allNewsRef.current = [...head, ...tail];

    setVisibleCount(6);
    setQuery("");
    setRefreshing(false);

    persistFavoritesDebounced(bookmarksRef.current);
  }, [persistFavoritesDebounced]);

  const loadMore = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount((v) => Math.min(v + 8, filtered.length));
  }, [filtered.length]);

  const toggleLang = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSettings((p) => ({ ...p, lang: p.lang === "RU" ? "KZ" : "RU" }));

    try {
      const raw = await AsyncStorage.getItem(KEY_PROFILE_SETTINGS);
      const prev = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
      const nextLang: Lang = settings.lang === "RU" ? "KZ" : "RU";

      await AsyncStorage.setItem(
        KEY_PROFILE_SETTINGS,
        JSON.stringify({
          lang: nextLang,
          darkMode: typeof prev.darkMode === "boolean" ? prev.darkMode : settings.darkMode,
        })
      );
    } catch {
      // молча
    }
  }, [settings.lang, settings.darkMode]);

  const shareActive = useCallback(async () => {
    if (!active) return;
    const title = lang === "RU" ? active.titleRU : active.titleKZ;
    const text = lang === "RU" ? active.subtitleRU : active.subtitleKZ;
    try {
      await Share.share({
        message: `${title}\n\n${text}${active.url ? `\n\n${active.url}` : ""}`,
      });
    } catch {}
  }, [active, lang]);

  const openSource = useCallback(async () => {
    if (!active?.url) return;
    try {
      await Linking.openURL(active.url);
    } catch {}
  }, [active]);

  useEffect(() => {
    if (visibleCount > filtered.length) setVisibleCount(Math.min(6, filtered.length));
  }, [filtered.length, visibleCount]);

  const hydrate = useCallback(async () => {
    try {
      const [settingsRaw, favRaw] = await Promise.all([
        AsyncStorage.getItem(KEY_PROFILE_SETTINGS),
        AsyncStorage.getItem(KEY_FAVORITES),
      ]);

      if (settingsRaw) {
        const s = JSON.parse(settingsRaw) as Partial<Settings>;
        setSettings((p) => ({
          lang: (s.lang ?? p.lang) as Lang,
          darkMode: typeof s.darkMode === "boolean" ? s.darkMode : p.darkMode,
        }));
      }

      if (favRaw) {
        const map = JSON.parse(favRaw) as Record<string, boolean>;
        setBookmarks(map ?? {});
      } else {
        setBookmarks({});
      }
    } catch {
      // молча
    }
  }, []);

  useEffect(() => {
    hydrate();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate])
  );

  // ✅ FIX #2: LinearGradient.colors должен быть tuple (не string[])
  const heroGradient = useMemo<readonly [ColorValue, ColorValue, ColorValue]>(() => {
    if (!theme.dark) return ["#0B1E5B", "#1B2C63", theme.bg];
    return ["#0B1E5B", "#0F172A", theme.bg];
  }, [theme.bg, theme.dark]);

  return (
    <Screen style={screenStyle}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 6 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={heroGradient}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { borderColor: theme.border }]}
        >
          <View style={styles.header}>
            <Image source={LOGO} style={styles.logo} />

            <View style={styles.headerRight}>
              <Pressable
                style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={toggleLang}
              >
                <Text style={[styles.pillText, { color: theme.text }]}>{lang}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.muted} />
              </Pressable>

              <Pressable
                style={[styles.iconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSearchOpen((v) => !v);
                  setQuery("");
                }}
              >
                <Ionicons name={searchOpen ? "close" : "search-outline"} size={22} color={theme.text} />
              </Pressable>

              <Pressable
                style={[styles.iconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={22} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={[styles.heroCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[styles.heroBig, { color: theme.text }]}>{filtered.length}</Text>
              <Text style={[styles.heroSmall, { color: theme.muted }]}>{t(lang, "материалов", "материал")}</Text>
            </View>
            <View style={[styles.heroCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[styles.heroBig, { color: theme.text }]}>{bookmarkCount}</Text>
              <Text style={[styles.heroSmall, { color: theme.muted }]}>{t(lang, "в избранном", "таңдаулыда")}</Text>
            </View>
            <View style={[styles.heroCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[styles.heroBig, { color: theme.text }]}>{Object.keys(read).length}</Text>
              <Text style={[styles.heroSmall, { color: theme.muted }]}>{t(lang, "прочитано", "оқылды")}</Text>
            </View>
          </View>

          {searchOpen && (
            <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Ionicons name="search-outline" size={18} color={theme.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t(lang, "Поиск по новостям и статьям…", "Жаңалықтар мен мақалалардан іздеу…")}
                placeholderTextColor={theme.muted}
                style={[styles.searchInput, { color: theme.text }]}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {!!query && (
                <Pressable onPress={() => setQuery("")} hitSlop={12}>
                  <Ionicons name="close-circle" size={18} color={theme.muted} />
                </Pressable>
              )}
            </View>
          )}
        </LinearGradient>

        {/* Новости дня */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Новости дня", "Күн жаңалықтары")}</Text>
          <Text style={[styles.sectionHint, { color: theme.muted }]}>{t(lang, "самое важное", "ең маңыздысы")}</Text>
        </View>

        <View style={[styles.cardList, { borderColor: theme.border, backgroundColor: theme.card }]}>
          {dayNews.map((n, idx) => {
            const title = lang === "RU" ? n.titleRU : n.titleKZ;
            const subtitle = lang === "RU" ? n.subtitleRU : n.subtitleKZ;
            const isSaved = !!bookmarks[n.id];
            const isRead = !!read[n.id];

            return (
              <Pressable
                key={n.id}
                style={[styles.newsRow, idx !== 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}
                onPress={() => openItem(n)}
              >
                <View style={[styles.thumb, { borderColor: theme.border, backgroundColor: theme.soft }]}>
                  <Ionicons name="flash-outline" size={18} color={colors.navy} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.newsTopLine}>
                    <Text style={[styles.newsMeta, { color: theme.muted }]}>
                      {n.source} • {fmtDate(n.createdAtISO, lang)} • {n.minutes}
                      {t(lang, " мин", " мин")}
                    </Text>
                    {isRead && (
                      <Text
                        style={[
                          styles.readBadge,
                          { backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.border },
                        ]}
                      >
                        {t(lang, "прочитано", "оқылды")}
                      </Text>
                    )}
                  </View>

                  <Text style={[styles.newsTitle, { color: theme.text }]} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={[styles.newsSubtitle, { color: theme.muted }]} numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>

                <Pressable
                  hitSlop={12}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    toggleBookmark(n.id);
                  }}
                  style={[styles.saveBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={isSaved ? colors.navy : theme.muted}
                  />
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        {/* Тренды */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Тренды", "Трендтер")}</Text>
          <Text style={[styles.sectionHint, { color: theme.muted }]}>{t(lang, "подборка", "іріктеу")}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
          {trending.map((n) => {
            const title = lang === "RU" ? n.titleRU : n.titleKZ;
            const isSaved = !!bookmarks[n.id];
            return (
              <Pressable
                key={n.id}
                style={[styles.trendCard, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={() => openItem(n)}
              >
                <View style={styles.trendTop}>
                  <View style={[styles.trendIcon, { borderColor: theme.border, backgroundColor: theme.soft }]}>
                    <Ionicons name="trending-up-outline" size={18} color={theme.text} />
                  </View>
                  <Pressable
                    hitSlop={12}
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      toggleBookmark(n.id);
                    }}
                  >
                    <Ionicons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={18}
                      color={isSaved ? colors.navy : theme.muted}
                    />
                  </Pressable>
                </View>

                <Text style={[styles.trendTitle, { color: theme.text }]} numberOfLines={3}>
                  {title}
                </Text>
                <Text style={[styles.trendMeta, { color: theme.muted }]}>
                  {n.source} • {n.minutes}
                  {t(lang, " мин", " мин")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Фильтры */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t(lang, "Лента", "Лента")}</Text>
          <Text style={[styles.sectionHint, { color: theme.muted }]}>{t(lang, "фильтры", "сүзгілер")}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          {CHIPS.map((c) => {
            const activeChip = c.key === chip;
            const label = lang === "RU" ? c.labelRU : c.labelKZ;
            return (
              <Pressable
                key={c.key}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setChip(c.key as ChipKey);
                  setVisibleCount(6);
                }}
                style={[
                  styles.chip,
                  { borderColor: activeChip ? colors.navy : theme.border },
                  { backgroundColor: activeChip ? colors.navy : theme.card },
                ]}
              >
                <Text style={[styles.chipText, { color: activeChip ? "#fff" : theme.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Список */}
        {list.length === 0 ? (
          <View style={[styles.empty, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={26} color={theme.muted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t(lang, "Ничего не найдено", "Ештеңе табылмады")}</Text>
            <Text style={[styles.emptySub, { color: theme.muted }]}>
              {t(lang, "Попробуй другой запрос или сними фильтр.", "Басқа сұрау жазып көр немесе сүзгіні алып таста.")}
            </Text>
          </View>
        ) : (
          <View style={styles.feed}>
            {list.map((n) => {
              const title = lang === "RU" ? n.titleRU : n.titleKZ;
              const subtitle = lang === "RU" ? n.subtitleRU : n.subtitleKZ;
              const isSaved = !!bookmarks[n.id];
              const isRead = !!read[n.id];

              return (
                <Pressable
                  key={n.id}
                  style={[styles.feedRow, { borderColor: theme.border, backgroundColor: theme.card }]}
                  onPress={() => openItem(n)}
                >
                  <View style={[styles.feedThumb, { borderColor: theme.border, backgroundColor: theme.soft }]}>
                    <Ionicons
                      name={
                        n.category === "law"
                          ? "shield-checkmark-outline"
                          : n.category === "tech"
                          ? "sparkles-outline"
                          : n.category === "soc"
                          ? "people-outline"
                          : "briefcase-outline"
                      }
                      size={18}
                      color={theme.text}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.newsTopLine}>
                      <Text style={[styles.newsMeta, { color: theme.muted }]}>
                        {n.source} • {fmtDate(n.createdAtISO, lang)} • {n.minutes}
                        {t(lang, " мин", " мин")}
                      </Text>
                      {isRead && (
                        <Text
                          style={[
                            styles.readBadge,
                            { backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.border },
                          ]}
                        >
                          {t(lang, "прочитано", "оқылды")}
                        </Text>
                      )}
                    </View>

                    <Text style={[styles.feedTitle, { color: theme.text }]} numberOfLines={2}>
                      {title}
                    </Text>
                    <Text style={[styles.feedSub, { color: theme.muted }]} numberOfLines={2}>
                      {subtitle}
                    </Text>

                    <View style={styles.feedActions}>
                      <Pressable
                        onPress={(e: any) => {
                          e?.stopPropagation?.();
                          toggleBookmark(n.id);
                        }}
                        style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={16}
                          color={isSaved ? colors.navy : theme.muted}
                        />
                        <Text style={[styles.actionText, { color: theme.text }]}>
                          {isSaved ? t(lang, "Сохранено", "Сақталды") : t(lang, "В избранное", "Таңдаулыға")}
                        </Text>
                      </Pressable>

                      <View style={[styles.dot, { backgroundColor: theme.border }]} />

                      <Text style={[styles.actionHint, { color: theme.muted }]}>{t(lang, "Нажми, чтобы читать", "Оқу үшін бас")}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Load more */}
        {filtered.length > visibleCount && (
          <Pressable style={[styles.primaryBtn, { backgroundColor: colors.navy }]} onPress={loadMore}>
            <Text style={styles.primaryBtnText}>
              {t(lang, "Еще", "Тағы")} {Math.min(8, filtered.length - visibleCount)} {t(lang, "материалов", "материал")}
            </Text>
          </Pressable>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* DETAILS MODAL */}
      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)} presentationStyle="pageSheet">
        <View style={[styles.modalWrap, { paddingTop: insets.top + 10, backgroundColor: theme.bg }]}>
          <View style={styles.modalHeader}>
            <Pressable
              style={[styles.modalIconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => setActive(null)}
            >
              <Ionicons name="chevron-down" size={24} color={theme.text} />
            </Pressable>

            <Text style={[styles.modalHeaderTitle, { color: theme.text }]} numberOfLines={1}>
              {t(lang, "Материал", "Материал")}
            </Text>

            <Pressable
              style={[styles.modalIconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={shareActive}
            >
              <Ionicons name="share-outline" size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
            {active && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{lang === "RU" ? active.titleRU : active.titleKZ}</Text>

                <Text style={[styles.modalMeta, { color: theme.muted }]}>
                  {active.source} • {fmtDate(active.createdAtISO, lang)} • {active.minutes}
                  {t(lang, " мин чтения", " мин оқу")}
                </Text>

                <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

                <Text style={[styles.modalBody, { color: theme.text }]}>{lang === "RU" ? active.bodyRU : active.bodyKZ}</Text>

                {!!active.url && (
                  <Pressable style={[styles.openBtn, { backgroundColor: colors.navy }]} onPress={openSource}>
                    <Ionicons name="open-outline" size={18} color="#fff" />
                    <Text style={styles.openBtnText}>{t(lang, "Открыть источник", "Дереккөзді ашу")}</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                  onPress={() => toggleBookmark(active.id)}
                >
                  <Ionicons name={bookmarks[active.id] ? "bookmark" : "bookmark-outline"} size={18} color={theme.text} />
                  <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                    {bookmarks[active.id]
                      ? t(lang, "Убрать из избранного", "Таңдаулыдан алып тастау")
                      : t(lang, "Добавить в избранное", "Таңдаулыға қосу")}
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  hero: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  logo: { height: 22, width: 110, resizeMode: "contain" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: { fontWeight: "800", fontSize: 12 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  heroCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  heroBig: { fontSize: 18, fontWeight: "900" },
  heroSmall: { marginTop: 4, fontSize: 11, fontWeight: "700" },

  searchWrap: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 14 },

  sectionHead: { marginTop: 8, flexDirection: "row", alignItems: "baseline", gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionHint: { fontSize: 12, fontWeight: "800" },

  cardList: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  newsRow: { flexDirection: "row", gap: 12, padding: 14, alignItems: "center" },
  thumb: {
    width: 54,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  newsTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  newsMeta: { fontSize: 11, fontWeight: "700" },
  readBadge: {
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  newsTitle: { fontSize: 14, fontWeight: "900", marginTop: 6 },
  newsSubtitle: { fontSize: 12, marginTop: 4 },

  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  trendCard: {
    width: 190,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
  },
  trendTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trendIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trendTitle: { marginTop: 10, fontSize: 13, fontWeight: "900", lineHeight: 18 },
  trendMeta: { marginTop: 8, fontSize: 11, fontWeight: "700" },

  primaryBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "900" },

  feed: { marginTop: 6 },
  feedRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
  },
  feedThumb: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedTitle: { marginTop: 6, fontSize: 14, fontWeight: "900" },
  feedSub: { marginTop: 4, fontSize: 12 },

  feedActions: { marginTop: 10, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionText: { fontSize: 11, fontWeight: "900" },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 10 },
  actionHint: { fontSize: 11, fontWeight: "800" },

  empty: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 14, fontWeight: "900" },
  emptySub: { marginTop: 6, fontSize: 12, textAlign: "center", lineHeight: 18 },

  modalWrap: { flex: 1, paddingHorizontal: 16 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  modalIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "900" },

  modalTitle: { marginTop: 10, fontSize: 22, fontWeight: "900", lineHeight: 28 },
  modalMeta: { marginTop: 10, fontSize: 12, fontWeight: "700" },
  modalDivider: { marginTop: 14, height: 1 },
  modalBody: { marginTop: 14, fontSize: 14, lineHeight: 20 },

  openBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  openBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  secondaryBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtnText: { fontWeight: "900", fontSize: 14 },
});
