import { eq } from "drizzle-orm";
import { db } from "@/db";
import { boronganRates, workComponents } from "@/db/schema";

export type BoronganRateByComponent = Record<string, number>;

export function loadBoronganRates(city: string): BoronganRateByComponent {
  const rows = db
    .select({
      componentSlug: workComponents.slug,
      pricePerUnit: boronganRates.pricePerUnit,
    })
    .from(boronganRates)
    .innerJoin(workComponents, eq(boronganRates.workComponentId, workComponents.id))
    .where(eq(boronganRates.city, city))
    .all();

  const result: BoronganRateByComponent = {};
  for (const row of rows) {
    result[row.componentSlug] = row.pricePerUnit;
  }
  return result;
}
