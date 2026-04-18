"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR and first client render must match. Initialize to a safe default and
  // sync with the actual theme (already applied to <html> by the inline script
  // in layout.tsx) after mount.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync React state with the `dark` class set by the inline <head> script
    // before hydration. This is the one-time bridge from pre-hydration DOM
    // state into React and is expected to trigger exactly one re-render.
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rebb-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  function toggle() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
