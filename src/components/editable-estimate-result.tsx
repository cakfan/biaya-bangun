"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  Pencil,
  Printer,
  RotateCcw,
  Ruler,
} from "lucide-react";
import type { BuildingCostEstimate, LaborLineCost, MaterialLineCost } from "@/lib/calculation/types";
import type { PriceOverrides } from "@/lib/calculation/recalculate";
import { recalculateEstimate } from "@/lib/calculation/recalculate";
import type { BoronganRateByComponent } from "@/lib/calculation/load-borongan-rates";
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

const EMPTY_OVERRIDES: PriceOverrides = {
  materialPrices: {},
  laborRates: {},
  excludedMaterials: {},
  excludedLabor: {},
};

const TUKANG_LABOR_NAMES = new Set([
  "Tukang Batu",
  "Tukang Kayu",
  "Tukang Besi",
  "Tukang Cat",
  "Kepala Tukang",
]);

function getTukangLaborCostPerUnit(
  laborBreakdown: LaborLineCost[],
  volume: number,
): number {
  const tukangCost = laborBreakdown
    .filter((line) => TUKANG_LABOR_NAMES.has(line.laborTypeName))
    .reduce((sum, line) => sum + line.cost, 0);
  return volume > 0 ? tukangCost / volume : 0;
}

export function EditableEstimateResult({
  estimate,
  boronganRates,
  summary,
}: {
  estimate: BuildingCostEstimate;
  boronganRates: BoronganRateByComponent;
  summary: EstimateSummary;
}) {
  const [overrides, setOverrides] = useState<PriceOverrides>(EMPTY_OVERRIDES);

  const displayEstimate = useMemo(
    () => recalculateEstimate(estimate, overrides),
    [estimate, overrides],
  );

  const hasOverrides =
    Object.keys(overrides.materialPrices).length > 0 ||
    Object.keys(overrides.laborRates).length > 0 ||
    Object.keys(overrides.excludedMaterials).length > 0 ||
    Object.keys(overrides.excludedLabor).length > 0;

  const handleMaterialPriceChange = useCallback((componentSlug: string, materialName: string, price: number) => {
    const key = `${componentSlug}:${materialName}`;
    setOverrides((prev) => ({
      ...prev,
      materialPrices: { ...prev.materialPrices, [key]: price },
    }));
  }, []);

  const handleLaborRateChange = useCallback((componentSlug: string, laborTypeName: string, dailyRate: number) => {
    const key = `${componentSlug}:${laborTypeName}`;
    setOverrides((prev) => ({
      ...prev,
      laborRates: { ...prev.laborRates, [key]: dailyRate },
    }));
  }, []);

  const handleMaterialExclude = useCallback((componentSlug: string, materialName: string) => {
    const key = `${componentSlug}:${materialName}`;
    setOverrides((prev) => {
      const { [key]: _, ...rest } = prev.excludedMaterials;
      const isExcluded = _ !== undefined;
      return {
        ...prev,
        excludedMaterials: isExcluded ? rest : { ...rest, [key]: true },
      };
    });
  }, []);

  const handleLaborExclude = useCallback((componentSlug: string, laborTypeName: string) => {
    const key = `${componentSlug}:${laborTypeName}`;
    setOverrides((prev) => {
      const { [key]: _, ...rest } = prev.excludedLabor;
      const isExcluded = _ !== undefined;
      return {
        ...prev,
        excludedLabor: isExcluded ? rest : { ...rest, [key]: true },
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setOverrides(EMPTY_OVERRIDES);
  }, []);

  return (
    <section aria-label="Hasil estimasi" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
          <Building2 className="size-3.5" />
          {summary.buildingTypeName}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
          <Ruler className="size-3.5" />
          {formatVolume(estimate.buildingArea)} m²
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
          <MapPin className="size-3.5" />
          {summary.city}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
          OH {(estimate.overheadProfitRate * 100).toFixed(0)}% · Waste {(estimate.wasteFactor * 100).toFixed(0)}%
        </span>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="grid gap-0 lg:grid-cols-[minmax(15rem,auto)_1fr]">
          <div className="flex flex-col gap-1 border-b border-border/60 p-6 lg:border-b-0 lg:border-r lg:bg-gradient-to-br lg:from-primary/[0.06] lg:to-transparent lg:rounded-l-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Estimasi</p>
            <p className="font-mono text-3xl font-bold tracking-tight text-primary tabular-nums sm:text-4xl">
              {formatRupiah(displayEstimate.totalCost)}
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {formatRupiah(displayEstimate.costPerSquareMeter)} / m²
            </p>
          </div>
          <div className="p-6">
            <CostSplit estimate={displayEstimate} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Rincian per Pekerjaan</CardTitle>
          <div className="flex gap-2 no-print">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" />
              Cetak
            </Button>
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-10">Komponen</TableHead>
                <TableHead className="text-right w-[160px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEstimate.components.map((component, index) => (
                <EditableComponentRow
                  key={component.componentSlug}
                  component={component}
                  originalComponent={estimate.components[index]}
                  boronganRate={boronganRates[component.componentSlug]}
                  overrides={overrides}
                  onMaterialPriceChange={handleMaterialPriceChange}
                  onLaborRateChange={handleLaborRateChange}
                  onMaterialExclude={handleMaterialExclude}
                  onLaborExclude={handleLaborExclude}
                />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell className="font-semibold pl-10">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.subtotalCost)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell className="font-semibold pl-10">
                  Overhead &amp; profit ({(estimate.overheadProfitRate * 100).toFixed(0)}%)
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(displayEstimate.overheadProfitCost)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground no-print">
        Estimasi indikatif dari koefisien AHSP &amp; harga material di {summary.city}.{" "}
        Centang/buka centang item untuk menambah/menghapus dari perhitungan. Klik{" "}
        <Pencil className="inline size-3 align-text-bottom" /> untuk ubah harga satuan.
      </p>
    </section>
  );
}

function EditableComponentRow({
  component,
  originalComponent,
  boronganRate,
  overrides,
  onMaterialPriceChange,
  onLaborRateChange,
  onMaterialExclude,
  onLaborExclude,
}: {
  component: BuildingCostEstimate["components"][number];
  originalComponent: BuildingCostEstimate["components"][number];
  boronganRate: number | undefined;
  overrides: PriceOverrides;
  onMaterialPriceChange: (componentSlug: string, materialName: string, price: number) => void;
  onLaborRateChange: (componentSlug: string, laborTypeName: string, dailyRate: number) => void;
  onMaterialExclude: (componentSlug: string, materialName: string) => void;
  onLaborExclude: (componentSlug: string, laborTypeName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const prefix = `${component.componentSlug}:`;

  const hasMaterialOverrides = component.materialBreakdown.some((line) => {
    const original = originalComponent.materialBreakdown.find((m) => m.materialName === line.materialName);
    return original === undefined || line.price !== original.price;
  });
  const hasLaborOverrides = component.laborBreakdown.some((line) => {
    const original = originalComponent.laborBreakdown.find((l) => l.laborTypeName === line.laborTypeName);
    return original === undefined || line.dailyRate !== original.dailyRate;
  });
  const hasExclusions =
    originalComponent.materialBreakdown.some((m) => (prefix + m.materialName) in overrides.excludedMaterials) ||
    originalComponent.laborBreakdown.some((l) => (prefix + l.laborTypeName) in overrides.excludedLabor);
  const isEdited = hasMaterialOverrides || hasLaborOverrides || hasExclusions;

  return (
    <>
      <TableRow className="align-top group">
        <TableCell className="pl-2">
          <div className="flex items-start gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-expanded={isOpen}
              aria-label={`Tampilkan rincian ${component.componentName}`}
              onClick={() => setIsOpen((current) => !current)}
              className="mt-0.5 shrink-0 cursor-pointer"
            >
              <ChevronDown
                className={cn("size-4 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")}
              />
            </Button>
            <div>
              <span className="text-sm font-medium leading-tight">{component.componentName}</span>
              {component.variantName !== null && (
                <span className="block text-xs text-muted-foreground">
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
        <TableCell className="text-right font-medium tabular-nums text-sm">
          {formatRupiah(component.totalCost)}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell colSpan={2} className="bg-muted/20 py-4 px-6">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                <span>Volume: {formatVolume(component.volume)} {component.unit}</span>
                <span>Bahan: {formatRupiah(component.materialCost)}</span>
                <span>Upah: {formatRupiah(component.laborCost)}</span>
                {boronganRate !== undefined && (() => {
                  const tukangPerUnit = getTukangLaborCostPerUnit(component.laborBreakdown, component.volume);
                  if (tukangPerUnit === 0) return null;
                  const ratio = tukangPerUnit / boronganRate;
                  return (
                    <span>
                      Borongan: {formatRupiah(boronganRate)}/{component.unit}{" "}
                      <span className={cn(
                        "font-medium",
                        ratio > 1.3 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        (rasio {(ratio * 100).toFixed(0)}%)
                      </span>
                    </span>
                  );
                })()}
              </div>
              <EditableComponentBreakdown
              componentSlug={component.componentSlug}
              materialLines={component.materialBreakdown}
              laborLines={component.laborBreakdown}
              originalMaterialLines={originalComponent.materialBreakdown}
              originalLaborLines={originalComponent.laborBreakdown}
              overrides={overrides}
              onMaterialPriceChange={onMaterialPriceChange}
              onLaborRateChange={onLaborRateChange}
              onMaterialExclude={onMaterialExclude}
              onLaborExclude={onLaborExclude}
            />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function EditableComponentBreakdown({
  componentSlug,
  materialLines,
  laborLines,
  originalMaterialLines,
  originalLaborLines,
  overrides,
  onMaterialPriceChange,
  onLaborRateChange,
  onMaterialExclude,
  onLaborExclude,
}: {
  componentSlug: string;
  materialLines: MaterialLineCost[];
  laborLines: LaborLineCost[];
  originalMaterialLines: MaterialLineCost[];
  originalLaborLines: LaborLineCost[];
  overrides: PriceOverrides;
  onMaterialPriceChange: (componentSlug: string, materialName: string, price: number) => void;
  onLaborRateChange: (componentSlug: string, laborTypeName: string, dailyRate: number) => void;
  onMaterialExclude: (componentSlug: string, materialName: string) => void;
  onLaborExclude: (componentSlug: string, laborTypeName: string) => void;
}) {
  const hasMaterial = materialLines.length > 0;
  const hasLabor = laborLines.length > 0;

  if (!hasMaterial && !hasLabor) {
    return null;
  }

  return (
    <div className="grid gap-6 pl-9 sm:grid-cols-2">
      {hasMaterial && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bahan
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {originalMaterialLines.map((line) => {
              const key = `${componentSlug}:${line.materialName}`;
              const isExcluded = key in overrides.excludedMaterials;
              const activeLine = isExcluded
                ? line
                : materialLines.find((m) => m.materialName === line.materialName) ?? line;
              return (
                <li key={line.materialName}>
                  <EditableMaterialLine
                    line={activeLine}
                    originalLine={line}
                    isExcluded={isExcluded}
                    overriddenPrice={overrides.materialPrices[key]}
                    onPriceChange={(price) => onMaterialPriceChange(componentSlug, line.materialName, price)}
                    onExclude={() => onMaterialExclude(componentSlug, line.materialName)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {hasLabor && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upah
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {originalLaborLines.map((line) => {
              const key = `${componentSlug}:${line.laborTypeName}`;
              const isExcluded = key in overrides.excludedLabor;
              const activeLine = isExcluded
                ? line
                : laborLines.find((l) => l.laborTypeName === line.laborTypeName) ?? line;
              return (
                <li key={line.laborTypeName}>
                  <EditableLaborLine
                    line={activeLine}
                    originalLine={line}
                    isExcluded={isExcluded}
                    overriddenRate={overrides.laborRates[key]}
                    onRateChange={(dailyRate) => onLaborRateChange(componentSlug, line.laborTypeName, dailyRate)}
                    onExclude={() => onLaborExclude(componentSlug, line.laborTypeName)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function EditableMaterialLine({
  line,
  originalLine,
  isExcluded,
  overriddenPrice,
  onPriceChange,
  onExclude,
}: {
  line: MaterialLineCost;
  originalLine: MaterialLineCost;
  isExcluded: boolean;
  overriddenPrice: number | undefined;
  onPriceChange: (price: number) => void;
  onExclude: () => void;
}) {
  const isOverridden = overriddenPrice !== undefined && overriddenPrice !== originalLine.price;

  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-md px-2 py-1.5 -mx-2 transition-colors",
        isExcluded ? "opacity-40" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!isExcluded}
          onChange={onExclude}
          className="size-3.5 shrink-0 accent-foreground"
        />
        <span className={cn("min-w-0 flex-1 text-sm", isExcluded && "line-through")}>
          {originalLine.materialName}{" "}
          <span className="text-muted-foreground">
            {formatVolume(originalLine.coefficient)} {originalLine.unit}
          </span>
        </span>
        <span className="text-sm font-medium tabular-nums">
          {formatRupiah(line.cost)}
        </span>
      </div>
      {!isExcluded && (
        <div className="flex items-center gap-2 pl-5.5">
          <span className="text-xs text-muted-foreground">Harga:</span>
          <EditablePriceField
            value={line.price}
            isOverridden={isOverridden}
            onChange={onPriceChange}
          />
          <span className="text-xs text-muted-foreground">
            × {formatVolume(originalLine.coefficient)} {originalLine.unit}
          </span>
        </div>
      )}
    </label>
  );
}

function EditableLaborLine({
  line,
  originalLine,
  isExcluded,
  overriddenRate,
  onRateChange,
  onExclude,
}: {
  line: LaborLineCost;
  originalLine: LaborLineCost;
  isExcluded: boolean;
  overriddenRate: number | undefined;
  onRateChange: (dailyRate: number) => void;
  onExclude: () => void;
}) {
  const isOverridden = overriddenRate !== undefined && overriddenRate !== originalLine.dailyRate;

  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-md px-2 py-1.5 -mx-2 transition-colors",
        isExcluded ? "opacity-40" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!isExcluded}
          onChange={onExclude}
          className="size-3.5 shrink-0 accent-foreground"
        />
        <span className={cn("min-w-0 flex-1 text-sm", isExcluded && "line-through")}>
          {originalLine.laborTypeName}{" "}
          <span className="text-muted-foreground">
            {formatVolume(originalLine.coefficient)} OH
          </span>
        </span>
        <span className="text-sm font-medium tabular-nums">
          {formatRupiah(line.cost)}
        </span>
      </div>
      {!isExcluded && (
        <div className="flex items-center gap-2 pl-5.5">
          <span className="text-xs text-muted-foreground">Harga:</span>
          <EditablePriceField
            value={line.dailyRate}
            isOverridden={isOverridden}
            onChange={onRateChange}
          />
          <span className="text-xs text-muted-foreground">
            × {formatVolume(originalLine.coefficient)} OH
          </span>
        </div>
      )}
    </label>
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
