export const VARIANT_FIELD_PREFIX = "variant_";

export type MaterialInput = {
  slug: string;
  name: string;
  unit: string;
  price: number;
};

export type LaborTypeInput = {
  slug: string;
  name: string;
  dailyRate: number;
};

export type MaterialCoefficientInput = {
  materialSlug: string;
  coefficient: number;
};

export type LaborCoefficientInput = {
  laborTypeSlug: string;
  coefficient: number;
};

export type ComponentInput = {
  slug: string;
  name: string;
  unit: string;
  volumeMultiplierPerSquareMeter: number;
  variantName: string | null;
  materialCoefficients: MaterialCoefficientInput[];
  laborCoefficients: LaborCoefficientInput[];
};

export type BuildingCostInput = {
  buildingTypeSlug: string;
  buildingArea: number;
  overheadProfitRate: number;
  wasteFactor: number;
  components: ComponentInput[];
  materials: MaterialInput[];
  laborTypes: LaborTypeInput[];
};

export type MaterialLineCost = {
  materialName: string;
  unit: string;
  coefficient: number;
  price: number;
  cost: number;
};

export type LaborLineCost = {
  laborTypeName: string;
  dailyRate: number;
  coefficient: number;
  cost: number;
};

export type ComponentCostEstimate = {
  componentSlug: string;
  componentName: string;
  unit: string;
  volume: number;
  variantName: string | null;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  materialBreakdown: MaterialLineCost[];
  laborBreakdown: LaborLineCost[];
};

export type BuildingCostEstimate = {
  buildingTypeSlug: string;
  buildingArea: number;
  overheadProfitRate: number;
  wasteFactor: number;
  components: ComponentCostEstimate[];
  totalMaterialCost: number;
  totalLaborCost: number;
  subtotalCost: number;
  overheadProfitCost: number;
  totalCost: number;
  costPerSquareMeter: number;
};
