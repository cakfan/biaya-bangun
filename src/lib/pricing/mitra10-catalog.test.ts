import { describe, expect, test } from "bun:test";
import {
  MITRA10_CATALOG,
  selectProductForMaterial,
} from "./mitra10-catalog";
import type { Mitra10Product } from "./mitra10-catalog";

function entryFor(materialSlug: string) {
  const entry = MITRA10_CATALOG.find((candidate) => candidate.materialSlug === materialSlug);
  if (entry === undefined) {
    throw new Error(`Katalog tidak memiliki material "${materialSlug}".`);
  }
  return entry;
}

const product = (name: string, price: number): Mitra10Product => ({
  name,
  productUrl: `https://www.mitra10.com/product/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  price,
});

describe("MITRA10_CATALOG - konversi satuan", () => {
  test("semen per sak: harga 50 kg dibagi 50", () => {
    expect(entryFor("semen-portland").pricePerUnitOfMaterial(product("Semen Gresik 50 Kg", 70000))).toBe(1400);
  });

  test("besi beton polos: harga per batang dibagi berat 12 m", () => {
    const unitPrice = entryFor("besi-beton").pricePerUnitOfMaterial(
      product("Besi Beton Polos 10 mm x 12 m", 110000),
    );
    const expected = Math.round(110000 / (10 ** 2 * 0.006165 * 12));
    expect(unitPrice).toBe(expected);
  });

  test("pasir pasang tanpa volume dianggap 1 m3", () => {
    expect(entryFor("pasir-pasang").pricePerUnitOfMaterial(product("Pasir Pasang", 320000))).toBe(320000);
  });

  test("bata merah per 1000 pcs dibagi 1000", () => {
    expect(entryFor("bata-merah").pricePerUnitOfMaterial(product("Bata Merah 1000 Pcs", 850000))).toBe(850);
  });

  test("keramik per dus isi 11 pcs dibagi 11", () => {
    expect(
      entryFor("keramik-lantai").pricePerUnitOfMaterial(product("Keramik 30x30 1 dus isi 11 pcs", 130000)),
    ).toBe(Math.round(130000 / 11));
  });

  test("spandek 0.35mm panjang 3m dibagi 3 m2", () => {
    expect(
      entryFor("spandek").pricePerUnitOfMaterial(product("Spandek Zincalume 0.35 mm x 3 m", 100000)),
    ).toBe(Math.round(100000 / 3));
  });

  test("kayu meranti dihitung volume batang", () => {
    expect(
      entryFor("kayu-kelas-iii").pricePerUnitOfMaterial(product("Kayu Meranti 4 x 6 x 4 m", 76800)),
    ).toBe(Math.round(76800 / ((4 * 6 * 4) / 10000)));
  });

  test("baja ringan C75 0.75mm x 6m dihitung berat profil", () => {
    expect(
      entryFor("baja-ringan").pricePerUnitOfMaterial(product("Baja Ringan C75 0.75 mm x 6 m", 110000)),
    ).toBe(Math.round(110000 / (1.1 * 6)));
  });

  test("sekrup tanpa berat per kg tidak bisa dikonversi", () => {
    expect(entryFor("skrup").pricePerUnitOfMaterial(product("Sekrup Baja Ringan 100 Pcs", 50000))).toBeNull();
  });
});

describe("selectProductForMaterial", () => {
  test("memilih produk yang memenuhi kata kunci dan bisa dikonversi", () => {
    const selected = selectProductForMaterial(entryFor("semen-portland"), [
      product("Mortar Acian MU-200 40 Kg", 90000),
      product("Semen Gresik 50 Kg", 70000),
    ]);

    expect(selected?.name).toBe("Semen Gresik 50 Kg");
  });

  test("mengutamakan kata kunci preferensi untuk spandek 0.35mm", () => {
    const selected = selectProductForMaterial(entryFor("spandek"), [
      product("Spandek Zincalume 0.30 mm x 3 m", 90000),
      product("Spandek Zincalume 0.35 mm x 3 m", 100000),
    ]);

    expect(selected?.name).toContain("0.35");
  });

  test("menghindari produk yang masuk daftar pengecualian", () => {
    const selected = selectProductForMaterial(entryFor("keramik-lantai"), [
      product("Keramik Dinding 25x40 1 dus isi 15 pcs", 120000),
    ]);

    expect(selected).toBeNull();
  });

  test("mengembalikan null bila tidak ada produk yang cocok", () => {
    expect(selectProductForMaterial(entryFor("bata-merah"), [product("Batako Press", 4000)])).toBeNull();
  });
});
