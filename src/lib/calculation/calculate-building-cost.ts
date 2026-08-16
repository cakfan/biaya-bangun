import type { ComponentCostEstimate, BuildingCostEstimate, BuildingCostInput } from "./types";

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
    const volume = component.volumeMultiplierPerSquareMeter * input.buildingArea;

    const materialBreakdown = component.materialCoefficients.map((coefficient) => {
      const material = materialBySlug.get(coefficient.materialSlug)!;
      const cost = roundToRupiah(coefficient.coefficient * material.price * volume);
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
      const cost = roundToRupiah(coefficient.coefficient * laborType.dailyRate * volume);
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
      volume,
      variantName: component.variantName,
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
