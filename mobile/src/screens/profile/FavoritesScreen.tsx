import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

type Fav = {
  id: string;
  type: "law" | "news";
  title: string;
  meta: string;
};

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<"all" | "law" | "news">("all");

  const all = useMemo<Fav[]>(
    () => [
      { id: "1", type: "law", title: "Права потребителя в РК", meta: "статья • 7 мин" },
      { id: "2", type: "news", title: "Новые изменения в административных штрафах", meta: "новость • сегодня" },
      { id: "3", type: "law", title: "Как оформить ДТП онлайн", meta: "гайд • 5 мин" },
    ],
    []
  );

  const data = useMemo(() => {
    if (filter === "all") return all;
    return all.filter((x) => x.type === filter);
  }, [all, filter]);

  const chip = (key: typeof filter, label: string) => {
    const active = filter === key;
    return (
      <Pressable
        onPress={() => setFilter(key)}
        style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
      >
        <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <Header
        leftVariant="back"
        rightVariant="none"
        onPressLeft={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Избранное</Text>

        <View style={styles.chipsRow}>
          {chip("all", "Все")}
          {chip("law", "Законы")}
          {chip("news", "Новости")}
        </View>

        {data.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={28} color={colors.muted} />
            <Text style={styles.emptyTitle}>Пока пусто</Text>
            <Text style={styles.emptyText}>
              Сохраняйте статьи и новости — они появятся здесь.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(x) => x.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={item.type === "law" ? "document-text-outline" : "newspaper-outline"}
                    size={18}
                    color={colors.muted}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>{item.meta}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 30, fontWeight: "900", color: colors.text },

  chipsRow: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipInactive: { backgroundColor: colors.white, borderColor: colors.border },
  chipText: { fontSize: 12, fontWeight: "900" },
  chipTextActive: { color: "#fff" },
  chipTextInactive: { color: colors.text },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 10,
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
  cardMeta: { marginTop: 4, fontSize: 12, color: colors.muted },

  empty: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: colors.text },
  emptyText: { marginTop: 6, fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 18 },
});
