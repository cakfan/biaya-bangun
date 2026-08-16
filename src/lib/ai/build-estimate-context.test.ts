import { describe, expect, test } from "bun:test";
import { calculateBuildingCost } from "@/lib/calculation/calculate-building-cost";
import type { BuildingCostInput } from "@/lib/calculation/types";
import { buildEstimateContext } from "./build-estimate-context";

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

const summary = { buildingTypeName: "Rumah Tipe 36", city: "Surabaya" };

describe("buildEstimateContext", () => {
  test("memuat ringkasan, total, dan komponen terurut by biaya", () => {
    const estimate = calculateBuildingCost(sampleInput);
    const context = buildEstimateContext(estimate, summary);

    expect(context).toContain("Rumah Tipe 36");
    expect(context).toContain("Surabaya");
    expect(context).toContain(`Total: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(estimate.totalCost)}`);
    expect(context).toContain("1. Dinding");
    expect(context).toContain("2. Pondasi");
    expect(context).toContain('key: "dinding:Bata Merah"');
    expect(context).toContain('key: "pondasi:Tukang Batu"');
  });

  test("membatasi jumlah komponen yang disertakan", () => {
    const manyComponents: BuildingCostInput = {
      ...sampleInput,
      components: Array.from({ length: 12 }, (_, index) => ({
        slug: `komponen-${index}`,
        name: `Komponen ${index}`,
        unit: "m2",
        volumeMultiplierPerSquareMeter: index + 1,
        variantName: null,
        materialCoefficients: [{ materialSlug: "semen", coefficient: 1 }],
        laborCoefficients: [{ laborTypeSlug: "tukang-batu", coefficient: 0.1 }],
      })),
    };
    const estimate = calculateBuildingCost(manyComponents);
    const context = buildEstimateContext(estimate, summary);

    expect(context).toContain("Komponen 11");
    expect(context).not.toContain("Komponen 0");
    expect(context).not.toContain("Komponen 2");
  });
});
