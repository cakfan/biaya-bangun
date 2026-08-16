import { describe, expect, test } from "bun:test";
import { recalculateEstimate } from "./recalculate";
import { calculateBuildingCost } from "./calculate-building-cost";
import type { BuildingCostInput } from "./types";

const sampleInput: BuildingCostInput = {
  buildingTypeSlug: "rumah-tipe-36",
  buildingArea: 100,
  overheadProfitRate: 0.1,
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
    {
      slug: "dinding",
      name: "Dinding",
      unit: "m2",
      volumeMultiplierPerSquareMeter: 2.5,
      variantName: null,
      materialCoefficients: [{ materialSlug: "bata", coefficient: 70 }],
      laborCoefficients: [{ laborTypeSlug: "tukang-batu", coefficient: 0.3 }],
    },
  ],
  materials: [
    { slug: "semen", name: "Semen", unit: "kg", price: 1400 },
    { slug: "bata", name: "Bata Merah", unit: "pcs", price: 750 },
  ],
  laborTypes: [{ slug: "tukang-batu", name: "Tukang Batu", dailyRate: 150000 }],
};

describe("recalculateEstimate", () => {
  test("mengembalikan hasil identik jika tidak ada override", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original);

    expect(result.totalCost).toBe(original.totalCost);
    expect(result.costPerSquareMeter).toBe(original.costPerSquareMeter);
    expect(result.components).toHaveLength(original.components.length);
    expect(result.components[0].materialCost).toBe(original.components[0].materialCost);
  });

  test("recalculate material price override", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: { Semen: 2000 },
      laborRates: {},
    });

    const pondasi = result.components[0];
    expect(pondasi.materialBreakdown[0].price).toBe(2000);
    expect(pondasi.materialBreakdown[0].cost).toBe(Math.round(2 * 2000 * 10));

    const totalExpected = Math.round(pondasi.materialCost + pondasi.laborCost);
    expect(pondasi.totalCost).toBe(totalExpected);
    expect(result.totalMaterialCost).toBeGreaterThan(original.totalMaterialCost);
    expect(result.totalCost).toBeGreaterThan(original.totalCost);
  });

  test("recalculate labor rate override", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: {},
      laborRates: { "Tukang Batu": 200000 },
    });

    const pondasi = result.components[0];
    expect(pondasi.laborBreakdown[0].dailyRate).toBe(200000);
    expect(pondasi.laborBreakdown[0].cost).toBe(Math.round(0.5 * 200000 * 10));

    expect(result.totalLaborCost).toBeGreaterThan(original.totalLaborCost);
  });

  test("recalculate combined material + labor overrides", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: { Semen: 2000, "Bata Merah": 1000 },
      laborRates: { "Tukang Batu": 200000 },
    });

    expect(result.totalCost).toBeGreaterThan(original.totalCost);
    expect(result.overheadProfitCost).toBe(Math.round(result.subtotalCost * 0.1));
    expect(result.totalCost).toBe(result.subtotalCost + result.overheadProfitCost);
  });

  test("override tidak mempengaruhi komponen lain jika material beda", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: { Semen: 5000 },
      laborRates: {},
    });

    expect(result.components[0].materialBreakdown[0].price).toBe(5000);
    expect(result.components[1].materialBreakdown[0].price).toBe(750);
    expect(result.components[1].materialBreakdown[0].cost).toBe(
      original.components[1].materialBreakdown[0].cost,
    );
  });

  test("override harga yang sama dengan asli tidak mengubah apapun", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: { Semen: 1400 },
      laborRates: { "Tukang Batu": 150000 },
    });

    expect(result.totalCost).toBe(original.totalCost);
    expect(result.components[0].materialBreakdown[0].cost).toBe(
      original.components[0].materialBreakdown[0].cost,
    );
  });

  test("costPerSquareMeter di-recalculate dengan benar", () => {
    const original = calculateBuildingCost(sampleInput);
    const result = recalculateEstimate(original, {
      materialPrices: { Semen: 3000 },
      laborRates: {},
    });

    expect(result.costPerSquareMeter).toBe(Math.round(result.totalCost / 100));
  });
});
