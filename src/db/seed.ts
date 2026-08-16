import { db } from "./index";
import {
  ahspCoefficients,
  boronganRates,
  buildingTypes,
  laborRates,
  laborTypes,
  materialPrices,
  materials,
  workComponents,
} from "./schema";
import {
  BORONGAN_RATES,
  BUILDING_TYPE_RUMAH_TIPE_36,
  CITY_SURABAYA,
  LABOR_COEFFICIENTS,
  LABOR_TYPES,
  MATERIAL_COEFFICIENTS,
  MATERIALS,
  PRICE_SOURCE_MANUAL,
  WORK_COMPONENTS,
} from "./seed-data";

const recordedAt = new Date();

function clearExistingData(): void {
  const sqlite = db.$client;
  const tableNames = [
    "ahsp_coefficients",
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

const buildingType = BUILDING_TYPE_RUMAH_TIPE_36;

const buildingTypeId = db
  .insert(buildingTypes)
  .values({
    slug: buildingType.slug,
    name: buildingType.name,
    description: buildingType.description,
    defaultBuildingArea: buildingType.defaultBuildingArea,
  })
  .returning({ id: buildingTypes.id })
  .get().id;

const componentIdBySlug = new Map<string, number>();
for (const component of WORK_COMPONENTS) {
  const inserted = db
    .insert(workComponents)
    .values({
      buildingTypeId,
      slug: component.slug,
      name: component.name,
      unit: component.unit,
      sortOrder: component.sortOrder,
    })
    .returning({ id: workComponents.id })
    .get();
  componentIdBySlug.set(component.slug, inserted.id);
}

const materialIdBySlug = new Map<string, number>();
for (const material of MATERIALS) {
  const inserted = db
    .insert(materials)
    .values({ slug: material.slug, name: material.name, unit: material.unit, category: material.category })
    .returning({ id: materials.id })
    .get();
  materialIdBySlug.set(material.slug, inserted.id);

  db.insert(materialPrices)
    .values({
      materialId: inserted.id,
      price: material.priceInCity,
      source: PRICE_SOURCE_MANUAL,
      city: CITY_SURABAYA,
      recordedAt,
    })
    .run();
}

const laborTypeIdBySlug = new Map<string, number>();
for (const laborType of LABOR_TYPES) {
  const inserted = db
    .insert(laborTypes)
    .values({ slug: laborType.slug, name: laborType.name })
    .returning({ id: laborTypes.id })
    .get();
  laborTypeIdBySlug.set(laborType.slug, inserted.id);

  db.insert(laborRates)
    .values({
      laborTypeId: inserted.id,
      dailyRate: laborType.dailyRateInCity,
      city: CITY_SURABAYA,
      recordedAt,
    })
    .run();
}

for (const coefficient of MATERIAL_COEFFICIENTS) {
  db.insert(ahspCoefficients)
    .values({
      workComponentId: componentIdBySlug.get(coefficient.componentSlug)!,
      materialId: materialIdBySlug.get(coefficient.materialSlug)!,
      materialCoefficient: coefficient.coefficient,
    })
    .run();
}

for (const coefficient of LABOR_COEFFICIENTS) {
  db.insert(ahspCoefficients)
    .values({
      workComponentId: componentIdBySlug.get(coefficient.componentSlug)!,
      laborTypeId: laborTypeIdBySlug.get(coefficient.laborTypeSlug)!,
      laborCoefficient: coefficient.coefficient,
    })
    .run();
}

for (const rate of BORONGAN_RATES) {
  db.insert(boronganRates)
    .values({
      workComponentId: componentIdBySlug.get(rate.componentSlug)!,
      pricePerUnit: rate.pricePerUnit,
      city: CITY_SURABAYA,
      sourceName: rate.sourceName,
      recordedAt,
    })
    .run();
}

const materialCount = db.select().from(materials).all().length;
const laborCount = db.select().from(laborTypes).all().length;
const coefficientCount = db.select().from(ahspCoefficients).all().length;
const componentCount = db.select().from(workComponents).all().length;

console.log(
  `Seed selesai: ${componentCount} komponen, ${materialCount} material, ${laborCount} jenis upah, ${coefficientCount} koefisien AHSP, ${BORONGAN_RATES.length} tarif borongan (kota: ${CITY_SURABAYA}).`,
);
