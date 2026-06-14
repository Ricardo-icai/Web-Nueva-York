import { Injectable } from '@nestjs/common';

type CoverageArea =
  | 'restaurants'
  | 'nightlife'
  | 'culture'
  | 'rooftops'
  | 'events'
  | 'transit';

type FreshnessRule = {
  area: CoverageArea;
  refreshCadence: string;
  sources: string[];
  monitorFor: string[];
  actionWhenChanged: string[];
};

@Injectable()
export class FreshnessSupervisorAgent {
  private readonly rules: FreshnessRule[] = [
    {
      area: 'restaurants',
      refreshCadence: 'daily for trending lists, weekly for broader curation',
      sources: [
        'Eater New York',
        'Infatuation New York',
        'The New York Times',
        'Time Out New York',
        'Google Places / Maps',
        'official restaurant websites',
      ],
      monitorFor: [
        'new openings',
        'closures',
        'chef changes',
        'viral dishes',
        'ranking changes',
        'reservation policy changes',
      ],
      actionWhenChanged: [
        'update curated dataset',
        'raise or lower trend score',
        'disable stale official links',
        'mark venue as newly opened or currently hot',
      ],
    },
    {
      area: 'nightlife',
      refreshCadence: 'daily for lineups and trend shifts, weekly for shortlist review',
      sources: [
        'Resident Advisor',
        'Time Out New York',
        'Eater New York nightlife roundups',
        'The Infatuation',
        'venue official calendars',
        'Google Places / Maps',
        'community and forum threads',
      ],
      monitorFor: [
        'DJ lineups',
        'genre nights',
        'latin/reggaeton nights',
        'reopenings',
        'temporary closures',
        'ticketing changes',
        'editorial mentions',
      ],
      actionWhenChanged: [
        're-rank nightlife venues',
        'refresh music-style tags',
        'surface trending venues on the page',
        'demote unstable or outdated venues',
      ],
    },
    {
      area: 'culture',
      refreshCadence: 'weekly, plus event-driven refresh for major exhibits',
      sources: [
        'museum official websites',
        'Time Out New York',
        'The New York Times Arts',
        'Ticketmaster',
        'Eventbrite',
        'NYC cultural institution calendars',
      ],
      monitorFor: [
        'temporary exhibitions',
        'ticket sellouts',
        'closure dates',
        'new season launches',
        'family programming',
      ],
      actionWhenChanged: [
        'update featured culture sections',
        'highlight limited-time exhibitions',
        'adjust weather-friendly recommendations',
      ],
    },
    {
      area: 'rooftops',
      refreshCadence: 'weekly during peak season, biweekly off-season',
      sources: [
        'official rooftop websites',
        'hotel venue pages',
        'Time Out New York',
        'Condé Nast Traveler',
        'Google Places / Maps',
      ],
      monitorFor: [
        'season openings',
        'weather-related closures',
        'new reservation/ticket policies',
        'skyline experience updates',
      ],
      actionWhenChanged: [
        'refresh rooftop ranking',
        'hide temporarily closed rooftops',
        'update reservation links',
      ],
    },
    {
      area: 'events',
      refreshCadence: 'daily near live event windows, weekly otherwise',
      sources: [
        'official event websites',
        'NYC government notices',
        'Ticketmaster',
        'Eventbrite',
        'venue official pages',
      ],
      monitorFor: [
        'date changes',
        'sellouts',
        'weather disruptions',
        'new ticket drops',
      ],
      actionWhenChanged: [
        'update event sections immediately',
        'flag limited-time availability',
        'remove canceled items quickly',
      ],
    },
    {
      area: 'transit',
      refreshCadence: 'daily, with live checks when APIs are available',
      sources: [
        'MTA',
        'NYC Ferry',
        'Port Authority / AirTrain',
        'official transit service alerts',
      ],
      monitorFor: [
        'service changes',
        'planned maintenance',
        'major disruptions',
        'fare policy changes',
      ],
      actionWhenChanged: [
        'refresh transit guidance',
        'prioritize alternative routes',
        'update user-facing advisories',
      ],
    },
  ];

  getBriefing() {
    return {
      agent: 'FreshnessSupervisorAgent',
      mission:
        'Keep the web up to date by defining refresh cadence, source priority and change-handling rules across every specialty area of the project.',
      principles: [
        'Never rely on a single source for trend-sensitive recommendations.',
        'Prioritize official websites for links, schedules and closures.',
        'Use editorial and local community sources to detect what is hot right now.',
        'Demote stale or unstable venues quickly.',
        'Treat nightlife, events and transit as high-volatility domains.',
      ],
      rules: this.rules,
      recommendedAutomation: [
        'scheduled sync jobs',
        'trend score recalculation',
        'link validation',
        'stale-content flags',
        'manual review queue for ambiguous changes',
      ],
    };
  }

  audit() {
    return {
      agent: 'FreshnessSupervisorAgent',
      generatedAt: new Date().toISOString(),
      highVolatilityAreas: this.rules
        .filter((rule) => ['nightlife', 'events', 'transit'].includes(rule.area))
        .map((rule) => rule.area),
      updatePriorities: this.rules.map((rule) => ({
        area: rule.area,
        refreshCadence: rule.refreshCadence,
        topSources: rule.sources.slice(0, 3),
      })),
      nextImplementationSteps: [
        'Persist curated records with last_verified_at timestamps.',
        'Add scheduled jobs for each area.',
        'Run official-link verification before publishing items.',
        'Expose freshness badges in the frontend when records were recently verified.',
      ],
    };
  }
}
