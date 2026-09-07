import { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../utils/storage.js";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storage.get("theme") || "dark");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const resolveTheme = () =>
      theme === "system" && media.matches
        ? "light"
        : theme === "system"
          ? "dark"
          : theme;
    const resolvedTheme = resolveTheme();
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    storage.set("theme", theme);
    const updateSystemTheme = () =>
      document.documentElement.setAttribute("data-theme", resolveTheme());
    media.addEventListener?.("change", updateSystemTheme);
    return () => media.removeEventListener?.("change", updateSystemTheme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
