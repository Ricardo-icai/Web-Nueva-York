import Image from "next/image";
import FavoriteToggleButton from "@/components/favorites/FavoriteToggleButton";
import FavoritesRail, { type FavoriteRailItem } from "@/components/favorites/FavoritesRail";
import CulturalMap, { type CulturalMapPoint } from "@/components/culture/CulturalMap";
import CultureExperienceImage from "@/components/culture/CultureExperienceImage";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";

type CultureExperience = {
  name: string;
  category: "Museo" | "Monumento" | "Arquitectura" | "Barrio" | "Street Art" | "Escena" | "Literatura" | "Musica" | "Tour" | "Pantalla";
  image: string;
  description: string;
  officialWebsite: string;
  ticketUrl?: string;
  googleMapsUrl: string;
  walkingMapsUrl?: string;
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

type ScreenLocation = CultureExperience & {
  productions: string[];
  precisionLabel: "Rodado aquí" | "Solo exterior" | "Inspiración real" | "Set recreado";
  neighborhood: string;
  onSiteTip: string;
  accuracyNote: string;
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

const SCREEN_LABEL_STYLES: Record<ScreenLocation["precisionLabel"], string> = {
  "Rodado aquí": "bg-emerald-600 text-white",
  "Solo exterior": "bg-[#0A2342] text-white",
  "Inspiración real": "bg-[#D4AF37] text-[#0A2342]",
  "Set recreado": "bg-[#7A1E2C] text-white",
};

function maps(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function walkingMaps(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=walking`;
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
  "McGee's Pub": commonsFile("McGee's Pub NYC.jpg"),
  "Queensboro Bridge": commonsFile("Queensboro Bridge from Roosevelt Island.jpg"),
  "Roosevelt Island Tramway": commonsFile("Roosevelt Island Tramway Roosevelt Island car.jpg"),
  "Hook & Ladder 8": commonsFile("Hook & Ladder 8 firehouse, Tribeca, Manhattan.jpg"),
  "The Plaza Hotel": commonsFile("The Plaza Hotel New York City.jpg"),
  "FAO Schwarz": commonsFile("FAO Schwarz Rockefeller Center.jpg"),
  "Katz's Delicatessen": commonsFile("Katz's Delicatessen sign Houston Street.jpg"),
  "90 Bedford Street": commonsFile("Friends building Bedford Street.jpg"),
  "66 Perry Street": commonsFile("Perry Street New York City brownstone.jpg"),
  "Museum of the City of New York": commonsFile("Museum of the City of New York 001.JPG"),
  "Free Tours by Foot NYC": commonsFile("Brooklyn Bridge Postdlf.jpg"),
  "Tenement Museum Walking Tours": commonsFile("Tenement Museum, New York City.jpg"),
  "Grand Central Terminal Tour": commonsFile("Grand Central Terminal Main Concourse Jan 2006.jpg"),
  "Central Park Conservancy Guided Tours": commonsFile("Bow Bridge Central Park.jpg"),
  "Big Onion Walking Tours": commonsFile("Orchard Street Lower East Side Manhattan.jpg"),
  "Jane's Walk NYC": commonsFile("Washington Square Park in Greenwich Village.jpg"),
  "NYPL Schwarzman Building Tour": commonsFile("New York Public Library Main Branch 2012.jpg"),
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
  ["DUMBO bajo el Brooklyn Bridge", "La zona mas buscada de DUMBO para bajar al waterfront junto al puente de Brooklyn y vivir una de las vistas mas iconicas del skyline.", "Adoquines, parque ribereno, Jane's Carousel y perspectiva directa del puente.", "Es una parada muy fuerte para fotos, paseo tranquilo y atardecer en Brooklyn Bridge Park.", "Main Street Park -> Pebble Beach -> Jane's Carousel -> Empire Fulton Ferry.", 40.7026, -73.9958],
].map(([name, history, architectureText, significance, walkingRoute, lat, lng]) => ({
  name: String(name),
  category: "Barrio" as const,
  image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=84",
  description: `${history} Arquitectura: ${architectureText} Significado cultural: ${significance} Ruta: ${walkingRoute}`,
  officialWebsite: name === "DUMBO bajo el Brooklyn Bridge" ? "https://www.brooklynbridgepark.org/" : "https://www.nyctourism.com/",
  googleMapsUrl: name === "DUMBO bajo el Brooklyn Bridge" ? maps("Main Street Park DUMBO Brooklyn New York") : maps(`${name} New York`),
  walkingMapsUrl: name === "DUMBO bajo el Brooklyn Bridge" ? walkingMaps("Main Street Park DUMBO Brooklyn New York") : undefined,
  openingHours: "Barrio visitable a diario; priorizar horas de luz para rutas a pie.",
  ticketInfo: "Gratis; tours guiados opcionales.",
  familySuitability: "Apto para familias si se ajusta duracion y descansos.",
  estimatedDuration: "1.5-3 h",
  transportRecommendation: name === "DUMBO bajo el Brooklyn Bridge"
    ? "A/C hasta High St-Brooklyn Bridge o F hasta York St; desde ahi baja caminando a Main Street Park y Pebble Beach."
    : "Llegar en metro y caminar por ruta lineal.",
  badges: name === "DUMBO bajo el Brooklyn Bridge"
    ? ["Imprescindible", "Gratis", "Recomendado por Locales"]
    : ["Historia de Nueva York", "Recomendado por Locales"],
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

const screenLocations: ScreenLocation[] = [
  {
    name: "McGee's Pub",
    category: "Pantalla",
    image: commonsFile("McGee's Pub NYC.jpg"),
    description: "La inspiracion mas citada para MacLaren's: pub clasico de Midtown que aterriza el mito de How I Met Your Mother en un lugar real.",
    officialWebsite: "https://www.mcgeespubny.com/",
    googleMapsUrl: maps("McGee's Pub New York"),
    openingHours: "Consultar horario oficial del pub; es una parada mejor de tarde o noche.",
    ticketInfo: "Sin entrada; consumo segun pedido.",
    familySuitability: "Mejor para adultos y fans de series; visita breve con adolescentes mayores.",
    estimatedDuration: "30-45 min",
    transportRecommendation: "A/C/E, 1/2/3 o N/Q/R/W hasta Midtown West y paseo corto.",
    badges: ["Recomendado por Locales", "Historia de Nueva York"],
    lat: 40.7628,
    lng: -73.9862,
    productions: ["How I Met Your Mother"],
    precisionLabel: "Inspiración real",
    neighborhood: "Midtown West",
    onSiteTip: "Pide una parada corta para contextualizar la serie y seguir luego hacia Times Square o Bryant Park.",
    accuracyNote: "MacLaren's era un set de estudio y un bar ficticio; McGee's funciona como referencia real del universo de la serie.",
  },
  {
    name: "Empire State Building",
    category: "Pantalla",
    image: commonsFile("Empire State Building all.jpg"),
    description: "El gran icono romántico y cinematográfico de Manhattan, ligado a King Kong, Sleepless in Seattle y decenas de clásicos.",
    officialWebsite: "https://www.esbnyc.com/",
    googleMapsUrl: maps("Empire State Building New York"),
    openingHours: "Consultar observatorios y horario oficial en la web.",
    ticketInfo: "Miradores de pago con reserva recomendada.",
    familySuitability: "Muy buena para familias, primera visita y viajeros que buscan un icono total.",
    estimatedDuration: "1.5-2.5 h",
    transportRecommendation: "B/D/F/M, N/Q/R/W, 1/2/3 o PATH segun alojamiento.",
    badges: ["Imprescindible", "Arquitectura Iconica", "Experiencia Premium"],
    lat: 40.7484,
    lng: -73.9857,
    productions: ["King Kong", "Sleepless in Seattle", "An Affair to Remember"],
    precisionLabel: "Set recreado",
    neighborhood: "Midtown South",
    onSiteTip: "Sube si buscas skyline y remata con Koreatown o Bryant Park para una tarde redonda.",
    accuracyNote: "El edificio es real y esencial en pantalla, pero algunas escenas clave de observatorio fueron recreadas en set.",
  },
  {
    name: "Flatiron Building",
    category: "Pantalla",
    image: commonsFile("Flatiron building.jpg"),
    description: "La silueta triangular que muchos fans recuerdan como el Daily Bugle de Spider-Man y como uno de los skylines mas fotografiados de NYC.",
    officialWebsite: "https://flatironnomad.nyc/",
    googleMapsUrl: maps("Flatiron Building New York"),
    openingHours: "Exterior visible todo el dia; edificio sin experiencia turistica interior asociada.",
    ticketInfo: "Gratis como parada urbana de calle.",
    familySuitability: "Muy buena para familias, adolescentes y fotografos.",
    estimatedDuration: "20-35 min",
    transportRecommendation: "R/W, 6, F/M o PATH a 23 St y paseo corto.",
    badges: ["Arquitectura Iconica", "Gratis", "Historia de Nueva York"],
    lat: 40.7411,
    lng: -73.9897,
    productions: ["Spider-Man"],
    precisionLabel: "Solo exterior",
    neighborhood: "Flatiron District",
    onSiteTip: "Encaja genial con Madison Square Park, Eataly y una ruta de arquitectura de Midtown South.",
    accuracyNote: "Funciona como stand-in del Daily Bugle; el valor fan aqui es visual y exterior.",
  },
  {
    name: "Queensboro Bridge",
    category: "Pantalla",
    image: commonsFile("Queensboro Bridge from Roosevelt Island.jpg"),
    description: "Infraestructura puro Nueva York: superheroica, cinetica y ligada al imaginario de Spider-Man y de la ciudad en movimiento.",
    officialWebsite: "https://www.nyc.gov/html/dot/html/infrastructure/queensboro-bridge.shtml",
    googleMapsUrl: maps("Queensboro Bridge New York"),
    openingHours: "Vistas y accesos exteriores segun tramo y hora.",
    ticketInfo: "Gratis como paseo exterior.",
    familySuitability: "Muy buena para adolescentes, fotografos y viajeros activos.",
    estimatedDuration: "30-60 min",
    transportRecommendation: "F, N/R/W, 4/5/6 o tranvia segun el acceso elegido.",
    badges: ["Gratis", "Arquitectura Iconica", "Recomendado por Locales"],
    lat: 40.7568,
    lng: -73.9543,
    productions: ["Spider-Man", "Manhattan", "The Great Gatsby"],
    precisionLabel: "Rodado aquí",
    neighborhood: "Midtown East / Long Island City",
    onSiteTip: "Combinalo con el tranvia de Roosevelt Island para una ruta con skyline y sensacion de movimiento real.",
    accuracyNote: "La acción final de Spider-Man mezcla rodaje real y construcción cinematográfica, pero el puente es una parada auténtica y muy reconocible.",
  },
  {
    name: "Roosevelt Island Tramway",
    category: "Pantalla",
    image: commonsFile("Roosevelt Island Tramway Roosevelt Island car.jpg"),
    description: "Uno de los trayectos mas cinematograficos de Nueva York: vistas del East River, cables, altura y una energia visual muy de thriller urbano.",
    officialWebsite: "https://rioc.ny.gov/302/Tram",
    googleMapsUrl: maps("Roosevelt Island Tramway New York"),
    openingHours: "Consultar horarios operativos oficiales del tranvia.",
    ticketInfo: "Se paga con OMNY o MetroCard como transporte publico.",
    familySuitability: "Muy buena para familias, fans de Spider-Man y primera visita.",
    estimatedDuration: "45-75 min",
    transportRecommendation: "F hasta Roosevelt Island o 4/5/6/N/R/W hasta Lexington Av/59 St para subir en Manhattan.",
    badges: ["Experiencia Premium", "Familiar", "Recomendado por Locales"],
    lat: 40.7617,
    lng: -73.9647,
    productions: ["Spider-Man", "Leon: The Professional"],
    precisionLabel: "Rodado aquí",
    neighborhood: "Upper East Side / Roosevelt Island",
    onSiteTip: "Haz el trayecto al atardecer y baja a pasear por Roosevelt Island para alargar la experiencia.",
    accuracyNote: "Es una localización real y muy potente visualmente; la película intensifica la escala, pero el trayecto conserva el impacto.",
  },
  {
    name: "Hook & Ladder 8",
    category: "Pantalla",
    image: commonsFile("Hook & Ladder 8 firehouse, Tribeca, Manhattan.jpg"),
    description: "La fachada mas fan-service de Tribeca: cuartel activo de bomberos convertido en cuartel general pop por Ghostbusters.",
    officialWebsite: "https://www.fdnytrucks.com/files/html/manhattan/l8.htm",
    googleMapsUrl: maps("Hook and Ladder 8 New York"),
    openingHours: "Exterior visible a pie; respetar siempre la operativa del parque.",
    ticketInfo: "Gratis como parada exterior.",
    familySuitability: "Muy buena para familias y fans de cine ochentero.",
    estimatedDuration: "15-25 min",
    transportRecommendation: "1 hasta Franklin St o A/C/E hasta Canal St.",
    badges: ["Gratis", "Historia de Nueva York", "Recomendado por Locales"],
    lat: 40.7197,
    lng: -74.006,
    productions: ["Ghostbusters"],
    precisionLabel: "Solo exterior",
    neighborhood: "Tribeca",
    onSiteTip: "Ideal como stop corto dentro de una ruta de downtown con paseo posterior por Tribeca y SoHo.",
    accuracyNote: "La fachada sí es la de la película; los interiores de la base se recrearon fuera de Nueva York.",
  },
  {
    name: "New York Public Library",
    category: "Pantalla",
    image: commonsFile("New York Public Library Main Branch 2012.jpg"),
    description: "Biblioteca monumental de Bryant Park donde la alta cultura y la cultura pop se cruzan con una fuerza rarisima.",
    officialWebsite: "https://www.nypl.org/locations/schwarzman",
    googleMapsUrl: maps("Stephen A. Schwarzman Building New York Public Library"),
    openingHours: "Consultar horarios de visita, tours y salas abiertas en la web oficial.",
    ticketInfo: "Entrada general gratuita; tours y eventos segun agenda.",
    familySuitability: "Muy buena para familias tranquilas, lectores y primera visita a Midtown.",
    estimatedDuration: "45-90 min",
    transportRecommendation: "B/D/F/M o 7 hasta Bryant Park; 4/5/6 hasta Grand Central.",
    badges: ["Gratis", "Arquitectura Iconica", "Historia de Nueva York"],
    lat: 40.7532,
    lng: -73.9822,
    productions: ["Ghostbusters", "Sex and the City", "Breakfast at Tiffany's"],
    precisionLabel: "Rodado aquí",
    neighborhood: "Bryant Park / Midtown",
    onSiteTip: "Combina de maravilla con Bryant Park, Grand Central y una tarde de arquitectura por Midtown.",
    accuracyNote: "La sala principal si forma parte del mito cinematografico, aunque algunas zonas subterraneas famosas se recrearon en Los Angeles.",
  },
  {
    name: "The Plaza Hotel",
    category: "Pantalla",
    image: commonsFile("The Plaza Hotel New York City.jpg"),
    description: "Lujo puro frente a Central Park: uno de los escenarios mas reconocibles de Home Alone 2 y del Manhattan elegante de cine y TV.",
    officialWebsite: "https://www.theplazany.com/",
    googleMapsUrl: maps("The Plaza Hotel New York"),
    openingHours: "Consultar accesos permitidos, lobby y servicios del hotel.",
    ticketInfo: "Sin entrada para fachada; consumos o experiencias segun el hotel.",
    familySuitability: "Muy buena para familias, Navidad y rutas premium.",
    estimatedDuration: "20-40 min",
    transportRecommendation: "N/R/W, F, 4/5/6 o A/B/C/D/1 cerca de Columbus Circle y Fifth Avenue.",
    badges: ["Experiencia Premium", "Arquitectura Iconica", "Familiar"],
    lat: 40.7644,
    lng: -73.9747,
    productions: ["Home Alone 2", "Sex and the City", "The Great Gatsby"],
    precisionLabel: "Rodado aquí",
    neighborhood: "Central Park South",
    onSiteTip: "Gran parada para unir Fifth Avenue, Central Park y una ruta navidena o glamurosa por Midtown.",
    accuracyNote: "El hotel es una localización real de Home Alone 2; no conviene confundirlo con la juguetería ficticia de la película.",
  },
  {
    name: "FAO Schwarz",
    category: "Pantalla",
    image: commonsFile("FAO Schwarz Rockefeller Center.jpg"),
    description: "Tienda-jugueteria iconica que activa al instante el recuerdo del piano gigante de Big y la fantasia neoyorquina mas familiar.",
    officialWebsite: "https://faoschwarz.com/",
    googleMapsUrl: maps("FAO Schwarz New York"),
    openingHours: "Consultar horario oficial de tienda y experiencias.",
    ticketInfo: "Entrada gratuita; compras y actividades segun visita.",
    familySuitability: "Excelente para ninos, nostalgia adulta y publico intergeneracional.",
    estimatedDuration: "30-60 min",
    transportRecommendation: "B/D/F/M hasta Rockefeller Center o E/M hasta 5 Av-53 St.",
    badges: ["Familiar", "Gratis", "Historia de Nueva York"],
    lat: 40.7597,
    lng: -73.9787,
    productions: ["Big", "The Smurfs", "Home Alone 2 inspiration"],
    precisionLabel: "Inspiración real",
    neighborhood: "Rockefeller Center",
    onSiteTip: "Es una parada muy agradecida si viajas con ninos o quieres una ruta Midtown divertida y ligera.",
    accuracyNote: "El piano de Big forma parte del mito del lugar; la jugueteria de Home Alone 2 fue una fantasia inspirada, no una tienda real filmada aqui.",
  },
  {
    name: "Katz's Delicatessen",
    category: "Pantalla",
    image: commonsFile("Katz's Delicatessen sign Houston Street.jpg"),
    description: "Uno de esos pocos sitios donde comes, reconoces la escena y entiendes porque Nueva York se cuenta tan bien en una mesa.",
    officialWebsite: "https://katzsdelicatessen.com/",
    googleMapsUrl: maps("Katz's Delicatessen New York"),
    openingHours: "Consultar horario oficial; suele haber cola en horas fuertes.",
    ticketInfo: "Sin entrada; comida y bebida a la carta.",
    familySuitability: "Muy buena para familias, parejas y amantes del Lower East Side.",
    estimatedDuration: "45-75 min",
    transportRecommendation: "F/J/M/Z hasta Delancey St-Essex St o 6 hasta Astor Place.",
    badges: ["Historia de Nueva York", "Recomendado por Locales", "Familiar"],
    lat: 40.7223,
    lng: -73.9874,
    productions: ["When Harry Met Sally...", "Donnie Brasco", "Across the Universe"],
    precisionLabel: "Rodado aquí",
    neighborhood: "Lower East Side",
    onSiteTip: "Funciona genial como parada de comida real dentro de una ruta de cine por downtown y el Village.",
    accuracyNote: "La relacion con When Harry Met Sally es directa y muy facil de explicar al visitante.",
  },
  {
    name: "90 Bedford Street",
    category: "Pantalla",
    image: commonsFile("Friends building Bedford Street.jpg"),
    description: "La fachada mas famosa de Friends y uno de los grandes puntos de peregrinacion pop del West Village.",
    officialWebsite: "https://www.nyctourism.com/",
    googleMapsUrl: maps("90 Bedford Street New York"),
    openingHours: "Exterior visible a cualquier hora con mejor experiencia de dia.",
    ticketInfo: "Gratis como parada exterior.",
    familySuitability: "Muy buena para adolescentes, adultos y publico muy fan.",
    estimatedDuration: "10-20 min",
    transportRecommendation: "A/C/E/B/D/F/M hasta West 4 St o 1 hasta Christopher St-Sheridan Sq.",
    badges: ["Gratis", "Recomendado por Locales", "Historia de Nueva York"],
    lat: 40.7324,
    lng: -74.0054,
    productions: ["Friends"],
    precisionLabel: "Solo exterior",
    neighborhood: "West Village",
    onSiteTip: "Integralo con Perry Street, Washington Square y un paseo tranquilo por el Village.",
    accuracyNote: "Solo se usaba como exterior referencial; los interiores del apartamento y Central Perk se rodaron en Burbank.",
  },
  {
    name: "66 Perry Street",
    category: "Pantalla",
    image: commonsFile("Perry Street New York City brownstone.jpg"),
    description: "El stoop mas fotografiado por fans de Sex and the City y una parada perfecta para leer la fantasia del West Village.",
    officialWebsite: "https://www.nyctourism.com/",
    googleMapsUrl: maps("66 Perry Street New York"),
    openingHours: "Exterior residencial; visita breve y siempre con respeto al vecindario.",
    ticketInfo: "Gratis como parada exterior.",
    familySuitability: "Mejor para adultos y adolescentes.",
    estimatedDuration: "10-20 min",
    transportRecommendation: "1 hasta Christopher St-Sheridan Sq o A/C/E/B/D/F/M hasta West 4 St.",
    badges: ["Gratis", "Historia de Nueva York", "Recomendado por Locales"],
    lat: 40.7351,
    lng: -74.0057,
    productions: ["Sex and the City"],
    precisionLabel: "Solo exterior",
    neighborhood: "West Village",
    onSiteTip: "Haz una parada rapida y sigue caminando; el valor esta en el contexto urbano del Village, no en quedarse en la puerta.",
    accuracyNote: "El exterior de la casa si es real, pero la direccion del personaje cambia y es una residencia privada.",
  },
  {
    name: "Museum of the City of New York",
    category: "Pantalla",
    image: commonsFile("Museum of the City of New York 001.JPG"),
    description: "Fachada Upper East Side total para fans de Gossip Girl, con el plus de ser un museo que de verdad ayuda a entender la ciudad.",
    officialWebsite: "https://www.mcny.org/",
    googleMapsUrl: maps("Museum of the City of New York"),
    openingHours: "Consultar horario oficial del museo y exposiciones activas.",
    ticketInfo: "Entrada de pago o sugerida segun fecha y programa.",
    familySuitability: "Muy buena para adolescentes, adultos y publico con interes por NYC.",
    estimatedDuration: "1-2 h",
    transportRecommendation: "6 hasta 103 St y paseo corto por Museum Mile norte.",
    badges: ["Historia de Nueva York", "Arquitectura Iconica", "Recomendado por Locales"],
    lat: 40.7925,
    lng: -73.9519,
    productions: ["Gossip Girl"],
    precisionLabel: "Solo exterior",
    neighborhood: "Upper Fifth Avenue / East Harlem",
    onSiteTip: "Tiene valor doble: parada fan y museo real con muy buen contexto para seguir por Museum Mile.",
    accuracyNote: "En Gossip Girl funciona como exterior del colegio ficticio, no como espacio narrativo interior principal.",
  },
];

const screenRoutes: CultureRoute[] = [
  {
    name: "Village Screen Route",
    focus: "Sitcoms, romance y fachadas míticas",
    stops: ["McGee's Pub", "90 Bedford Street", "66 Perry Street", "Katz's Delicatessen"],
    weather: "Muy buena con tiempo suave; funciona perfecta a pie entre Village y Lower East Side.",
    bestFor: "fans de series, parejas y viajeros repetidores",
    transport: "A/C/E/B/D/F/M, 1 y F/J/M/Z segun el tramo.",
  },
  {
    name: "Spider-Man Skyline Route",
    focus: "Flatiron, puentes, tranvia y Manhattan vertical",
    stops: ["Flatiron Building", "Empire State Building", "Queensboro Bridge", "Roosevelt Island Tramway"],
    weather: "Ideal con cielo limpio o al atardecer para skyline y fotos.",
    bestFor: "familias, adolescentes y publico muy visual",
    transport: "R/W, 4/5/6, N/R/W y F con conexiones sencillas.",
  },
  {
    name: "Classic Movie Route",
    focus: "Ghostbusters, lujo, biblioteca y nostalgia pura NYC",
    stops: ["Hook & Ladder 8", "New York Public Library", "The Plaza Hotel", "FAO Schwarz"],
    weather: "Perfecta para dias frios o rutas navidenas con alternancia de interior y exterior.",
    bestFor: "familias, publico amplio y primera visita",
    transport: "1/A/C/E para downtown y B/D/F/M/N/R/W/4/5/6 para Midtown.",
  },
];

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

const tours: CultureExperience[] = [
  {
    name: "Free Tours by Foot NYC",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=84",
    description: "Operador muy popular para walking tours por SoHo, Lower Manhattan, Brooklyn Bridge, Harlem o Greenwich Village con enfoque flexible y muy bueno para una primera toma de contacto con la ciudad.",
    officialWebsite: "https://freetoursbyfoot.com/new-york-tours/",
    ticketUrl: "https://freetoursbyfoot.com/new-york-tours/",
    googleMapsUrl: maps("Brooklyn Bridge New York"),
    openingHours: "Salidas diarias o casi diarias segun tour; revisar calendario oficial antes de reservar.",
    ticketInfo: "Pay-what-you-wish en muchos tours y tambien tours de precio fijo segun tematica y fecha.",
    familySuitability: "Muy buena para adultos, adolescentes y familias con buen ritmo caminando.",
    estimatedDuration: "2-3 h",
    transportRecommendation: "Elegir segun barrio; suelen salir junto a estaciones de metro faciles de ubicar.",
    badges: ["Gratis", "Historia de Nueva York", "Recomendado por Locales"],
    lat: 40.7061,
    lng: -73.9969,
  },
  {
    name: "Tenement Museum Walking Tours",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1600&q=84",
    description: "Tours oficiales del Lower East Side centrados en migracion, arquitectura y vida cotidiana del barrio, con lecturas historicas mucho mas profundas que un paseo turistico generico.",
    officialWebsite: "https://www.tenement.org/neighborhood-walking-tours/",
    ticketUrl: "https://tickets.tenement.org/",
    googleMapsUrl: maps("Tenement Museum 103 Orchard Street New York"),
    openingHours: "Walking tours diarios en franjas concretas; conviene reservar con antelacion.",
    ticketInfo: "Tour de pago con compra oficial en Tenement Museum; el calendario cambia por temporada.",
    familySuitability: "Ideal para adultos y adolescentes interesados en historia urbana e inmigracion.",
    estimatedDuration: "1-2 h",
    transportRecommendation: "F/J/M/Z hasta Delancey St-Essex St o B/D hasta Grand St.",
    badges: ["Historia de Nueva York", "Patrimonio Historico", "Experiencia Premium"],
    lat: 40.7188,
    lng: -73.9898,
  },
  {
    name: "Grand Central Terminal Tour",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=84",
    description: "Visita enfocada en arquitectura Beaux-Arts, secretos de la terminal y la historia ferroviaria de Midtown, perfecta para quien quiera ver mas alla del icono fotografico.",
    officialWebsite: "https://www.grandcentralterminal.com/tours/",
    ticketUrl: "https://www.grandcentralterminal.com/tours/",
    googleMapsUrl: maps("Grand Central Terminal New York"),
    openingHours: "Consultar horarios de visita guiada en la web oficial del terminal.",
    ticketInfo: "Tour de pago con reserva online; disponibilidad variable segun fecha y operador oficial activo.",
    familySuitability: "Muy buena para primera visita, familias y amantes de arquitectura.",
    estimatedDuration: "1.5-2 h",
    transportRecommendation: "4/5/6/7/S hasta Grand Central-42 St.",
    badges: ["Arquitectura Iconica", "Historia de Nueva York", "Experiencia Premium"],
    lat: 40.7527,
    lng: -73.9772,
  },
  {
    name: "Central Park Conservancy Guided Tours",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&w=1600&q=84",
    description: "Los tours oficiales del parque profundizan en paisajismo, historia y rincones menos obvios de Central Park, con muy buena mezcla entre iconos y contexto local.",
    officialWebsite: "https://www.centralparknyc.org/activities/guides/tours",
    ticketUrl: "https://www.centralparknyc.org/activities/guides/tours",
    googleMapsUrl: maps("Dairy Visitor Center Central Park New York"),
    openingHours: "Hay visitas puntuales y estacionales; revisar agenda oficial del Conservancy.",
    ticketInfo: "Programacion mixta: algunas actividades gratuitas y otras de pago segun recorrido.",
    familySuitability: "Excelente para familias, viajeros tranquilos y fotografia diurna.",
    estimatedDuration: "1.5-2 h",
    transportRecommendation: "B/C, 1, N/R/W o 2/3 segun el punto de encuentro del tour.",
    badges: ["Familiar", "Gratis", "Recomendado por Locales"],
    lat: 40.7754,
    lng: -73.9657,
  },
  {
    name: "Big Onion Walking Tours",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1600&q=84",
    description: "Clasico operador historico de Nueva York con recorridos tematicos por barrios, inmigracion, arquitectura y memoria urbana guiados por perfiles muy especializados.",
    officialWebsite: "https://www.bigonion.com/",
    ticketUrl: "https://www.bigonion.com/",
    googleMapsUrl: maps("City Hall Park New York"),
    openingHours: "Las rutas publicas y privadas dependen del calendario semanal; consultar antes de ir.",
    ticketInfo: "Tours de pago; revisar en la web oficial la salida concreta y la disponibilidad.",
    familySuitability: "Muy recomendable para adultos y adolescentes que quieran contexto historico serio.",
    estimatedDuration: "2 h",
    transportRecommendation: "Muchos puntos de encuentro estan en Lower Manhattan y junto a metro.",
    badges: ["Historia de Nueva York", "Patrimonio Historico", "Recomendado por Locales"],
    lat: 40.713,
    lng: -74.0062,
  },
  {
    name: "Jane's Walk NYC",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1600&q=84",
    description: "Festival anual de paseos conversados y gratuitos liderados por vecinos, ideal para descubrir microhistorias de barrios, urbanismo, memoria local y temas menos turisticos.",
    officialWebsite: "https://www.janeswalknyc.org/",
    ticketUrl: "https://www.janeswalknyc.org/",
    googleMapsUrl: maps("Greenwich Village New York"),
    openingHours: "Se celebra cada ano el primer fin de semana de mayo con programa publicado previamente.",
    ticketInfo: "Gratis; requiere revisar el programa y registrarse solo si la organizacion del paseo lo indica.",
    familySuitability: "Buena para publico curioso, locales, viajeros repetidores y familias tranquilas.",
    estimatedDuration: "1-2 h",
    transportRecommendation: "Depende de cada paseo; conviene filtrar por barrio antes de reservar.",
    badges: ["Gratis", "Recomendado por Locales", "Historia de Nueva York"],
    lat: 40.7308,
    lng: -73.9973,
  },
  {
    name: "NYPL Schwarzman Building Tour",
    category: "Tour",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=84",
    description: "Visita del edificio iconico de la New York Public Library para conocer salas historicas, arquitectura Beaux-Arts y el valor cultural del gran templo literario de Midtown.",
    officialWebsite: "https://www.nypl.org/connect/tours",
    ticketUrl: "https://www.nypl.org/connect/tours",
    googleMapsUrl: maps("Stephen A. Schwarzman Building New York Public Library"),
    openingHours: "Las visitas se ofrecen en horarios concretos segun sede y agenda de NYPL.",
    ticketInfo: "Suelen ser gratuitas o de acceso publico segun disponibilidad; revisar la pagina oficial de tours.",
    familySuitability: "Muy buena para familias tranquilas, lectores y primera visita por Midtown.",
    estimatedDuration: "45-60 min",
    transportRecommendation: "B/D/F/M o 7 hasta Bryant Park; 4/5/6 hasta Grand Central y paseo corto.",
    badges: ["Gratis", "Arquitectura Iconica", "Familiar"],
    lat: 40.7532,
    lng: -73.9822,
  },
];

const allExperiences = [...museums, ...monuments, ...architecture, ...neighborhoods, ...streetArt, ...stageArts, ...literatureCinema, ...tours, ...music];

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
  const ticketHref = item.ticketUrl ?? item.officialWebsite;
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
          <a href={ticketHref} target="_blank" className="rounded-md border-2 border-slate-950 bg-[#fff3d1] px-3 py-2 text-[#0A2342] shadow-[3px_3px_0_#111827]">Entradas</a>
          <a href={item.walkingMapsUrl ?? item.googleMapsUrl} target="_blank" className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-[#0A2342] shadow-[3px_3px_0_#111827]">
            {item.walkingMapsUrl ? "Maps andando" : "Google Maps"}
          </a>
          <a href={transitHref} className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 py-2 text-[#0A2342] shadow-[3px_3px_0_#111827]">Como llegar</a>
        </div>
      </div>
    </article>
  );
}

function ScreenLocationCard({ item }: { item: ScreenLocation }) {
  const transitHref = buildTransitPlannerUrl({ name: item.name, lat: item.lat, lng: item.lng });

  return (
    <article id={experienceAnchor(item.name)} className="overflow-hidden rounded-md border-2 border-slate-950 bg-white shadow-[6px_6px_0_#111827]">
      <div className="relative h-56 border-b-2 border-slate-950 bg-stone-100">
        <CultureExperienceImage name={item.name} primary={cultureImageFor(item)} fallback={item.image} />
        <div className="absolute left-4 top-4">
          <span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${SCREEN_LABEL_STYLES[item.precisionLabel]}`}>
            {item.precisionLabel}
          </span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7A1E2C]">{item.neighborhood}</p>
            <h3 className="mt-1 font-american-diner text-3xl text-slate-950">{item.name}</h3>
          </div>
          <FavoriteToggleButton baseKey={CULTURE_FAVORITES_KEY} favoriteType="culture" itemId={item.name} />
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-700">{item.description}</p>
        <div className="rounded-md border border-[#0A2342]/12 bg-[#f6efe2] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A2342]">En pantalla</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{item.productions.join(" / ")}</p>
        </div>
        <div className="grid gap-2 text-xs font-semibold text-slate-700">
          <p><span className="text-[#7A1E2C]">Experiencia:</span> {item.onSiteTip}</p>
          <p><span className="text-[#7A1E2C]">Precision:</span> {item.accuracyNote}</p>
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
          <a href={item.officialWebsite} target="_blank" className="nyc-action rounded-md px-3 py-2">Web</a>
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

function SectionFeatureImage({
  src,
  alt,
  eyebrow,
  title,
  copy,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-md border border-white/15 bg-white/8">
      <div className="relative min-h-[340px] border-b border-white/12">
        <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.9),rgba(10,35,66,0.55),rgba(10,35,66,0.15)),linear-gradient(180deg,rgba(10,35,66,0.08),rgba(10,35,66,0.86))]" />
        <div className="relative z-10 flex min-h-[340px] max-w-3xl flex-col justify-end p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">{eyebrow}</p>
          <h3 className="mt-2 font-american-diner text-4xl leading-tight sm:text-5xl">{title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82">{copy}</p>
        </div>
      </div>
    </div>
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
    ["NY en pantalla", "#nyc-en-pantalla"],
    ["Tours", "#tours"],
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
          <h1 className="mt-5 max-w-5xl font-american-diner text-5xl leading-[0.94] sm:text-7xl lg:text-8xl">
            CULTURA VIVA NYC
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#museos" className="nyc-action rounded-md px-5 py-3 text-sm">Museos</a>
            <a href="#nyc-en-pantalla" className="rounded-md border-2 border-[#D4AF37] bg-[#D4AF37]/12 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#D4AF37]">NY en pantalla</a>
            <a href="#tours" className="rounded-md border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">Free tours y visitas</a>
            <a href="#mapa-cultural" className="rounded-md border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">Mapa cultural</a>
            <a href="#rutas" className="rounded-md border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">Rutas inteligentes</a>
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

      <Section id="nyc-en-pantalla" eyebrow="08 / Nueva York en pantalla" title="Sitios de Cine y Series que Convirtieron NYC en Mito" dark>
        <SectionFeatureImage
          src={commonsFile("Times Square at night.jpg")}
          alt="Times Square de noche como icono de cine y series en Nueva York"
          eyebrow="Pantalla / Calles míticas"
          title="La Nueva York que llevas años viendo en pantalla"
          copy="Fachadas, puentes, bibliotecas, hoteles y esquinas que han hecho de Nueva York el gran decorado emocional del cine y las series."
        />
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(SCREEN_LABEL_STYLES).map(([label, style]) => (
              <div key={label} className="rounded-md border border-white/15 bg-white/8 p-4">
                <span className={`inline-flex rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${style}`}>
                  {label}
                </span>
                <p className="mt-3 text-sm leading-6 text-white/76">
                  {label === "Rodado aquí" && "Parada auténtica con relación directa de rodaje en la ciudad."}
                  {label === "Solo exterior" && "Fachada o establishing shot reconocido, con interiores hechos en otro sitio."}
                  {label === "Inspiración real" && "Lugar que ayudó a crear el mito, aunque el set de la ficción no estuviera aquí."}
                  {label === "Set recreado" && "El icono existe y es central, pero la escena más recordada se remató en estudio."}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6 grid gap-4 xl:grid-cols-3">
          {screenRoutes.map((route) => (
            <article key={route.name} className="rounded-md border border-white/15 bg-[#fff3d1] p-5 text-[#0A2342] shadow-[4px_4px_0_rgba(255,255,255,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">{route.focus}</p>
              <h3 className="mt-2 font-american-diner text-3xl">{route.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6">{route.stops.join(" -> ")}</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">{route.weather}</p>
              <a
                href={`#${experienceAnchor(route.stops[0] ?? route.name)}`}
                className="mt-4 inline-block rounded-md border-2 border-slate-950 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#111827]"
              >
                Empezar ruta
              </a>
            </article>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {screenLocations.map((item) => <ScreenLocationCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="tours" eyebrow="09 / Free tours y entradas oficiales" title="Tours Guiados de Nueva York" dark>
        <div className="mb-5 rounded-md border border-white/15 bg-white/8 p-5">
          <p className="text-sm leading-7 text-white/78">
            Seleccion pensada para combinar free tours, visitas oficiales y tours culturales de pago con sus paginas reales de reserva, tematica clara y puntos de salida faciles de integrar en tu ruta.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="musica" eyebrow="10 / La ciudad suena" title="Musica de Nueva York" dark>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {music.map((item) => <ExperienceCard key={item.name} item={item} />)}
        </div>
      </Section>

      <Section id="familias" eyebrow="11 / Por edades" title="Cultura para Familias">
        <div className="grid gap-4 md:grid-cols-4">
          {familyFilters.map(([age, copy]) => (
            <div key={age} className="nyc-hard-card-white rounded-md p-5">
              <p className="font-american-diner text-3xl font-bold capitalize">{age}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rutas" eyebrow="12 / Curadoria inteligente" title="Rutas Culturales Inteligentes" dark>
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
            Agente preparado para descubrir museos, exposiciones temporales, eventos culturales, free tours, tours oficiales, Broadway, horarios de museos, festivales y rankings de calidad usando Google Places, NYC Open Data, Metropolitan Museum Open Access, Smithsonian Open Access, Eventbrite, Ticketmaster y OpenWeather cuando haya claves disponibles.
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
