import { Injectable } from '@nestjs/common';

type NightlifeMode = 'cocktails' | 'live_music' | 'clubs' | 'rooftops' | 'speakeasies';

type NightlifeVenueInsight = {
  id: string;
  name: string;
  mode: NightlifeMode;
  neighborhood: string;
  whyItStandsOut: string;
  officialWebsite: string;
  sourceSignals: string[];
  editorialScore: number;
  bestFor: string[];
};

type RecommendationInput = {
  mood?: string;
  budget?: string;
  music?: string;
  preference?: string;
};

@Injectable()
export class NightlifeCuratorAgent {
  private readonly sources = {
    newspapersAndMagazines: [
      'The New York Times',
      'New York Magazine / The Cut',
      'Time Out New York',
      'Condé Nast Traveler',
      'Eater New York',
      'Infatuation New York',
      'Secret NYC',
      'Resident Advisor',
      'Thrillist New York',
      'The New Yorker',
    ],
    nightlifeEditorials: [
      'The World’s 50 Best Bars',
      'North America’s 50 Best Bars',
      'DJ Mag Top 100 Clubs',
      'Nightlife Association rankings',
      'The Nudge',
      'The Knockturnal',
    ],
    localSignals: [
      'venue official calendars',
      'artist calendars',
      'ticketing pages',
      'Google Maps',
      'community recommendations',
      'nightlife roundups refreshed by season',
    ],
    forumAndCommunityTargets: [
      'Reddit NYC',
      'Reddit AskNYC',
      'Brooklyn communities',
      'traveler discussion threads',
      'local recommendation threads',
    ],
  };

  private readonly discoveryQueries = [
    'best cocktail bars in new york right now',
    'best live music venues in new york right now',
    'best clubs in new york right now',
    'best rooftops for nightlife nyc',
    'best speakeasies new york city',
    'where do locals go out in nyc',
    'best bars with live music in manhattan brooklyn',
    'best nightlife neighborhoods new york city',
  ];

  private readonly venues: NightlifeVenueInsight[] = [
    {
      id: 'double-chicken-please',
      name: 'Double Chicken Please',
      mode: 'cocktails',
      neighborhood: 'Lower East Side',
      whyItStandsOut: 'Uno de los bares de cocktails mas celebrados del mundo y una referencia clarisima si se quiere una noche de copas top en NYC.',
      officialWebsite: 'https://doublechickenplease.com/',
      sourceSignals: ['North America’s 50 Best Bars', 'global cocktail press', 'NYC editorials'],
      editorialScore: 98,
      bestFor: ['cocktails', 'first time in NYC', 'creative drinks'],
    },
    {
      id: 'overstory',
      name: 'Overstory',
      mode: 'cocktails',
      neighborhood: 'Financial District',
      whyItStandsOut: 'Cocktails de nivel altisimo con vistas brutales; combina muy bien celebracion, skyline y una experiencia premium.',
      officialWebsite: 'https://www.overstory-nyc.com/',
      sourceSignals: ['50 Best Bars coverage', 'NYC magazine lists', 'traveler luxury guides'],
      editorialScore: 97,
      bestFor: ['premium', 'views', 'cocktails'],
    },
    {
      id: 'katana-kitten',
      name: 'Katana Kitten',
      mode: 'cocktails',
      neighborhood: 'West Village',
      whyItStandsOut: 'Bar muy querido por prensa y publico local, excelente para una noche divertida sin formalismo excesivo.',
      officialWebsite: 'https://www.katanakitten.com/',
      sourceSignals: ['50 Best Bars coverage', 'Eater NY', 'Infatuation'],
      editorialScore: 94,
      bestFor: ['cocktails', 'friends', 'village'],
    },
    {
      id: 'blue-note',
      name: 'Blue Note Jazz Club',
      mode: 'live_music',
      neighborhood: 'Greenwich Village',
      whyItStandsOut: 'Institucion absoluta del jazz neoyorquino y una de las primeras recomendaciones cuando alguien busca musica en directo de verdad.',
      officialWebsite: 'https://www.bluenotejazz.com/nyc/',
      sourceSignals: ['music press', 'NYC culture lists', 'tourist essential guides'],
      editorialScore: 97,
      bestFor: ['live music', 'jazz', 'classic NYC'],
    },
    {
      id: 'village-vanguard',
      name: 'Village Vanguard',
      mode: 'live_music',
      neighborhood: 'Greenwich Village',
      whyItStandsOut: 'Mitico para jazz serio y una opcion muy repetida cuando se busca autenticidad musical en Nueva York.',
      officialWebsite: 'https://www.villagevanguard.com/',
      sourceSignals: ['music press', 'local jazz guides', 'editorial prestige'],
      editorialScore: 96,
      bestFor: ['live music', 'authentic', 'jazz lovers'],
    },
    {
      id: 'apollo-theater',
      name: 'Apollo Theater',
      mode: 'live_music',
      neighborhood: 'Harlem',
      whyItStandsOut: 'No es solo una sala: es historia musical de la ciudad y referencia continua en prensa y guias culturales.',
      officialWebsite: 'https://www.apollotheater.org/',
      sourceSignals: ['cultural press', 'NYC guides', 'music history sources'],
      editorialScore: 95,
      bestFor: ['live music', 'harlem', 'music history'],
    },
    {
      id: 'marquee-new-york',
      name: 'Marquee New York',
      mode: 'clubs',
      neighborhood: 'Chelsea',
      whyItStandsOut: 'Nombre muy reconocido para club grande en Manhattan, especialmente para quien busca produccion alta y noche de fiesta muy mainstream.',
      officialWebsite: 'https://taogroup.com/venues/marquee-new-york/',
      sourceSignals: ['club editorials', 'mainstream nightlife lists', 'venue brand strength'],
      editorialScore: 91,
      bestFor: ['clubs', 'big night', 'first timers'],
    },
    {
      id: 'house-of-yes',
      name: 'House of Yes',
      mode: 'clubs',
      neighborhood: 'Bushwick',
      whyItStandsOut: 'Suele aparecer como una de las experiencias nocturnas mas memorables y menos genericas de la ciudad.',
      officialWebsite: 'https://www.houseofyes.org/',
      sourceSignals: ['Time Out coverage', 'local nightlife editorials', 'community recommendations'],
      editorialScore: 96,
      bestFor: ['clubs', 'creative scene', 'dance'],
    },
    {
      id: 'public-records',
      name: 'Public Records',
      mode: 'clubs',
      neighborhood: 'Gowanus',
      whyItStandsOut: 'Muy fuerte en listas mas curadas y entre gente que busca una noche con mejor criterio musical.',
      officialWebsite: 'https://publicrecords.nyc/',
      sourceSignals: ['Resident Advisor', 'Brooklyn nightlife guides', 'music communities'],
      editorialScore: 93,
      bestFor: ['clubs', 'electronic', 'locals'],
    },
    {
      id: 'good-room',
      name: 'Good Room',
      mode: 'clubs',
      neighborhood: 'Greenpoint',
      whyItStandsOut: 'Una referencia constante cuando se habla de house, disco y clubbing mas local que tourist-trap.',
      officialWebsite: 'https://www.goodroombk.com/',
      sourceSignals: ['Resident Advisor', 'local club roundups', 'dance music guides'],
      editorialScore: 92,
      bestFor: ['clubs', 'house', 'dance'],
    },
    {
      id: 'nowadays',
      name: 'Nowadays',
      mode: 'clubs',
      neighborhood: 'Ridgewood',
      whyItStandsOut: 'Muy repetido en conversaciones de escena electronica y noches largas con publico mas local.',
      officialWebsite: 'https://nowadays.nyc/',
      sourceSignals: ['community recommendations', 'dance press', 'local nightlife guides'],
      editorialScore: 94,
      bestFor: ['clubs', 'electronic', 'late night'],
    },
    {
      id: 'le-bain',
      name: 'Le Bain',
      mode: 'rooftops',
      neighborhood: 'Meatpacking',
      whyItStandsOut: 'Uno de los grandes clasicos de rooftop party en Nueva York y nombre habitual en listas de noche con vistas.',
      officialWebsite: 'https://www.standardhotels.com/new-york/properties/high-line/eat-and-drink/le-bain',
      sourceSignals: ['hotel nightlife press', 'NYC rooftop guides', 'editorial roundups'],
      editorialScore: 93,
      bestFor: ['rooftops', 'views', 'party'],
    },
    {
      id: 'mr-purple',
      name: 'Mr. Purple',
      mode: 'rooftops',
      neighborhood: 'Lower East Side',
      whyItStandsOut: 'Muy asentado como rooftop para salir por la noche con mezcla equilibrada de copas, vistas y ambiente.',
      officialWebsite: 'https://mrpurplenyc.com/',
      sourceSignals: ['NYC rooftop lists', 'traveler editorials', 'local rec lists'],
      editorialScore: 90,
      bestFor: ['rooftops', 'cocktails', 'night views'],
    },
    {
      id: 'westlight',
      name: 'Westlight',
      mode: 'rooftops',
      neighborhood: 'Williamsburg',
      whyItStandsOut: 'Aparece mucho en listas de rooftops serios, especialmente cuando se busca algo elegante con buenas vistas.',
      officialWebsite: 'https://www.westlightnyc.com/',
      sourceSignals: ['Condé Nast Traveler', 'hotel and rooftop lists', 'Brooklyn guides'],
      editorialScore: 91,
      bestFor: ['rooftops', 'date night', 'brooklyn skyline'],
    },
    {
      id: 'please-dont-tell',
      name: "Please Don't Tell",
      mode: 'speakeasies',
      neighborhood: 'East Village',
      whyItStandsOut: 'Sigue siendo uno de los speakeasies mas famosos de la ciudad y aparece continuamente en rankings historicos y actuales.',
      officialWebsite: 'http://www.pdtnyc.com/',
      sourceSignals: ['global cocktail press', 'classic NYC nightlife lists', 'traveler guides'],
      editorialScore: 95,
      bestFor: ['speakeasies', 'cocktails', 'classic NYC'],
    },
    {
      id: 'attaboy',
      name: 'Attaboy',
      mode: 'speakeasies',
      neighborhood: 'Lower East Side',
      whyItStandsOut: 'Muy fuerte entre prensa y aficionados a cocktails serios; suele salir como una de las mejores barras de la ciudad.',
      officialWebsite: 'https://attaboy.us/new-york/',
      sourceSignals: ['cocktail press', 'best bars lists', 'local recommendations'],
      editorialScore: 96,
      bestFor: ['speakeasies', 'serious cocktails', 'couples'],
    },
    {
      id: 'employees-only',
      name: 'Employees Only',
      mode: 'speakeasies',
      neighborhood: 'West Village',
      whyItStandsOut: 'Gran clasico nocturno de Manhattan para cocktails y ambiente vivo, con mucho peso editorial sostenido.',
      officialWebsite: 'https://www.employeesonlynyc.com/',
      sourceSignals: ['classic cocktail lists', 'village nightlife guides', 'editorial staples'],
      editorialScore: 92,
      bestFor: ['speakeasies', 'late drinks', 'classic night out'],
    },
  ];

  getBriefing() {
    return {
      agent: 'NightlifeCuratorAgent',
      mission:
        'Discover, monitor and rank the best New York nightlife venues for cocktails, drinks, beer, live music, rooftops, speakeasies and clubs using editorial, local and community sources.',
      responsibilities: [
        'Buscar los mejores locales de cocktails, copas, cerveza con musica en directo y discotecas.',
        'Cruzar prensa, revistas, rankings editoriales y recomendaciones locales.',
        'Detectar locales recurrentes en multiples fuentes de calidad.',
        'Descartar cierres, venues inestables o sitios con senales editoriales debiles.',
        'Mantener enlaces oficiales y categorias claras para frontend y mapa.',
      ],
      sourceBuckets: this.sources,
      discoveryQueries: this.discoveryQueries,
      qualitySignals: [
        'Repeated presence across independent editorial sources',
        'Official venue website and active calendar',
        'Current relevance in New York nightlife coverage',
        'Strong local reputation, not only tourist popularity',
        'Fit by mode: cocktails, live music, clubs, rooftops, speakeasies',
      ],
      curatedShortlist: this.venues,
    };
  }

  recommend(input?: RecommendationInput) {
    const preferenceText = `${input?.mood ?? ''} ${input?.budget ?? ''} ${input?.music ?? ''} ${input?.preference ?? ''}`.toLowerCase();

    const ranked = this.venues
      .map((venue) => {
        let score = venue.editorialScore;

        if (preferenceText.includes('cocktail') || preferenceText.includes('copa')) {
          if (venue.mode === 'cocktails' || venue.mode === 'speakeasies') score += 12;
        }
        if (preferenceText.includes('live') || preferenceText.includes('directo') || preferenceText.includes('jazz')) {
          if (venue.mode === 'live_music') score += 14;
        }
        if (preferenceText.includes('club') || preferenceText.includes('discoteca') || preferenceText.includes('techno') || preferenceText.includes('house')) {
          if (venue.mode === 'clubs') score += 14;
        }
        if (preferenceText.includes('rooftop') || preferenceText.includes('views') || preferenceText.includes('vistas')) {
          if (venue.mode === 'rooftops') score += 12;
        }
        if (preferenceText.includes('elegant') || preferenceText.includes('premium') || preferenceText.includes('lujo')) {
          if (venue.bestFor.includes('premium') || venue.bestFor.includes('serious cocktails')) score += 8;
        }
        if (preferenceText.includes('local') || preferenceText.includes('locals')) {
          if (venue.bestFor.includes('locals')) score += 10;
        }

        return { ...venue, recommendationScore: score };
      })
      .sort((left, right) => right.recommendationScore - left.recommendationScore);

    return {
      agent: 'NightlifeCuratorAgent',
      input: input ?? {},
      topPicks: ranked.slice(0, 12),
      byMode: {
        cocktails: ranked.filter((venue) => venue.mode === 'cocktails').slice(0, 5),
        liveMusic: ranked.filter((venue) => venue.mode === 'live_music').slice(0, 5),
        clubs: ranked.filter((venue) => venue.mode === 'clubs').slice(0, 5),
        rooftops: ranked.filter((venue) => venue.mode === 'rooftops').slice(0, 5),
        speakeasies: ranked.filter((venue) => venue.mode === 'speakeasies').slice(0, 5),
      },
    };
  }
}
