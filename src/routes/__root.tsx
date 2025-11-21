/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import '@/styles/global.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content: 'Compare AWS, Azure, GCP, Oracle Cloud and Cloudflare services equivalents',
      },
      {
        title: 'Hyperscaler Services',
      },
    ],
    scripts: [
      {
        children: `
          (function() {
            const theme = localStorage.getItem('theme') || 'system';
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })();
        `,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col transition-colors duration-200">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="text-center py-8 text-muted-foreground text-sm mt-auto border-t border-border">
      <div className="container mx-auto px-4">
        <p>
          Hyperscaler Services by{' '}
          <a
            href="https://github.com/jfalava"
            className="text-foreground hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            JFA
          </a>{' '}
          | {currentYear}
        </p>
        <p className="mt-2">
          <a
            href="https://github.com/jfalava/hyperscaler-services"
            className="text-foreground hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}
