# NYC Family Planner — Documento funcional y técnico de la web

## 1. Visión del producto

**NYC Family Planner** será una web/app turística inteligente para familias y grupos que visitan Nueva York por primera vez o que desconocen la ciudad. Su objetivo no es listar planes de forma genérica, sino **decidir por el usuario qué planes son mejores según su grupo, fechas, clima, ubicación, presupuesto, edades, nacionalidad, idioma, movilidad, intereses y eventos especiales activos**.

La web se centrará en Nueva York y alrededores directos cuando sea necesario: Manhattan, Brooklyn, Queens, Bronx, Staten Island, Jersey City, Hoboken, Liberty State Park y MetLife/NYNJ Stadium para el Mundial 2026.

La experiencia estará inspirada visualmente en la llegada del buque escuela **Juan Sebastián de Elcano** y en el ambiente marítimo de **Sail4th 250**, con estética de cartas náuticas modernas, skyline, puerto de Nueva York, velas, mapas, brújulas, rutas y colores azul marino, blanco, dorado y rojo suave.

---

## 2. Objetivo principal

Crear el mejor asistente turístico familiar de Nueva York, capaz de:

1. Preguntar todos los datos relevantes del viaje.
2. Entender preferencias personales y restricciones reales.
3. Consultar APIs oficiales y fuentes fiables.
4. Analizar el clima de los próximos 7 días.
5. Recomendar planes adaptados al grupo.
6. Crear itinerarios diarios realistas.
7. Indicar transporte exacto: metro, bus, ferry, tren, caminando o taxi.
8. Priorizar planes de calidad y evitar trampas turísticas malas.
9. Incluir eventos especiales de verano 2026: Sail4th 250, Juan Sebastián de Elcano, 4 de julio y Mundial de fútbol 2026.
10. Dar enlaces oficiales para entradas, documentación, reservas y transporte.

---

## 3. Público objetivo

### Usuario principal

Familias o grupos que viajan a Nueva York y no conocen bien la ciudad.

### Casos típicos

- Familia española con niños pequeños.
- Familia con adolescentes.
- Pareja con padres mayores.
- Grupo de amigos que quiere planes fotográficos y restaurantes.
- Viajeros que van por el Mundial 2026.
- Visitantes interesados en el 4 de julio, los grandes veleros y el Juan Sebastián de Elcano.
- Turistas que no dominan el inglés y necesitan instrucciones claras.

---

## 4. Preguntas obligatorias al entrar en la web

Al entrar, la web debe mostrar un onboarding paso a paso. No debe parecer un formulario aburrido, sino un asistente de viaje.

### 4.1 Datos del grupo

Campos obligatorios:

- Número de personas.
- Nacionalidad de cada viajero o nacionalidad principal del grupo.
- Idioma preferido.
- Edad de cada ocupante.
- Si viajan con niños, bebés, adolescentes o personas mayores.
- Si alguien tiene movilidad reducida.
- Si alguien necesita accesibilidad: silla de ruedas, pocos escalones, ascensor, baños accesibles.
- Si hay alergias alimentarias.
- Restricciones alimentarias: vegetariano, vegano, halal, kosher, sin gluten, sin lactosa.
- Presupuesto aproximado por día.
- Ritmo de viaje: relajado, normal, intenso.
- Hora preferida para empezar el día.
- Hora máxima para volver al alojamiento.

### 4.2 Datos del viaje

Campos obligatorios:

- Fechas exactas de estancia.
- Dirección o zona del alojamiento.
- Aeropuerto o punto de llegada.
- Si tienen entradas ya compradas.
- Si quieren alquilar coche o solo transporte público.
- Si quieren evitar taxis.
- Si quieren caminar mucho, poco o normal.

### 4.3 Preferencias de planes

El usuario podrá elegir porcentajes o etiquetas:

- Restaurantes.
- Museos.
- Miradores.
- Sitios culturales.
- Zonas fotográficas.
- Parques.
- Compras.
- Musicales/Broadway.
- Eventos deportivos.
- Planes gratuitos.
- Planes premium.
- Planes históricos.
- Planes tranquilos.
- Planes para niños.
- Planes nocturnos.
- Planes relacionados con España/Juan Sebastián de Elcano.
- Planes del 4 de julio.
- Planes del Mundial 2026.

### 4.4 Preguntas inteligentes extra

La web debe hacer preguntas adaptativas:

- Si hay niños menores de 6 años: preguntar si usan carrito.
- Si hay menores de 21 años: ocultar o advertir planes con alcohol o edad mínima.
- Si hay personas mayores: priorizar rutas con descansos y ascensores.
- Si el viaje cae entre junio y julio de 2026: activar automáticamente la pestaña Mundial y la pestaña Sail4th/4 de julio.
- Si el viaje incluye el 4 de julio: preguntar si quieren fuegos artificiales, barcos, eventos patrióticos o evitar multitudes.
- Si el usuario es español: destacar planes ligados a España, Elcano, Casa de España, Queen Sofía Spanish Institute y presencia española en eventos navales.

---

## 5. Estructura principal de la web

### 5.1 Home

Debe contener:

- Hero visual con skyline de Nueva York y estética marítima inspirada en Elcano.
- Mensaje: “Tu guía inteligente para descubrir Nueva York en familia”.
- Botón principal: “Crear mi plan de viaje”.
- Botón secundario: “Explorar planes por mi cuenta”.
- Accesos rápidos:
  - Planes familiares.
  - Restaurantes.
  - Miradores.
  - Cultura.
  - Fotos.
  - Mundial 2026.
  - 4 de julio y Sail4th 250.

### 5.2 Onboarding del viaje

Pantallas:

1. Quién viaja.
2. Cuándo viajáis.
3. Dónde os alojáis.
4. Qué os gusta.
5. Presupuesto y ritmo.
6. Restricciones.
7. Confirmación del perfil.

Resultado: creación de un objeto `TravelProfile`.

### 5.3 Dashboard personalizado

Una vez completado el onboarding, el usuario verá:

- Resumen del grupo.
- Clima de los próximos 7 días.
- Mejor día para planes al aire libre.
- Mejor día para museos/interior.
- Alertas importantes.
- Top 10 planes recomendados.
- Itinerario sugerido por días.
- Mapa interactivo.
- Botón: “Regenerar itinerario”.
- Botón: “Cambiar preferencias”.

### 5.4 Buscador inteligente de planes

Filtros:

- Fecha.
- Hora.
- Barrio.
- Interior/exterior.
- Gratis/de pago.
- Edad mínima.
- Duración.
- Distancia desde el alojamiento.
- Nivel de multitudes.
- Adaptado a niños.
- Adaptado a lluvia.
- Requiere reserva.
- Requiere documentación.
- Requiere entrada.
- Fotografiable.
- Cultural.
- Gastronómico.
- Mundial 2026.
- Elcano/Sail4th.

Cada plan tendrá una ficha:

- Nombre.
- Categoría.
- Descripción corta.
- Por qué encaja con el grupo.
- Edad recomendada.
- Precio aproximado.
- Duración.
- Mejor hora.
- Mejor clima.
- Cómo llegar.
- Link oficial.
- Necesidad de reserva.
- Nivel de calidad.
- Nivel de popularidad.
- Riesgo de masificación.
- Fotos.
- Alternativas cercanas.
- Restaurantes cercanos.

---

## 6. Secciones principales

## 6.1 Planes familiares

Debe priorizar:

- Central Park.
- American Museum of Natural History.
- Intrepid Sea, Air & Space Museum.
- Statue of Liberty/Ellis Island.
- Brooklyn Bridge Park.
- Governors Island.
- SUMMIT One Vanderbilt.
- Top of the Rock.
- Circle Line Sightseeing Cruises.
- Bronx Zoo.
- New York Aquarium.
- Children’s Museum of Manhattan.
- Transit Museum.
- Little Island.
- High Line.

Reglas:

- Con niños pequeños: menos desplazamientos, más baños, paradas y parques.
- Con adolescentes: miradores, fotos, tiendas, deporte, experiencias inmersivas.
- Con mayores: evitar caminatas largas y estaciones complicadas.

## 6.2 Restaurantes

Categorías:

- Familiar.
- Económico.
- Clásico neoyorquino.
- Vistas.
- Cerca del plan.
- Apto niños.
- Apto alergias.
- Español/latino.
- Pizza.
- Bagels.
- Hamburguesas.
- Food halls.
- Comida rápida de calidad.
- Cena especial.

Fuentes:

- Google Places.
- Yelp Fusion.
- Foursquare.
- Michelin Guide, si se usa scraping no permitido, evitar; usar enlaces oficiales manuales o proveedor autorizado.
- The Infatuation/Eater solo como fuente editorial manual, no scraping automático salvo permiso.

Reglas de calidad:

- No recomendar restaurantes con puntuación alta pero pocas reseñas.
- Penalizar restaurantes muy turísticos con mala relación calidad/precio.
- Priorizar lugares con horarios abiertos en la fecha/hora concreta.
- Verificar distancia real desde el plan anterior.
- Considerar reservas en Resy, OpenTable o web oficial.

## 6.3 Cultura

Planes:

- MET.
- MoMA.
- Guggenheim.
- Whitney Museum.
- 9/11 Memorial & Museum.
- Tenement Museum.
- Museum of the City of New York.
- The Morgan Library.
- New York Public Library.
- Broadway.
- Lincoln Center.
- Carnegie Hall.
- Queen Sofía Spanish Institute.

Reglas:

- Adaptar por edad.
- Evitar museos demasiado largos para niños pequeños.
- Sugerir itinerarios internos: qué salas ver si solo tienen 1-2 horas.
- Incluir enlaces oficiales de entradas.

## 6.4 Miradores

Planes:

- Top of the Rock.
- Empire State Building.
- One World Observatory.
- Edge.
- SUMMIT One Vanderbilt.
- Brooklyn Heights Promenade.
- DUMBO.
- Gantry Plaza State Park.
- Roosevelt Island Tram.
- Staten Island Ferry.

Reglas:

- Si llueve o hay niebla, no recomendar miradores de pago salvo que el usuario lo pida.
- Si hay atardecer despejado, priorizar miradores.
- Si hay niños pequeños, considerar esperas, baños y seguridad.

## 6.5 Zonas fotografiables

Planes:

- DUMBO, Washington Street.
- Brooklyn Bridge.
- Manhattan Bridge.
- Pebble Beach.
- Times Square, con advertencia de masificación.
- Grand Central Terminal.
- New York Public Library.
- Bryant Park.
- The Vessel/Hudson Yards, solo si está disponible.
- Little Island.
- SoHo.
- Flatiron District.
- Radio City Music Hall.
- Rockefeller Center.
- Oculus.
- Pier 57 Rooftop Park.
- Governors Island.
- Liberty State Park.

Reglas:

- Recomendar horas concretas para luz.
- Evitar horas de máxima masificación.
- Incluir alternativa si hace mal tiempo.

---

## 7. Pestaña especial: Juan Sebastián de Elcano, Sail4th 250 y 4 de julio

### 7.1 Contexto

La web debe tener una pestaña propia llamada:

**“Elcano, grandes veleros y 4 de julio”**

Esta sección estará inspirada en la llegada y participación del buque escuela **Juan Sebastián de Elcano** dentro del gran ambiente naval de verano 2026 en Nueva York.

### 7.2 Datos confirmados para integrar

- Sail4th 250 celebra el 250 aniversario de Estados Unidos en el puerto de Nueva York y Nueva Jersey el 4 de julio de 2026.
- El evento se presenta como una gran celebración con veleros internacionales, actos en tierra, mar y aire.
- Sail4th indica 6 días de celebración, 32 países y 15.000 marineros.
- El listado de tall ships de Sail4th incluye al **Juan Sebastian de Elcano** de España.
- El buque Juan Sebastián de Elcano es descrito como un barco de 371 pies, cuatro mástiles, con Cádiz como puerto base y perteneciente a la Armada Española.
- La web oficial de NY/NJ y Sail4th deben ser la fuente prioritaria para horarios, entradas, visitas a bordo, muelles y cambios de última hora.

### 7.3 Funcionalidades de esta pestaña

La pestaña debe incluir:

1. Calendario de eventos Sail4th.
2. Mapa del puerto con puntos de observación.
3. Ficha del Juan Sebastián de Elcano.
4. Historia breve del barco.
5. Mejores sitios para ver los veleros.
6. Rutas recomendadas desde Manhattan, Brooklyn, Queens y Jersey City.
7. Alertas de multitudes.
8. Enlaces oficiales para tickets y visitas.
9. Planes alternativos si hay mal tiempo.
10. Sección para españoles: contexto histórico y cultural.
11. Itinerario especial del 4 de julio.
12. Coordinación con los fuegos artificiales de Macy’s.

### 7.4 Planes sugeridos para Sail4th/Elcano

- Ver entrada de veleros desde Governors Island.
- Ver la flota desde Battery Park.
- Paseo por Hudson River Park.
- Intrepid Museum y zona de muelles del West Side.
- Staten Island Ferry como opción gratuita con vistas.
- Liberty State Park para vista panorámica del puerto.
- Brooklyn Bridge Park para skyline + barcos.
- Crucero oficial si existe ticket autorizado.
- Visita a bordo del Elcano si Sail4th/Armada confirma acceso público.

### 7.5 4 de julio en Nueva York

La web debe tener un submódulo específico:

**“4 de julio inteligente”**

Debe incluir:

- Fuegos artificiales de Macy’s.
- Zonas de visualización oficiales.
- Restricciones de acceso.
- Horarios actualizados.
- Alternativas para familias con niños.
- Alternativas para evitar multitudes.
- Restaurantes con vistas si hay disponibilidad.
- Planes gratuitos.
- Planes premium.
- Transporte antes y después del evento.
- Alertas de cortes de calles y estaciones saturadas.

Reglas:

- Nunca sugerir un punto de observación si no está permitido oficialmente.
- En eventos de alta masificación, recomendar llegar con margen.
- Incluir planes alternativos por seguridad.
- Mostrar advertencia si viajan con niños pequeños o personas mayores.

---

## 8. Pestaña especial: Mundial de fútbol 2026 en Nueva York/Nueva Jersey

### 8.1 Objetivo

Crear una sección para visitantes que quieran vivir el Mundial 2026 desde Nueva York aunque no tengan entradas.

Nombre de la pestaña:

**“Mundial 2026 NY/NJ”**

### 8.2 Datos base a integrar

Partidos confirmados en NYNJ Stadium:

- 13 junio 2026, 18:00 ET: Brasil vs Marruecos.
- 16 junio 2026, 15:00 ET: Francia vs Senegal.
- 22 junio 2026, 20:00 ET: Noruega vs Senegal.
- 25 junio 2026, 16:00 ET: Ecuador vs Alemania.
- 27 junio 2026, 17:00 ET: Panamá vs Inglaterra.
- 30 junio 2026, 17:00 ET: Round of 32.
- 5 julio 2026, 16:00 ET: Round of 16.
- 19 julio 2026, 15:00 ET: FIFA World Cup 26 Final.

### 8.3 Fan zones y eventos

Integrar en la web:

- Jersey Fan Hub — Sports Illustrated Stadium, Harrison, NJ, fechas seleccionadas del 11 junio al 19 julio.
- Queens Group Stage HQ — USTA Billie Jean King National Tennis Center, Queens, 11-27 junio.
- Fan Village Rockefeller Center — 6-19 julio.
- Staten Island Fan Zone — SIUH Community Park, 29 junio-2 julio.
- Bronx Fan Zone — Bronx Terminal Market, 13-14 junio.
- Brooklyn Fan Zone — Brooklyn Bridge Park, fechas seleccionadas del 13 junio al 19 julio.

### 8.4 Funcionalidades del módulo Mundial

- Calendario de partidos.
- Filtro por selección.
- Filtro por país/nacionalidad del usuario.
- Fan zones cercanas.
- Bares y restaurantes para ver partidos.
- Cómo llegar al NYNJ Stadium.
- Enlaces oficiales a FIFA tickets.
- Enlaces a transporte oficial.
- Alertas de precios y disponibilidad.
- Recomendaciones según si el usuario va con niños.
- Recomendaciones de planes prepartido y postpartido.
- Alternativas si no hay entradas.

### 8.5 Reglas especiales

- No comprar ni revender entradas desde la web salvo integración oficial autorizada.
- Siempre enlazar a FIFA.com/tickets para tickets oficiales.
- Mostrar advertencia sobre reventa y precios dinámicos.
- Para familias, priorizar fan zones oficiales y eventos con control de acceso.

---

## 9. Clima y adaptación automática del itinerario

### 9.1 Requisito

La web debe mostrar previsión de 7 días y adaptar el itinerario automáticamente.

### 9.2 APIs recomendadas

1. **National Weather Service API**
   - Oficial para Estados Unidos.
   - API JSON-LD.
   - Alertas, observaciones y forecast.
   - Ideal como fuente principal para Nueva York.

2. **Open-Meteo**
   - Sin API key.
   - Forecast e histórico.
   - Útil como backup y para datos horarios.

3. **OpenWeather One Call API**
   - Opción comercial para forecast, alertas, histórico y datos unificados.

### 9.3 Lógica de adaptación

Ejemplos:

- Lluvia fuerte: mover miradores y parques a otro día; recomendar museos, Broadway, Grand Central, NYPL, Oculus, food halls.
- Niebla: evitar miradores de pago.
- Calor intenso: evitar caminatas largas al mediodía; recomendar museos, ferry, parques por la mañana, descansos con aire acondicionado.
- Frío: planes interiores y rutas de metro con menos caminata.
- Viento fuerte: evitar ferries/cruceros si hay avisos.
- Día despejado: priorizar miradores, puentes, parques y fotos al atardecer.

### 9.4 Objeto técnico WeatherProfile

```json
{
  "date": "2026-07-04",
  "temperature_max_c": 29,
  "temperature_min_c": 21,
  "precipitation_probability": 20,
  "wind_kmh": 14,
  "visibility": "good",
  "alerts": [],
  "outdoor_score": 86,
  "indoor_score": 45,
  "photo_score": 90,
  "family_comfort_score": 78
}
```

---

## 10. Transporte, mapas y geolocalización

### 10.1 Objetivo

Cada plan recomendado debe responder:

- Dónde está.
- Cómo ir desde el alojamiento.
- Cómo ir desde el plan anterior.
- Cuánto se tarda.
- Qué línea de metro/bus/ferry usar.
- Cuánto hay que caminar.
- Si es accesible.
- Qué alternativa usar si hay incidencias.

### 10.2 APIs y fuentes

1. **Google Maps Platform**
   - Maps JavaScript API.
   - Places API.
   - Routes API.
   - Geocoding API.
   - Geolocation API.

2. **MTA Developer Resources**
   - GTFS estático.
   - GTFS-Realtime para metro.
   - Bus Time APIs para buses.
   - Service alerts.

3. **MTA Maps oficiales**
   - Mapas descargables de metro, buses, Staten Island Railway, LIRR y Metro-North.

4. **OpenTripPlanner**
   - Para montar un motor propio de rutas con GTFS, OpenStreetMap y datos realtime.
   - Muy útil si se quiere independencia de Google.

5. **NYC Ferry**
   - Integrar rutas y horarios si hay API o feed GTFS disponible.

### 10.3 Localización del usuario

Formas recomendadas:

1. HTML5 Browser Geolocation API (`navigator.geolocation`) con permiso explícito.
2. Google Maps Geolocation API si se quiere localización por WiFi/celdas.
3. Fallback manual: introducir dirección, hotel, barrio o punto en mapa.

Reglas de privacidad:

- Pedir permiso claro.
- Explicar para qué se usa la ubicación.
- Permitir usar la web sin compartir ubicación.
- Guardar ubicación aproximada, no historial exacto, salvo consentimiento.

---

## 11. APIs recomendadas para planes, restaurantes y eventos

### 11.1 Lugares y POIs

- **Google Places API**: búsqueda de lugares, detalles, fotos, horarios, tipos y localización.
- **Foursquare Places API**: POIs, categorías, fotos, tips y señales de popularidad.
- **Yelp Fusion / Yelp Places API**: restaurantes, reseñas, ratings y filtros gastronómicos.
- **OpenStreetMap / Overpass API**: datos abiertos de puntos de interés, parques, baños, fuentes, accesibilidad.
- **Wikidata / Wikipedia API**: contexto histórico y cultural.

### 11.2 Eventos

- **Ticketmaster Discovery API**: eventos, venues, imágenes, fechas y tickets.
- **NYC Parks Events / NYC Open Data**: eventos gratuitos en parques.
- **NYC Tourism + Conventions**: calendario editorial y guías oficiales cuando haya acceso permitido.
- **Eventbrite API**: eventos pequeños/locales si se dispone de acceso.
- **FIFA / NYNJ World Cup official pages**: fuente prioritaria del Mundial.
- **Sail4th official site**: fuente prioritaria de Sail4th/Elcano.
- **Macy’s official site**: fuente prioritaria de fuegos artificiales.

### 11.3 Seguridad, alertas y ciudad

- **NYC Open Data**.
- **NYC 311 Service Requests** para incidencias urbanas.
- **MTA Service Alerts**.
- **NWS Weather Alerts**.
- **NYC Emergency Management** para eventos grandes.

---

## 12. Sistema de calidad de recomendaciones

Cada plan debe tener una puntuación interna de 0 a 100.

### 12.1 Factores positivos

- Encaja con edades.
- Encaja con preferencias.
- Está cerca de otros planes.
- Tiene buena reputación.
- Tiene horario abierto.
- Tiene buen clima para ese día.
- Tiene acceso fácil en transporte público.
- Tiene enlace oficial.
- Tiene opción familiar.
- Tiene baños o servicios cercanos.
- Tiene valor cultural/fotográfico.

### 12.2 Factores negativos

- Demasiado turístico sin valor claro.
- Muchas reseñas negativas recientes.
- Horario incierto.
- Mucha distancia.
- Mala accesibilidad.
- Requiere edad mínima incompatible.
- Mal clima para ese plan.
- Precio excesivo para el presupuesto.
- Riesgo alto de masificación.
- Falta de enlace oficial.

### 12.3 Fórmula inicial

```text
score_final =
  0.20 * ajuste_preferencias +
  0.15 * calidad_fuentes +
  0.15 * compatibilidad_edades +
  0.10 * clima +
  0.10 * transporte +
  0.10 * presupuesto +
  0.10 * disponibilidad +
  0.05 * valor_fotografico +
  0.05 * novedad_local
```

---

## 13. Uso de foros y señales sociales

La web debe aprender de foros y comunidades, pero sin copiar contenido ni depender de una sola opinión.

### 13.1 Fuentes útiles

- Reddit r/AskNYC.
- Reddit r/nyc.
- Reddit r/FoodNYC.
- Reddit r/travel.
- Tripadvisor forums.
- Google Reviews.
- Yelp Reviews.
- Foursquare tips.
- Blogs locales: Eater NY, The Infatuation, Time Out NY, Secret NYC, NYC Tourism.

### 13.2 Cómo usar foros correctamente

- No usar scraping agresivo.
- Usar APIs oficiales cuando existan.
- Guardar solo señales agregadas.
- Detectar temas repetidos: “worth it”, “overrated”, “kid-friendly”, “rainy day”, “best view”.
- No mostrar comentarios personales sin permiso/licencia.
- Cruzar siempre la recomendación con fuentes oficiales.

### 13.3 Señales que debe extraer el sistema

```json
{
  "place_id": "top_of_the_rock",
  "signals": {
    "locals_recommend": 0.82,
    "tourist_trap_risk": 0.18,
    "kid_friendly": 0.74,
    "rainy_day_suitable": 0.20,
    "photo_quality": 0.95,
    "overcrowding_risk": 0.70
  },
  "evidence_summary": "Frecuentemente recomendado frente a otros miradores por vistas claras del Empire State y Central Park. Riesgo alto de cola en atardecer."
}
```

---

## 14. Modelo de datos principal

### 14.1 TravelProfile

```json
{
  "group_id": "uuid",
  "language": "es",
  "nationality": "Spain",
  "dates": {
    "arrival": "2026-07-02",
    "departure": "2026-07-08"
  },
  "travelers": [
    {"age": 42, "mobility": "normal"},
    {"age": 39, "mobility": "normal"},
    {"age": 12, "mobility": "normal"},
    {"age": 8, "mobility": "normal"}
  ],
  "hotel_location": {
    "address": "Times Square, New York",
    "lat": 40.758,
    "lng": -73.9855
  },
  "budget_level": "medium",
  "pace": "normal",
  "interests": ["miradores", "cultura", "fotos", "restaurantes", "elcano", "4_july"],
  "food_restrictions": [],
  "avoid": ["planes demasiado masificados"]
}
```

### 14.2 PlanItem

```json
{
  "id": "summit_one_vanderbilt",
  "name": "SUMMIT One Vanderbilt",
  "category": ["mirador", "fotografico", "interior"],
  "location": {"lat": 40.7527, "lng": -73.9786},
  "official_url": "https://summitov.com/",
  "requires_ticket": true,
  "age_rules": null,
  "duration_minutes": 90,
  "weather_fit": {"rain": 80, "sun": 90, "fog": 30},
  "family_score": 82,
  "photo_score": 95,
  "crowd_risk": 75,
  "price_level": "high"
}
```

### 14.3 ItineraryDay

```json
{
  "date": "2026-07-04",
  "theme": "Sail4th + 4 de julio",
  "weather_summary": "Soleado, buen día para puerto y fotos",
  "items": [
    {
      "time": "09:30",
      "plan_id": "battery_park",
      "transport_from_previous": "Metro línea 1 hasta South Ferry"
    }
  ],
  "warnings": ["Día de alta masificación. Confirmar accesos oficiales."]
}
```

---

## 15. Motor de itinerarios

### 15.1 Inputs

- Perfil del grupo.
- Fechas.
- Clima.
- Horarios.
- Disponibilidad.
- Distancias.
- Tráfico/transporte.
- Eventos especiales.
- Nivel de cansancio estimado.

### 15.2 Proceso

1. Filtrar planes incompatibles por edad, horario, clima o presupuesto.
2. Agrupar planes por zona.
3. Calcular calidad individual.
4. Calcular combinaciones eficientes.
5. Añadir comidas en zonas coherentes.
6. Añadir descansos.
7. Comprobar transporte.
8. Insertar reservas necesarias.
9. Crear plan A, plan B por lluvia y plan C anti-multitudes.

### 15.3 Output

Cada día debe tener:

- Tema del día.
- Ruta por horas.
- Mapa.
- Transporte entre planes.
- Comida/cena sugerida.
- Enlaces oficiales.
- Alternativas.
- Coste estimado.
- Riesgo de cansancio.

---

## 16. Enlaces oficiales y documentación

Cada plan con entrada debe incluir:

- Web oficial.
- Ticket oficial.
- Política de cancelación si está disponible.
- Documentación necesaria.
- Edad mínima.
- Restricciones de bolsas/seguridad.
- Tiempo recomendado de llegada.

Ejemplos:

- Estatua de la Libertad: Statue City Cruises oficial.
- Museos: web oficial de cada museo.
- Miradores: web oficial del mirador.
- Broadway: web oficial del espectáculo o Broadway Direct/Telecharge/Ticketmaster según caso.
- Mundial: FIFA.com/tickets.
- Sail4th: sail4th.org.
- Macy’s fireworks: macys.com/fireworks o Macy’s Inc newsroom.

---

## 17. Arquitectura técnica recomendada

### 17.1 Frontend

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- Mapbox GL o Google Maps JavaScript API.
- Zustand o Redux Toolkit para estado del viaje.
- i18n con next-intl.

### 17.2 Backend

- Node.js con NestJS o Next.js API routes.
- Python FastAPI para motor de recomendaciones si se quiere IA más avanzada.
- PostgreSQL + PostGIS.
- Redis para caché.
- Supabase o Firebase para autenticación rápida.
- Queue con BullMQ/Celery para actualización de datos.

### 17.3 IA y agentes

- LLM para explicación personalizada.
- Embeddings para comparar preferencias con planes.
- RAG con fuentes oficiales y base de conocimiento curada.
- Moderación para reseñas de usuarios.

### 17.4 Base de datos

Tablas:

- users.
- travel_profiles.
- travelers.
- places.
- restaurants.
- events.
- tickets.
- weather_forecasts.
- transit_routes.
- itineraries.
- itinerary_items.
- reviews_signals.
- source_reliability.
- user_feedback.

---

## 18. Seguridad, privacidad y legal

### 18.1 Datos personales

Se manejan datos sensibles indirectos: edad, nacionalidad, localización y preferencias. La web debe cumplir:

- Consentimiento explícito.
- Política de privacidad clara.
- Eliminación de datos bajo solicitud.
- Minimización de datos.
- Cifrado en tránsito y reposo.
- No vender datos de localización.

### 18.2 Menores

- No crear perfiles individuales de menores innecesarios.
- Usar edad solo para filtrar planes.
- No mostrar anuncios personalizados a menores.

### 18.3 APIs

- Respetar términos de uso.
- No scrapear fuentes que lo prohíban.
- Cachear según términos permitidos.
- Mostrar atribución cuando sea obligatoria.

---

## 19. MVP propuesto

### Fase 1 — MVP funcional

- Onboarding.
- Perfil del viaje.
- Buscador de planes.
- Clima 7 días.
- Itinerario automático.
- Google Maps.
- Google Places.
- MTA links/mapas.
- Restaurantes básicos.
- Eventos Ticketmaster.
- Pestaña Mundial.
- Pestaña Elcano/4 julio.

### Fase 2 — Producto avanzado

- Motor propio de calidad.
- RAG con foros y señales sociales.
- Plan B automático por lluvia.
- Integración MTA realtime.
- OpenTripPlanner.
- Reservas y entradas.
- Cuentas de usuario.
- Feedback post-plan.

### Fase 3 — Producto líder mundial

- Agente conversacional completo.
- App móvil/PWA.
- Notificaciones en tiempo real.
- Optimización por multitudes.
- Predicción de colas.
- Recomendaciones hiperlocales.
- Generación automática de rutas fotográficas.
- Colaboración entre miembros del grupo.

---

## 20. Criterios de éxito

- El usuario puede crear un itinerario útil en menos de 5 minutos.
- Cada recomendación explica por qué encaja.
- Cada plan tiene transporte y enlace oficial.
- El clima modifica el itinerario automáticamente.
- La web evita planes incompatibles por edad.
- La sección Mundial funciona incluso sin entradas.
- La sección Sail4th/Elcano es clara, visual y actualizada.
- El usuario puede guardar, editar y compartir el viaje.
- La web prioriza calidad frente a cantidad.

---

## 21. Fuentes y documentación inicial recomendada

- Sail4th 250: https://sail4th.org/
- Tall Ships Sail4th: https://sail4th.org/tall-ships
- NYNJ World Cup 2026: https://nynjfwc26.com/
- NYNJ World Cup schedule: https://nynjfwc26.com/schedule/
- NYNJ World Cup fan events: https://nynjfwc26.com/fan-events/
- FIFA World Cup 2026: https://www.fifa.com/
- MTA Developer Resources: https://www.mta.info/developers
- MTA API: https://api.mta.info/
- MTA Maps: https://www.mta.info/maps
- National Weather Service API: https://www.weather.gov/documentation/services-web-api
- Open-Meteo: https://open-meteo.com/
- Google Places API: https://developers.google.com/maps/documentation/places/web-service
- Google Maps Geolocation: https://developers.google.com/maps/documentation/geolocation/overview
- Yelp Fusion API: https://docs.developer.yelp.com/
- Foursquare Places API: https://docs.foursquare.com/
- Ticketmaster Discovery API: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- NYC Open Data: https://opendata.cityofnewyork.us/
- NYC Parks events datasets: https://data.cityofnewyork.us/
- OpenTripPlanner: https://docs.opentripplanner.org/
