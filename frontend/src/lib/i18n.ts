export const LANGUAGE_COOKIE = "nyc_lang";

export type Language = "es" | "en";

export type Dictionary = {
  common: {
    appName: string;
    comingSoon: string;
    startPlanning: string;
    loadingNy: string;
    language: string;
    spanish: string;
    english: string;
  };
  nav: {
    home: string;
    planMyTrip: string;
    whereToEat: string;
    nightlife: string;
    culture: string;
    rooftops: string;
    fourthOfJuly: string;
    esim: string;
    editProfile: string;
    menu: string;
    drawerNote: string;
    closeMenu: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    exploreLabel: string;
    exploreTitle: string;
    exploreSubtitle: string;
    cards: Array<{
      title: string;
      subtitle: string;
      label: string;
    }>;
  };
  auth: {
    planWithAccount: string;
    accountIntro: string;
    enter: string;
    privatePlanner: string;
    accessTrip: string;
    accessTripCopy: string;
    supabaseConnected: string;
    supabaseMissing: string;
    login: string;
    register: string;
    email: string;
    password: string;
    createAccount: string;
    alreadyHaveAccount: string;
    processing: string;
    createUser: string;
    signOut: string;
    supabaseOnly: string;
  };
  profileBanner: {
    missingPrefix: string;
    completeProfile: string;
    fields: {
      tripName: string;
      nationality: string;
      arrivalDate: string;
      departureDate: string;
      travelers: string;
      pace: string;
      accommodation: string;
    };
  };
  restaurantSearch: {
    label: string;
    title: string;
    googleButton: string;
    placeholder: string;
    selectedHint: string;
    notFound: string;
    inWeb: string;
  };
  restaurantFilters: {
    title: string;
    subtitle: string;
    sleepingAt: string;
    sleepingFallback: string;
    cuisine: string;
    price: string;
    nearMe: string;
    nearHotel: string;
    allMenu: string;
    anyPrice: string;
    noLimit: string;
    apply: string;
    reset: string;
    specials: string;
  };
};

export const dictionaries: Record<Language, Dictionary> = {
  es: {
    common: {
      appName: "NYC Family Planner",
      comingSoon: "Próximamente",
      startPlanning: "Crear plan ahora",
      loadingNy: "Cargando Nueva York",
      language: "Idioma",
      spanish: "Español",
      english: "Inglés",
    },
    nav: {
      home: "Inicio",
      planMyTrip: "Organízame la ruta",
      whereToEat: "Sitios para comer",
      nightlife: "Noche",
      culture: "Cultura",
      rooftops: "Rooftops",
      fourthOfJuly: "4 de Julio",
      esim: "eSIM para EE. UU.",
      editProfile: "Mi perfil",
      menu: "Menú",
      drawerNote: "Rutas, mapas y planes de Nueva York en una sola guía.",
      closeMenu: "Cerrar menú",
    },
    home: {
      heroBadge: "Guía premium de viaje",
      heroTitle: "Nueva York, bien pensada y fácil de vivir.",
      heroSubtitle: "Rutas, cultura, comida, skyline y planes reales con una estética más limpia y un ritmo suave de navegación.",
      heroPrimaryCta: "Empezar ruta",
      heroSecondaryCta: "Ver cultura",
      exploreLabel: "Explora la web",
      exploreTitle: "Cada sección con su imagen y su ambiente",
      exploreSubtitle: "Elige el bloque que necesitas y entra directo sin perder tiempo.",
      cards: [
        { title: "Transporte público", subtitle: "Metro, OMNY, AirTrain, ferries y buses para moverte sin fricción.", label: "Primero" },
        { title: "Organízame la ruta", subtitle: "Planning automático por días, personas, ritmo y alojamiento.", label: "Ruta" },
        { title: "Sitios para comer", subtitle: "Restaurantes, pizza, hamburguesas, favoritos y mapa de locales.", label: "Comer" },
        { title: "Cultura", subtitle: "Museos, barrios, cine y planes culturales bien elegidos.", label: "Cultura" },
        { title: "Rooftops", subtitle: "Miradores, rooftops, vistas virales y enlaces para entradas.", label: "Vistas" },
        { title: "4 de Julio", subtitle: "Fuegos, Sail4th 250, Elcano, grandes veleros y eventos oficiales.", label: "Eventos" },
        { title: "Noche", subtitle: "Discotecas, rooftops, cocktail bars, speakeasies, mapa y filtros para salir por Nueva York.", label: "Noche" },
        { title: "eSIM para EE. UU.", subtitle: "Compara planes y activa tu móvil en pocos pasos.", label: "Conectividad" },
        { title: "Editar perfil", subtitle: "Cambia fechas, alojamiento, viajeros y ritmo del viaje.", label: "Tu viaje" },
      ],
    },
    auth: {
      planWithAccount: "Planifica Nueva York con tu cuenta.",
      accountIntro: "Para usar la web, inicia sesión o crea tu cuenta. Así guardaremos tu perfil, tu viaje y tus favoritos.",
      enter: "Entrar",
      privatePlanner: "Tu planificador privado de Nueva York",
      accessTrip: "Entra en tu viaje a Nueva York",
      accessTripCopy: "Guarda tu sesión, tus preferencias y tus favoritos por usuario antes de entrar en la web.",
      supabaseConnected: "Conectado a Supabase Auth: cada usuario queda registrado con su propia cuenta.",
      supabaseMissing: "Falta la configuración de Supabase para poder entrar en la web.",
      login: "Iniciar sesión",
      register: "Registro",
      email: "Correo electrónico",
      password: "Contraseña",
      createAccount: "Crear cuenta",
      alreadyHaveAccount: "Ya tengo cuenta",
      processing: "Procesando...",
      createUser: "Crear cuenta",
      signOut: "Salir",
      supabaseOnly: "Esta web funciona solo con Supabase. Añade las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Render para activar el acceso.",
    },
    profileBanner: {
      missingPrefix: "Completa tu perfil para que las rutas y recomendaciones se ajusten mejor a tu viaje. Falta:",
      completeProfile: "Completar perfil",
      fields: {
        tripName: "nombre del viaje",
        nationality: "nacionalidad",
        arrivalDate: "fecha de llegada",
        departureDate: "fecha de salida",
        travelers: "viajeros",
        pace: "ritmo",
        accommodation: "alojamiento",
      },
    },
    restaurantSearch: {
      label: "Buscar por nombre",
      title: "¿Ya sabes a dónde quieres ir?",
      googleButton: "Buscar en Google",
      placeholder: "Escribe el nombre del sitio",
      selectedHint: "lugares elegidos",
      notFound: "No lo tengo en la web. Puedes buscarlo en Google.",
      inWeb: "Restaurante en la web",
    },
    restaurantFilters: {
      title: "Menú de filtros",
      subtitle: "Elige comida, precio y distancia",
      sleepingAt: "Dónde duermo:",
      sleepingFallback: "Guarda tu alojamiento en Editar perfil para filtrar por dónde duermes.",
      cuisine: "Tipo de comida",
      price: "Precio medio",
      nearMe: "Desde mi ubicación",
      nearHotel: "Desde dónde duermo",
      allMenu: "Todo el menú",
      anyPrice: "Cualquier precio",
      noLimit: "Sin límite",
      apply: "Aplicar filtros",
      reset: "Restaurar",
      specials: "NYC Specials",
    },
  },
  en: {
    common: {
      appName: "NYC Family Planner",
      comingSoon: "Coming Soon",
      startPlanning: "Start Planning",
      loadingNy: "Loading New York",
      language: "Language",
      spanish: "Spanish",
      english: "English",
    },
    nav: {
      home: "Home",
      planMyTrip: "Plan My Trip",
      whereToEat: "Where to Eat",
      nightlife: "Nightlife",
      culture: "Culture",
      rooftops: "Rooftops",
      fourthOfJuly: "4th of July",
      esim: "eSIM for the U.S.",
      editProfile: "My Profile",
      menu: "Menu",
      drawerNote: "Routes, maps, and New York plans in one polished guide.",
      closeMenu: "Close menu",
    },
    home: {
      heroBadge: "Premium travel guide",
      heroTitle: "New York, beautifully planned and easy to enjoy.",
      heroSubtitle: "Routes, culture, food, skyline views, and real plans with a cleaner look and a smoother browsing rhythm.",
      heroPrimaryCta: "Start planning",
      heroSecondaryCta: "Explore culture",
      exploreLabel: "Explore the site",
      exploreTitle: "Every section with its own image and atmosphere",
      exploreSubtitle: "Pick the section you need and jump straight in.",
      cards: [
        { title: "Public Transit", subtitle: "Subway, OMNY, AirTrain, ferries, and buses to help you move around smoothly.", label: "Start Here" },
        { title: "Plan My Trip", subtitle: "Automatic trip planning by days, travelers, pace, and accommodation.", label: "Route" },
        { title: "Where to Eat", subtitle: "Restaurants, pizza, burgers, favorites, and a live dining map.", label: "Food" },
        { title: "Culture", subtitle: "Museums, neighborhoods, film spots, and carefully chosen cultural plans.", label: "Culture" },
        { title: "Rooftops", subtitle: "Observation decks, rooftops, viral views, and direct ticket links.", label: "Skyline" },
        { title: "4th of July", subtitle: "Fireworks, Sail4th 250, Elcano, tall ships, and official events.", label: "Events" },
        { title: "Nightlife", subtitle: "Clubs, rooftops, cocktail bars, speakeasies, maps, and filters for going out in New York.", label: "Night" },
        { title: "eSIM for the U.S.", subtitle: "Compare plans and get your phone ready in just a few steps.", label: "Connectivity" },
        { title: "Edit Profile", subtitle: "Update dates, accommodation, travelers, and the pace of your trip.", label: "Your Trip" },
      ],
    },
    auth: {
      planWithAccount: "Plan New York with your account.",
      accountIntro: "To use the site, sign up or log in. That way we can save your profile, your trip, and your favorites.",
      enter: "Enter",
      privatePlanner: "Your private New York trip planner",
      accessTrip: "Access your New York trip",
      accessTripCopy: "Save your session, preferences, and favorites before you enter the site.",
      supabaseConnected: "Connected to Supabase Auth: each user is stored with their own account.",
      supabaseMissing: "Supabase configuration is missing, so access is not available yet.",
      login: "Log in",
      register: "Sign up",
      email: "Email",
      password: "Password",
      createAccount: "Create account",
      alreadyHaveAccount: "I already have an account",
      processing: "Processing...",
      createUser: "Create account",
      signOut: "Sign out",
      supabaseOnly: "This site only works with Supabase. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Render to enable access.",
    },
    profileBanner: {
      missingPrefix: "Complete your profile so routes and recommendations fit your trip better. Missing:",
      completeProfile: "Complete profile",
      fields: {
        tripName: "trip name",
        nationality: "nationality",
        arrivalDate: "arrival date",
        departureDate: "departure date",
        travelers: "travelers",
        pace: "travel pace",
        accommodation: "accommodation",
      },
    },
    restaurantSearch: {
      label: "Search by name",
      title: "Already know where you want to go?",
      googleButton: "Search on Google",
      placeholder: "Type the name of the place",
      selectedHint: "selected places",
      notFound: "I don't have it on the site yet. You can look it up on Google.",
      inWeb: "Restaurant available on the site",
    },
    restaurantFilters: {
      title: "Filter menu",
      subtitle: "Choose cuisine, price, and distance",
      sleepingAt: "Where I'm staying:",
      sleepingFallback: "Save your accommodation in Edit Profile to filter by where you're staying.",
      cuisine: "Cuisine",
      price: "Average price",
      nearMe: "Near me",
      nearHotel: "Near my hotel",
      allMenu: "Full menu",
      anyPrice: "Any price",
      noLimit: "No limit",
      apply: "Apply filters",
      reset: "Reset",
      specials: "NYC Specials",
    },
  },
};

export function resolveLanguage(value?: string | null): Language {
  return value === "en" ? "en" : "es";
}

export function getDictionary(language: Language) {
  return dictionaries[language];
}
