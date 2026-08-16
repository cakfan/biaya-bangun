"use server";

import { calculateBuildingCost } from "@/lib/calculation/calculate-building-cost";
import { loadEstimateInput } from "@/lib/calculation/load-estimate-input";
import type { BuildingCostEstimate } from "@/lib/calculation/types";

export type EstimateFormState = {
  estimate: BuildingCostEstimate | null;
  error: string | null;
};

export async function calculateEstimateAction(
  _previousState: EstimateFormState,
  formData: FormData,
): Promise<EstimateFormState> {
  const buildingTypeSlug = String(formData.get("buildingTypeSlug") ?? "").trim();
  const buildingArea = Number(formData.get("buildingArea"));
  const city = String(formData.get("city") ?? "").trim();

  if (buildingTypeSlug === "") {
    return { estimate: null, error: "Pilih tipe bangunan." };
  }
  if (!Number.isFinite(buildingArea) || buildingArea <= 0) {
    return { estimate: null, error: "Luas bangunan harus berupa angka positif." };
  }
  if (city === "") {
    return { estimate: null, error: "Pilih kota." };
  }

  try {
    const estimate = calculateBuildingCost(
      loadEstimateInput(buildingTypeSlug, buildingArea, city),
    );
    return { estimate, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghitung estimasi.";
    return { estimate: null, error: message };
  }
}
