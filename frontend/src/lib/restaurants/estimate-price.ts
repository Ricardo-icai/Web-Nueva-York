export function estimatePricePerPersonFromLevel(
  priceLevel?: 1 | 2 | 3 | 4 | null,
): number | null {
  if (priceLevel === 1) return 15;
  if (priceLevel === 2) return 30;
  if (priceLevel === 3) return 60;
  if (priceLevel === 4) return 100;
  return null;
}

export function estimatePricePerPersonFromSignals(input: {
  priceLevel?: 1 | 2 | 3 | 4 | null;
  cuisine?: string[];
  categories?: string[];
  editorialTags?: string[];
  name?: string;
}) {
  const fromLevel = estimatePricePerPersonFromLevel(input.priceLevel ?? null);
  if (fromLevel) return fromLevel;

  const hay = [
    input.name ?? "",
    ...(input.cuisine ?? []),
    ...(input.categories ?? []),
    ...(input.editorialTags ?? []),
  ].join(" ").toLowerCase();

  if (hay.includes("fine") || hay.includes("steakhouse") || hay.includes("sushi") || hay.includes("omakase")) return 90;
  if (hay.includes("rooftop") || hay.includes("premium") || hay.includes("worth_the_hype")) return 60;
  if (hay.includes("italian") || hay.includes("korean") || hay.includes("japanese") || hay.includes("seafood")) return 45;
  if (hay.includes("burger") || hay.includes("pizza") || hay.includes("mexican") || hay.includes("diner")) return 25;
  if (hay.includes("bagel") || hay.includes("bakery") || hay.includes("dessert") || hay.includes("donut")) return 15;

  return 30;
}

export function isInPriceRange(price: number | null | undefined, range: string) {
  if (!range) return true;
  if (typeof price !== "number") return false;
  if (range === "under-20") return price < 20;
  if (range === "20-35") return price >= 20 && price <= 35;
  if (range === "35-60") return price > 35 && price <= 60;
  if (range === "60-100") return price > 60 && price <= 100;
  if (range === "over-100") return price > 100;
  return true;
}
