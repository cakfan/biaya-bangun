import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const BUNDLED_DB = path.resolve(process.cwd(), "data", "biaya-bangun.sqlite");

function resolveDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }

  try {
    fs.mkdirSync(path.dirname(BUNDLED_DB), { recursive: true });
    fs.accessSync(path.dirname(BUNDLED_DB), fs.constants.W_OK);
    return BUNDLED_DB;
  } catch {
    // Direktori tidak bisa ditulis (Vercel serverless) — fallback ke /tmp
  }

  const tmpDb = path.resolve("/tmp", "data", "biaya-bangun.sqlite");
  try {
    fs.mkdirSync(path.dirname(tmpDb), { recursive: true });
    if (!fs.existsSync(tmpDb) && fs.existsSync(BUNDLED_DB)) {
      fs.copyFileSync(BUNDLED_DB, tmpDb);
    }
  } catch {
    // better-sqlite3 akan melempar error yang jelas jika file tidak bisa dibuka
  }
  return tmpDb;
}

const databasePath = resolveDatabasePath();
const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export { schema };
