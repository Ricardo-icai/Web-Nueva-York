import { Injectable } from '@nestjs/common';

type CulturePreference = {
  ageGroup?: string;
  weather?: string;
  preference?: string;
};

@Injectable()
export class CultureCuratorAgent {
  getBriefing() {
    return {
      agent: 'CultureCuratorAgent',
      mission:
        'Discover, monitor and rank New York cultural experiences across museums, monuments, architecture, neighborhoods, street art, performing arts, literature, film and music.',
      responsibilities: [
        'Discover museums and essential cultural sites.',
        'Discover temporary exhibitions through official APIs when credentials are available.',
        'Monitor Broadway and performing arts calendars.',
        'Monitor museum schedules, closures and ticket policies.',
        'Monitor cultural festivals and family-friendly events.',
        'Rank experiences by quality, cultural value, family suitability, weather resilience and transport ease.',
      ],
      recommendedApis: [
        'Google Places API',
        'NYC Open Data',
        'Metropolitan Museum Open Access API',
        'Smithsonian Open Access API',
        'Eventbrite API',
        'Ticketmaster API',
        'OpenWeather API',
      ],
      badges: [
        'Imprescindible',
        'Patrimonio Historico',
        'Familiar',
        'Gratis',
        'Arquitectura Iconica',
        'Arte Urbano',
        'Broadway',
        'Historia de Nueva York',
        'Experiencia Premium',
        'Recomendado por Locales',
      ],
      qualitySignals: [
        'Official institution status',
        'Historic significance',
        'Collection depth',
        'Temporary exhibition relevance',
        'Family suitability',
        'Transit accessibility',
        'Weather resilience',
        'Local cultural identity',
      ],
    };
  }

  recommend(input: CulturePreference) {
    const preference = `${input.preference ?? ''} ${input.ageGroup ?? ''} ${input.weather ?? ''}`.toLowerCase();
    if (preference.includes('rain') || preference.includes('lluvia') || preference.includes('cold') || preference.includes('frio')) {
      return {
        route: 'Indoor Art & Memory Route',
        experiences: ['The Metropolitan Museum of Art', 'MoMA', '9/11 Memorial & Museum', 'New York Public Library'],
        reason: 'Prioritizes indoor cultural depth and avoids weather exposure.',
      };
    }
    if (preference.includes('child') || preference.includes('nino') || preference.includes('famil')) {
      return {
        route: 'Family Culture Route',
        experiences: ['American Museum of Natural History', 'Intrepid Museum', 'Statue of Liberty', 'Grand Central Terminal'],
        reason: 'Strong visual learning, manageable movement and high family suitability.',
      };
    }
    if (preference.includes('architecture') || preference.includes('arquitect')) {
      return {
        route: 'Architecture Route',
        experiences: ['Grand Central Terminal', 'Chrysler Building', 'Empire State Building', 'Flatiron Building', 'The Oculus'],
        reason: 'Connects iconic buildings through a transit-friendly Midtown to Downtown route.',
      };
    }
    if (preference.includes('music') || preference.includes('jazz') || preference.includes('musica')) {
      return {
        route: 'Harlem & Jazz Route',
        experiences: ['Harlem Jazz history', 'Apollo Theater', 'Birdland Jazz Club', 'Blue Note', 'Carnegie Hall'],
        reason: 'Focuses on New York music identity from Harlem to classic jazz rooms.',
      };
    }
    return {
      route: 'Definitive Culture Route',
      experiences: ['The Metropolitan Museum of Art', 'Statue of Liberty', 'Grand Central Terminal', 'Brooklyn Bridge', 'New York Public Library'],
      reason: 'Balanced first-time route across art, identity, architecture, history and literature.',
    };
  }
}
