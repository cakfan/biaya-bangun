import { Building2 } from "lucide-react";
import { EstimateForm } from "@/components/estimate-form";
import { loadFormOptions } from "@/lib/calculation/load-form-options";

export default function Home() {
  const options = loadFormOptions();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-5 no-print">
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
      </header>

      <EstimateForm options={options} />
    </main>
  );
}
