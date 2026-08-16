import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const materialCategories = [
  "struktur",
  "dinding",
  "atap",
  "finishing",
  "utilitas",
] as const;

export type MaterialCategory = (typeof materialCategories)[number];

export const materials = sqliteTable("materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  category: text("category", { enum: materialCategories }).notNull(),
});

export const priceSources = ["manual", "scraping"] as const;

export type PriceSource = (typeof priceSources)[number];

export const materialPrices = sqliteTable("material_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  materialId: integer("material_id")
    .notNull()
    .references(() => materials.id),
  price: integer("price").notNull(),
  source: text("source", { enum: priceSources }).notNull(),
  sourceName: text("source_name"),
  city: text("city").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
});
