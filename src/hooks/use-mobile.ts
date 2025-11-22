import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Check if window and matchMedia API are available
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setIsMobile(false);
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Feature-detect listener API (newer browsers use addEventListener, older use addListener)
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
    } else if (mql.addListener) {
      // Legacy support for older browsers
      mql.addListener(onChange);
    }

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange);
      } else if (mql.removeListener) {
        // Legacy support for older browsers
        mql.removeListener(onChange);
      }
    };
  }, []);

  return !!isMobile;
}
