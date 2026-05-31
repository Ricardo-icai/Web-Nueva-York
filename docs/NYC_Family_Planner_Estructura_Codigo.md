# NYC Family Planner — Estructura profesional del código backend y frontend

## 1. Objetivo de este documento

Este documento define la estructura completa del código de **NYC Family Planner**, una web inteligente para familias y grupos que visitan Nueva York. Está escrito para que un agente de desarrollo como Codex pueda implementar el proyecto de forma ordenada, escalable y profesional.

El documento especifica:

- Arquitectura general del sistema.
- Stack tecnológico recomendado.
- Estructura de carpetas frontend.
- Estructura de carpetas backend.
- Modelos de datos.
- APIs internas.
- Integraciones externas.
- Lógica de recomendación.
- Gestión de clima, transporte, eventos, restaurantes, planes y usuarios.
- Seguridad, testing, despliegue y estándares de calidad.

La web debe funcionar como una guía turística inteligente de Nueva York, personalizada según grupo, edad, nacionalidad, fechas, clima, ubicación, preferencias, eventos especiales, accesibilidad, presupuesto y transporte.

---

## 2. Arquitectura general recomendada

### 2.1 Tipo de arquitectura

Se recomienda una arquitectura **modular full-stack** con separación clara entre frontend, backend, base de datos, servicios externos y motor de recomendación.

```text
nyc-family-planner/
  apps/
    web/                  # Frontend Next.js
    api/                  # Backend API NestJS o FastAPI
  packages/
    shared/               # Tipos, schemas, utilidades compartidas
    config/               # Config común: eslint, prettier, tsconfig
    ui/                   # Componentes UI reutilizables opcionales
  docs/                   # Documentación técnica y funcional
  infra/                  # Docker, despliegue, CI/CD, scripts cloud
  scripts/                # Scripts de scraping autorizado, seeds, mantenimiento
  tests/                  # Tests end-to-end globales
```

### 2.2 Stack recomendado

Para una implementación moderna, robusta y fácil de mantener:

#### Frontend

- **Next.js 15+** con App Router.
- **React 19+**.
- **TypeScript** obligatorio.
- **Tailwind CSS** para estilos.
- **shadcn/ui** para componentes base.
- **Framer Motion** para animaciones suaves.
- **TanStack Query** para gestión de datos remotos.
- **Zustand** para estado global ligero.
- **React Hook Form + Zod** para formularios y validación.
- **Mapbox GL JS** o **Google Maps JS SDK** para mapas.
- **next-intl** para internacionalización.

#### Backend

Opción recomendada principal:

- **NestJS + TypeScript**.
- Arquitectura modular por dominios.
- Validación con **Zod** o **class-validator**.
- Documentación API con **OpenAPI/Swagger**.

Opción alternativa:

- **FastAPI + Python** si se quiere priorizar IA, scraping permitido y procesamiento de datos.

Para este proyecto se recomienda **NestJS** por coherencia con TypeScript en frontend y backend.

#### Base de datos

- **PostgreSQL** como base de datos principal.
- **PostGIS** para consultas geográficas.
- **Prisma ORM** para acceso a datos.
- **Redis** para caché, sesiones temporales y rate limiting.

#### IA y recomendación

- Servicio propio de recomendación en backend.
- Integración opcional con LLM para explicación de itinerarios.
- Motor híbrido:
  - reglas deterministas,
  - scoring ponderado,
  - embeddings para similitud semántica,
  - filtros por edad, clima, distancia y presupuesto.

#### Infraestructura

- Docker para desarrollo y producción.
- Vercel para frontend si se separa el despliegue.
- Render, Fly.io, Railway, AWS, GCP o Azure para backend.
- Supabase, Neon o RDS para PostgreSQL.
- Upstash o Redis gestionado.
- GitHub Actions para CI/CD.

---

## 3. Principios de diseño del código

Todo el código debe seguir estos principios:

1. **Separación de responsabilidades**: cada módulo debe tener una función clara.
2. **Tipado estricto**: no usar `any` salvo casos excepcionales justificados.
3. **Validación en frontera**: validar toda entrada de usuario y toda respuesta externa.
4. **APIs externas encapsuladas**: nunca llamar APIs externas directamente desde componentes UI.
5. **Caché inteligente**: clima, eventos, POIs y rutas deben cachearse.
6. **Privacidad por diseño**: guardar solo los datos necesarios.
7. **Accesibilidad real**: WCAG 2.2 AA como estándar mínimo.
8. **Internacionalización desde el inicio**: español e inglés mínimo.
9. **Escalabilidad modular**: añadir nuevas ciudades en el futuro sin rehacer la arquitectura.
10. **Calidad sobre cantidad**: las recomendaciones deben ser pocas, buenas y justificadas.

---

## 4. Estructura raíz del repositorio

```text
nyc-family-planner/
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  .env.example
  .gitignore
  .editorconfig
  .prettierrc
  eslint.config.js
  docker-compose.yml

  apps/
    web/
    api/

  packages/
    shared/
    ui/
    config/

  docs/
    product/
    technical/
    api/
    architecture/

  infra/
    docker/
    github-actions/
    terraform/

  scripts/
    seed/
    data-import/
    maintenance/

  tests/
    e2e/
    fixtures/
```

### 4.1 Motivo de usar monorepo

Se recomienda monorepo porque:

- Frontend y backend comparten tipos.
- Los schemas Zod se pueden reutilizar.
- El modelo de datos del usuario y del itinerario será común.
- Facilita que Codex entienda el proyecto completo.
- Permite añadir app móvil en el futuro.

---

# PARTE I — FRONTEND

## 5. Estructura completa del frontend

```text
apps/web/
  src/
    app/
      [locale]/
        layout.tsx
        page.tsx
        onboarding/
          page.tsx
        dashboard/
          page.tsx
        planner/
          page.tsx
        itinerary/
          [tripId]/
            page.tsx
        map/
          page.tsx
        restaurants/
          page.tsx
        culture/
          page.tsx
        viewpoints/
          page.tsx
        photo-spots/
          page.tsx
        sail4th-elcano/
          page.tsx
        fourth-of-july/
          page.tsx
        world-cup-2026/
          page.tsx
        profile/
          page.tsx
        settings/
          page.tsx
      api/
        health/
          route.ts
      globals.css
      providers.tsx

    components/
      layout/
      navigation/
      onboarding/
      planner/
      itinerary/
      maps/
      weather/
      transport/
      cards/
      restaurants/
      events/
      world-cup/
      sail4th/
      forms/
      feedback/
      common/

    features/
      auth/
      onboarding/
      trip-profile/
      recommendations/
      itinerary-builder/
      weather-adaptation/
      transport-routing/
      maps/
      events/
      restaurants/
      cultural-sites/
      photo-spots/
      world-cup/
      sail4th-elcano/
      user-preferences/

    lib/
      api-client.ts
      env.ts
      i18n.ts
      query-client.ts
      routes.ts
      analytics.ts
      permissions.ts
      date.ts
      geo.ts
      format.ts

    stores/
      trip-store.ts
      user-location-store.ts
      ui-store.ts
      filters-store.ts

    hooks/
      use-current-location.ts
      use-trip-profile.ts
      use-weather.ts
      use-recommendations.ts
      use-itinerary.ts
      use-transport-route.ts
      use-media-query.ts

    schemas/
      onboarding.schema.ts
      preferences.schema.ts
      trip.schema.ts
      filters.schema.ts

    types/
      api.types.ts
      ui.types.ts
      map.types.ts

    styles/
      tokens.css
      map.css

    middleware.ts

  public/
    images/
      brand/
      elcano/
      nyc/
      world-cup/
    icons/
    maps/
    manifest.json

  tests/
    unit/
    integration/
    e2e/

  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

---

## 6. Rutas principales del frontend

### 6.1 `/`

Home pública.

Debe mostrar:

- Propuesta de valor.
- Botón principal: “Crear mi plan de Nueva York”.
- Inspiración visual: Nueva York, skyline, mapas, puerto, Juan Sebastián de Elcano, verano 2026.
- Accesos rápidos:
  - Planes familiares.
  - Restaurantes.
  - Miradores.
  - Cultura.
  - Mundial 2026.
  - Sail4th / Elcano / 4 de julio.

### 6.2 `/onboarding`

Formulario inteligente inicial.

Debe recopilar:

- Número de viajeros.
- Edad de cada viajero.
- Nacionalidad.
- Idioma.
- Fechas del viaje.
- Zona o dirección del alojamiento.
- Presupuesto.
- Ritmo del viaje.
- Restricciones alimentarias.
- Movilidad reducida.
- Preferencias.
- Interés en Mundial 2026.
- Interés en Sail4th, Elcano y 4 de julio.

El onboarding debe ser multipaso y guardar progreso localmente.

### 6.3 `/dashboard`

Panel principal del viaje.

Debe mostrar:

- Resumen del grupo.
- Fechas.
- Clima de los próximos 7 días.
- Alertas importantes.
- Plan recomendado del día.
- Accesos a itinerario, mapa y categorías.

### 6.4 `/planner`

Pantalla para generar recomendaciones.

Debe permitir:

- Elegir día concreto.
- Elegir tipo de plan.
- Cambiar filtros.
- Regenerar propuestas.
- Comparar opciones.

### 6.5 `/itinerary/[tripId]`

Itinerario completo.

Debe mostrar:

- Plan día por día.
- Horarios sugeridos.
- Transporte entre lugares.
- Tiempo estimado.
- Coste aproximado.
- Nivel de esfuerzo.
- Alternativas por lluvia o calor.
- Links de entradas oficiales.

### 6.6 `/map`

Mapa interactivo.

Debe mostrar:

- Alojamiento.
- Planes recomendados.
- Restaurantes.
- Paradas de metro.
- Rutas.
- Zonas a evitar si hay saturación.
- Eventos especiales.

### 6.7 `/sail4th-elcano`

Pestaña especial de inspiración del proyecto.

Debe incluir:

- Eventos relacionados con Sail4th 250.
- Información del Juan Sebastián de Elcano.
- Planes marítimos y fotográficos.
- Mejores puntos para ver barcos.
- Enlaces oficiales.
- Consejos de transporte y multitudes.

### 6.8 `/fourth-of-july`

Pestaña del 4 de julio.

Debe incluir:

- Eventos oficiales.
- Fuegos artificiales.
- Zonas recomendadas según tipo de grupo.
- Planes para familias.
- Alertas de multitudes.
- Restricciones de seguridad.

### 6.9 `/world-cup-2026`

Pestaña Mundial 2026.

Debe incluir:

- Partidos en NY/NJ Stadium.
- Fan zones.
- Bares y restaurantes para ver partidos.
- Transporte al estadio.
- Alertas de entradas oficiales.
- Planes por nacionalidad.

---

## 7. Componentes frontend clave

### 7.1 Componentes de layout

```text
components/layout/
  AppShell.tsx
  Header.tsx
  Footer.tsx
  Sidebar.tsx
  MobileNav.tsx
  PageContainer.tsx
  Section.tsx
```

### 7.2 Componentes de onboarding

```text
components/onboarding/
  OnboardingWizard.tsx
  StepGroupSize.tsx
  StepTravelerAges.tsx
  StepNationality.tsx
  StepTravelDates.tsx
  StepAccommodation.tsx
  StepBudget.tsx
  StepMobility.tsx
  StepFoodRestrictions.tsx
  StepPreferences.tsx
  StepSpecialEvents.tsx
  StepReview.tsx
```

Cada paso debe:

- Validar datos con Zod.
- Guardar progreso en Zustand/localStorage.
- Permitir volver atrás.
- Mostrar ayuda contextual.

### 7.3 Componentes de recomendaciones

```text
components/planner/
  RecommendationPanel.tsx
  RecommendationFilters.tsx
  RecommendationCard.tsx
  RecommendationScoreBadge.tsx
  PlanQualityReasons.tsx
  WeatherAdaptationBanner.tsx
  AgeRestrictionWarning.tsx
  OfficialTicketLink.tsx
```

### 7.4 Componentes de itinerario

```text
components/itinerary/
  ItineraryDay.tsx
  ItineraryTimeline.tsx
  ItineraryStop.tsx
  ItineraryTransportLeg.tsx
  ItineraryCostSummary.tsx
  ItineraryWeatherWarning.tsx
  ItineraryAlternativePlan.tsx
  ItineraryExportButton.tsx
```

### 7.5 Componentes de mapas

```text
components/maps/
  NYCMap.tsx
  MapProvider.tsx
  POIMarker.tsx
  UserLocationMarker.tsx
  RoutePolyline.tsx
  TransitLayerToggle.tsx
  SubwayStationMarker.tsx
  CrowdHeatmapLayer.tsx
  MapLegend.tsx
```

### 7.6 Componentes de clima

```text
components/weather/
  SevenDayForecast.tsx
  WeatherCard.tsx
  WeatherRiskBadge.tsx
  RainPlanSuggestion.tsx
  HeatWarning.tsx
  ColdWarning.tsx
```

### 7.7 Componentes de transporte

```text
components/transport/
  TransportRouteCard.tsx
  SubwayRouteSteps.tsx
  BusRouteSteps.tsx
  FerryRouteSteps.tsx
  WalkingSegment.tsx
  TaxiEstimate.tsx
  AccessibilityTransportWarning.tsx
```

---

## 8. Estado global del frontend

### 8.1 `trip-store.ts`

Debe guardar:

```ts
TripState = {
  tripId?: string;
  group: Traveler[];
  nationality: string;
  language: string;
  dates: {
    start: string;
    end: string;
  };
  accommodation?: LocationInput;
  preferences: TripPreferences;
  budget: BudgetProfile;
  mobility: MobilityProfile;
  foodRestrictions: FoodRestriction[];
  specialInterests: SpecialInterest[];
};
```

### 8.2 `user-location-store.ts`

Debe guardar:

```ts
UserLocationState = {
  permissionStatus: 'unknown' | 'granted' | 'denied';
  coordinates?: {
    lat: number;
    lng: number;
  };
  lastUpdatedAt?: string;
};
```

### 8.3 `filters-store.ts`

Debe guardar filtros activos:

- Tipo de plan.
- Precio.
- Interior/exterior.
- Distancia máxima.
- Edad mínima/máxima.
- Accesibilidad.
- Popularidad.
- Calidad.
- Menos turístico.
- Ideal para fotos.

---

## 9. Cliente API frontend

Crear un cliente centralizado:

```text
lib/api-client.ts
```

Responsabilidades:

- Añadir base URL.
- Añadir headers.
- Gestionar errores.
- Tipar respuestas.
- Soportar abort controllers.
- No exponer claves privadas.

Ejemplo conceptual:

```ts
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json() as Promise<T>;
}
```

---

# PARTE II — BACKEND

## 10. Estructura completa del backend

```text
apps/api/
  src/
    main.ts
    app.module.ts

    config/
      env.config.ts
      database.config.ts
      redis.config.ts
      external-apis.config.ts
      swagger.config.ts

    common/
      decorators/
      filters/
      guards/
      interceptors/
      pipes/
      utils/
      constants/
      errors/

    modules/
      auth/
      users/
      trips/
      travelers/
      preferences/
      recommendations/
      itinerary/
      weather/
      transport/
      maps/
      places/
      restaurants/
      cultural-sites/
      viewpoints/
      photo-spots/
      events/
      sail4th-elcano/
      fourth-of-july/
      world-cup/
      tickets/
      documents/
      reviews/
      quality-score/
      accessibility/
      safety/
      crowds/
      ai-orchestrator/
      feedback/
      analytics/
      admin/
      health/

    integrations/
      google-maps/
      mapbox/
      mta/
      openweather/
      noaa/
      ticketmaster/
      eventbrite/
      nyc-open-data/
      yelp/
      google-places/
      tripadvisor/
      fifa/
      sail4th/
      official-sites/

    jobs/
      weather-refresh.job.ts
      events-refresh.job.ts
      places-refresh.job.ts
      transport-status-refresh.job.ts
      quality-score-refresh.job.ts
      cache-cleanup.job.ts

    database/
      prisma.service.ts
      migrations/
      seeds/

    recommendation-engine/
      scoring/
      filters/
      ranking/
      explanations/
      itinerary-optimizer/
      weather-adapter/
      transport-adapter/
      crowd-adapter/

    types/
      external-api.types.ts
      recommendation.types.ts
      itinerary.types.ts

  prisma/
    schema.prisma
    seed.ts

  test/
    unit/
    integration/
    e2e/

  package.json
  tsconfig.json
```

---

## 11. Módulos backend obligatorios

## 11.1 Módulo `trips`

Gestiona los viajes creados por usuarios.

```text
modules/trips/
  trips.module.ts
  trips.controller.ts
  trips.service.ts
  trips.repository.ts
  dto/
    create-trip.dto.ts
    update-trip.dto.ts
    trip-response.dto.ts
  schemas/
    trip.schema.ts
```

Endpoints:

```http
POST   /trips
GET    /trips/:tripId
PATCH  /trips/:tripId
DELETE /trips/:tripId
```

Responsabilidades:

- Crear viaje.
- Asociar viajeros.
- Guardar fechas.
- Guardar alojamiento.
- Guardar preferencias.
- Preparar contexto para recomendaciones.

---

## 11.2 Módulo `travelers`

Gestiona miembros del grupo.

Campos mínimos:

- Edad.
- Tipo: bebé, niño, adolescente, adulto, senior.
- Nacionalidad.
- Restricciones.
- Movilidad.

Reglas:

- Si edad menor de 21, advertir en planes con alcohol.
- Si edad menor de 18, filtrar eventos solo adultos.
- Si hay bebés, priorizar planes con baños, descansos y baja intensidad.
- Si hay seniors, reducir rutas con muchas escaleras.

---

## 11.3 Módulo `preferences`

Gestiona gustos del usuario.

Preferencias principales:

```ts
TripPreferences = {
  restaurants: number;
  museums: number;
  viewpoints: number;
  culture: number;
  photoSpots: number;
  parks: number;
  shopping: number;
  broadway: number;
  sports: number;
  freePlans: number;
  premiumPlans: number;
  historical: number;
  relaxed: number;
  kidsFriendly: number;
  nightlife: number;
  spanishHeritage: number;
  fourthOfJuly: number;
  worldCup2026: number;
};
```

Los valores deben estar normalizados de 0 a 1 o de 0 a 100.

---

## 11.4 Módulo `weather`

Gestiona clima actual y previsión 7 días.

```text
modules/weather/
  weather.module.ts
  weather.controller.ts
  weather.service.ts
  weather.repository.ts
  dto/
  adapters/
    openweather.adapter.ts
    noaa.adapter.ts
```

Endpoints:

```http
GET /weather/forecast?lat=&lng=&startDate=&endDate=
GET /weather/trip/:tripId
```

Debe devolver:

```json
{
  "daily": [
    {
      "date": "2026-07-01",
      "condition": "rain",
      "temperatureMin": 22,
      "temperatureMax": 29,
      "precipitationProbability": 70,
      "windSpeed": 18,
      "humidity": 80,
      "uvIndex": 7,
      "recommendationImpact": "prefer_indoor"
    }
  ]
}
```

Reglas de adaptación:

- Lluvia fuerte: priorizar museos, miradores cubiertos, restaurantes, actividades indoor.
- Calor extremo: evitar caminatas largas al mediodía, añadir descansos interiores.
- Frío intenso: reducir planes exteriores.
- Viento fuerte: advertir en miradores, ferries y eventos marítimos.
- Buen clima: priorizar parques, miradores, zonas fotográficas y rutas a pie.

---

## 11.5 Módulo `places`

Base común para POIs.

Tipos de POI:

- Restaurante.
- Museo.
- Mirador.
- Sitio cultural.
- Zona fotográfica.
- Parque.
- Evento.
- Tienda.
- Estadio.
- Puerto/muelle.

Campos principales:

```ts
Place = {
  id: string;
  name: string;
  type: PlaceType;
  description: string;
  lat: number;
  lng: number;
  borough: Borough;
  address: string;
  officialWebsite?: string;
  ticketUrl?: string;
  bookingUrl?: string;
  priceLevel?: number;
  minAge?: number;
  maxAge?: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  accessibility: AccessibilityInfo;
  familyScore: number;
  photoScore: number;
  cultureScore: number;
  qualityScore: number;
  sourceRefs: SourceRef[];
};
```

---

## 11.6 Módulo `restaurants`

Responsabilidades:

- Buscar restaurantes por zona.
- Filtrar por presupuesto.
- Filtrar por niños.
- Filtrar por restricciones alimentarias.
- Integrar reservas oficiales cuando existan.
- Evitar restaurantes con mala reputación turística.

Fuentes recomendadas:

- Google Places API.
- Yelp Fusion API.
- OpenTable o Resy mediante enlaces oficiales si están disponibles.
- Web oficial del restaurante.

Scoring mínimo:

```text
restaurantScore =
  rating * 0.25 +
  reviewVolumeScore * 0.15 +
  familyFriendlyScore * 0.20 +
  locationConvenienceScore * 0.15 +
  dietaryCompatibilityScore * 0.15 +
  priceCompatibilityScore * 0.10
```

---

## 11.7 Módulo `transport`

Gestiona rutas de transporte.

```text
modules/transport/
  transport.module.ts
  transport.controller.ts
  transport.service.ts
  adapters/
    google-directions.adapter.ts
    mta-gtfs.adapter.ts
    mapbox-directions.adapter.ts
    citymapper-link.adapter.ts
```

Endpoints:

```http
POST /transport/route
GET  /transport/nearby-stations?lat=&lng=
GET  /transport/status
```

Debe soportar:

- Metro.
- Bus.
- Ferry.
- Tren PATH/NJ Transit si aplica.
- Caminando.
- Taxi/rideshare estimado.

Respuesta ejemplo:

```json
{
  "origin": "Times Square",
  "destination": "Brooklyn Bridge Park",
  "recommendedMode": "subway",
  "durationMinutes": 28,
  "walkingMinutes": 8,
  "transfers": 1,
  "steps": [
    {
      "type": "walk",
      "instruction": "Walk to Times Sq-42 St Station",
      "durationMinutes": 4
    },
    {
      "type": "subway",
      "line": "2",
      "direction": "Brooklyn College",
      "stops": 5
    }
  ],
  "accessibilityWarnings": []
}
```

---

## 11.8 Módulo `events`

Responsabilidades:

- Buscar eventos activos en fechas del viaje.
- Filtrar eventos por familia, edad, precio y clima.
- Añadir eventos especiales de verano 2026.
- Mantener enlaces oficiales.

Fuentes recomendadas:

- NYC Official Guide.
- NYC Parks Events.
- Eventbrite.
- Ticketmaster.
- Sitios oficiales de museos.
- Sitios oficiales de Sail4th 250.
- Sitios oficiales FIFA para Mundial 2026.

---

## 11.9 Módulo `sail4th-elcano`

Módulo específico de la inspiración del proyecto.

Debe gestionar:

- Llegada del Juan Sebastián de Elcano.
- Sail4th 250.
- Eventos navales.
- Mejores puntos de visualización.
- Rutas marítimas.
- Consejos fotográficos.
- Restricciones de seguridad.
- Transporte en días de alta afluencia.

Endpoints:

```http
GET /sail4th-elcano/events
GET /sail4th-elcano/viewpoints
GET /sail4th-elcano/itinerary?tripId=
```

---

## 11.10 Módulo `fourth-of-july`

Debe gestionar:

- Fuegos artificiales.
- Eventos patrióticos.
- Rutas con multitudes.
- Cortes de calles.
- Recomendaciones por edad.
- Planes alternativos si el usuario quiere evitar aglomeraciones.

Endpoints:

```http
GET /fourth-of-july/events
GET /fourth-of-july/fireworks-viewpoints
GET /fourth-of-july/safety-advice
```

---

## 11.11 Módulo `world-cup`

Debe gestionar:

- Partidos del Mundial 2026 en NY/NJ.
- Fan zones.
- Bares para ver partidos.
- Transporte al estadio.
- Alertas de entradas oficiales.
- Planes por nacionalidad.

Endpoints:

```http
GET /world-cup/matches
GET /world-cup/fan-zones
GET /world-cup/stadium-transport
GET /world-cup/plans?tripId=
```

---

## 11.12 Módulo `recommendations`

Es el núcleo de la app.

```text
modules/recommendations/
  recommendations.module.ts
  recommendations.controller.ts
  recommendations.service.ts
  dto/
    recommendation-request.dto.ts
    recommendation-response.dto.ts
```

Endpoints:

```http
POST /recommendations
POST /recommendations/day-plan
POST /recommendations/alternatives
```

Input:

```json
{
  "tripId": "trip_123",
  "date": "2026-07-04",
  "userLocation": {
    "lat": 40.758,
    "lng": -73.985
  },
  "filters": {
    "planTypes": ["culture", "photo_spot", "restaurant"],
    "maxBudget": 250,
    "maxDistanceMinutes": 45
  }
}
```

Output:

```json
{
  "recommendations": [
    {
      "placeId": "place_123",
      "title": "Top of the Rock",
      "type": "viewpoint",
      "score": 92,
      "reasons": [
        "Compatible with family ages",
        "Good weather window",
        "Close to next plan",
        "Official ticket link available"
      ],
      "warnings": [],
      "officialLinks": [
        {
          "label": "Official tickets",
          "url": "https://..."
        }
      ]
    }
  ]
}
```

---

# PARTE III — MOTOR DE RECOMENDACIÓN

## 12. Estructura del motor de recomendación

```text
recommendation-engine/
  scoring/
    base-score.ts
    family-score.ts
    weather-score.ts
    distance-score.ts
    budget-score.ts
    quality-score.ts
    preference-score.ts
    accessibility-score.ts
    event-score.ts

  filters/
    age.filter.ts
    weather.filter.ts
    budget.filter.ts
    accessibility.filter.ts
    distance.filter.ts
    opening-hours.filter.ts
    ticket-required.filter.ts

  ranking/
    rank-recommendations.ts
    diversify-results.ts
    avoid-tourist-traps.ts

  explanations/
    build-recommendation-reasons.ts
    build-warning-messages.ts

  itinerary-optimizer/
    build-day-itinerary.ts
    optimize-route-order.ts
    insert-meal-breaks.ts
    insert-rest-breaks.ts
    balance-indoor-outdoor.ts

  weather-adapter/
    adapt-to-rain.ts
    adapt-to-heat.ts
    adapt-to-cold.ts
    adapt-to-wind.ts

  transport-adapter/
    calculate-route-burden.ts
    compare-transport-options.ts
```

---

## 13. Fórmula de scoring recomendada

Cada plan debe recibir un score de 0 a 100.

```text
finalScore =
  qualityScore * 0.22 +
  preferenceScore * 0.18 +
  familyCompatibilityScore * 0.16 +
  weatherCompatibilityScore * 0.12 +
  distanceConvenienceScore * 0.10 +
  budgetCompatibilityScore * 0.08 +
  accessibilityScore * 0.06 +
  uniquenessScore * 0.04 +
  eventRelevanceScore * 0.04
```

### 13.1 Penalizaciones obligatorias

Aplicar penalización si:

- El plan no es apto por edad.
- Está cerrado en la fecha.
- Requiere entrada y no hay disponibilidad conocida.
- Está demasiado lejos.
- El clima lo hace poco recomendable.
- No es compatible con movilidad reducida.
- Tiene reputación de trampa turística.
- No hay enlace oficial o fuente fiable.

### 13.2 Reglas de descarte absoluto

Descartar totalmente si:

- Incumple edad mínima legal.
- Está cerrado todo el día.
- No es seguro para el grupo.
- No es accesible cuando el usuario requiere accesibilidad obligatoria.
- La fuente es de baja confianza y no hay confirmación alternativa.

---

## 14. Construcción de itinerarios

El itinerario debe construirse así:

1. Leer perfil del viaje.
2. Obtener clima por día.
3. Obtener eventos disponibles.
4. Obtener POIs candidatos.
5. Filtrar por edad, horario, clima, presupuesto y accesibilidad.
6. Agrupar por zonas para reducir desplazamientos.
7. Insertar comidas.
8. Insertar descansos.
9. Calcular transporte entre cada punto.
10. Generar alternativas.
11. Explicar por qué se eligió cada plan.

### 14.1 Reglas de ritmo

#### Ritmo relajado

- Máximo 2-3 planes principales al día.
- Más pausas.
- Menos cambios de barrio.

#### Ritmo normal

- 3-4 planes principales al día.
- 1 comida principal + 1 pausa.

#### Ritmo intenso

- 4-6 planes al día.
- Mayor tolerancia a caminar y usar transporte.

---

# PARTE IV — BASE DE DATOS

## 15. Modelo Prisma recomendado

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  locale    String   @default("es")
  trips     Trip[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Trip {
  id              String       @id @default(cuid())
  userId          String?
  user            User?        @relation(fields: [userId], references: [id])
  title           String
  startDate       DateTime
  endDate         DateTime
  nationality     String?
  language        String       @default("es")
  accommodationId String?
  accommodation   Location?    @relation(fields: [accommodationId], references: [id])
  travelers       Traveler[]
  preferences     Preference?
  itineraries     Itinerary[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model Traveler {
  id                String   @id @default(cuid())
  tripId            String
  trip              Trip     @relation(fields: [tripId], references: [id])
  age               Int
  nationality       String?
  mobilityNeeds     String[]
  foodRestrictions  String[]
  createdAt         DateTime @default(now())
}

model Preference {
  id              String @id @default(cuid())
  tripId          String @unique
  trip            Trip   @relation(fields: [tripId], references: [id])
  restaurants     Int
  museums         Int
  viewpoints      Int
  culture         Int
  photoSpots      Int
  parks           Int
  shopping        Int
  broadway        Int
  sports          Int
  freePlans       Int
  premiumPlans    Int
  historical      Int
  relaxed         Int
  kidsFriendly    Int
  nightlife       Int
  spanishHeritage Int
  fourthOfJuly    Int
  worldCup2026    Int
}

model Location {
  id        String   @id @default(cuid())
  name      String?
  address   String?
  lat       Float
  lng       Float
  borough   String?
  createdAt DateTime @default(now())
}

model Place {
  id               String   @id @default(cuid())
  name             String
  slug             String   @unique
  type             String
  description      String
  lat              Float
  lng              Float
  borough          String
  address          String?
  officialWebsite  String?
  ticketUrl        String?
  bookingUrl       String?
  priceLevel       Int?
  minAge           Int?
  maxAge           Int?
  indoorOutdoor    String
  familyScore      Float
  photoScore       Float
  cultureScore     Float
  qualityScore     Float
  accessibility    Json?
  openingHours     Json?
  sourceRefs       Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Event {
  id              String   @id @default(cuid())
  name            String
  description     String
  startDate       DateTime
  endDate         DateTime
  locationId      String?
  location        Location? @relation(fields: [locationId], references: [id])
  category        String
  officialWebsite String?
  ticketUrl       String?
  minAge          Int?
  familyScore     Float
  qualityScore    Float
  sourceRefs      Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Itinerary {
  id        String          @id @default(cuid())
  tripId    String
  trip      Trip            @relation(fields: [tripId], references: [id])
  days      ItineraryDay[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model ItineraryDay {
  id          String          @id @default(cuid())
  itineraryId String
  itinerary   Itinerary       @relation(fields: [itineraryId], references: [id])
  date        DateTime
  stops       ItineraryStop[]
  weather     Json?
  notes       String?
}

model ItineraryStop {
  id             String       @id @default(cuid())
  itineraryDayId String
  itineraryDay   ItineraryDay @relation(fields: [itineraryDayId], references: [id])
  placeId        String?
  eventId        String?
  startTime      DateTime
  endTime        DateTime
  title          String
  description    String?
  transportToNext Json?
  score          Float?
  warnings       String[]
  officialLinks  Json?
}
```

---

# PARTE V — APIs EXTERNAS

## 16. Integraciones externas recomendadas

### 16.1 Mapas y geolocalización

- **Google Maps Platform**:
  - Places API.
  - Directions API.
  - Geocoding API.
  - Distance Matrix API.
- **Mapbox**:
  - Map rendering.
  - Isochrones.
  - Directions.
- **Navegador Web Geolocation API**:
  - Ubicación actual del usuario con permiso explícito.

Uso:

- Autocompletar alojamiento.
- Calcular rutas.
- Mostrar mapa.
- Detectar planes cercanos.

### 16.2 Transporte público

- **MTA GTFS / GTFS Realtime**.
- **Google Directions Transit**.
- **NYC Ferry official data**.
- **PATH / NJ Transit** si hay planes en New Jersey o Mundial.

Uso:

- Estado de líneas.
- Rutas en metro/bus/ferry.
- Estimación de tiempos.
- Alertas de servicio.

### 16.3 Clima

- **OpenWeather One Call API**.
- **NOAA / National Weather Service** como fuente oficial complementaria.

Uso:

- Forecast 7 días.
- Probabilidad de lluvia.
- Temperatura.
- Viento.
- Alertas meteorológicas.

### 16.4 Planes, restaurantes y POIs

- **Google Places API**.
- **Yelp Fusion API**.
- **NYC Open Data**.
- **NYC Official Guide**.
- **NYC Parks Events**.
- **Ticketmaster API**.
- **Eventbrite API**.
- Webs oficiales de museos y atracciones.

### 16.5 Mundial 2026

- Fuentes oficiales FIFA.
- Web oficial de NY/NJ Host City.
- Datos propios cacheados y actualizados.

### 16.6 Sail4th / Juan Sebastián de Elcano

- Web oficial Sail4th.
- Webs oficiales institucionales.
- Fuentes oficiales del buque/Armada cuando existan.
- NYC event pages.

---

## 17. Gestión de claves API

Nunca exponer claves privadas en frontend.

`.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nyc_family_planner"
REDIS_URL="redis://localhost:6379"

NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN=""

GOOGLE_MAPS_API_KEY=""
MAPBOX_SECRET_TOKEN=""
OPENWEATHER_API_KEY=""
YELP_API_KEY=""
TICKETMASTER_API_KEY=""
EVENTBRITE_API_KEY=""

JWT_SECRET="change-me"
COOKIE_SECRET="change-me"
```

---

# PARTE VI — API INTERNA

## 18. Endpoints internos mínimos

```http
# Health
GET /health

# Trips
POST /trips
GET /trips/:tripId
PATCH /trips/:tripId
DELETE /trips/:tripId

# Weather
GET /weather/trip/:tripId
GET /weather/forecast

# Places
GET /places
GET /places/:placeId
GET /places/nearby

# Restaurants
GET /restaurants
GET /restaurants/recommended

# Events
GET /events
GET /events/special

# Transport
POST /transport/route
GET /transport/status
GET /transport/nearby-stations

# Recommendations
POST /recommendations
POST /recommendations/day-plan
POST /recommendations/alternatives

# Itinerary
POST /itinerary/generate
GET /itinerary/:tripId
PATCH /itinerary/:itineraryId

# Sail4th / Elcano
GET /sail4th-elcano/events
GET /sail4th-elcano/viewpoints

# 4 July
GET /fourth-of-july/events
GET /fourth-of-july/fireworks-viewpoints

# World Cup
GET /world-cup/matches
GET /world-cup/fan-zones
GET /world-cup/plans

# Feedback
POST /feedback/recommendation
POST /feedback/itinerary
```

---

# PARTE VII — UX, ACCESIBILIDAD E INTERNACIONALIZACIÓN

## 19. Sistema visual

Estética:

- Inspiración marítima moderna.
- Azul marino.
- Blanco.
- Dorado suave.
- Rojo suave.
- Mapas tipo carta náutica.
- Iconografía de brújula, velas, skyline y rutas.

Debe evitar parecer una web turística genérica.

## 20. Accesibilidad

Obligatorio:

- Contraste correcto.
- Navegación por teclado.
- Textos alternativos.
- Focus visible.
- Formularios con labels.
- Estados de error claros.
- No depender solo del color.
- Compatible con lectores de pantalla.

## 21. Idiomas

Idiomas iniciales:

- Español.
- Inglés.

Preparar estructura para añadir:

- Francés.
- Italiano.
- Alemán.
- Portugués.

```text
messages/
  es.json
  en.json
```

---

# PARTE VIII — SEGURIDAD Y PRIVACIDAD

## 22. Seguridad backend

Obligatorio:

- Rate limiting.
- Validación de inputs.
- Sanitización.
- CORS configurado.
- Helmet.
- Logs sin datos sensibles.
- Protección contra abuso de APIs externas.
- Timeouts en llamadas externas.
- Retries controlados.

## 23. Privacidad

No guardar más datos de los necesarios.

Datos sensibles:

- Edad de viajeros.
- Ubicación.
- Restricciones alimentarias.
- Movilidad reducida.

Reglas:

- Pedir permiso antes de usar ubicación actual.
- Permitir borrar viaje.
- Permitir usar la web sin cuenta.
- Anonimizar analytics.
- No vender datos.

---

# PARTE IX — TESTING

## 24. Tests frontend

Usar:

- Vitest.
- React Testing Library.
- Playwright.

Tests mínimos:

- Onboarding completo.
- Validación de edades.
- Cambio de idioma.
- Render de itinerario.
- Mapa carga correctamente.
- Alertas de clima aparecen.
- Links oficiales aparecen.

## 25. Tests backend

Usar:

- Jest.
- Supertest.
- Tests de integración con base de datos test.

Tests mínimos:

- Crear viaje.
- Validar perfil familiar.
- Obtener clima.
- Filtrar por edad.
- Generar recomendaciones.
- Generar itinerario.
- Calcular ruta.
- Cachear resultados.

## 26. Tests del motor de recomendación

Casos obligatorios:

1. Familia con niños pequeños y lluvia.
2. Grupo de adultos con interés en miradores.
3. Familia española en fechas de Sail4th.
4. Viajeros durante el 4 de julio.
5. Grupo con movilidad reducida.
6. Menores de 21 años intentando acceder a plan no permitido.
7. Mundial 2026 con partido en NY/NJ.
8. Presupuesto bajo.
9. Calor extremo.
10. Alojamiento lejos de Manhattan.

---

# PARTE X — CI/CD Y DESPLIEGUE

## 27. Docker Compose desarrollo

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: nyc
      POSTGRES_PASSWORD: nyc
      POSTGRES_DB: nyc_family_planner

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    depends_on:
      - api
```

## 28. GitHub Actions

Pipeline mínimo:

```text
on pull request:
  - install dependencies
  - lint
  - typecheck
  - test
  - build
  - run e2e basic
```

---

# PARTE XI — ORDEN DE IMPLEMENTACIÓN PARA CODEX

## 29. Fase 1 — Base del proyecto

Codex debe crear:

1. Monorepo con pnpm + Turborepo.
2. App frontend Next.js.
3. App backend NestJS.
4. Package shared.
5. Docker Compose con PostgreSQL/PostGIS y Redis.
6. Configuración TypeScript, ESLint y Prettier.
7. Variables `.env.example`.

## 30. Fase 2 — Modelos y base de datos

Codex debe crear:

1. Prisma schema.
2. Migraciones iniciales.
3. Seeds de lugares básicos de NYC.
4. Seeds de categorías.
5. Repositorios backend.

## 31. Fase 3 — Onboarding

Codex debe crear:

1. Formulario multipaso.
2. Validación Zod.
3. Estado Zustand.
4. Endpoint `POST /trips`.
5. Pantalla resumen.

## 32. Fase 4 — Clima y mapas

Codex debe crear:

1. Integración clima.
2. Adaptador OpenWeather.
3. Caché Redis.
4. Mapa principal.
5. Geolocation API del navegador.
6. Autocomplete de alojamiento.

## 33. Fase 5 — Lugares, restaurantes y eventos

Codex debe crear:

1. Modelo `Place`.
2. Modelo `Event`.
3. Integración Google Places/Yelp.
4. Integración Ticketmaster/Eventbrite.
5. Normalizador de datos.
6. Scoring de calidad.

## 34. Fase 6 — Motor de recomendación

Codex debe crear:

1. Filtros obligatorios.
2. Scoring.
3. Ranking.
4. Explicaciones.
5. Penalizaciones.
6. Alternativas por clima.

## 35. Fase 7 — Itinerarios y transporte

Codex debe crear:

1. Generador de itinerario diario.
2. Optimizador de rutas.
3. Integración Directions/Transit.
4. Componentes timeline.
5. Exportación a PDF opcional.

## 36. Fase 8 — Secciones especiales

Codex debe crear:

1. Sail4th / Elcano.
2. 4 de julio.
3. Mundial 2026.
4. Fan zones.
5. Viewpoints.
6. Enlaces oficiales.

## 37. Fase 9 — Calidad final

Codex debe crear:

1. Tests.
2. Accesibilidad.
3. SEO.
4. Performance.
5. Error handling.
6. Observabilidad.

---

# PARTE XII — CRITERIOS DE ACEPTACIÓN

## 38. La web estará correctamente implementada si cumple:

- El usuario puede crear un viaje completo.
- El sistema entiende edades, fechas, nacionalidad, presupuesto y preferencias.
- La web obtiene clima de 7 días.
- Las recomendaciones cambian según clima.
- Los planes tienen links oficiales si requieren entradas.
- El mapa muestra lugares y rutas.
- El transporte indica cómo llegar.
- Los planes se filtran por edad y accesibilidad.
- Hay secciones especiales de Sail4th/Elcano, 4 de julio y Mundial 2026.
- El itinerario es realista y no sobrecarga al usuario.
- El frontend es responsive.
- El backend está documentado.
- Hay tests principales.
- Las claves API no se exponen.
- El código está tipado y organizado profesionalmente.

---

## 39. Instrucción final para Codex

Codex debe implementar el proyecto siguiendo este documento como fuente principal de estructura técnica.

Prioridad de implementación:

1. Estructura limpia y escalable.
2. Tipado estricto.
3. Funcionalidad real antes que decoración.
4. Recomendaciones de calidad.
5. APIs externas encapsuladas.
6. Seguridad y privacidad.
7. Diseño premium e intuitivo.

No crear código improvisado fuera de esta arquitectura salvo que sea estrictamente necesario y esté justificado.

