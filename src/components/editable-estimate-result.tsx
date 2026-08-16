"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  Percent,
  Pencil,
  RotateCcw,
  Ruler,
} from "lucide-react";
import type { BuildingCostEstimate, LaborLineCost, MaterialLineCost } from "@/lib/calculation/types";
import type { PriceOverrides } from "@/lib/calculation/recalculate";
import { recalculateEstimate } from "@/lib/calculation/recalculate";
import { formatRupiah, formatVolume } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CostSplit } from "./estimate-result";
import type { EstimateSummary } from "./estimate-result";

const EMPTY_OVERRIDES: PriceOverrides = { materialPrices: {}, laborRates: {} };

export function EditableEstimateResult({
  estimate,
  summary,
}: {
  estimate: BuildingCostEstimate;
  summary: EstimateSummary;
}) {
  const [overrides, setOverrides] = useState<PriceOverrides>(EMPTY_OVERRIDES);

  const displayEstimate = useMemo(
    () => recalculateEstimate(estimate, overrides),
    [estimate, overrides],
  );

  const hasOverrides =
    Object.keys(overrides.materialPrices).length > 0 ||
    Object.keys(overrides.laborRates).length > 0;

  const handleMaterialPriceChange = useCallback((materialName: string, price: number) => {
    setOverrides((prev) => ({
      ...prev,
      materialPrices: { ...prev.materialPrices, [materialName]: price },
    }));
  }, []);

  const handleLaborRateChange = useCallback((laborTypeName: string, dailyRate: number) => {
    setOverrides((prev) => ({
      ...prev,
      laborRates: { ...prev.laborRates, [laborTypeName]: dailyRate },
    }));
  }, []);

  const handleReset = useCallback(() => {
    setOverrides(EMPTY_OVERRIDES);
  }, []);

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
              {formatRupiah(displayEstimate.totalCost)}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {formatRupiah(displayEstimate.costPerSquareMeter)} per m²
            </p>
          </div>

          <CostSplit estimate={displayEstimate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Rincian per Pekerjaan</CardTitle>
          {hasOverrides && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Atur Ulang
            </Button>
          )}
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
              {displayEstimate.components.map((component, index) => (
                <EditableComponentRow
                  key={component.componentSlug}
                  component={component}
                  originalComponent={estimate.components[index]}
                  overrides={overrides}
                  onMaterialPriceChange={handleMaterialPriceChange}
                  onLaborRateChange={handleLaborRateChange}
                />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.totalMaterialCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.totalLaborCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.subtotalCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">
                  Overhead &amp; profit ({(estimate.overheadProfitRate * 100).toFixed(0)}%)
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.overheadProfitCost)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-base font-semibold">
                  Total Estimasi
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.totalCost)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Estimasi bersifat indikatif dan dihitung dari koefisien AHSP serta harga bahan di{" "}
        {summary.city}. Klik ikon{" "}
        <Pencil className="inline size-3 align-text-bottom" /> untuk mengubah harga bahan atau upah
        secara manual.
      </p>
    </section>
  );
}

function EditableComponentRow({
  component,
  originalComponent,
  overrides,
  onMaterialPriceChange,
  onLaborRateChange,
}: {
  component: BuildingCostEstimate["components"][number];
  originalComponent: BuildingCostEstimate["components"][number];
  overrides: PriceOverrides;
  onMaterialPriceChange: (materialName: string, price: number) => void;
  onLaborRateChange: (laborTypeName: string, dailyRate: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasMaterialOverrides = component.materialBreakdown.some(
    (line, i) => line.price !== originalComponent.materialBreakdown[i]?.price,
  );
  const hasLaborOverrides = component.laborBreakdown.some(
    (line, i) => line.dailyRate !== originalComponent.laborBreakdown[i]?.dailyRate,
  );
  const isEdited = hasMaterialOverrides || hasLaborOverrides;

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
              {isEdited && (
                <span className="ml-1.5 inline-flex items-center text-xs text-blue-600 dark:text-blue-400">
                  <Pencil className="mr-0.5 size-3" />
                  diubah
                </span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatVolume(component.volume)} {component.unit}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatRupiah(component.materialCost)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatRupiah(component.laborCost)}
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {formatRupiah(component.totalCost)}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/40 py-4">
            <EditableComponentBreakdown
              materialLines={component.materialBreakdown}
              laborLines={component.laborBreakdown}
              originalMaterialLines={originalComponent.materialBreakdown}
              originalLaborLines={originalComponent.laborBreakdown}
              overrides={overrides}
              onMaterialPriceChange={onMaterialPriceChange}
              onLaborRateChange={onLaborRateChange}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function EditableComponentBreakdown({
  materialLines,
  laborLines,
  originalMaterialLines,
  originalLaborLines,
  overrides,
  onMaterialPriceChange,
  onLaborRateChange,
}: {
  materialLines: MaterialLineCost[];
  laborLines: LaborLineCost[];
  originalMaterialLines: MaterialLineCost[];
  originalLaborLines: LaborLineCost[];
  overrides: PriceOverrides;
  onMaterialPriceChange: (materialName: string, price: number) => void;
  onLaborRateChange: (laborTypeName: string, dailyRate: number) => void;
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
          <ul className="flex flex-col gap-2 text-sm">
            {materialLines.map((line, index) => (
              <li key={line.materialName}>
                <EditableMaterialLine
                  line={line}
                  originalLine={originalMaterialLines[index]}
                  overriddenPrice={overrides.materialPrices[line.materialName]}
                  onPriceChange={(price) => onMaterialPriceChange(line.materialName, price)}
                />
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
          <ul className="flex flex-col gap-2 text-sm">
            {laborLines.map((line, index) => (
              <li key={line.laborTypeName}>
                <EditableLaborLine
                  line={line}
                  originalLine={originalLaborLines[index]}
                  overriddenRate={overrides.laborRates[line.laborTypeName]}
                  onRateChange={(dailyRate) => onLaborRateChange(line.laborTypeName, dailyRate)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EditableMaterialLine({
  line,
  originalLine,
  overriddenPrice,
  onPriceChange,
}: {
  line: MaterialLineCost;
  originalLine: MaterialLineCost;
  overriddenPrice: number | undefined;
  onPriceChange: (price: number) => void;
}) {
  const isOverridden = overriddenPrice !== undefined && overriddenPrice !== originalLine.price;

  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="min-w-0 flex-1">
        {line.materialName}{" "}
        <span className="text-muted-foreground">
          {formatVolume(line.coefficient)} {line.unit} ×{" "}
        </span>
      </span>
      <EditablePriceField
        value={line.price}
        isOverridden={isOverridden}
        onChange={onPriceChange}
      />
      <span className="tabular-nums">{formatRupiah(line.cost)}</span>
    </div>
  );
}

function EditableLaborLine({
  line,
  originalLine,
  overriddenRate,
  onRateChange,
}: {
  line: LaborLineCost;
  originalLine: LaborLineCost;
  overriddenRate: number | undefined;
  onRateChange: (dailyRate: number) => void;
}) {
  const isOverridden = overriddenRate !== undefined && overriddenRate !== originalLine.dailyRate;

  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="min-w-0 flex-1">
        {line.laborTypeName}{" "}
        <span className="text-muted-foreground">
          {formatVolume(line.coefficient)} OH ×{" "}
        </span>
      </span>
      <EditablePriceField
        value={line.dailyRate}
        isOverridden={isOverridden}
        onChange={onRateChange}
      />
      <span className="tabular-nums">{formatRupiah(line.cost)}</span>
    </div>
  );
}

function EditablePriceField({
  value,
  isOverridden,
  onChange,
}: {
  value: number;
  isOverridden: boolean;
  onChange: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  function handleStartEditing() {
    setInputValue(String(value));
    setIsEditing(true);
  }

  function handleCommit() {
    setIsEditing(false);
    const parsed = Number(inputValue.replace(/[^\d]/g, ""));
    if (Number.isFinite(parsed) && parsed >= 0 && parsed !== value) {
      onChange(parsed);
    } else {
      setInputValue(String(value));
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      handleCommit();
    } else if (event.key === "Escape") {
      setIsEditing(false);
      setInputValue(String(value));
    }
  }

  if (isEditing) {
    return (
      <Input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className="h-7 w-28 text-right text-xs tabular-nums"
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEditing}
      className={cn(
        "inline-flex h-7 min-w-[6rem] items-center justify-end rounded-md border px-2 text-xs tabular-nums transition-colors",
        "hover:border-muted-foreground/40 hover:bg-muted/50",
        isOverridden
          ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "border-transparent",
      )}
      title="Klik untuk mengubah harga"
    >
      {formatRupiah(value)}
    </button>
  );
}
