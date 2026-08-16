import { describe, expect, test } from "bun:test";
import { calculateBuildingCost } from "./calculate-building-cost";
import type { BuildingCostInput } from "./types";

const sampleInput: BuildingCostInput = {
  buildingTypeSlug: "rumah-tipe-36",
  buildingArea: 100,
  overheadProfitRate: 0.1,
  wasteFactor: 0.1,
  components: [
    {
      slug: "contoh-komponen",
      name: "Contoh Komponen",
      unit: "m2",
      volumeMultiplierPerSquareMeter: 0.02,
      variantName: null,
      materialCoefficients: [{ materialSlug: "contoh-material", coefficient: 3 }],
      laborCoefficients: [{ laborTypeSlug: "contoh-upah", coefficient: 0.5 }],
    },
  ],
  materials: [{ slug: "contoh-material", name: "Contoh Material", unit: "kg", price: 1000 }],
  laborTypes: [{ slug: "contoh-upah", name: "Contoh Upah", dailyRate: 200000 }],
};

describe("calculateBuildingCost", () => {
  test("menghitung volume dari multiplier per m2 dan luas bangunan", () => {
    const estimate = calculateBuildingCost({
      ...sampleInput,
      buildingArea: 36,
      components: [
        { ...sampleInput.components[0], volumeMultiplierPerSquareMeter: 3.5 },
      ],
    });

    expect(estimate.components[0].volume).toBe(126);
  });

  test("menghitung biaya bahan dan upah terpisah", () => {
    const estimate = calculateBuildingCost(sampleInput);

    const component = estimate.components[0];
    expect(component.volume).toBe(2);
    expect(component.materialBreakdown[0].cost).toBe(6600);
    expect(component.laborBreakdown[0].cost).toBe(200000);
    expect(component.materialCost).toBe(6600);
    expect(component.laborCost).toBe(200000);
    expect(component.totalCost).toBe(206600);
  });

  test("menjumlahkan biaya, overhead & profit, dan biaya per m2", () => {
    const estimate = calculateBuildingCost(sampleInput);

    expect(estimate.totalMaterialCost).toBe(6600);
    expect(estimate.totalLaborCost).toBe(200000);
    expect(estimate.subtotalCost).toBe(206600);
    expect(estimate.overheadProfitCost).toBe(20660);
    expect(estimate.totalCost).toBe(227260);
    expect(estimate.costPerSquareMeter).toBe(2273);
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

  test("membawa nama varian material yang dipilih ke hasil estimasi", () => {
    const estimate = calculateBuildingCost({
      ...sampleInput,
      components: [{ ...sampleInput.components[0], variantName: "Spandek + Rangka Baja Ringan" }],
    });

    expect(estimate.components[0].variantName).toBe("Spandek + Rangka Baja Ringan");
  });

  test("menerapkan waste factor ke biaya bahan", () => {
    const estimate = calculateBuildingCost({ ...sampleInput, wasteFactor: 0 });
    expect(estimate.components[0].materialBreakdown[0].cost).toBe(6000);

    const estimateWithWaste = calculateBuildingCost({ ...sampleInput, wasteFactor: 0.15 });
    expect(estimateWithWaste.components[0].materialBreakdown[0].cost).toBe(6900);
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
