import { eq } from "drizzle-orm";
import { db } from "@/db";
import { boronganRates, workComponents } from "@/db/schema";
import { calculateBuildingCost } from "@/lib/calculation/calculate-building-cost";
import { loadEstimateInput } from "@/lib/calculation/load-estimate-input";

const BUILDING_TYPE_SLUG = "rumah-tipe-36";
const BUILDING_AREA = 36;
const MARKET_BORONGAN_MIN_PER_SQUARE_METER = 3_500_000;
const MARKET_BORONGAN_MAX_PER_SQUARE_METER = 5_000_000;

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function main(): void {
  const estimate = calculateBuildingCost(loadEstimateInput(BUILDING_TYPE_SLUG, BUILDING_AREA));

  const boronganByComponentSlug = new Map(
    db
      .select({
        componentSlug: workComponents.slug,
        pricePerUnit: boronganRates.pricePerUnit,
      })
      .from(boronganRates)
      .innerJoin(workComponents, eq(boronganRates.workComponentId, workComponents.id))
      .all()
      .map((row) => [row.componentSlug, row.pricePerUnit]),
  );

  console.log("=== RAB AHSP: Rumah Tipe 36, luas 36 m2, Surabaya ===");
  console.log("");

  for (const component of estimate.components) {
    const costPerUnit = component.totalCost / component.volume;
    console.log(
      `- ${component.componentName} (${component.volume.toFixed(2)} ${component.unit})`,
    );
    console.log(
      `    bahan ${formatRupiah(component.materialCost)}  |  upah ${formatRupiah(component.laborCost)}  |  total ${formatRupiah(component.totalCost)} (${formatRupiah(costPerUnit)}/${component.unit})`,
    );

    const boronganPrice = boronganByComponentSlug.get(component.componentSlug);
    if (boronganPrice !== undefined) {
      const ratio = component.laborCost / component.volume / boronganPrice;
      console.log(
        `    vs borongan pasar ${formatRupiah(boronganPrice)}/${component.unit} (upah) => rasio ${(ratio * 100).toFixed(0)}%`,
      );
    }
  }

  console.log("");
  console.log(`Total bahan  : ${formatRupiah(estimate.totalMaterialCost)}`);
  console.log(`Total upah   : ${formatRupiah(estimate.totalLaborCost)}`);
  console.log(`Subtotal     : ${formatRupiah(estimate.subtotalCost)}`);
  console.log(`Overhead+profit (${(estimate.overheadProfitRate * 100).toFixed(0)}%): ${formatRupiah(estimate.overheadProfitCost)}`);
  console.log(`TOTAL ESTIMASI: ${formatRupiah(estimate.totalCost)}`);
  console.log(`= ${formatRupiah(estimate.costPerSquareMeter)}/m2`);

  console.log("");
  console.log("=== Validasi vs harga borongan pasar Surabaya 2025 ===");
  const marketMin = MARKET_BORONGAN_MIN_PER_SQUARE_METER;
  const marketMax = MARKET_BORONGAN_MAX_PER_SQUARE_METER;
  const perSquareMeter = estimate.costPerSquareMeter;
  if (perSquareMeter >= marketMin && perSquareMeter <= marketMax) {
    console.log(`OK: ${formatRupiah(perSquareMeter)}/m2 berada dalam rentang pasar ${formatRupiah(marketMin)}-${formatRupiah(marketMax)}/m2.`);
  } else {
    const deviation = perSquareMeter > marketMax ? "di atas" : "di bawah";
    console.log(
      `PERLU KALIBRASI: ${formatRupiah(perSquareMeter)}/m2 ${deviation} rentang pasar ${formatRupiah(marketMin)}-${formatRupiah(marketMax)}/m2.`,
    );
  }
}

main();
