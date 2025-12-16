import React, { createContext, useContext, useMemo, useState } from "react";

type AuthCtx = {
  isAuthed: boolean;
  setIsAuthed: (v: boolean) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);

  const value = useMemo(() => ({ isAuthed, setIsAuthed }), [isAuthed]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
