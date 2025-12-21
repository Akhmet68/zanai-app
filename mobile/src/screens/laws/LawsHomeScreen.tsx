import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

// -------------------- Types --------------------
type LawCategory = "Труд" | "Семья" | "Налоги" | "Админ" | "Уголовное" | "Гражданское";

type LawArticle = {
  id: string;
  title: string;
  snippet: string;
  category: LawCategory;
  tags: string[];
  popularity: number; // для сортировки "популярного"
};

type FaqItem = {
  id: string;
  q: string;
  a: string;
  category?: LawCategory;
};

// -------------------- Mock data (замени на реальные данные позже) --------------------
const CATEGORIES: { key: "all" | LawCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "Все", icon: "apps-outline" },
  { key: "Труд", label: "Труд", icon: "briefcase-outline" },
  { key: "Семья", label: "Семья", icon: "people-outline" },
  { key: "Налоги", label: "Налоги", icon: "card-outline" },
  { key: "Админ", label: "Админ", icon: "document-text-outline" },
  { key: "Уголовное", label: "Уголовное", icon: "shield-outline" },
  { key: "Гражданское", label: "Гражданское", icon: "home-outline" },
];

const MOCK_ARTICLES: LawArticle[] = [
  {
    id: "a1",
    title: "Трудовой договор: что важно проверить",
    snippet: "Срок, зарплата, испытательный период, увольнение и обязанности сторон — короткий чек-лист.",
    category: "Труд",
    tags: ["договор", "работа", "увольнение"],
    popularity: 95,
  },
  {
    id: "a2",
    title: "Штрафы и протокол: что делать на месте",
    snippet: "Как корректно общаться, что можно требовать, когда подписывать, а когда — нет.",
    category: "Админ",
    tags: ["штраф", "протокол", "права"],
    popularity: 88,
  },
  {
    id: "a3",
    title: "Развод и алименты: базовые шаги",
    snippet: "Куда обращаться, какие документы готовить и что влияет на размер алиментов.",
    category: "Семья",
    tags: ["развод", "алименты", "дети"],
    popularity: 92,
  },
  {
    id: "a4",
    title: "Налоги для самозанятых: кратко и по делу",
    snippet: "Регистрация, режимы, отчётность и частые ошибки.",
    category: "Налоги",
    tags: ["самозанятый", "отчётность", "регистрация"],
    popularity: 84,
  },
  {
    id: "a5",
    title: "Претензия и досудебное урегулирование",
    snippet: "Как составить претензию, сроки, доказательства и типовые формулировки без воды.",
    category: "Гражданское",
    tags: ["претензия", "суд", "документы"],
    popularity: 79,
  },
];

const MOCK_FAQ: FaqItem[] = [
  {
    id: "f1",
    q: "Можно ли использовать чат как юридическую консультацию?",
    a: "Чат помогает с пониманием общих принципов и подготовкой черновиков документов. Для конкретного дела лучше проверить детали и нормы по актуальной редакции и при необходимости обратиться к юристу.",
  },
  {
    id: "f2",
    q: "Как быстро найти нужную статью?",
    a: "Начни с категории, затем уточни запрос в поиске (например: “алименты”, “протокол”, “увольнение”). Результаты сортируются по релевантности + популярности.",
  },
  {
    id: "f3",
    q: "Что добавить в запрос, чтобы ответ был точнее?",
    a: "Город/регион, дату события, вашу роль (работник/работодатель), что уже подписано, есть ли переписка/доказательства. Чем конкретнее — тем лучше.",
  },
];

// -------------------- Small perf helpers --------------------
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function scoreArticle(a: LawArticle, q: string) {
  // дешёвая релевантность: title/snippet/tags + popularity
  const s = q.toLowerCase();
  if (!s) return a.popularity;

  const hayTitle = a.title.toLowerCase();
  const haySnip = a.snippet.toLowerCase();
  const tags = a.tags.join(" ").toLowerCase();

  let score = 0;
  if (hayTitle.includes(s)) score += 120;
  if (tags.includes(s)) score += 60;
  if (haySnip.includes(s)) score += 30;

  // чуть “подмешиваем” популярность, но не даём ей доминировать
  score += Math.min(30, Math.round(a.popularity / 4));
  return score;
}

// -------------------- UI pieces (memo) --------------------
const CategoryChip = memo(function CategoryChip({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.92 }]}>
      <Ionicons name={icon} size={16} color={active ? "#fff" : colors.text} />
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
});

const ArticleCard = memo(function ArticleCard({
  item,
  onOpen,
}: {
  item: LawArticle;
  onOpen: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onOpen(item.id)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardSnippet} numberOfLines={2}>
        {item.snippet}
      </Text>

      <View style={styles.tagRow}>
        {item.tags.slice(0, 3).map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>#{t}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
});

const FaqRow = memo(function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={({ pressed }) => [styles.faqRow, pressed && { opacity: 0.92 }]}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ} numberOfLines={2}>
          {item.q}
        </Text>
        <Ionicons name={open ? "remove-circle-outline" : "add-circle-outline"} size={22} color={colors.muted} />
      </View>
      {open ? <Text style={styles.faqA}>{item.a}</Text> : null}
    </Pressable>
  );
});

// -------------------- Screen --------------------
export default function LawsHomeScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);

  const [cat, setCat] = useState<"all" | LawCategory>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const listRef = useRef<SectionList<any>>(null);
  const [shadowHeader, setShadowHeader] = useState(false);

  const onOpenArticle = useCallback((id: string) => {
    // TODO: заменить на navigation.navigate("LawDetails", { id })
    // чтобы сейчас было “вау” и понятно, что нажимается:
    const a = MOCK_ARTICLES.find((x) => x.id === id);
    if (!a) return;
    // без Alert, если не хочешь — можно потом заменить на экран деталей
    // но Alert лёгкий и не грузит UI
    // eslint-disable-next-line no-alert
    alert(`${a.title}\n\n(Детальный экран подключим следующим шагом)`);
  }, []);

  const filteredArticles = useMemo(() => {
    const q = (debouncedQuery ?? "").trim().toLowerCase();
    const base = cat === "all" ? MOCK_ARTICLES : MOCK_ARTICLES.filter((a) => a.category === cat);

    if (!q) {
      // "популярное" сверху
      return [...base].sort((a, b) => b.popularity - a.popularity);
    }

    // считаем score один раз, сортируем
    const scored = base
      .map((a) => ({ a, s: scoreArticle(a, q) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.a);

    return scored;
  }, [debouncedQuery, cat]);

  const sections = useMemo(() => {
    return [
      { key: "articles", title: "Статьи и гайды", data: filteredArticles },
      { key: "faq", title: "FAQ", data: MOCK_FAQ },
    ];
  }, [filteredArticles]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderItem = useCallback(
    ({ item, section }: { item: any; section: any }) => {
      if (section.key === "articles") {
        return <ArticleCard item={item as LawArticle} onOpen={onOpenArticle} />;
      }
      const f = item as FaqItem;
      const open = openFaqId === f.id;
      return <FaqRow item={f} open={open} onToggle={() => setOpenFaqId((p) => (p === f.id ? null : f.id))} />;
    },
    [onOpenArticle, openFaqId]
  );

  const renderSectionHeader = useCallback(({ section }: { section: any }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.key === "articles" ? (
          <Text style={styles.sectionHint}>
            {filteredArticles.length > 0 ? `${filteredArticles.length} найдено` : "Ничего не найдено"}
          </Text>
        ) : null}
      </View>
    );
  }, [filteredArticles.length]);

  const listHeader = useMemo(() => {
    const GRAD = ["#0B1E5B", "#162A63", "#FFFFFF"] as const;

    return (
      <View>
        <LinearGradient colors={GRAD} locations={[0, 0.62, 1]} style={styles.hero}>
          <Header />
          <Text style={styles.heroTitle}>Законы</Text>
          <Text style={styles.heroSub}>Поиск по статьям, FAQ и категориям — быстро и по делу.</Text>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Например: алименты, протокол, увольнение…"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={10} style={styles.clearBtn}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.quickRow}>
            <View style={styles.quickPill}>
              <Ionicons name="sparkles-outline" size={14} color={colors.navy} />
              <Text style={styles.quickText}>Подборки</Text>
            </View>
            <View style={styles.quickPill}>
              <Ionicons name="time-outline" size={14} color={colors.navy} />
              <Text style={styles.quickText}>Недавнее</Text>
            </View>
            <View style={styles.quickPill}>
              <Ionicons name="bookmark-outline" size={14} color={colors.navy} />
              <Text style={styles.quickText}>Сохранённое</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.catWrap, shadowHeader && styles.catShadow]}>
          <SectionList
            // хак: используем SectionList как горизонтальный список без лишних зависимостей? нет.
            // поэтому ниже делаем row вручную, без вложенного FlatList, чтобы не ловить лишние re-render’ы.
            sections={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => (
                  <CategoryChip
                    key={String(c.key)}
                    icon={c.icon}
                    label={c.label}
                    active={cat === c.key}
                    onPress={() => {
                      setCat(c.key);
                      // слегка прокручиваем вверх к результатам
                      requestAnimationFrame(() => listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true }));
                    }}
                  />
                ))}
              </View>
            }
          />
        </View>
      </View>
    );
  }, [cat, query, shadowHeader]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    // лёгкая тень под “категории”, когда пользователь проскроллил hero
    const next = y > 24;
    // минимизируем setState
    setShadowHeader((prev) => (prev === next ? prev : next));
  }, []);

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SectionList
          ref={listRef as any}
          sections={sections as any}
          keyExtractor={keyExtractor}
          renderItem={renderItem as any}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={listHeader}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={9}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 18,
    backgroundColor: colors.bg,
  },

  // Hero
  hero: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.2,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 18,
  },

  searchWrap: {
    marginTop: 12,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  quickRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },

  // Categories
  catWrap: {
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  catShadow: {
    // лёгкая “граница”, без тяжёлого blur
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.text,
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: colors.bg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "700",
  },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.text,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 20,
  },
  cardSnippet: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  tagRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.muted,
  },

  // FAQ
  faqRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  faqQ: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 19,
  },
  faqA: {
    marginTop: 10,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
