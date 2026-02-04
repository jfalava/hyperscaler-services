/* eslint-disable react/no-danger -- Theme script needed before hydration to prevent flash */
/// <reference types="vite/client" />
import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import "@/styles/global.css";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/hooks/use-theme";

/**
 * Query client instance with default configuration.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content: "Compare AWS, Azure, GCP, Oracle Cloud and Cloudflare services equivalents",
      },
      {
        title: "Hyperscaler Services",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404 - Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go Home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

/**
 * Root component wrapper for the application.
 *
 * @returns Root component with document wrapper
 */
function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

/**
 * Document wrapper component with theme script and providers.
 * Includes theme initialization script to prevent flash of incorrect theme.
 *
 * @param props - Component props with children
 * @returns HTML document structure with providers
 */
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var t=localStorage.getItem("theme")||"system",e="dark"===t||"system"===t&&window.matchMedia("(prefers-color-scheme: dark)").matches,a=document.documentElement;e?(a.classList.add("dark"),a.style.colorScheme="dark"):(a.classList.remove("dark"),a.style.colorScheme="light")}catch(t){var e=window.matchMedia("(prefers-color-scheme: dark)").matches,a=document.documentElement;e?(a.classList.add("dark"),a.style.colorScheme="dark"):a.style.colorScheme="light"}}();`,
          }}
        />
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-200">
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <main className="flex-1">{children}</main>
            <Footer />
          </QueryClientProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
