import { db } from "./index";
import {
  ahspCoefficients,
  boronganRates,
  buildingTypes,
  componentVariants,
  laborRates,
  laborTypes,
  materialPrices,
  materials,
  workComponents,
} from "./schema";
import {
  BORONGAN_RATES,
  BUILDING_TYPES,
  CITIES,
  COMPONENT_VARIANTS,
  LABOR_COEFFICIENTS,
  LABOR_TYPES,
  MATERIAL_COEFFICIENTS,
  MATERIALS,
  PRICE_SOURCE_MANUAL,
  VARIANT_MATERIAL_COEFFICIENTS,
} from "./seed-data";

const recordedAt = new Date();

function roundPriceForCity(value: number): number {
  const step = value < 100_000 ? 100 : value < 1_000_000 ? 1_000 : 5_000;
  return Math.round(value / step) * step;
}

function clearExistingData(): void {
  const sqlite = db.$client;
  const tableNames = [
    "ahsp_coefficients",
    "component_variants",
    "borongan_rates",
    "material_prices",
    "labor_rates",
    "work_components",
    "materials",
    "labor_types",
    "building_types",
  ];

  sqlite.exec("PRAGMA defer_foreign_keys = ON");
  for (const tableName of tableNames) {
    sqlite.exec(`DELETE FROM ${tableName}`);
  }
}

clearExistingData();

const buildingTypeIdBySlug = new Map<string, number>();
for (const buildingType of BUILDING_TYPES) {
  const inserted = db
    .insert(buildingTypes)
    .values({
      slug: buildingType.slug,
      name: buildingType.name,
      description: buildingType.description,
      defaultBuildingArea: buildingType.defaultBuildingArea,
    })
    .returning({ id: buildingTypes.id })
    .get();
  buildingTypeIdBySlug.set(buildingType.slug, inserted.id);
}

const componentIdByKey = new Map<string, number>();
const variantIdByKey = new Map<string, number>();

for (const buildingType of BUILDING_TYPES) {
  const buildingTypeId = buildingTypeIdBySlug.get(buildingType.slug)!;

  for (const component of buildingType.components) {
    const inserted = db
      .insert(workComponents)
      .values({
        buildingTypeId,
        slug: component.slug,
        name: component.name,
        unit: component.unit,
        volumeMultiplierPerSquareMeter: component.volumeMultiplierPerSquareMeter,
        sortOrder: component.sortOrder,
      })
      .returning({ id: workComponents.id })
      .get();

    const componentKey = `${buildingType.slug}/${component.slug}`;
    componentIdByKey.set(componentKey, inserted.id);

    for (const variant of COMPONENT_VARIANTS) {
      if (variant.componentSlug !== component.slug || variant.slug === null) {
        continue;
      }
      const variantInserted = db
        .insert(componentVariants)
        .values({
          workComponentId: inserted.id,
          slug: variant.slug,
          name: variant.name,
          sortOrder: 1,
        })
        .returning({ id: componentVariants.id })
        .get();
      variantIdByKey.set(`${buildingType.slug}/${component.slug}/${variant.slug}`, variantInserted.id);
    }
  }
}

const materialIdBySlug = new Map<string, number>();
for (const material of MATERIALS) {
  const inserted = db
    .insert(materials)
    .values({ slug: material.slug, name: material.name, unit: material.unit, category: material.category })
    .returning({ id: materials.id })
    .get();
  materialIdBySlug.set(material.slug, inserted.id);

  for (const city of CITIES) {
    db.insert(materialPrices)
      .values({
        materialId: inserted.id,
        price: roundPriceForCity(material.priceInReferenceCity * city.materialIndex),
        source: PRICE_SOURCE_MANUAL,
        city: city.name,
        recordedAt,
      })
      .run();
  }
}

const laborTypeIdBySlug = new Map<string, number>();
for (const laborType of LABOR_TYPES) {
  const inserted = db
    .insert(laborTypes)
    .values({ slug: laborType.slug, name: laborType.name })
    .returning({ id: laborTypes.id })
    .get();
  laborTypeIdBySlug.set(laborType.slug, inserted.id);

  for (const city of CITIES) {
    db.insert(laborRates)
      .values({
        laborTypeId: inserted.id,
        dailyRate: roundPriceForCity(laborType.dailyRateInReferenceCity * city.laborIndex),
        city: city.name,
        recordedAt,
      })
      .run();
  }
}

for (const buildingType of BUILDING_TYPES) {
  const componentSlugs = new Set(buildingType.components.map((component) => component.slug));

  for (const coefficient of MATERIAL_COEFFICIENTS) {
    if (!componentSlugs.has(coefficient.componentSlug)) {
      continue;
    }
    db.insert(ahspCoefficients)
      .values({
        workComponentId: componentIdByKey.get(`${buildingType.slug}/${coefficient.componentSlug}`)!,
        materialId: materialIdBySlug.get(coefficient.materialSlug)!,
        materialCoefficient: coefficient.coefficient,
      })
      .run();
  }

  for (const coefficient of LABOR_COEFFICIENTS) {
    if (!componentSlugs.has(coefficient.componentSlug)) {
      continue;
    }
    db.insert(ahspCoefficients)
      .values({
        workComponentId: componentIdByKey.get(`${buildingType.slug}/${coefficient.componentSlug}`)!,
        laborTypeId: laborTypeIdBySlug.get(coefficient.laborTypeSlug)!,
        laborCoefficient: coefficient.coefficient,
      })
      .run();
  }

  for (const coefficient of VARIANT_MATERIAL_COEFFICIENTS) {
    if (!componentSlugs.has(coefficient.componentSlug)) {
      continue;
    }
    db.insert(ahspCoefficients)
      .values({
        workComponentId: componentIdByKey.get(`${buildingType.slug}/${coefficient.componentSlug}`)!,
        variantId: variantIdByKey.get(
          `${buildingType.slug}/${coefficient.componentSlug}/${coefficient.variantSlug}`,
        )!,
        materialId: materialIdBySlug.get(coefficient.materialSlug)!,
        materialCoefficient: coefficient.coefficient,
      })
      .run();
  }
}

const componentSlugs = new Set(BUILDING_TYPES.flatMap((buildingType) =>
  buildingType.components.map((component) => component.slug),
));
for (const rate of BORONGAN_RATES) {
  if (!componentSlugs.has(rate.componentSlug)) {
    continue;
  }
  for (const buildingType of BUILDING_TYPES) {
    if (!buildingType.components.some((component) => component.slug === rate.componentSlug)) {
      continue;
    }
    for (const city of CITIES) {
      db.insert(boronganRates)
        .values({
          workComponentId: componentIdByKey.get(`${buildingType.slug}/${rate.componentSlug}`)!,
          pricePerUnit: roundPriceForCity(rate.pricePerUnit * city.materialIndex),
          city: city.name,
          sourceName: rate.sourceName,
          recordedAt,
        })
        .run();
    }
  }
}

const materialCount = db.select().from(materials).all().length;
const laborCount = db.select().from(laborTypes).all().length;
const coefficientCount = db.select().from(ahspCoefficients).all().length;
const componentCount = db.select().from(workComponents).all().length;

console.log(
  `Seed selesai: ${BUILDING_TYPES.length} tipe bangunan, ${componentCount} komponen, ${materialCount} material, ${laborCount} jenis upah, ${coefficientCount} koefisien AHSP (kota: ${CITIES.map((city) => city.name).join(", ")}).`,
);
