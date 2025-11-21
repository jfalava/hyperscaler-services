import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

interface FloatingButtonsProps {
  currentLang: "en" | "es";
}

/**
 * Floating buttons component containing theme toggle and language switcher.
 */
export function FloatingButtons({ currentLang }: FloatingButtonsProps) {
  return (
    <div className="fixed top-3 right-3 sm:right-6 md:right-8 lg:right-[max(1rem,calc((100vw-80rem)/2+2rem))] z-50 flex flex-col items-end gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <ThemeToggle />
        <LanguageToggle currentLang={currentLang} variant="mobile" />
      </div>
    </div>
  );
}
