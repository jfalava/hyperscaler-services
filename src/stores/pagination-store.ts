import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Pagination state interface.
 */
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Pagination state actions interface.
 */
interface PaginationActions {
  setCurrentPage: (page: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

/**
 * Pagination state store using Zustand with persistence.
 */
export const usePaginationStore = create<PaginationState & PaginationActions>()(
  persist(
    (set, get) => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,

      setCurrentPage: (page) => {
        const newPage = Math.max(1, page);
        set({ currentPage: newPage });
      },

      setTotalItems: (total) => {
        const totalPages = Math.max(1, Math.ceil(total / 20));
        set({
          totalItems: total,
          totalPages,
        });
      },

      nextPage: () => {
        const { currentPage, totalPages } = get();
        if (currentPage < totalPages) {
          set({ currentPage: currentPage + 1 });
        }
      },

      previousPage: () => {
        const { currentPage } = get();
        if (currentPage > 1) {
          set({ currentPage: currentPage - 1 });
        }
      },

      goToPage: (page) => {
        const { totalPages } = get();
        const newPage = Math.max(1, Math.min(page, totalPages));
        set({ currentPage: newPage });
      },

      reset: () => {
        set({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        });
      },
    }),
    {
      name: "pagination-storage",
      storage: createJSONStorage(() => localStorage, "pagination-storage"),
      version: 1,
    },
  ),
);
