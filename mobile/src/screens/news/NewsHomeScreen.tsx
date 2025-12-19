import React, { useEffect, useMemo, useRef, useState } from "react";
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

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

type Lang = "RU" | "KZ";

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

function fmtDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return lang === "RU" ? `${dd}.${mm}.${yyyy}` : `${dd}.${mm}.${yyyy}`;
}

function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

function buildMockNews(): NewsItem[] {
  // Демоданные — можно потом заменить на API/Firebase
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

  // Добавим ещё пачку “обычных” новостей
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

  const [lang, setLang] = useState<Lang>("RU");
  const [chip, setChip] = useState<ChipKey>("all");

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [read, setRead] = useState<Record<string, boolean>>({});

  const allNewsRef = useRef<NewsItem[]>(buildMockNews());
  const allNews = allNewsRef.current;

  const bookmarkCount = useMemo(
    () => Object.values(bookmarks).filter(Boolean).length,
    [bookmarks]
  );

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

  // Детали новости (модалка)
  const [active, setActive] = useState<NewsItem | null>(null);
  const openItem = (n: NewsItem) => {
    setRead((prev) => ({ ...prev, [n.id]: true }));
    setActive(n);
  };

  const toggleBookmark = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 700));
    // “обновление” демо: просто перемешаем хвост
    const head = allNewsRef.current.slice(0, 6);
    const tail = allNewsRef.current.slice(6).sort(() => Math.random() - 0.5);
    allNewsRef.current = [...head, ...tail];
    setVisibleCount(6);
    setQuery("");
    setRefreshing(false);
  };

  const loadMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount((v) => Math.min(v + 8, filtered.length));
  };

  const toggleLang = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLang((v) => (v === "RU" ? "KZ" : "RU"));
  };

  const shareActive = async () => {
    if (!active) return;
    const title = lang === "RU" ? active.titleRU : active.titleKZ;
    const text = lang === "RU" ? active.subtitleRU : active.subtitleKZ;
    try {
      await Share.share({
        message: `${title}\n\n${text}${active.url ? `\n\n${active.url}` : ""}`,
      });
    } catch {
      // молча
    }
  };

  const openSource = async () => {
    if (!active?.url) return;
    try {
      await Linking.openURL(active.url);
    } catch {
      // молча
    }
  };

  // авто-сбрасываем “ещё” если фильтр/поиск сузили список
  useEffect(() => {
    if (visibleCount > filtered.length) setVisibleCount(Math.min(6, filtered.length));
  }, [filtered.length, visibleCount]);

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 6 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero / Header */}
        <LinearGradient
          colors={["#0B1E5B", "#1B2C63", "#FFFFFF"]}
          locations={[0, 0.55, 1]}
          style={styles.hero}
        >
          <View style={styles.header}>
            <Image source={LOGO} style={styles.logo} />

            <View style={styles.headerRight}>
              <Pressable style={styles.pill} onPress={toggleLang}>
                <Text style={styles.pillText}>{lang}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.muted} />
              </Pressable>

              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSearchOpen((v) => !v);
                  setQuery("");
                }}
              >
                <Ionicons name={searchOpen ? "close" : "search-outline"} size={22} color={colors.text} />
              </Pressable>

              <Pressable style={styles.iconBtn} onPress={() => {}}>
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroCard}>
              <Text style={styles.heroBig}>{filtered.length}</Text>
              <Text style={styles.heroSmall}>{t(lang, "материалов", "материал")}</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroBig}>{bookmarkCount}</Text>
              <Text style={styles.heroSmall}>{t(lang, "в избранном", "таңдаулыда")}</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroBig}>{Object.keys(read).length}</Text>
              <Text style={styles.heroSmall}>{t(lang, "прочитано", "оқылды")}</Text>
            </View>
          </View>

          {searchOpen && (
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t(lang, "Поиск по новостям и статьям…", "Жаңалықтар мен мақалалардан іздеу…")}
                placeholderTextColor="#9AA3AF"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {!!query && (
                <Pressable onPress={() => setQuery("")} hitSlop={12}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              )}
            </View>
          )}
        </LinearGradient>

        {/* Новости дня */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t(lang, "Новости дня", "Күн жаңалықтары")}</Text>
          <Text style={styles.sectionHint}>{t(lang, "самое важное", "ең маңыздысы")}</Text>
        </View>

        <View style={styles.cardList}>
          {dayNews.map((n, idx) => {
            const title = lang === "RU" ? n.titleRU : n.titleKZ;
            const subtitle = lang === "RU" ? n.subtitleRU : n.subtitleKZ;
            const isSaved = !!bookmarks[n.id];
            const isRead = !!read[n.id];

            return (
              <Pressable
                key={n.id}
                style={[styles.newsRow, idx !== 0 && styles.newsRowDivider]}
                onPress={() => openItem(n)}
              >
                <View style={styles.thumb}>
                  <Ionicons name="flash-outline" size={18} color={colors.navy} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.newsTopLine}>
                    <Text style={styles.newsMeta}>
                      {n.source} • {fmtDate(n.createdAtISO, lang)} • {n.minutes}{t(lang, " мин", " мин")}
                    </Text>
                    {isRead && <Text style={styles.readBadge}>{t(lang, "прочитано", "оқылды")}</Text>}
                  </View>

                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={styles.newsSubtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>

                <Pressable
                  hitSlop={12}
                  onPress={() => toggleBookmark(n.id)}
                  style={styles.saveBtn}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={isSaved ? colors.navy : colors.muted}
                  />
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        {/* Тренды */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>{t(lang, "Тренды", "Трендтер")}</Text>
          <Text style={styles.sectionHint}>{t(lang, "подборка", "іріктеу")}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
          {trending.map((n) => {
            const title = lang === "RU" ? n.titleRU : n.titleKZ;
            const isSaved = !!bookmarks[n.id];
            return (
              <Pressable key={n.id} style={styles.trendCard} onPress={() => openItem(n)}>
                <View style={styles.trendTop}>
                  <View style={styles.trendIcon}>
                    <Ionicons name="trending-up-outline" size={18} color={colors.text} />
                  </View>
                  <Pressable hitSlop={12} onPress={() => toggleBookmark(n.id)}>
                    <Ionicons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={18}
                      color={isSaved ? colors.navy : colors.muted}
                    />
                  </Pressable>
                </View>

                <Text style={styles.trendTitle} numberOfLines={3}>
                  {title}
                </Text>
                <Text style={styles.trendMeta}>
                  {n.source} • {n.minutes}{t(lang, " мин", " мин")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Фильтры */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>{t(lang, "Лента", "Лента")}</Text>
          <Text style={styles.sectionHint}>{t(lang, "фильтры", "сүзгілер")}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          {CHIPS.map((c) => {
            const active = c.key === chip;
            const label = lang === "RU" ? c.labelRU : c.labelKZ;
            return (
              <Pressable
                key={c.key}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setChip(c.key as ChipKey);
                  setVisibleCount(6);
                }}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Список */}
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={26} color={colors.muted} />
            <Text style={styles.emptyTitle}>{t(lang, "Ничего не найдено", "Ештеңе табылмады")}</Text>
            <Text style={styles.emptySub}>
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
                <Pressable key={n.id} style={styles.feedRow} onPress={() => openItem(n)}>
                  <View style={styles.feedThumb}>
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
                      color={colors.text}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.newsTopLine}>
                      <Text style={styles.newsMeta}>
                        {n.source} • {fmtDate(n.createdAtISO, lang)} • {n.minutes}{t(lang, " мин", " мин")}
                      </Text>
                      {isRead && <Text style={styles.readBadge}>{t(lang, "прочитано", "оқылды")}</Text>}
                    </View>

                    <Text style={styles.feedTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    <Text style={styles.feedSub} numberOfLines={2}>
                      {subtitle}
                    </Text>

                    <View style={styles.feedActions}>
                      <Pressable onPress={() => toggleBookmark(n.id)} style={styles.actionBtn}>
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={16}
                          color={isSaved ? colors.navy : colors.muted}
                        />
                        <Text style={styles.actionText}>
                          {isSaved ? t(lang, "Сохранено", "Сақталды") : t(lang, "В избранное", "Таңдаулыға")}
                        </Text>
                      </Pressable>

                      <View style={styles.dot} />

                      <Text style={styles.actionHint}>
                        {t(lang, "Нажми, чтобы читать", "Оқу үшін бас") }
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Load more */}
        {filtered.length > visibleCount && (
          <Pressable style={styles.primaryBtn} onPress={loadMore}>
            <Text style={styles.primaryBtnText}>
              {t(lang, "Еще", "Тағы")} {Math.min(8, filtered.length - visibleCount)} {t(lang, "материалов", "материал")}
            </Text>
          </Pressable>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* DETAILS MODAL */}
      <Modal
        visible={!!active}
        animationType="slide"
        onRequestClose={() => setActive(null)}
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalWrap, { paddingTop: insets.top + 10 }]}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalIconBtn} onPress={() => setActive(null)}>
              <Ionicons name="chevron-down" size={24} color={colors.text} />
            </Pressable>

            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {t(lang, "Материал", "Материал")}
            </Text>

            <Pressable style={styles.modalIconBtn} onPress={shareActive}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
            {active && (
              <>
                <Text style={styles.modalTitle}>
                  {lang === "RU" ? active.titleRU : active.titleKZ}
                </Text>

                <Text style={styles.modalMeta}>
                  {active.source} • {fmtDate(active.createdAtISO, lang)} • {active.minutes}
                  {t(lang, " мин чтения", " мин оқу")}
                </Text>

                <View style={styles.modalDivider} />

                <Text style={styles.modalBody}>
                  {lang === "RU" ? active.bodyRU : active.bodyKZ}
                </Text>

                {!!active.url && (
                  <Pressable style={styles.openBtn} onPress={openSource}>
                    <Ionicons name="open-outline" size={18} color="#fff" />
                    <Text style={styles.openBtnText}>{t(lang, "Открыть источник", "Дереккөзді ашу")}</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => toggleBookmark(active.id)}
                >
                  <Ionicons
                    name={bookmarks[active.id] ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={colors.text}
                  />
                  <Text style={styles.secondaryBtnText}>
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
    paddingBottom: 110, // место под tabbar
  },

  hero: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillText: { color: colors.text, fontWeight: "800", fontSize: 12 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  heroRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  heroCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  heroBig: { fontSize: 18, fontWeight: "900", color: colors.text },
  heroSmall: { marginTop: 4, fontSize: 11, color: colors.muted, fontWeight: "700" },

  searchWrap: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 14, color: colors.text },

  sectionHead: { marginTop: 8, flexDirection: "row", alignItems: "baseline", gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  sectionHint: { fontSize: 12, fontWeight: "800", color: colors.muted },

  cardList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  newsRow: { flexDirection: "row", gap: 12, padding: 14, alignItems: "center" },
  newsRowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  thumb: {
    width: 54,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },

  newsTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  newsMeta: { fontSize: 11, color: colors.muted, fontWeight: "700" },
  readBadge: {
    fontSize: 11,
    color: colors.navy,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F5F7FF",
    borderWidth: 1,
    borderColor: colors.border,
  },

  newsTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginTop: 6 },
  newsSubtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },

  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  trendCard: {
    width: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    marginRight: 10,
  },
  trendTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trendIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  trendTitle: { marginTop: 10, fontSize: 13, fontWeight: "900", color: colors.text, lineHeight: 18 },
  trendMeta: { marginTop: 8, fontSize: 11, color: colors.muted, fontWeight: "700" },

  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.navy,
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
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipInactive: { backgroundColor: colors.white, borderColor: colors.border },
  chipText: { fontSize: 12, fontWeight: "900" },
  chipTextActive: { color: "#fff" },
  chipTextInactive: { color: colors.text },

  feed: { marginTop: 6 },
  feedRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  feedThumb: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  feedTitle: { marginTop: 6, fontSize: 14, fontWeight: "900", color: colors.text },
  feedSub: { marginTop: 4, fontSize: 12, color: colors.muted },

  feedActions: { marginTop: 10, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: 11, fontWeight: "900", color: colors.text },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 10 },
  actionHint: { fontSize: 11, fontWeight: "800", color: colors.muted },

  empty: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 14, fontWeight: "900", color: colors.text },
  emptySub: { marginTop: 6, fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },

  // Modal
  modalWrap: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 16 },
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
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "900", color: colors.text },

  modalTitle: { marginTop: 10, fontSize: 22, fontWeight: "900", color: colors.text, lineHeight: 28 },
  modalMeta: { marginTop: 10, fontSize: 12, color: colors.muted, fontWeight: "700" },
  modalDivider: { marginTop: 14, height: 1, backgroundColor: colors.border },
  modalBody: { marginTop: 14, fontSize: 14, color: colors.text, lineHeight: 20 },

  openBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.navy,
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
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtnText: { color: colors.text, fontWeight: "900", fontSize: 14 },
});
