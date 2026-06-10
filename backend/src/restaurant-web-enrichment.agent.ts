import { Injectable } from '@nestjs/common';

type WebEnrichment = {
  rating?: number;
  reviewCount?: number;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  imageUrl?: string;
  officialUrl?: string;
};

@Injectable()
export class RestaurantWebEnrichmentAgent {
  private async safeFetchText(url: string) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'nyc-family-planner/1.0' },
      });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }

  private toPriceLevel(
    value?: string,
  ): '$' | '$$' | '$$$' | '$$$$' | undefined {
    if (!value) return undefined;
    const dollarCount = (value.match(/\$/g) ?? []).length;
    if (dollarCount <= 0) return undefined;
    if (dollarCount === 1) return '$';
    if (dollarCount === 2) return '$$';
    if (dollarCount === 3) return '$$$';
    return '$$$$';
  }

  private parseJsonLd(html: string) {
    const blocks =
      html.match(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      ) ?? [];
    const parsed: unknown[] = [];
    for (const block of blocks) {
      const raw = block
        .replace(/<script[^>]*>/i, '')
        .replace(/<\/script>/i, '')
        .trim();
      if (!raw) continue;
      try {
        const obj: unknown = JSON.parse(raw);
        if (Array.isArray(obj)) parsed.push(...(obj as unknown[]));
        else parsed.push(obj);
      } catch {
        // ignore malformed block
      }
    }
    return parsed;
  }

  private pickRestaurantSchema(items: unknown[]) {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const t = o['@type'];
      const typeValues = Array.isArray(t) ? t : [t];
      const normalized = typeValues.map((v) => String(v).toLowerCase());
      if (
        normalized.some((v) =>
          ['restaurant', 'foodestablishment', 'localbusiness'].includes(v),
        )
      ) {
        return o;
      }
    }
    return null;
  }

  async enrichFromUrl(url?: string): Promise<WebEnrichment> {
    if (!url) return {};
    const html = await this.safeFetchText(url);
    if (!html) return {};

    const jsonLd = this.parseJsonLd(html);
    const schema = this.pickRestaurantSchema(jsonLd);
    if (!schema) return {};

    const aggregate = schema.aggregateRating as
      | Record<string, unknown>
      | undefined;
    const ratingRaw = aggregate?.ratingValue;
    const countRaw = aggregate?.reviewCount;
    const priceRaw = schema.priceRange;
    const imageRaw = schema.image;
    const urlRaw = schema.url;

    const rating = Number(ratingRaw);
    const reviewCount = Number(countRaw);
    const imageUrl =
      typeof imageRaw === 'string'
        ? imageRaw
        : Array.isArray(imageRaw) && typeof imageRaw[0] === 'string'
          ? imageRaw[0]
          : undefined;

    return {
      rating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
      reviewCount:
        Number.isFinite(reviewCount) && reviewCount > 0
          ? reviewCount
          : undefined,
      priceLevel: this.toPriceLevel(
        typeof priceRaw === 'string' ? priceRaw : undefined,
      ),
      imageUrl,
      officialUrl: typeof urlRaw === 'string' ? urlRaw : undefined,
    };
  }
}
