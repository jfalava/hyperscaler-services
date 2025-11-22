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
  awsUrl?: string;
  azure: string;
  azureUrl?: string;
  gcp: string;
  gcpUrl?: string;
  oracle: string;
  oracleUrl?: string;
  cloudflare: string;
  cloudflareUrl?: string;
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
  // Import all JSON files statically to avoid bundling issues
  const [
    accountManagement,
    aiServices,
    bigData,
    businessIntelligence,
    communication,
    compute,
    containers,
    dataGovernance,
    dataIntegration,
    dataLake,
    dataMigration,
    dataWarehouse,
    database,
    generativeAi,
    governance,
    infrastructure,
    iot,
    machineLearning,
    messaging,
    monitoring,
    networking,
    security,
    storage,
  ] = await Promise.all([
    import("./account-management.json"),
    import("./ai-services.json"),
    import("./big-data.json"),
    import("./business-intelligence.json"),
    import("./communication.json"),
    import("./compute.json"),
    import("./containers.json"),
    import("./data-governance.json"),
    import("./data-integration.json"),
    import("./data-lake.json"),
    import("./data-migration.json"),
    import("./data-warehouse.json"),
    import("./database.json"),
    import("./generative-ai.json"),
    import("./governance.json"),
    import("./infrastructure.json"),
    import("./iot.json"),
    import("./machine-learning.json"),
    import("./messaging.json"),
    import("./monitoring.json"),
    import("./networking.json"),
    import("./security.json"),
    import("./storage.json"),
  ]);

  const allServices: ServiceMapping[] = [
    ...accountManagement.default,
    ...aiServices.default,
    ...bigData.default,
    ...businessIntelligence.default,
    ...communication.default,
    ...compute.default,
    ...containers.default,
    ...dataGovernance.default,
    ...dataIntegration.default,
    ...dataLake.default,
    ...dataMigration.default,
    ...dataWarehouse.default,
    ...database.default,
    ...generativeAi.default,
    ...governance.default,
    ...infrastructure.default,
    ...iot.default,
    ...machineLearning.default,
    ...messaging.default,
    ...monitoring.default,
    ...networking.default,
    ...security.default,
    ...storage.default,
  ];

  return allServices;
}
