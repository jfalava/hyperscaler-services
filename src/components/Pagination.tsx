import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paginationState } from "@/stores/pagination-state";

interface PaginationProps {
  translations: {
    previous: string;
    next: string;
  };
}

/**
 * Pagination component with navigation controls.
 */
export function Pagination({ translations }: PaginationProps) {
  const [state, setState] = useState({
    currentPage: paginationState.getCurrentPage(),
    totalPages: paginationState.getTotalPages(),
    totalItems: paginationState.getTotalItems(),
  });

  useEffect(() => {
    const unsubscribe = paginationState.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        paginationState.previousPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        paginationState.nextPage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (state.totalPages <= 1) {
    return null;
  }

  const maxButtons = 5;
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(state.totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginationState.previousPage()}
          disabled={state.currentPage === 1}
          aria-label={translations.previous}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-1">
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === state.currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => paginationState.goToPage(pageNum)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={pageNum === state.currentPage ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => paginationState.nextPage()}
          disabled={state.currentPage === state.totalPages}
          aria-label={translations.next}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
