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
  Keyboard,
} from "react-native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT, TAB_BAR_TOP_GAP } from "../../ui/CustomTabBar";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Msg>>(null);

  const [keyboardShown, setKeyboardShown] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Привет! Опиши ситуацию — помогу с предварительным разбором.",
    },
  ]);

  const data = useMemo(() => messages, [messages]);

  // реальная “занимаемая зона” таббара снизу (плашка + отступы + safe-area)
  const bottomPad = Math.max(insets.bottom, 10);
  const tabBarFootprint = TAB_BAR_HEIGHT + TAB_BAR_TOP_GAP + bottomPad;

  // когда клавиатура открыта — tabBarHideOnKeyboard скрывает таббар,
  // значит отступ под него убираем, чтобы чат не “висел” слишком высоко
  const bottomOffset = keyboardShown ? 0 : tabBarFootprint;

  useEffect(() => {
    const show = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(show, () => setKeyboardShown(true));
    const subHide = Keyboard.addListener(hide, () => setKeyboardShown(false));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

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

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>AI Помощник</Text>

          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: bottomOffset + 90, // место под инпут + таббар (когда он виден)
            }}
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

          {/* Composer */}
          <View
            style={[
              styles.composer,
              {
                marginBottom: bottomOffset, // когда таббар виден — поднимаем над ним
                paddingBottom: insets.bottom + 10,
              },
            ]}
          >
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

  composer: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
    backgroundColor: colors.bg,
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
