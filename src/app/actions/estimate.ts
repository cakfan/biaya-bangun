"use server";

import { calculateBuildingCost } from "@/lib/calculation/calculate-building-cost";
import { loadEstimateInput } from "@/lib/calculation/load-estimate-input";
import type { SelectedVariants } from "@/lib/calculation/load-estimate-input";
import type { BuildingCostEstimate } from "@/lib/calculation/types";
import { VARIANT_FIELD_PREFIX } from "@/lib/calculation/types";
import { DEFAULT_WASTE_FACTOR } from "@/db/seed-data";
import { loadBoronganRates } from "@/lib/calculation/load-borongan-rates";
import type { BoronganRateByComponent } from "@/lib/calculation/load-borongan-rates";

export type EstimateFormState = {
  estimate: BuildingCostEstimate | null;
  boronganRates: BoronganRateByComponent;
  error: string | null;
};

function readSelectedVariants(formData: FormData): SelectedVariants {
  const selectedVariants: SelectedVariants = {};
  for (const [fieldName, value] of formData.entries()) {
    if (fieldName.startsWith(VARIANT_FIELD_PREFIX)) {
      const componentSlug = fieldName.slice(VARIANT_FIELD_PREFIX.length);
      const variantSlug = String(value).trim();
      selectedVariants[componentSlug] = variantSlug === "" ? null : variantSlug;
    }
  }
  return selectedVariants;
}

export async function calculateEstimateAction(
  _previousState: EstimateFormState,
  formData: FormData,
): Promise<EstimateFormState> {
  const buildingTypeSlug = String(formData.get("buildingTypeSlug") ?? "").trim();
  const buildingArea = Number(formData.get("buildingArea"));
  const city = String(formData.get("city") ?? "").trim();

  if (buildingTypeSlug === "") {
    return { estimate: null, boronganRates: {}, error: "Pilih tipe bangunan." };
  }
  if (!Number.isFinite(buildingArea) || buildingArea <= 0) {
    return { estimate: null, boronganRates: {}, error: "Luas bangunan harus berupa angka positif." };
  }
  if (city === "") {
    return { estimate: null, boronganRates: {}, error: "Pilih kota." };
  }

  try {
    const wasteFactorRaw = Number(formData.get("wasteFactor"));
    const wasteFactor = Number.isFinite(wasteFactorRaw) && wasteFactorRaw >= 0 && wasteFactorRaw <= 0.5
      ? wasteFactorRaw
      : DEFAULT_WASTE_FACTOR;

    const selectedComponentSlugs = formData
      .getAll("selectedComponentSlugs")
      .map(String)
      .filter((slug) => slug.trim() !== "");

    const input = loadEstimateInput(
      buildingTypeSlug,
      buildingArea,
      city,
      readSelectedVariants(formData),
      selectedComponentSlugs,
    );
    input.wasteFactor = wasteFactor;

    const estimate = calculateBuildingCost(input);
    const boronganRates = loadBoronganRates(city);
    return { estimate, boronganRates, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghitung estimasi.";
    return { estimate: null, boronganRates: {}, error: message };
  }
}
