import { paginationState } from "@/stores/pagination-state";

/**
 * HTMLElement with dataset properties for service rows.
 */
export interface HTMLElementWithDataset extends HTMLElement {
  dataset: {
    category: string;
    aws: string;
    azure: string;
    description: string;
    matches?: string;
  };
}

/**
 * Pagination text translations.
 */
export interface PaginationTranslations {
  showing: string;
  of: string;
  services: string;
}

/**
 * Service manager with pagination using custom state.
 */
export class ServiceManager {
  private readonly itemsPerPage = 20;
  private filteredRows: HTMLElementWithDataset[] = [];

  /**
   * Creates a new ServiceManager instance.
   * @param onFilterChange - Optional callback for filter changes
   */
  constructor(private onFilterChange?: (filteredCount: number) => void) {}

  /**
   * Gets all visible (filtered) service rows.
   * @returns Array of filtered service row elements
   */
  getFilteredRows(): HTMLElementWithDataset[] {
    const rows = document.querySelectorAll(".service-row");
    return Array.from(rows).filter((row): row is HTMLElementWithDataset => {
      const element = row as HTMLElementWithDataset;
      return element.dataset.matches !== "false";
    });
  }

  /**
   * Displays services for the specified page.
   * @param page - Page number to display
   */
  showPage(page: number): void {
    this.filteredRows = this.getFilteredRows();
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredRows.length / this.itemsPerPage),
    );

    const currentPage = Math.max(1, Math.min(page, totalPages));

    paginationState.setCurrentPage(currentPage);
    paginationState.setTotalItems(this.filteredRows.length);

    this.displayRows(currentPage);
  }

  /**
   * Displays rows for a specific page without updating state.
   * @param currentPage - Page number to display
   */
  private displayRows(currentPage: number): void {
    document.querySelectorAll(".service-row").forEach((row) => {
      (row as HTMLElement).style.display = "none";
    });

    const start = (currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.filteredRows.forEach((row, index) => {
      if (index >= start && index < end) {
        row.style.display = "";
      }
    });
  }

  /**
   * Normalizes string by removing accents and converting to lowercase.
   * @param str - String to normalize
   * @returns Normalized string
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Filters service table rows based on search query.
   * @param search - Search query string
   */
  filterServices(search: string): void {
    const rows = document.querySelectorAll(".service-row");
    const noResults = document.getElementById("no-results");
    const searchNormalized = this.normalizeString(search.trim());

    rows.forEach((row) => {
      const element = row as HTMLElementWithDataset;
      const category = this.normalizeString(element.dataset.category || "");
      const aws = this.normalizeString(element.dataset.aws || "");
      const azure = this.normalizeString(element.dataset.azure || "");
      const description = this.normalizeString(
        element.dataset.description || "",
      );

      const matches =
        searchNormalized === "" ||
        category.includes(searchNormalized) ||
        aws.includes(searchNormalized) ||
        azure.includes(searchNormalized) ||
        description.includes(searchNormalized);

      if (matches) {
        delete element.dataset.matches;
      } else {
        element.dataset.matches = "false";
      }
    });

    this.filteredRows = this.getFilteredRows();
    const hasResults = this.filteredRows.length > 0;

    if (noResults) {
      noResults.style.display = hasResults ? "none" : "block";
    }

    if (this.onFilterChange) {
      this.onFilterChange(this.filteredRows.length);
    }

    this.showPage(1);
  }

  /**
   * Initializes service management and pagination functionality.
   */
  initialize(): void {
    const searchInput = document.getElementById(
      "search",
    ) as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target) {
          this.filterServices(target.value);
        }
      });
    }

    (window as any).onPageChangeCallback = (page: number) => {
      this.displayRows(page);
    };

    paginationState.subscribe((state) => {
      const currentPage = paginationState.getCurrentPage();
      if (currentPage !== state.currentPage) {
        this.displayRows(state.currentPage);
      }
    });

    this.showPage(1);
  }
}
