export function roundPriceForCity(value: number): number {
  const step = value < 100_000 ? 100 : value < 1_000_000 ? 1_000 : 5_000;
  return Math.round(value / step) * step;
}
