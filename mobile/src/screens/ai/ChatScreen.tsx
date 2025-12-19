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
  Modal,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import {
  fbListenMessages,
  fbSendMessage,
  fbClearChat,
  ChatMessage,
} from "../../app/firebase/chatService";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const LOGO = require("../../../assets/zanai-logo.png");

function PlusSheet({
  open,
  onClose,
  onPickImage,
  onPickDoc,
  onClearChat,
}: {
  open: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onPickDoc: () => void;
  onClearChat: () => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />

      <View style={styles.sheetWrap}>
        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>Действия</Text>

          <Pressable style={styles.sheetRow} onPress={onPickImage}>
            <View style={styles.sheetIcon}>
              <Ionicons name="image-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetRowTitle}>Фото из галереи</Text>
              <Text style={styles.sheetRowSub}>Прикрепить изображение</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.sheetDivider} />

          <Pressable style={styles.sheetRow} onPress={onPickDoc}>
            <View style={styles.sheetIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetRowTitle}>Документ</Text>
              <Text style={styles.sheetRowSub}>PDF / DOCX / TXT и т.д.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.sheetDivider} />

          <Pressable style={styles.sheetRowDanger} onPress={onClearChat}>
            <View style={[styles.sheetIcon, { backgroundColor: "#FFF5F5", borderColor: "#F1B5B5" }]}>
              <Ionicons name="trash-outline" size={20} color="#B42318" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowTitle, { color: "#B42318" }]}>Очистить чат</Text>
              <Text style={styles.sheetRowSub}>Удалит историю сообщений</Text>
            </View>
          </Pressable>

          <Pressable style={styles.sheetCancel} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Отмена</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ChatScreen() {
  const { user, guest } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const [plusOpen, setPlusOpen] = useState(false);

  const listRef = useRef<FlatList<Msg>>(null);
  const data = useMemo(() => messages, [messages]);

  // Firestore realtime (только если залогинен)
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsub = fbListenMessages(user.uid, (items: ChatMessage[]) => {
      const mapped: Msg[] = items.map((m) => ({ id: m.id, role: m.role, text: m.text }));
      setMessages(mapped);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
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
    setInput("");

    // Гость: локально
    if (!user?.uid) {
      sendLocal("user", trimmed);

      setTimeout(() => {
        sendLocal("assistant", `Понял. (Демо) Ты написал: “${trimmed}”.\nСкоро подключим AI 🙂`);
      }, 350);

      return;
    }

    // Залогинен: Firestore
    try {
      await fbSendMessage(user.uid, "user", trimmed);

      // демо-ответ
      setTimeout(async () => {
        try {
          await fbSendMessage(
            user.uid,
            "assistant",
            `Понял. (Демо) Ты написал: “${trimmed}”.\nСкоро подключим AI 🙂`
          );
        } catch {}
      }, 350);
    } catch {
      sendLocal("assistant", "Ошибка отправки. Проверь интернет и попробуй ещё раз.");
    }
  };

  const memoryLabel = user?.uid ? "Память включена (профиль)" : guest ? "Гостевой режим" : "Без входа";

  // --- PLUS actions ---
  const pickImage = async () => {
    setPlusOpen(false);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Доступ", "Нужен доступ к галерее.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (res.canceled || !res.assets?.[0]?.uri) return;

    const uri = res.assets[0].uri;
    const text = `📎 Фото: ${uri}`;

    // MVP: пока отправляем как текст. Следующий шаг — upload в Firebase Storage.
    await send(text);
  };

  const pickDoc = async () => {
    setPlusOpen(false);

    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (res.canceled) return;

    const text = `📎 Файл: ${res.assets?.[0]?.name ?? "document"} (${res.assets?.[0]?.size ?? "?"} bytes)`;
    await send(text);
  };

  const clearChat = async () => {
    setPlusOpen(false);

    Alert.alert("Очистить чат?", "История сообщений будет удалена.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Очистить",
        style: "destructive",
        onPress: async () => {
          try {
            if (!user?.uid) {
              setMessages([]);
              return;
            }
            await fbClearChat(user.uid);
          } catch {
            Alert.alert("Ошибка", "Не удалось очистить чат.");
          }
        },
      },
    ]);
  };

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <PlusSheet
        open={plusOpen}
        onClose={() => setPlusOpen(false)}
        onPickImage={pickImage}
        onPickDoc={pickDoc}
        onClearChat={clearChat}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36, height: 36 }} />
        <Image source={LOGO} style={styles.logo} />
        <View style={{ width: 36, height: 36 }} />
      </View>

      <View style={styles.divider} />

      <View style={styles.memoryRow}>
        <Ionicons name="sparkles-outline" size={14} color={colors.muted} />
        <Text style={styles.memoryText}>{memoryLabel}</Text>
        <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* List */}
        {loading ? (
          <View style={styles.center}>
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
                <Text style={[styles.bubbleText, item.role === "user" ? styles.userText : styles.assistantText]}>
                  {item.text}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  Напиши вопрос по законам РК — я сохраню историю диалога.
                </Text>
              </View>
            }
            onContentSizeChange={scrollToEnd}
          />
        )}

        {/* Bottom */}
        <View style={styles.footer}>
          <View style={styles.quickRow}>
            <Pressable style={styles.quickCard} onPress={() => send("Помоги мне с законом — заполнить документ")}>
              <Text style={styles.quickTitle}>Помоги мне с законом</Text>
              <Text style={styles.quickSub}>заполнить документ</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => send("Помоги мне выучить законы РК")}>
              <Text style={styles.quickTitle}>Помоги мне выучить</Text>
              <Text style={styles.quickSub}>законы РК</Text>
            </Pressable>
          </View>

          <View style={styles.promptRow}>
            <Pressable style={styles.plusBtn} onPress={() => setPlusOpen(true)}>
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

              <Pressable style={styles.pillIcon} onPress={() => Alert.alert("Скоро", "Голосовой ввод добавим позже 🙂")}>
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
    justifyContent: "space-between",
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

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },

  bubble: { maxWidth: "88%", borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  user: { alignSelf: "flex-end", backgroundColor: "#111" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#EFEFEF" },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  emptyText: { color: colors.muted, textAlign: "center", lineHeight: 18 },

  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: colors.white },

  quickRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
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
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  pillIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },

  // --- Sheet styles ---
  sheetBackdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheetCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: { alignSelf: "center", width: 46, height: 5, borderRadius: 3, backgroundColor: "#E5E7EB", marginBottom: 10 },
  sheetTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: 10 },

  sheetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  sheetRowDanger: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  sheetRowSub: { marginTop: 2, fontSize: 12, color: colors.muted },
  sheetDivider: { height: 1, backgroundColor: "#EEF0F3" },

  sheetCancel: {
    marginTop: 10,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  sheetCancelText: { fontSize: 14, fontWeight: "900", color: colors.text },
});
