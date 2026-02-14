import type { ServiceMapping } from "@/data/services";

interface MobileServicesListTranslations {
  awsColumn: string;
  azureColumn: string;
  gcpColumn: string;
  oracleColumn: string;
  cloudflareColumn: string;
}

interface MobileServicesListProps {
  services: ServiceMapping[];
  currentLang: "en" | "es";
  translations: MobileServicesListTranslations;
}

interface ProviderMapping {
  key: string;
  label: string;
  value: string;
  url?: string;
  iconPath: string;
}

function ProviderValue({ value, url }: { value: string; url?: string }) {
  if (!url) {
    return <span className="text-sm font-medium text-foreground">{value}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
    >
      {value}
    </a>
  );
}

/**
 * Mobile-first list rendering for service mappings.
 * Presents each service as a card with vertically stacked provider mappings.
 *
 * @param props - Component props
 * @returns Service cards optimized for narrow viewports
 */
export function MobileServicesList({
  services,
  currentLang,
  translations,
}: MobileServicesListProps) {
  return (
    <div className="space-y-3">
      {services.map((service, index) => {
        const providerMappings: ProviderMapping[] = [
          {
            key: "aws",
            label: translations.awsColumn,
            value: service.aws,
            url: service.awsUrl,
            iconPath: "/icons/aws.svg",
          },
          {
            key: "azure",
            label: translations.azureColumn,
            value: service.azure,
            url: service.azureUrl,
            iconPath: "/icons/azure.svg",
          },
          {
            key: "gcp",
            label: translations.gcpColumn,
            value: service.gcp,
            url: service.gcpUrl,
            iconPath: "/icons/gcp.svg",
          },
          {
            key: "oracle",
            label: translations.oracleColumn,
            value: service.oracle,
            url: service.oracleUrl,
            iconPath: "/icons/ocl.svg",
          },
          {
            key: "cloudflare",
            label: translations.cloudflareColumn,
            value: service.cloudflare,
            url: service.cloudflareUrl,
            iconPath: "/icons/cloudflare.svg",
          },
        ];

        return (
          <article key={index} className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {service.categoryName[currentLang]}
              </span>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{service.description[currentLang]}</p>
            <div className="space-y-1.5">
              {providerMappings.map((provider) => (
                <div
                  key={provider.key}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={provider.iconPath}
                      alt={`${provider.label} logo`}
                      className="h-3.5 w-3.5 shrink-0 object-contain"
                      loading="lazy"
                    />
                    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {provider.label}
                    </span>
                  </div>
                  <div className="min-w-0 truncate text-right">
                    <ProviderValue value={provider.value} url={provider.url} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
