import { useHotkey } from "@tanstack/react-hotkeys";
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { MonitorIcon, MoonIcon, SearchIcon, SunIcon, WrapTextIcon, XIcon } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { LanguageToggle } from "@/components/language-toggle";
import { MobileHomeView } from "@/components/mobile-home-view";
import { ServicesTable } from "@/components/services-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { importServices } from "@/data/services";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePaginationStore } from "@/hooks/use-pagination";
import { usePaginationHotkeys } from "@/hooks/use-pagination-hotkeys";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";

/**
 * Server function to load services data on the server side.
 */
const getServices = createServerFn({
  method: "GET",
}).handler(async () => {
  return await importServices();
});

/**
 * Supported language codes.
 */
type LanguageCode = "en" | "es";

/**
 * Interface for page translation strings.
 */
interface PageTranslations {
  title: string;
  subtitle: string;
  dataQualityNotice: string;
  searchPlaceholder: string;
  categoriesLabel: string;
  clearFilters: string;
  allCategories: string;
  awsColumn: string;
  azureColumn: string;
  gcpColumn: string;
  oracleColumn: string;
  cloudflareColumn: string;
  categoryColumn: string;
  descriptionColumn: string;
  noResults: string;
  showing: string;
  of: string;
  services: string;
  previous: string;
  next: string;
  wrapText: string;
  filters: string;
  settings: string;
  compareView: string;
  cardView: string;
  loadMore: string;
}

const translations: Record<LanguageCode, PageTranslations> = {
  en: {
    title: "Hyperscaler Services",
    subtitle:
      "Compare equivalent services between AWS, Azure, Google Cloud, Oracle Cloud, and Cloudflare",
    dataQualityNotice:
      "This catalog is still a work in progress. Some entries are miscategorized or poorly described. But rest assured: the naming of the services and their links are correct.",
    searchPlaceholder: "Search services...",
    categoriesLabel: "Categories",
    clearFilters: "Clear filters",
    allCategories: "All",
    awsColumn: "AWS",
    azureColumn: "Azure",
    gcpColumn: "GCP",
    oracleColumn: "Oracle",
    cloudflareColumn: "Cloudflare",
    categoryColumn: "Category",
    descriptionColumn: "Description",
    noResults: "No services found",
    showing: "Showing",
    of: "of",
    services: "services",
    previous: "Previous",
    next: "Next",
    wrapText: "Wrap text",
    filters: "Filters",
    settings: "Settings",
    compareView: "Compare",
    cardView: "Cards",
    loadMore: "Load more",
  },
  es: {
    title: "Servicios de Hyperscalers",
    subtitle:
      "Compara servicios equivalentes entre AWS, Azure, Google Cloud, Oracle Cloud y Cloudflare",
    dataQualityNotice:
      "Este catálogo sigue en progreso. Algunas entradas pueden seguir mal categorizadas o mal descritas. Hemos confirmado que los nombres de los servicios y sus enlaces son correctos.",
    searchPlaceholder: "Buscar servicios...",
    categoriesLabel: "Categorías",
    clearFilters: "Limpiar filtros",
    allCategories: "Todas",
    awsColumn: "AWS",
    azureColumn: "Azure",
    gcpColumn: "GCP",
    oracleColumn: "Oracle",
    cloudflareColumn: "Cloudflare",
    categoryColumn: "Categoría",
    descriptionColumn: "Descripción",
    noResults: "No se encontraron servicios",
    showing: "Mostrando",
    of: "de",
    services: "servicios",
    previous: "Anterior",
    next: "Siguiente",
    wrapText: "Ajustar texto",
    filters: "Filtros",
    settings: "Configuración",
    compareView: "Comparar",
    cardView: "Tarjetas",
    loadMore: "Cargar más",
  },
};

/**
 * Gets translation strings based on the current language.
 *
 * @param currentLang - Current language code
 * @returns Translation object with all UI strings
 */
const getTranslations = (currentLang: string): PageTranslations => {
  return translations[currentLang as LanguageCode] ?? translations.en;
};

/**
 * Normalizes a string for case-insensitive search by removing diacritics.
 *
 * @param str - String to normalize
 * @returns Normalized string in lowercase without diacritics, or empty string if input is null/undefined
 */
const normalizeString = (str: unknown): string => {
  if (typeof str !== "string") {
    return "";
  }
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const langValue = search.lang;
    // Validate and clamp to allowed values
    const validLang = langValue === "en" || langValue === "es" ? langValue : "en";

    // Validate page parameter
    const pageValue =
      typeof search.page === "number"
        ? search.page
        : typeof search.page === "string"
          ? parseInt(search.page, 10)
          : 1;
    const validPage = !isNaN(pageValue) && pageValue > 0 ? pageValue : 1;

    // Validate wrapText parameter
    const wrapTextValue = search.wrapText;
    const validWrapText =
      wrapTextValue === undefined ? true : wrapTextValue === true || wrapTextValue === "true";

    return {
      lang: validLang as LanguageCode,
      page: validPage,
      wrapText: validWrapText,
    };
  },
  loader: async () => await getServices(),
  component: Home,
});

/**
 * Main home page component displaying the services comparison table.
 */
function Home() {
  const services = Route.useLoaderData();
  const { lang, page, wrapText } = useSearch({ from: "/" });
  const currentLang = lang;
  const t = getTranslations(currentLang);
  const navigate = useNavigate({ from: "/" });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { currentPage, itemsPerPage, setCurrentPage, setTotalItems } = usePaginationStore();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchModifierKey, setSearchModifierKey] = useState<"Ctrl" | "⌘">("Ctrl");

  /**
   * Updates URL search parameters with provided changes.
   *
   * @param updates - Partial updates to apply to search parameters
   */
  const updateURL = useCallback(
    (updates: Partial<{ page: number; wrapText: boolean }>) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      });
    },
    [navigate],
  );

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const platform = navigator.platform.toLowerCase();
    setSearchModifierKey(platform.includes("mac") ? "⌘" : "Ctrl");
  }, []);

  const categoryOptions = useMemo(() => {
    const categorySet = new Set<string>();
    for (const service of services) {
      categorySet.add(service.categoryName[currentLang]);
    }
    const collator = new Intl.Collator(currentLang);
    const sortedCategories: string[] = [];
    for (const category of categorySet) {
      const insertionIndex = sortedCategories.findIndex(
        (existingCategory) => collator.compare(category, existingCategory) < 0,
      );
      if (insertionIndex === -1) {
        sortedCategories.push(category);
      } else {
        sortedCategories.splice(insertionIndex, 0, category);
      }
    }
    return sortedCategories;
  }, [services, currentLang]);

  const cycleTheme = useCallback(() => {
    const themes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const getThemeIcon = () => {
    if (theme === "dark") {
      return <MoonIcon className="h-4 w-4" />;
    }
    if (theme === "system") {
      return <MonitorIcon className="h-4 w-4" />;
    }
    return <SunIcon className="h-4 w-4" />;
  };

  /**
   * Filters services based on the search query across all text fields.
   */
  const filteredServices = useMemo(() => {
    const searchNormalized = normalizeString(searchQuery.trim());
    const categoryNormalized = normalizeString(activeCategory);

    return services.filter((service) => {
      const category = normalizeString(service.categoryName[currentLang]);
      const aws = normalizeString(service.aws);
      const azure = normalizeString(service.azure);
      const gcp = normalizeString(service.gcp);
      const oracle = normalizeString(service.oracle);
      const cloudflare = normalizeString(service.cloudflare);
      const description = normalizeString(service.description[currentLang]);

      const matchesSearch =
        searchNormalized.length === 0 ||
        category.includes(searchNormalized) ||
        aws.includes(searchNormalized) ||
        azure.includes(searchNormalized) ||
        gcp.includes(searchNormalized) ||
        oracle.includes(searchNormalized) ||
        cloudflare.includes(searchNormalized) ||
        description.includes(searchNormalized);
      const matchesCategory = categoryNormalized.length === 0 || category === categoryNormalized;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, currentLang, activeCategory]);

  useEffect(() => {
    setTotalItems(filteredServices.length);
  }, [filteredServices.length, setTotalItems]);

  useEffect(() => {
    updateURL({ page: 1 });
  }, [searchQuery, updateURL]);

  useEffect(() => {
    updateURL({ page: 1 });
  }, [activeCategory, updateURL]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const currentPageClamped = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (currentPageClamped - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Register pagination keyboard shortcuts using TanStack Hotkeys
  usePaginationHotkeys({
    currentPage: currentPageClamped,
    totalPages,
    onPageChange: (page) => updateURL({ page }),
  });

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  });

  /**
   * Generates pagination items with proper ellipsis handling.
   *
   * @returns Array of pagination items
   */
  const generatePaginationItems = () => {
    const items = [];
    const total = totalPages;
    const current = currentPageClamped;

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => updateURL({ page: current - 1 })}
          className={current === 1 ? "pointer-events-none opacity-50" : ""}
        >
          {t.previous}
        </PaginationPrevious>
      </PaginationItem>,
    );

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === current} onClick={() => updateURL({ page: i })}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      items.push(
        <PaginationItem key="1">
          <PaginationLink isActive={1 === current} onClick={() => updateURL({ page: 1 })}>
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (current > 4) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === current} onClick={() => updateURL({ page: i })}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (current < total - 3) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      if (total > 1) {
        items.push(
          <PaginationItem key={total}>
            <PaginationLink isActive={total === current} onClick={() => updateURL({ page: total })}>
              {total}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    }

    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => updateURL({ page: current + 1 })}
          className={current === total ? "pointer-events-none opacity-50" : ""}
        >
          {t.next}
        </PaginationNext>
      </PaginationItem>,
    );

    return items;
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || activeCategory.length > 0;
  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
  };

  if (isMobile) {
    return (
      <MobileHomeView
        currentLang={currentLang}
        translations={t}
        services={services}
        filteredServices={filteredServices}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchInputRef={searchInputRef}
        activeCategory={activeCategory}
        onActiveCategoryChange={setActiveCategory}
        categoryOptions={categoryOptions}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        wrapText={wrapText}
        onWrapTextChange={(value) => updateURL({ wrapText: value })}
        onCycleTheme={cycleTheme}
        themeIcon={getThemeIcon()}
        pageSize={itemsPerPage}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        {t.dataQualityNotice}
      </div>
      <header className="space-y-4 sm:space-y-5">
        <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t.title}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{t.subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <LanguageToggle currentLang={currentLang} />
              <Button variant="outline" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
                {getThemeIcon()}
              </Button>
              <Button
                variant={wrapText ? "default" : "outline"}
                size="sm"
                onClick={() => updateURL({ wrapText: !wrapText })}
                className="gap-2"
              >
                <WrapTextIcon className="h-4 w-4" />
                {t.wrapText}
              </Button>
            </div>
          </div>

          <div className="relative mt-4">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              id="search"
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border-border bg-background/80 pr-24 pl-10 text-sm md:text-sm"
            />
            {searchQuery.length === 0 && (
              <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                <KbdGroup>
                  <Kbd>{searchModifierKey}</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
            )}
            {searchQuery.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
                aria-label={t.clearFilters}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t.categoriesLabel}
            </span>
            <Button
              variant={activeCategory.length === 0 ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full px-3 text-xs"
              onClick={() => setActiveCategory("")}
            >
              {t.allCategories}
            </Button>
            {categoryOptions.slice(0, 8).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-5 rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t.showing}{" "}
            <span className="font-semibold text-foreground">{filteredServices.length}</span> {t.of}{" "}
            <span className="font-semibold text-foreground">{services.length}</span> {t.services}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={clearFilters}>
              <XIcon className="mr-1.5 h-3.5 w-3.5" />
              {t.clearFilters}
            </Button>
          )}
        </div>

        <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
          {filteredServices.length === 0 ? (
            <div className="space-y-3 p-10 text-center">
              <p className="text-sm text-muted-foreground">{t.noResults}</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t.clearFilters}
              </Button>
            </div>
          ) : (
            <ServicesTable
              services={paginatedServices}
              translations={t}
              currentLang={currentLang}
              wrapText={wrapText}
            />
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>{generatePaginationItems()}</PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  );
}
