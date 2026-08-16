import type {
  BuildingCostEstimate,
  ComponentCostEstimate,
  MaterialLineCost,
  LaborLineCost,
} from "./types";
import { roundToRupiah } from "@/lib/format-currency";

export type PriceOverrides = {
  materialPrices: Record<string, number>;
  laborRates: Record<string, number>;
  excludedMaterials: Record<string, true>;
  excludedLabor: Record<string, true>;
};

const EMPTY_OVERRIDES: PriceOverrides = {
  materialPrices: {},
  laborRates: {},
  excludedMaterials: {},
  excludedLabor: {},
};

function recalculateComponent(
  component: ComponentCostEstimate,
  overrides: PriceOverrides,
): ComponentCostEstimate {
  const prefix = `${component.componentSlug}:`;
  const volume = component.volume;

  const materialBreakdown: MaterialLineCost[] = component.materialBreakdown
    .filter((line) => !(prefix + line.materialName in overrides.excludedMaterials))
    .map((line) => {
      const overriddenPrice = overrides.materialPrices[prefix + line.materialName];
      if (overriddenPrice === undefined || overriddenPrice === line.price) {
        return line;
      }
      return {
        ...line,
        price: overriddenPrice,
        cost: roundToRupiah(line.coefficient * overriddenPrice * volume),
      };
    });

  const laborBreakdown: LaborLineCost[] = component.laborBreakdown
    .filter((line) => !(prefix + line.laborTypeName in overrides.excludedLabor))
    .map((line) => {
      const overriddenRate = overrides.laborRates[prefix + line.laborTypeName];
      if (overriddenRate === undefined || overriddenRate === line.dailyRate) {
        return line;
      }
      return {
        ...line,
        dailyRate: overriddenRate,
        cost: roundToRupiah(line.coefficient * overriddenRate * volume),
      };
    });

  const materialCost = materialBreakdown.reduce((sum, line) => sum + line.cost, 0);
  const laborCost = laborBreakdown.reduce((sum, line) => sum + line.cost, 0);

  return {
    ...component,
    materialBreakdown,
    laborBreakdown,
    materialCost,
    laborCost,
    totalCost: materialCost + laborCost,
  };
}

export function recalculateEstimate(
  original: BuildingCostEstimate,
  overrides: PriceOverrides = EMPTY_OVERRIDES,
): BuildingCostEstimate {
  const components = original.components.map((component) =>
    recalculateComponent(component, overrides),
  );

  const totalMaterialCost = components.reduce((sum, c) => sum + c.materialCost, 0);
  const totalLaborCost = components.reduce((sum, c) => sum + c.laborCost, 0);
  const subtotalCost = totalMaterialCost + totalLaborCost;
  const overheadProfitCost = roundToRupiah(subtotalCost * original.overheadProfitRate);
  const totalCost = subtotalCost + overheadProfitCost;

  return {
    ...original,
    components,
    totalMaterialCost,
    totalLaborCost,
    subtotalCost,
    overheadProfitCost,
    totalCost,
    costPerSquareMeter: roundToRupiah(totalCost / original.buildingArea),
  };
}
