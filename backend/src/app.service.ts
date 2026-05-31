import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Pace = 'relajado' | 'normal' | 'intenso';

export interface TripInput {
  name: string;
  nationality: string;
  language: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: Pace;
}

export interface Trip extends TripInput {
  id: string;
  createdAt: string;
}

@Injectable()
export class AppService {
  private readonly trips = new Map<string, Trip>();

  private readonly featuredPlans = [
    {
      id: 'top-rock',
      title: 'Top of the Rock al atardecer',
      type: 'Mirador',
      area: 'Midtown',
      image: '/images/hero-nyc.svg',
      durationMinutes: 90,
      indoor: false,
    },
    {
      id: 'natural-history',
      title: 'American Museum of Natural History',
      type: 'Museo',
      area: 'Upper West Side',
      image: '/images/skyline.svg',
      durationMinutes: 140,
      indoor: true,
    },
    {
      id: 'brooklyn-bridge-park',
      title: 'Brooklyn Bridge Park + DUMBO',
      type: 'Foto y paseo',
      area: 'Brooklyn',
      image: '/images/elcano.svg',
      durationMinutes: 120,
      indoor: false,
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
