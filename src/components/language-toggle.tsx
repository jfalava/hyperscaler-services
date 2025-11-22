import { useNavigate, useSearch } from "@tanstack/react-router";

interface LanguageToggleProps {
  currentLang: "en" | "es";
  variant?: "mobile" | "desktop";
}

/**
 * Language toggle component for switching between English and Spanish.
 */
export function LanguageToggle({
  currentLang,
  variant = "desktop",
}: LanguageToggleProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleLanguageChange = (lang: "en" | "es") => {
    navigate({
      search: { ...search, lang },
      replace: true,
    });
  };

  const baseClasses =
    variant === "mobile"
      ? "inline-flex items-center rounded-full bg-secondary/95 px-2 py-0.5 text-[10px] shadow-sm"
      : "inline-flex items-center rounded-full bg-secondary px-1 py-0.5 text-xs sm:text-sm";

  const buttonClasses = (lang: "en" | "es") => {
    const isActive = currentLang === lang;
    const baseButtonClasses =
      variant === "mobile"
        ? "px-2 py-0.5 rounded-full font-medium transition-colors"
        : "px-3 py-1 rounded-full font-medium transition-colors";

    return `${baseButtonClasses} ${
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-secondary-foreground"
    }`;
  };

  return (
    <div className={baseClasses}>
      <button
        onClick={() => handleLanguageChange("en")}
        className={buttonClasses("en")}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange("es")}
        className={buttonClasses("es")}
        aria-label="Switch to Spanish"
      >
        ES
      </button>
    </div>
  );
}
