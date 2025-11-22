/**
 * Type definitions for cloud service comparison data.
 *
 * These types define structure of service data loaded from
 * /src/data/services.json. The JSON file can be replaced with an
 * API endpoint to fetch data from a database in future.
 */

/**
 * Text content available in multiple languages.
 */
export interface ServiceTranslations {
  en: string;
  es: string;
}

/**
 * Represents a mapping between equivalent cloud services across providers.
 *
 * Each service includes category information, service names from all
 * providers, and localized descriptions to help users understand
 * purpose and equivalence of services.
 */
export interface ServiceMapping {
  category: string;
  categoryName: ServiceTranslations;
  aws: string;
  azure: string;
  gcp: string;
  oracle: string;
  cloudflare: string;
  description: ServiceTranslations;
}

/**
 * Fetch cloud service mappings from JSON file or API.
 *
 * Currently loads data from /public/services.json. This function
 * can be modified to fetch from a database API endpoint in future
 * without changing the consuming code.
 *
 * @param baseUrl - Base URL for fetching (e.g., Astro.url.origin)
 * @returns Promise resolving to array of service mappings
 *
 * @example
 * const services = await fetchServices(Astro.url.origin);
 * console.log(services.find(s => s.aws === 'EC2'));
 */
export async function fetchServices(
  baseUrl: string,
): Promise<ServiceMapping[]> {
  const response = await fetch(`${baseUrl}/services.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Import services data from separate JSON files per category.
 * This is used in the React/SSR context.
 */
export async function importServices(): Promise<ServiceMapping[]> {
  const categories = [
    "account-management",
    "ai-services",
    "big-data",
    "business-intelligence",
    "communication",
    "compute",
    "containers",
    "data-governance",
    "data-integration",
    "data-lake",
    "data-migration",
    "data-warehouse",
    "database",
    "generative-ai",
    "governance",
    "infrastructure",
    "iot",
    "machine-learning",
    "messaging",
    "monitoring",
    "networking",
    "security",
    "storage",
  ];

  const allServices: ServiceMapping[] = [];
  for (const category of categories) {
    const module = await import(`./${category}.json`);
    allServices.push(...module.default);
  }
  return allServices;
}
