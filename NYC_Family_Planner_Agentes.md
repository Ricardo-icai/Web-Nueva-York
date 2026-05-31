# NYC Family Planner — Documento de agentes expertos para crear la mejor guía turística de Nueva York

## 1. Visión general del sistema de agentes

Para que NYC Family Planner sea una web turística de máximo nivel, no debe depender de un único modelo genérico. Debe funcionar como un equipo de agentes especializados, cada uno experto mundial en su área, coordinados por un agente orquestador.

Cada agente tendrá:

- Responsabilidad clara.
- Fuentes autorizadas.
- Inputs y outputs definidos.
- Métricas de calidad.
- Reglas de seguridad.
- Capacidad de explicar sus decisiones.

El sistema debe combinar IA, APIs, datos oficiales, señales sociales, mapas, clima, transporte, eventos, preferencias familiares y disponibilidad real.

---

## 2. Arquitectura multiagente

```text
Usuario
  ↓
Agente Orquestador Principal
  ├── Agente de Perfil Familiar
  ├── Agente de Preferencias
  ├── Agente de Clima
  ├── Agente de Planes y POIs
  ├── Agente Gastronómico
  ├── Agente Cultural
  ├── Agente Fotográfico
  ├── Agente de Transporte
  ├── Agente de Eventos Especiales
  ├── Agente Sail4th / Juan Sebastián de Elcano
  ├── Agente Mundial 2026
  ├── Agente de Calidad y Reputación
  ├── Agente de Tickets y Documentación
  ├── Agente de Seguridad y Multitudes
  ├── Agente de Accesibilidad
  ├── Agente de Presupuesto
  ├── Agente de Itinerarios
  ├── Agente de UX/UI
  ├── Agente Legal y Privacidad
  └── Agente de Actualización de Datos
```

---

## 3. Agente Orquestador Principal

### Rol

Director general del sistema. Decide qué agentes intervienen, fusiona resultados y construye la respuesta final para el usuario.

### Perfil experto

Debe comportarse como:

- Product Manager senior de travel tech.
- Arquitecto de sistemas IA.
- Experto en turismo familiar.
- Coordinador de datos en tiempo real.

### Responsabilidades

- Recibir el perfil del viaje.
- Dividir la petición en tareas.
- Llamar a los agentes adecuados.
- Resolver conflictos entre recomendaciones.
- Priorizar calidad sobre cantidad.
- Crear una explicación clara para el usuario.
- Mantener coherencia del itinerario.

### Output

```json
{
  "recommended_itinerary": [],
  "top_plans": [],
  "warnings": [],
  "alternatives": [],
  "explanation": ""
}
```

### Métricas

- Coherencia del itinerario.
- Tiempo de respuesta.
- Calidad media de planes.
- Satisfacción del usuario.

---

## 4. Agente de Perfil Familiar

### Rol

Entender quién viaja y qué restricciones reales tiene el grupo.

### Responsabilidades

- Interpretar número de viajeros.
- Analizar edades.
- Detectar menores, adolescentes, mayores y movilidad reducida.
- Identificar nacionalidad e idioma.
- Detectar restricciones alimentarias.
- Crear reglas de compatibilidad.

### Ejemplos de reglas

- Si hay menores de 21 años, advertir en planes con alcohol.
- Si hay niños menores de 5 años, priorizar descansos y baños.
- Si hay mayores de 70 años, evitar caminatas largas.
- Si el grupo es español, destacar Elcano y eventos culturales españoles.

### Output

```json
{
  "age_constraints": [],
  "mobility_constraints": [],
  "language": "es",
  "family_type": "family_with_children",
  "risk_flags": []
}
```

---

## 5. Agente de Preferencias

### Rol

Convertir gustos del usuario en pesos cuantificables.

### Responsabilidades

- Leer preferencias declaradas.
- Inferir preferencias ocultas.
- Ajustar pesos por grupo.
- Aprender del feedback.

### Output

```json
{
  "weights": {
    "culture": 0.25,
    "food": 0.15,
    "views": 0.20,
    "photo": 0.20,
    "kids": 0.10,
    "events": 0.10
  }
}
```

---

## 6. Agente de Clima

### Rol

Experto meteorológico aplicado al turismo.

### Fuentes

- National Weather Service API.
- Open-Meteo.
- OpenWeather como backup.

### Responsabilidades

- Obtener previsión de 7 días.
- Detectar lluvia, niebla, calor, frío, viento y alertas.
- Puntuar planes interiores y exteriores.
- Reordenar itinerarios.
- Crear plan B por lluvia.

### Output

```json
{
  "daily_weather": [],
  "best_outdoor_days": [],
  "best_indoor_days": [],
  "weather_warnings": [],
  "itinerary_adjustments": []
}
```

### Métricas

- Porcentaje de planes correctamente adaptados al clima.
- Reducción de planes cancelados.

---

## 7. Agente de Planes y POIs

### Rol

Experto mundial en puntos de interés de Nueva York.

### Fuentes

- Google Places.
- Foursquare.
- OpenStreetMap.
- Wikidata.
- NYC Tourism.
- NYC Open Data.

### Responsabilidades

- Buscar planes por categoría.
- Verificar ubicación y horarios.
- Eliminar duplicados.
- Clasificar planes por valor turístico real.
- Identificar planes cercanos entre sí.

### Output

```json
{
  "places": [
    {
      "id": "",
      "name": "",
      "category": [],
      "quality_score": 0,
      "official_url": "",
      "location": {}
    }
  ]
}
```

---

## 8. Agente Gastronómico

### Rol

Seleccionar restaurantes de calidad, no trampas turísticas.

### Perfil experto

Debe comportarse como crítico gastronómico local de Nueva York y especialista en familias.

### Fuentes

- Yelp Fusion.
- Google Places.
- Foursquare.
- Resy.
- OpenTable.
- Webs oficiales de restaurantes.
- Eater NY y The Infatuation como fuentes editoriales permitidas manualmente.

### Responsabilidades

- Recomendar restaurantes cercanos al itinerario.
- Filtrar por presupuesto.
- Filtrar por alergias.
- Identificar restaurantes aptos para niños.
- Evitar sitios con mala relación calidad/precio.
- Comprobar horarios.
- Sugerir reserva si es necesaria.

### Reglas

- No recomendar un restaurante solo por estar cerca.
- Penalizar restaurantes con baja puntuación reciente.
- Priorizar restaurantes con muchas reseñas fiables.
- Separar “comida rápida buena” de “turistada”.

---

## 9. Agente Cultural

### Rol

Crear experiencias culturales adaptadas al grupo.

### Responsabilidades

- Recomendar museos y espacios culturales.
- Ajustar duración por edad.
- Explicar qué ver dentro de cada museo.
- Detectar exposiciones temporales.
- Añadir contexto histórico sencillo.

### Fuentes

- Web oficial de museos.
- Ticketmaster.
- NYC Tourism.
- Wikidata/Wikipedia.
- Calendarios oficiales.

### Output

```json
{
  "cultural_recommendations": [],
  "museum_short_routes": [],
  "ticket_links": []
}
```

---

## 10. Agente Fotográfico

### Rol

Diseñar rutas y planes con alto valor visual.

### Responsabilidades

- Identificar mejores spots.
- Recomendar hora del día.
- Considerar luz, clima y orientación.
- Evitar masificación.
- Sugerir alternativas si llueve.

### Ejemplos

- DUMBO temprano por la mañana.
- Top of the Rock al atardecer si está despejado.
- Grand Central si llueve.
- Brooklyn Heights Promenade para skyline.

### Output

```json
{
  "photo_spots": [],
  "best_time": "",
  "weather_dependency": "",
  "crowd_risk": 0
}
```

---

## 11. Agente de Transporte

### Rol

Experto en movilidad de Nueva York.

### Fuentes

- MTA GTFS.
- MTA GTFS-Realtime.
- MTA Bus Time.
- MTA Maps.
- Google Routes.
- OpenTripPlanner.
- NYC Ferry.
- PATH/NJ Transit cuando haya planes en Nueva Jersey.

### Responsabilidades

- Calcular rutas.
- Incluir metro, bus, ferry, tren, caminata y taxi.
- Detectar incidencias.
- Priorizar rutas simples para turistas.
- Incluir mapas oficiales.
- Indicar estaciones accesibles.
- Crear rutas a NYNJ Stadium.

### Output

```json
{
  "route": {
    "from": "hotel",
    "to": "plan",
    "steps": [],
    "duration_minutes": 32,
    "walking_minutes": 8,
    "accessibility_score": 76
  }
}
```

---

## 12. Agente de Eventos Especiales

### Rol

Detectar eventos importantes durante las fechas del viaje.

### Fuentes

- Ticketmaster Discovery API.
- Eventbrite si está permitido.
- NYC Parks Events.
- NYC Open Data.
- Calendarios oficiales.
- Webs de venues.

### Responsabilidades

- Buscar eventos por fecha.
- Clasificar por tipo.
- Confirmar disponibilidad.
- Verificar fuente oficial.
- Insertar eventos relevantes en itinerarios.

---

## 13. Agente Sail4th / Juan Sebastián de Elcano

### Rol

Especialista en el evento naval de verano 2026 y la presencia española.

### Fuentes prioritarias

- Sail4th.org.
- Sail4th Tall Ships.
- Armada Española.
- Ministerio de Asuntos Exteriores de España.
- Consulado/Embajada de España en EE. UU.
- Queen Sofía Spanish Institute.
- Macy’s para coordinación con 4 de julio.

### Responsabilidades

- Mantener ficha actualizada del Juan Sebastián de Elcano.
- Detectar horarios de llegada, muelle y visitas.
- Crear rutas para ver el barco.
- Generar planes culturales españoles relacionados.
- Validar si hay visitas públicas.
- Coordinar con fuegos artificiales y Sail4th.
- Evitar información no confirmada.

### Output

```json
{
  "elcano_events": [],
  "official_links": [],
  "viewpoints": [],
  "family_warnings": [],
  "spanish_context": ""
}
```

### Regla crítica

Si la información de horarios, muelles o visitas no está confirmada por fuente oficial, el agente debe marcarla como “pendiente de confirmación”.

---

## 14. Agente Mundial 2026

### Rol

Especialista en Mundial 2026 en Nueva York/Nueva Jersey.

### Fuentes prioritarias

- FIFA.com.
- NYNJFWC26.com.
- FIFA tickets.
- Webs oficiales de fan zones.
- MTA/NJ Transit/PATH para transporte.

### Responsabilidades

- Mantener calendario de partidos.
- Recomendar fan zones.
- Crear planes prepartido y postpartido.
- Filtrar por nacionalidad del grupo.
- Recomendar cómo llegar a NYNJ Stadium.
- Enlazar a tickets oficiales.
- Alertar sobre reventa.

### Output

```json
{
  "matches": [],
  "fan_zones": [],
  "transport_to_stadium": [],
  "official_ticket_links": [],
  "warnings": []
}
```

---

## 15. Agente de Calidad y Reputación

### Rol

Evitar malas recomendaciones.

### Fuentes

- Reviews agregadas.
- Foros.
- Google Places.
- Yelp.
- Foursquare.
- Feedback interno.

### Responsabilidades

- Calcular score de calidad.
- Detectar lugares sobrevalorados.
- Detectar trampas turísticas.
- Analizar reseñas recientes.
- Comparar fuentes.
- Dar explicación breve.

### Output

```json
{
  "quality_score": 87,
  "confidence": 0.91,
  "reasons": ["Alta satisfacción familiar", "Buena ubicación", "Precio razonable"],
  "risks": ["Alta masificación en fin de semana"]
}
```

---

## 16. Agente de Tickets y Documentación

### Rol

Garantizar que el usuario sabe cuándo necesita entrada, reserva o documentación.

### Responsabilidades

- Detectar planes con ticket.
- Buscar enlace oficial.
- Detectar edad mínima.
- Detectar documentación necesaria.
- Avisar de controles de seguridad.
- Recomendar comprar con antelación.

### Fuentes

- Web oficial del plan.
- Ticketmaster.
- FIFA tickets.
- Statue City Cruises.
- Broadway Direct.
- Telecharge.
- Webs oficiales de museos y miradores.

### Regla crítica

Siempre priorizar enlace oficial frente a intermediarios.

---

## 17. Agente de Seguridad y Multitudes

### Rol

Reducir riesgos en eventos masivos y rutas familiares.

### Responsabilidades

- Detectar eventos con alta masificación.
- Recomendar horas de llegada.
- Evitar zonas saturadas con niños pequeños.
- Alertar de cortes de calles.
- Crear planes alternativos.
- Priorizar seguridad sobre optimización turística.

### Fuentes

- NYC Emergency Management.
- NYPD announcements si están disponibles.
- MTA alerts.
- Macy’s official info.
- Sail4th official info.
- FIFA/NYNJ official info.

---

## 18. Agente de Accesibilidad

### Rol

Asegurar que los planes sean viables para personas con movilidad reducida, carritos o cansancio.

### Responsabilidades

- Identificar estaciones accesibles.
- Filtrar planes con muchas escaleras.
- Recomendar descansos.
- Evaluar baños y ascensores.
- Ajustar rutas.

### Fuentes

- MTA accessibility.
- Google Places accessibility data.
- OpenStreetMap tags.
- Webs oficiales.

---

## 19. Agente de Presupuesto

### Rol

Mantener el viaje dentro del presupuesto del usuario.

### Responsabilidades

- Estimar coste diario.
- Separar gratis, medio y premium.
- Proponer alternativas gratuitas.
- Avisar de costes ocultos.
- Optimizar entradas por día.

### Output

```json
{
  "estimated_daily_cost": 240,
  "free_alternatives": [],
  "premium_options": [],
  "budget_warning": ""
}
```

---

## 20. Agente de Itinerarios

### Rol

Construir rutas diarias completas.

### Responsabilidades

- Ordenar planes por zona y hora.
- Reducir desplazamientos.
- Insertar comidas.
- Insertar descansos.
- Ajustar por clima.
- Crear plan alternativo.
- Evitar días imposibles.

### Reglas

- Máximo 3-4 grandes planes al día para familias.
- No cruzar la ciudad innecesariamente.
- Reservar energía para eventos nocturnos.
- Evitar miradores caros si el clima no acompaña.
- En 4 de julio, priorizar logística y seguridad.

---

## 21. Agente UX/UI

### Rol

Diseñar una experiencia clara, bonita y fácil de usar.

### Perfil experto

Diseñador senior de producto, experto en travel apps, mapas, accesibilidad y diseño familiar.

### Responsabilidades

- Crear interfaz simple.
- Diseñar onboarding amable.
- Crear mapas legibles.
- Diseñar tarjetas de planes.
- Diseñar alertas útiles.
- Mantener estética Elcano/Sail4th.
- Garantizar accesibilidad WCAG.

### Componentes UI

- Travel wizard.
- Weather strip de 7 días.
- Itinerary timeline.
- Map panel.
- Plan cards.
- Transport cards.
- Ticket call-to-action.
- Family warnings.
- Special event tabs.

---

## 22. Agente Legal y Privacidad

### Rol

Asegurar cumplimiento legal.

### Responsabilidades

- Revisar uso de datos personales.
- Revisar APIs y licencias.
- Revisar atribución.
- Revisar tratamiento de menores.
- Revisar consentimiento de geolocalización.
- Revisar cookies.
- Revisar GDPR/CCPA si aplica.

### Reglas

- No guardar ubicación exacta sin consentimiento.
- No perfilar menores para publicidad.
- No scrapear fuentes prohibidas.
- No usar contenido de foros de forma literal sin permiso.

---

## 23. Agente de Actualización de Datos

### Rol

Mantener la web viva y actualizada.

### Responsabilidades

- Actualizar eventos diariamente.
- Actualizar clima cada pocas horas.
- Actualizar incidencias de transporte en tiempo real.
- Actualizar precios y disponibilidad cuando sea posible.
- Detectar enlaces rotos.
- Detectar planes cerrados.

### Frecuencias recomendadas

- Clima: cada 1-3 horas.
- MTA realtime: cada 30-60 segundos según pantalla activa.
- Eventos: cada 6-12 horas.
- Restaurantes/POIs: cada 24-72 horas.
- Links oficiales: diario en fechas críticas.
- Mundial/Sail4th/4 julio: cada 1-3 horas durante los días clave.

---

## 24. Flujo de trabajo entre agentes

### Ejemplo: familia española del 2 al 8 de julio de 2026

1. Agente de Perfil detecta familia española con niños.
2. Agente de Eventos detecta Sail4th, 4 de julio y Mundial.
3. Agente Elcano prioriza planes marítimos y españoles.
4. Agente Mundial revisa partidos y fan zones.
5. Agente de Clima decide días exteriores/interiores.
6. Agente de Transporte calcula rutas.
7. Agente Gastronómico inserta restaurantes familiares.
8. Agente de Seguridad ajusta 4 de julio por multitudes.
9. Agente de Itinerarios crea plan diario.
10. Orquestador entrega itinerario explicado.

---

## 25. Sistema de confianza entre agentes

Cada agente debe devolver:

- Resultado.
- Confianza.
- Fuente.
- Fecha de actualización.
- Riesgos.

Ejemplo:

```json
{
  "answer": "Recomendar Battery Park para ver ambiente marítimo",
  "confidence": 0.78,
  "sources": ["Sail4th", "MTA", "Google Places"],
  "updated_at": "2026-05-31T10:00:00Z",
  "risks": ["Punto exacto de acceso pendiente de confirmación oficial"]
}
```

---

## 26. Agentes mínimos para MVP

Para la primera versión se necesitan como mínimo:

1. Agente Orquestador.
2. Agente de Perfil Familiar.
3. Agente de Clima.
4. Agente de Planes y POIs.
5. Agente Gastronómico.
6. Agente de Transporte.
7. Agente de Itinerarios.
8. Agente de Eventos Especiales.
9. Agente Mundial 2026.
10. Agente Sail4th/Elcano.
11. Agente de Calidad.
12. Agente Legal/Privacidad.

---

## 27. Stack recomendado para agentes

### Backend IA

- Python FastAPI.
- LangGraph o Semantic Kernel para orquestación.
- PostgreSQL + pgvector para embeddings.
- Redis para caché.
- Celery/RQ para tareas periódicas.

### Datos

- PostGIS para geolocalización.
- S3/R2 para imágenes cacheadas autorizadas.
- Vector DB para documentos oficiales y guías curadas.

### Observabilidad

- Logs por agente.
- Trazabilidad de fuentes.
- Métricas de recomendación.
- Evaluación humana de itinerarios.

---

## 28. Evaluación de calidad de los agentes

Cada agente se debe testear con casos reales:

### Casos de prueba

- Familia con niños pequeños y lluvia.
- Grupo de adolescentes con bajo presupuesto.
- Pareja mayor con movilidad reducida.
- Familia española en 4 de julio.
- Viajeros que van a la final del Mundial.
- Usuario que no quiere multitudes.
- Usuario que quiere fotos y miradores.

### Métricas globales

- Utilidad del itinerario.
- Reducción de desplazamientos.
- Calidad percibida.
- Precisión de horarios.
- Precisión de transporte.
- Adecuación al clima.
- Seguridad en eventos masivos.
- Porcentaje de enlaces oficiales correctos.

---

## 29. Principio fundamental

La web no debe comportarse como una lista de atracciones. Debe comportarse como un **concierge experto, local, familiar, actualizado y responsable**, capaz de explicar cada decisión.

El estándar de calidad debe ser:

> “No recomiendo lo más famoso; recomiendo lo que mejor encaja contigo, hoy, con tu familia, tu clima, tu ubicación, tu presupuesto y tus fechas.”
