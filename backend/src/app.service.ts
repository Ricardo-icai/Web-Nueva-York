import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Pace = 'relajado' | 'normal' | 'intenso';

export interface AccommodationInput {
  address: string;
  lat: number;
  lng: number;
}

export interface TripInput {
  name: string;
  nationality: string;
  language: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: Pace;
  accommodation: AccommodationInput;
}

export interface Trip extends TripInput {
  id: string;
  createdAt: string;
}

export interface WeatherDay {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface RestaurantItem {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  image: string;
  officialUrl: string;
  mapsUrl: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

interface RestaurantFilters {
  price?: string;
  maxDistanceKm?: number;
  minRating?: number;
  cuisine?: string;
  hotelLat?: number;
  hotelLng?: number;
  maxResults?: number;
}

type NycOpenDataRow = {
  camis?: string;
  dba?: string;
  boro?: string;
  cuisine_description?: string;
  building?: string;
  street?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
  grade?: string;
};

@Injectable()
export class AppService {
  private readonly trips = new Map<string, Trip>();
  private readonly fallbackRestaurants: RestaurantItem[] = [
    {
      id: 'levain-noho',
      name: 'Levain Bakery NoHo',
      area: 'NoHo',
      cuisine: 'Bakery',
      priceLevel: '$$',
      image:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://levainbakery.com/',
      mapsUrl: 'https://maps.google.com/?q=340+Lafayette+St,+New+York,+NY+10012',
      address: '340 Lafayette St, New York, NY 10012',
      rating: 4.6,
      reviewCount: 4200,
      lat: 40.7276,
      lng: -73.9938,
    },
    {
      id: 'katz',
      name: "Katz's Delicatessen",
      area: 'Lower East Side',
      cuisine: 'Jewish Deli',
      priceLevel: '$$',
      image:
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://katzsdelicatessen.com/',
      mapsUrl: 'https://maps.google.com/?q=205+E+Houston+St,+New+York,+NY+10002',
      address: '205 E Houston St, New York, NY 10002',
      rating: 4.5,
      reviewCount: 16500,
      lat: 40.7223,
      lng: -73.9874,
    },
    {
      id: 'lilia',
      name: 'Lilia',
      area: 'Williamsburg',
      cuisine: 'Italian',
      priceLevel: '$$$',
      image:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://www.lilianewyork.com/',
      mapsUrl: 'https://maps.google.com/?q=567+Union+Ave,+Brooklyn,+NY+11211',
      address: '567 Union Ave, Brooklyn, NY 11211',
      rating: 4.7,
      reviewCount: 2300,
      lat: 40.7142,
      lng: -73.9501,
    },
    {
      id: 'gramercy-tavern',
      name: 'Gramercy Tavern',
      area: 'Flatiron',
      cuisine: 'American',
      priceLevel: '$$$$',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://www.gramercytavern.com/',
      mapsUrl: 'https://maps.google.com/?q=42+E+20th+St,+New+York,+NY+10003',
      address: '42 E 20th St, New York, NY 10003',
      rating: 4.7,
      reviewCount: 3500,
      lat: 40.7385,
      lng: -73.9881,
    },
    {
      id: 'los-tacos-no1',
      name: 'Los Tacos No.1',
      area: 'Chelsea Market',
      cuisine: 'Mexican',
      priceLevel: '$',
      image:
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://www.lostacos1.com/',
      mapsUrl: 'https://maps.google.com/?q=75+9th+Ave,+New+York,+NY+10011',
      address: '75 9th Ave, New York, NY 10011',
      rating: 4.6,
      reviewCount: 7200,
      lat: 40.7423,
      lng: -74.0060,
    },
    {
      id: 'junoon',
      name: 'Junoon',
      area: 'Flatiron',
      cuisine: 'Indian',
      priceLevel: '$$$',
      image:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://www.junoonnyc.com/',
      mapsUrl: 'https://maps.google.com/?q=19+W+24th+St,+New+York,+NY+10010',
      address: '19 W 24th St, New York, NY 10010',
      rating: 4.5,
      reviewCount: 1800,
      lat: 40.7422,
      lng: -73.9902,
    },
  ];

  private readonly featuredPlans = [
    {
      id: 'top-rock',
      title: 'Top of the Rock al atardecer',
      type: 'Mirador',
      area: 'Midtown',
      image:
        'https://images.unsplash.com/photo-1542704792-e30dac463c90?auto=format&fit=crop&w=1400&q=80',
      durationMinutes: 90,
      indoor: false,
      lat: 40.7590,
      lng: -73.9795,
      officialUrl: 'https://www.rockefellercenter.com/attractions/top-of-the-rock-observation-deck/',
    },
    {
      id: 'natural-history',
      title: 'American Museum of Natural History',
      type: 'Museo',
      area: 'Upper West Side',
      image:
        'https://images.unsplash.com/photo-1577083552431-6e5fd01988f6?auto=format&fit=crop&w=1400&q=80',
      durationMinutes: 140,
      indoor: true,
      lat: 40.7813,
      lng: -73.9735,
      officialUrl: 'https://www.amnh.org/',
    },
    {
      id: 'brooklyn-bridge-park',
      title: 'Brooklyn Bridge Park + DUMBO',
      type: 'Foto y paseo',
      area: 'Brooklyn',
      image:
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80',
      durationMinutes: 120,
      indoor: false,
      lat: 40.7003,
      lng: -73.9967,
      officialUrl: 'https://www.brooklynbridgepark.org/',
    },
    {
      id: 'elcano-theme',
      title: 'Ruta maritima estilo Elcano en el Hudson',
      type: 'Tematica Elcano',
      area: 'Hudson River',
      image:
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=80',
      durationMinutes: 100,
      indoor: false,
      lat: 40.7412,
      lng: -74.0107,
      officialUrl: 'https://sail4th.org/',
    },
  ];

  getHealth() {
    return {
      status: 'ok',
      service: 'nyc-family-planner-api',
      timestamp: new Date().toISOString(),
    };
  }

  getFeaturedPlans() {
    return this.featuredPlans;
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

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private normalizeCuisine(types?: string[]) {
    const t = new Set(types ?? []);
    if (t.has('italian_restaurant')) return 'Italian';
    if (t.has('mexican_restaurant')) return 'Mexican';
    if (t.has('indian_restaurant')) return 'Indian';
    if (t.has('japanese_restaurant')) return 'Japanese';
    if (t.has('chinese_restaurant')) return 'Chinese';
    if (t.has('bakery')) return 'Bakery';
    return 'Restaurant';
  }

  private applyRestaurantFilters(items: RestaurantItem[], filters: RestaurantFilters) {
    const hasHotel =
      Number.isFinite(filters.hotelLat) &&
      Number.isFinite(filters.hotelLng) &&
      Math.abs(filters.hotelLat ?? 0) > 0 &&
      Math.abs(filters.hotelLng ?? 0) > 0;

    const enriched = items.map((item) => {
      if (!hasHotel) return item;
      const distanceKm = this.haversineKm(
        filters.hotelLat as number,
        filters.hotelLng as number,
        item.lat,
        item.lng,
      );
      return { ...item, distanceKm: Number(distanceKm.toFixed(1)) };
    });

    const filtered = enriched.filter((item) => {
      if (filters.price && item.priceLevel !== filters.price) return false;
      if (filters.cuisine && filters.cuisine !== 'all' && item.cuisine !== filters.cuisine) return false;
      if (Number.isFinite(filters.minRating) && (filters.minRating as number) > 0) {
        if (item.rating < (filters.minRating as number)) return false;
      }
      if (Number.isFinite(filters.maxDistanceKm) && (filters.maxDistanceKm as number) > 0 && item.distanceKm !== undefined) {
        if (item.distanceKm > (filters.maxDistanceKm as number)) return false;
      }
      return true;
    });

    const maxResults =
      Number.isFinite(filters.maxResults) && (filters.maxResults as number) > 0
        ? Math.min(1000, Math.floor(filters.maxResults as number))
        : 1000;

    return filtered.slice(0, maxResults);
  }

  private async getOverpassRestaurants() {
    const bbox = '40.4774,-74.2591,40.9176,-73.7004';
    const query = `
      [out:json][timeout:90];
      (
        nwr["amenity"~"restaurant|fast_food|food_court|cafe"](${bbox});
        nwr["shop"="bakery"](${bbox});
      );
      out center 3000;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return [];
    const data = (await response.json()) as {
      elements?: Array<{
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat?: number; lon?: number };
        tags?: Record<string, string>;
      }>;
    };

    const mapped = (data.elements ?? [])
      .map((el): RestaurantItem | null => {
        const tags = el.tags ?? {};
        const name = tags.name ?? tags.brand;
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!name || typeof lat !== 'number' || typeof lng !== 'number') return null;

        const amenity = tags.amenity ?? '';
        const cuisine = tags.cuisine?.split(';')?.[0]?.replace('_', ' ') ?? (amenity === 'fast_food' ? 'Fast Food' : 'Restaurant');
        const website = tags.website ?? tags['contact:website'];
        const brand = tags.brand;
        const house = tags['addr:housenumber'] ?? '';
        const street = tags['addr:street'] ?? '';
        const city = tags['addr:city'] ?? 'New York';
        const postcode = tags['addr:postcode'] ?? '';
        const addr = `${house} ${street}`.trim();
        const address = `${addr ? `${addr}, ` : ''}${city}${postcode ? ` ${postcode}` : ''}`;

        return {
          id: `osm-${el.id}`,
          name: brand && !name.includes(brand) ? `${name} (${brand})` : name,
          area: city,
          cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
          priceLevel: '$$',
          rating: 0,
          reviewCount: 0,
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
          officialUrl: website ?? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          address,
          lat,
          lng,
        };
      })
      .filter((item): item is RestaurantItem => item !== null);

    return mapped;
  }

  private async getNycOpenDataRestaurants() {
    const url =
      "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$select=camis,dba,boro,cuisine_description,building,street,zipcode,latitude,longitude,grade&$where=latitude%20IS%20NOT%20NULL%20AND%20longitude%20IS%20NOT%20NULL&$limit=50000";
    const response = await fetch(url);
    if (!response.ok) return [];

    const rows = (await response.json()) as NycOpenDataRow[];
    const byCamis = new Map<string, RestaurantItem>();

    for (const row of rows) {
      const camis = row.camis?.trim();
      const name = row.dba?.trim();
      const lat = Number(row.latitude);
      const lng = Number(row.longitude);
      if (!camis || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (byCamis.has(camis)) continue;

      const street = [row.building, row.street].filter(Boolean).join(" ").trim();
      const city = row.boro?.trim() || "New York";
      const zipcode = row.zipcode?.trim() ?? "";
      const cuisine = row.cuisine_description?.trim() || "Restaurant";
      const grade = row.grade?.trim() ?? "";
      const rating =
        grade === "A" ? 4.6 : grade === "B" ? 4.1 : grade === "C" ? 3.6 : 4.0;

      byCamis.set(camis, {
        id: `nyc-${camis}`,
        name,
        area: city,
        cuisine,
        priceLevel: "$$",
        rating,
        reviewCount: 0,
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
        officialUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        address: `${street}${street ? ", " : ""}${city}${zipcode ? ` ${zipcode}` : ""}`,
        lat,
        lng,
      });
    }

    return Array.from(byCamis.values());
  }

  private async getYelpRestaurants() {
    const key = process.env.YELP_API_KEY;
    if (!key) return [];

    const locations = [
      'Times Square, Manhattan, NY',
      'SoHo, Manhattan, NY',
      'Chelsea, Manhattan, NY',
      'Upper East Side, Manhattan, NY',
      'Upper West Side, Manhattan, NY',
      'Williamsburg, Brooklyn, NY',
      'DUMBO, Brooklyn, NY',
      'Astoria, Queens, NY',
      'Long Island City, Queens, NY',
      'Financial District, Manhattan, NY',
    ];

    const terms = ['restaurants', 'fast food', 'pizza', 'burgers', 'sushi', 'brunch', 'viral food'];
    const all = new Map<string, RestaurantItem>();

    for (const location of locations) {
      for (const term of terms) {
        const baseUrl = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(term)}&categories=restaurants,food,hotdogs,burgers,pizza,sushi&sort_by=best_match&limit=50`;
        for (const offset of [0, 50, 100, 150, 200]) {
          const url = `${baseUrl}&offset=${offset}`;
          const data = await this.safeFetchJson<{
            businesses?: Array<{
              id: string;
              name: string;
              image_url?: string;
              url?: string;
              rating?: number;
              review_count?: number;
              price?: string;
              coordinates?: { latitude?: number; longitude?: number };
              categories?: Array<{ title?: string }>;
              location?: { display_address?: string[]; city?: string };
            }>;
          }>(url, { headers: { Authorization: `Bearer ${key}` } });
          if (!data) continue;

          for (const b of data.businesses ?? []) {
            const lat = b.coordinates?.latitude;
            const lng = b.coordinates?.longitude;
            if (!b.id || !b.name || !b.image_url || !b.url) continue;
            if (typeof lat !== 'number' || typeof lng !== 'number') continue;
            if ((b.rating ?? 0) <= 0 || (b.review_count ?? 0) <= 0) continue;

            const priceLevel: RestaurantItem['priceLevel'] =
              b.price === '$$$$' ? '$$$$' : b.price === '$$$' ? '$$$' : b.price === '$' ? '$' : '$$';

            all.set(b.id, {
              id: `yelp-${b.id}`,
              name: b.name,
              area: b.location?.city ?? 'New York',
              cuisine: b.categories?.[0]?.title ?? 'Restaurant',
              priceLevel,
              rating: b.rating ?? 0,
              reviewCount: b.review_count ?? 0,
              image: b.image_url,
              officialUrl: b.url,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
              address: (b.location?.display_address ?? []).join(', '),
              lat,
              lng,
            });
          }
        }
      }
    }

    return Array.from(all.values());
  }

  async getRestaurants(filters: RestaurantFilters = {}) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (key) {
      try {
      const queries = [
        'best restaurants in New York City',
        'viral restaurants in New York City',
        'trending restaurants in New York City tiktok',
        'instagrammable restaurants in New York City',
        'michelin restaurants in Manhattan',
        'best pizza in Manhattan',
        'best sushi in Manhattan',
        'best burgers in Manhattan',
        'best brunch in Manhattan',
        'best steakhouse in Manhattan',
        'best italian restaurants in Manhattan',
        'best chinese restaurants in Manhattan',
        'best korean restaurants in Manhattan',
        'best indian restaurants in Manhattan',
        'best mexican restaurants in Manhattan',
        'best restaurants in Brooklyn',
        'viral restaurants in Brooklyn',
        'best restaurants in Williamsburg Brooklyn',
        'best restaurants in DUMBO Brooklyn',
        'best restaurants in Long Island City Queens',
        'best restaurants in Astoria Queens',
        'best restaurants in Upper East Side',
        'best restaurants in Upper West Side',
        'best restaurants in Soho NYC',
        'best restaurants in Greenwich Village NYC',
        'best restaurants in East Village NYC',
        'best restaurants in Chelsea NYC',
        'best restaurants in Flatiron NYC',
        'best restaurants in Midtown NYC',
        'family friendly restaurants in New York City',
      ];

      const queryResponses = await Promise.all(
        queries.map(async (q) => {
          return this.safeFetchJson<{
            results?: Array<{
              place_id: string;
              name: string;
              formatted_address?: string;
              rating?: number;
              user_ratings_total?: number;
              price_level?: number;
              business_status?: string;
              types?: string[];
              photos?: Array<{ photo_reference?: string }>;
              geometry?: { location?: { lat?: number; lng?: number } };
            }>;
          }>(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${key}`,
          );
        }),
      );

      const allResults = queryResponses
        .flatMap((r) => r?.results ?? [])
        .filter((r) => r.business_status !== 'CLOSED_PERMANENTLY');

      const uniqueByPlaceId = new Map<string, (typeof allResults)[number]>();
      for (const result of allResults) {
        if (!uniqueByPlaceId.has(result.place_id)) uniqueByPlaceId.set(result.place_id, result);
      }

      const baseItems = Array.from(uniqueByPlaceId.values()).slice(0, 1400);
      if (!baseItems.length) return { source: 'fallback', items: [] };

      const items = await Promise.all(
        baseItems.map(async (r) => {
          const photoRef = r.photos?.[0]?.photo_reference;
          const lat = r.geometry?.location?.lat;
          const lng = r.geometry?.location?.lng;

          if (typeof lat !== 'number' || typeof lng !== 'number') return null;
          if (!photoRef) return null;
          if ((r.rating ?? 0) <= 0) return null;
          if ((r.user_ratings_total ?? 0) <= 0) return null;

          let officialUrl = '';
          const details = await this.safeFetchJson<{
            result?: { website?: string };
          }>(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=website&key=${key}`,
          );
          if (!details) return null;
          officialUrl = details.result?.website ?? '';

          if (!officialUrl) return null;

          return {
            id: r.place_id,
            name: r.name,
            area: 'New York City',
            cuisine: this.normalizeCuisine(r.types),
            priceLevel:
              r.price_level === 4
                ? '$$$$'
                : r.price_level === 3
                  ? '$$$'
                  : r.price_level === 1
                    ? '$'
                    : '$$',
            rating: r.rating ?? 4.1,
            reviewCount: r.user_ratings_total ?? 0,
            image: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${key}`,
            officialUrl,
            mapsUrl:
              `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            address: r.formatted_address ?? 'New York, NY',
            lat,
            lng,
          } satisfies RestaurantItem;
        }),
      );

      const strictItems = items.filter((item): item is RestaurantItem => item !== null);
      strictItems.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });
      const filtered = this.applyRestaurantFilters(strictItems, filters);
      return {
        source: 'google-places',
        items: filtered,
      };
      } catch {
        // fallback to yelp/fallback below
      }
    }

    const yelpItems = await this.getYelpRestaurants();
    if (yelpItems.length) {
      yelpItems.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });
      return { source: 'yelp', items: this.applyRestaurantFilters(yelpItems, filters) };
    }

    return { source: 'fallback', items: this.applyRestaurantFilters(this.fallbackRestaurants, filters) };
  }

  async searchLocation(query: string) {
    const q = query.trim();
    if (q.length < 3) {
      return [];
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleKey) {
      try {
        const autocomplete = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            q,
          )}&types=geocode&components=country:us&key=${googleKey}`,
        );
        if (autocomplete.ok) {
          const data = (await autocomplete.json()) as {
            predictions?: Array<{ description: string; place_id: string }>;
          };
          const candidates = (data.predictions ?? []).slice(0, 5);

          const resolved = await Promise.all(
            candidates.map(async (item) => {
              const details = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry&key=${googleKey}`,
              );
              if (!details.ok) return null;
              const payload = (await details.json()) as {
                result?: { geometry?: { location?: { lat?: number; lng?: number } } };
              };
              const lat = payload.result?.geometry?.location?.lat;
              const lng = payload.result?.geometry?.location?.lng;
              if (typeof lat !== 'number' || typeof lng !== 'number') return null;
              return { label: item.description, lat, lng, provider: 'google' };
            }),
          );

          return resolved.filter((item): item is NonNullable<typeof item> => Boolean(item));
        }
      } catch {
        // Fallback to Nominatim below.
      }
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          `${q}, New York`,
        )}`,
        { headers: { 'User-Agent': 'nyc-family-planner/1.0' } },
      );

      if (!response.ok) return [];
      const data = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;

      return data.map((item) => ({
        label: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
        provider: 'nominatim',
      }));
    } catch {
      return [];
    }
  }

  async getWeatherForecast(lat: number, lng: number, startDate: string, endDate: string) {
    const fallback: WeatherDay[] = [
      {
        date: startDate,
        temperatureMin: 21,
        temperatureMax: 29,
        precipitationProbability: 20,
        weatherCode: 1,
      },
    ];

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FNew_York&start_date=${startDate}&end_date=${endDate}`,
      );
      if (!response.ok) {
        return { source: 'fallback', days: fallback };
      }
      const data = (await response.json()) as {
        daily?: {
          time?: string[];
          weathercode?: number[];
          temperature_2m_max?: number[];
          temperature_2m_min?: number[];
          precipitation_probability_max?: number[];
        };
      };
      const times = data.daily?.time ?? [];
      const days = times.map((date, index) => ({
        date,
        weatherCode: data.daily?.weathercode?.[index] ?? 0,
        temperatureMax: data.daily?.temperature_2m_max?.[index] ?? 0,
        temperatureMin: data.daily?.temperature_2m_min?.[index] ?? 0,
        precipitationProbability: data.daily?.precipitation_probability_max?.[index] ?? 0,
      }));
      return { source: 'open-meteo', days: days.length ? days : fallback };
    } catch {
      return { source: 'fallback', days: fallback };
    }
  }

  async getHeroImage() {
    const fallback =
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1800&q=80';
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      return {
        provider: 'fallback',
        imageUrl: fallback,
      };
    }

    try {
      const response = await fetch(
        'https://api.pexels.com/v1/search?query=new%20york%20skyline%20sunset%20cinematic&orientation=landscape&per_page=1',
        {
          headers: {
            Authorization: apiKey,
          },
        },
      );

      if (!response.ok) {
        return { provider: 'fallback', imageUrl: fallback };
      }

      const data = (await response.json()) as {
        photos?: Array<{ src?: { landscape?: string } }>;
      };

      const imageUrl = data.photos?.[0]?.src?.landscape ?? fallback;
      return {
        provider: 'pexels',
        imageUrl,
      };
    } catch {
      return { provider: 'fallback', imageUrl: fallback };
    }
  }

  createTrip(input: TripInput) {
    const trip: Trip = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.trips.set(trip.id, trip);
    return trip;
  }

  updateTrip(id: string, input: TripInput) {
    const existing = this.trips.get(id);
    if (!existing) {
      throw new NotFoundException(`Trip ${id} not found`);
    }
    const trip: Trip = {
      ...existing,
      ...input,
      id,
    };
    this.trips.set(id, trip);
    return trip;
  }

  getTripById(id: string) {
    const trip = this.trips.get(id);
    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found`);
    }
    return trip;
  }

  buildDayPlan(tripId: string, date: string) {
    const trip = this.getTripById(tripId);
    const paceSlots = trip.pace === 'relajado' ? 2 : trip.pace === 'normal' ? 3 : 4;
    const picks = this.featuredPlans.slice(0, paceSlots).map((plan, index) => ({
      ...plan,
      startTime: `${9 + index * 3}:00`,
      reason: `Encaja con el ritmo ${trip.pace} y el perfil familiar del viaje.`,
      transport: index === 0 ? 'Desde alojamiento' : 'Metro + 8 min andando',
    }));

    return {
      tripId,
      date,
      weatherSummary: 'Parcialmente soleado, ideal para combinar exterior e interior.',
      items: picks,
    };
  }
}
