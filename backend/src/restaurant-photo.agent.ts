import { Injectable } from '@nestjs/common';

@Injectable()
export class RestaurantPhotoAgent {
  private async safeFetchJson<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'nyc-family-planner/1.0' } });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async findPhotoForRestaurant(name: string) {
    const wikiApi =
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&prop=pageimages|info&inprop=url&pithumbsize=1200&generator=search&gsrnamespace=0` +
      `&gsrlimit=1&gsrsearch=${encodeURIComponent(`${name} New York restaurant`)}`;

    const wiki = await this.safeFetchJson<{
      query?: {
        pages?: Record<string, { thumbnail?: { source?: string }; fullurl?: string }>;
      };
    }>(wikiApi);
    const first = wiki?.query?.pages ? Object.values(wiki.query.pages)[0] : undefined;

    return {
      name,
      imageUrl: first?.thumbnail?.source ?? null,
      imageSource: first?.fullurl ?? null,
    };
  }
}

