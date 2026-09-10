"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calcularTablaLiga } from "@/lib/league/calculateStandings";
import type {
  LeagueClubSeason,
  LeagueMatch,
  LeagueSanction,
  LeagueStandingsResult,
} from "@/lib/league/types";

const EMPTY_RESULT: LeagueStandingsResult = {
  tabla: [],
  logos: {},
  proximosRivales: {},
};

export function useLeagueStandings(temporada: string, division: string) {
  const [resultado, setResultado] = useState<LeagueStandingsResult>(EMPTY_RESULT);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const [partidosRes, equiposRes, sancionesRes] = await Promise.all([
        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora",
          )
          .eq("temporada", temporada)
          .order("id", { ascending: true }),
        supabase
          .from("v_clubes_temporada_public")
          .select("*")
          .eq("temporada", temporada)
          .eq("activo", true)
          .order("nombre", { ascending: true }),
        supabase
          .from("sanciones_equipos")
          .select("equipo, puntos_descontados, competicion")
          .eq("temporada", temporada)
          .eq("competicion", "liga"),
      ]);

      if (!activo) return;

      if (partidosRes.error) {
        console.log(partidosRes.error);
        setResultado(EMPTY_RESULT);
        return;
      }

      if (equiposRes.error) console.log(equiposRes.error);
      if (sancionesRes.error) console.log(sancionesRes.error);

      setResultado(
        calcularTablaLiga({
          partidos: (partidosRes.data || []) as LeagueMatch[],
          clubes: (equiposRes.data || []) as LeagueClubSeason[],
          sanciones: (sancionesRes.data || []) as LeagueSanction[],
          division,
        }),
      );
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [temporada, division]);

  return resultado;
}
