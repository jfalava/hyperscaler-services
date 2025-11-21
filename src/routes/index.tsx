import { createFileRoute, useSearch } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo } from "react";
import { importServices } from "@/data/services";
import { FloatingButtons } from "@/components/FloatingButtons";
import { ServicesTable } from "@/components/ServicesTable";
import { CustomPagination } from "@/components/CustomPagination";
import { usePaginationStore } from "@/stores/pagination-store";

// Server function to load services
const getServices = createServerFn({
  method: "GET",
}).handler(async () => {
  return await importServices();
});

// Type definitions
type LanguageCode = "en" | "es";

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
}

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
  };
};

// Normalize string helper
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      lang: (search.lang as string) || "en",
    };
  },
  loader: async () => await getServices(),
  component: Home,
});

function Home() {
  const services = Route.useLoaderData();
  const { lang } = useSearch({ from: "/" });
  const currentLang = (lang || "en") as LanguageCode;
  const t = getTranslations(currentLang);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter services based on search query
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

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / itemsPerPage),
  );
  const currentPageClamped = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (currentPageClamped - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPageClamped > 1) {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (e.key === "ArrowRight" && currentPageClamped < totalPages) {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentPageClamped, totalPages]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <FloatingButtons currentLang={currentLang} />

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

      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t.noResults}
          </div>
        ) : (
          <ServicesTable
            services={paginatedServices}
            translations={t}
            currentLang={currentLang}
          />
        )}
      </div>

      {totalPages > 1 && (
        <CustomPagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          translations={{ previous: t.previous, next: t.next }}
        />
      )}
    </div>
  );
}
