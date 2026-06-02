import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';

type FoodType = 'burgers' | 'pizza';

type CuratedFoodRecord = {
  id?: string;
  name?: string;
  cuisine?: string[];
  categories?: string[];
  address?: string | null;
  neighborhood?: string | null;
  borough?: string | null;
  lat?: number | null;
  lng?: number | null;
  officialWebsite?: string | null;
  googleMapsUrl?: string;
  imageUrl?: string;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$' | 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd?: number | null;
  whyItMatters?: string;
  signatureDishes?: string[];
  signaturePizzas?: string[];
  editorialTags?: string[];
  badges?: string[];
  qualityScore?: number;
  nycReputationScore?: number;
};

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

  private findWorkspaceRoot() {
    const cwd = process.cwd();
    return cwd.endsWith('backend') ? join(cwd, '..') : cwd;
  }

  private priceToSymbol(price?: CuratedFoodRecord['priceLevel']) {
    if (price === 1 || price === '$') return '$';
    if (price === 2 || price === '$$') return '$$';
    if (price === 3 || price === '$$$') return '$$$';
    if (price === 4 || price === '$$$$') return '$$$$';
    return '$$';
  }

  private estimateAveragePrice(price?: CuratedFoodRecord['priceLevel']) {
    if (price === 1 || price === '$') return 15;
    if (price === 2 || price === '$$') return 30;
    if (price === 3 || price === '$$$') return 60;
    if (price === 4 || price === '$$$$') return 100;
    return 25;
  }

  private async readCuratedPizzerias() {
    if (process.env.DISABLE_CURATED_PIZZA_AGENT === '1') return [];
    const file = join(
      this.findWorkspaceRoot(),
      'frontend',
      'src',
      'data',
      'restaurants',
      'nyc-pizza-hall-of-fame.json',
    );

    try {
      const parsed = JSON.parse(await readFile(file, 'utf8')) as CuratedFoodRecord[];
      return parsed
        .filter((item) => item.name)
        .map((item) => ({
          id: item.id ?? item.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: item.name!,
          cuisine: item.cuisine?.join(', ') ?? 'Pizza',
          address: item.address ?? [item.neighborhood, item.borough, 'New York'].filter(Boolean).join(', '),
          rating: 0,
          reviewCount: 0,
          priceLevel: this.priceToSymbol(item.priceLevel),
          avgPricePerPersonUsd: item.averagePricePerPersonUsd ?? this.estimateAveragePrice(item.priceLevel),
          imageUrl: item.imageUrl ?? '',
          mapsUrl:
            item.googleMapsUrl ??
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} New York`)}`,
          sourceName: 'pizza-agent-curated',
          sourceUrl: item.officialWebsite ?? item.googleMapsUrl,
          agentNote: item.whyItMatters ?? 'Curated by the pizza specialist agent.',
          signatureDishes: item.signaturePizzas ?? item.signatureDishes ?? [],
          editorialTags: item.editorialTags ?? item.badges ?? [],
          qualityScore: item.qualityScore ?? item.nycReputationScore ?? 80,
        }));
    } catch {
      return [];
    }
  }

  async discoverByFoodType(foodType: FoodType) {
    const [discovery, restaurants, curatedPizzerias] = await Promise.all([
      this.discoveryAgent.discoverRestaurants(),
      this.appService.getRestaurants({ maxResults: 1200 }),
      foodType === 'pizza' ? this.readCuratedPizzerias() : Promise.resolve([]),
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
        avgPricePerPersonUsd: this.estimateAveragePrice(m?.priceLevel ?? '$$'),
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
        avgPricePerPersonUsd: this.estimateAveragePrice(p.priceLevel),
        imageUrl: p.image,
        mapsUrl: p.mapsUrl,
        sourceName: 'places-api',
        sourceUrl: p.officialUrl,
      }));

    const items = [...curatedPizzerias, ...merged, ...extra].filter(
      (item, idx, arr) => arr.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === idx,
    );
    return {
      agent: foodType === 'burgers' ? 'burger-agent' : 'pizza-agent',
      generatedAt: new Date().toISOString(),
      total: items.length,
      notes:
        foodType === 'pizza'
          ? 'Pizza agent includes curated best-pizzeria annotations plus live discovery/API matches.'
          : 'Burger agent includes live discovery/API matches.',
      items,
    };
  }
}
