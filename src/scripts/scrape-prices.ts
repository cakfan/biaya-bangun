import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { materialPrices, materials } from "@/db/schema";
import {
  CITIES,
  MATERIALS,
  MITRA10_SOURCE_NAME,
  PRICE_SOURCE_SCRAPING,
} from "@/db/seed-data";
import { formatRupiah } from "@/lib/format-currency";
import {
  MITRA10_CATALOG,
  selectProductForMaterial,
} from "@/lib/pricing/mitra10-catalog";
import type { Mitra10CatalogEntry } from "@/lib/pricing/mitra10-catalog";
import { parseMitra10SearchResults } from "@/lib/pricing/mitra10-scraper";
import { roundPriceForCity } from "@/lib/pricing/price-rounding";

type CliArgs = {
  dryRun: boolean;
  jsonPath: string | null;
  materialSlugs: Set<string> | null;
};

type MaterialSnapshot = {
  materialSlug: string;
  productName: string;
  productUrl: string;
  pricePerReferenceUnit: number;
  manualReferencePrice: number;
  cityPrices: Record<string, number>;
};

type SnapshotFile = {
  recordedAt: string;
  source: string;
  materials: MaterialSnapshot[];
};

type MaterialMeta = {
  price: number;
  unit: string;
};

const MITRA10_ORIGIN = "https://www.mitra10.com";
const MITRA10_SEARCH_PATH = "/catalogsearch/result";
const SCRAPER_USER_AGENT = "biaya-bangun-price-scraper/0.1";
const FETCH_TIMEOUT_MS = 30_000;
const FETCH_RETRY_COUNT = 2;
const PRICE_SANITY_RANGE = { minRatio: 0.2, maxRatio: 8 };
const DEFAULT_SNAPSHOT_DIR = "data/price-snapshots";

function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dryRun: false, jsonPath: null, materialSlugs: null };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--json" || arg === "--material") {
      const value = argv[++index];
      if (value === undefined) {
        throw new Error(`Flag ${arg} memerlukan nilai.`);
      }
      if (arg === "--json") {
        args.jsonPath = value;
      } else {
        args.materialSlugs = new Set(
          value.split(",").map((slug) => slug.trim()).filter((slug) => slug !== ""),
        );
      }
    } else if (arg.startsWith("--json=")) {
      args.jsonPath = arg.slice("--json=".length);
    } else if (arg.startsWith("--material=")) {
      args.materialSlugs = new Set(
        arg
          .slice("--material=".length)
          .split(",")
          .map((slug) => slug.trim())
          .filter((slug) => slug !== ""),
      );
    } else {
      throw new Error(`Argumen tidak dikenal: ${arg}`);
    }
  }
  return args;
}

async function fetchSearchHtml(searchQuery: string): Promise<string> {
  const searchUrl = new URL(MITRA10_ORIGIN + MITRA10_SEARCH_PATH);
  searchUrl.searchParams.set("q", searchQuery);

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= FETCH_RETRY_COUNT + 1; attempt++) {
    try {
      const response = await fetch(searchUrl, {
        headers: {
          "user-agent": SCRAPER_USER_AGENT,
          accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt <= FETCH_RETRY_COUNT) {
        console.warn(
          `  Percobaan ${attempt} gagal untuk "${searchQuery}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  throw new Error(
    `Gagal mengambil hasil pencarian "${searchQuery}": ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

function isReasonablePrice(unitPrice: number, referencePrice: number): boolean {
  const ratio = unitPrice / referencePrice;
  return ratio >= PRICE_SANITY_RANGE.minRatio && ratio <= PRICE_SANITY_RANGE.maxRatio;
}

function defaultSnapshotPath(recordedAt: Date): string {
  const date = recordedAt.toISOString().slice(0, 10);
  return path.join(DEFAULT_SNAPSHOT_DIR, `${date}.json`);
}

function writeSnapshotFile(
  jsonPath: string,
  recordedAt: Date,
  snapshots: MaterialSnapshot[],
): void {
  const snapshot: SnapshotFile = {
    recordedAt: recordedAt.toISOString(),
    source: MITRA10_SOURCE_NAME,
    materials: snapshots,
  };
  const resolvedPath = path.resolve(jsonPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`Snapshot JSON ditulis: ${resolvedPath}`);
}

function cityPriceLine(cityPrices: Record<string, number>): string {
  return CITIES.map((city) => `${city.name}=${formatRupiah(cityPrices[city.name])}`).join(", ");
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  const materialIdBySlug = new Map(
    db
      .select({ id: materials.id, slug: materials.slug })
      .from(materials)
      .all()
      .map((row) => [row.slug, row.id]),
  );
  const materialMetaBySlug = new Map<string, MaterialMeta>(
    MATERIALS.map((material) => [
      material.slug,
      { price: material.priceInReferenceCity, unit: material.unit },
    ]),
  );

  const selectedEntries = MITRA10_CATALOG.filter(
    (entry: Mitra10CatalogEntry) =>
      args.materialSlugs === null || args.materialSlugs.has(entry.materialSlug),
  );

  const snapshots: MaterialSnapshot[] = [];
  const recordedAt = new Date();
  let matchedCount = 0;

  for (const entry of selectedEntries) {
    const materialMeta = materialMetaBySlug.get(entry.materialSlug);
    if (materialMeta === undefined) {
      console.log(`[LEWAT] ${entry.materialSlug}: material tidak terdaftar di MATERIALS.`);
      continue;
    }

    let products;
    try {
      const html = await fetchSearchHtml(entry.searchQuery);
      products = parseMitra10SearchResults(html);
    } catch (error) {
      console.log(
        `[GAGAL] ${entry.materialSlug}: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }

    if (products.length === 0) {
      console.log(
        `[GAGAL] ${entry.materialSlug}: parser tidak menemukan produk untuk pencarian "${entry.searchQuery}".`,
      );
      continue;
    }

    const product = selectProductForMaterial(entry, products);
    if (product === null) {
      console.log(
        `[SKIP] ${entry.materialSlug}: tidak ada produk cocok dengan konversi satuan jelas (${products.length} hasil).`,
      );
      continue;
    }

    const unitPrice = entry.pricePerUnitOfMaterial(product)!;
    if (!isReasonablePrice(unitPrice, materialMeta.price)) {
      console.log(
        `[SKIP] ${entry.materialSlug}: "${product.name}" ${formatRupiah(unitPrice)}/${materialMeta.unit} di luar rentang kewajaran vs manual ${formatRupiah(materialMeta.price)}/${materialMeta.unit}.`,
      );
      continue;
    }

    const cityPrices: Record<string, number> = {};
    for (const city of CITIES) {
      cityPrices[city.name] = roundPriceForCity(unitPrice * city.materialIndex);
    }

    snapshots.push({
      materialSlug: entry.materialSlug,
      productName: product.name,
      productUrl: product.productUrl,
      pricePerReferenceUnit: unitPrice,
      manualReferencePrice: materialMeta.price,
      cityPrices,
    });

    if (!args.dryRun) {
      const materialId = materialIdBySlug.get(entry.materialSlug);
      if (materialId === undefined) {
        console.log(`[LEWAT] ${entry.materialSlug}: belum ada di tabel materials.`);
        continue;
      }
      for (const city of CITIES) {
        db.insert(materialPrices)
          .values({
            materialId,
            price: cityPrices[city.name],
            source: PRICE_SOURCE_SCRAPING,
            sourceName: MITRA10_SOURCE_NAME,
            city: city.name,
            recordedAt,
          })
          .run();
      }
    }

    matchedCount += 1;
    console.log(
      `[OK] ${entry.materialSlug} -> "${product.name}" | ${formatRupiah(unitPrice)}/${materialMeta.unit} (manual ${formatRupiah(materialMeta.price)}) | ${cityPriceLine(cityPrices)}`,
    );
  }

  if (!args.dryRun && snapshots.length > 0) {
    writeSnapshotFile(args.jsonPath ?? defaultSnapshotPath(recordedAt), recordedAt, snapshots);
  }

  console.log("");
  console.log(
    `Selesai: ${matchedCount}/${selectedEntries.length} material cocok dari ${MITRA10_SOURCE_NAME}.${args.dryRun ? " (dry-run, tidak ada data ditulis)" : ""}`,
  );

  if (matchedCount === 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
