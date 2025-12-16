import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../core/colors";
import Screen from "../../ui/Screen";

const LOGO = require("../../../assets/zanai-logo.png");

type Chip = { key: string; label: string };

export default function NewsHomeScreen() {
  const [chip, setChip] = useState("all");

  const chips: Chip[] = useMemo(
    () => [
      { key: "all", label: "Все" },
      { key: "law", label: "Закон" },
      { key: "tech", label: "AI" },
      { key: "soc", label: "Общество" },
      { key: "biz", label: "Бизнес" },
    ],
    []
  );

  const dayNews = useMemo(
    () => [
      {
        id: "1",
        title: "Токаев подписал закон об искусственном интеллекте",
        subtitle: "Касым-Жомарт Токаев подписал закон “Об искусственном интеллекте”…",
      },
      {
        id: "2",
        title: "Сенат вернул в Мажилис на доработку законопроект",
        subtitle: "Сенат одобрил проект, но направил на доработку отдельные пункты…",
      },
    ],
    []
  );

  const articles = useMemo(
    () => [
      { id: "a1", title: "Как оформить ДТП онлайн", meta: "гайд • 5 мин" },
      { id: "a2", title: "Права потребителя в РК", meta: "статья • 7 мин" },
      { id: "a3", title: "Штрафы и обжалование", meta: "гайд • 6 мин" },
      { id: "a4", title: "Суды: что важно знать", meta: "статья • 8 мин" },
    ],
    []
  );

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={LOGO} style={styles.logo} />

          <View style={styles.headerRight}>
            <Pressable style={styles.langBtn} onPress={() => {}}>
              <Text style={styles.langText}>RU</Text>
              <Ionicons name="chevron-down" size={16} color={colors.muted} />
            </Pressable>

            <Pressable style={styles.iconBtn} onPress={() => {}}>
              <Ionicons name="search-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Новости дня */}
        <Text style={styles.sectionTitle}>Новости дня</Text>

        <View style={styles.cardList}>
          {dayNews.map((n, idx) => (
            <Pressable
              key={n.id}
              style={[styles.newsRow, idx !== 0 && styles.newsRowDivider]}
              onPress={() => {}}
            >
              <View style={styles.thumb}>
                <Ionicons name="image-outline" size={20} color={colors.muted} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {n.title}
                </Text>
                <Text style={styles.newsSubtitle} numberOfLines={2}>
                  {n.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.primaryBtn} onPress={() => {}}>
          <Text style={styles.primaryBtnText}>Еще 15 новостей</Text>
        </Pressable>

        {/* Статьи */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Статьи</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {chips.map((c) => {
            const active = c.key === chip;
            return (
              <Pressable
                key={c.key}
                onPress={() => setChip(c.key)}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {articles.map((a) => (
            <Pressable key={a.id} style={styles.articleCard} onPress={() => {}}>
              <View style={styles.articleImg}>
                <Ionicons name="newspaper-outline" size={18} color={colors.muted} />
              </View>
              <Text style={styles.articleTitle} numberOfLines={3}>
                {a.title}
              </Text>
              <Text style={styles.articleMeta}>{a.meta}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable style={[styles.primaryBtn, { marginTop: 10 }]} onPress={() => {}}>
          <Text style={styles.primaryBtnText}>Еще 15 статей</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, // место под tabbar
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingTop: 6, // <-- небольшой отступ (Screen уже дал paddingTop)
  },
  logo: { height: 22, width: 110, resizeMode: "contain" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },

  langBtn: {
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
  langText: { color: colors.text, fontWeight: "700", fontSize: 12 },
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

  sectionRow: { marginTop: 18 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
  },

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
    width: 62,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  newsTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  newsSubtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },

  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipInactive: { backgroundColor: colors.white, borderColor: colors.border },
  chipText: { fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: "#fff" },
  chipTextInactive: { color: colors.text },

  articleCard: {
    width: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    marginRight: 10,
  },
  articleImg: {
    height: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  articleTitle: { fontSize: 13, fontWeight: "800", color: colors.text },
  articleMeta: { marginTop: 6, fontSize: 11, color: colors.muted },
});
