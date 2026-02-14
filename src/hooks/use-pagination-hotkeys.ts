import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback } from "react";

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
  /**
   * Navigates to the previous page if not on the first page.
   */
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  /**
   * Navigates to the next page if not on the last page.
   */
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Register ArrowLeft for previous page navigation
  useHotkey("ArrowLeft", handlePreviousPage, {
    preventDefault: true,
  });

  // Register ArrowRight for next page navigation
  useHotkey("ArrowRight", handleNextPage, {
    preventDefault: true,
  });
};
