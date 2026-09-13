import type { PredictionCompetition } from "@/lib/predicciones/types";

/**
 * Configuración editable del módulo de Predicciones.
 *
 * Si en una temporada cambia una competencia, división, grupo o fase,
 * debería modificarse acá y no dentro de los componentes visuales.
 */
export const PREDICTIONS_CONFIG = {
  seasons: ["Temporada 4"],
  defaultSeason: "Temporada 4",
  defaultCompetition: "liga" as PredictionCompetition,
  defaultSubcategory: "primera",
  defaultDate: "Todas",
};

export const PREDICTION_COMPETITIONS: Array<{
  value: PredictionCompetition;
  label: string;
}> = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

export const PREDICTION_SUBCATEGORIES: Record<
  PredictionCompetition,
  Array<{ value: string; label: string }>
> = {
  liga: [
    { value: "primera", label: "Primera" },
    { value: "segunda", label: "Segunda" },
  ],
  copa_clasificatoria: [
    { value: "A", label: "Grupo A" },
    { value: "B", label: "Grupo B" },
    { value: "C", label: "Grupo C" },
    { value: "D", label: "Grupo D" },
  ],
  copa_argentina: [
    { value: "octavos", label: "Octavos" },
    { value: "cuartos", label: "Cuartos" },
    { value: "semifinal", label: "Semifinal" },
    { value: "final", label: "Final" },
  ],
  copa_apa: [
    { value: "octavos", label: "Octavos" },
    { value: "cuartos", label: "Cuartos" },
    { value: "semifinal", label: "Semifinal" },
    { value: "final", label: "Final" },
  ],
  copa_campeones: [
    { value: "semifinal", label: "Semifinal" },
    { value: "final", label: "Final" },
  ],
  playoffs: [
    { value: "semifinal", label: "Semifinal" },
    { value: "final_ascenso", label: "Final Ascenso" },
    { value: "promocion", label: "Promoción" },
  ],
};
