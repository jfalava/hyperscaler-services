import { useNavigate } from "@tanstack/react-router";
import { SettingsIcon, WrapTextIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";

interface FloatingButtonsProps {
  currentLang: "en" | "es";
  wrapText?: boolean;
  onWrapTextChange?: (wrap: boolean) => void;
}

interface Translations {
  title: string;
  theme: string;
  themeDesc: string;
  language: string;
  languageDesc: string;
  tableWrap: string;
  tableWrapDesc: string;
}

const getTranslations = (currentLang: "en" | "es"): Translations => ({
  title: currentLang === "es" ? "Configuración" : "Settings",
  theme: currentLang === "es" ? "Tema" : "Theme",
  themeDesc: currentLang === "es" ? "Cambiar el tema de la aplicación" : "Change application theme",
  language: currentLang === "es" ? "Idioma" : "Language",
  languageDesc:
    currentLang === "es" ? "Cambiar el idioma de la interfaz" : "Change interface language",
  tableWrap: currentLang === "es" ? "Ajustar texto en tabla" : "Wrap table text",
  tableWrapDesc:
    currentLang === "es" ? "Ajustar texto largo en las celdas" : "Wrap long text in table cells",
});

const getThemeLabel = (theme: ThemeMode, currentLang: "en" | "es"): string => {
  const labels: Record<"en" | "es", Record<ThemeMode, string>> = {
    en: { light: "Light", dark: "Dark", system: "System" },
    es: { light: "Claro", dark: "Oscuro", system: "Sistema" },
  };
  return labels[currentLang][theme];
};

interface ThemeSectionProps {
  theme: ThemeMode;
  currentLang: "en" | "es";
  onCycleTheme: () => void;
}

function ThemeSection({ theme, currentLang, onCycleTheme }: ThemeSectionProps) {
  const t = getTranslations(currentLang);
  return (
    <div className="space-y-3 rounded-lg border border-border bg-accent/30 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
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
        <h3 className="text-sm font-semibold">{t.theme}</h3>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t.themeDesc}</p>
        <Button variant="outline" size="sm" onClick={onCycleTheme} className="shrink-0">
          {getThemeLabel(theme, currentLang)}
        </Button>
      </div>
    </div>
  );
}

interface LanguageSectionProps {
  currentLang: "en" | "es";
  onToggleLanguage: () => void;
}

function LanguageSection({ currentLang, onToggleLanguage }: LanguageSectionProps) {
  const t = getTranslations(currentLang);
  return (
    <div className="space-y-3 rounded-lg border border-border bg-accent/30 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
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
        <h3 className="text-sm font-semibold">{t.language}</h3>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t.languageDesc}</p>
        <Button variant="outline" size="sm" onClick={onToggleLanguage} className="shrink-0">
          {currentLang === "en" ? "English" : "Español"}
        </Button>
      </div>
    </div>
  );
}

interface WrapTextSectionProps {
  wrapText: boolean;
  currentLang: "en" | "es";
  onToggleWrapText: () => void;
}

function WrapTextSection({ wrapText, currentLang, onToggleWrapText }: WrapTextSectionProps) {
  const t = getTranslations(currentLang);
  const enabledLabel = currentLang === "es" ? "Activado" : "Enabled";
  const disabledLabel = currentLang === "es" ? "Desactivado" : "Disabled";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-accent/30 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <WrapTextIcon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{t.tableWrap}</h3>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t.tableWrapDesc}</p>
        <Button
          variant={wrapText ? "default" : "outline"}
          size="sm"
          onClick={onToggleWrapText}
          className="shrink-0"
        >
          {wrapText ? enabledLabel : disabledLabel}
        </Button>
      </div>
    </div>
  );
}

export function FloatingButtons({
  currentLang,
  wrapText = false,
  onWrapTextChange,
}: FloatingButtonsProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const t = getTranslations(currentLang);

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "es" : "en";
    void navigate({
      to: "/",
      search: (prev) => ({
        lang: newLang,
        page: prev.page ?? 1,
        wrapText: prev.wrapText ?? false,
      }),
      replace: true,
    });
  };

  const toggleWrapText = () => {
    if (onWrapTextChange) {
      onWrapTextChange(!wrapText);
    }
  };

  return (
    <div className="fixed top-3 right-3 z-50 sm:right-6 md:right-8 lg:right-[max(1rem,calc((100vw-80rem)/2+2rem))]">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg"
            aria-label={t.title}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ThemeSection theme={theme} currentLang={currentLang} onCycleTheme={cycleTheme} />
            <LanguageSection currentLang={currentLang} onToggleLanguage={toggleLanguage} />
            {!isMobile && onWrapTextChange && (
              <WrapTextSection
                wrapText={wrapText}
                currentLang={currentLang}
                onToggleWrapText={toggleWrapText}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
