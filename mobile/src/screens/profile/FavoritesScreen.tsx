import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

type Fav = { id: string; title: string; meta: string; type: "law" | "article" };

export default function FavoritesScreen() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Fav[]>([
    { id: "f1", title: "Права потребителя в РК", meta: "статья • 7 мин", type: "article" },
    { id: "f2", title: "Как оформить ДТП онлайн", meta: "гайд • 5 мин", type: "article" },
    { id: "f3", title: "КоАП: обжалование штрафов", meta: "закон • важное", type: "law" },
  ]);

  const data = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) => x.title.toLowerCase().includes(t));
  }, [items, q]);

  const remove = (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <Header
        lang="RU"
        onPressLang={() => Alert.alert("Язык", "Сделаем экран выбора языка позже 🙂")}
        onPressSearch={() => {}}
      />

      <Text style={styles.title}>Избранное</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Поиск по избранному…"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        {!!q && (
          <Pressable onPress={() => setQ("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={24} color={colors.muted} />
            <Text style={styles.emptyTitle}>Пока пусто</Text>
            <Text style={styles.emptyText}>
              Сохраняй статьи и законы — они появятся здесь.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => Alert.alert("Открыть", item.title)}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
            ]}
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name={item.type === "law" ? "document-text-outline" : "newspaper-outline"}
                size={18}
                color={colors.text}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardMeta}>{item.meta}</Text>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert("Удалить", "Убрать из избранного?", [
                  { text: "Отмена", style: "cancel" },
                  { text: "Удалить", style: "destructive", onPress: () => remove(item.id) },
                ])
              }
              hitSlop={10}
              style={styles.trashBtn}
            >
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
            </Pressable>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    marginTop: 4,
    marginBottom: 10,
  },

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
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },

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
  cardMeta: { marginTop: 4, fontSize: 12, color: colors.muted },

  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: colors.text },
  emptyText: { marginTop: 6, fontSize: 13, color: colors.muted, textAlign: "center" },
});
