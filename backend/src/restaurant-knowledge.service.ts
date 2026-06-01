import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent, type RestaurantLead } from './restaurant-discovery.agent';
import { RestaurantWebEnrichmentAgent } from './restaurant-web-enrichment.agent';

type RestaurantRecord = {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  cuisine?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  avgPricePerPersonUsd?: number;
  mapsUrl?: string;
  officialUrl?: string;
  sourceNames: string[];
  sourceUrls: string[];
  sections: string[];
  updatedAt: string;
};

type KnowledgeDb = {
  generatedAt: string;
  stats: {
    total: number;
    withImage: number;
    withReviews: number;
    withPrice: number;
  };
  pipeline: {
    discoveryFound: number;
    enrichmentFound: number;
    consolidated: number;
  };
  records: RestaurantRecord[];
};

@Injectable()
export class RestaurantKnowledgeService {
  private readonly dbPath = join(process.cwd(), 'data', 'restaurants-knowledge-db.json');

  constructor(
    private readonly appService: AppService,
    private readonly discoveryAgent: RestaurantDiscoveryAgent,
    private readonly webEnrichmentAgent: RestaurantWebEnrichmentAgent,
  ) {}

  private estimatePrice(priceLevel?: '$' | '$$' | '$$$' | '$$$$') {
    if (priceLevel === '$') return 15;
    if (priceLevel === '$$') return 30;
    if (priceLevel === '$$$') return 55;
    if (priceLevel === '$$$$') return 90;
    return undefined;
  }

  private normalizeKey(name: string, address?: string) {
    return `${name.toLowerCase().trim()}|${(address ?? '').toLowerCase().trim()}`;
  }

  private mergeRecord(base: RestaurantRecord, lead: RestaurantLead, now: string): RestaurantRecord {
    const sourceNames = new Set(base.sourceNames);
    const sourceUrls = new Set(base.sourceUrls);
    sourceNames.add(lead.sourceName);
    sourceUrls.add(lead.sourceUrl);
    const sections = new Set([...(base.sections ?? []), ...(lead.sections ?? [])]);
    return {
      ...base,
      address: base.address ?? lead.address,
      lat: base.lat ?? lead.lat,
      lng: base.lng ?? lead.lng,
      cuisine: base.cuisine ?? lead.cuisine,
      imageUrl: base.imageUrl ?? lead.imageUrl,
      sourceNames: Array.from(sourceNames),
      sourceUrls: Array.from(sourceUrls),
      sections: Array.from(sections),
      updatedAt: now,
    };
  }

  private async saveDb(db: KnowledgeDb) {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    await writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
  }

  async readDb(): Promise<KnowledgeDb | null> {
    try {
      const raw = await readFile(this.dbPath, 'utf-8');
      return JSON.parse(raw) as KnowledgeDb;
    } catch {
      return null;
    }
  }

  async syncAll() {
    const now = new Date().toISOString();

    // Agent 1: discovery (news/directories)
    const discovery = await this.discoveryAgent.discoverRestaurants();
    const leads = discovery.items ?? [];

    // Agent 2: places enrichment (reviews, pricing, image, links)
    const enrichment = await this.appService.getRestaurants({ maxResults: 1000 });
    const enriched = enrichment.items ?? [];
    const enrichedByName = new Map(enriched.map((r) => [r.name.toLowerCase().trim(), r]));

    // Agent 3: consolidation
    const byKey = new Map<string, RestaurantRecord>();

    for (const lead of leads) {
      const match = enrichedByName.get(lead.name.toLowerCase().trim());
      const record: RestaurantRecord = {
        id: lead.id,
        name: lead.name,
        address: lead.address ?? match?.address,
        lat: lead.lat ?? match?.lat,
        lng: lead.lng ?? match?.lng,
        cuisine: lead.cuisine ?? match?.cuisine,
        imageUrl: lead.imageUrl ?? match?.image,
        rating: match?.rating ?? lead.rating,
        reviewCount: match?.reviewCount ?? lead.reviewCount,
        priceLevel: match?.priceLevel,
        avgPricePerPersonUsd: this.estimatePrice(match?.priceLevel),
        mapsUrl: match?.mapsUrl,
        officialUrl: match?.officialUrl ?? lead.sourceUrl,
        sourceNames: [lead.sourceName],
        sourceUrls: [lead.sourceUrl],
        sections: lead.sections ?? [],
        updatedAt: now,
      };

      const key = this.normalizeKey(record.name, record.address);
      const existing = byKey.get(key);
      byKey.set(key, existing ? this.mergeRecord(existing, lead, now) : record);
    }

    for (const item of enriched) {
      const key = this.normalizeKey(item.name, item.address);
      if (byKey.has(key)) {
        const current = byKey.get(key) as RestaurantRecord;
        byKey.set(key, {
          ...current,
          imageUrl: current.imageUrl ?? item.image,
          rating: current.rating ?? item.rating,
          reviewCount: current.reviewCount ?? item.reviewCount,
          priceLevel: current.priceLevel ?? item.priceLevel,
          avgPricePerPersonUsd: current.avgPricePerPersonUsd ?? this.estimatePrice(item.priceLevel),
          mapsUrl: current.mapsUrl ?? item.mapsUrl,
          officialUrl: current.officialUrl ?? item.officialUrl,
          updatedAt: now,
        });
      } else {
        byKey.set(key, {
          id: item.id,
          name: item.name,
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          cuisine: item.cuisine,
          imageUrl: item.image,
          rating: item.rating,
          reviewCount: item.reviewCount,
          priceLevel: item.priceLevel,
          avgPricePerPersonUsd: this.estimatePrice(item.priceLevel),
          mapsUrl: item.mapsUrl,
          officialUrl: item.officialUrl,
          sourceNames: ['places-api'],
          sourceUrls: [item.officialUrl],
          sections: [],
          updatedAt: now,
        });
      }
    }

    const records = Array.from(byKey.values());

    // Agent 4: web extraction agent (reviews/stars/price/image from local websites)
    const webEnrichLimit = Math.min(250, records.length);
    for (let i = 0; i < webEnrichLimit; i += 10) {
      const chunk = records.slice(i, i + 10);
      const enrichedChunk = await Promise.all(
        chunk.map(async (record) => {
          const urlToVisit = record.officialUrl || record.sourceUrls[0];
          const web = await this.webEnrichmentAgent.enrichFromUrl(urlToVisit);
          return { record, web };
        }),
      );
      for (const { record, web } of enrichedChunk) {
        record.rating = record.rating ?? web.rating;
        record.reviewCount = record.reviewCount ?? web.reviewCount;
        record.priceLevel = record.priceLevel ?? web.priceLevel;
        record.avgPricePerPersonUsd =
          record.avgPricePerPersonUsd ?? this.estimatePrice(record.priceLevel);
        record.imageUrl = record.imageUrl ?? web.imageUrl;
        record.officialUrl = record.officialUrl ?? web.officialUrl;
      }
    }

    const db: KnowledgeDb = {
      generatedAt: now,
      pipeline: {
        discoveryFound: leads.length,
        enrichmentFound: enriched.length,
        consolidated: records.length,
      },
      stats: {
        total: records.length,
        withImage: records.filter((r) => !!r.imageUrl).length,
        withReviews: records.filter((r) => (r.reviewCount ?? 0) > 0 && (r.rating ?? 0) > 0).length,
        withPrice: records.filter((r) => !!r.priceLevel).length,
      },
      records,
    };

    await this.saveDb(db);
    return db;
  }
}
