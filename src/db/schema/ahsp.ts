import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workComponents } from "./building-types";
import { materials } from "./materials";
import { laborTypes } from "./labor";

export const ahspCoefficients = sqliteTable("ahsp_coefficients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workComponentId: integer("work_component_id")
    .notNull()
    .references(() => workComponents.id),
  materialId: integer("material_id").references(() => materials.id),
  materialCoefficient: real("material_coefficient"),
  laborTypeId: integer("labor_type_id").references(() => laborTypes.id),
  laborCoefficient: real("labor_coefficient"),
});

export const boronganRates = sqliteTable("borongan_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workComponentId: integer("work_component_id")
    .notNull()
    .references(() => workComponents.id),
  pricePerUnit: integer("price_per_unit").notNull(),
  city: text("city").notNull(),
  sourceName: text("source_name").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
});
