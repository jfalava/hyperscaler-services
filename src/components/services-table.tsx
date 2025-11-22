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

interface ServicesTableProps {
  services: ServiceMapping[];
  translations: {
    categoryColumn: string;
    awsColumn: string;
    azureColumn: string;
    gcpColumn: string;
    oracleColumn: string;
    cloudflareColumn: string;
    descriptionColumn: string;
  };
  currentLang: "en" | "es";
  wrapText?: boolean;
}

/**
 * Services table component using shadcn Table.
 */
export function ServicesTable({
  services,
  translations,
  currentLang,
  wrapText = false,
}: ServicesTableProps) {
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
                className={cn(
                  "px-6 py-4 text-sm font-medium text-muted-foreground",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.categoryName[currentLang]}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.aws}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.azure}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.gcp}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.oracle}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-foreground font-medium",
                  wrapText ? "whitespace-normal break-words" : ""
                )}
              >
                {service.cloudflare}
              </TableCell>
              <TableCell
                className={cn(
                  "px-6 py-4 text-sm text-muted-foreground",
                  wrapText ? "whitespace-normal break-words" : ""
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
