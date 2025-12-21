import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Auth from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKhgHhSaurR8iaRclN3-od_04z7p2HMRg",
  authDomain: "zanai-app.firebaseapp.com",
  projectId: "zanai-app",
  storageBucket: "zanai-app.appspot.com",
  messagingSenderId: "771269512484",
  appId: "1:771269512484:web:04f32fb5b773c94b0577b1",
  measurementId: "G-D07PKF3XQS",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function initAuth() {
  const getAuth = (Auth as any).getAuth as typeof Auth.getAuth;

  const initializeAuth = (Auth as any).initializeAuth as
    | ((app: any, opts?: any) => any)
    | undefined;

  const getReactNativePersistence = (Auth as any).getReactNativePersistence as
    | ((storage: any) => any)
    | undefined;

  if (initializeAuth && getReactNativePersistence) {
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // ignore (auth already initialized)
    }
  }

  return getAuth(app);
}

export const auth = initAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
