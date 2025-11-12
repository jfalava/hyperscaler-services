/**
 * Type definitions for cloud service comparison data.
 *
 * These types define the structure of service data loaded from
 * /public/services.json. The JSON file can be replaced with an
 * API endpoint to fetch data from a database in the future.
 */

/**
 * Text content available in multiple languages.
 */
export interface ServiceTranslations {
  en: string;
  es: string;
}

/**
 * Represents a mapping between equivalent AWS and Azure services.
 *
 * Each service includes category information, service names from both
 * providers, and localized descriptions to help users understand
 * the purpose and equivalence of the services.
 */
export interface ServiceMapping {
  category: string;
  categoryName: ServiceTranslations;
  aws: string;
  azure: string;
  description: ServiceTranslations;
}

/**
 * Fetch cloud service mappings from JSON file or API.
 *
 * Currently loads data from /public/services.json. This function
 * can be modified to fetch from a database API endpoint in the future
 * without changing the consuming code.
 *
 * @param baseUrl - Base URL for fetching (e.g., Astro.url.origin)
 * @returns Promise resolving to array of service mappings
 *
 * @example
 * const services = await fetchServices(Astro.url.origin);
 * console.log(services.find(s => s.aws === 'EC2'));
 */
export async function fetchServices(baseUrl: string): Promise<ServiceMapping[]> {
  const response = await fetch(`${baseUrl}/services.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }
  return response.json();
}
