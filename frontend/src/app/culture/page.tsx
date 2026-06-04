import Image from "next/image";
import FavoriteToggleButton from "@/components/favorites/FavoriteToggleButton";
import FavoritesRail, { type FavoriteRailItem } from "@/components/favorites/FavoritesRail";
import CulturalMap, { type CulturalMapPoint } from "@/components/culture/CulturalMap";
import CultureExperienceImage from "@/components/culture/CultureExperienceImage";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";

type CultureExperience = {
  name: string;
  category: "Museo" | "Monumento" | "Arquitectura" | "Barrio" | "Street Art" | "Escena" | "Literatura" | "Musica";
  image: string;
  description: string;
  officialWebsite: string;
  googleMapsUrl: string;
  openingHours: string;
  ticketInfo: string;
  familySuitability: string;
  estimatedDuration: string;
  transportRecommendation: string;
  badges: string[];
  lat: number;
  lng: number;
};

type CultureRoute = {
  name: string;
  focus: string;
  stops: string[];
  weather: string;
  bestFor: string;
  transport: string;
};
const CULTURE_FAVORITES_KEY = "nyc_culture_favorites_v1";

const BADGES = [
  "Imprescindible",
  "Patrimonio Historico",
  "Familiar",
  "Gratis",
  "Arquitectura Iconica",
  "Arte Urbano",
  "Broadway",
  "Historia de Nueva York",
  "Experiencia Premium",
  "Recomendado por Locales",
];

function maps(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function commonsFile(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

const CULTURE_IMAGE_OVERRIDES: Record<string, string> = {
  "The Metropolitan Museum of Art": commonsFile("Metropolitan Museum of Art.jpg"),
  "Museum of Modern Art (MoMA)": commonsFile("Museum of Modern Art, 11 W. 53rd St., New York City. LOC gsc.5a08719.jpg"),
  "American Museum of Natural History": commonsFile("American Museum of Natural History, New York, N.Y. NYPL-805860.jpg"),
  "Guggenheim Museum": commonsFile("Solomon R. Guggenheim Museum (48059131351).jpg"),
  "Whitney Museum": commonsFile("Square, Whitney Museum of American Art (Unsplash).jpg"),
  "The Frick Collection": commonsFile("The Frick Collection (49958273187).jpg"),
  "New Museum": commonsFile("The New Museum on the Bowery. - panoramio.jpg"),
  "Brooklyn Museum": commonsFile("Brooklyn Museum - Brooklyn, NY - DSC07980.JPG"),
  "Intrepid Museum": commonsFile("USS Intrepid (CV-11) at Intrepid Sea, Air & Space Museum, NYC, 20231002 1342 1710.jpg"),
  "Tenement Museum": commonsFile("Tenement Museum, New York City.jpg"),
  "Statue of Liberty": commonsFile("New York City (New York, USA), Statue of Liberty -- 2012 -- 6814.jpg"),
  "Ellis Island": commonsFile("Ellis Island Main Building.jpg"),
  "Federal Hall": commonsFile("Federal Hall National Memorial 26 Wall Street.jpg"),
  "Trinity Church": commonsFile("Trinity Church Wall Street New York.jpg"),
  "St. Patrick's Cathedral": commonsFile("St. Patrick's Cathedral NYC.jpg"),
  "Grand Central Terminal": commonsFile("Grand Central Terminal Main Concourse Jan 2006.jpg"),
  "Rockefeller Center": commonsFile("Rockefeller Center New York City.jpg"),
  "Brooklyn Bridge": commonsFile("Brooklyn Bridge Postdlf.jpg"),
  "One World Trade Center": commonsFile("One World Trade Center, September 2017.jpg"),
  "9/11 Memorial & Museum": commonsFile("National September 11 Memorial (South Pool).jpg"),
  "Empire State Building": commonsFile("Empire State Building all.jpg"),
  "Chrysler Building": commonsFile("Chrysler Building, New York.jpg"),
  "Flatiron Building": commonsFile("Flatiron building.jpg"),
  "Woolworth Building": commonsFile("WoolworthBuilding.JPG"),
  "The Vessel": commonsFile("Vessel, Hudson Yards, New York City.jpg"),
  "The Oculus": commonsFile("Westfield World Trade Center Oculus.jpg"),
  "Seagram Building": commonsFile("Seagram Building (51552718926).jpg"),
  "Lever House": commonsFile("Lever House 390 Park Avenue.jpg"),
  Harlem: commonsFile("Apollo Theater, Harlem (51516410245).jpg"),
  "Greenwich Village": commonsFile("Washington Square Park in Greenwich Village.jpg"),
  SoHo: commonsFile("Greene Street, SoHo, NYC.jpg"),
  Tribeca: commonsFile("Tribeca - New York City.jpg"),
  Chinatown: commonsFile("Doyers Street Chinatown NYC.jpg"),
  "Little Italy": commonsFile("Mulberry Street, Little Italy, Manhattan.jpg"),
  "Lower East Side": commonsFile("Orchard Street Lower East Side Manhattan.jpg"),
  Williamsburg: commonsFile("Williamsburg Bridge from Domino Park.jpg"),
  DUMBO: commonsFile("Manhattan Bridge from Dumbo.jpg"),
  "Bushwick Collective": commonsFile("Bushwick Collective street art.jpg"),
  "DUMBO murals": commonsFile("Dumbo Walls Brooklyn.jpg"),
  "Lower East Side street art": commonsFile("Lower East Side street art.jpg"),
  "Williamsburg murals": commonsFile("Williamsburg Brooklyn mural.jpg"),
  "Broadway theatres": commonsFile("Broadway Theatre District NYC.jpg"),
  "Lincoln Center": commonsFile("Lincoln Center Metropolitan Opera House.jpg"),
  "Carnegie Hall": commonsFile("Carnegie Hall, NYC.jpg"),
  "Radio City Music Hall": commonsFile("Radio City Music Hall NYC.jpg"),
  "New York Public Library": commonsFile("New York Public Library Main Branch 2012.jpg"),
  "Strand Book Store": commonsFile("Strand Bookstore NYC.jpg"),
  "Hotel Chelsea": commonsFile("Hotel Chelsea NYC.jpg"),
  "Film locations route": commonsFile("Times Square at night.jpg"),
  "Harlem Jazz history": commonsFile("Apollo Theater, Harlem (51516410245).jpg"),
  "Apollo Theater": commonsFile("Apollo Theater, Harlem (51516410245).jpg"),
  "Birdland Jazz Club": commonsFile("Birdland Jazz Club NYC.jpg"),
  "Blue Note": commonsFile("Blue Note Jazz Club New York.jpg"),
};

function cultureImageFor(item: CultureExperience) {
  return CULTURE_IMAGE_OVERRIDES[item.name] ?? item.image;
}

function experienceAnchor(name: string) {
  return `culture-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const museums: CultureExperience[] = [
  {
    name: "The Metropolitan Museum of Art",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1581521028875-5b318ab52b1c?auto=format&fit=crop&w=1600&q=84",
    description: "El gran museo enciclopedico de Nueva York: Egipto, arte europeo, America, moda, armaduras y colecciones que explican siglos de historia visual.",
    officialWebsite: "https://www.metmuseum.org/",
    googleMapsUrl: maps("The Metropolitan Museum of Art New York"),
    openingHours: "Consultar horario actualizado en la web oficial; suele cerrar algunos miercoles.",
    ticketInfo: "Entrada general de pago para visitantes; residentes de NY con pay-what-you-wish.",
    familySuitability: "Muy familiar; ideal para ninos curiosos, adolescentes y adultos.",
    estimatedDuration: "3-5 h",
    transportRecommendation: "4/5/6 hasta 86 St o bus M1/M2/M3/M4 por Museum Mile.",
    badges: ["Imprescindible", "Familiar", "Experiencia Premium"],
    lat: 40.7794,
    lng: -73.9632,
  },
  {
    name: "Museum of Modern Art (MoMA)",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1598540324147-4df7d59bbfaa?auto=format&fit=crop&w=1600&q=84",
    description: "El templo del arte moderno: Van Gogh, Picasso, Warhol, arquitectura, fotografia, diseno y exposiciones temporales de primer nivel.",
    officialWebsite: "https://www.moma.org/",
    googleMapsUrl: maps("Museum of Modern Art MoMA New York"),
    openingHours: "Consultar web oficial; horarios ampliados en fechas seleccionadas.",
    ticketInfo: "Entrada de pago; menores y miembros pueden tener condiciones especiales.",
    familySuitability: "Muy buena para adolescentes y adultos; apta para familias con visita corta.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "E/M hasta 5 Av-53 St o B/D/F/M hasta 47-50 Sts.",
    badges: ["Imprescindible", "Experiencia Premium"],
    lat: 40.7614,
    lng: -73.9779,
  },
  {
    name: "American Museum of Natural History",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1605722243979-fe0be815d1a9?auto=format&fit=crop&w=1600&q=84",
    description: "Dinosaurios, planetario, oceanos, biodiversidad y ciencia en una experiencia perfecta para familias.",
    officialWebsite: "https://www.amnh.org/",
    googleMapsUrl: maps("American Museum of Natural History New York"),
    openingHours: "Consultar web oficial; horarios y planetario cambian por fecha.",
    ticketInfo: "Entrada de pago; algunas experiencias requieren ticket adicional.",
    familySuitability: "Excelente para ninos, adolescentes y abuelos.",
    estimatedDuration: "3-4 h",
    transportRecommendation: "B/C hasta 81 St-Museum of Natural History.",
    badges: ["Imprescindible", "Familiar"],
    lat: 40.7813,
    lng: -73.9739,
  },
  {
    name: "Guggenheim Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=84",
    description: "Frank Lloyd Wright, rampa helicoidal y arte moderno en uno de los edificios culturales mas reconocibles del mundo.",
    officialWebsite: "https://www.guggenheim.org/",
    googleMapsUrl: maps("Solomon R. Guggenheim Museum New York"),
    openingHours: "Consultar horario oficial; exposiciones y cierres parciales pueden variar.",
    ticketInfo: "Entrada de pago; reservar online recomendado.",
    familySuitability: "Buena para adolescentes y adultos; visita manejable para familias.",
    estimatedDuration: "1.5-2.5 h",
    transportRecommendation: "4/5/6 hasta 86 St y caminar por Museum Mile.",
    badges: ["Arquitectura Iconica", "Experiencia Premium"],
    lat: 40.783,
    lng: -73.959,
  },
  {
    name: "Whitney Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1564659907532-6b5f98c8e70f?auto=format&fit=crop&w=1600&q=84",
    description: "Arte estadounidense contemporaneo junto al High Line, con terrazas y vistas urbanas.",
    officialWebsite: "https://whitney.org/",
    googleMapsUrl: maps("Whitney Museum of American Art New York"),
    openingHours: "Consultar web oficial; horarios nocturnos pueden variar.",
    ticketInfo: "Entrada de pago; algunas franjas con acceso especial.",
    familySuitability: "Buena para adolescentes y adultos.",
    estimatedDuration: "2 h",
    transportRecommendation: "A/C/E o L hasta 14 St y caminar a Meatpacking District.",
    badges: ["Recomendado por Locales", "Experiencia Premium"],
    lat: 40.7396,
    lng: -74.0089,
  },
  {
    name: "The Frick Collection",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1565876427310-0695a4ff03b7?auto=format&fit=crop&w=1600&q=84",
    description: "Una coleccion refinada de pintura europea, artes decorativas y ambiente palaciego en el Upper East Side.",
    officialWebsite: "https://www.frick.org/",
    googleMapsUrl: maps("The Frick Collection New York"),
    openingHours: "Consultar horario oficial; reaperturas y acceso pueden cambiar.",
    ticketInfo: "Entrada de pago; reserva recomendada.",
    familySuitability: "Mejor para adultos y adolescentes interesados en arte clasico.",
    estimatedDuration: "1.5-2 h",
    transportRecommendation: "6 hasta 68 St-Hunter College o Q hasta 72 St.",
    badges: ["Experiencia Premium", "Historia de Nueva York"],
    lat: 40.7712,
    lng: -73.967,
  },
  {
    name: "New Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?auto=format&fit=crop&w=1600&q=84",
    description: "Arte contemporaneo experimental en Bowery, perfecto para entender el pulso cultural del Lower East Side.",
    officialWebsite: "https://www.newmuseum.org/",
    googleMapsUrl: maps("New Museum New York"),
    openingHours: "Consultar web oficial; calendario ligado a exposiciones temporales.",
    ticketInfo: "Entrada de pago; descuentos segun perfil.",
    familySuitability: "Mejor para adolescentes y adultos.",
    estimatedDuration: "1.5 h",
    transportRecommendation: "B/D/F/M hasta Broadway-Lafayette o J/Z hasta Bowery.",
    badges: ["Recomendado por Locales"],
    lat: 40.7224,
    lng: -73.993,
  },
  {
    name: "Brooklyn Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1532167080057-e8e966c4e2e4?auto=format&fit=crop&w=1600&q=84",
    description: "Arte, culturas del mundo, historia de Brooklyn y exposiciones potentes junto a Prospect Park.",
    officialWebsite: "https://www.brooklynmuseum.org/",
    googleMapsUrl: maps("Brooklyn Museum New York"),
    openingHours: "Consultar web oficial; horarios por exposicion y eventos.",
    ticketInfo: "Entrada de pago con opciones de descuento.",
    familySuitability: "Muy buena para familias y adolescentes.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "2/3 hasta Eastern Parkway-Brooklyn Museum.",
    badges: ["Familiar", "Recomendado por Locales"],
    lat: 40.6712,
    lng: -73.9636,
  },
  {
    name: "Intrepid Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1542567455-cd733f23fbbd?auto=format&fit=crop&w=1600&q=84",
    description: "Portaaviones, submarino, aviacion y tecnologia espacial sobre el Hudson River.",
    officialWebsite: "https://intrepidmuseum.org/",
    googleMapsUrl: maps("Intrepid Museum New York"),
    openingHours: "Consultar web oficial; horarios cambian por temporada.",
    ticketInfo: "Entrada de pago; experiencias especiales con suplemento.",
    familySuitability: "Excelente para ninos, adolescentes y adultos.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "A/C/E hasta 42 St-Port Authority y caminar al Pier 86.",
    badges: ["Familiar", "Historia de Nueva York"],
    lat: 40.7645,
    lng: -73.9996,
  },
  {
    name: "Tenement Museum",
    category: "Museo",
    image: "https://images.unsplash.com/photo-1571172964276-91faaa704e1f?auto=format&fit=crop&w=1600&q=84",
    description: "La historia de la inmigracion en Nueva York contada desde apartamentos, familias reales y recorridos guiados.",
    officialWebsite: "https://www.tenement.org/",
    googleMapsUrl: maps("Tenement Museum New York"),
    openingHours: "Consultar web oficial; tours guiados por horario reservado.",
    ticketInfo: "Ticket de tour obligatorio; reserva anticipada recomendada.",
    familySuitability: "Muy buena para adolescentes; algunos tours aptos para ninos.",
    estimatedDuration: "1.5-2 h",
    transportRecommendation: "F/J/M/Z hasta Delancey St-Essex St.",
    badges: ["Historia de Nueva York", "Patrimonio Historico"],
    lat: 40.7188,
    lng: -73.9901,
  },
];

const monuments: CultureExperience[] = [
  {
    name: "Statue of Liberty",
    category: "Monumento",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/New_York_City_%28New_York%2C_USA%29%2C_Statue_of_Liberty_--_2012_--_6814.jpg",
    description: "Simbolo de libertad, inmigracion y llegada a America. Imprescindible combinarlo con Ellis Island.",
    officialWebsite: "https://www.nps.gov/stli/",
    googleMapsUrl: maps("Statue of Liberty New York"),
    openingHours: "Consultar National Park Service y Statue City Cruises para horarios de ferry.",
    ticketInfo: "Acceso por ferry oficial; pedestal/corona requieren reserva especifica.",
    familySuitability: "Muy familiar.",
    estimatedDuration: "3-5 h",
    transportRecommendation: "1 a South Ferry o R/W a Whitehall St; ferry oficial desde Battery Park.",
    badges: ["Imprescindible", "Patrimonio Historico", "Familiar"],
    lat: 40.6892,
    lng: -74.0445,
  },
  {
    name: "Ellis Island",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1564168680482-1161c041fc39?auto=format&fit=crop&w=1600&q=84",
    description: "La puerta historica de millones de inmigrantes. Museo esencial para entender la identidad de Nueva York.",
    officialWebsite: "https://www.nps.gov/elis/",
    googleMapsUrl: maps("Ellis Island New York"),
    openingHours: "Consultar horarios de ferry y museo en la web oficial.",
    ticketInfo: "Incluido en ferry oficial Statue City Cruises.",
    familySuitability: "Familiar y educativo.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "Mismo ferry oficial de Statue of Liberty desde Battery Park.",
    badges: ["Patrimonio Historico", "Historia de Nueva York", "Familiar"],
    lat: 40.6995,
    lng: -74.0396,
  },
  {
    name: "Federal Hall",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=84",
    description: "Lugar asociado a la toma de posesion de George Washington y al nacimiento institucional de Estados Unidos.",
    officialWebsite: "https://www.nps.gov/feha/",
    googleMapsUrl: maps("Federal Hall New York"),
    openingHours: "Consultar National Park Service; puede cerrar por eventos federales.",
    ticketInfo: "Generalmente gratuito.",
    familySuitability: "Buena para familias con interes historico.",
    estimatedDuration: "30-60 min",
    transportRecommendation: "4/5 a Wall St o R/W a Rector St.",
    badges: ["Gratis", "Patrimonio Historico"],
    lat: 40.7073,
    lng: -74.0101,
  },
  {
    name: "Trinity Church",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1566136136776-5f5fa390a330?auto=format&fit=crop&w=1600&q=84",
    description: "Iglesia historica de Wall Street, cementerio colonial y arquitectura gotica en pleno Financial District.",
    officialWebsite: "https://trinitywallstreet.org/",
    googleMapsUrl: maps("Trinity Church Wall Street New York"),
    openingHours: "Consultar web oficial; servicios religiosos pueden limitar visitas.",
    ticketInfo: "Entrada gratuita; donaciones opcionales.",
    familySuitability: "Apta para todas las edades.",
    estimatedDuration: "30-45 min",
    transportRecommendation: "4/5 a Wall St o R/W a Rector St.",
    badges: ["Gratis", "Patrimonio Historico"],
    lat: 40.7081,
    lng: -74.012,
  },
  {
    name: "St. Patrick's Cathedral",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1583864697784-a0efc8379f70?auto=format&fit=crop&w=1600&q=84",
    description: "Catedral neogotica frente a Rockefeller Center: contraste perfecto entre espiritualidad, piedra y Midtown.",
    officialWebsite: "https://saintpatrickscathedral.org/",
    googleMapsUrl: maps("St. Patrick's Cathedral New York"),
    openingHours: "Consultar horarios de visita y misas en web oficial.",
    ticketInfo: "Entrada gratuita; tours pueden ser de pago.",
    familySuitability: "Apta para familias.",
    estimatedDuration: "30-60 min",
    transportRecommendation: "E/M a 5 Av-53 St o B/D/F/M a Rockefeller Center.",
    badges: ["Gratis", "Arquitectura Iconica"],
    lat: 40.7585,
    lng: -73.976,
  },
  {
    name: "Grand Central Terminal",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=84",
    description: "La gran estacion de Nueva York: boveda celeste, Vanderbilt Hall, reloj central y energia urbana.",
    officialWebsite: "https://www.grandcentralterminal.com/",
    googleMapsUrl: maps("Grand Central Terminal New York"),
    openingHours: "Estacion operativa diariamente; tiendas y tours tienen horarios propios.",
    ticketInfo: "Entrada gratuita; tours guiados de pago disponibles.",
    familySuitability: "Muy familiar.",
    estimatedDuration: "30-90 min",
    transportRecommendation: "4/5/6/7/S a Grand Central-42 St.",
    badges: ["Gratis", "Arquitectura Iconica", "Imprescindible"],
    lat: 40.7527,
    lng: -73.9772,
  },
  {
    name: "Rockefeller Center",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=84",
    description: "Complejo art deco, murales, plaza, Radio City y una de las concentraciones culturales mas famosas de Midtown.",
    officialWebsite: "https://www.rockefellercenter.com/",
    googleMapsUrl: maps("Rockefeller Center New York"),
    openingHours: "Plaza abierta; atracciones y tiendas con horarios propios.",
    ticketInfo: "Zona gratuita; Top of the Rock y tours son de pago.",
    familySuitability: "Muy familiar.",
    estimatedDuration: "1-2 h",
    transportRecommendation: "B/D/F/M a 47-50 Sts-Rockefeller Center.",
    badges: ["Arquitectura Iconica", "Familiar"],
    lat: 40.7587,
    lng: -73.9787,
  },
  {
    name: "Brooklyn Bridge",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=84",
    description: "Ingenieria, skyline e historia urbana. Cruzarlo caminando conecta Manhattan con Brooklyn y el siglo XIX con el presente.",
    officialWebsite: "https://www.nyc.gov/html/dot/html/infrastructure/brooklyn-bridge.shtml",
    googleMapsUrl: maps("Brooklyn Bridge New York"),
    openingHours: "Acceso peatonal abierto; evitar horas punta y mal clima.",
    ticketInfo: "Gratis.",
    familySuitability: "Familiar, con cuidado por bicis y aglomeraciones.",
    estimatedDuration: "1-1.5 h",
    transportRecommendation: "4/5/6 a Brooklyn Bridge-City Hall o A/C a High St.",
    badges: ["Gratis", "Arquitectura Iconica", "Imprescindible"],
    lat: 40.7061,
    lng: -73.9969,
  },
  {
    name: "One World Trade Center",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1543716091-a840c05249ec?auto=format&fit=crop&w=1600&q=84",
    description: "Rascacielos simbolico del downtown contemporaneo, junto al Memorial del 11-S y el Oculus.",
    officialWebsite: "https://www.oneworldobservatory.com/",
    googleMapsUrl: maps("One World Trade Center New York"),
    openingHours: "Consultar observatorio; horarios cambian por temporada.",
    ticketInfo: "Exterior gratuito; observatorio de pago.",
    familySuitability: "Familiar.",
    estimatedDuration: "1-2 h",
    transportRecommendation: "A/C/E, 2/3, 4/5 o R/W hacia World Trade Center/Fulton St.",
    badges: ["Arquitectura Iconica", "Historia de Nueva York"],
    lat: 40.7127,
    lng: -74.0134,
  },
  {
    name: "9/11 Memorial & Museum",
    category: "Monumento",
    image: "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=1600&q=84",
    description: "Memorial y museo imprescindible para comprender el 11 de septiembre, la memoria publica y la resiliencia de la ciudad.",
    officialWebsite: "https://www.911memorial.org/",
    googleMapsUrl: maps("9/11 Memorial Museum New York"),
    openingHours: "Consultar web oficial; horarios del museo y memorial pueden diferir.",
    ticketInfo: "Memorial gratuito; museo de pago.",
    familySuitability: "Mejor para adolescentes y adultos por sensibilidad del contenido.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "E a World Trade Center o 2/3 a Park Place.",
    badges: ["Historia de Nueva York", "Patrimonio Historico"],
    lat: 40.7115,
    lng: -74.0134,
  },
];

const architecture: CultureExperience[] = [
  ["Empire State Building", "Art deco vertical y emblema de Manhattan.", "https://www.esbnyc.com/", 40.7484, -73.9857],
  ["Chrysler Building", "La corona art deco mas elegante de Midtown.", "https://www.chryslerbuilding.com/", 40.7516, -73.9755],
  ["Flatiron Building", "Triangulo urbano, Broadway y Madison Square.", "https://www.nyc.gov/site/lpc/index.page", 40.7411, -73.9897],
  ["Woolworth Building", "Catedral del comercio y rascacielos historico.", "https://www.woolworthtours.com/", 40.7124, -74.0084],
  ["The Vessel", "Estructura escultorica de Hudson Yards.", "https://www.hudsonyardsnewyork.com/discover/vessel", 40.7538, -74.0022],
  ["The Oculus", "Arquitectura de Santiago Calatrava y nodo de transporte.", "https://www.officialworldtradecenter.com/en/local/learn-about-wtc/oculus.html", 40.7115, -74.0113],
  ["Seagram Building", "Mies van der Rohe y el canon del modernismo corporativo.", "https://www.seagrambuilding.com/", 40.7584, -73.9725],
  ["Lever House", "Icono International Style en Park Avenue.", "https://www.leverhouseartcollection.com/", 40.759,
    -73.9726],
].map(([name, description, officialWebsite, lat, lng]) => ({
  name: String(name),
  category: "Arquitectura" as const,
  image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1600&q=84",
  description: String(description),
  officialWebsite: String(officialWebsite),
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Exterior visible a diario; acceso interior sujeto al edificio o tour.",
  ticketInfo: name === "Empire State Building" || name === "The Vessel" ? "Atraccion de pago o reserva segun disponibilidad." : "Vista exterior gratuita; tours si aplica.",
  familySuitability: "Apta para familias, adolescentes y adultos.",
  estimatedDuration: "20-90 min",
  transportRecommendation: "Usar metro cercano y combinar varias paradas en ruta arquitectonica.",
  badges: ["Arquitectura Iconica"],
  lat: Number(lat),
  lng: Number(lng),
}));

const neighborhoods = [
  ["Harlem", "Renacimiento afroamericano, jazz, gospel, Apollo Theater y brownstones.", "Arquitectura residencial, iglesias y avenidas historicas.", "Cuna cultural afroamericana y musical.", "125 St -> Apollo Theater -> Strivers Row -> Morningside Heights.", 40.8116, -73.9465],
  ["Greenwich Village", "Bohemia, literatura, musica folk, Stonewall y vida universitaria.", "Calles irregulares, townhouses y Washington Square.", "Identidad artistica y movimientos sociales.", "Washington Square -> MacDougal St -> Stonewall -> West Village.", 40.7336, -74.0027],
  ["SoHo", "Antiguo distrito industrial convertido en paisaje de hierro fundido.", "Cast-iron architecture y lofts.", "Arte, galerias historicas y transformacion urbana.", "Broadway -> Greene St -> Prince St -> Houston.", 40.724,
    -74.0018],
  ["Tribeca", "Almacenes, cine, lofts y reconversion postindustrial.", "Calles adoquinadas y edificios industriales.", "Festival de cine e identidad downtown.", "Chambers St -> Greenwich St -> Hudson St -> Duane Park.", 40.7163, -74.0086],
  ["Chinatown", "Historia migrante, asociaciones familiares y vida comunitaria.", "Calles densas, templos, mercados y rotulos.", "Uno de los enclaves culturales mas vivos de la ciudad.", "Canal St -> Mott St -> Doyers St -> Columbus Park.", 40.7158, -73.997],
  ["Little Italy", "Memoria italoamericana, Mulberry Street y fiestas historicas.", "Bajos comerciales y calles estrechas.", "Herencia migrante del downtown.", "Mulberry St -> Grand St -> Elizabeth St.", 40.7191, -73.9973],
  ["Lower East Side", "Inmigracion, tenements, musica, arte y contracultura.", "Edificios de vivienda obrera y fachadas comerciales.", "Clave para entender el NYC migrante.", "Tenement Museum -> Orchard St -> Essex Market -> Bowery.", 40.7188, -73.9896],
  ["Williamsburg", "Cultura industrial, comunidades migrantes y escena creativa.", "Waterfront, almacenes y murales.", "Brooklyn contemporaneo y musica alternativa.", "Bedford Av -> Domino Park -> murals -> East River.", 40.7081, -73.9571],
  ["DUMBO", "Industrial waterfront, puentes y fotografia urbana.", "Adoquines, almacenes y vistas a Manhattan.", "Paisaje visual clave de Brooklyn.", "Manhattan Bridge View -> Brooklyn Bridge Park -> Jane's Carousel.", 40.7033, -73.9895],
].map(([name, history, architectureText, significance, walkingRoute, lat, lng]) => ({
  name: String(name),
  category: "Barrio" as const,
  image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=84",
  description: `${history} Arquitectura: ${architectureText} Significado cultural: ${significance} Ruta: ${walkingRoute}`,
  officialWebsite: "https://www.nyctourism.com/",
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Barrio visitable a diario; priorizar horas de luz para rutas a pie.",
  ticketInfo: "Gratis; tours guiados opcionales.",
  familySuitability: "Apto para familias si se ajusta duracion y descansos.",
  estimatedDuration: "1.5-3 h",
  transportRecommendation: "Llegar en metro y caminar por ruta lineal.",
  badges: ["Historia de Nueva York", "Recomendado por Locales"],
  lat: Number(lat),
  lng: Number(lng),
}));

const streetArt: CultureExperience[] = [
  ["Bushwick Collective", "Galeria urbana al aire libre en Brooklyn con murales de gran formato.", "https://www.thebushwickcollective.com/", 40.7075, -73.923],
  ["DUMBO murals", "Murales y arte publico entre puentes, adoquines y waterfront.", "https://dumbo.is/", 40.7033, -73.9895],
  ["Lower East Side street art", "Capas de graffiti, carteles, galerias y memoria contracultural.", "https://www.nyctourism.com/", 40.7188, -73.9896],
  ["Williamsburg murals", "Murales, fachadas industriales y cultura visual de Brooklyn.", "https://www.nyctourism.com/new-york/brooklyn/williamsburg/", 40.7081, -73.9571],
].map(([name, description, officialWebsite, lat, lng]) => ({
  name: String(name),
  category: "Street Art" as const,
  image: "https://images.unsplash.com/photo-1566138970842-0e1f7b53f501?auto=format&fit=crop&w=1600&q=84",
  description: String(description),
  officialWebsite: String(officialWebsite),
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Espacio urbano exterior; mejor de dia y con buen clima.",
  ticketInfo: "Gratis; tours especializados opcionales.",
  familySuitability: "Buena para adolescentes y adultos; apta para familias de dia.",
  estimatedDuration: "1-2 h",
  transportRecommendation: "Usar metro cercano y caminar; evitar coche.",
  badges: ["Arte Urbano", "Gratis", "Recomendado por Locales"],
  lat: Number(lat),
  lng: Number(lng),
}));

const stageArts: CultureExperience[] = [
  ["Broadway theatres", "El corazon mundial del teatro comercial y musical.", "https://www.broadway.org/", 40.759, -73.9845, "Broadway"],
  ["Lincoln Center", "Opera, ballet, filarmonica, jazz y artes escenicas de referencia.", "https://www.lincolncenter.org/", 40.7725, -73.9835, "Experiencia Premium"],
  ["Carnegie Hall", "Sala historica de conciertos clasicos, jazz y recitales.", "https://www.carnegiehall.org/", 40.7651, -73.9799, "Musica"],
  ["Radio City Music Hall", "Art deco, Rockettes y grandes espectaculos.", "https://www.rockefellercenter.com/attractions/radio-city-music-hall/", 40.7601, -73.9802, "Broadway"],
].map(([name, description, officialWebsite, lat, lng, badge]) => ({
  name: String(name),
  category: "Escena" as const,
  image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1600&q=84",
  description: String(description),
  officialWebsite: String(officialWebsite),
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Consultar calendario oficial; horarios dependen del espectaculo.",
  ticketInfo: "Entradas de pago; disponibilidad variable. APIs recomendadas: Ticketmaster/Eventbrite/Broadway.org.",
  familySuitability: "Depende del espectaculo; revisar edad recomendada.",
  estimatedDuration: "2-3 h",
  transportRecommendation: "Llegar en metro y salir por calles laterales si hay mucha afluencia.",
  badges: [String(badge), "Experiencia Premium"],
  lat: Number(lat),
  lng: Number(lng),
}));

const literatureCinema: CultureExperience[] = [
  ["New York Public Library", "Templo literario Beaux-Arts, Rose Main Reading Room y Bryant Park.", "https://www.nypl.org/locations/schwarzman", 40.7532, -73.9822],
  ["Strand Book Store", "18 miles of books y cultura lectora del Village.", "https://www.strandbooks.com/", 40.7333, -73.9909],
  ["Hotel Chelsea", "Literatura, musica, arte y leyenda bohemia.", "https://hotelchelsea.com/", 40.7445, -73.9965],
  ["Film locations route", "Ruta por escenarios de cine: Grand Central, Katz's, Central Park, Brooklyn Bridge y Times Square.", "https://www.nyctourism.com/", 40.758, -73.9855],
].map(([name, description, officialWebsite, lat, lng]) => ({
  name: String(name),
  category: "Literatura" as const,
  image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=84",
  description: String(description),
  officialWebsite: String(officialWebsite),
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Consultar web oficial; bibliotecas, librerias y hoteles varian por dia.",
  ticketInfo: "NYPL suele ser gratuita; compras/tours/eventos segun lugar.",
  familySuitability: "Buena para adolescentes, adultos y familias tranquilas.",
  estimatedDuration: "45 min-2 h",
  transportRecommendation: "Metro a Bryant Park, Union Square o Chelsea segun parada.",
  badges: ["Historia de Nueva York", "Recomendado por Locales"],
  lat: Number(lat),
  lng: Number(lng),
}));

const music: CultureExperience[] = [
  ["Harlem Jazz history", "Ruta por el legado jazzistico de Harlem, clubs historicos y comunidad afroamericana.", "https://www.nyctourism.com/new-york/manhattan/harlem/", 40.8116, -73.9465],
  ["Apollo Theater", "Escenario mitico de Harlem y plataforma de generaciones de artistas.", "https://www.apollotheater.org/", 40.81, -73.9501],
  ["Birdland Jazz Club", "Jazz clasico en Theater District.", "https://www.birdlandjazz.com/", 40.759,
    -73.989],
  ["Blue Note", "Club historico de Greenwich Village.", "https://www.bluenotejazz.com/nyc/", 40.7308, -74.0006],
  ["Carnegie Hall", "Historia musical global desde Midtown.", "https://www.carnegiehall.org/", 40.7651, -73.9799],
].map(([name, description, officialWebsite, lat, lng]) => ({
  name: String(name),
  category: "Musica" as const,
  image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1600&q=84",
  description: String(description),
  officialWebsite: String(officialWebsite),
  googleMapsUrl: maps(`${name} New York`),
  openingHours: "Consultar calendario oficial; shows nocturnos y matinees cambian por fecha.",
  ticketInfo: "Entradas de pago para espectaculos; rutas de Harlem pueden ser gratuitas.",
  familySuitability: "Depende del horario; Harlem y Carnegie Hall son buenas opciones familiares segun programa.",
  estimatedDuration: "1.5-3 h",
  transportRecommendation: "Metro cercano y regreso planificado si es show nocturno.",
  badges: ["Historia de Nueva York", "Experiencia Premium"],
  lat: Number(lat),
  lng: Number(lng),
}));

const allExperiences = [...museums, ...monuments, ...architecture, ...neighborhoods, ...streetArt, ...stageArts, ...literatureCinema, ...music];

const routes: CultureRoute[] = [
  {
    name: "Art Route",
    focus: "Met, Guggenheim, MoMA y Whitney",
    stops: ["The Metropolitan Museum of Art", "Guggenheim Museum", "Museum of Modern Art (MoMA)", "Whitney Museum"],
    weather: "Ideal con lluvia o frio porque prioriza interiores.",
    bestFor: "adultos, adolescentes y seniors",
    transport: "4/5/6 por Museum Mile; E/M y A/C/E para Midtown/Meatpacking.",
  },
  {
    name: "Architecture Route",
    focus: "Art deco, modernismo y downtown",
    stops: ["Grand Central Terminal", "Chrysler Building", "Empire State Building", "Flatiron Building", "The Oculus"],
    weather: "Mejor con buen tiempo; dividir si hay calor intenso.",
    bestFor: "familias, fotografos y viajeros primera vez",
    transport: "Metro 4/5/6/7/S, N/Q/R/W y E.",
  },
  {
    name: "Historic Route",
    focus: "Origen politico, inmigracion y memoria",
    stops: ["Federal Hall", "Trinity Church", "9/11 Memorial & Museum", "Statue of Liberty", "Ellis Island"],
    weather: "Si llueve, priorizar Federal Hall, 9/11 Museum y Tenement Museum.",
    bestFor: "familias con adolescentes y adultos",
    transport: "1/R/W/4/5 hacia Lower Manhattan; ferry oficial a islas.",
  },
  {
    name: "Broadway Route",
    focus: "Teatro, musica y Midtown cultural",
    stops: ["Broadway theatres", "Radio City Music Hall", "Carnegie Hall", "Lincoln Center"],
    weather: "Perfecta de tarde/noche y dias de lluvia.",
    bestFor: "todas las edades segun espectaculo",
    transport: "N/Q/R/W, 1/2/3, A/C/E y B/D/F/M.",
  },
  {
    name: "Harlem Route",
    focus: "Jazz, Apollo y Renacimiento de Harlem",
    stops: ["Harlem", "Harlem Jazz history", "Apollo Theater"],
    weather: "Mejor de dia; gospel/jazz segun calendario.",
    bestFor: "adultos, adolescentes y amantes de musica",
    transport: "A/B/C/D o 2/3 hasta 125 St.",
  },
  {
    name: "Literature Route",
    focus: "Bibliotecas, librerias y cine urbano",
    stops: ["New York Public Library", "Strand Book Store", "Hotel Chelsea", "Film locations route"],
    weather: "Muy buena con frio o lluvia por alternar interiores.",
    bestFor: "lectores, cinefilos y familias tranquilas",
    transport: "B/D/F/M, 4/5/6, L/N/Q/R/W segun tramo.",
  },
];

const familyFilters = [
  ["children", "AMNH, Intrepid, Statue of Liberty, Brooklyn Bridge, Grand Central y Brooklyn Museum."],
  ["teenagers", "MoMA, Whitney, Tenement Museum, Bushwick Collective, Broadway y Harlem."],
  ["adults", "Met, Frick, New Museum, Jazz, arquitectura y rutas historicas."],
  ["seniors", "Met, NYPL, Grand Central, St. Patrick's, Carnegie Hall y rutas cortas con metro cercano."],
];

function ExperienceCard({ item }: { item: CultureExperience }) {
  const transitHref = buildTransitPlannerUrl({ name: item.name, lat: item.lat, lng: item.lng });
  return (
    <article id={experienceAnchor(item.name)} className="nyc-hard-card-white scroll-mt-28 overflow-hidden rounded-md">
      <div className="relative h-52 border-b-2 border-slate-950 bg-stone-100">
        <CultureExperienceImage name={item.name} primary={cultureImageFor(item)} fallback={item.image} />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">{item.category}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="font-american-diner text-2xl text-slate-950">{item.name}</h3>
            <FavoriteToggleButton baseKey={CULTURE_FAVORITES_KEY} favoriteType="culture" itemId={item.name} />
          </div>
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-700">{item.description}</p>
        <div className="grid gap-1 text-xs font-semibold text-slate-700">
          <p><span className="text-[#7A1E2C]">Horario:</span> {item.openingHours}</p>
          <p><span className="text-[#7A1E2C]">Tickets:</span> {item.ticketInfo}</p>
          <p><span className="text-[#7A1E2C]">Familias:</span> {item.familySuitability}</p>
          <p><span className="text-[#7A1E2C]">Duracion:</span> {item.estimatedDuration}</p>
          <p><span className="text-[#7A1E2C]">Transporte:</span> {item.transportRecommendation}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.badges.map((badge, index) => (
            <span key={`${item.name}-${badge}-${index}`} className="rounded-md border-2 border-slate-950 bg-[#0A2342] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              {badge}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.1em]">
          <a href={item.officialWebsite} target="_blank" className="nyc-action rounded-md px-3 py-2">Web oficial</a>
          <a href={item.googleMapsUrl} target="_blank" className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-[#0A2342] shadow-[3px_3px_0_#111827]">Google Maps</a>
          <a href={transitHref} className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 py-2 text-[#0A2342] shadow-[3px_3px_0_#111827]">Como llegar</a>
        </div>
      </div>
    </article>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
  dark = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`${dark ? "bg-[#0A2342] text-white" : "bg-[#fffdf4] text-[#0A2342]"} border-t-2 border-slate-950 px-5 py-12 sm:px-8 lg:py-16`}>
      <div className="mx-auto max-w-7xl">
        <p className={`text-xs font-black uppercase tracking-[0.22em] ${dark ? "text-[#D4AF37]" : "text-[#7A1E2C]"}`}>{eyebrow}</p>
        <h2 className="mt-2 font-american-diner text-4xl leading-tight sm:text-5xl">{title}</h2>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

export default function CulturePage() {
  const mapPoints: CulturalMapPoint[] = allExperiences.map((item) => ({
    id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: item.name,
    category: item.category,
    lat: item.lat,
    lng: item.lng,
    badges: item.badges,
    googleMapsUrl: item.googleMapsUrl,
    transitUrl: buildTransitPlannerUrl({ name: item.name, lat: item.lat, lng: item.lng }),
  }));
  const favoriteItems: FavoriteRailItem[] = allExperiences.map((item) => ({
    id: item.name,
    name: item.name,
    meta: `${item.category} - ${item.estimatedDuration}`,
    href: `#${experienceAnchor(item.name)}`,
  }));
  const sectionShortcuts = [
    ["Museos", "#museos"],
    ["Monumentos", "#monumentos"],
    ["Arquitectura", "#arquitectura"],
    ["Barrios", "#barrios"],
    ["Street Art", "#street-art"],
    ["Broadway", "#escena"],
    ["Literatura", "#literatura"],
    ["Musica", "#musica"],
    ["Familias", "#familias"],
    ["Rutas", "#rutas"],
    ["Mapa", "#mapa-cultural"],
  ];

  return (
    <main className="nyc-page-shell page-bg-culture text-[#0A2342]">
      <div className="nyc-content-shell mx-auto max-w-7xl overflow-hidden">
      <section className="relative min-h-[76vh] overflow-hidden border-b-2 border-slate-950">
        <Image
          src="https://images.pexels.com/photos/6133108/pexels-photo-6133108.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt="Estatua de la Libertad al atardecer"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.96),rgba(10,35,66,0.65),rgba(122,30,44,0.32)),linear-gradient(180deg,rgba(10,35,66,0.12),rgba(10,35,66,0.94))]" />
        <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 text-white sm:px-8">
          <p className="w-fit border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">
            Cultura flagship
          </p>
          <h1 className="mt-5 max-w-5xl font-american-diner text-5xl leading-[0.94] sm:text-7xl lg:text-8xl">
            CULTURA VIVA NYC
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-7 text-white/84 sm:text-xl">
            Descubre el alma de Nueva York a traves de sus museos, monumentos, barrios historicos, arte urbano, arquitectura, musica, literatura y experiencias culturales unicas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#museos" className="nyc-action rounded-md px-5 py-3 text-sm">Museos</a>
            <a href="#mapa-cultural" className="rounded-md border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">Mapa cultural</a>
            <a href="#rutas" className="rounded-md border-2 border-[#D4AF37] bg-[#D4AF37]/12 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#D4AF37]">Rutas inteligentes</a>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-slate-950 bg-[#fff3d1] px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sectionShortcuts.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-md border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950 shadow-[3px_3px_0_#111827]"
              >
                {label}
              </a>
            ))}
          </div>
          <FavoritesRail baseKey={CULTURE_FAVORITES_KEY} favoriteType="culture" items={favoriteItems} title="Favoritos culturales" />
        </div>
      </section>

      <Section id="museos" eyebrow="01 / Colecciones esenciales" title="Museos Imprescindibles">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {museums.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="monumentos" eyebrow="02 / Memoria publica" title="Monumentos y Lugares Historicos" dark>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {monuments.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="arquitectura" eyebrow="03 / Skyline con historia" title="Arquitectura de Nueva York">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {["Midtown Art Deco: Grand Central -> Chrysler -> Empire State", "Downtown Icons: Woolworth -> Oculus -> One World", "Modern Park Avenue: Seagram -> Lever House -> Rockefeller"].map((route) => (
            <div key={route} className="nyc-hard-card-white rounded-md p-4">
              <p className="font-american-diner text-2xl font-bold">{route}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {architecture.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="barrios" eyebrow="04 / Identidad urbana" title="Barrios con Historia" dark>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {neighborhoods.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="street-art" eyebrow="05 / Ciudad pintada" title="Arte Urbano y Street Art">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {streetArt.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="escena" eyebrow="06 / Escenarios vivos" title="Broadway y Artes Escenicas" dark>
        <div className="mb-5 rounded-md border border-white/15 bg-white/8 p-5">
          <p className="text-sm leading-7 text-white/78">
            Cuando las APIs esten configuradas, esta zona puede sincronizar funciones actuales con Ticketmaster, Eventbrite y calendarios oficiales. Por ahora se muestran sedes culturales y enlaces oficiales para comprar entradas sin intermediarios.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stageArts.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="literatura" eyebrow="07 / Libros, cine y memoria" title="Literatura y Cine">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {literatureCinema.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="musica" eyebrow="08 / La ciudad suena" title="Musica de Nueva York" dark>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {music.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="familias" eyebrow="09 / Por edades" title="Cultura para Familias">
        <div className="grid gap-4 md:grid-cols-4">
          {familyFilters.map(([age, copy]) => (
            <div key={age} className="nyc-hard-card-white rounded-md p-5">
              <p className="font-american-diner text-3xl font-bold capitalize">{age}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rutas" eyebrow="10 / Curadoria inteligente" title="Rutas Culturales Inteligentes" dark>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => (
            <article key={route.name} className="rounded-md border border-white/15 bg-white/8 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">{route.focus}</p>
              <h3 className="mt-2 font-american-diner text-3xl font-bold text-white">{route.name}</h3>
              <p className="mt-3 text-sm leading-6 text-white/74">{route.stops.join(" -> ")}</p>
              <div className="mt-4 grid gap-2 text-sm text-white/78">
                <p><strong>Clima:</strong> {route.weather}</p>
                <p><strong>Edad:</strong> {route.bestFor}</p>
                <p><strong>Transporte:</strong> {route.transport}</p>
                <p><strong>Adaptacion:</strong> Priorizar paradas cercanas al alojamiento, fechas del viaje, clima y edades del grupo.</p>
              </div>
              <a
                href={`/culture?route=${encodeURIComponent(route.name)}#mapa-cultural`}
                className="mt-5 inline-block rounded-sm border border-[#D4AF37] bg-[#D4AF37]/12 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#D4AF37]"
              >
                Ver ruta en el mapa
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="mapa-cultural" eyebrow="Mapa / Cultura viva" title="Mapa Cultural Interactivo">
        <CulturalMap points={mapPoints} routes={routes.map((route) => ({ name: route.name, stops: route.stops }))} />
      </Section>

      <section className="bg-[#0A2342] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-7xl rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">CultureCuratorAgent</p>
          <p className="mt-2 text-sm leading-7 text-white/78">
            Agente preparado para descubrir museos, exposiciones temporales, eventos culturales, Broadway, horarios de museos, festivales y rankings de calidad usando Google Places, NYC Open Data, Metropolitan Museum Open Access, Smithsonian Open Access, Eventbrite, Ticketmaster y OpenWeather cuando haya claves disponibles.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BADGES.map((badge, index) => (
              <span key={`culture-agent-${badge}-${index}`} className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
