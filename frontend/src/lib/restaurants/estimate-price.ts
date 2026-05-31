export function estimatePricePerPersonUsd(priceLevel?: 1 | 2 | 3 | 4): number | undefined {
  if (!priceLevel) return undefined;
  if (priceLevel === 1) return 15;
  if (priceLevel === 2) return 30;
  if (priceLevel === 3) return 60;
  return 100;
}

