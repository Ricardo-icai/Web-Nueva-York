import { Injectable } from '@nestjs/common';

type PatriotEvent = {
  id: string;
  name: string;
  category: 'fireworks' | 'sail4th' | 'elcano' | 'concerts' | 'family' | 'culture' | 'free' | 'ticketed';
  date: string;
  time: string;
  location: string;
  officialUrl: string;
  ticketUrl?: string;
  price: string;
  audience: string[];
  weatherSensitivity: 'low' | 'medium' | 'high';
};

@Injectable()
export class PatriotEventsAgent {
  private readonly officialEvents: PatriotEvent[] = [
    {
      id: 'macys-fireworks-2026',
      name: "Macy's 4th of July Fireworks 2026",
      category: 'fireworks',
      date: '2026-07-04',
      time: '8:00 PM - 10:00 PM ET broadcast window',
      location: 'Lower East River, lower Hudson River, Brooklyn Bridge and New York Harbor viewing corridors',
      officialUrl: 'https://www.macys.com/fireworks',
      price: 'Free public viewing; private/ticketed venues vary',
      audience: ['families', 'first-time visitors', 'photography', 'patriotic events'],
      weatherSensitivity: 'high',
    },
    {
      id: 'sail4th-parade-of-tall-ships',
      name: 'Sail4th 250 Parade of Tall Ships',
      category: 'sail4th',
      date: '2026-07-04',
      time: '9:30 AM - 2:00 PM',
      location: 'Hudson River',
      officialUrl: 'https://sail4th.org/schedule',
      price: 'Free from public viewing areas; official cruises vary',
      audience: ['families', 'history', 'maritime', 'education'],
      weatherSensitivity: 'high',
    },
    {
      id: 'juan-sebastian-elcano',
      name: 'Juan Sebastián de Elcano public viewing',
      category: 'elcano',
      date: '2026-07',
      time: 'Public visit windows published by Sail4th 250',
      location: 'Piers 90/92, Manhattan, according to Sail4th public tall ship tour listings',
      officialUrl: 'https://sail4th.org/tall-ship-tours',
      ticketUrl: 'https://sail4th.org/tall-ship-tours',
      price: 'Free with strongly recommended reservation',
      audience: ['families', 'spanish history', 'maritime', 'education'],
      weatherSensitivity: 'medium',
    },
    {
      id: 'empire-state-building-fourth',
      name: 'Empire State Building Fourth of July Celebration',
      category: 'ticketed',
      date: '2026-07-04',
      time: '7:30 PM - 9:30 PM',
      location: 'Empire State Building',
      officialUrl: 'https://www.esbnyc.com/celebrate-4th-july-2026',
      ticketUrl: 'https://www.esbnyc.com/celebrate-4th-july-2026',
      price: 'From $580 per person on official ESB listing',
      audience: ['premium', 'couples', 'families with older children'],
      weatherSensitivity: 'medium',
    },
  ];

  getBriefing() {
    return {
      agent: 'PatriotEventsAgent',
      generatedAt: new Date().toISOString(),
      mission: [
        'Buscar eventos oficiales del 4 de Julio en Nueva York.',
        'Monitorizar Sail4th 250 y grandes veleros.',
        'Monitorizar Juan Sebastián de Elcano.',
        'Actualizar horarios, ubicaciones y enlaces oficiales.',
        'Detectar cancelaciones o cambios por clima/seguridad.',
        'Recomendar eventos según edad, clima y preferencias del usuario.',
      ],
      recommendedApis: ['Ticketmaster API', 'Eventbrite API', 'Google Places API', 'NYC Open Data', 'OpenWeather API'],
      sourcePriority: [
        'Official event websites',
        'NYC government and transit notices',
        'Venue official ticketing pages',
        'Weather and public safety feeds',
      ],
      monitoredEvents: this.officialEvents,
    };
  }

  recommend(input?: { ageGroup?: string; weather?: string; preference?: string }) {
    const ageGroup = input?.ageGroup?.toLowerCase() ?? '';
    const weather = input?.weather?.toLowerCase() ?? '';
    const preference = input?.preference?.toLowerCase() ?? '';

    const ranked = this.officialEvents
      .map((event) => {
        let score = 50;
        if (ageGroup.includes('family') || ageGroup.includes('kids')) {
          if (event.audience.includes('families') || event.audience.includes('education')) score += 25;
        }
        if (preference && event.audience.some((item) => preference.includes(item))) score += 20;
        if (weather.includes('rain') || weather.includes('storm')) {
          if (event.weatherSensitivity === 'low') score += 15;
          if (event.weatherSensitivity === 'high') score -= 20;
        }
        if (weather.includes('hot') || weather.includes('heat')) {
          if (event.category === 'family' || event.category === 'sail4th') score -= 5;
          if (event.category === 'ticketed') score += 10;
        }
        return { ...event, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    return {
      agent: 'PatriotEventsAgent',
      input: input ?? {},
      recommendations: ranked,
    };
  }
}
