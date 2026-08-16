import type { Mitra10Product } from "./mitra10-catalog";

const CARD_START_PATTERN = /<div class="jss(?:170 jsx-\d+|158 grid-item)\s*"/;
const PRODUCT_NAME_PATTERN =
  /gtm_mitra10_cta_product" href="https:\/\/www\.mitra10\.com\/product\/[^"]+"><p[^>]*>([^<]+)<\/p>/;
const PRODUCT_URL_PATTERN = /href="https:\/\/www\.mitra10\.com\/product\/([^"]+)"/;
const PRODUCT_PRICE_PATTERN = /price__final[^>]*>(?:IDR\u00A0)?([\d,]+)<\/span>/;
const NEXT_JS_TEXT_MARKERS = /<!-- -->/g;

export function parseMitra10SearchResults(html: string): Mitra10Product[] {
  const products: Mitra10Product[] = [];
  const seenProductUrls = new Set<string>();

  for (const chunk of html.split(CARD_START_PATTERN).slice(1)) {
    const nameMatch = chunk.match(PRODUCT_NAME_PATTERN);
    const priceMatch = chunk.match(PRODUCT_PRICE_PATTERN);
    if (nameMatch === null || priceMatch === null) {
      continue;
    }

    const slug = chunk.match(PRODUCT_URL_PATTERN)?.[1] ?? "";
    if (slug !== "" && seenProductUrls.has(slug)) {
      continue;
    }
    if (slug !== "") {
      seenProductUrls.add(slug);
    }

    const name = nameMatch[1].replace(NEXT_JS_TEXT_MARKERS, "").replace(/\s+/g, " ").trim();
    const price = Number.parseInt(priceMatch[1].replace(/,/g, ""), 10);
    if (name === "" || !Number.isFinite(price) || price <= 0) {
      continue;
    }

    products.push({
      name,
      productUrl: `https://www.mitra10.com/product/${slug}`,
      price,
    });
  }

  return products;
}
