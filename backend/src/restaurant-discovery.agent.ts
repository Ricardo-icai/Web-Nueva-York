import { Injectable } from '@nestjs/common';

export type RestaurantLead = {
  id: string;
  name: string;
  sourceType: 'directory' | 'news';
  sourceName: string;
  sourceUrl: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  cuisine?: string;
  sections?: string[];
  sectionReason?: string;
  discoveredAt: string;
};
type SectionSummary = {
  key: string;
  label: string;
  count: number;
};

type NycOpenDataRow = {
  camis?: string;
  dba?: string;
  cuisine_description?: string;
  building?: string;
  street?: string;
  boro?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
};

@Injectable()
export class RestaurantDiscoveryAgent {
  private readonly sectionRules: Array<{
    key: string;
    label: string;
    keywords: string[];
  }> = [
    { key: 'trending', label: 'De Moda', keywords: ['viral', 'trending', 'tiktok', 'instagram'] },
    { key: 'family', label: 'Familiar', keywords: ['family', 'kids', 'child', 'group'] },
    { key: 'budget', label: 'Barato', keywords: ['cheap', 'budget', 'under', 'affordable'] },
    { key: 'fine-dining', label: 'Alta Cocina', keywords: ['michelin', 'tasting', 'fine dining'] },
    { key: 'brunch', label: 'Brunch', keywords: ['brunch', 'breakfast'] },
    { key: 'date-night', label: 'Cita', keywords: ['romantic', 'date night', 'anniversary'] },
    { key: 'late-night', label: 'Noche', keywords: ['late-night', 'open late', 'after hours'] },
  ];
  private readonly rssFeeds = [
    { name: 'Eater NY', url: 'https://ny.eater.com/rss/index.xml' },
    { name: 'Time Out New York', url: 'https://www.timeout.com/newyork/rss' },
    { name: 'The Infatuation NYC', url: 'https://www.theinfatuation.com/new-york/feed' },
  ];

  private async safeFetchText(url: string) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'nyc-family-planner/1.0' } });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }

  private async safeFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(url, init);
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  private pickRestaurantsFromTitle(title: string) {
    const cleaned = title.replace(/[|:]/g, ' ').trim();
    const parts = cleaned.split(/,| and | y /i).map((p) => p.trim());
    return parts.filter((p) => p.length >= 3 && /[A-Z]/.test(p)).slice(0, 2);
  }

  private inferSectionsFromText(text: string) {
    const lowered = text.toLowerCase();
    return this.sectionRules
      .filter((rule) => rule.keywords.some((k) => lowered.includes(k)))
      .map((rule) => rule.key);
  }

  private inferSectionsFromCuisine(cuisine?: string) {
    const c = (cuisine ?? '').toLowerCase();
    const tags: string[] = [];
    if (c.includes('coffee') || c.includes('bakery')) tags.push('brunch', 'budget');
    if (c.includes('pizza') || c.includes('burger') || c.includes('fast')) tags.push('budget');
    if (c.includes('french') || c.includes('japanese') || c.includes('steak')) tags.push('date-night');
    return Array.from(new Set(tags));
  }

  private async discoverFromRss(): Promise<RestaurantLead[]> {
    const leads: RestaurantLead[] = [];
    for (const feed of this.rssFeeds) {
      const xml = await this.safeFetchText(feed.url);
      if (!xml) continue;

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
      const linkRegex = /<link>(.*?)<\/link>/;

      let match: RegExpExecArray | null = itemRegex.exec(xml);
      let count = 0;
      while (match && count < 25) {
        const block = match[1];
        const titleMatch = block.match(titleRegex);
        const linkMatch = block.match(linkRegex);
        const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? '').trim();
        const url = (linkMatch?.[1] ?? '').trim();
        if (title && url) {
          const sections = this.inferSectionsFromText(title);
          const picks = this.pickRestaurantsFromTitle(title);
          for (const pick of picks) {
            leads.push({
              id: `news-${feed.name}-${pick}-${count}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              name: pick,
              sourceType: 'news',
              sourceName: feed.name,
              sourceUrl: url,
              sections,
              sectionReason: `Clasificado por titular en ${feed.name}`,
              discoveredAt: new Date().toISOString(),
            });
          }
        }
        count += 1;
        match = itemRegex.exec(xml);
      }
    }
    return leads;
  }

  private async discoverFromNycOpenData(): Promise<RestaurantLead[]> {
    const url =
      'https://data.cityofnewyork.us/resource/43nn-pn8j.json?$select=camis,dba,cuisine_description,building,street,boro,zipcode,latitude,longitude&$where=latitude%20IS%20NOT%20NULL%20AND%20longitude%20IS%20NOT%20NULL&$limit=2000';
    const rows = await this.safeFetchJson<NycOpenDataRow[]>(url);
    if (!rows) return [];

    const out: RestaurantLead[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const camis = row.camis?.trim();
      const name = row.dba?.trim();
      const lat = Number(row.latitude);
      const lng = Number(row.longitude);
      if (!camis || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (seen.has(camis)) continue;
      seen.add(camis);
      const street = [row.building, row.street].filter(Boolean).join(' ').trim();
      const city = row.boro?.trim() || 'New York';
      const zip = row.zipcode?.trim() ?? '';
      out.push({
        id: `nyc-${camis}`,
        name,
        sourceType: 'directory',
        sourceName: 'NYC Open Data',
        sourceUrl: 'https://data.cityofnewyork.us/',
        cuisine: row.cuisine_description?.trim() || 'Restaurant',
        sections: this.inferSectionsFromCuisine(row.cuisine_description),
        sectionReason: 'Clasificado por tipo de cocina del directorio',
        address: `${street}${street ? ', ' : ''}${city}${zip ? ` ${zip}` : ''}`,
        lat,
        lng,
        imageUrl:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
        discoveredAt: new Date().toISOString(),
      });
      if (out.length >= 1000) break;
    }

    return out;
  }

  private dedupe(leads: RestaurantLead[]) {
    const byKey = new Map<string, RestaurantLead>();
    for (const lead of leads) {
      const key = `${lead.name.toLowerCase()}-${(lead.address ?? '').toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, lead);
    }
    return Array.from(byKey.values());
  }

  private buildSectionSummary(items: RestaurantLead[]): SectionSummary[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const section of item.sections ?? []) {
        counts.set(section, (counts.get(section) ?? 0) + 1);
      }
    }
    const labels = new Map(this.sectionRules.map((r) => [r.key, r.label]));
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count, label: labels.get(key) ?? key }))
      .sort((a, b) => b.count - a.count);
  }

  async discoverRestaurants() {
    const [directory, news] = await Promise.all([
      this.discoverFromNycOpenData(),
      this.discoverFromRss(),
    ]);

    const items = this.dedupe([...directory, ...news]);
    return {
      agent: 'restaurant-discovery',
      generatedAt: new Date().toISOString(),
      total: items.length,
      sources: {
        directories: ['NYC Open Data'],
        mediaFeeds: this.rssFeeds.map((s) => s.name),
      },
      sections: this.buildSectionSummary(items),
      items,
    };
  }
}
