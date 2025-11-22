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

export const usePaginationStore = () => {
  const [state, setState] = useState<PaginationState>(() => {
    // Load from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hyperscaler-pagination");
        if (saved) {
          return { ...initialState, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.error("Failed to load pagination state:", error);
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
