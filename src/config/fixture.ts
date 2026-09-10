export type FixtureCompetitionId =
  | "liga"
  | "copa-argentina"
  | "copa-apa"
  | "copa-campeones"
  | "playoffs"
  | "copas-oficiales";

export type FixtureCompetitionDefinition = {
  id: FixtureCompetitionId;
  label: string;
  description: string;
  competitionKey: string;
  divisions?: readonly string[];
  defaultDivision?: string;
  groups?: readonly string[];
  defaultGroup?: string;
};

/**
 * CONFIGURACIÓN CENTRAL DEL FIXTURE
 * ---------------------------------
 * Este archivo controla lo que el usuario puede seleccionar en /fixture.
 * El diseño, la consulta a Supabase y el calendario leen estos datos solos.
 *
 * CAMBIOS HABITUALES
 *
 * 1) Agregar una temporada:
 *    seasons: ["Temporada 5", "Temporada 4"]
 *    defaultSeason: "Temporada 5"
 *
 * 2) Agregar una competencia al lateral:
 *    agregá un objeto dentro de `competitions` con el valor real que usa
 *    `partidos.competicion` en `competitionKey`.
 *
 * 3) Agregar una división a Liga:
 *    divisions: ["Primera", "Segunda", "Tercera"]
 *
 * 4) Agregar un grupo a Clasificación a Copas:
 *    groups: ["A", "B", "C", "D", "E"]
 *
 * 5) Cambiar imagen/título del encabezado:
 *    editá `hero`.
 *
 * IMPORTANTE
 * Los valores de `competitionKey`, división y grupo deben coincidir con lo
 * guardado en Supabase. Para cambiar solamente textos o diseño no hace falta
 * modificar esos identificadores.
 */
export const FIXTURE_CONFIG = {
  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  defaultCompetition: "liga" as FixtureCompetitionId,

  hero: {
    title: "Fixture",
    image: "/images/fixture/fixture.png",
    alt: "Fixture oficial APA",
  },

  competitions: [
    {
      id: "liga",
      label: "Torneo de Liga",
      description: "Primera y Segunda División",
      competitionKey: "liga",
      divisions: ["Primera", "Segunda"],
      defaultDivision: "Primera",
    },
    {
      id: "copa-argentina",
      label: "Copa Argentina",
      description: "Eliminación directa",
      competitionKey: "copa_argentina",
    },
    {
      id: "copa-apa",
      label: "Copa APA",
      description: "Eliminación directa",
      competitionKey: "copa_apa",
    },
    {
      id: "copa-campeones",
      label: "Copa de Campeones",
      description: "Semifinales y final",
      competitionKey: "copa_campeones",
    },
    {
      id: "playoffs",
      label: "Playoffs de Ascenso",
      description: "Ascenso y promoción",
      competitionKey: "playoffs",
    },
    {
      id: "copas-oficiales",
      label: "Clasificación a Copas",
      description: "Fase de grupos",
      competitionKey: "copa_clasificatoria",
      groups: ["A", "B", "C", "D"],
      defaultGroup: "A",
    },
  ] satisfies readonly FixtureCompetitionDefinition[],
} as const;

export function getFixtureCompetition(id: FixtureCompetitionId) {
  return (
    FIXTURE_CONFIG.competitions.find((competition) => competition.id === id) ||
    FIXTURE_CONFIG.competitions[0]
  );
}
