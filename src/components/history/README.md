# Historia — guía de mantenimiento

La sección `/historia` está separada por responsabilidad para que una temporada nueva no requiera reescribir la pantalla.

## Flujo de datos

```text
Supabase
  ↓
src/hooks/useHistory.ts
  ↓
src/lib/history.ts
  ↓
src/components/history/*
  ↓
src/app/historia/page.tsx
```

## Qué archivo tocar

- `src/config/history.ts`: textos generales, temporada inicial y premios visibles.
- `src/hooks/useHistory.ts`: consultas a Supabase, detección automática de temporadas y armado del view-model.
- `src/lib/history.ts`: clasificación, campeones, estadísticas, ganadores y récords.
- `src/components/history/`: presentación visual de cada bloque.
- `src/app/historia/page.tsx`: únicamente ensambla la pantalla.

## Temporadas nuevas

Historia obtiene automáticamente las temporadas existentes desde `partidos`. Si aparece `Temporada 5`, el selector la incorpora y la temporada más nueva pasa a ser la seleccionada inicialmente.

Para que una temporada esté completa, los valores de `temporada`, `division`, `competicion`, resultados, rankings y premios deben coincidir entre las tablas/vistas de Supabase.

## Componentes

- `HistoryHero.tsx`: hero y selector de temporada.
- `HistorySummary.tsx`: métricas generales y campeones de Primera/Segunda.
- `HistoryStandings.tsx`: clasificación final.
- `HistoryHighlights.tsx`: goleador, asistencias, MVP, ataque y defensa.
- `HistoryCompetitions.tsx`: campeones/subcampeones de las competiciones.
- `HistoryAwards.tsx`: MVP, Goleador y Arquero del Año.
- `HistoryRecords.tsx`: récords de la temporada e históricos.
- `HistoryTeamIdentity.tsx`: escudo/nombre clickeable reutilizable.
- `HistorySectionTitle.tsx`: título visual compartido.
- `HistoryFooter.tsx`: pie de la sección.

No agregar consultas directas a Supabase dentro de los componentes ni de `page.tsx`.
