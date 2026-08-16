"use client";

import { useActionState, useState } from "react";
import { calculateEstimateAction } from "@/app/actions/estimate";
import type { EstimateFormState } from "@/app/actions/estimate";
import type { FormOptions } from "@/lib/calculation/load-form-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstimateResult } from "@/components/estimate-result";

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

  const selectedType =
    options.buildingTypes.find((buildingType) => buildingType.slug === DEFAULT_BUILDING_TYPE_SLUG) ??
    options.buildingTypes[0];

  const [buildingArea, setBuildingArea] = useState(
    String(selectedType?.defaultBuildingArea ?? ""),
  );

  function handleBuildingTypeChange(slug: string | null): void {
    const buildingType = options.buildingTypes.find((option) => option.slug === slug);
    if (buildingType !== undefined) {
      setBuildingArea(String(buildingType.defaultBuildingArea));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Estimasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex min-w-44 flex-col gap-2">
              <Label htmlFor="buildingType">Tipe Bangunan</Label>
              <Select
                name="buildingTypeSlug"
                defaultValue={DEFAULT_BUILDING_TYPE_SLUG}
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
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="buildingArea">Luas Bangunan (m²)</Label>
              <Input
                id="buildingArea"
                name="buildingArea"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={buildingArea}
                onChange={(event) => setBuildingArea(event.target.value)}
                className="sm:w-40"
              />
            </div>

            <div className="flex min-w-36 flex-col gap-2">
              <Label htmlFor="city">Kota</Label>
              <Select name="city" defaultValue={DEFAULT_CITY}>
                <SelectTrigger id="city" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Menghitung…" : "Hitung Estimasi"}
            </Button>
          </form>

          {state.error !== null && (
            <p className="mt-4 text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
      </Card>

      {state.estimate !== null && <EstimateResult estimate={state.estimate} />}
    </div>
  );
}
