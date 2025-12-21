import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Lang = "RU" | "KZ";

export type ProfileSettings = {
  lang: Lang;
  darkMode: boolean;
  notifications: boolean;
  biometric: boolean;
};

export const KEY_PROFILE_SETTINGS = "zanai:profile:settings";

const DEFAULT_SETTINGS: ProfileSettings = {
  lang: "RU",
  darkMode: false,
  notifications: true,
  biometric: false,
};

export function t(lang: Lang, ru: string, kz: string) {
  return lang === "RU" ? ru : kz;
}

export function useProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const hydrate = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY_PROFILE_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProfileSettings>;
        setSettings((prev) => ({
          lang: (parsed.lang ?? prev.lang) as Lang,
          darkMode: typeof parsed.darkMode === "boolean" ? parsed.darkMode : prev.darkMode,
          notifications:
            typeof parsed.notifications === "boolean" ? parsed.notifications : prev.notifications,
          biometric: typeof parsed.biometric === "boolean" ? parsed.biometric : prev.biometric,
        }));
      }
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    hydrate();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hydrate]);

  const persistDebounced = useCallback((next: ProfileSettings) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(KEY_PROFILE_SETTINGS, JSON.stringify(next));
      } catch {
        // ignore
      }
    }, 200);
  }, []);

  const patch = useCallback(
    (partial: Partial<ProfileSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        persistDebounced(next);
        return next;
      });
    },
    [persistDebounced]
  );

  const api = useMemo(
    () => ({
      ready,
      settings,
      lang: settings.lang,
      darkMode: settings.darkMode,
      notifications: settings.notifications,
      biometric: settings.biometric,
      setLang: (lang: Lang) => patch({ lang }),
      setDarkMode: (darkMode: boolean) => patch({ darkMode }),
      setNotifications: (notifications: boolean) => patch({ notifications }),
      setBiometric: (biometric: boolean) => patch({ biometric }),
      hydrate,
    }),
    [ready, settings, patch, hydrate]
  );

  return api;
}
