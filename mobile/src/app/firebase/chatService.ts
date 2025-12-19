import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt?: Timestamp | null;
};

const CHAT_ID = "main";

function messagesCol(uid: string) {
  return collection(db, "users", uid, "chats", CHAT_ID, "messages");
}

export function fbListenMessages(uid: string, onData: (msgs: ChatMessage[]) => void) {
  const q = query(messagesCol(uid), orderBy("createdAt", "asc"), limit(300));

  return onSnapshot(q, (snap) => {
    const items: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        role: data.role as ChatRole,
        text: String(data.text ?? ""),
        createdAt: data.createdAt ?? null,
      };
    });
    onData(items);
  });
}

export async function fbSendMessage(uid: string, role: ChatRole, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(messagesCol(uid), {
    role,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
}
