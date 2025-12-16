// mobile/src/app/firebase/authService.ts
import { auth, db } from "./firebase";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  reload,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserProfileDoc = {
  uid: string;
  displayName: string;
  email: string;
  plan?: "Free" | "Pro";
  createdAt?: any;
  updatedAt?: any;
};

// Вход
export async function fbLogin(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Регистрация + письмо подтверждения + users/{uid} в Firestore
export async function fbRegister(name: string, email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // имя в Firebase Auth профиле
  if (name?.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }

  // письмо подтверждения
  await sendEmailVerification(cred.user);

  // профиль в Firestore
  const userDoc: UserProfileDoc = {
    uid: cred.user.uid,
    displayName: name.trim(),
    email: cred.user.email ?? email,
    plan: "Free",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", cred.user.uid), userDoc, { merge: true });

  return cred.user;
}

// Повторно отправить письмо подтверждения на текущего пользователя
export async function fbResendVerification(): Promise<void> {
  const u = auth.currentUser;
  if (!u) throw new Error("Нет пользователя: сначала войди/зарегистрируйся.");
  await sendEmailVerification(u);
}

// Выйти
export async function fbLogout(): Promise<void> {
  await signOut(auth);
}

// Перезагрузить текущего пользователя (обновить emailVerified и т.п.)
export async function fbReloadUser(currentUser: any): Promise<User | null> {
  const u = auth.currentUser;
  if (!u) return null;
  await reload(u);
  return auth.currentUser;
}
