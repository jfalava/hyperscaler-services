import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo, useCallback } from "react";
import { WrapTextIcon } from "lucide-react";
import { importServices } from "@/data/services";
import { FloatingButtons } from "@/components/floating-buttons";
import { ServicesTable } from "@/components/services-table";
import { usePaginationStore } from "@/hooks/use-pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

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
  searchPlaceholder: string;
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
}

/**
 * Gets translation strings based on the current language.
 *
 * @param currentLang - Current language code
 * @returns Translation object with all UI strings
 */
const getTranslations = (currentLang: string): PageTranslations => {
  return {
    title:
      currentLang === "es"
        ? "Servicios de Hyperscalers"
        : "Hyperscaler Services",
    subtitle:
      currentLang === "es"
        ? "Compara servicios equivalentes entre AWS, Azure, Google Cloud, Oracle Cloud y Cloudflare"
        : "Compare equivalent services between AWS, Azure, Google Cloud, Oracle Cloud, and Cloudflare",
    searchPlaceholder:
      currentLang === "es" ? "Buscar servicios..." : "Search services...",
    awsColumn: "AWS",
    azureColumn: "Azure",
    gcpColumn: "GCP",
    oracleColumn: "Oracle",
    cloudflareColumn: "Cloudflare",
    categoryColumn: currentLang === "es" ? "Categoría" : "Category",
    descriptionColumn: currentLang === "es" ? "Descripción" : "Description",
    noResults:
      currentLang === "es"
        ? "No se encontraron servicios"
        : "No services found",
    showing: currentLang === "es" ? "Mostrando" : "Showing",
    of: currentLang === "es" ? "de" : "of",
    services: currentLang === "es" ? "servicios" : "services",
    previous: currentLang === "es" ? "Anterior" : "Previous",
    next: currentLang === "es" ? "Siguiente" : "Next",
    wrapText: currentLang === "es" ? "Ajustar texto" : "Wrap text",
  };
};

/**
 * Normalizes a string for case-insensitive search by removing diacritics.
 *
 * @param str - String to normalize
 * @returns Normalized string in lowercase without diacritics
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const langValue = search.lang;
    // Validate and clamp to allowed values
    const validLang =
      langValue === "en" || langValue === "es" ? langValue : "en";

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
    const validWrapText = wrapTextValue === true || wrapTextValue === "true";

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
  const pagination = usePaginationStore();
  const isMobile = useIsMobile();

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
    pagination.setCurrentPage(page);
  }, [page, pagination.setCurrentPage]);

  /**
   * Filters services based on the search query across all text fields.
   */
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    const searchNormalized = normalizeString(searchQuery.trim());

    return services.filter((service) => {
      const category = normalizeString(service.categoryName[currentLang]);
      const aws = normalizeString(service.aws);
      const azure = normalizeString(service.azure);
      const gcp = normalizeString(service.gcp);
      const oracle = normalizeString(service.oracle);
      const cloudflare = normalizeString(service.cloudflare);
      const description = normalizeString(service.description[currentLang]);

      return (
        category.includes(searchNormalized) ||
        aws.includes(searchNormalized) ||
        azure.includes(searchNormalized) ||
        gcp.includes(searchNormalized) ||
        oracle.includes(searchNormalized) ||
        cloudflare.includes(searchNormalized) ||
        description.includes(searchNormalized)
      );
    });
  }, [services, searchQuery, currentLang]);

  useEffect(() => {
    pagination.setTotalItems(filteredServices.length);
  }, [filteredServices.length, pagination.setTotalItems]);

  useEffect(() => {
    updateURL({ page: 1 });
  }, [searchQuery, updateURL]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / pagination.itemsPerPage),
  );
  const currentPageClamped = Math.max(
    1,
    Math.min(pagination.currentPage, totalPages),
  );
  const startIndex = (currentPageClamped - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.contentEditable === "true" ||
        target.getAttribute("role") === "textbox"
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && currentPageClamped > 1) {
        e.preventDefault();
        updateURL({ page: currentPageClamped - 1 });
      } else if (e.key === "ArrowRight" && currentPageClamped < totalPages) {
        e.preventDefault();
        updateURL({ page: currentPageClamped + 1 });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentPageClamped, totalPages, updateURL]);

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
            <PaginationLink
              isActive={i === current}
              onClick={() => pagination.goToPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            isActive={1 === current}
            onClick={() => updateURL({ page: 1 })}
          >
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
            <PaginationLink
              isActive={i === current}
              onClick={() => updateURL({ page: i })}
            >
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
            <PaginationLink
              isActive={total === current}
              onClick={() => updateURL({ page: total })}
            >
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <FloatingButtons
        currentLang={currentLang}
        wrapText={wrapText}
        onWrapTextChange={(newWrapText) => updateURL({ wrapText: newWrapText })}
      />

      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mt-1 px-4 py-2 pl-12 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </header>

      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border relative">
        {!isMobile && filteredServices.length > 0 && (
          <div className="sticky top-0 z-10 flex justify-end p-3 bg-card/95 backdrop-blur-sm border-b border-border">
            <Button
              variant={wrapText ? "default" : "outline"}
              size="sm"
              onClick={() => updateURL({ wrapText: !wrapText })}
              className="gap-2"
              title={t.wrapText}
            >
              <WrapTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.wrapText}</span>
            </Button>
          </div>
        )}
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t.noResults}
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
    </div>
  );
}
