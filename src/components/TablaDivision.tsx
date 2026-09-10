"use client";

import LeagueStandingsTable from "@/components/league/LeagueStandingsTable";
import { useLeagueStandings } from "@/hooks/useLeagueStandings";

/**
 * Fachada compatible con el nombre histórico del componente.
 * La carga/cálculo vive en el hook y la vista en LeagueStandingsTable.
 */
export default function TablaDivision({
  temporada,
  division,
}: {
  temporada: string;
  division: string;
}) {
  const { tabla, logos, proximosRivales } = useLeagueStandings(temporada, division);

  return (
    <LeagueStandingsTable
      tabla={tabla}
      logos={logos}
      proximosRivales={proximosRivales}
      division={division}
    />
  );
}
