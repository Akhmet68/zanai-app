import { auth, db, storage } from "./firebase";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  plan: "Free" | "Pro";
  lang: "RU" | "KZ";
  photoURL?: string | null;
  createdAt?: any;
  updatedAt?: any;
};

export function watchUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  const r = doc(db, "users", uid);
  return onSnapshot(r, (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function upsertUserProfile(uid: string, data: Partial<UserProfile>) {
  const r = doc(db, "users", uid);

  await setDoc(
    r,
    {
      ...data,
      uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function uriToBlob(uri: string) {
  const res = await fetch(uri);
  return await res.blob();
}

export async function uploadMyAvatar(imageUri: string) {
  const u = auth.currentUser;
  if (!u) throw new Error("NO_USER");

  const blob = await uriToBlob(imageUri);

  const avatarRef = ref(storage, `avatars/${u.uid}.jpg`);
  await uploadBytes(avatarRef, blob);

  const url = await getDownloadURL(avatarRef);

  await updateProfile(u, { photoURL: url }).catch(() => {});
  await upsertUserProfile(u.uid, { photoURL: url });

  return url;
}
