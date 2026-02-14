import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized.
 *
 * @returns Boolean indicating if the screen width is below the mobile breakpoint
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const updateMobileState = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile((prev) => (prev !== newIsMobile ? newIsMobile : prev));
    };

    updateMobileState();

    if (mql.addEventListener) {
      mql.addEventListener("change", updateMobileState);
    } else if (mql.addListener) {
      mql.addListener(updateMobileState);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", updateMobileState);
      } else if (mql.removeListener) {
        mql.removeListener(updateMobileState);
      }
    };
  }, []);

  return isMobile;
}
