import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  ahspCoefficients,
  buildingTypes,
  componentVariants,
  laborRates,
  laborTypes,
  materialPrices,
  materials,
  workComponents,
} from "@/db/schema";
import {
  CITY_SURABAYA,
  COMPONENT_VARIANTS,
  DEFAULT_OVERHEAD_PROFIT_RATE,
} from "@/db/seed-data";
import type { BuildingCostInput } from "./types";

export type SelectedVariants = Record<string, string | null>;

const defaultVariantNameByComponentSlug = new Map(
  COMPONENT_VARIANTS.filter((variant) => variant.slug === null).map((variant) => [
    variant.componentSlug,
    variant.name,
  ]),
);

export function loadEstimateInput(
  buildingTypeSlug: string,
  buildingArea: number,
  city: string = CITY_SURABAYA,
  selectedVariants: SelectedVariants = {},
): BuildingCostInput {
  const buildingType = db
    .select()
    .from(buildingTypes)
    .where(eq(buildingTypes.slug, buildingTypeSlug))
    .get();

  if (buildingType === undefined) {
    throw new Error(`Tipe bangunan "${buildingTypeSlug}" tidak ditemukan di database.`);
  }

  const componentRows = db
    .select()
    .from(workComponents)
    .where(eq(workComponents.buildingTypeId, buildingType.id))
    .orderBy(workComponents.sortOrder)
    .all();

  if (componentRows.length === 0) {
    throw new Error(`Tipe bangunan "${buildingTypeSlug}" belum memiliki komponen pekerjaan.`);
  }

  const coefficientRows = db
    .select()
    .from(ahspCoefficients)
    .where(inArray(ahspCoefficients.workComponentId, componentRows.map((component) => component.id)))
    .all();

  const variantRows = db
    .select()
    .from(componentVariants)
    .where(inArray(componentVariants.workComponentId, componentRows.map((component) => component.id)))
    .all();

  const variantsByComponentId = new Map<number, (typeof variantRows)[number][]>();
  for (const variant of variantRows) {
    const variants = variantsByComponentId.get(variant.workComponentId) ?? [];
    variants.push(variant);
    variantsByComponentId.set(variant.workComponentId, variants);
  }

  const materialPriceRows = db
    .select({
      id: materials.id,
      slug: materials.slug,
      name: materials.name,
      unit: materials.unit,
      price: materialPrices.price,
    })
    .from(materialPrices)
    .innerJoin(materials, eq(materialPrices.materialId, materials.id))
    .where(eq(materialPrices.city, city))
    .orderBy(desc(materialPrices.recordedAt), desc(materialPrices.id))
    .all();

  const materialById = new Map<number, (typeof materialPriceRows)[number]>();
  for (const row of materialPriceRows) {
    if (!materialById.has(row.id)) {
      materialById.set(row.id, row);
    }
  }

  const laborRateRows = db
    .select({
      id: laborTypes.id,
      slug: laborTypes.slug,
      name: laborTypes.name,
      dailyRate: laborRates.dailyRate,
    })
    .from(laborRates)
    .innerJoin(laborTypes, eq(laborRates.laborTypeId, laborTypes.id))
    .where(eq(laborRates.city, city))
    .all();

  const laborTypeById = new Map<number, (typeof laborRateRows)[number]>();
  for (const row of laborRateRows) {
    if (!laborTypeById.has(row.id)) {
      laborTypeById.set(row.id, row);
    }
  }

  const components = componentRows.map((component) => {
    const componentCoefficients = coefficientRows.filter(
      (coefficient) => coefficient.workComponentId === component.id,
    );

    const variants = variantsByComponentId.get(component.id) ?? [];
    const selectedVariant = variants.find(
      (variant) => variant.slug === selectedVariants[component.slug],
    );
    const variantName =
      selectedVariant?.name ?? defaultVariantNameByComponentSlug.get(component.slug) ?? null;

    const materialCoefficients = componentCoefficients
      .filter(
        (coefficient) =>
          coefficient.materialId !== null &&
          coefficient.materialCoefficient !== null &&
          coefficient.variantId === (selectedVariant?.id ?? null),
      )
      .map((coefficient) => {
        const material = materialById.get(coefficient.materialId!);
        if (material === undefined) {
          throw new Error(
            `Harga material id ${coefficient.materialId} (komponen "${component.slug}") tidak ada untuk kota ${city}.`,
          );
        }
        return {
          materialSlug: material.slug,
          coefficient: coefficient.materialCoefficient!,
        };
      });

    const laborCoefficients = componentCoefficients
      .filter(
        (coefficient) =>
          coefficient.laborTypeId !== null &&
          coefficient.laborCoefficient !== null &&
          coefficient.variantId === null,
      )
      .map((coefficient) => {
        const laborType = laborTypeById.get(coefficient.laborTypeId!);
        if (laborType === undefined) {
          throw new Error(
            `Upah tenaga id ${coefficient.laborTypeId} (komponen "${component.slug}") tidak ada untuk kota ${city}.`,
          );
        }
        return {
          laborTypeSlug: laborType.slug,
          coefficient: coefficient.laborCoefficient!,
        };
      });

    return {
      slug: component.slug,
      name: component.name,
      unit: component.unit,
      volumeMultiplierPerSquareMeter: component.volumeMultiplierPerSquareMeter,
      variantName,
      materialCoefficients,
      laborCoefficients,
    };
  });

  return {
    buildingTypeSlug,
    buildingArea,
    overheadProfitRate: DEFAULT_OVERHEAD_PROFIT_RATE,
    components,
    materials: Array.from(materialById.values()),
    laborTypes: Array.from(laborTypeById.values()),
  };
}
