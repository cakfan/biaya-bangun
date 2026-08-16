import { EstimateForm } from "@/components/estimate-form";
import { loadFormOptions } from "@/lib/calculation/load-form-options";

export default function Home() {
  const options = loadFormOptions();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kalkulator Estimasi Biaya Bangunan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hitung perkiraan biaya membangun rumah berdasarkan koefisien AHSP, bahan, dan upah tukang.
        </p>
      </header>
      <EstimateForm options={options} />
    </main>
  );
}
