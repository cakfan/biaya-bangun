import { describe, expect, test } from "bun:test";
import { calculateBuildingCost, calculateComponentVolume } from "./calculate-building-cost";
import type { BuildingCostInput } from "./types";

const sampleInput: BuildingCostInput = {
  buildingTypeSlug: "rumah-tipe-36",
  buildingArea: 100,
  overheadProfitRate: 0.1,
  components: [
    {
      slug: "contoh-komponen",
      name: "Contoh Komponen",
      unit: "m2",
      volume: 2,
      materialCoefficients: [{ materialSlug: "contoh-material", coefficient: 3 }],
      laborCoefficients: [{ laborTypeSlug: "contoh-upah", coefficient: 0.5 }],
    },
  ],
  materials: [{ slug: "contoh-material", name: "Contoh Material", unit: "kg", price: 1000 }],
  laborTypes: [{ slug: "contoh-upah", name: "Contoh Upah", dailyRate: 200000 }],
};

describe("calculateComponentVolume", () => {
  test("menghitung volume berdasarkan luas bangunan", () => {
    expect(calculateComponentVolume("dinding-bata", 36)).toBe(126);
    expect(calculateComponentVolume("pekerjaan-persiapan", 36)).toBe(36);
  });

  test("melempar error untuk slug komponen yang tidak dikenal", () => {
    expect(() => calculateComponentVolume("komponen-asing", 36)).toThrow(
      'Tidak ada rumus volume untuk komponen "komponen-asing"',
    );
  });
});

describe("calculateBuildingCost", () => {
  test("menghitung biaya bahan dan upah terpisah", () => {
    const estimate = calculateBuildingCost(sampleInput);

    const component = estimate.components[0];
    expect(component.materialBreakdown[0].cost).toBe(6000);
    expect(component.laborBreakdown[0].cost).toBe(200000);
    expect(component.materialCost).toBe(6000);
    expect(component.laborCost).toBe(200000);
    expect(component.totalCost).toBe(206000);
  });

  test("menjumlahkan biaya, overhead & profit, dan biaya per m2", () => {
    const estimate = calculateBuildingCost(sampleInput);

    expect(estimate.totalMaterialCost).toBe(6000);
    expect(estimate.totalLaborCost).toBe(200000);
    expect(estimate.subtotalCost).toBe(206000);
    expect(estimate.overheadProfitCost).toBe(20600);
    expect(estimate.totalCost).toBe(226600);
    expect(estimate.costPerSquareMeter).toBe(2266);
  });

  test("menghitung perhitungan skala penuh untuk rumah tipe 36", () => {
    const estimate = calculateBuildingCost({
      ...sampleInput,
      buildingArea: 36,
      overheadProfitRate: 0,
    });

    expect(estimate.buildingArea).toBe(36);
    expect(estimate.components).toHaveLength(1);
    expect(estimate.overheadProfitCost).toBe(0);
    expect(estimate.totalCost).toBe(estimate.subtotalCost);
  });

  test("melempar error jika luas bangunan tidak valid", () => {
    expect(() => calculateBuildingCost({ ...sampleInput, buildingArea: 0 })).toThrow(
      "Luas bangunan harus berupa angka positif",
    );
    expect(() => calculateBuildingCost({ ...sampleInput, buildingArea: Number.NaN })).toThrow();
  });

  test("melempar error jika harga material komponen tidak ada", () => {
    expect(() =>
      calculateBuildingCost({
        ...sampleInput,
        components: [
          { ...sampleInput.components[0], materialCoefficients: [{ materialSlug: "tidak-ada", coefficient: 1 }] },
        ],
      }),
    ).toThrow('Harga material "tidak-ada"');
  });

  test("melempar error jika upah tenaga komponen tidak ada", () => {
    expect(() =>
      calculateBuildingCost({
        ...sampleInput,
        components: [
          { ...sampleInput.components[0], laborCoefficients: [{ laborTypeSlug: "tidak-ada", coefficient: 1 }] },
        ],
      }),
    ).toThrow('Upah tenaga "tidak-ada"');
  });
});
