import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { BuildingCostEstimate } from "@/lib/calculation/types";
import { recalculateEstimate, type PriceOverrides } from "@/lib/calculation/recalculate";
import { buildEstimateContext } from "./build-estimate-context";
import type { EstimateSummary } from "@/components/estimate-result";

const recalculateInputSchema = z.object({
  materialPrices: z.record(z.string(), z.number().positive().finite()).optional(),
  laborRates: z.record(z.string(), z.number().positive().finite()).optional(),
});

export function getOverrideKeys(estimate: BuildingCostEstimate): Set<string> {
  const keys = new Set<string>();
  for (const component of estimate.components) {
    for (const line of component.materialBreakdown) {
      keys.add(`${component.componentSlug}:${line.materialName}`);
    }
    for (const line of component.laborBreakdown) {
      keys.add(`${component.componentSlug}:${line.laborTypeName}`);
    }
  }
  return keys;
}

export function filterKnownPriceOverrides(
  overrides: Pick<PriceOverrides, "materialPrices" | "laborRates">,
  estimate: BuildingCostEstimate,
): PriceOverrides {
  const knownKeys = getOverrideKeys(estimate);
  const pickKnown = (record: Record<string, number>): Record<string, number> =>
    Object.fromEntries(
      Object.entries(record).filter(([key]) => knownKeys.has(key) && key !== ""),
    );

  return {
    materialPrices: pickKnown(overrides.materialPrices),
    laborRates: pickKnown(overrides.laborRates),
    excludedMaterials: {},
    excludedLabor: {},
  };
}

export function createRecalculateTool(
  estimate: BuildingCostEstimate,
  summary: EstimateSummary,
) {
  return tool({
    description:
      "Menghitung ulang estimasi biaya setelah harga material atau upah tukang diubah. " +
      "Argumen `materialPrices` dan `laborRates` memakai key persis seperti pada data " +
      "(format \"componentSlug:itemName\"). Hanya pakai tool ini bila pengguna ingin mengubah harga; " +
      "jangan pernah menghitung manual.",
    inputSchema: zodSchema(recalculateInputSchema),
    execute: async ({ materialPrices, laborRates }) => {
      const overrides = filterKnownPriceOverrides(
        { materialPrices: materialPrices ?? {}, laborRates: laborRates ?? {} },
        estimate,
      );
      const hasAnyOverride =
        Object.keys(overrides.materialPrices).length > 0 ||
        Object.keys(overrides.laborRates).length > 0;
      if (!hasAnyOverride) {
        return "Tidak ada perubahan harga yang dikenali. Gunakan key item yang persis sesuai data (contoh \"componentSlug:Nama Material\").";
      }
      const recalculated = recalculateEstimate(estimate, overrides);
      return buildEstimateContext(recalculated, summary);
    },
  });
}
