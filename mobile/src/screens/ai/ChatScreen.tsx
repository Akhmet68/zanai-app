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
import { colors } from "../../core/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

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
    const userMsg: Msg = { id: String(now), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const botMsg: Msg = {
      id: String(now + 1),
      role: "assistant",
      text:
        "Понял. Я формирую предварительный ответ. (Демо)\n\nДальше подключим сервер и ИИ.",
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // чтобы низ (инпут) не конфликтовал с TabBar
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          <Text style={styles.title}>AI Помощник</Text>

          <FlatList
            data={data}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 14 }}
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
          />

          <View style={[styles.inputWrap, { paddingBottom: bottomPad + 70 }]}>
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
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },

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
