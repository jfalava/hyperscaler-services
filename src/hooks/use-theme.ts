import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

/**
 * Apply theme to the document.
 */
function applyTheme(theme: ThemeMode): void {
  if (
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Hook for managing theme state with localStorage persistence.
 * Handles initial loading, system preference changes, and theme switching.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Lazy initialization - only read localStorage on client side
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
        return savedTheme;
      }
    }
    return "system";
  });

  // Apply theme when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      applyTheme(theme);
    }
  }, [theme]);

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    }
  };

  return { theme, setTheme };
}
