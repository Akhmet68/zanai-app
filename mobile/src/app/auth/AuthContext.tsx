// src/app/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { fbLogout, fbReloadUser } from "../firebase/authService";

type AuthCtx = {
  user: User | null;
  initializing: boolean;

  isAuthed: boolean;   
  isVerified: boolean; 
  guest: boolean;

  continueAsGuest: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
      if (u) setGuest(false);
    });
    return unsub;
  }, []);

  const isVerified = !!user?.emailVerified;
  const isAuthed = (!!user && isVerified) || guest;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      initializing,
      isAuthed,
      isVerified,
      guest,
      continueAsGuest: () => setGuest(true),
      logout: async () => {
        setGuest(false);
        await fbLogout();
      },
      refreshUser: async () => {
        if (!auth.currentUser) return;
        await fbReloadUser(auth.currentUser);
      },
    }),
    [user, initializing, isAuthed, isVerified, guest]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
