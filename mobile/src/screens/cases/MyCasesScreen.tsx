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
type CaseStatus = "Черновик" | "В работе" | "Нужны документы" | "Завершено";

type MyCase = {
  id: string;
  title: string;
  subtitle: string;
  status: CaseStatus;
  updatedAt: number; // ms
  createdAt: number; // ms
  priority: "low" | "mid" | "high";
  tags: string[];
};

type TimelineItem = {
  id: string;
  caseId: string;
  title: string;
  time: number; // ms
  type: "note" | "doc" | "status";
};

// -------------------- Mock data (потом заменишь на Firestore/REST) --------------------
const NOW = Date.now();
const day = (n: number) => n * 24 * 60 * 60 * 1000;

const MOCK_CASES: MyCase[] = [
  {
    id: "c1",
    title: "Трудовой спор: увольнение",
    subtitle: "Проверить законность, подготовить заявление",
    status: "В работе",
    createdAt: NOW - day(18),
    updatedAt: NOW - day(1),
    priority: "high",
    tags: ["работа", "увольнение", "документы"],
  },
  {
    id: "c2",
    title: "Алименты и порядок общения",
    subtitle: "Собрать пакет документов, черновик заявления",
    status: "Нужны документы",
    createdAt: NOW - day(9),
    updatedAt: NOW - day(2),
    priority: "mid",
    tags: ["семья", "дети"],
  },
  {
    id: "c3",
    title: "Штраф/протокол: разбор ситуации",
    subtitle: "Понять, как обжаловать и что приложить",
    status: "Черновик",
    createdAt: NOW - day(3),
    updatedAt: NOW - day(3),
    priority: "low",
    tags: ["админ", "штраф"],
  },
  {
    id: "c4",
    title: "Претензия продавцу",
    subtitle: "Досудебная претензия + сроки",
    status: "Завершено",
    createdAt: NOW - day(30),
    updatedAt: NOW - day(12),
    priority: "mid",
    tags: ["гражданское", "претензия"],
  },
];

const MOCK_TIMELINE: TimelineItem[] = [
  { id: "t1", caseId: "c1", title: "Статус: В работе", time: NOW - day(1), type: "status" },
  { id: "t2", caseId: "c1", title: "Добавлена заметка: факты по делу", time: NOW - day(2), type: "note" },
  { id: "t3", caseId: "c2", title: "Нужны документы: справки/свидетельства", time: NOW - day(2), type: "doc" },
  { id: "t4", caseId: "c3", title: "Создан черновик обращения", time: NOW - day(3), type: "note" },
];

// -------------------- Helpers --------------------
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function formatDateShort(ms: number) {
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function statusIcon(s: CaseStatus): keyof typeof Ionicons.glyphMap {
  switch (s) {
    case "Черновик":
      return "create-outline";
    case "В работе":
      return "rocket-outline";
    case "Нужны документы":
      return "document-text-outline";
    case "Завершено":
      return "checkmark-circle-outline";
    default:
      return "help-circle-outline";
  }
}

function priorityBadge(p: MyCase["priority"]) {
  // без тяжёлых теней/градиентов, просто аккуратный бейдж
  if (p === "high") return { bg: "#FFF1F2", border: "#FECDD3", text: "#9F1239", label: "Срочно" };
  if (p === "mid") return { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", label: "Важно" };
  return { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E3A8A", label: "Обычное" };
}

const FILTERS: { key: "all" | CaseStatus; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "В работе", label: "В работе" },
  { key: "Нужны документы", label: "Документы" },
  { key: "Черновик", label: "Черновики" },
  { key: "Завершено", label: "Завершено" },
];

// -------------------- Memo UI --------------------
const FilterChip = memo(function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.92 }]}>
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
});

const CaseCard = memo(function CaseCard({
  item,
  onOpen,
  onQuickAsk,
}: {
  item: MyCase;
  onOpen: (id: string) => void;
  onQuickAsk: (id: string) => void;
}) {
  const pb = priorityBadge(item.priority);

  return (
    <Pressable onPress={() => onOpen(item.id)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.cardTop}>
        <View style={styles.statusPill}>
          <Ionicons name={statusIcon(item.status)} size={14} color={colors.text} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        <View style={[styles.priorityPill, { backgroundColor: pb.bg, borderColor: pb.border }]}>
          <Text style={[styles.priorityText, { color: pb.text }]}>{pb.label}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardSub} numberOfLines={2}>
        {item.subtitle}
      </Text>

      <View style={styles.cardMetaRow}>
        <Ionicons name="time-outline" size={14} color={colors.muted} />
        <Text style={styles.cardMetaText}>Обновлено: {formatDateShort(item.updatedAt)}</Text>
      </View>

      <View style={styles.tagRow}>
        {item.tags.slice(0, 3).map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>#{t}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <Pressable onPress={() => onQuickAsk(item.id)} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.92 }]}>
          <Ionicons name="sparkles-outline" size={16} color={colors.text} />
          <Text style={styles.actionText}>Спросить AI</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
    </Pressable>
  );
});

const TimelineRow = memo(function TimelineRow({ item }: { item: TimelineItem }) {
  const icon: keyof typeof Ionicons.glyphMap =
    item.type === "status" ? "pulse-outline" : item.type === "doc" ? "attach-outline" : "chatbubble-ellipses-outline";

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineDotWrap}>
        <View style={styles.timelineDot} />
      </View>
      <View style={styles.timelineCard}>
        <View style={styles.timelineTop}>
          <Ionicons name={icon} size={14} color={colors.muted} />
          <Text style={styles.timelineTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.timelineTime}>{formatDateShort(item.time)}</Text>
      </View>
    </View>
  );
});

// -------------------- Screen --------------------
export default function MyCasesScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);
  const [filter, setFilter] = useState<"all" | CaseStatus>("all");

  const listRef = useRef<SectionList<any>>(null);
  const [heroShadow, setHeroShadow] = useState(false);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let base = filter === "all" ? MOCK_CASES : MOCK_CASES.filter((c) => c.status === filter);

    if (!q) {
      // сначала активные, потом завершённые; внутри — по updatedAt
      base = [...base].sort((a, b) => {
        const aDone = a.status === "Завершено" ? 1 : 0;
        const bDone = b.status === "Завершено" ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;
        return b.updatedAt - a.updatedAt;
      });
      return base;
    }

    const score = (c: MyCase) => {
      let s = 0;
      const hay = `${c.title} ${c.subtitle} ${c.tags.join(" ")}`.toLowerCase();
      if (hay.includes(q)) s += 100;
      // лёгкое смещение к свежим
      s += Math.min(20, Math.round((NOW - c.updatedAt) / day(1)) * -1);
      if (c.priority === "high") s += 12;
      if (c.priority === "mid") s += 6;
      return s;
    };

    return [...base]
      .map((c) => ({ c, s: score(c) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [debouncedQuery, filter]);

  const stats = useMemo(() => {
    const total = MOCK_CASES.length;
    const active = MOCK_CASES.filter((c) => c.status !== "Завершено").length;
    const needDocs = MOCK_CASES.filter((c) => c.status === "Нужны документы").length;
    return { total, active, needDocs };
  }, []);

  const sections = useMemo(() => {
    return [
      { key: "cases", title: "Кейсы", data: filtered },
      { key: "timeline", title: "Лента обновлений", data: MOCK_TIMELINE.slice(0, 6) },
    ];
  }, [filtered]);

  const onCreateCase = useCallback(() => {
    // TODO: navigation.navigate("CreateCase")
    // eslint-disable-next-line no-alert
    alert("Создание кейса (подключим экран следующим шагом)");
  }, []);

  const onOpenCase = useCallback((id: string) => {
    const c = MOCK_CASES.find((x) => x.id === id);
    if (!c) return;
    // eslint-disable-next-line no-alert
    alert(`${c.title}\n\n(Экран деталей кейса подключим следующим шагом)`);
  }, []);

  const onQuickAsk = useCallback((id: string) => {
    const c = MOCK_CASES.find((x) => x.id === id);
    if (!c) return;
    // eslint-disable-next-line no-alert
    alert(`AI: сформируем вопрос по кейсу “${c.title}”\n\n(позже свяжем с ChatScreen и авто-вставкой промпта)`);
  }, []);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderItem = useCallback(
    ({ item, section }: { item: any; section: any }) => {
      if (section.key === "cases") {
        return <CaseCard item={item as MyCase} onOpen={onOpenCase} onQuickAsk={onQuickAsk} />;
      }
      return <TimelineRow item={item as TimelineItem} />;
    },
    [onOpenCase, onQuickAsk]
  );

  const renderSectionHeader = useCallback(({ section }: { section: any }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.key === "cases" ? (
          <Text style={styles.sectionHint}>{filtered.length > 0 ? `${filtered.length} показано` : "Ничего"}</Text>
        ) : null}
      </View>
    );
  }, [filtered.length]);

  const listHeader = useMemo(() => {
    const GRAD = ["#0B1E5B", "#162A63", "#FFFFFF"] as const;

    return (
      <View>
        <LinearGradient colors={GRAD} locations={[0, 0.62, 1]} style={styles.hero}>
          <Header />
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Мои дела</Text>
              <Text style={styles.heroSub}>История обращений, статусы и быстрые действия.</Text>
            </View>

            <Pressable onPress={onCreateCase} style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.92 }]}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newBtnText}>Новое</Text>
            </Pressable>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLbl}>Всего</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.active}</Text>
              <Text style={styles.statLbl}>Активные</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.needDocs}</Text>
              <Text style={styles.statLbl}>Нужны доки</Text>
            </View>
          </View>

          <View style={[styles.searchWrap, heroShadow && styles.searchWrapShadow]}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Поиск по кейсам: увольнение, алименты…"
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

          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <FilterChip
                key={String(f.key)}
                label={f.label}
                active={filter === f.key}
                onPress={() => {
                  setFilter(f.key);
                  requestAnimationFrame(() => {
                    listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true });
                  });
                }}
              />
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  }, [filter, heroShadow, onCreateCase, query, stats.active, stats.needDocs, stats.total]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const next = y > 16;
    setHeroShadow((prev) => (prev === next ? prev : next));
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
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  heroTitle: {
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

  newBtn: {
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  newBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  statRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNum: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  statLbl: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: colors.muted,
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
  searchWrapShadow: {
    borderColor: colors.border,
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

  filterRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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

  // Sections
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

  // Case card
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.text,
  },
  priorityPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 20,
  },
  cardSub: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  cardMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardMetaText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "700",
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
  cardActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    height: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.03)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.text,
  },

  // Timeline
  timelineRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  timelineDotWrap: {
    width: 14,
    alignItems: "center",
    paddingTop: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  timelineTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 18,
  },
  timelineTime: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
    fontWeight: "700",
  },
});
