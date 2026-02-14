import {
  FilterIcon,
  SearchIcon,
  Settings2Icon,
  TablePropertiesIcon,
  WrapTextIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { LanguageToggle } from "@/components/language-toggle";
import { MobileServicesList } from "@/components/mobile-services-list";
import { ServicesTable } from "@/components/services-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import type { ServiceMapping } from "@/data/services";

interface MobileHomeTranslations {
  title: string;
  subtitle: string;
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
  wrapText: string;
  filters: string;
  settings: string;
  compareView: string;
  cardView: string;
  loadMore: string;
}

interface MobileHomeViewProps {
  currentLang: "en" | "es";
  translations: MobileHomeTranslations;
  services: ServiceMapping[];
  filteredServices: ServiceMapping[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  activeCategory: string;
  onActiveCategoryChange: (value: string) => void;
  categoryOptions: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  wrapText: boolean;
  onWrapTextChange: (value: boolean) => void;
  onCycleTheme: () => void;
  themeIcon: ReactNode;
  pageSize: number;
}

/**
 * Mobile-first home view with card list, compare mode toggle, and bottom-sheet controls.
 *
 * @param props - Component props
 * @returns Mobile optimized interface
 */
export function MobileHomeView({
  currentLang,
  translations,
  services,
  filteredServices,
  searchQuery,
  onSearchQueryChange,
  activeCategory,
  onActiveCategoryChange,
  categoryOptions,
  hasActiveFilters,
  clearFilters,
  wrapText,
  onWrapTextChange,
  onCycleTheme,
  themeIcon,
  pageSize,
}: MobileHomeViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, searchQuery, activeCategory, currentLang]);

  const mobileServices = filteredServices.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredServices.length;

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-6">
      <header className="sticky top-0 z-30 -mx-4 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{translations.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{translations.subtitle}</p>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="mobile-search"
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-10 rounded-lg border-border bg-background pl-10 pr-10 text-sm"
          />
          {searchQuery.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
              onClick={() => onSearchQueryChange("")}
              aria-label={translations.clearFilters}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8 gap-1.5 rounded-full px-3",
              })}
            >
              <FilterIcon className="h-3.5 w-3.5" />
              {translations.filters}
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh] rounded-t-2xl">
              <DrawerHeader className="text-left">
                <DrawerTitle>{translations.filters}</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-3 overflow-y-auto px-4 pb-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {translations.categoriesLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory.length === 0 ? "default" : "outline"}
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => onActiveCategoryChange("")}
                  >
                    {translations.allCategories}
                  </Button>
                  {categoryOptions.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      size="sm"
                      className="h-8 rounded-full px-3"
                      onClick={() => onActiveCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="h-8 px-0" onClick={clearFilters}>
                    {translations.clearFilters}
                  </Button>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 rounded-full px-3"
            onClick={() => setCompareMode((prev) => !prev)}
          >
            <TablePropertiesIcon className="h-3.5 w-3.5" />
            {compareMode ? translations.compareView : translations.cardView}
          </Button>

          <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DrawerTrigger
              className={buttonVariants({
                variant: "outline",
                size: "icon-sm",
                className: "ml-auto rounded-full",
              })}
            >
              <Settings2Icon className="h-3.5 w-3.5" />
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh] rounded-t-2xl">
              <DrawerHeader className="text-left">
                <DrawerTitle>{translations.settings}</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-3 overflow-y-auto px-4 pb-4">
                <div className="rounded-lg border border-border/70 bg-card p-3">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Theme
                  </p>
                  <Button variant="outline" size="sm" onClick={onCycleTheme}>
                    {themeIcon}
                  </Button>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Language
                  </p>
                  <LanguageToggle currentLang={currentLang} variant="mobile" />
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3">
                  <Button
                    variant={wrapText ? "default" : "outline"}
                    size="sm"
                    onClick={() => onWrapTextChange(!wrapText)}
                    className="gap-1.5"
                  >
                    <WrapTextIcon className="h-4 w-4" />
                    {translations.wrapText}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <section className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {translations.showing}{" "}
            <span className="font-semibold text-foreground">{filteredServices.length}</span>{" "}
            {translations.of}{" "}
            <span className="font-semibold text-foreground">{services.length}</span>{" "}
            {translations.services}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={clearFilters}>
              <XIcon className="mr-1 h-3.5 w-3.5" />
              {translations.clearFilters}
            </Button>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="space-y-3 rounded-lg border border-border/80 bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{translations.noResults}</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {translations.clearFilters}
            </Button>
          </div>
        ) : compareMode ? (
          <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
            <ServicesTable
              services={mobileServices}
              translations={translations}
              currentLang={currentLang}
              wrapText={wrapText}
            />
          </div>
        ) : (
          <MobileServicesList
            services={mobileServices}
            currentLang={currentLang}
            translations={translations}
          />
        )}

        {canLoadMore && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
          >
            {translations.loadMore}
          </Button>
        )}
      </section>
    </div>
  );
}
