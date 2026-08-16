# Biaya Bangun — Kalkulator Estimasi Biaya Bangun Rumah

Kalkulator estimasi biaya bangun rumah berbasis metode **AHSP** (Analisa Harga Satuan Pekerjaan) dengan harga material real-time dari Mitra10.

## Fitur

- **Kalkulasi AHSP otomatis** — koefisien pekerjaan × harga satuan bahan & upah
- **Multi-tipe bangunan** — rumah tipe 36/45/54/60/120 + komponen varian
- **Multi-kota** — Surabaya, Malang, Jember, Jakarta, Bandung, Semarang, Yogyakarta
- **Inline editing** — ubah harga bahan & upah langsung di tabel hasil
- **Perbandingan borongan** — bandingkan komponen tukang AHSP vs harga borongan pasar
- **Faktor pemborosan** — konfigurasi waste factor (default 10%)
- **Print/ekspor** — cetak hasil estimasi via browser print
- **Scraping harga otomatis** — scraper Mitra10 untuk 4 material (semen, genteng, lem, cat)
- **Data harga bulanan** — snapshot JSON untuk tracking histori harga

## Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.3 (App Router, Turbopack) |
| UI | React 19, Tailwind 4, shadcn/ui |
| Database | SQLite via better-sqlite3 + Drizzle ORM |
| Runtime | Bun 1.3 |
| Testing | Bun test |
| Scraper | Custom HTML parser (Mitra10) |

## Getting Started

```bash
# Install dependencies
bun install

# Setup database + seed data
bun run db:migrate
bun run db:seed

# Jalankan dev server
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Script

| Command | Keterangan |
|---------|-----------|
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript check |
| `bun run lint` | ESLint |
| `bun run test` | Unit tests |
| `bun run db:migrate` | Jalankan Drizzle migrations |
| `bun run db:seed` | Seed database (building types, components, materials, labor, AHSP coefficients, borongan rates) |
| `bun run scrape:prices` | Scrape harga material dari Mitra10 → simpan ke DB + snapshot JSON |
| `bun run validate` | Validasi estimasi tipe 36 vs harga borongan pasar |

## Struktur

```
src/
├── app/              # Next.js App Router (pages, actions)
├── components/       # React components (UI + business)
├── db/               # Drizzle schema, migrations, seed data
├── lib/              # Domain logic (calculation, formatting, pricing)
│   └── calculation/  # AHSP engine (pure functions, testable)
├── scripts/          # CLI scripts (seed, validate, scrape)
└── __tests__/        # Unit tests
```

## Cara Kerja

1. User memilih **tipe bangunan**, **luas**, dan **kota**
2. Sistem memuat **komponen pekerjaan** beserta **koefisien AHSP** dari database
3. Koefisien dikalikan dengan **harga satuan bahan** dan **upah harian** tukang
4. Total dihitung: material + upah + overhead & profit + waste factor
5. Hasil ditampilkan dengan opsi **inline editing** untuk menyesuaikan harga
