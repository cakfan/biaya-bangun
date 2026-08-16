export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
  appName: string;
  appUrl: string;
};

export function getOpenRouterConfig(): OpenRouterConfig {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey === undefined || apiKey.trim() === "") {
    throw new Error(
      "OPENROUTER_API_KEY belum diatur. Tambahkan di file .env.local (lihat .env.example).",
    );
  }
  return {
    apiKey: apiKey.trim(),
    model: process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
    appName: "Estimasi Biaya Bangunan",
    appUrl: process.env.OPENROUTER_APP_URL?.trim() || "https://biaya-bangun.app",
  };
}
