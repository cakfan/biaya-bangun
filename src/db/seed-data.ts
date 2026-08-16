export type CitySeed = {
  name: string;
  materialIndex: number;
  laborIndex: number;
};

export const CITIES: CitySeed[] = [
  { name: "Surabaya", materialIndex: 1, laborIndex: 1 },
  { name: "Malang", materialIndex: 0.98, laborIndex: 0.95 },
  { name: "Jember", materialIndex: 0.92, laborIndex: 0.88 },
  { name: "Jakarta", materialIndex: 1.15, laborIndex: 1.25 },
  { name: "Bandung", materialIndex: 1.05, laborIndex: 1.1 },
  { name: "Semarang", materialIndex: 0.95, laborIndex: 0.95 },
  { name: "Yogyakarta", materialIndex: 0.9, laborIndex: 0.9 },
];

export const CITY_SURABAYA = CITIES[0].name;
export const PRICE_SOURCE_MANUAL = "manual";

export const DEFAULT_OVERHEAD_PROFIT_RATE = 0.1;

export type WorkComponentSeed = {
  slug: string;
  name: string;
  unit: string;
  sortOrder: number;
  volumeMultiplierPerSquareMeter: number;
};

const HOUSE_COMPONENTS: WorkComponentSeed[] = [
  {
    slug: "pekerjaan-persiapan",
    name: "Pekerjaan Persiapan",
    unit: "m2",
    sortOrder: 1,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "galian-tanah",
    name: "Galian Tanah Pondasi",
    unit: "m3",
    sortOrder: 2,
    volumeMultiplierPerSquareMeter: 0.4,
  },
  {
    slug: "urugan-pasir",
    name: "Urugan Pasir Bawah Pondasi",
    unit: "m3",
    sortOrder: 3,
    volumeMultiplierPerSquareMeter: 0.09,
  },
  {
    slug: "pondasi-batu-kali",
    name: "Pasangan Pondasi Batu Kali (1 PC : 4 PP)",
    unit: "m3",
    sortOrder: 4,
    volumeMultiplierPerSquareMeter: 0.3,
  },
  {
    slug: "sloof-beton",
    name: "Sloof Beton Bertulang (200 kg besi)",
    unit: "m3",
    sortOrder: 5,
    volumeMultiplierPerSquareMeter: 0.047,
  },
  {
    slug: "kolom-beton",
    name: "Kolom Beton Bertulang (300 kg besi)",
    unit: "m3",
    sortOrder: 6,
    volumeMultiplierPerSquareMeter: 0.028,
  },
  {
    slug: "ring-balok",
    name: "Ring Balok Beton Bertulang (10 x 15) cm",
    unit: "m1",
    sortOrder: 7,
    volumeMultiplierPerSquareMeter: 1.53,
  },
  {
    slug: "dinding-bata",
    name: "Dinding Bata Merah 1/2 Batu (1 SP : 4 PP)",
    unit: "m2",
    sortOrder: 8,
    volumeMultiplierPerSquareMeter: 3.5,
  },
  {
    slug: "plesteran-acian",
    name: "Plesteran & Acian Dinding",
    unit: "m2",
    sortOrder: 9,
    volumeMultiplierPerSquareMeter: 6.7,
  },
  {
    slug: "lantai-keramik",
    name: "Lantai Keramik 30 x 30 cm",
    unit: "m2",
    sortOrder: 10,
    volumeMultiplierPerSquareMeter: 1.1,
  },
  {
    slug: "atap",
    name: "Pekerjaan Atap (Rangka + Penutup)",
    unit: "m2",
    sortOrder: 11,
    volumeMultiplierPerSquareMeter: 1.7,
  },
  {
    slug: "plafon",
    name: "Rangka Langit-Langit Kayu + Gypsum 9 mm",
    unit: "m2",
    sortOrder: 12,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "kusen-pintu",
    name: "Kusen Pintu & Jendela Kayu Kelas II",
    unit: "m3",
    sortOrder: 13,
    volumeMultiplierPerSquareMeter: 0.008,
  },
  {
    slug: "daun-pintu",
    name: "Daun Pintu Panel Kayu Kelas II",
    unit: "m2",
    sortOrder: 14,
    volumeMultiplierPerSquareMeter: 0.17,
  },
  {
    slug: "pengecatan",
    name: "Pengecatan Tembok Baru (Cat Dasar + 2 Lapis)",
    unit: "m2",
    sortOrder: 15,
    volumeMultiplierPerSquareMeter: 6.7,
  },
];

const GARASI_COMPONENTS: WorkComponentSeed[] = [
  {
    slug: "pekerjaan-persiapan",
    name: "Pekerjaan Persiapan",
    unit: "m2",
    sortOrder: 1,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "galian-tanah",
    name: "Galian Tanah Pondasi",
    unit: "m3",
    sortOrder: 2,
    volumeMultiplierPerSquareMeter: 0.3,
  },
  {
    slug: "urugan-pasir",
    name: "Urugan Pasir Bawah Pondasi",
    unit: "m3",
    sortOrder: 3,
    volumeMultiplierPerSquareMeter: 0.06,
  },
  {
    slug: "pondasi-batu-kali",
    name: "Pasangan Pondasi Batu Kali (1 PC : 4 PP)",
    unit: "m3",
    sortOrder: 4,
    volumeMultiplierPerSquareMeter: 0.2,
  },
  {
    slug: "sloof-beton",
    name: "Sloof Beton Bertulang (200 kg besi)",
    unit: "m3",
    sortOrder: 5,
    volumeMultiplierPerSquareMeter: 0.04,
  },
  {
    slug: "kolom-beton",
    name: "Kolom Beton Bertulang (300 kg besi)",
    unit: "m3",
    sortOrder: 6,
    volumeMultiplierPerSquareMeter: 0.018,
  },
  {
    slug: "ring-balok",
    name: "Ring Balok Beton Bertulang (10 x 15) cm",
    unit: "m1",
    sortOrder: 7,
    volumeMultiplierPerSquareMeter: 1.2,
  },
  {
    slug: "dinding-bata",
    name: "Dinding Bata Merah 1/2 Batu (1 SP : 4 PP)",
    unit: "m2",
    sortOrder: 8,
    volumeMultiplierPerSquareMeter: 2.2,
  },
  {
    slug: "plesteran-acian",
    name: "Plesteran & Acian Dinding",
    unit: "m2",
    sortOrder: 9,
    volumeMultiplierPerSquareMeter: 4.2,
  },
  {
    slug: "lantai-rabat-beton",
    name: "Lantai Rabat Beton (t = 10 cm)",
    unit: "m2",
    sortOrder: 10,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "atap",
    name: "Pekerjaan Atap (Rangka + Penutup)",
    unit: "m2",
    sortOrder: 11,
    volumeMultiplierPerSquareMeter: 1.7,
  },
  {
    slug: "kusen-pintu",
    name: "Kusen Pintu & Jendela Kayu Kelas II",
    unit: "m3",
    sortOrder: 12,
    volumeMultiplierPerSquareMeter: 0.005,
  },
  {
    slug: "daun-pintu",
    name: "Daun Pintu Panel Kayu Kelas II",
    unit: "m2",
    sortOrder: 13,
    volumeMultiplierPerSquareMeter: 0.1,
  },
  {
    slug: "pintu-garasi",
    name: "Rolling Door Besi",
    unit: "m2",
    sortOrder: 14,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "pengecatan",
    name: "Pengecatan Tembok Baru (Cat Dasar + 2 Lapis)",
    unit: "m2",
    sortOrder: 15,
    volumeMultiplierPerSquareMeter: 2.2,
  },
];

const PARKIRAN_COMPONENTS: WorkComponentSeed[] = [
  {
    slug: "pekerjaan-persiapan",
    name: "Pekerjaan Persiapan",
    unit: "m2",
    sortOrder: 1,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "galian-tanah",
    name: "Galian Tanah Pondasi",
    unit: "m3",
    sortOrder: 2,
    volumeMultiplierPerSquareMeter: 0.15,
  },
  {
    slug: "urugan-pasir",
    name: "Urugan Pasir Bawah Pondasi",
    unit: "m3",
    sortOrder: 3,
    volumeMultiplierPerSquareMeter: 0.05,
  },
  {
    slug: "pondasi-batu-kali",
    name: "Pasangan Pondasi Batu Kali (1 PC : 4 PP)",
    unit: "m3",
    sortOrder: 4,
    volumeMultiplierPerSquareMeter: 0.15,
  },
  {
    slug: "kolom-beton",
    name: "Kolom Beton Bertulang (300 kg besi)",
    unit: "m3",
    sortOrder: 5,
    volumeMultiplierPerSquareMeter: 0.018,
  },
  {
    slug: "ring-balok",
    name: "Ring Balok Beton Bertulang (10 x 15) cm",
    unit: "m1",
    sortOrder: 6,
    volumeMultiplierPerSquareMeter: 1.1,
  },
  {
    slug: "lantai-rabat-beton",
    name: "Lantai Rabat Beton (t = 10 cm)",
    unit: "m2",
    sortOrder: 7,
    volumeMultiplierPerSquareMeter: 1,
  },
  {
    slug: "atap",
    name: "Pekerjaan Atap (Rangka + Penutup)",
    unit: "m2",
    sortOrder: 8,
    volumeMultiplierPerSquareMeter: 1.6,
  },
];

export type BuildingTypeSeed = {
  slug: string;
  name: string;
  description: string;
  defaultBuildingArea: number;
  components: WorkComponentSeed[];
};

export const BUILDING_TYPES: BuildingTypeSeed[] = [
  {
    slug: "rumah-tipe-21",
    name: "Rumah Tipe 21",
    description:
      "Rumah minimalis satu lantai dengan luas bangunan 21 m². Komponen volume mengikuti proporsi standar RAB rumah tipe 36 yang diskalakan ke luas lebih kecil.",
    defaultBuildingArea: 21,
    components: HOUSE_COMPONENTS,
  },
  {
    slug: "rumah-tipe-36",
    name: "Rumah Tipe 36",
    description:
      "Rumah tinggal satu lantai dengan luas bangunan 36 m². Komponen volume mengikuti standar RAB rumah tipe 36 (1 lantai, pondasi batu kali, struktur beton bertulang, atap genteng keramik).",
    defaultBuildingArea: 36,
    components: HOUSE_COMPONENTS,
  },
  {
    slug: "rumah-tipe-54",
    name: "Rumah Tipe 54",
    description:
      "Rumah tinggal satu lantai dengan luas bangunan 54 m². Komponen volume mengikuti proporsi standar RAB rumah tipe 36 yang diskalakan ke luas lebih besar.",
    defaultBuildingArea: 54,
    components: HOUSE_COMPONENTS,
  },
  {
    slug: "garasi",
    name: "Garasi",
    description:
      "Garasi tertutup untuk satu mobil dengan luas standar 3 x 6 m. Dinding sebagian, lantai rabat beton, pintu rolling door, dan atap.",
    defaultBuildingArea: 18,
    components: GARASI_COMPONENTS,
  },
  {
    slug: "parkiran",
    name: "Parkiran / Carport",
    description:
      "Carport terbuka untuk dua mobil dengan atap dan kolom struktur, tanpa dinding. Lantai rabat beton dan atap spandek.",
    defaultBuildingArea: 18,
    components: PARKIRAN_COMPONENTS,
  },
];

export type MaterialSeed = {
  slug: string;
  name: string;
  unit: string;
  category: "struktur" | "dinding" | "atap" | "finishing" | "utilitas";
  priceInReferenceCity: number;
};

export const MATERIALS: MaterialSeed[] = [
  { slug: "bata-merah", name: "Bata Merah", unit: "bh", category: "dinding", priceInReferenceCity: 750 },
  { slug: "semen-portland", name: "Semen Portland", unit: "kg", category: "struktur", priceInReferenceCity: 1400 },
  { slug: "pasir-pasang", name: "Pasir Pasang", unit: "m3", category: "struktur", priceInReferenceCity: 320000 },
  { slug: "pasir-beton", name: "Pasir Beton", unit: "m3", category: "struktur", priceInReferenceCity: 350000 },
  { slug: "pasir-urug", name: "Pasir Urug", unit: "m3", category: "struktur", priceInReferenceCity: 250000 },
  { slug: "batu-belah", name: "Batu Belah", unit: "m3", category: "struktur", priceInReferenceCity: 180000 },
  { slug: "kerikil", name: "Kerikil / Split", unit: "m3", category: "struktur", priceInReferenceCity: 380000 },
  { slug: "besi-beton", name: "Besi Beton Polos", unit: "kg", category: "struktur", priceInReferenceCity: 16500 },
  { slug: "kawat-beton", name: "Kawat Beton", unit: "kg", category: "struktur", priceInReferenceCity: 25000 },
  { slug: "kayu-kelas-iii", name: "Kayu Kelas III (Bekisting)", unit: "m3", category: "struktur", priceInReferenceCity: 2400000 },
  { slug: "kayu-kelas-ii", name: "Kayu Kelas II (Kaso / Reng / Balok)", unit: "m3", category: "struktur", priceInReferenceCity: 3200000 },
  { slug: "paku", name: "Paku", unit: "kg", category: "struktur", priceInReferenceCity: 18000 },
  { slug: "minyak-bekisting", name: "Minyak Bekisting", unit: "l", category: "struktur", priceInReferenceCity: 25000 },
  { slug: "genteng-keramik", name: "Genteng Keramik", unit: "bh", category: "atap", priceInReferenceCity: 7500 },
  { slug: "baja-ringan", name: "Rangka Baja Ringan (Profil C)", unit: "kg", category: "atap", priceInReferenceCity: 25000 },
  { slug: "skrup", name: "Sekrup Baja Ringan", unit: "kg", category: "atap", priceInReferenceCity: 25000 },
  { slug: "spandek", name: "Spandek Zincalume 0.35 mm", unit: "m2", category: "atap", priceInReferenceCity: 30000 },
  { slug: "gypsum-board", name: "Gypsum Board 9 mm", unit: "lbr", category: "finishing", priceInReferenceCity: 85000 },
  { slug: "lem-kayu", name: "Lem Kayu", unit: "kg", category: "finishing", priceInReferenceCity: 40000 },
  { slug: "keramik-lantai", name: "Keramik Lantai 30 x 30 cm", unit: "bh", category: "finishing", priceInReferenceCity: 12000 },
  { slug: "cat-tembok", name: "Cat Tembok", unit: "kg", category: "finishing", priceInReferenceCity: 42000 },
  { slug: "rolling-door", name: "Rolling Door Besi 0.4 mm", unit: "m2", category: "utilitas", priceInReferenceCity: 450000 },
];

export type LaborTypeSeed = {
  slug: string;
  name: string;
  dailyRateInReferenceCity: number;
};

export const LABOR_TYPES: LaborTypeSeed[] = [
  { slug: "pekerja", name: "Pekerja", dailyRateInReferenceCity: 120000 },
  { slug: "tukang-batu", name: "Tukang Batu", dailyRateInReferenceCity: 175000 },
  { slug: "tukang-kayu", name: "Tukang Kayu", dailyRateInReferenceCity: 175000 },
  { slug: "tukang-besi", name: "Tukang Besi", dailyRateInReferenceCity: 175000 },
  { slug: "tukang-cat", name: "Tukang Cat", dailyRateInReferenceCity: 175000 },
  { slug: "kepala-tukang", name: "Kepala Tukang", dailyRateInReferenceCity: 200000 },
  { slug: "mandor", name: "Mandor", dailyRateInReferenceCity: 250000 },
];

export type MaterialCoefficientRow = {
  componentSlug: string;
  materialSlug: string;
  coefficient: number;
};

export type LaborCoefficientRow = {
  componentSlug: string;
  laborTypeSlug: string;
  coefficient: number;
};

export const MATERIAL_COEFFICIENTS: MaterialCoefficientRow[] = [
  { componentSlug: "urugan-pasir", materialSlug: "pasir-urug", coefficient: 1.2 },
  { componentSlug: "pondasi-batu-kali", materialSlug: "batu-belah", coefficient: 1.2 },
  { componentSlug: "pondasi-batu-kali", materialSlug: "semen-portland", coefficient: 163 },
  { componentSlug: "pondasi-batu-kali", materialSlug: "pasir-pasang", coefficient: 0.52 },
  { componentSlug: "sloof-beton", materialSlug: "kayu-kelas-iii", coefficient: 0.27 },
  { componentSlug: "sloof-beton", materialSlug: "paku", coefficient: 2 },
  { componentSlug: "sloof-beton", materialSlug: "minyak-bekisting", coefficient: 0.6 },
  { componentSlug: "sloof-beton", materialSlug: "besi-beton", coefficient: 210 },
  { componentSlug: "sloof-beton", materialSlug: "kawat-beton", coefficient: 3 },
  { componentSlug: "sloof-beton", materialSlug: "semen-portland", coefficient: 336 },
  { componentSlug: "sloof-beton", materialSlug: "pasir-beton", coefficient: 0.54 },
  { componentSlug: "sloof-beton", materialSlug: "kerikil", coefficient: 0.81 },
  { componentSlug: "kolom-beton", materialSlug: "kayu-kelas-iii", coefficient: 0.4 },
  { componentSlug: "kolom-beton", materialSlug: "paku", coefficient: 4 },
  { componentSlug: "kolom-beton", materialSlug: "minyak-bekisting", coefficient: 2 },
  { componentSlug: "kolom-beton", materialSlug: "besi-beton", coefficient: 315 },
  { componentSlug: "kolom-beton", materialSlug: "kawat-beton", coefficient: 4.5 },
  { componentSlug: "kolom-beton", materialSlug: "semen-portland", coefficient: 336 },
  { componentSlug: "kolom-beton", materialSlug: "pasir-beton", coefficient: 0.54 },
  { componentSlug: "kolom-beton", materialSlug: "kerikil", coefficient: 0.81 },
  { componentSlug: "ring-balok", materialSlug: "kayu-kelas-iii", coefficient: 0.003 },
  { componentSlug: "ring-balok", materialSlug: "paku", coefficient: 0.02 },
  { componentSlug: "ring-balok", materialSlug: "besi-beton", coefficient: 3.6 },
  { componentSlug: "ring-balok", materialSlug: "kawat-beton", coefficient: 0.05 },
  { componentSlug: "ring-balok", materialSlug: "semen-portland", coefficient: 5.5 },
  { componentSlug: "ring-balok", materialSlug: "pasir-beton", coefficient: 0.009 },
  { componentSlug: "ring-balok", materialSlug: "kerikil", coefficient: 0.015 },
  { componentSlug: "dinding-bata", materialSlug: "bata-merah", coefficient: 71.91 },
  { componentSlug: "dinding-bata", materialSlug: "semen-portland", coefficient: 11.5 },
  { componentSlug: "dinding-bata", materialSlug: "pasir-pasang", coefficient: 0.043 },
  { componentSlug: "plesteran-acian", materialSlug: "semen-portland", coefficient: 9.5 },
  { componentSlug: "plesteran-acian", materialSlug: "pasir-pasang", coefficient: 0.026 },
  { componentSlug: "lantai-keramik", materialSlug: "keramik-lantai", coefficient: 11.67 },
  { componentSlug: "lantai-keramik", materialSlug: "semen-portland", coefficient: 13.6 },
  { componentSlug: "lantai-keramik", materialSlug: "pasir-pasang", coefficient: 0.045 },
  { componentSlug: "lantai-rabat-beton", materialSlug: "semen-portland", coefficient: 32 },
  { componentSlug: "lantai-rabat-beton", materialSlug: "pasir-beton", coefficient: 0.05 },
  { componentSlug: "lantai-rabat-beton", materialSlug: "kerikil", coefficient: 0.083 },
  { componentSlug: "atap", materialSlug: "kayu-kelas-ii", coefficient: 0.05 },
  { componentSlug: "atap", materialSlug: "paku", coefficient: 0.25 },
  { componentSlug: "atap", materialSlug: "genteng-keramik", coefficient: 12.4 },
  { componentSlug: "plafon", materialSlug: "kayu-kelas-ii", coefficient: 0.0154 },
  { componentSlug: "plafon", materialSlug: "paku", coefficient: 0.2 },
  { componentSlug: "plafon", materialSlug: "gypsum-board", coefficient: 0.4 },
  { componentSlug: "kusen-pintu", materialSlug: "kayu-kelas-ii", coefficient: 1.2 },
  { componentSlug: "kusen-pintu", materialSlug: "paku", coefficient: 1.25 },
  { componentSlug: "kusen-pintu", materialSlug: "lem-kayu", coefficient: 1 },
  { componentSlug: "daun-pintu", materialSlug: "kayu-kelas-ii", coefficient: 0.04 },
  { componentSlug: "daun-pintu", materialSlug: "lem-kayu", coefficient: 0.5 },
  { componentSlug: "pintu-garasi", materialSlug: "rolling-door", coefficient: 1 },
  { componentSlug: "pengecatan", materialSlug: "cat-tembok", coefficient: 0.3 },
];

export const LABOR_COEFFICIENTS: LaborCoefficientRow[] = [
  { componentSlug: "pekerjaan-persiapan", laborTypeSlug: "pekerja", coefficient: 0.1 },
  { componentSlug: "pekerjaan-persiapan", laborTypeSlug: "mandor", coefficient: 0.005 },
  { componentSlug: "galian-tanah", laborTypeSlug: "pekerja", coefficient: 0.75 },
  { componentSlug: "galian-tanah", laborTypeSlug: "mandor", coefficient: 0.025 },
  { componentSlug: "urugan-pasir", laborTypeSlug: "pekerja", coefficient: 0.3 },
  { componentSlug: "urugan-pasir", laborTypeSlug: "mandor", coefficient: 0.1 },
  { componentSlug: "pondasi-batu-kali", laborTypeSlug: "pekerja", coefficient: 1.5 },
  { componentSlug: "pondasi-batu-kali", laborTypeSlug: "tukang-batu", coefficient: 0.75 },
  { componentSlug: "pondasi-batu-kali", laborTypeSlug: "kepala-tukang", coefficient: 0.075 },
  { componentSlug: "pondasi-batu-kali", laborTypeSlug: "mandor", coefficient: 0.075 },
  { componentSlug: "sloof-beton", laborTypeSlug: "pekerja", coefficient: 5.65 },
  { componentSlug: "sloof-beton", laborTypeSlug: "tukang-batu", coefficient: 0.275 },
  { componentSlug: "sloof-beton", laborTypeSlug: "tukang-kayu", coefficient: 1.56 },
  { componentSlug: "sloof-beton", laborTypeSlug: "tukang-besi", coefficient: 1.4 },
  { componentSlug: "sloof-beton", laborTypeSlug: "kepala-tukang", coefficient: 0.323 },
  { componentSlug: "sloof-beton", laborTypeSlug: "mandor", coefficient: 0.283 },
  { componentSlug: "kolom-beton", laborTypeSlug: "pekerja", coefficient: 7.05 },
  { componentSlug: "kolom-beton", laborTypeSlug: "tukang-batu", coefficient: 0.275 },
  { componentSlug: "kolom-beton", laborTypeSlug: "tukang-kayu", coefficient: 1.65 },
  { componentSlug: "kolom-beton", laborTypeSlug: "tukang-besi", coefficient: 2.1 },
  { componentSlug: "kolom-beton", laborTypeSlug: "kepala-tukang", coefficient: 0.403 },
  { componentSlug: "kolom-beton", laborTypeSlug: "mandor", coefficient: 0.353 },
  { componentSlug: "ring-balok", laborTypeSlug: "pekerja", coefficient: 0.297 },
  { componentSlug: "ring-balok", laborTypeSlug: "tukang-batu", coefficient: 0.033 },
  { componentSlug: "ring-balok", laborTypeSlug: "tukang-kayu", coefficient: 0.033 },
  { componentSlug: "ring-balok", laborTypeSlug: "tukang-besi", coefficient: 0.033 },
  { componentSlug: "ring-balok", laborTypeSlug: "kepala-tukang", coefficient: 0.01 },
  { componentSlug: "ring-balok", laborTypeSlug: "mandor", coefficient: 0.015 },
  { componentSlug: "dinding-bata", laborTypeSlug: "pekerja", coefficient: 0.2 },
  { componentSlug: "dinding-bata", laborTypeSlug: "tukang-batu", coefficient: 0.1 },
  { componentSlug: "dinding-bata", laborTypeSlug: "kepala-tukang", coefficient: 0.01 },
  { componentSlug: "dinding-bata", laborTypeSlug: "mandor", coefficient: 0.0033 },
  { componentSlug: "plesteran-acian", laborTypeSlug: "pekerja", coefficient: 0.5 },
  { componentSlug: "plesteran-acian", laborTypeSlug: "tukang-batu", coefficient: 0.25 },
  { componentSlug: "plesteran-acian", laborTypeSlug: "kepala-tukang", coefficient: 0.025 },
  { componentSlug: "plesteran-acian", laborTypeSlug: "mandor", coefficient: 0.025 },
  { componentSlug: "lantai-keramik", laborTypeSlug: "pekerja", coefficient: 0.143 },
  { componentSlug: "lantai-keramik", laborTypeSlug: "tukang-batu", coefficient: 0.071 },
  { componentSlug: "lantai-keramik", laborTypeSlug: "kepala-tukang", coefficient: 0.007 },
  { componentSlug: "lantai-keramik", laborTypeSlug: "mandor", coefficient: 0.002 },
  { componentSlug: "lantai-rabat-beton", laborTypeSlug: "pekerja", coefficient: 0.25 },
  { componentSlug: "lantai-rabat-beton", laborTypeSlug: "tukang-batu", coefficient: 0.1 },
  { componentSlug: "lantai-rabat-beton", laborTypeSlug: "kepala-tukang", coefficient: 0.01 },
  { componentSlug: "lantai-rabat-beton", laborTypeSlug: "mandor", coefficient: 0.0125 },
  { componentSlug: "atap", laborTypeSlug: "pekerja", coefficient: 0.12 },
  { componentSlug: "atap", laborTypeSlug: "tukang-kayu", coefficient: 0.1 },
  { componentSlug: "atap", laborTypeSlug: "tukang-batu", coefficient: 0.05 },
  { componentSlug: "atap", laborTypeSlug: "kepala-tukang", coefficient: 0.015 },
  { componentSlug: "atap", laborTypeSlug: "mandor", coefficient: 0.008 },
  { componentSlug: "plafon", laborTypeSlug: "pekerja", coefficient: 0.2 },
  { componentSlug: "plafon", laborTypeSlug: "tukang-kayu", coefficient: 0.4 },
  { componentSlug: "plafon", laborTypeSlug: "kepala-tukang", coefficient: 0.04 },
  { componentSlug: "plafon", laborTypeSlug: "mandor", coefficient: 0.02 },
  { componentSlug: "kusen-pintu", laborTypeSlug: "pekerja", coefficient: 6 },
  { componentSlug: "kusen-pintu", laborTypeSlug: "tukang-kayu", coefficient: 18 },
  { componentSlug: "kusen-pintu", laborTypeSlug: "kepala-tukang", coefficient: 1.8 },
  { componentSlug: "kusen-pintu", laborTypeSlug: "mandor", coefficient: 0.3 },
  { componentSlug: "daun-pintu", laborTypeSlug: "pekerja", coefficient: 1 },
  { componentSlug: "daun-pintu", laborTypeSlug: "tukang-kayu", coefficient: 3 },
  { componentSlug: "daun-pintu", laborTypeSlug: "kepala-tukang", coefficient: 0.3 },
  { componentSlug: "daun-pintu", laborTypeSlug: "mandor", coefficient: 0.05 },
  { componentSlug: "pintu-garasi", laborTypeSlug: "pekerja", coefficient: 0.2 },
  { componentSlug: "pintu-garasi", laborTypeSlug: "tukang-besi", coefficient: 0.3 },
  { componentSlug: "pintu-garasi", laborTypeSlug: "kepala-tukang", coefficient: 0.02 },
  { componentSlug: "pintu-garasi", laborTypeSlug: "mandor", coefficient: 0.01 },
  { componentSlug: "pengecatan", laborTypeSlug: "pekerja", coefficient: 0.028 },
  { componentSlug: "pengecatan", laborTypeSlug: "tukang-cat", coefficient: 0.042 },
  { componentSlug: "pengecatan", laborTypeSlug: "kepala-tukang", coefficient: 0.0042 },
  { componentSlug: "pengecatan", laborTypeSlug: "mandor", coefficient: 0.001 },
];

export type ComponentVariantSeed = {
  componentSlug: string;
  slug: string | null;
  name: string;
};

export const COMPONENT_VARIANTS: ComponentVariantSeed[] = [
  { componentSlug: "atap", slug: null, name: "Genteng Keramik + Rangka Kayu Kelas II" },
  { componentSlug: "atap", slug: "spandek-baja-ringan", name: "Spandek + Rangka Baja Ringan" },
];

export type VariantMaterialCoefficientRow = {
  componentSlug: string;
  variantSlug: string;
  materialSlug: string;
  coefficient: number;
};

export const VARIANT_MATERIAL_COEFFICIENTS: VariantMaterialCoefficientRow[] = [
  {
    componentSlug: "atap",
    variantSlug: "spandek-baja-ringan",
    materialSlug: "baja-ringan",
    coefficient: 3.5,
  },
  {
    componentSlug: "atap",
    variantSlug: "spandek-baja-ringan",
    materialSlug: "skrup",
    coefficient: 0.1,
  },
  {
    componentSlug: "atap",
    variantSlug: "spandek-baja-ringan",
    materialSlug: "spandek",
    coefficient: 1.2,
  },
];

export type BoronganRateSeed = {
  componentSlug: string;
  pricePerUnit: number;
  sourceName: string;
};

export const BORONGAN_RATES: BoronganRateSeed[] = [
  {
    componentSlug: "dinding-bata",
    pricePerUnit: 90000,
    sourceName: "Sinar Mas Land / detikProperti 2025 (upah borongan pasang bata merah)",
  },
  {
    componentSlug: "plesteran-acian",
    pricePerUnit: 75000,
    sourceName: "Sinar Mas Land / detikProperti 2025 (upah borongan plester + aci)",
  },
  {
    componentSlug: "lantai-keramik",
    pricePerUnit: 45000,
    sourceName: "Sinar Mas Land / detikProperti 2025 (upah borongan keramik 30x30)",
  },
  {
    componentSlug: "pengecatan",
    pricePerUnit: 30000,
    sourceName: "detikProperti 2025 (rata-rata upah borongan cat interior 20rb + eksterior 50rb)",
  },
  {
    componentSlug: "plafon",
    pricePerUnit: 40000,
    sourceName: "Sinar Mas Land / detikProperti 2025 (upah borongan pasang plafon gypsum)",
  },
];
