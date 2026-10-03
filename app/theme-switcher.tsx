"use client";

import { useLayoutEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { normalizeTheme, themeStorageKey, type Theme } from "@/lib/theme";
const themes = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useLayoutEffect(() => {
    let saved = document.documentElement.dataset.theme;
    try {
      saved = localStorage.getItem(themeStorageKey) ?? "system";
    } catch {
      // Theme selection still works when browser storage is unavailable.
    }
    const apply = (value: string | null | undefined) => {
      const next = normalizeTheme(value);
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    apply(saved);
    const sync = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null)
        apply(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function choose(next: Theme) {
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      // Keep the chosen theme for the current visit without blocking controls.
    }
  }

  return (
    <div className="theme-switcher" role="group" aria-label="Thème d’affichage">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          data-theme-option={value}
          aria-label={`Thème ${label.toLowerCase()}`}
          title={
            value === "system"
              ? "Suivre le thème de l’appareil"
              : `Thème ${label.toLowerCase()}`
          }
          aria-pressed={theme === value}
          onClick={() => choose(value)}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
