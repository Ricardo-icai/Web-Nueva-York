import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';

type FoodType = 'burgers' | 'pizza';

@Injectable()
export class SpecializedFoodAgent {
  constructor(
    private readonly appService: AppService,
    private readonly discoveryAgent: RestaurantDiscoveryAgent,
  ) {}

  private isMatch(foodType: FoodType, text: string) {
    const t = text.toLowerCase();
    if (foodType === 'burgers') {
      return t.includes('burger') || t.includes('hamburg');
    }
    return t.includes('pizza') || t.includes('pizzeria');
  }

  async discoverByFoodType(foodType: FoodType) {
    const [discovery, restaurants] = await Promise.all([
      this.discoveryAgent.discoverRestaurants(),
      this.appService.getRestaurants({ maxResults: 1200 }),
    ]);

    const fromDiscovery = (discovery.items ?? []).filter((item) => {
      const sourceText = `${item.name} ${item.cuisine ?? ''}`;
      return this.isMatch(foodType, sourceText);
    });

    const fromPlaces = (restaurants.items ?? []).filter((item) =>
      this.isMatch(foodType, `${item.name} ${item.cuisine}`),
    );

    const byName = new Map(fromPlaces.map((p) => [p.name.toLowerCase(), p]));
    const merged = fromDiscovery.map((d) => {
      const m = byName.get(d.name.toLowerCase());
      return {
        id: d.id,
        name: d.name,
        cuisine: d.cuisine ?? m?.cuisine ?? 'Restaurant',
        address: d.address ?? m?.address ?? 'New York',
        rating: m?.rating ?? d.rating ?? 0,
        reviewCount: m?.reviewCount ?? d.reviewCount ?? 0,
        priceLevel: m?.priceLevel ?? '$$',
        imageUrl: d.imageUrl ?? m?.image ?? '',
        mapsUrl:
          m?.mapsUrl ??
          (d.lat && d.lng
            ? `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name} New York`)}`),
        sourceName: d.sourceName,
        sourceUrl: d.sourceUrl,
      };
    });

    const existingNames = new Set(merged.map((m) => m.name.toLowerCase()));
    const extra = fromPlaces
      .filter((p) => !existingNames.has(p.name.toLowerCase()))
      .map((p) => ({
        id: p.id,
        name: p.name,
        cuisine: p.cuisine,
        address: p.address,
        rating: p.rating,
        reviewCount: p.reviewCount,
        priceLevel: p.priceLevel,
        imageUrl: p.image,
        mapsUrl: p.mapsUrl,
        sourceName: 'places-api',
        sourceUrl: p.officialUrl,
      }));

    const items = [...merged, ...extra];
    return {
      agent: foodType === 'burgers' ? 'burger-agent' : 'pizza-agent',
      generatedAt: new Date().toISOString(),
      total: items.length,
      items,
    };
  }
}

