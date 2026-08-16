import { db } from "@/db";
import { buildingTypes, materialPrices, workComponents } from "@/db/schema";
import { CITIES, COMPONENT_VARIANTS } from "@/db/seed-data";

export type MaterialVariantOption = {
  componentSlug: string;
  componentName: string;
  options: { slug: string | null; name: string }[];
};

export type BuildingTypeOption = {
  slug: string;
  name: string;
  defaultBuildingArea: number;
  componentCount: number;
  variants: MaterialVariantOption[];
};

export type FormOptions = {
  buildingTypes: BuildingTypeOption[];
  cities: string[];
};

const variantOptionsByComponentSlug = new Map<string, { slug: string | null; name: string }[]>();
for (const variant of COMPONENT_VARIANTS) {
  const options = variantOptionsByComponentSlug.get(variant.componentSlug) ?? [];
  options.push({ slug: variant.slug, name: variant.name });
  variantOptionsByComponentSlug.set(variant.componentSlug, options);
}

export function loadFormOptions(): FormOptions {
  const buildingTypeRows = db.select().from(buildingTypes).all();

  const componentRows = db.select().from(workComponents).all();

  const componentCountByType = new Map<number, number>();
  for (const component of componentRows) {
    componentCountByType.set(
      component.buildingTypeId,
      (componentCountByType.get(component.buildingTypeId) ?? 0) + 1,
    );
  }

  const cityRows = db
    .select({ city: materialPrices.city })
    .from(materialPrices)
    .groupBy(materialPrices.city)
    .all();

  const cityOrder = new Map(CITIES.map((city, index) => [city.name, index]));
  const cities = cityRows
    .map((row) => row.city)
    .sort((a, b) => (cityOrder.get(a) ?? Number.MAX_SAFE_INTEGER) - (cityOrder.get(b) ?? Number.MAX_SAFE_INTEGER));

  return {
    buildingTypes: buildingTypeRows.map((buildingType) => {
      const buildingTypeComponents = componentRows
        .filter((component) => component.buildingTypeId === buildingType.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const variants = buildingTypeComponents.flatMap<MaterialVariantOption>((component) => {
        const options = variantOptionsByComponentSlug.get(component.slug);
        if (options === undefined || options.length === 0) {
          return [];
        }
        return [
          {
            componentSlug: component.slug,
            componentName: component.name,
            options,
          },
        ];
      });

      return {
        slug: buildingType.slug,
        name: buildingType.name,
        defaultBuildingArea: buildingType.defaultBuildingArea,
        componentCount: componentCountByType.get(buildingType.id) ?? 0,
        variants,
      };
    }),
    cities,
  };
}
