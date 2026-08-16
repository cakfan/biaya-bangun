import type { BuildingCostEstimate } from "@/lib/calculation/types";
import { formatRupiah, formatVolume } from "@/lib/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function EstimateResult({ estimate }: { estimate: BuildingCostEstimate }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total Estimasi</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatRupiah(estimate.totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Biaya per m²</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatRupiah(estimate.costPerSquareMeter)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total Bahan</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatRupiah(estimate.totalMaterialCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total Upah</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatRupiah(estimate.totalLaborCost)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-4">
            <p className="text-lg font-semibold tracking-tight">Rincian per Komponen</p>
            <p className="text-sm text-muted-foreground">
              Luas bangunan {formatVolume(estimate.buildingArea)} m² · overhead & profit{" "}
              {(estimate.overheadProfitRate * 100).toFixed(0)}% · total upah + bahan{" "}
              {formatRupiah(estimate.overheadProfitCost)}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Komponen</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Bahan</TableHead>
                <TableHead className="text-right">Upah</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimate.components.map((component) => (
                <ComponentRow key={component.componentSlug} component={component} />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatRupiah(estimate.totalMaterialCost)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatRupiah(estimate.totalLaborCost)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatRupiah(estimate.subtotalCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">
                  Overhead & profit ({(estimate.overheadProfitRate * 100).toFixed(0)}%)
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatRupiah(estimate.overheadProfitCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-base font-semibold">
                  Total Estimasi
                </TableCell>
                <TableCell className="text-base font-semibold text-right">
                  {formatRupiah(estimate.totalCost)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentRow({
  component,
}: {
  component: BuildingCostEstimate["components"][number];
}) {
  return (
    <details className="contents">
      <TableRow className="align-top">
        <TableCell>
          <summary className="cursor-pointer list-none text-sm font-medium hover:underline">
            {component.componentName}
            <span className="text-muted-foreground"> — klik untuk rincian</span>
          </summary>
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatVolume(component.volume)} {component.unit}
        </TableCell>
        <TableCell className="text-right tabular-nums">{formatRupiah(component.materialCost)}</TableCell>
        <TableCell className="text-right tabular-nums">{formatRupiah(component.laborCost)}</TableCell>
        <TableCell className="text-right tabular-nums font-medium">{formatRupiah(component.totalCost)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} className="bg-muted/40 pb-4">
          <ComponentBreakdown
            materialLines={component.materialBreakdown}
            laborLines={component.laborBreakdown}
          />
        </TableCell>
      </TableRow>
    </details>
  );
}

function ComponentBreakdown({
  materialLines,
  laborLines,
}: {
  materialLines: BuildingCostEstimate["components"][number]["materialBreakdown"];
  laborLines: BuildingCostEstimate["components"][number]["laborBreakdown"];
}) {
  const hasMaterial = materialLines.length > 0;
  const hasLabor = laborLines.length > 0;

  if (!hasMaterial && !hasLabor) {
    return null;
  }

  return (
    <div className="grid gap-4 pl-4 sm:grid-cols-2">
      {hasMaterial && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bahan
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {materialLines.map((line) => (
              <li key={line.materialName} className="flex items-baseline justify-between gap-4">
                <span>
                  {line.materialName}{" "}
                  <span className="text-muted-foreground">
                    {formatVolume(line.coefficient)} {line.unit} × {formatRupiah(line.price)}
                  </span>
                </span>
                <span className="tabular-nums">{formatRupiah(line.cost)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasLabor && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upah
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {laborLines.map((line) => (
              <li key={line.laborTypeName} className="flex items-baseline justify-between gap-4">
                <span>
                  {line.laborTypeName}{" "}
                  <span className="text-muted-foreground">
                    {formatVolume(line.coefficient)} OH × {formatRupiah(line.dailyRate)}
                  </span>
                </span>
                <span className="tabular-nums">{formatRupiah(line.cost)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
