import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const LOGO = require("../../../assets/zanai-logo.png");

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const data = useMemo(() => messages, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = Date.now();
    setMessages((p) => [...p, { id: String(now), role: "user", text: trimmed }]);
    setInput("");
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => {}} hitSlop={12} style={styles.menuBtn}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>

        <Image source={LOGO} style={styles.logo} />
      </View>

      <View style={styles.divider} />

      <View style={styles.memoryRow}>
        <Ionicons name="pencil-outline" size={14} color={colors.muted} />
        <Text style={styles.memoryText}>Память включена</Text>
        <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Chat list */}
        <FlatList
          style={{ flex: 1 }}
          data={data}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.user : styles.assistant,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.role === "user" ? styles.userText : styles.assistantText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          ListEmptyComponent={<View style={{ flex: 1 }} />}
        />

        {/* Bottom area */}
        <View style={styles.footer}>
          <View style={styles.quickRow}>
            <Pressable style={styles.quickCard} onPress={() => {}}>
              <Text style={styles.quickTitle}>Помоги мне с законом</Text>
              <Text style={styles.quickSub}>заполнить документ</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => {}}>
              <Text style={styles.quickTitle}>Помоги мне выучить</Text>
              <Text style={styles.quickSub}>законы РК</Text>
            </Pressable>
          </View>

          <View style={styles.promptRow}>
            <Pressable style={styles.plusBtn} onPress={() => {}}>
              <Ionicons name="add" size={24} color={colors.muted} />
            </Pressable>

            <View style={styles.inputPill}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Спросите что-нибудь"
                placeholderTextColor={colors.muted}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={send}
              />

              <Pressable style={styles.pillIcon} onPress={() => {}}>
                <Ionicons name="mic-outline" size={20} color={colors.text} />
              </Pressable>

              <Pressable style={styles.pillIcon} onPress={() => {}}>
                <Ionicons name="pulse-outline" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
    marginRight: 8,
  },
  logo: { height: 26, width: 140, resizeMode: "contain" },

  divider: { height: 1, backgroundColor: colors.border },

  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.white,
  },
  memoryText: { fontSize: 12, color: colors.muted, fontWeight: "600" },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },

  bubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  user: { alignSelf: "flex-end", backgroundColor: "#111" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#EFEFEF" },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  quickCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  quickTitle: { fontSize: 12, fontWeight: "800", color: colors.text },
  quickSub: { marginTop: 2, fontSize: 11, color: colors.muted },

  promptRow: { flexDirection: "row", alignItems: "center" },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    marginRight: 10,
  },
  inputPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  pillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
