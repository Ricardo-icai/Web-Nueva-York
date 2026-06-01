export function estimatePricePerPersonFromLevel(
  priceLevel?: 1 | 2 | 3 | 4 | null,
): number | null {
  if (priceLevel === 1) return 15;
  if (priceLevel === 2) return 30;
  if (priceLevel === 3) return 60;
  if (priceLevel === 4) return 100;
  return null;
}

