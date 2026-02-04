import { useState, useEffect, useCallback } from "react";

/**
 * Interface representing the pagination state.
 */
interface PaginationState {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items displayed per page */
  itemsPerPage: number;
}

const initialState: PaginationState = {
  currentPage: 1,
  totalItems: 0,
  itemsPerPage: 20,
};

/**
 * Validates and sanitizes pagination state from unknown data.
 *
 * @param parsed - Unknown data to validate as pagination state
 * @returns Sanitized partial pagination state or null if invalid
 */
const validateNumber = (value: unknown, min: number, max?: number): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const sanitized = Math.floor(value);
  if (sanitized < min) {
    return null;
  }
  if (max !== undefined && sanitized > max) {
    return null;
  }
  return sanitized;
};

const sanitizePaginationState = (parsed: unknown): Partial<PaginationState> | null => {
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;
  const result: Partial<PaginationState> = {};

  if ("currentPage" in obj) {
    const validated = validateNumber(obj.currentPage, 1);
    if (validated === null) {
      return null;
    }
    result.currentPage = validated;
  }

  if ("totalItems" in obj) {
    const validated = validateNumber(obj.totalItems, 0);
    if (validated === null) {
      return null;
    }
    result.totalItems = validated;
  }

  if ("itemsPerPage" in obj) {
    const validated = validateNumber(obj.itemsPerPage, 1, 100);
    if (validated === null) {
      return null;
    }
    result.itemsPerPage = validated;
  }

  return result;
};

/**
 * Calculates the total number of pages based on total items and items per page.
 *
 * @param totalItems - Total number of items
 * @param itemsPerPage - Number of items per page
 * @returns Total number of pages (minimum 1)
 */
const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
};

/**
 * Hook for managing pagination state with localStorage persistence.
 *
 * @returns Pagination state and control functions
 */
export const usePaginationStore = () => {
  const [state, setState] = useState<PaginationState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hyperscaler-pagination");
        if (saved) {
          const parsed: unknown = JSON.parse(saved) as unknown;
          const sanitized = sanitizePaginationState(parsed);
          if (sanitized !== null && Object.keys(sanitized).length > 0) {
            return { ...initialState, ...sanitized };
          }
          localStorage.removeItem("hyperscaler-pagination");
        }
      } catch (error) {
        console.error("Failed to load pagination state:", error);
        try {
          localStorage.removeItem("hyperscaler-pagination");
        } catch {}
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hyperscaler-pagination", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save pagination state:", error);
      }
    }
  }, [state]);

  /**
   * Sets the current page, ensuring it's within valid bounds.
   *
   * @param page - The page number to set
   */
  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => {
      const totalPages = getTotalPages(prev.totalItems, prev.itemsPerPage);
      const validPage = Number.isFinite(page) && page > 0 ? Math.min(page, totalPages) : 1;
      return { ...prev, currentPage: validPage };
    });
  }, []);

  /**
   * Sets the total number of items and adjusts current page if needed.
   *
   * @param total - The total number of items
   */
  const setTotalItems = useCallback((total: number) => {
    setState((prev) => {
      const validTotal = Number.isFinite(total) && total >= 0 ? total : 0;
      const totalPages = getTotalPages(validTotal, prev.itemsPerPage);
      const adjustedPage = Math.min(prev.currentPage, totalPages);
      return { ...prev, totalItems: validTotal, currentPage: adjustedPage };
    });
  }, []);

  /**
   * Navigates to the next page if available.
   */
  const nextPage = useCallback(() => {
    setState((prev) => {
      const totalPages = getTotalPages(prev.totalItems, prev.itemsPerPage);
      return {
        ...prev,
        currentPage: Math.min(prev.currentPage + 1, totalPages),
      };
    });
  }, []);

  /**
   * Navigates to the previous page if available.
   */
  const previousPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  }, []);

  /**
   * Navigates to a specific page number.
   *
   * @param page - The page number to navigate to
   */
  const goToPage = useCallback((page: number) => {
    setState((prev) => {
      const totalPages = getTotalPages(prev.totalItems, prev.itemsPerPage);
      return { ...prev, currentPage: Math.max(1, Math.min(page, totalPages)) };
    });
  }, []);

  /**
   * Resets pagination to initial state.
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    currentPage: state.currentPage,
    totalItems: state.totalItems,
    itemsPerPage: state.itemsPerPage,
    setCurrentPage,
    setTotalItems,
    nextPage,
    previousPage,
    goToPage,
    reset,
  };
};
