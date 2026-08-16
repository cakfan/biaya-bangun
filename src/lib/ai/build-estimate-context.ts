import type { BuildingCostEstimate, ComponentCostEstimate } from "@/lib/calculation/types";
import { formatRupiah, formatVolume } from "@/lib/format-currency";
import type { EstimateSummary } from "@/components/estimate-result";

const MAX_CONTEXT_COMPONENTS = 8;

function formatPercentage(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function formatComponentLines(component: ComponentCostEstimate): string[] {
  const lines: string[] = [];
  for (const line of component.materialBreakdown) {
    lines.push(
      `   - ${line.materialName} ${formatVolume(line.coefficient)} ${line.unit} × ${formatRupiah(line.price)} = ${formatRupiah(line.cost)} (key: "${component.componentSlug}:${line.materialName}")`,
    );
  }
  for (const line of component.laborBreakdown) {
    lines.push(
      `   - ${line.laborTypeName} ${formatVolume(line.coefficient)} OH × ${formatRupiah(line.dailyRate)} = ${formatRupiah(line.cost)} (key: "${component.componentSlug}:${line.laborTypeName}")`,
    );
  }
  return lines;
}

export function buildEstimateContext(
  estimate: BuildingCostEstimate,
  summary: EstimateSummary,
): string {
  const topComponents = [...estimate.components]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, MAX_CONTEXT_COMPONENTS);

  const componentBlocks = topComponents.map((component, index) => {
    const lines = formatComponentLines(component);
    const breakdown = lines.length > 0 ? `\n${lines.join("\n")}` : "";
    return [
      `${index + 1}. ${component.componentName} — ${formatVolume(component.volume)} ${component.unit} — ${formatRupiah(component.totalCost)}${component.variantName !== null ? ` (varian: ${component.variantName})` : ""}`,
      `   Bahan: ${formatRupiah(component.materialCost)} · Upah: ${formatRupiah(component.laborCost)}${breakdown}`,
    ].join("\n");
  });

  return [
    `Tipe bangunan: ${summary.buildingTypeName}`,
    `Kota: ${summary.city}`,
    `Luas bangunan: ${formatVolume(estimate.buildingArea)} m²`,
    `Overhead & profit: ${formatPercentage(estimate.overheadProfitRate)} · Faktor pemborosan: ${formatPercentage(estimate.wasteFactor)}`,
    "",
    "Ringkasan biaya:",
    `- Total bahan: ${formatRupiah(estimate.totalMaterialCost)}`,
    `- Total upah: ${formatRupiah(estimate.totalLaborCost)}`,
    `- Subtotal: ${formatRupiah(estimate.subtotalCost)}`,
    `- Overhead & profit: ${formatRupiah(estimate.overheadProfitCost)}`,
    `- Total: ${formatRupiah(estimate.totalCost)}`,
    `- Rata-rata per m²: ${formatRupiah(estimate.costPerSquareMeter)}`,
    "",
    `Komponen pekerjaan (diurutkan dari biaya terbesar, maksimal ${MAX_CONTEXT_COMPONENTS}):`,
    ...componentBlocks,
  ].join("\n");
}
