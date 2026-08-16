import {
  BUILDING_TYPE_RUMAH_TIPE_36,
  WORK_COMPONENTS,
} from "@/db/seed-data";
import type { ComponentCostEstimate, BuildingCostEstimate, BuildingCostInput } from "./types";

const volumeMultiplierBySlug = new Map(
  WORK_COMPONENTS.map((component) => [
    component.slug,
    component.volumeMultiplierPerSquareMeter,
  ]),
);

export function calculateComponentVolume(componentSlug: string, buildingArea: number): number {
  const volumeMultiplier = volumeMultiplierBySlug.get(componentSlug);
  if (volumeMultiplier === undefined) {
    throw new Error(`Tidak ada rumus volume untuk komponen "${componentSlug}".`);
  }
  return volumeMultiplier * buildingArea;
}

function roundToRupiah(value: number): number {
  return Math.round(value);
}

function validateInput(input: BuildingCostInput): void {
  if (!Number.isFinite(input.buildingArea) || input.buildingArea <= 0) {
    throw new Error("Luas bangunan harus berupa angka positif.");
  }

  const materialPriceBySlug = new Map(input.materials.map((material) => [material.slug, material]));
  const laborRateBySlug = new Map(input.laborTypes.map((laborType) => [laborType.slug, laborType]));

  for (const component of input.components) {
    for (const coefficient of component.materialCoefficients) {
      if (!materialPriceBySlug.has(coefficient.materialSlug)) {
        throw new Error(
          `Harga material "${coefficient.materialSlug}" (komponen "${component.slug}") tidak ditemukan.`,
        );
      }
    }
    for (const coefficient of component.laborCoefficients) {
      if (!laborRateBySlug.has(coefficient.laborTypeSlug)) {
        throw new Error(
          `Upah tenaga "${coefficient.laborTypeSlug}" (komponen "${component.slug}") tidak ditemukan.`,
        );
      }
    }
  }
}

export function calculateBuildingCost(input: BuildingCostInput): BuildingCostEstimate {
  validateInput(input);

  const materialBySlug = new Map(input.materials.map((material) => [material.slug, material]));
  const laborTypeBySlug = new Map(input.laborTypes.map((laborType) => [laborType.slug, laborType]));

  const components = input.components.map<ComponentCostEstimate>((component) => {
    const materialBreakdown = component.materialCoefficients.map((coefficient) => {
      const material = materialBySlug.get(coefficient.materialSlug)!;
      const cost = roundToRupiah(coefficient.coefficient * material.price * component.volume);
      return {
        materialName: material.name,
        unit: material.unit,
        coefficient: coefficient.coefficient,
        price: material.price,
        cost,
      };
    });

    const laborBreakdown = component.laborCoefficients.map((coefficient) => {
      const laborType = laborTypeBySlug.get(coefficient.laborTypeSlug)!;
      const cost = roundToRupiah(coefficient.coefficient * laborType.dailyRate * component.volume);
      return {
        laborTypeName: laborType.name,
        dailyRate: laborType.dailyRate,
        coefficient: coefficient.coefficient,
        cost,
      };
    });

    const materialCost = materialBreakdown.reduce((sum, line) => sum + line.cost, 0);
    const laborCost = laborBreakdown.reduce((sum, line) => sum + line.cost, 0);

    return {
      componentSlug: component.slug,
      componentName: component.name,
      unit: component.unit,
      volume: component.volume,
      materialCost,
      laborCost,
      totalCost: materialCost + laborCost,
      materialBreakdown,
      laborBreakdown,
    };
  });

  const totalMaterialCost = components.reduce((sum, component) => sum + component.materialCost, 0);
  const totalLaborCost = components.reduce((sum, component) => sum + component.laborCost, 0);
  const subtotalCost = totalMaterialCost + totalLaborCost;
  const overheadProfitCost = roundToRupiah(subtotalCost * input.overheadProfitRate);
  const totalCost = subtotalCost + overheadProfitCost;

  return {
    buildingTypeSlug: input.buildingTypeSlug,
    buildingArea: input.buildingArea,
    overheadProfitRate: input.overheadProfitRate,
    components,
    totalMaterialCost,
    totalLaborCost,
    subtotalCost,
    overheadProfitCost,
    totalCost,
    costPerSquareMeter: roundToRupiah(totalCost / input.buildingArea),
  };
}

export { BUILDING_TYPE_RUMAH_TIPE_36 };
