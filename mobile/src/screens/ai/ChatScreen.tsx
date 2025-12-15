import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", role: "assistant", text: "Привет! Опиши ситуацию — помогу с предварительным разбором." },
  ]);

  const data = useMemo(() => messages, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Msg = { id: String(Date.now()), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Пока демо-ответ (потом заменим на API -> server -> OpenAI)
    const botMsg: Msg = {
      id: String(Date.now() + 1),
      role: "assistant",
      text: "Понял. Я формирую предварительный ответ. (Демо)\n\nДальше подключим сервер и ИИ.",
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Помощник</Text>

      <FlatList
        data={data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.user : styles.assistant]}>
            <Text style={[styles.bubbleText, item.role === "user" ? styles.userText : styles.assistantText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Напишите сообщение…"
          style={styles.input}
          multiline
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },

  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  user: { alignSelf: "flex-end", backgroundColor: "#111" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#f2f2f2" },
  bubbleText: { fontSize: 14, lineHeight: 18 },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
