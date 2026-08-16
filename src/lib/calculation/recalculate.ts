import type {
  BuildingCostEstimate,
  ComponentCostEstimate,
  MaterialLineCost,
  LaborLineCost,
} from "./types";

export type PriceOverrides = {
  materialPrices: Record<string, number>;
  laborRates: Record<string, number>;
};

const EMPTY_OVERRIDES: PriceOverrides = { materialPrices: {}, laborRates: {} };

function roundToRupiah(value: number): number {
  return Math.round(value);
}

function recalculateComponent(
  component: ComponentCostEstimate,
  overrides: PriceOverrides,
): ComponentCostEstimate {
  const volume = component.volume;

  const materialBreakdown: MaterialLineCost[] = component.materialBreakdown.map((line) => {
    const overriddenPrice = overrides.materialPrices[line.materialName];
    if (overriddenPrice === undefined || overriddenPrice === line.price) {
      return line;
    }
    return {
      ...line,
      price: overriddenPrice,
      cost: roundToRupiah(line.coefficient * overriddenPrice * volume),
    };
  });

  const laborBreakdown: LaborLineCost[] = component.laborBreakdown.map((line) => {
    const overriddenRate = overrides.laborRates[line.laborTypeName];
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
