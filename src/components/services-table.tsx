import type { ServiceMapping } from "@/data/services";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        className="text-primary hover:underline hover:text-primary/80 transition-colors"
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
    cn(baseClasses, wrapText && "whitespace-normal break-words");
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.categoryColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.awsColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.azureColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.gcpColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.oracleColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.cloudflareColumn}
            </TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              {translations.descriptionColumn}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service, index) => (
            <TableRow
              key={index}
              className="border-b border-border hover:bg-accent/50 transition-colors"
            >
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm font-medium text-muted-foreground",
                )}
              >
                {service.categoryName[currentLang]}
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm text-foreground font-medium",
                )}
              >
                <ServiceLink name={service.aws} url={service.awsUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm text-foreground font-medium",
                )}
              >
                <ServiceLink name={service.azure} url={service.azureUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm text-foreground font-medium",
                )}
              >
                <ServiceLink name={service.gcp} url={service.gcpUrl} />
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal wrap-break-word" : "",
                )}
              >
                <ServiceLink name={service.oracle} url={service.oracleUrl} />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm text-foreground font-medium",
                )}
              >
                <ServiceLink
                  name={service.cloudflare}
                  url={service.cloudflareUrl}
                />
              </TableCell>
              <TableCell
                className={getCellClasses(
                  "px-6 py-4 text-sm text-foreground font-medium",
                )}
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
