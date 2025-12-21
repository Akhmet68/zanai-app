import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User, reload } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { fbLogout } from "../firebase/authService";

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

function isSocialUser(u: User | null) {
  if (!u) return false;
  return u.providerData?.some((p) => p.providerId && p.providerId !== "password") ?? false;
}

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

  const isVerified = !!user?.emailVerified || isSocialUser(user);
  const isAuthed = (!!user && isVerified) || guest;

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });
  };

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
      refreshUser,
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
