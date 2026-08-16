import { db } from "@/db";
import { buildingTypes, materialPrices, workComponents } from "@/db/schema";

export type BuildingTypeOption = {
  slug: string;
  name: string;
  defaultBuildingArea: number;
  componentCount: number;
};

export type FormOptions = {
  buildingTypes: BuildingTypeOption[];
  cities: string[];
};

export function loadFormOptions(): FormOptions {
  const buildingTypeRows = db.select().from(buildingTypes).all();

  const componentCountRows = db
    .select({ buildingTypeId: workComponents.buildingTypeId })
    .from(workComponents)
    .all();

  const componentCountByType = new Map<number, number>();
  for (const row of componentCountRows) {
    componentCountByType.set(row.buildingTypeId, (componentCountByType.get(row.buildingTypeId) ?? 0) + 1);
  }

  const cityRows = db
    .select({ city: materialPrices.city })
    .from(materialPrices)
    .groupBy(materialPrices.city)
    .all();

  return {
    buildingTypes: buildingTypeRows.map((buildingType) => ({
      slug: buildingType.slug,
      name: buildingType.name,
      defaultBuildingArea: buildingType.defaultBuildingArea,
      componentCount: componentCountByType.get(buildingType.id) ?? 0,
    })),
    cities: cityRows.map((row) => row.city),
  };
}
