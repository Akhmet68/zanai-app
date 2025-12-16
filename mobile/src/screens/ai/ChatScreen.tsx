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
} from "react-native";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Привет! Опиши ситуацию — помогу с предварительным разбором.",
    },
  ]);

  const data = useMemo(() => messages, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = Date.now();
    setMessages((prev) => [...prev, { id: String(now), role: "user", text: trimmed }]);
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: String(now + 1),
        role: "assistant",
        text: "Понял. Я формирую предварительный ответ. (Демо)\n\nДальше подключим сервер и ИИ.",
      },
    ]);
  };

  return (
    <Screen>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>AI Помощник</Text>

        <FlatList
          style={{ flex: 1 }}
          data={data}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.user : styles.assistant]}>
              <Text style={[styles.bubbleText, item.role === "user" ? styles.userText : styles.assistantText]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputWrap}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Напишите сообщение…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
            />
            <Pressable onPress={send} style={styles.sendBtn}>
              <Text style={styles.sendText}>➤</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
    marginBottom: 8,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  user: { alignSelf: "flex-end", backgroundColor: "#111" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#F2F2F2" },
  bubbleText: { fontSize: 14, lineHeight: 19 },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },

  inputWrap: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
