/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/global.css";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/hooks/use-theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
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
        content:
          "Compare AWS, Azure, GCP, Oracle Cloud and Cloudflare services equivalents",
      },
      {
        title: "Hyperscaler Services",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var t=localStorage.getItem("theme")||"system",e="dark"===t||"system"===t&&window.matchMedia("(prefers-color-scheme: dark)").matches,a=document.documentElement;e?(a.classList.add("dark"),a.style.colorScheme="dark"):(a.classList.remove("dark"),a.style.colorScheme="light")}catch(t){var e=window.matchMedia("(prefers-color-scheme: dark)").matches,a=document.documentElement;e?(a.classList.add("dark"),a.style.colorScheme="dark"):a.style.colorScheme="light"}}();`,
          }}
        />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col transition-colors duration-200 font-sans">
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
