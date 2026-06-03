import { Injectable } from '@nestjs/common';

type TransitRecommendationInput = {
  destination?: string;
  originLat?: number;
  originLng?: number;
  travelers?: number;
  priority?: 'fastest' | 'fewest_transfers' | 'accessible' | 'scenic';
};

@Injectable()
export class NycTransitAgent {
  getBriefing() {
    return {
      agent: 'NycTransitAgent',
      generatedAt: new Date().toISOString(),
      mission: [
        'Ayudar al usuario a ir desde su ubicacion actual hasta un destino en NYC.',
        'Priorizar metro/bus/ferry segun rapidez, accesibilidad, clima y carga familiar.',
        'Explicar como pagar con OMNY y como conseguir una tarjeta fisica si se necesita.',
        'Monitorizar MTA service status, GTFS static, GTFS Realtime, Bus Time y NYC Ferry.',
      ],
      recommendedApis: [
        'Google Maps Directions/Routes API for transit routing',
        'MTA GTFS static schedules',
        'MTA GTFS Realtime subway feeds',
        'MTA Bus Time GTFS Realtime',
        'MTA Service Alerts',
        'NYC Ferry routes and schedules',
      ],
      officialSources: [
        'https://new.mta.info/',
        'https://www.mta.info/developers',
        'https://omny.info/',
        'https://www.ferry.nyc/routes-and-schedules/',
      ],
      paymentGuidance: {
        primary: 'Use OMNY by tapping a contactless card, phone, watch, or OMNY Card.',
        card: 'OMNY Cards can be bought/reloaded at OMNY vending machines and participating retailers.',
        metroCard: 'MetroCard sales/refills are phased out in 2026; plan around OMNY.',
        tip: 'Use the same payment method every ride to keep transfers and fare capping aligned.',
      },
    };
  }

  recommend(input: TransitRecommendationInput = {}) {
    const destination = (input.destination ?? '').toLowerCase();
    const priority = input.priority ?? 'fastest';
    const recommendations: string[] = [];

    if (destination.includes('jfk')) {
      recommendations.push('Use AirTrain JFK plus LIRR for speed, or AirTrain plus subway for lower cost.');
    } else if (destination.includes('newark')) {
      recommendations.push('Use NJ Transit plus AirTrain Newark; verify train frequency before departure.');
    } else if (destination.includes('laguardia') || destination.includes('lga')) {
      recommendations.push('Use Q70/M60 bus connection plus subway, or taxi if carrying heavy luggage.');
    } else if (destination.includes('dumbo') || destination.includes('brooklyn')) {
      recommendations.push('Use subway for fastest routing; NYC Ferry is more scenic but usually slower.');
    } else if (destination.includes('pier') || destination.includes('hudson')) {
      recommendations.push('Use subway to the West Side, then walk. Avoid cars near waterfront events.');
    } else {
      recommendations.push('Use subway first, compare bus only for short crosstown trips or accessibility needs.');
    }

    if (priority === 'scenic') recommendations.push('Consider NYC Ferry when the route touches East River or Wall St.');
    if (priority === 'accessible') recommendations.push('Check MTA elevator status before choosing the station.');
    if ((input.travelers ?? 1) >= 4) recommendations.push('For families, pick one backup subway station before leaving.');

    return {
      agent: 'NycTransitAgent',
      input,
      recommendations,
      directionsUrl:
        input.originLat && input.originLng && input.destination
          ? `https://www.google.com/maps/dir/?api=1&origin=${input.originLat},${input.originLng}&destination=${encodeURIComponent(input.destination)}&travelmode=transit`
          : null,
    };
  }
}
