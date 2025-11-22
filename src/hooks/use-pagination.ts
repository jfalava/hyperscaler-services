import { useState, useEffect } from "react";

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

const isValidPaginationState = (parsed: unknown): parsed is Partial<PaginationState> => {
  if (typeof parsed !== "object" || parsed === null) return false;

  const obj = parsed as Record<string, unknown>;

  // Validate currentPage if present
  if ("currentPage" in obj && (typeof obj.currentPage !== "number" || obj.currentPage < 1)) {
    return false;
  }

  // Validate totalItems if present
  if ("totalItems" in obj && (typeof obj.totalItems !== "number" || obj.totalItems < 0)) {
    return false;
  }

  // Validate itemsPerPage if present
  if ("itemsPerPage" in obj && (typeof obj.itemsPerPage !== "number" || obj.itemsPerPage < 1 || obj.itemsPerPage > 100)) {
    return false;
  }

  return true;
};

export const usePaginationStore = () => {
  const [state, setState] = useState<PaginationState>(() => {
    // Load from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hyperscaler-pagination");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (isValidPaginationState(parsed)) {
            return { ...initialState, ...parsed };
          }
          // Invalid state, remove it
          localStorage.removeItem("hyperscaler-pagination");
        }
      } catch (error) {
        console.error("Failed to load pagination state:", error);
        // Remove corrupt data
        try {
          localStorage.removeItem("hyperscaler-pagination");
        } catch (e) {
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

  const setCurrentPage = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const setTotalItems = (total: number) => {
    setState((prev) => ({ ...prev, totalItems: total }));
  };

  const nextPage = () => {
    setState((prev) => {
      const totalPages = Math.max(
        1,
        Math.ceil(prev.totalItems / prev.itemsPerPage),
      );
      return {
        ...prev,
        currentPage: Math.min(prev.currentPage + 1, totalPages),
      };
    });
  };

  const previousPage = () => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  };

  const goToPage = (page: number) => {
    const totalPages = Math.max(
      1,
      Math.ceil(state.totalItems / state.itemsPerPage),
    );
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const reset = () => {
    setState(initialState);
  };

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
