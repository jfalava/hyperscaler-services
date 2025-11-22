import { useState, useEffect } from "react";
import { SettingsIcon, WrapTextIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type ThemeMode = "light" | "dark" | "system";

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

interface FloatingButtonsProps {
  currentLang: "en" | "es";
  wrapText?: boolean;
  onWrapTextChange?: (wrap: boolean) => void;
}

/**
 * Floating button component that opens a dialog with theme toggle and language switcher.
 */
export function FloatingButtons({
  currentLang,
  wrapText = false,
  onWrapTextChange,
}: FloatingButtonsProps) {
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme =
        (localStorage.getItem("theme") as ThemeMode) || "system";
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", nextTheme);
    }
    applyTheme(nextTheme);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "es" : "en";
    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLang);
    window.location.href = url.toString();
  };

  const getThemeLabel = () => {
    if (currentLang === "es") {
      switch (theme) {
        case "light":
          return "Claro";
        case "dark":
          return "Oscuro";
        case "system":
          return "Sistema";
      }
    }
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
    }
  };

  const translations = {
    title: currentLang === "es" ? "Configuración" : "Settings",
    theme: currentLang === "es" ? "Tema" : "Theme",
    themeDesc:
      currentLang === "es"
        ? "Cambiar el tema de la aplicación"
        : "Change application theme",
    language: currentLang === "es" ? "Idioma" : "Language",
    languageDesc:
      currentLang === "es"
        ? "Cambiar el idioma de la interfaz"
        : "Change interface language",
    tableWrap:
      currentLang === "es" ? "Ajustar texto en tabla" : "Wrap table text",
    tableWrapDesc:
      currentLang === "es"
        ? "Ajustar texto largo en las celdas"
        : "Wrap long text in table cells",
  };

  return (
    <div className="fixed top-3 right-3 sm:right-6 md:right-8 lg:right-[max(1rem,calc((100vw-80rem)/2+2rem))] z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg"
            aria-label={translations.title}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{translations.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-accent/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold">{translations.theme}</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {translations.themeDesc}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cycleTheme}
                  className="shrink-0"
                >
                  {getThemeLabel()}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-accent/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold">
                  {translations.language}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {translations.languageDesc}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="shrink-0"
                >
                  {currentLang === "en" ? "English" : "Español"}
                </Button>
              </div>
            </div>
            {!isMobile && onWrapTextChange && (
              <div className="rounded-lg border border-border bg-accent/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <WrapTextIcon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    {translations.tableWrap}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {translations.tableWrapDesc}
                  </p>
                  <Button
                    variant={wrapText ? "default" : "outline"}
                    size="sm"
                    onClick={() => onWrapTextChange(!wrapText)}
                    className="shrink-0"
                  >
                    {wrapText
                      ? currentLang === "es"
                        ? "Activado"
                        : "Enabled"
                      : currentLang === "es"
                        ? "Desactivado"
                        : "Disabled"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
