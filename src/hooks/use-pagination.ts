import { useState, useEffect, useCallback } from "react";

interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

const initialState: PaginationState = {
  currentPage: 1,
  totalItems: 0,
  itemsPerPage: 20,
};

const sanitizePaginationState = (
  parsed: unknown,
): Partial<PaginationState> | null => {
  if (typeof parsed !== "object" || parsed === null) return null;

  const obj = parsed as Record<string, unknown>;
  const result: Partial<PaginationState> = {};

  // Validate and sanitize currentPage if present
  if ("currentPage" in obj) {
    if (
      typeof obj.currentPage !== "number" ||
      !Number.isFinite(obj.currentPage)
    ) {
      return null;
    }
    const sanitized = Math.floor(obj.currentPage);
    if (sanitized < 1) return null;
    result.currentPage = sanitized;
  }

  // Validate and sanitize totalItems if present
  if ("totalItems" in obj) {
    if (
      typeof obj.totalItems !== "number" ||
      !Number.isFinite(obj.totalItems)
    ) {
      return null;
    }
    const sanitized = Math.floor(obj.totalItems);
    if (sanitized < 0) return null;
    result.totalItems = sanitized;
  }

  // Validate and sanitize itemsPerPage if present
  if ("itemsPerPage" in obj) {
    if (
      typeof obj.itemsPerPage !== "number" ||
      !Number.isFinite(obj.itemsPerPage)
    ) {
      return null;
    }
    const sanitized = Math.floor(obj.itemsPerPage);
    if (sanitized < 1 || sanitized > 100) return null;
    result.itemsPerPage = sanitized;
  }

  return result;
};

const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
};

export const usePaginationStore = () => {
  const [state, setState] = useState<PaginationState>(() => {
    // Load from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hyperscaler-pagination");
        if (saved) {
          const parsed = JSON.parse(saved);
          const sanitized = sanitizePaginationState(parsed);
          // Check for valid non-empty object
          if (sanitized !== null && Object.keys(sanitized).length > 0) {
            return { ...initialState, ...sanitized };
          }
          // Invalid or empty state, remove it
          localStorage.removeItem("hyperscaler-pagination");
        }
      } catch (error) {
        console.error("Failed to load pagination state:", error);
        // Remove corrupt data
        try {
          localStorage.removeItem("hyperscaler-pagination");
        } catch {
          // Ignore if we can't remove
        }
      }
    }
    return initialState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hyperscaler-pagination", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save pagination state:", error);
      }
    }
  }, [state]);

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setState((prev) => ({ ...prev, totalItems: total }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => {
      const totalPages = getTotalPages(prev.totalItems, prev.itemsPerPage);
      return {
        ...prev,
        currentPage: Math.min(prev.currentPage + 1, totalPages),
      };
    });
  }, []);

  const previousPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setState((prev) => {
      const totalPages = getTotalPages(prev.totalItems, prev.itemsPerPage);
      return { ...prev, currentPage: Math.max(1, Math.min(page, totalPages)) };
    });
  }, []);

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
