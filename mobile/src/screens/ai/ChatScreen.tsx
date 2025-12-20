import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  LayoutAnimation,
  UIManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  InteractionManager,
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

// Android: красивое появление/исчезновение элементов
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

function msToTimeLong(ms?: number) {
  if (!ms || ms <= 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

function getCreatedAtLabel(m: ChatMessage) {
  const anyM: any = m as any;
  const ts = anyM?.createdAt;
  try {
    if (ts?.toMillis) {
      const d = new Date(ts.toMillis());
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  } catch {}
  return "";
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
              <Text style={styles.sheetRowSub}>Загрузка + показ в чате</Text>
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
              <Text style={styles.sheetRowSub}>Открыть камеру</Text>
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

function TypingBubble() {
  return (
    <View style={[styles.bubble, styles.assistant, { marginTop: 2 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ActivityIndicator size="small" color={colors.navy} />
        <Text style={[styles.bubbleText, styles.assistantText]}>AI печатает…</Text>
      </View>
    </View>
  );
}

function ImagePreviewModal({
  open,
  uri,
  onClose,
}: {
  open: boolean;
  uri: string | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.imgModalBackdrop}>
        <Pressable style={styles.imgModalClose} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>

        {uri ? <Image source={{ uri }} style={styles.imgModalImage} resizeMode="contain" /> : null}
      </View>
    </Modal>
  );
}

function Bubble({
  m,
  onOpenImage,
  audioUi,
  onToggleAudio,
}: {
  m: ChatMessage;
  onOpenImage: (uri: string) => void;
  audioUi: {
    playingId: string | null;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
  };
  onToggleAudio: (m: ChatMessage) => void;
}) {
  const isUser = m.role === "user";
  const bubbleStyle = [styles.bubble, isUser ? styles.user : styles.assistant];
  const textStyle = [styles.bubbleText, isUser ? styles.userText : styles.assistantText];
  const timeLabel = getCreatedAtLabel(m);

  if (m.type === "image" && m.url) {
    return (
      <View style={bubbleStyle}>
        <Pressable onPress={() => onOpenImage(m.url!)}>
          <Image source={{ uri: m.url }} style={styles.imageMsg} />
        </Pressable>
        {!!m.text ? <Text style={[textStyle, { marginTop: 8 }]}>{m.text}</Text> : null}
        {!!timeLabel ? (
          <Text style={[styles.timeText, isUser && { color: "rgba(255,255,255,0.65)" }]}>{timeLabel}</Text>
        ) : null}
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
        {!!timeLabel ? (
          <Text style={[styles.timeText, isUser && { color: "rgba(255,255,255,0.65)" }]}>{timeLabel}</Text>
        ) : null}
      </Pressable>
    );
  }

  if (m.type === "audio" && m.url) {
    const isThis = audioUi.playingId === m.id;
    const showPos = isThis ? audioUi.positionMs : 0;
    const showDur = (m.durationMs ?? (isThis ? audioUi.durationMs : 0)) || 0;

    const left = msToTimeLong(showPos);
    const right = msToTimeLong(showDur);
    const progress = showDur > 0 ? Math.min(1, showPos / showDur) : 0;

    return (
      <Pressable onPress={() => onToggleAudio(m)} style={bubbleStyle}>
        <View style={styles.audioRow}>
          <Ionicons
            name={isThis && audioUi.isPlaying ? "pause-circle-outline" : "play-circle-outline"}
            size={28}
            color={isUser ? "#fff" : colors.text}
          />
          <View style={{ flex: 1 }}>
            <Text style={textStyle}>Голосовое сообщение</Text>

            <View style={styles.audioMeta}>
              <Text style={[textStyle, { opacity: 0.75, fontSize: 12 }]}>{left}</Text>
              <View style={styles.audioBar}>
                <View style={[styles.audioBarFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <Text style={[textStyle, { opacity: 0.75, fontSize: 12 }]}>{right}</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={isUser ? "#fff" : colors.muted} />
        </View>

        {!!timeLabel ? (
          <Text style={[styles.timeText, isUser && { color: "rgba(255,255,255,0.65)" }]}>{timeLabel}</Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={bubbleStyle}>
      <Text style={textStyle}>{m.text ?? ""}</Text>
      {!!timeLabel ? (
        <Text style={[styles.timeText, isUser && { color: "rgba(255,255,255,0.65)" }]}>{timeLabel}</Text>
      ) : null}
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

  // Image preview
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUri, setImgUri] = useState<string | null>(null);

  // Voice record
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingMs, setRecordingMs] = useState(0);
  const recordTimerRef = useRef<any>(null);

  // Audio play
  const soundRef = useRef<Audio.Sound | null>(null);
  const [audioUi, setAudioUi] = useState({
    playingId: null as string | null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  });

  // Throttle audio UI updates (perf)
  const lastAudioUiCommitRef = useRef(0);
  const pendingAudioUiRef = useRef<typeof audioUi | null>(null);
  const rafRef = useRef<number | null>(null);

  // Scroll helpers
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const isNearBottomRef = useRef(true);

  // Keep latest messages in ref
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
      try {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } catch {}
    };
  }, []);

  const scrollToEnd = (animated = true) => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
  };

  useEffect(() => {
    if (isNearBottomRef.current) scrollToEnd(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const sendLocal = (doc: Omit<ChatMessage, "id">) => {
    setMessages((p) => [...p, { id: String(Date.now()) + Math.random(), ...doc }]);
  };

  const toAiPayload = (arr: ChatMessage[]) => {
    const slice = arr.slice(-14);
    return slice.map((m) => {
      if (m.type === "text") return { role: m.role as "user" | "assistant", content: m.text ?? "" };
      if (m.type === "image") {
        const cap = m.text ? `\nКомментарий: ${m.text}` : "";
        return { role: m.role as "user" | "assistant", content: `[image] ${m.url ?? ""}${cap}` };
      }
      if (m.type === "file") {
        return { role: m.role as "user" | "assistant", content: `[file] ${m.name ?? "file"} (${m.mime ?? ""}) ${m.url ?? ""}` };
      }
      if (m.type === "audio") {
        return { role: m.role as "user" | "assistant", content: `[audio] ${msToTime(m.durationMs)} ${m.url ?? ""}` };
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
      const text = `⚠️ AI ошибка: ${msg}`;

      if (!user?.uid) {
        sendLocal({ role: "assistant", type: "text", text });
      } else {
        await fbSendMessage(user.uid, { role: "assistant", type: "text", text });
      }
    } finally {
      setAiThinking(false);
    }
  };

  const sendText = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    if (sendingAttachment || aiThinking) return;

    Keyboard.dismiss();
    setInput("");

    if (!user?.uid) {
      const localUserMsg: ChatMessage = {
        id: String(Date.now()) + Math.random(),
        role: "user",
        type: "text",
        text: trimmed,
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((p) => [...p, localUserMsg]);

      const ctx = [...messagesRef.current, localUserMsg];
      await askAiAndRespond(ctx, trimmed);
      return;
    }

    await fbSendMessage(user.uid, { role: "user", type: "text", text: trimmed });

    const draft: ChatMessage = { id: "__draft__", role: "user", type: "text", text: trimmed };
    const ctx = [...messagesRef.current, draft];

    await askAiAndRespond(ctx, trimmed);
  };

  // ---------- iOS FIX: close sheet before native picker ----------
  const closeSheetBeforeNativePicker = useCallback(async () => {
    setPlusOpen(false);

    if (Platform.OS === "ios") {
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(resolve, 80);
        });
      });
    }
  }, []);

  // ---------- Attachments ----------
  const sendImage = async (uri: string, name: string, mime: string) => {
    if (sendingAttachment) return;

    if (!user?.uid) {
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

  const pickFromGallery = async () => {
    try {
      await closeSheetBeforeNativePicker();

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        return Alert.alert("Доступ", "Разреши доступ к Фото в настройках iOS (для Expo Go).");
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.92,
      });

      if (res.canceled || !res.assets?.[0]?.uri) return;

      const asset = res.assets[0];
      await sendImage(asset.uri, asset.fileName ?? `photo_${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось открыть галерею.");
    }
  };

  const takePhoto = async () => {
    try {
      await closeSheetBeforeNativePicker();

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== "granted") {
        return Alert.alert("Доступ", "Разреши доступ к Камере в настройках iOS (для Expo Go).");
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.92,
      });

      if (res.canceled || !res.assets?.[0]?.uri) return;

      const asset = res.assets[0];
      await sendImage(asset.uri, asset.fileName ?? `camera_${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось открыть камеру.");
    }
  };

  const pickDocument = async () => {
    try {
      await closeSheetBeforeNativePicker();

      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
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
      Alert.alert("Ошибка", e?.message ?? "Не удалось выбрать документ.");
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

  // ---------- Voice (iOS safe) ----------
  const startRecording = async () => {
    if (sendingAttachment) return;

    try {
      // stop any playing sound (iOS recording often conflicts)
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;

        setAudioUi((p) => ({ ...p, playingId: null, isPlaying: false, positionMs: 0, durationMs: 0 }));
      }

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert("Доступ", "Разреши микрофон в настройках iOS (для Expo Go).");

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
          const st: any = await rec.getStatusAsync();
          if (st?.isRecording) setRecordingMs(st?.durationMillis ?? 0);
        } catch {}
      }, 250);
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось начать запись.");
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording || sendingAttachment) return;

    try {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const st: any = await recording.getStatusAsync();
      const durationMs = st?.durationMillis ?? recordingMs;

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
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить голосовое.");
    } finally {
      setSendingAttachment(false);
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      } catch {}
    }
  };

  const commitAudioUiThrottled = useCallback((next: typeof audioUi) => {
    pendingAudioUiRef.current = next;

    const now = Date.now();
    const minInterval = 220; // ~4-5 updates/sec

    const flush = () => {
      rafRef.current = null;
      if (!pendingAudioUiRef.current) return;
      setAudioUi(pendingAudioUiRef.current);
      pendingAudioUiRef.current = null;
      lastAudioUiCommitRef.current = Date.now();
    };

    // If enough time passed, commit now on next frame.
    if (now - lastAudioUiCommitRef.current >= minInterval) {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(flush);
      return;
    }

    // Otherwise schedule a delayed RAF flush (one pending only).
    if (rafRef.current) return;
    const delay = minInterval - (now - lastAudioUiCommitRef.current);
    setTimeout(() => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(flush);
    }, delay);
  }, []);

  const onToggleAudio = async (m: ChatMessage) => {
    if (!m.url) return;

    try {
      // If tapping same item: toggle play/pause
      if (audioUi.playingId === m.id && soundRef.current) {
        const st: any = await soundRef.current.getStatusAsync();
        if (st?.isLoaded && st?.isPlaying) {
          await soundRef.current.pauseAsync();
          setAudioUi((p) => ({ ...p, isPlaying: false }));
        } else if (st?.isLoaded) {
          await soundRef.current.playAsync();
          setAudioUi((p) => ({ ...p, isPlaying: true }));
        }
        return;
      }

      // Load new
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      setAudioUi({
        playingId: m.id,
        isPlaying: false,
        positionMs: 0,
        durationMs: m.durationMs ?? 0,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: m.url },
        { shouldPlay: true },
        (status) => {
          const st: any = status as any;
          if (!st?.isLoaded) return;

          commitAudioUiThrottled({
            playingId: m.id,
            isPlaying: !!st.isPlaying,
            positionMs: st.positionMillis ?? 0,
            durationMs: st.durationMillis ?? (m.durationMs ?? 0),
          });

          if (st.didJustFinish) {
            commitAudioUiThrottled({
              playingId: m.id,
              isPlaying: false,
              positionMs: 0,
              durationMs: st.durationMillis ?? (m.durationMs ?? 0),
            });
          }
        }
      );

      soundRef.current = sound;
    } catch {
      Alert.alert("Ошибка", "Не удалось воспроизвести аудио.");
    }
  };

  // ---------- UI helpers ----------
  const openImage = (uri: string) => {
    setImgUri(uri);
    setImgOpen(true);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 140;

    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    isNearBottomRef.current = nearBottom;

    const shouldShow = !nearBottom && contentSize.height > layoutMeasurement.height + 200;
    if (shouldShow !== showScrollDown) setShowScrollDown(shouldShow);
  };

  const memoryLabel = user?.uid ? "Память включена (профиль)" : guest ? "Гостевой режим" : "Без входа";
  const statusLabel = sendingAttachment ? "Отправка..." : aiThinking ? "AI печатает..." : memoryLabel;

  // важное: НЕ блокируем plus из-за aiThinking — только из-за отправки файла
  const textDisabled = sendingAttachment || aiThinking;

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

      <ImagePreviewModal open={imgOpen} uri={imgUri} onClose={() => setImgOpen(false)} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36, height: 36 }} />
        <Image source={LOGO} style={styles.logo} />
        <Pressable style={styles.headerIcon} onPress={() => setPlusOpen(true)} disabled={sendingAttachment}>
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.memoryRow}>
        <Ionicons name="sparkles-outline" size={14} color={colors.muted} />
        <Text style={styles.memoryText}>{statusLabel}</Text>
        {sendingAttachment || aiThinking ? <ActivityIndicator size="small" color={colors.navy} /> : null}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.navy} />
            <Text style={{ marginTop: 10, color: colors.muted }}>Загружаем чат...</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              ref={listRef}
              style={{ flex: 1 }}
              data={data}
              keyExtractor={(m) => m.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Bubble m={item} onOpenImage={openImage} audioUi={audioUi} onToggleAudio={onToggleAudio} />
              )}
              onScroll={onScroll}
              scrollEventThrottle={16}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.muted} />
                  <Text style={styles.emptyTitle}>Начни диалог</Text>
                  <Text style={styles.emptyText}>Напиши вопрос или отправь файл/фото — история сохранится.</Text>
                </View>
              }
              ListFooterComponent={aiThinking ? <TypingBubble /> : <View style={{ height: 0 }} />}
              onContentSizeChange={() => {
                if (isNearBottomRef.current) scrollToEnd(false);
              }}
            />

            {showScrollDown ? (
              <Pressable style={styles.scrollDownBtn} onPress={() => scrollToEnd(true)}>
                <Ionicons name="arrow-down" size={18} color="#fff" />
              </Pressable>
            ) : null}
          </View>
        )}

        {/* Bottom */}
        <View style={styles.footer}>
          {/* Quick prompts */}
          <View style={styles.quickRow}>
            <Pressable style={styles.quickCard} onPress={() => sendText("Помоги мне с законом — заполнить документ")} disabled={textDisabled}>
              <Text style={styles.quickTitle}>Помоги мне с законом</Text>
              <Text style={styles.quickSub}>заполнить документ</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => sendText("Помоги мне выучить законы РК")} disabled={textDisabled}>
              <Text style={styles.quickTitle}>Помоги мне выучить</Text>
              <Text style={styles.quickSub}>законы РК</Text>
            </Pressable>
          </View>

          {/* Input */}
          <View style={styles.promptRow}>
            <Pressable
              style={[styles.plusBtn, sendingAttachment && { opacity: 0.6 }]}
              onPress={() => setPlusOpen(true)}
              disabled={sendingAttachment}
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
                editable={!textDisabled}
              />

              {/* Mic toggle */}
              <Pressable
                style={[styles.pillIcon, recording && { backgroundColor: "#FFE9E9" }]}
                onPress={recording ? stopRecordingAndSend : startRecording}
                disabled={sendingAttachment} // микрофон не блокируем из-за aiThinking
              >
                <Ionicons
                  name={recording ? "stop-circle-outline" : "mic-outline"}
                  size={22}
                  color={recording ? "#B42318" : colors.text}
                />
              </Pressable>

              {/* Send */}
              <Pressable style={styles.pillIcon} onPress={() => sendText()} disabled={textDisabled}>
                <Ionicons name="send-outline" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {recording ? (
            <Text style={styles.recordHint}>Запись… {msToTime(recordingMs)} (нажми стоп чтобы отправить)</Text>
          ) : (
            <Text style={styles.recordHintSoft}>Можно отправлять: текст • фото • документ • голосовое</Text>
          )}
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
  logo: { height: 26, width: 155, resizeMode: "contain" },
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

  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },

  bubble: { maxWidth: "88%", borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  user: { alignSelf: "flex-end", backgroundColor: "#111" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#EFEFEF" },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },

  timeText: { marginTop: 6, fontSize: 11, color: "rgba(17,17,17,0.55)", alignSelf: "flex-end" },

  imageMsg: { width: 250, height: 250, borderRadius: 14, backgroundColor: "#ddd" },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  audioMeta: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 },
  audioBar: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.10)",
    overflow: "hidden",
  },
  audioBarFill: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 6,
  },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, paddingTop: 30 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: colors.text },
  emptyText: { marginTop: 6, color: colors.muted, textAlign: "center", lineHeight: 18 },

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
  recordHintSoft: { marginTop: 8, textAlign: "center", fontSize: 12, color: "rgba(0,0,0,0.35)" },

  scrollDownBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

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

  // Image modal
  imgModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  imgModalImage: { width: "100%", height: "85%" },
  imgModalClose: {
    position: "absolute",
    top: 52,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
});
