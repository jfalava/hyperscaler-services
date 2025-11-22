import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

/**
 * Apply theme to the document.
 */
function applyTheme(theme: ThemeMode): void {
  // Guard against server-side rendering or missing APIs
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider component for theme management.
 * Wraps the app to provide shared theme state to all components.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Lazy initialization - only read localStorage on client side
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
      ) {
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
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook for accessing theme state and setter.
 * Must be used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
