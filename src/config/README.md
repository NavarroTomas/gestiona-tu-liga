# Guía rápida de configuración de Competiciones

Este directorio concentra las cosas que deberían ser fáciles de cambiar sin meterse en componentes grandes ni mezclar diseño, Supabase y reglas deportivas.

## Mapa rápido: qué archivo tocar

| Quiero cambiar... | Archivo principal |
| --- | --- |
| Menú general de competiciones / portada | `src/config/competitions.ts` |
| Torneo de Liga | `src/config/league.ts` |
| Clasificación a Copas / grupos | `src/config/cups.ts` |
| Copa Argentina | `src/config/copaArgentina.ts` |
| Copa APA | `src/config/copaApa.ts` |
| Playoffs de Ascenso | `src/config/playoffs.ts` |
| Copa de Campeones | `src/config/copaCampeones.ts` |

La regla general es: **primero buscá el cambio en el config de la competición**. Si lo que querés modificar es una consulta, un cálculo o el diseño visual, abajo se indica dónde está cada responsabilidad.

---

## 1. Menú general de competiciones

Archivo: `src/config/competitions.ts`

### Agregar una competición nueva

Agregá un objeto a `COMPETITIONS`:

```ts
{
  id: "supercopa",
  titulo: "Supercopa APA",
  subtitulo: "Nueva competición",
  href: "/competicion/supercopa",
  enabled: true,
}
```

Después creá la página correspondiente, por ejemplo:

```text
src/app/competicion/supercopa/page.tsx
```

Si querés dejarla preparada pero todavía no mostrarla, usá:

```ts
enabled: false
```

### Cambiar la portada `/competicion`

Editá `COMPETITION_LANDING_CONFIG`. Ahí están la temporada visible, título, imagen del hero y footer de la portada.

---

## 2. Torneo de Liga

Archivo: `src/config/league.ts`

### Agregar una temporada

```ts
defaultSeason: "Temporada 5",
seasons: ["Temporada 5", "Temporada 4"],
```

Los nombres deben coincidir con los valores guardados en Supabase.

### Agregar o cambiar divisiones

```ts
defaultDivision: "Primera",
divisions: ["Primera", "Segunda", "Tercera"],
```

Si la nueva división necesita reglas deportivas diferentes, revisá `src/lib/league/` en lugar de meter esas reglas dentro del config.

### Dónde está cada responsabilidad de Liga

- `src/hooks/useLeagueMatches.ts`: carga partidos del lateral.
- `src/hooks/useLeagueStandings.ts`: carga datos necesarios para la tabla.
- `src/lib/league/calculateStandings.ts`: calcula PJ, G, E, P, GF, GC, DG, PTS y forma.
- `src/lib/league/utils.ts`: utilidades y reglas auxiliares.
- `src/components/league/LeagueStandingsTable.tsx`: diseño visual de la clasificación.
- `src/components/league/LeagueSidebar.tsx`: próxima fecha y últimos resultados.
- `src/app/divisiones/page.tsx`: solamente ensambla los módulos.

---

## 3. Clasificación a Copas

Archivo: `src/config/cups.ts`

### Agregar una temporada

```ts
defaultSeason: "Temporada 5",
seasons: ["Temporada 5", "Temporada 4"],
```

### Agregar grupos

```ts
groups: ["A", "B", "C", "D", "E"],
```

### Cambiar cuántos clasifican a Copa Argentina

```ts
qualification: {
  copaArgentinaPlaces: 3,
  // ...
}
```

Con `3`, los puestos 1°, 2° y 3° se consideran clasificados a Copa Argentina según la regla actual.

### Si cambia la lógica de la tabla

- datos: `src/hooks/useCupGroups.ts`
- cálculo: `src/lib/cups/calculateGroupStandings.ts`
- diseño: `src/components/cups/CupGroupStandings.tsx`

---

## 4. Copa Argentina

Archivo: `src/config/copaArgentina.ts`

El formato es **por temporada**. Temporada 4 actualmente usa:

```ts
"Temporada 4": {
  rounds: ["quarterfinals", "semifinals", "final"],
  showThirdPlace: false,
}
```

Si una temporada futura empieza en Octavos:

```ts
"Temporada 5": {
  rounds: ["roundOf16", "quarterfinals", "semifinals", "final"],
  showThirdPlace: false,
}
```

No agregues columnas manualmente al bracket para cambiar una temporada. El componente se genera según `rounds`.

---

## 5. Copa APA

Archivo: `src/config/copaApa.ts`

Funciona con el mismo sistema modular que Copa Argentina, pero usa sus propios datos y configuración. Temporada 4 está configurada como:

```text
Cuartos -> Semifinales -> Final
```

Para cambiar el formato de otra temporada, modificá `formatsBySeason` en este archivo. El bracket visual es compartido.

---

## 6. Playoffs de Ascenso

Archivo: `src/config/playoffs.ts`

Temporada 4 actualmente usa:

```text
Semifinales -> Final de Ascenso -> Promoción
```

El orden se controla con:

```ts
formatsBySeason: {
  "Temporada 4": {
    stages: ["semifinals", "promotionFinal", "promotion"],
  },
}
```

`stageDefinitions` controla el nombre visible, descripción, cantidad de partidos, palabras reconocidas desde Supabase y placeholders de cada etapa.

Si cambia la forma visual del camino, editá `src/components/playoffs/PlayoffsRoad.tsx`. Si cambia cómo se detectan las etapas, editá `src/lib/playoffs.ts`.

---

## 7. Copa de Campeones

Archivo: `src/config/copaCampeones.ts`

Temporada 4 actualmente usa:

```text
Semifinales -> Final
```

`placeholderMatchups` define los cruces que se muestran mientras todavía no existen partidos reales en Supabase. Cuando hay datos reales, esos partidos reemplazan los placeholders.

Los cruces base actuales son:

```text
Campeón Primera División vs Campeón Copa APA
Campeón Segunda División vs Campeón Copa Argentina
```

---

## Sistema compartido de copas knockout

Copa Argentina, Copa APA y Copa de Campeones reutilizan módulos comunes para evitar duplicar código:

- `src/components/cups/knockout/KnockoutBracket.tsx`: diseño del cuadro.
- `src/components/cups/knockout/KnockoutCupHero.tsx`: hero compartido y configurable.
- `src/components/cups/knockout/KnockoutCupTabs.tsx`: tabs y selector de temporada.
- `src/hooks/useKnockoutCup.ts`: lectura común de datos desde Supabase.
- `src/lib/cups/knockout.ts`: detección de rondas, resultados y ganador.

Esto significa que un cambio visual general del bracket puede beneficiar a las tres copas sin copiar código.

---

## Cómo saber dónde hacer un cambio

Usá esta regla:

```text
Quiero cambiar temporadas, textos, rutas, fases o formatos
→ src/config/

Quiero cambiar qué datos se leen de Supabase
→ src/hooks/

Quiero cambiar cálculos o reglas deportivas
→ src/lib/

Quiero cambiar tamaños, colores, espacios o distribución visual
→ src/components/

Quiero ver cómo se arma la pantalla completa
→ src/app/.../page.tsx
```

Los `page.tsx` de las competiciones nuevas están pensados para ser simples ensambladores. Evitá volver a meter consultas, cálculos y diseños grandes directamente dentro de esas páginas.

## Antes de tocar una clave de Supabase

Campos como `competitionKey`, `phaseKey`, `activationField`, nombres de temporada y nombres de fase deben coincidir con los valores reales de la base de datos. Cambiar un texto visual es seguro; cambiar una de esas claves puede hacer que la página deje de encontrar partidos aunque el diseño siga funcionando.

## Objetivo de esta arquitectura

Que dentro de una temporada o dentro de varios meses puedas abrir el config de una competición, leer los comentarios y saber rápidamente qué cambiar, sin tener que reconstruir cómo funciona toda la página.
