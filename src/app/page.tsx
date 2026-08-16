import { Building2 } from "lucide-react";
import { EstimateForm } from "@/components/estimate-form";
import { loadFormOptions } from "@/lib/calculation/load-form-options";

export default function Home() {
  const options = loadFormOptions();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:py-14">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Building2 className="size-3.5" />
          Kalkulator biaya bangun · metode AHSP
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Berapa estimasi biaya membangun rumah Anda?
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Pilih tipe bangunan, luas, dan kota — rincian biaya bahan, upah, dan overhead dihitung
            otomatis dari koefisien AHSP dan harga material di kota Anda.
          </p>
        </div>
      </header>

      <EstimateForm options={options} />
    </main>
  );
}
