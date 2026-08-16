# AGENTS.md

Panduan untuk AI coding agent (Claude Code, dsb) yang bekerja di repo ini. Baca `PRD.md` untuk konteks produk dan `ROADMAP.md` untuk urutan pengerjaan.

## Prinsip Umum

- **Clean code, tidak redundan.** Jangan duplikasi logika — kalau ada pola yang muncul 2+ kali, ekstrak jadi fungsi/helper. Jangan tinggalkan kode mati (dead code), import yang tidak dipakai, atau komentar yang menjelaskan kode yang sudah jelas dari namanya sendiri.
- **Function kecil, satu tanggung jawab.** Kalau sebuah fungsi butuh lebih dari beberapa level nesting atau menangani banyak concern sekaligus, pecah jadi fungsi lebih kecil.
- **Pisahkan logika dari UI.** Fungsi kalkulasi (mis. logika AHSP) harus pure function yang bisa dites terpisah dari komponen React — lihat prinsip di `ROADMAP.md` Fase 1.
- **Tidak ada magic number/string.** Angka atau string yang punya makna bisnis (satuan, kode kategori, dst) harus jadi konstanta bernama, bukan literal langsung di tengah logika.

## Penamaan File

- Semua nama file pakai **kebab-case**: `material-price-form.tsx`, `calculate-building-cost.ts`, `work-component-table.tsx`
- Nama file harus deskriptif terhadap isinya, bukan generik (hindari `utils.ts`, `helper.ts`, `index.ts` sebagai satu-satunya penjelasan isi)
- Komponen React tetap kebab-case untuk nama file, meskipun nama komponennya sendiri PascalCase di dalam kode

## Penamaan Variabel & Fungsi

- **Manusiawi dan deskriptif** — nama harus menjelaskan maksud tanpa perlu baca implementasinya:
  - Baik: `totalMaterialCost`, `landAreaInSquareMeters`, `laborRatePerDay`, `selectedBuildingType`
  - Hindari: `data`, `val`, `temp`, `x`, `res`, `arr`, singkatan yang tidak jelas (`bldgTyp`, `mtrlPrc`)
- Boolean pakai prefix yang jelas: `isValid`, `hasDiscount`, `shouldRecalculate`
- Fungsi pakai kata kerja yang menjelaskan aksinya: `calculateComponentCost()`, `fetchMaterialPrices()`, bukan `process()` atau `handle()` tanpa konteks
- Konstanta pakai `UPPER_SNAKE_CASE`: `DEFAULT_LAND_AREA`, `MAX_MATERIAL_ITEMS`

## Struktur Proyek

- Semua source code di dalam `src/`
- Skema database (Drizzle) terpusat di satu tempat (`src/db/schema/`), dipecah per domain jika file terlalu besar — bukan satu file raksasa
- Fungsi kalkulasi inti (AHSP engine) dipisah dari route handler / server action, supaya bisa diuji tanpa perlu jalankan server

## Sebelum Selesai (checklist agent)

- [ ] Tidak ada file/variabel dengan nama generik yang tersisa
- [ ] Tidak ada duplikasi logika yang seharusnya jadi satu fungsi
- [ ] Tidak ada `console.log` atau kode debug yang tertinggal
- [ ] Tipe TypeScript eksplisit untuk data yang masuk/keluar dari fungsi kalkulasi (hindari `any`)
- [ ] Nama file & variabel konsisten dengan konvensi di atas