import React, { useEffect, useMemo, useRef, useState } from "react";
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
  ActivityIndicator,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import { fbListenMessages, fbSendMessage, ChatMessage } from "../../app/firebase/chatService";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const LOGO = require("../../../assets/zanai-logo.png");

export default function ChatScreen() {
  const { user, guest } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const data = useMemo(() => messages, [messages]);

  // 1) Реалтайм из Firestore (только если залогинен)
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsub = fbListenMessages(user.uid, (items: ChatMessage[]) => {
      const mapped: Msg[] = items.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
      }));
      setMessages(mapped);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // 2) Автоскролл вниз
  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const sendLocal = (role: "user" | "assistant", text: string) => {
    setMessages((p) => [...p, { id: String(Date.now()) + Math.random(), role, text }]);
  };

  const send = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    Keyboard.dismiss();

    // Сразу чистим инпут
    setInput("");

    // Гость: просто локально
    if (!user?.uid) {
      sendLocal("user", trimmed);

      // демо-ответ (пока не подключили AI)
      setTimeout(() => {
        sendLocal("assistant", `Понял. (Демо) Ты написал: “${trimmed}”.\nСкоро подключим AI-ответы 🙂`);
      }, 350);

      return;
    }

    // Залогинен: пишем в Firestore
    try {
      await fbSendMessage(user.uid, "user", trimmed);

      // демо-ответ ассистента (тоже в Firestore)
      setTimeout(async () => {
        try {
          await fbSendMessage(
            user.uid,
            "assistant",
            `Понял. (Демо) Ты написал: “${trimmed}”.\nСкоро подключим AI-ответы 🙂`
          );
        } catch {}
      }, 350);
    } catch (e) {
      // если Firestore упал — хотя бы покажем локально
      sendLocal("assistant", "Ошибка отправки. Проверь интернет и попробуй ещё раз.");
    }
  };

  const onQuick = (t: string) => {
    setInput(t);
    send(t);
  };

  const memoryLabel = user?.uid ? "Память включена (профиль)" : guest ? "Гостевой режим" : "Без входа";

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
        <Text style={styles.memoryText}>{memoryLabel}</Text>
        <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Chat list */}
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.navy} />
            <Text style={{ marginTop: 10, color: colors.muted }}>Загружаем чат...</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={{ flex: 1 }}
            data={data}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === "user" ? styles.user : styles.assistant]}>
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
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
                <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 18 }}>
                  Напиши вопрос по законам РК — я сохраню историю диалога.
                </Text>
              </View>
            }
            onContentSizeChange={scrollToEnd}
          />
        )}

        {/* Bottom area */}
        <View style={styles.footer}>
          <View style={styles.quickRow}>
            <Pressable style={styles.quickCard} onPress={() => onQuick("Помоги мне с законом — заполнить документ")}>
              <Text style={styles.quickTitle}>Помоги мне с законом</Text>
              <Text style={styles.quickSub}>заполнить документ</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => onQuick("Помоги мне выучить законы РК")}>
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
                onSubmitEditing={() => send()}
              />

              <Pressable style={styles.pillIcon} onPress={() => {}}>
                <Ionicons name="mic-outline" size={20} color={colors.text} />
              </Pressable>

              <Pressable style={styles.pillIcon} onPress={() => send()}>
                <Ionicons name="send-outline" size={20} color={colors.text} />
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
