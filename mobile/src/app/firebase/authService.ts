import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export async function fbRegister(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // (опционально) можно сохранить name в Firestore profile позже
  await sendEmailVerification(cred.user);

  return cred.user;
}

export async function fbLogin(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function fbResendVerification() {
  if (!auth.currentUser) throw new Error("Нет пользователя.");
  await sendEmailVerification(auth.currentUser);
}

export async function fbLogout() {
  await signOut(auth);
}
