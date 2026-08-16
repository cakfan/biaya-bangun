import { describe, expect, test } from "bun:test";
import { calculateBuildingCost } from "@/lib/calculation/calculate-building-cost";
import type { BuildingCostInput } from "@/lib/calculation/types";
import { filterKnownPriceOverrides, getOverrideKeys } from "./recalculate-tool";

const sampleInput: BuildingCostInput = {
  buildingTypeSlug: "rumah-tipe-36",
  buildingArea: 100,
  overheadProfitRate: 0.1,
  wasteFactor: 0.1,
  components: [
    {
      slug: "pondasi",
      name: "Pondasi",
      unit: "m3",
      volumeMultiplierPerSquareMeter: 0.1,
      variantName: null,
      materialCoefficients: [{ materialSlug: "semen", coefficient: 2 }],
      laborCoefficients: [{ laborTypeSlug: "tukang-batu", coefficient: 0.5 }],
    },
  ],
  materials: [{ slug: "semen", name: "Semen", unit: "kg", price: 1400 }],
  laborTypes: [{ slug: "tukang-batu", name: "Tukang Batu", dailyRate: 150000 }],
};

describe("getOverrideKeys", () => {
  test("menghasilkan key componentSlug:itemName", () => {
    const estimate = calculateBuildingCost(sampleInput);
    const keys = getOverrideKeys(estimate);

    expect(keys.has("pondasi:Semen")).toBe(true);
    expect(keys.has("pondasi:Tukang Batu")).toBe(true);
  });
});

describe("filterKnownPriceOverrides", () => {
  test("membuang key yang tidak dikenal", () => {
    const estimate = calculateBuildingCost(sampleInput);
    const overrides = filterKnownPriceOverrides(
      {
        materialPrices: { "pondasi:Semen": 2000, "atap:Seng": 9999 },
        laborRates: { "pondasi:Tukang Batu": 180000, "x:y": 1 },
      },
      estimate,
    );

    expect(overrides.materialPrices).toEqual({ "pondasi:Semen": 2000 });
    expect(overrides.laborRates).toEqual({ "pondasi:Tukang Batu": 180000 });
    expect(overrides.excludedMaterials).toEqual({});
    expect(overrides.excludedLabor).toEqual({});
  });

  test("menghasilkan override kosong bila tidak ada yang dikenal", () => {
    const estimate = calculateBuildingCost(sampleInput);
    const overrides = filterKnownPriceOverrides(
      { materialPrices: { "atap:Seng": 1000 }, laborRates: {} },
      estimate,
    );

    expect(overrides.materialPrices).toEqual({});
    expect(overrides.laborRates).toEqual({});
  });
});
