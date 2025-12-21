import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export type ChatRole = "user" | "assistant";
export type ChatType = "text" | "image" | "file" | "audio";

export type ChatMessageDoc = {
  role: ChatRole;
  type: ChatType;

  text?: string;

  url?: string;
  name?: string;
  mime?: string;
  size?: number;
  durationMs?: number;

  createdAt?: Timestamp | null;
};

export type ChatMessage = ChatMessageDoc & { id: string };

const CHAT_ID = "main";

function col(uid: string) {
  return collection(db, "users", uid, "chats", CHAT_ID, "messages");
}

export function fbListenMessages(uid: string, onData: (msgs: ChatMessage[]) => void) {
  const q = query(col(uid), orderBy("createdAt", "asc"), limit(600));

  return onSnapshot(q, (snap) => {
    const items: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        role: data.role,
        type: data.type ?? "text",
        text: data.text ?? "",
        url: data.url,
        name: data.name,
        mime: data.mime,
        size: data.size,
        durationMs: data.durationMs,
        createdAt: data.createdAt ?? null,
      };
    });
    onData(items);
  });
}

export async function fbSendMessage(uid: string, msg: Omit<ChatMessageDoc, "createdAt">) {
  await addDoc(col(uid), { ...msg, createdAt: serverTimestamp() });
}

export async function fbClearChat(uid: string) {
  const q = query(col(uid), orderBy("createdAt", "desc"), limit(1200));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
