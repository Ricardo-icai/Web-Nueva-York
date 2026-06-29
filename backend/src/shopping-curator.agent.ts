import { Injectable } from '@nestjs/common';

type ShoppingMode =
  | 'luxury'
  | 'department_store'
  | 'fashion'
  | 'sports'
  | 'sneakers_streetwear'
  | 'vintage'
  | 'beauty'
  | 'design_books'
  | 'market';

type ShoppingVenueInsight = {
  id: string;
  name: string;
  mode: ShoppingMode;
  neighborhood: string;
  whyItStandsOut: string;
  officialWebsite: string;
  sourceSignals: string[];
  editorialScore: number;
  bestFor: string[];
};

@Injectable()
export class ShoppingCuratorAgent {
  private readonly sources = {
    newspapersAndMagazines: [
      'The New York Times',
      'New York Magazine',
      'The Cut',
      'Time Out New York',
      'Condé Nast Traveler',
      'Vogue',
      'GQ',
      'Secret NYC',
      'The Infatuation neighborhood guides',
      'NYC Tourism editorials',
    ],
    shoppingSignals: [
      'official flagship store pages',
      'Fifth Avenue shopping guides',
      'SoHo shopping roundups',
      'Brooklyn neighborhood shopping lists',
      'sneaker culture editorials',
      'fashion and retail community recommendations',
    ],
    forumAndCommunityTargets: [
      'Reddit AskNYC shopping threads',
      'traveler shopping forums',
      'NYC neighborhood recommendation threads',
      'fashion community lists',
    ],
  };

  private readonly discoveryQueries = [
    'best shopping in new york city right now',
    'best luxury shopping in nyc',
    'best sneaker stores in nyc',
    'best sports stores in new york city',
    'best vintage stores in soho and brooklyn',
    'best department stores in manhattan',
  ];

  private readonly shortlist: ShoppingVenueInsight[] = [
    {
      id: 'bergdorf-goodman',
      name: 'Bergdorf Goodman',
      mode: 'luxury',
      neighborhood: 'Midtown East',
      whyItStandsOut: 'Es una de las tiendas mas iconicas de Nueva York para lujo clasico y sigue saliendo en casi cualquier seleccion seria de shopping premium.',
      officialWebsite: 'https://www.bergdorfgoodman.com/',
      sourceSignals: ['Fifth Avenue icon lists', 'luxury shopping editorials', 'official flagship presence'],
      editorialScore: 98,
      bestFor: ['luxury', 'classic nyc', 'gifts'],
    },
    {
      id: 'saks-fifth-avenue',
      name: 'Saks Fifth Avenue',
      mode: 'department_store',
      neighborhood: 'Midtown East',
      whyItStandsOut: 'Sigue siendo una referencia clarisima cuando se buscan grandes almacenes con marcas top en Manhattan.',
      officialWebsite: 'https://www.saksfifthavenue.com/',
      sourceSignals: ['holiday shopping coverage', 'official flagship presence', 'travel shopping guides'],
      editorialScore: 96,
      bestFor: ['multi-brand luxury', 'holiday shopping', 'fashion'],
    },
    {
      id: 'dover-street-market-new-york',
      name: 'Dover Street Market New York',
      mode: 'fashion',
      neighborhood: 'Murray Hill',
      whyItStandsOut: 'Tienda muy repetida en prensa de moda y listas de shopping con criterio para quien busca algo mas especial.',
      officialWebsite: 'https://newyork.doverstreetmarket.com/',
      sourceSignals: ['fashion editorials', 'retail design coverage', 'fashion community lists'],
      editorialScore: 95,
      bestFor: ['designer fashion', 'streetwear', 'fashion-insider'],
    },
    {
      id: 'kith-manhattan',
      name: 'Kith Manhattan',
      mode: 'sneakers_streetwear',
      neighborhood: 'NoHo',
      whyItStandsOut: 'Uno de los nombres mas repetidos para sneakers y streetwear de Nueva York.',
      officialWebsite: 'https://kith.com/pages/kith-manhattan',
      sourceSignals: ['streetwear roundups', 'sneaker community lists', 'official flagship presence'],
      editorialScore: 96,
      bestFor: ['sneakers', 'streetwear', 'viral brands'],
    },
    {
      id: 'nike-house-of-innovation-nyc',
      name: 'Nike House of Innovation NYC',
      mode: 'sports',
      neighborhood: 'Midtown East',
      whyItStandsOut: 'Flagship muy visible y una parada muy fuerte si el viaje tiene parte de deporte o sneakers.',
      officialWebsite: 'https://www.nike.com/retail/s/nike-nyc',
      sourceSignals: ['sports shopping guides', 'official flagship page', 'Fifth Avenue visibility'],
      editorialScore: 93,
      bestFor: ['sportswear', 'sneakers', 'family'],
    },
    {
      id: 'flight-club-new-york',
      name: 'Flight Club New York',
      mode: 'sneakers_streetwear',
      neighborhood: 'NoHo',
      whyItStandsOut: 'Tiene mucho peso historico y cultural cuando se habla de sneaker shopping en NYC.',
      officialWebsite: 'https://www.flightclub.com/new-york',
      sourceSignals: ['sneaker editorials', 'collector guides', 'community reputation'],
      editorialScore: 94,
      bestFor: ['collectors', 'rare pairs', 'sneaker culture'],
    },
    {
      id: 'the-strand',
      name: 'The Strand',
      mode: 'design_books',
      neighborhood: 'Union Square',
      whyItStandsOut: 'Es una parada clasica para regalos, libros y sensacion de Nueva York de verdad.',
      officialWebsite: 'https://www.strandbooks.com/',
      sourceSignals: ['NYC classic lists', 'independent bookstore guides', 'official flagship presence'],
      editorialScore: 95,
      bestFor: ['books', 'gifts', 'family'],
    },
  ];

  getBriefing() {
    return {
      agent: 'ShoppingCuratorAgent',
      mission:
        'Discover, rank and monitor the most relevant shopping destinations in New York City across luxury, fashion, sports, sneakers, vintage, beauty, design, books and markets using editorial, local and official sources.',
      responsibilities: [
        'Buscar tiendas famosas y realmente utiles para un viaje a Nueva York.',
        'Cruzar periodicos, revistas, guias de shopping, foros y webs oficiales.',
        'Separar claramente lujo, moda, deportes, sneakers, vintage, belleza y regalos.',
        'Priorizar tiendas con peso editorial y web oficial clara.',
        'Mantener una shortlist preparada para mapa, filtros y frontend.',
      ],
      sourceBuckets: this.sources,
      discoveryQueries: this.discoveryQueries,
      curatedShortlist: this.shortlist,
    };
  }
}
