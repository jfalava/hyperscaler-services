import * as fs from 'node:fs'
import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useEffect, useMemo } from 'react'
import type { ServiceMapping } from '@/data/services'

// Server function to load services
const getServices = createServerFn({
  method: 'GET',
}).handler(async () => {
  const servicesPath = './public/services.json'
  const data = await fs.promises.readFile(servicesPath, 'utf-8')
  return JSON.parse(data) as ServiceMapping[]
})

// Type definitions
type LanguageCode = 'en' | 'es'

interface PageTranslations {
  title: string
  subtitle: string
  searchPlaceholder: string
  awsColumn: string
  azureColumn: string
  gcpColumn: string
  oracleColumn: string
  cloudflareColumn: string
  categoryColumn: string
  descriptionColumn: string
  noResults: string
  showing: string
  of: string
  services: string
  previous: string
  next: string
}

const getTranslations = (currentLang: string): PageTranslations => {
  return {
    title: currentLang === 'es' ? 'Servicios de Hyperscalers' : 'Hyperscaler Services',
    subtitle:
      currentLang === 'es'
        ? 'Compara servicios equivalentes entre AWS, Azure, Google Cloud, Oracle Cloud y Cloudflare'
        : 'Compare equivalent services between AWS, Azure, Google Cloud, Oracle Cloud, and Cloudflare',
    searchPlaceholder: currentLang === 'es' ? 'Buscar servicios...' : 'Search services...',
    awsColumn: 'AWS',
    azureColumn: 'Azure',
    gcpColumn: 'GCP',
    oracleColumn: 'Oracle',
    cloudflareColumn: 'Cloudflare',
    categoryColumn: currentLang === 'es' ? 'Categoría' : 'Category',
    descriptionColumn: currentLang === 'es' ? 'Descripción' : 'Description',
    noResults: currentLang === 'es' ? 'No se encontraron servicios' : 'No services found',
    showing: currentLang === 'es' ? 'Mostrando' : 'Showing',
    of: currentLang === 'es' ? 'de' : 'of',
    services: currentLang === 'es' ? 'servicios' : 'services',
    previous: currentLang === 'es' ? 'Anterior' : 'Previous',
    next: currentLang === 'es' ? 'Siguiente' : 'Next',
  }
}

// Normalize string helper
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      lang: (search.lang as string) || 'en',
    }
  },
  loader: async () => await getServices(),
})

function Home() {
  const services = Route.useLoaderData()
  const { lang } = useSearch({ from: '/' })
  const currentLang = (lang || 'en') as LanguageCode
  const t = getTranslations(currentLang)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services

    const searchNormalized = normalizeString(searchQuery.trim())

    return services.filter((service) => {
      const category = normalizeString(service.categoryName[currentLang])
      const aws = normalizeString(service.aws)
      const azure = normalizeString(service.azure)
      const gcp = normalizeString(service.gcp)
      const oracle = normalizeString(service.oracle)
      const cloudflare = normalizeString(service.cloudflare)
      const description = normalizeString(service.description[currentLang])

      return (
        category.includes(searchNormalized) ||
        aws.includes(searchNormalized) ||
        azure.includes(searchNormalized) ||
        gcp.includes(searchNormalized) ||
        oracle.includes(searchNormalized) ||
        cloudflare.includes(searchNormalized) ||
        description.includes(searchNormalized)
      )
    })
  }, [services, searchQuery, currentLang])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage))
  const currentPageClamped = Math.max(1, Math.min(currentPage, totalPages))
  const startIndex = (currentPageClamped - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, endIndex)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPageClamped > 1) {
        e.preventDefault()
        setCurrentPage((prev) => Math.max(1, prev - 1))
      } else if (e.key === 'ArrowRight' && currentPageClamped < totalPages) {
        e.preventDefault()
        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentPageClamped, totalPages])

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <FloatingButtons currentLang={currentLang} />

      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mt-1 px-4 py-2 pl-12 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </header>

      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.categoryColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.awsColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.azureColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.gcpColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.oracleColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.cloudflareColumn}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t.descriptionColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((service, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                    {service.categoryName[currentLang]}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {service.aws}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {service.azure}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {service.gcp}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {service.oracle}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {service.cloudflare}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {service.description[currentLang]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredServices.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">{t.noResults}</div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPageClamped}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          translations={{ previous: t.previous, next: t.next }}
        />
      )}
    </div>
  )
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  translations,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  translations: { previous: string; next: string }
}) {
  const maxButtons = 5
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + maxButtons - 1)

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1)
  }

  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 cursor-pointer rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={translations.previous}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex gap-1">
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                pageNum === currentPage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
              }`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 cursor-pointer rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={translations.next}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// FloatingButtons Component
function FloatingButtons({ currentLang }: { currentLang: LanguageCode }) {
  return (
    <div className="fixed top-3 right-3 sm:right-6 md:right-8 lg:right-[max(1rem,calc((100vw-80rem)/2+2rem))] z-50 flex flex-col items-end gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <ThemeToggle />
        <div className="inline-flex items-center rounded-full bg-secondary/95 px-2 py-0.5 text-[10px] shadow-sm">
          <a
            href="/?lang=en"
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              currentLang === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'text-secondary-foreground'
            }`}
          >
            EN
          </a>
          <a
            href="/?lang=es"
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              currentLang === 'es'
                ? 'bg-primary text-primary-foreground'
                : 'text-secondary-foreground'
            }`}
          >
            ES
          </a>
        </div>
      </div>
    </div>
  )
}

// ThemeToggle Component
type ThemeMode = 'light' | 'dark' | 'system'

function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as ThemeMode) || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const applyTheme = (newTheme: ThemeMode) => {
    if (
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    setIsMenuOpen(false)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" />
          </svg>
        )
      case 'dark':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z" />
          </svg>
        )
      case 'system':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
          </svg>
        )
    }
  }

  return (
    <div className="relative theme-toggle">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-popover text-popover-foreground hover:bg-accent transition-colors border border-border"
        aria-label="Toggle theme"
        aria-expanded={isMenuOpen}
      >
        {getThemeIcon()}
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg bg-popover shadow-lg border border-border z-10"
          role="menu"
        >
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent rounded-t-lg transition-colors"
            role="menuitem"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" />
            </svg>
            <span>Light</span>
            {theme === 'light' && (
              <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
            role="menuitem"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z" />
            </svg>
            <span>Dark</span>
            {theme === 'dark' && (
              <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent rounded-b-lg transition-colors"
            role="menuitem"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
            </svg>
            <span>System</span>
            {theme === 'system' && (
              <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
