"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Calculator, LoaderCircle, Square, SquareCheck } from "lucide-react";
import { calculateEstimateAction } from "@/app/actions/estimate";
import type { EstimateFormState } from "@/app/actions/estimate";
import type { FormOptions } from "@/lib/calculation/load-form-options";
import { VARIANT_FIELD_PREFIX } from "@/lib/calculation/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableEstimateResult } from "@/components/editable-estimate-result";

const DEFAULT_BUILDING_TYPE_SLUG = "rumah-tipe-36";
const DEFAULT_CITY = "Surabaya";

const INITIAL_FORM_STATE: EstimateFormState = {
  estimate: null,
  boronganRates: {},
  error: null,
};

export function EstimateForm({ options }: { options: FormOptions }) {
  const [state, formAction, isPending] = useActionState(
    calculateEstimateAction,
    INITIAL_FORM_STATE,
  );

  const [selectedBuildingTypeSlug, setSelectedBuildingTypeSlug] = useState(
    DEFAULT_BUILDING_TYPE_SLUG,
  );
  const [buildingArea, setBuildingArea] = useState("36");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [wasteFactor, setWasteFactor] = useState("10");
  const [variantByComponentSlug, setVariantByComponentSlug] = useState<Record<string, string>>({});
  const [selectedComponentSlugs, setSelectedComponentSlugs] = useState<Set<string>>(
    () =>
      new Set(
        (options.buildingTypes.find((buildingType) => buildingType.slug === DEFAULT_BUILDING_TYPE_SLUG) ??
          options.buildingTypes[0]
        ).components.map((component) => component.slug),
      ),
  );

  const resultSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.estimate === null) {
      return;
    }
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    resultSectionRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [state.estimate]);

  const selectedBuildingType =
    options.buildingTypes.find((buildingType) => buildingType.slug === selectedBuildingTypeSlug) ??
    options.buildingTypes[0];

  const allComponentSlugs = useMemo(
    () => selectedBuildingType.components.map((c) => c.slug),
    [selectedBuildingType],
  );

  const allSelected = allComponentSlugs.length > 0 && allComponentSlugs.every((slug) => selectedComponentSlugs.has(slug));

  function handleBuildingTypeChange(slug: string | null): void {
    const buildingType = options.buildingTypes.find((option) => option.slug === slug);
    if (buildingType === undefined) {
      return;
    }
    setSelectedBuildingTypeSlug(buildingType.slug);
    setBuildingArea(String(buildingType.defaultBuildingArea));
    setVariantByComponentSlug({});
    setSelectedComponentSlugs(new Set(buildingType.components.map((c) => c.slug)));
  }

  function handleToggleAllComponents(): void {
    if (allSelected) {
      setSelectedComponentSlugs(new Set());
    } else {
      setSelectedComponentSlugs(new Set(allComponentSlugs));
    }
  }

  function handleToggleComponent(slug: string): void {
    setSelectedComponentSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function handleVariantChange(componentSlug: string, variantSlug: string | null): void {
    setVariantByComponentSlug((current) => ({
      ...current,
      [componentSlug]: variantSlug ?? "",
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-5 no-print">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <StepBadge number={1} />
            <CardTitle className="text-lg">Parameter Bangunan</CardTitle>
            <CardDescription className="text-sm">
              Volume tiap pekerjaan dihitung otomatis dari luas bangunan yang Anda masukkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:items-start">
              <FormField
                label="Tipe bangunan"
                htmlFor="buildingType"
                helper={`${selectedBuildingType.componentCount} item pekerjaan · default ${selectedBuildingType.defaultBuildingArea} m²`}
              >
                <Select
                  name="buildingTypeSlug"
                  value={selectedBuildingTypeSlug}
                  onValueChange={handleBuildingTypeChange}
                >
                  <SelectTrigger id="buildingType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.buildingTypes.map((buildingType) => (
                      <SelectItem key={buildingType.slug} value={buildingType.slug}>
                        {buildingType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Luas bangunan (m²)" htmlFor="buildingArea">
                <Input
                  id="buildingArea"
                  name="buildingArea"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={buildingArea}
                  onChange={(event) => setBuildingArea(event.target.value)}
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Kota"
                htmlFor="city"
                helper="Menentukan harga satuan bahan & upah."
              >
                <Select
                  name="city"
                  value={city}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setCity(value);
                    }
                  }}
                >
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.cities.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Faktor pemborosan (%)"
                htmlFor="wasteFactor"
                helper="Tambahan untuk potongan, sisa, kerusakan."
              >
                <Input
                  id="wasteFactor"
                  name="wasteFactor"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  inputMode="numeric"
                  value={wasteFactor}
                  onChange={(event) => setWasteFactor(event.target.value)}
                  className="w-full"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <StepBadge number={2} />
              <CardTitle className="text-lg">Pilih Pekerjaan</CardTitle>
              <CardDescription className="text-sm">
                Centang pekerjaan yang ingin dihitung.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleAllComponents}
              className="gap-1.5 text-xs cursor-pointer shrink-0"
            >
              {allSelected ? (
                <SquareCheck className="size-3.5" />
              ) : (
                <Square className="size-3.5" />
              )}
              {allSelected ? "Batal Semua" : "Pilih Semua"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {selectedBuildingType.components.map((component) => {
                const isChecked = selectedComponentSlugs.has(component.slug);
                return (
                  <label
                    key={component.slug}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors cursor-pointer ${
                      isChecked ? "hover:bg-muted/50" : "opacity-50 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleComponent(component.slug)}
                      className="size-3.5 shrink-0 accent-primary"
                    />
                    <span className="text-sm min-w-0 flex-1">{component.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{component.unit}</span>
                  </label>
                );
              })}
            </div>
            {selectedComponentSlugs.size === 0 && (
              <p className="mt-3 text-xs text-destructive">
                Pilih minimal satu pekerjaan untuk menghitung estimasi.
              </p>
            )}
            {selectedComponentSlugs.size > 0 && (
              <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                {selectedComponentSlugs.size} dari {allComponentSlugs.length} pekerjaan dipilih —
                total biaya dihitung dari pekerjaan yang dicentang.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedBuildingType.variants.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <StepBadge number={3} />
              <CardTitle className="text-lg">Spesifikasi Material</CardTitle>
              <CardDescription className="text-sm">
                Opsional — biarkan bawaan untuk memakai spesifikasi standar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedBuildingType.variants.map((variant) => (
                  <VariantSelect
                    key={variant.componentSlug}
                    variant={variant}
                    value={variantByComponentSlug[variant.componentSlug] ?? ""}
                    onValueChange={(slug) => handleVariantChange(variant.componentSlug, slug)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {allComponentSlugs.map((slug) => (
          <input
            key={slug}
            type="hidden"
            name="selectedComponentSlugs"
            value={selectedComponentSlugs.has(slug) ? slug : ""}
          />
        ))}

        <div className="mt-2 flex flex-col gap-3 border-t border-border/60 pt-5">
          {state.error !== null && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Gratis, tanpa akun — hasil langsung tampil di bawah.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || selectedComponentSlugs.size === 0}
              className="sm:min-w-48 cursor-pointer"
            >
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Calculator data-icon="inline-start" />
              )}
              {isPending ? "Menghitung…" : "Hitung Estimasi"}
            </Button>
          </div>
        </div>
      </form>

      <div ref={resultSectionRef} className="scroll-mt-6">
        {state.estimate !== null && (
          <EditableEstimateResult
            estimate={state.estimate}
            boronganRates={state.boronganRates}
            summary={{ buildingTypeName: selectedBuildingType.name, city }}
          />
        )}
      </div>
    </div>
  );
}

function StepBadge({ number }: { number: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
    >
      {number}
    </span>
  );
}

function FormField({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helper !== undefined && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function VariantSelect({
  variant,
  value,
  onValueChange,
}: {
  variant: { componentSlug: string; componentName: string; options: { slug: string | null; name: string }[] };
  value: string;
  onValueChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${VARIANT_FIELD_PREFIX}${variant.componentSlug}`}>
        {variant.componentName}
      </Label>
      <Select
        name={`${VARIANT_FIELD_PREFIX}${variant.componentSlug}`}
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger id={`${VARIANT_FIELD_PREFIX}${variant.componentSlug}`} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {variant.options.map((option) => (
            <SelectItem key={option.slug ?? "default"} value={option.slug ?? ""}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
