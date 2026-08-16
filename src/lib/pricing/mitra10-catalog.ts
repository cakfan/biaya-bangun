export type Mitra10Product = {
  name: string;
  productUrl: string;
  price: number;
};

export type Mitra10CatalogEntry = {
  materialSlug: string;
  searchQuery: string;
  matchKeywords: string[];
  preferredKeywords?: string[];
  excludeKeywords?: string[];
  pricePerUnitOfMaterial: (product: Mitra10Product) => number | null;
};

const REBAR_WEIGHT_PER_SQUARE_MILLIMETER = 0.006165;
const DEFAULT_REBAR_LENGTH_METERS = 12;
const DEFAULT_C_PROFILE_LENGTH_METERS = 6;
const C_PROFILE_WEIGHT_PER_METER_BY_DIMENSION: Record<string, number> = {
  "75/0.75": 1.1,
  "75/0.65": 0.98,
  "75/0.60": 0.91,
  "100/0.75": 1.4,
  "100/0.65": 1.25,
  "100/0.60": 1.16,
  "125/0.75": 1.7,
  "125/0.65": 1.52,
  "125/0.60": 1.4,
};

export function matchQuantity(name: string, pattern: RegExp): number | null {
  const match = name.match(pattern);
  if (match === null) {
    return null;
  }
  const value = Number.parseFloat(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function parseTimberVolumeInCubicMeters(name: string): number | null {
  const match = name.toLowerCase().match(
    /(\d{1,2})\s*(?:x|×|\/)\s*(\d{1,2})\s*(?:x|×|\/)\s*(\d+(?:\.\d+)?)\s*m\b/,
  );
  if (match === null) {
    return null;
  }
  const widthInCm = Number.parseFloat(match[1]);
  const heightInCm = Number.parseFloat(match[2]);
  const lengthInMeters = Number.parseFloat(match[3].replace(",", "."));
  return (widthInCm * heightInCm * lengthInMeters) / 10_000;
}

function parseCProfileWeightInKg(product: Mitra10Product): number | null {
  const profileMatch = product.name.match(/c(\d{2,3})\b/i);
  const thicknessMatch = product.name.match(/(\d\.\d+)\s*mm/i);
  if (profileMatch === null || thicknessMatch === null) {
    return null;
  }
  const weightPerMeter = C_PROFILE_WEIGHT_PER_METER_BY_DIMENSION[
    `${profileMatch[1]}/${Number(thicknessMatch[1]).toFixed(2)}`
  ];
  if (weightPerMeter === undefined) {
    return null;
  }
  const lengthInMeters =
    matchQuantity(product.name, /x\s*(\d+)\s*m\b/i) ?? DEFAULT_C_PROFILE_LENGTH_METERS;
  return weightPerMeter * lengthInMeters;
}

function parseKeramikPiecesPerBox(name: string): number | null {
  return (
    matchQuantity(name, /isi\s*(\d+(?:[.,]\d+)?)\s*(?:pcs|bh|keping)/i) ??
    matchQuantity(name, /(\d+(?:[.,]\d+)?)\s*(?:pcs|bh|keping)\/(?:dus|box)/i)
  );
}

export function selectProductForMaterial(
  entry: Mitra10CatalogEntry,
  products: Mitra10Product[],
): Mitra10Product | null {
  const nameMatches = (product: Mitra10Product): boolean => {
    const name = product.name.toLowerCase();
    if (!entry.matchKeywords.every((keyword) => name.includes(keyword))) {
      return false;
    }
    if (entry.excludeKeywords?.some((keyword) => name.includes(keyword))) {
      return false;
    }
    return true;
  };

  const isConvertible = (product: Mitra10Product): boolean => {
    const unitPrice = entry.pricePerUnitOfMaterial(product);
    return unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0;
  };

  const matchedProducts = products.filter(nameMatches);
  const preferredProducts = entry.preferredKeywords?.length
    ? matchedProducts.filter((product) =>
        entry.preferredKeywords!.some((keyword) => product.name.toLowerCase().includes(keyword)),
      )
    : [];

  const candidates = preferredProducts.length > 0 ? preferredProducts : matchedProducts;
  return candidates.find(isConvertible) ?? null;
}

export const MITRA10_CATALOG: Mitra10CatalogEntry[] = [
  {
    materialSlug: "bata-merah",
    searchQuery: "bata merah",
    matchKeywords: ["bata", "merah"],
    excludeKeywords: ["batako", "beton", "hebel", "interlock", "cat", "pelapis", "bocor", "waterproofing", "aquatite", "seal", "paint"],
    pricePerUnitOfMaterial: (product) => {
      const perBatch =
        matchQuantity(product.name, /per\s*(\d+(?:[.,]\d+)?)\s*(?:pcs|bh|buah|pc)/i) ??
        matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*(?:pcs|bh|buah|pc)\b/i);
      const perPiece = perBatch ?? 1;
      return Math.round(product.price / perPiece);
    },
  },
  {
    materialSlug: "semen-portland",
    searchQuery: "semen",
    matchKeywords: ["semen"],
    preferredKeywords: ["gresik", "padang", "holcim", "tiga roda", "cibinong"],
    excludeKeywords: [
      "mortar",
      "instan",
      "perekat",
      "adhesive",
      "thinbed",
      "thinset",
      "render",
      "plaster",
      "skk",
      "gemilang",
      "grout",
      "rapid",
      "waterproofing",
      "acian",
      "am semen",
    ],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "pasir-pasang",
    searchQuery: "pasir pasang",
    matchKeywords: ["pasir", "pasang"],
    excludeKeywords: ["beton", "urug", "semen", "merah", "kecil", "murni"],
    pricePerUnitOfMaterial: (product) => {
      const cubicMeters =
        matchQuantity(product.name, /(\d+(?:\.\d+)?)\s*(?:m3|m³|kubik)/i) ?? 1;
      return Math.round(product.price / cubicMeters);
    },
  },
  {
    materialSlug: "pasir-beton",
    searchQuery: "pasir beton",
    matchKeywords: ["pasir", "beton"],
    excludeKeywords: ["pasang", "urug", "semen", "cor"],
    pricePerUnitOfMaterial: (product) => {
      const cubicMeters =
        matchQuantity(product.name, /(\d+(?:\.\d+)?)\s*(?:m3|m³|kubik)/i) ?? 1;
      return Math.round(product.price / cubicMeters);
    },
  },
  {
    materialSlug: "pasir-urug",
    searchQuery: "pasir urug",
    matchKeywords: ["pasir", "urug"],
    excludeKeywords: ["pasang", "beton", "semen"],
    pricePerUnitOfMaterial: (product) => {
      const cubicMeters =
        matchQuantity(product.name, /(\d+(?:\.\d+)?)\s*(?:m3|m³|kubik)/i) ?? 1;
      return Math.round(product.price / cubicMeters);
    },
  },
  {
    materialSlug: "batu-belah",
    searchQuery: "batu belah",
    matchKeywords: ["batu", "belah"],
    excludeKeywords: ["kali", "split", "kerikil", "pecah", "gunung", "sungai"],
    pricePerUnitOfMaterial: (product) => {
      const cubicMeters =
        matchQuantity(product.name, /(\d+(?:\.\d+)?)\s*(?:m3|m³|kubik)/i) ?? 1;
      return Math.round(product.price / cubicMeters);
    },
  },
  {
    materialSlug: "kerikil",
    searchQuery: "batu split",
    matchKeywords: ["split"],
    excludeKeywords: ["belah", "pasir", "semen", "gunung"],
    pricePerUnitOfMaterial: (product) => {
      const cubicMeters =
        matchQuantity(product.name, /(\d+(?:\.\d+)?)\s*(?:m3|m³|kubik)/i) ?? 1;
      return Math.round(product.price / cubicMeters);
    },
  },
  {
    materialSlug: "besi-beton",
    searchQuery: "besi beton",
    matchKeywords: ["besi", "beton"],
    excludeKeywords: [
      "ulir",
      "wiremesh",
      "hollow",
      "siku",
      "plat",
      "kanal",
      "stek",
      "pengikat",
      "bendrat",
    ],
    pricePerUnitOfMaterial: (product) => {
      const diameterInMm = matchQuantity(product.name, /(\d{1,2}(?:[.,]\d+)?)\s*mm/i);
      if (diameterInMm === null) {
        return null;
      }
      const lengthInMeters =
        matchQuantity(product.name, /x\s*(\d+)\s*m\b/i) ?? DEFAULT_REBAR_LENGTH_METERS;
      const weightInKg =
        diameterInMm ** 2 * REBAR_WEIGHT_PER_SQUARE_MILLIMETER * lengthInMeters;
      return Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "kawat-beton",
    searchQuery: "kawat bendrat",
    matchKeywords: ["kawat"],
    preferredKeywords: ["bendrat", "ikat besi"],
    excludeKeywords: ["nyamuk", "bronjong", "duri", "ayam", "strimin", "kasa", "tembaga"],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "kayu-kelas-iii",
    searchQuery: "kayu meranti",
    matchKeywords: ["kayu", "meranti"],
    excludeKeywords: ["jati", "ulim", "plywood", "multipleks", "triplek", "kaso", "reng", "list"],
    pricePerUnitOfMaterial: (product) => {
      const volumeInCubicMeters = parseTimberVolumeInCubicMeters(product.name);
      return volumeInCubicMeters === null
        ? null
        : Math.round(product.price / volumeInCubicMeters);
    },
  },
  {
    materialSlug: "kayu-kelas-ii",
    searchQuery: "kayu kaso",
    matchKeywords: ["kaso"],
    excludeKeywords: ["meranti", "reng", "plywood", "multipleks", "triplek", "gipsum"],
    pricePerUnitOfMaterial: (product) => {
      const volumeInCubicMeters = parseTimberVolumeInCubicMeters(product.name);
      return volumeInCubicMeters === null
        ? null
        : Math.round(product.price / volumeInCubicMeters);
    },
  },
  {
    materialSlug: "paku",
    searchQuery: "paku",
    matchKeywords: ["paku"],
    excludeKeywords: ["sekrup", "skrup", "rivet", "beton", "payung", "gipsum", "gips", "benang"],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg =
        matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i) ??
        (product.name.toLowerCase().includes("kiloan") ? 1 : null);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "minyak-bekisting",
    searchQuery: "minyak bekisting",
    matchKeywords: ["minyak", "bekisting"],
    pricePerUnitOfMaterial: (product) => {
      const liters = matchQuantity(product.name, /(\d+)\s*(?:l|lt|liter)/i);
      return liters === null ? null : Math.round(product.price / liters);
    },
  },
  {
    materialSlug: "genteng-keramik",
    searchQuery: "genteng keramik",
    matchKeywords: ["genteng"],
    excludeKeywords: ["beton", "aspal", "upvc", "baja", "spandek", "nok", "bubungan", "list"],
    pricePerUnitOfMaterial: (product) => {
      const perBatch = matchQuantity(product.name, /per\s*(\d+(?:[.,]\d+)?)\s*(?:pcs|bh|buah|keping)/i);
      const perPiece = perBatch ?? 1;
      return Math.round(product.price / perPiece);
    },
  },
  {
    materialSlug: "baja-ringan",
    searchQuery: "baja ringan c75",
    matchKeywords: ["baja", "ringan"],
    excludeKeywords: ["reng", "hollow", "spandek", "genteng", "kanopi", "c100"],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = parseCProfileWeightInKg(product);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "skrup",
    searchQuery: "sekrup baja ringan",
    matchKeywords: ["sekrup"],
    excludeKeywords: [],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "spandek",
    searchQuery: "spandek",
    matchKeywords: ["spandek"],
    preferredKeywords: ["0.35"],
    excludeKeywords: ["transparan", "pasir", "seng", "galvalum", "kembang", "baja"],
    pricePerUnitOfMaterial: (product) => {
      if (!/0\.35/.test(product.name)) {
        return null;
      }
      const lengthInMeters = matchQuantity(product.name, /x\s*(\d+(?:[.,]\d+)?)\s*m\b/i);
      return lengthInMeters === null ? null : Math.round(product.price / lengthInMeters);
    },
  },
  {
    materialSlug: "gypsum-board",
    searchQuery: "gypsum board",
    matchKeywords: ["gypsum", "board"],
    excludeKeywords: [
      "compound",
      "list",
      "aksesoris",
      "rangka",
      "hollow",
      "screw",
      "sekrup",
      "lem",
      "partisi",
    ],
    pricePerUnitOfMaterial: () => 1,
  },
  {
    materialSlug: "lem-kayu",
    searchQuery: "lem kayu",
    matchKeywords: ["lem", "kayu"],
    excludeKeywords: ["pvc", "kaca", "makanan", "epoxy", "instan"],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "keramik-lantai",
    searchQuery: "keramik lantai",
    matchKeywords: ["keramik"],
    preferredKeywords: ["30"],
    excludeKeywords: ["dinding", "granit", "mozaik", "vinyl", "lantai kayu", "pvc"],
    pricePerUnitOfMaterial: (product) => {
      const piecesPerBox = parseKeramikPiecesPerBox(product.name);
      return piecesPerBox === null ? null : Math.round(product.price / piecesPerBox);
    },
  },
  {
    materialSlug: "cat-tembok",
    searchQuery: "cat tembok",
    matchKeywords: ["cat", "tembok"],
    preferredKeywords: ["vinilex", "catylac", "avitex", "cendana", "mowilex"],
    excludeKeywords: [
      "dasar", "kayu", "besi", "genteng", "plamir", "efek", "transparan", "semprot",
      "pengikis", "plastik", "kuas", "roller", "ember",
      "peningkat", "kualitas", "supercement",
    ],
    pricePerUnitOfMaterial: (product) => {
      const weightInKg = matchQuantity(product.name, /(\d+(?:[.,]\d+)?)\s*kg/i);
      return weightInKg === null ? null : Math.round(product.price / weightInKg);
    },
  },
  {
    materialSlug: "rolling-door",
    searchQuery: "rolling door",
    matchKeywords: ["rolling", "door"],
    excludeKeywords: ["servis", "kunci", "remote", "sparepart", "pegas"],
    pricePerUnitOfMaterial: (product) => {
      const dimensions = product.name.toLowerCase().match(
        /(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*m\b/,
      );
      if (dimensions !== null) {
        const areaInSquareMeters = Number.parseFloat(dimensions[1]) * Number.parseFloat(dimensions[2]);
        return Math.round(product.price / areaInSquareMeters);
      }
      return 1;
    },
  },
];
