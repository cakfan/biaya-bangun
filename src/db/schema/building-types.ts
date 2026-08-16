import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const buildingTypes = sqliteTable("building_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  defaultBuildingArea: integer("default_building_area").notNull(),
});

export const workComponents = sqliteTable("work_components", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  buildingTypeId: integer("building_type_id")
    .notNull()
    .references(() => buildingTypes.id),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  volumeMultiplierPerSquareMeter: real("volume_multiplier_per_square_meter").notNull(),
  sortOrder: integer("sort_order").notNull(),
});
