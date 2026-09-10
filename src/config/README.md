# Configuración rápida del rediseño

Este directorio concentra los cambios que deberían ser simples de mantener sin tocar componentes grandes.

## Agregar una competición nueva

Editar `src/config/competitions.ts` y agregar un objeto a `COMPETITIONS`:

```ts
{
  id: "supercopa",
  titulo: "Supercopa APA",
  subtitulo: "Nueva competición",
  href: "/competicion/supercopa",
  enabled: true,
}
```

Después crear la página correspondiente al `href`, por ejemplo:

`src/app/competicion/supercopa/page.tsx`

Si querés preparar una competición pero todavía no mostrarla, usar `enabled: false`.

## Cambiar datos de la portada de Competición

En `src/config/competitions.ts`, editar `COMPETITION_LANDING_CONFIG`.

Ahí están centralizados:

- temporada visible;
- título principal;
- imagen del hero;
- textos y enlaces del footer.

## Agregar una temporada de Liga

Editar `src/config/league.ts`:

```ts
seasons: ["Temporada 5", "Temporada 4"],
defaultSeason: "Temporada 5",
```

No hace falta tocar `/divisiones/page.tsx` ni los selectores.

## Agregar o cambiar divisiones

En `src/config/league.ts`, editar `divisions` y `defaultDivision`.

Si el nombre de la nueva división requiere una regla especial de clasificación, revisar también la lógica de `src/components/league/LeagueStandingsTable.tsx` y `src/lib/league/utils.ts`.

## Dónde está cada cosa de Liga

- `LeagueHero.tsx`: hero de Torneo de Liga.
- `LeagueTabs.tsx`: Resumen / Tabla / Partidos / Estadísticas / Equipos.
- `LeagueFilters.tsx`: selectores de temporada y división.
- `LeagueSidebar.tsx`: Próxima fecha y Últimos resultados.
- `LeagueFooter.tsx`: footer de Liga.
- `LeagueStandingsTable.tsx`: presentación visual de la tabla.
- `useLeagueMatches.ts`: carga partidos para el lateral.
- `useLeagueStandings.ts`: carga los datos necesarios para la clasificación.
- `calculateStandings.ts`: cálculo puro de PJ, G, E, P, DG, puntos y forma.
- `TablaDivision.tsx`: fachada compatible con el componente antiguo.

## Regla general

Los componentes visuales no deberían contener consultas a Supabase. Los hooks cargan datos y `lib/league` contiene la lógica de negocio. Las páginas sólo componen las piezas.
