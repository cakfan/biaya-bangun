"use client";

import { useState } from "react";
import { Building2, ChevronDown, MapPin, Percent, Ruler } from "lucide-react";
import type { BuildingCostEstimate } from "@/lib/calculation/types";
import { formatRupiah, formatVolume } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type EstimateSummary = {
  buildingTypeName: string;
  city: string;
};

export function EstimateResult({
  estimate,
  summary,
}: {
  estimate: BuildingCostEstimate;
  summary: EstimateSummary;
}) {
  return (
    <section aria-label="Hasil estimasi" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="size-4" />
          {summary.buildingTypeName}
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Ruler className="size-4" />
          {formatVolume(estimate.buildingArea)} m²
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" />
          {summary.city}
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Percent className="size-4" />
          Overhead &amp; profit {(estimate.overheadProfitRate * 100).toFixed(0)}%
        </span>
      </div>

      <Card>
        <CardContent className="grid gap-8 lg:grid-cols-[minmax(16rem,auto)_1fr] lg:items-center">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">Total Estimasi</p>
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {formatRupiah(estimate.totalCost)}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {formatRupiah(estimate.costPerSquareMeter)} per m²
            </p>
          </div>

          <CostSplit estimate={estimate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rincian per Pekerjaan</CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(estimate.totalMaterialCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(estimate.totalLaborCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(estimate.subtotalCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">
                  Overhead &amp; profit ({(estimate.overheadProfitRate * 100).toFixed(0)}%)
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(estimate.overheadProfitCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-base font-semibold">
                  Total Estimasi
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(estimate.totalCost)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Estimasi bersifat indikatif dan dihitung dari koefisien AHSP serta harga bahan di{" "}
        {summary.city}. Biaya aktual dapat berbeda tergantung kondisi lapangan, kualitas material,
        dan kesepakatan dengan kontraktor.
      </p>
    </section>
  );
}

export function CostSplit({ estimate }: { estimate: BuildingCostEstimate }) {
  const total = estimate.totalCost;
  const segments = [
    { label: "Bahan", value: estimate.totalMaterialCost, className: "bg-foreground" },
    { label: "Upah", value: estimate.totalLaborCost, className: "bg-muted-foreground/50" },
    { label: "Overhead & profit", value: estimate.overheadProfitCost, className: "bg-border" },
  ].map((segment) => {
    const rawPercent = total > 0 ? (segment.value / total) * 100 : 0;
    return {
      ...segment,
      percent: rawPercent > 0 && rawPercent < 0.75 ? 0.75 : rawPercent,
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Komposisi Biaya
      </p>
      <div
        aria-hidden="true"
        className="flex h-3 w-full overflow-hidden rounded-full ring-1 ring-foreground/10"
      >
        {segments.map((segment) => (
          <div key={segment.label} className={segment.className} style={{ width: `${segment.percent}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-sm">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", segment.className)} />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="font-mono tabular-nums">{formatRupiah(segment.value)}</span>
            <span className="text-muted-foreground">({Math.round(segment.percent)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentRow({
  component,
}: {
  component: BuildingCostEstimate["components"][number];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TableRow className="align-top">
        <TableCell>
          <div className="flex items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-expanded={isOpen}
              aria-label={`Tampilkan rincian ${component.componentName}`}
              onClick={() => setIsOpen((current) => !current)}
              className="mt-0.5 shrink-0"
            >
              <ChevronDown
                className={cn("size-4 transition-transform", isOpen ? "rotate-0" : "-rotate-90")}
              />
            </Button>
            <div>
              <span className="text-sm font-medium">{component.componentName}</span>
              {component.variantName !== null && (
                <span className="block text-sm font-normal text-muted-foreground">
                  {component.variantName}
                </span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatVolume(component.volume)} {component.unit}
        </TableCell>
        <TableCell className="text-right tabular-nums">{formatRupiah(component.materialCost)}</TableCell>
        <TableCell className="text-right tabular-nums">{formatRupiah(component.laborCost)}</TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {formatRupiah(component.totalCost)}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/40 py-4">
            <ComponentBreakdown
              materialLines={component.materialBreakdown}
              laborLines={component.laborBreakdown}
            />
          </TableCell>
        </TableRow>
      )}
    </>
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
    <div className="grid gap-4 pl-9 sm:grid-cols-2">
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
