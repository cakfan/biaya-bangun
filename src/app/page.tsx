import { Building2, Calculator, MapPin, ShieldCheck } from "lucide-react";
import { EstimateForm } from "@/components/estimate-form";
import { loadFormOptions } from "@/lib/calculation/load-form-options";

export default function Home() {
  const options = loadFormOptions();

  return (
    <main className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent"
      />
      <header className="flex flex-col gap-6 no-print">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Building2 className="size-3.5" />
            Kalkulator Biaya Bangun
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Estimasi biaya membangun rumah
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hitung rincian biaya bahan, upah, dan overhead secara otomatis dari
            koefisien AHSP dan harga material di kota Anda.
          </p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Koefisien AHSP standar pemerintah
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            Harga sesuai kota Anda
          </li>
          <li className="flex items-center gap-2">
            <Calculator className="size-4 shrink-0 text-primary" />
            Rincian bahan & upah per pekerjaan
          </li>
        </ul>
      </header>

      <EstimateForm options={options} />
    </main>
  );
}
