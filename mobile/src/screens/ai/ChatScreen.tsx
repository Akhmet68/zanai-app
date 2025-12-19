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
  Linking,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";
import { useAuth } from "../../app/auth/AuthContext";
import { fbClearChat, fbListenMessages, fbSendMessage, ChatMessage } from "../../app/firebase/chatService";
import { uploadUriToStorage } from "../../app/firebase/storageService";
import { aiChat } from "../../app/api/aiClient";

const LOGO = require("../../../assets/zanai-logo.png");

function bytesToHuman(n?: number) {
  if (!n || n <= 0) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function msToTime(ms?: number) {
  if (!ms || ms <= 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

function PlusSheet({
  open,
  onClose,
  onPickImage,
  onCamera,
  onPickDoc,
  onClearChat,
}: {
  open: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onCamera: () => void;
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
              <Ionicons name="images-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetRowTitle}>Фото из галереи</Text>
              <Text style={styles.sheetRowSub}>Загрузим в Storage и покажем в чате</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.sheetDivider} />

          <Pressable style={styles.sheetRow} onPress={onCamera}>
            <View style={styles.sheetIcon}>
              <Ionicons name="camera-outline" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetRowTitle}>Сделать фото</Text>
              <Text style={styles.sheetRowSub}>Откроем камеру</Text>
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
              <Text style={styles.sheetRowSub}>Удалит историю</Text>
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

function Bubble({ m, onPlayAudio }: { m: ChatMessage; onPlayAudio: (m: ChatMessage) => void }) {
  const isUser = m.role === "user";
  const bubbleStyle = [styles.bubble, isUser ? styles.user : styles.assistant];
  const textStyle = [styles.bubbleText, isUser ? styles.userText : styles.assistantText];

  if (m.type === "image" && m.url) {
    return (
      <View style={bubbleStyle}>
        <Image source={{ uri: m.url }} style={styles.imageMsg} />
        {!!m.text && <Text style={[textStyle, { marginTop: 8 }]}>{m.text}</Text>}
      </View>
    );
  }

  if (m.type === "file" && m.url) {
    return (
      <Pressable
        onPress={() => Linking.openURL(m.url!).catch(() => Alert.alert("Ошибка", "Не удалось открыть файл."))}
        style={bubbleStyle}
      >
        <View style={styles.fileRow}>
          <Ionicons name="document-attach-outline" size={20} color={isUser ? "#fff" : colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={textStyle} numberOfLines={2}>
              {m.name ?? "Файл"}
            </Text>
            <Text style={[textStyle, { opacity: 0.75, fontSize: 12, marginTop: 2 }]}>
              {bytesToHuman(m.size) || m.mime || "Документ"}
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={isUser ? "#fff" : colors.muted} />
        </View>
      </Pressable>
    );
  }

  if (m.type === "audio" && m.url) {
    return (
      <Pressable onPress={() => onPlayAudio(m)} style={bubbleStyle}>
        <View style={styles.audioRow}>
          <Ionicons name="play-circle-outline" size={26} color={isUser ? "#fff" : colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={textStyle}>Голосовое сообщение</Text>
            <Text style={[textStyle, { opacity: 0.75, fontSize: 12, marginTop: 2 }]}>
              {msToTime(m.durationMs)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={isUser ? "#fff" : colors.muted} />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={bubbleStyle}>
      <Text style={textStyle}>{m.text ?? ""}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const { user, guest } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const [plusOpen, setPlusOpen] = useState(false);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Voice
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingMs, setRecordingMs] = useState(0);
  const recordTimerRef = useRef<any>(null);

  // audio play (MVP)
  const soundRef = useRef<Audio.Sound | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const data = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsub = fbListenMessages(user.uid, (items) => {
      setMessages(items);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    return () => {
      try {
        soundRef.current?.unloadAsync();
      } catch {}
      try {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      } catch {}
    };
  }, []);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const sendLocal = (doc: Omit<ChatMessage, "id">) => {
    setMessages((p) => [...p, { id: String(Date.now()) + Math.random(), ...doc }]);
  };

  const toAiPayload = (arr: ChatMessage[]) => {
    // Контекст: берём последние 14 сообщений и превращаем в role/content
    const slice = arr.slice(-14);
    return slice.map((m) => {
      if (m.type === "text") return { role: m.role as "user" | "assistant", content: m.text ?? "" };
      if (m.type === "image") {
        const cap = m.text ? `\nКомментарий: ${m.text}` : "";
        return { role: m.role as "user" | "assistant", content: `[image] ${m.url ?? ""}${cap}` };
      }
      if (m.type === "file") {
        return {
          role: m.role as "user" | "assistant",
          content: `[file] ${m.name ?? "file"} (${m.mime ?? ""}) ${m.url ?? ""}`,
        };
      }
      if (m.type === "audio") {
        return {
          role: m.role as "user" | "assistant",
          content: `[audio] ${msToTime(m.durationMs)} ${m.url ?? ""}`,
        };
      }
      return { role: m.role as "user" | "assistant", content: m.text ?? "" };
    });
  };

  const askAiAndRespond = async (draftMessagesForContext: ChatMessage[], userText: string) => {
    setAiThinking(true);
    try {
      const payload = toAiPayload(draftMessagesForContext).concat({ role: "user", content: userText });
      const answer = await aiChat(payload);

      const finalText = (answer ?? "").trim() || "Пустой ответ 😅";

      if (!user?.uid) {
        sendLocal({ role: "assistant", type: "text", text: finalText });
      } else {
        await fbSendMessage(user.uid, { role: "assistant", type: "text", text: finalText });
      }
    } catch (e: any) {
      const msg = e?.message ?? "Не удалось получить ответ от AI.";
      if (!user?.uid) {
        sendLocal({ role: "assistant", type: "text", text: `⚠️ AI ошибка: ${msg}` });
      } else {
        await fbSendMessage(user.uid, { role: "assistant", type: "text", text: `⚠️ AI ошибка: ${msg}` });
      }
    } finally {
      setAiThinking(false);
    }
  };

  const sendText = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    if (sendingAttachment || aiThinking) return; // чтобы не спамили

    Keyboard.dismiss();
    setInput("");

    // Гость/без входа: локально + всё равно можно дергать AI через сервер (если у тебя сервер поднят)
    if (!user?.uid) {
      const localUserMsg: ChatMessage = {
        id: String(Date.now()) + Math.random(),
        role: "user",
        type: "text",
        text: trimmed,
      };
      setMessages((p) => [...p, localUserMsg]);

      await askAiAndRespond([...messages, localUserMsg], trimmed);
      return;
    }

    // Авторизован: сохраняем в Firestore
    await fbSendMessage(user.uid, { role: "user", type: "text", text: trimmed });

    // Важно: контекст берём из текущих messages + новый текст (чтобы AI видел свежий вопрос)
    const draft: ChatMessage = {
      id: "__draft__",
      role: "user",
      type: "text",
      text: trimmed,
    };
    await askAiAndRespond([...messages, draft], trimmed);
  };

  // ---------- Attachments ----------
  const pickFromGallery = async () => {
    setPlusOpen(false);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return Alert.alert("Доступ", "Нужен доступ к галерее.");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.92,
    });

    if (res.canceled || !res.assets?.[0]?.uri) return;

    const asset = res.assets[0];
    await sendImage(asset.uri, asset.fileName ?? `photo_${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
  };

  const takePhoto = async () => {
    setPlusOpen(false);

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") return Alert.alert("Доступ", "Нужен доступ к камере.");

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.92,
    });

    if (res.canceled || !res.assets?.[0]?.uri) return;

    const asset = res.assets[0];
    await sendImage(asset.uri, asset.fileName ?? `camera_${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
  };

  const sendImage = async (uri: string, name: string, mime: string) => {
    if (sendingAttachment) return;

    if (!user?.uid) {
      // гость: без загрузки в storage
      sendLocal({ role: "user", type: "image", url: uri, name, mime });
      return;
    }

    try {
      setSendingAttachment(true);

      const up = await uploadUriToStorage({
        uid: user.uid,
        uri,
        folder: "chat-images",
        fileName: name,
        contentType: mime,
      });

      await fbSendMessage(user.uid, {
        role: "user",
        type: "image",
        url: up.url,
        name: up.name,
        mime,
        size: up.size,
      });
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить фото.");
    } finally {
      setSendingAttachment(false);
    }
  };

  const pickDocument = async () => {
    setPlusOpen(false);

    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true, // важно для Android
    });

    if (res.canceled) return;

    const a = res.assets?.[0];
    if (!a?.uri) return;

    const name = a.name ?? `file_${Date.now()}`;
    const mime = a.mimeType ?? "application/octet-stream";

    if (!user?.uid) {
      sendLocal({ role: "user", type: "file", url: a.uri, name, mime, size: a.size });
      return;
    }

    try {
      setSendingAttachment(true);
      const up = await uploadUriToStorage({
        uid: user.uid,
        uri: a.uri,
        folder: "chat-files",
        fileName: name,
        contentType: mime,
      });

      await fbSendMessage(user.uid, {
        role: "user",
        type: "file",
        url: up.url,
        name: up.name,
        mime,
        size: a.size ?? up.size,
      });
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить документ.");
    } finally {
      setSendingAttachment(false);
    }
  };

  const clearChat = () => {
    setPlusOpen(false);

    Alert.alert("Очистить чат?", "История будет удалена.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Очистить",
        style: "destructive",
        onPress: async () => {
          try {
            if (!user?.uid) return setMessages([]);
            await fbClearChat(user.uid);
          } catch {
            Alert.alert("Ошибка", "Не удалось очистить чат.");
          }
        },
      },
    ]);
  };

  // ---------- Voice ----------
  const startRecording = async () => {
    if (sendingAttachment || aiThinking) return;

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert("Доступ", "Нужен доступ к микрофону.");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
      setRecordingMs(0);

      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(async () => {
        try {
          const status = await rec.getStatusAsync();
          if (status.isRecording) setRecordingMs(status.durationMillis ?? 0);
        } catch {}
      }, 250);
    } catch {
      Alert.alert("Ошибка", "Не удалось начать запись.");
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording || sendingAttachment) return;

    try {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      const durationMs = status.durationMillis ?? recordingMs;

      setRecording(null);
      setRecordingMs(0);

      if (!uri) return Alert.alert("Ошибка", "Не удалось получить файл записи.");

      if (!user?.uid) {
        sendLocal({ role: "user", type: "audio", url: uri, name: "voice.m4a", mime: "audio/m4a", durationMs });
        return;
      }

      setSendingAttachment(true);

      const up = await uploadUriToStorage({
        uid: user.uid,
        uri,
        folder: "chat-audio",
        fileName: `voice_${Date.now()}.m4a`,
        contentType: "audio/m4a",
      });

      await fbSendMessage(user.uid, {
        role: "user",
        type: "audio",
        url: up.url,
        name: up.name,
        mime: "audio/m4a",
        durationMs,
        size: up.size,
      });
    } catch {
      Alert.alert("Ошибка", "Не удалось отправить голосовое.");
    } finally {
      setSendingAttachment(false);
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}
    }
  };

  const onPlayAudio = async (m: ChatMessage) => {
    if (!m.url) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: m.url }, { shouldPlay: true });
      soundRef.current = sound;
    } catch {
      Alert.alert("Ошибка", "Не удалось воспроизвести аудио.");
    }
  };

  const memoryLabel = user?.uid
    ? "Память включена (профиль)"
    : guest
      ? "Гостевой режим"
      : "Без входа";

  const statusLabel =
    sendingAttachment ? "Отправка..." : aiThinking ? "AI печатает..." : memoryLabel;

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <PlusSheet
        open={plusOpen}
        onClose={() => setPlusOpen(false)}
        onPickImage={pickFromGallery}
        onCamera={takePhoto}
        onPickDoc={pickDocument}
        onClearChat={clearChat}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36, height: 36 }} />
        <Image source={LOGO} style={styles.logo} />
        <Pressable style={styles.headerIcon} onPress={() => setPlusOpen(true)}>
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.memoryRow}>
        <Ionicons name="sparkles-outline" size={14} color={colors.muted} />
        <Text style={styles.memoryText}>{statusLabel}</Text>
        {(sendingAttachment || aiThinking) ? <ActivityIndicator size="small" color={colors.navy} /> : null}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
            renderItem={({ item }) => <Bubble m={item} onPlayAudio={onPlayAudio} />}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Напиши вопрос — чат сохранит историю и вложения.</Text>
              </View>
            }
          />
        )}

        {/* Bottom */}
        <View style={styles.footer}>
          {/* Quick prompts */}
          <View style={styles.quickRow}>
            <Pressable
              style={styles.quickCard}
              onPress={() => sendText("Помоги мне с законом — заполнить документ")}
              disabled={aiThinking || sendingAttachment}
            >
              <Text style={styles.quickTitle}>Помоги мне с законом</Text>
              <Text style={styles.quickSub}>заполнить документ</Text>
            </Pressable>

            <Pressable
              style={styles.quickCard}
              onPress={() => sendText("Помоги мне выучить законы РК")}
              disabled={aiThinking || sendingAttachment}
            >
              <Text style={styles.quickTitle}>Помоги мне выучить</Text>
              <Text style={styles.quickSub}>законы РК</Text>
            </Pressable>
          </View>

          {/* Input */}
          <View style={styles.promptRow}>
            <Pressable
              style={styles.plusBtn}
              onPress={() => setPlusOpen(true)}
              disabled={aiThinking || sendingAttachment}
            >
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
                onSubmitEditing={() => sendText()}
                editable={!aiThinking && !sendingAttachment}
              />

              {/* Mic */}
              <Pressable
                style={[styles.pillIcon, recording && { backgroundColor: "#FFE9E9" }]}
                onPress={recording ? stopRecordingAndSend : startRecording}
                disabled={sendingAttachment || aiThinking}
              >
                <Ionicons
                  name={recording ? "stop-circle-outline" : "mic-outline"}
                  size={22}
                  color={recording ? "#B42318" : colors.text}
                />
              </Pressable>

              {/* Send */}
              <Pressable style={styles.pillIcon} onPress={() => sendText()} disabled={sendingAttachment || aiThinking}>
                <Ionicons name="send-outline" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {recording ? (
            <Text style={styles.recordHint}>Запись… {msToTime(recordingMs)} (нажми стоп чтобы отправить)</Text>
          ) : null}
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
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  divider: { height: 1, backgroundColor: colors.border },

  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 10,
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

  imageMsg: { width: 240, height: 240, borderRadius: 14, backgroundColor: "#ddd" },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 10 },

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
  pillIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  recordHint: { marginTop: 8, textAlign: "center", fontSize: 12, color: colors.muted },

  // Sheet
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
