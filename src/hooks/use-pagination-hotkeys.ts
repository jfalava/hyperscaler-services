import { useEffect } from "react";

/**
 * Props for the usePaginationHotkeys hook.
 */
interface UsePaginationHotkeysProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback to navigate to a specific page */
  onPageChange: (page: number) => void;
}

/**
 * Custom hook for handling pagination keyboard shortcuts.
 * Uses TanStack Hotkeys for declarative keyboard navigation.
 *
 * @param props - Configuration for pagination hotkeys
 */
export const usePaginationHotkeys = ({
  currentPage,
  totalPages,
  onPageChange,
}: UsePaginationHotkeysProps) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && currentPage > 1) {
        event.preventDefault();
        onPageChange(currentPage - 1);
      }

      if (event.key === "ArrowRight" && currentPage < totalPages) {
        event.preventDefault();
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, totalPages, onPageChange]);
};
