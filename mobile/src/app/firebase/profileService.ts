import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  plan: "Free" | "Pro";
  lang: "RU" | "KZ";
  avatarUrl?: string | null;
  createdAt: number;
};

export async function ensureUserProfile(params: {
  uid: string;
  email: string;
  name?: string;
}) {
  const ref = doc(db, "users", params.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const payload: UserProfile = {
      uid: params.uid,
      email: params.email,
      name: params.name ?? "Имя Фамилия",
      plan: "Free",
      lang: "RU",
      avatarUrl: null,
      createdAt: Date.now(),
    };
    await setDoc(ref, payload);
  }
}

export function subscribeUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, patch);
}
