import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceMapping } from "@/data/services";
import { cn } from "@/lib/utils";

/**
 * Props for the ServicesTable component.
 */
interface ServicesTableProps {
  /** Array of service mappings to display */
  services: ServiceMapping[];
  /** Translation strings for table headers */
  translations: {
    categoryColumn: string;
    awsColumn: string;
    azureColumn: string;
    gcpColumn: string;
    oracleColumn: string;
    cloudflareColumn: string;
    descriptionColumn: string;
  };
  /** Current language for displaying content */
  currentLang: "en" | "es";
  /** Whether to enable text wrapping in cells */
  wrapText?: boolean;
}

/**
 * Renders a service name as either a link (if URL provided) or plain text.
 *
 * @param props - Component props
 * @returns Link or span element containing the service name
 */
function ServiceLink({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary transition-colors hover:text-primary/80 hover:underline"
      >
        {name}
      </a>
    );
  }
  return <span>{name}</span>;
}

/**
 * Table component displaying cloud services comparison data.
 * Shows equivalent services across different cloud providers.
 *
 * @param props - Component props
 * @returns Formatted table with service comparison data
 */
export function ServicesTable({
  services,
  translations,
  currentLang,
  wrapText = false,
}: ServicesTableProps) {
  /**
   * Generates CSS classes for table cells based on wrap text setting.
   *
   * @param baseClasses - Base CSS classes to apply
   * @returns Combined CSS classes
   */
  const getCellClasses = (baseClasses: string) =>
    cn(baseClasses, wrapText && "break-words whitespace-normal");
  const providerColumns = [
    {
      key: "aws",
      label: translations.awsColumn,
      iconPath: "/icons/aws.svg",
    },
    {
      key: "azure",
      label: translations.azureColumn,
      iconPath: "/icons/azure.svg",
    },
    {
      key: "gcp",
      label: translations.gcpColumn,
      iconPath: "/icons/gcp.svg",
    },
    {
      key: "oracle",
      label: translations.oracleColumn,
      iconPath: "/icons/ocl.svg",
    },
    {
      key: "cloudflare",
      label: translations.cloudflareColumn,
      iconPath: "/icons/cloudflare.svg",
    },
  ] satisfies Array<{
    key: string;
    label: string;
    iconPath: string;
  }>;

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[980px]">
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[18%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-20 border-b border-border/80 bg-muted/80 px-4 py-3 text-left text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
              {translations.categoryColumn}
            </TableHead>
            {providerColumns.map((column) => (
              <TableHead
                key={column.key}
                className="sticky top-0 z-20 border-b border-border/80 bg-muted/80 px-4 py-3 text-left text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm"
              >
                <span className="inline-flex items-center rounded-md border border-border/80 bg-background/80 px-2 py-0.5 text-[11px] font-semibold tracking-normal text-foreground">
                  <img
                    src={column.iconPath}
                    alt={`${column.label} logo`}
                    className="mr-1.5 h-3.5 w-3.5 object-contain"
                    loading="lazy"
                  />
                  {column.label}
                </span>
              </TableHead>
            ))}
            <TableHead className="sticky top-0 z-20 border-b border-border/80 bg-muted/80 px-4 py-3 text-left text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
              {translations.descriptionColumn}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service, index) => (
            <TableRow
              key={index}
              className="border-b border-border/60 transition-colors odd:bg-background even:bg-muted/10 hover:bg-accent/35"
            >
              <TableCell
                className={getCellClasses(
                  "px-4 py-3 align-top text-xs font-medium tracking-wide text-muted-foreground uppercase",
                )}
              >
                {service.categoryName[currentLang]}
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-4 py-3 align-top text-sm font-medium text-foreground",
                )}
              >
                <ServiceLink name={service.aws} url={service.awsUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-4 py-3 align-top text-sm font-medium text-foreground",
                )}
              >
                <ServiceLink name={service.azure} url={service.azureUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-4 py-3 align-top text-sm font-medium text-foreground",
                )}
              >
                <ServiceLink name={service.gcp} url={service.gcpUrl} />
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 py-3 align-top text-sm font-medium text-foreground",
                  wrapText ? "break-words whitespace-normal" : "",
                )}
              >
                <ServiceLink name={service.oracle} url={service.oracleUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-4 py-3 align-top text-sm font-medium text-foreground",
                )}
              >
                <ServiceLink name={service.cloudflare} url={service.cloudflareUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses("px-4 py-3 align-top text-sm text-muted-foreground")}
              >
                {service.description[currentLang]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
