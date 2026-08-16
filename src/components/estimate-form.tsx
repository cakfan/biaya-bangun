"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, Calculator, LoaderCircle } from "lucide-react";
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
  const [variantByComponentSlug, setVariantByComponentSlug] = useState<Record<string, string>>({});

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

  function handleBuildingTypeChange(slug: string | null): void {
    const buildingType = options.buildingTypes.find((option) => option.slug === slug);
    if (buildingType === undefined) {
      return;
    }
    setSelectedBuildingTypeSlug(buildingType.slug);
    setBuildingArea(String(buildingType.defaultBuildingArea));
    setVariantByComponentSlug({});
  }

  function handleVariantChange(componentSlug: string, variantSlug: string | null): void {
    setVariantByComponentSlug((current) => ({
      ...current,
      [componentSlug]: variantSlug ?? "",
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parameter Bangunan</CardTitle>
            <CardDescription>
              Volume tiap pekerjaan dihitung otomatis dari luas bangunan yang kamu masukkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
              <FormField
                label="Tipe bangunan"
                htmlFor="buildingType"
                helper={`${selectedBuildingType.componentCount} item pekerjaan · luas default ${selectedBuildingType.defaultBuildingArea} m²`}
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
                helper="Harga bahan dan upah mengikuti kota ini."
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
            </div>

            {state.error !== null && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-2xl bg-destructive/5 px-3 py-2.5 text-sm text-destructive ring-1 ring-destructive/20"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full sm:self-end sm:min-w-52"
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Calculator data-icon="inline-start" />
                )}
                {isPending ? "Menghitung…" : "Hitung Estimasi"}
              </Button>
              <p className="text-xs text-muted-foreground sm:text-right">
                Gratis, tanpa akun — hasil langsung tampil di bawah.
              </p>
            </div>
          </CardContent>
        </Card>

        {selectedBuildingType.variants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Spesifikasi Material</CardTitle>
              <CardDescription>
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
      </form>

      <div ref={resultSectionRef} className="scroll-mt-6">
        {state.estimate !== null && (
          <EditableEstimateResult
            estimate={state.estimate}
            summary={{ buildingTypeName: selectedBuildingType.name, city }}
          />
        )}
      </div>
    </div>
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
