import { describe, expect, test } from "bun:test";
import { parseMitra10SearchResults } from "./mitra10-scraper";

function categoryCardMarkup(name: string, price: string, slug = "contoh-produk"): string {
  return `
<div class="jss170 jsx-3186645125 ">
  <div class="jss172"><a class="jss185 gtm_mitra10_cta_product" href="https://www.mitra10.com/product/${slug}"><img alt="${name}" class="jss173"/></a></div>
  <div class="jss174"><div class="jss175" style="height:95px">
    <div class="jss208"><div class="jss209 priceShowDisccount" style="flex-direction:column"><div class="jss210">
      <span class="MuiTypography-root jss205 price__old MuiTypography-caption MuiTypography-alignLeft"><strike>IDR\u00A0562,000</strike></span>
      <span class="MuiTypography-root jss205 price__final jss206 MuiTypography-caption MuiTypography-alignLeft">IDR\u00A0${price}</span>
    </div></div></div>
    <a class="gtm_mitra10_cta_product" href="https://www.mitra10.com/product/${slug}"><p class="MuiTypography-root jss176 MuiTypography-body1 MuiTypography-alignLeft">${name}</p></a>
  </div></div>
</div>`;
}

function searchCardMarkup(name: string, price: string, slug: string): string {
  return `
<div class="jss158 grid-item">
  <div class="jss177"></div>
  <div class="jss160"><a class="jss173 gtm_mitra10_cta_product" href="https://www.mitra10.com/product/${slug}"><div>gambar</div></a></div>
  <div class="jss162"><div class="jss163" style="height:95px">
    <span class="MuiTypography-root jss193 price__final MuiTypography-caption MuiTypography-alignLeft">IDR\u00A0${price}</span>
    <a class="gtm_mitra10_cta_product" href="https://www.mitra10.com/product/${slug}"><p class="MuiTypography-root jss164 MuiTypography-body1 MuiTypography-alignLeft">${name}</p></a>
  </div></div>
</div>`;
}

describe("parseMitra10SearchResults", () => {
  test("mengambil nama produk dan harga final dari kartu kategori", () => {
    const html = `<div class="MuiGrid-root jss168 grid">${categoryCardMarkup(
      "Semen Gresik 50 Kg",
      "70,000",
      "semen-gresik",
    )}${categoryCardMarkup("Sika Top 107 Seal 25 KG Set", "392,894", "sika-top-107")}</div>`;

    const products = parseMitra10SearchResults(html);

    expect(products).toHaveLength(2);
    expect(products[0]).toEqual({
      name: "Semen Gresik 50 Kg",
      productUrl: "https://www.mitra10.com/product/semen-gresik",
      price: 70000,
    });
    expect(products[1].price).toBe(392894);
  });

  test("mengambil nama produk dan harga dari kartu hasil pencarian", () => {
    const html = `<div class="MuiGrid-root jss156 grid">${searchCardMarkup(
      "Scg Semen Instan 40 Kg",
      "83,250",
      "scg-thinbed-mortar-40-kg",
    )}</div>`;

    const products = parseMitra10SearchResults(html);

    expect(products).toEqual([
      {
        name: "Scg Semen Instan 40 Kg",
        productUrl: "https://www.mitra10.com/product/scg-thinbed-mortar-40-kg",
        price: 83250,
      },
    ]);
  });

  test("membaca harga tanpa markup diskon (tanpa price__old)", () => {
    const html = `<div class="jss170 jsx-1"><span class="jss205 price__final MuiTypography-caption">IDR\u00A0243,300</span><a class="gtm_mitra10_cta_product" href="https://www.mitra10.com/product/cat-tembok"><p class="jss176">Cat Tembok 5 Kg</p></a></div>`;

    const products = parseMitra10SearchResults(html);

    expect(products).toEqual([
      { name: "Cat Tembok 5 Kg", productUrl: "https://www.mitra10.com/product/cat-tembok", price: 243300 },
    ]);
  });

  test("mengabaikan blok tanpa harga dan menduplikasi produk yang sama", () => {
    const html = `${categoryCardMarkup("Pasir Pasang 1 M3", "320,000", "pasir-pasang")}<div class="jss170 jsx-2">tanpa harga</div>${categoryCardMarkup("Pasir Pasang 1 M3", "320,000", "pasir-pasang")}`;

    const products = parseMitra10SearchResults(html);

    expect(products).toHaveLength(1);
  });
});
