import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const laborTypes = sqliteTable("labor_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const laborRates = sqliteTable("labor_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  laborTypeId: integer("labor_type_id")
    .notNull()
    .references(() => laborTypes.id),
  dailyRate: integer("daily_rate").notNull(),
  city: text("city").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
});
