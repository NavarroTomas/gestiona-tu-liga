"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { LeagueMatch } from "@/lib/league/types";
import { normalizarDivision, normalizarNombreEquipo } from "@/lib/league/utils";

export function useLeagueMatches(temporada: string, division: string) {
  const [ultimosResultados, setUltimosResultados] = useState<LeagueMatch[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<LeagueMatch[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const { data, error } = await supabase
        .from("partidos")
        .select(
          "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora",
        )
        .eq("temporada", temporada)
        .order("id", { ascending: true });

      if (!activo) return;

      if (error) {
        console.log(error);
        setUltimosResultados([]);
        setProximosPartidos([]);
        setLogos({});
        return;
      }

      const divisionKey = normalizarDivision(division);
      const partidosDivision = ((data || []) as LeagueMatch[]).filter(
        (partido) => normalizarDivision(partido.division || "") === divisionKey,
      );

      const jugados = partidosDivision
        .filter((partido) => String(partido.resultado || "").trim() !== "")
        .slice(-5)
        .reverse();

      const pendientes = partidosDivision
        .filter((partido) => String(partido.resultado || "").trim() === "")
        .slice(0, 5);

      setUltimosResultados(jugados);
      setProximosPartidos(pendientes);

      const nombresEquipos = Array.from(
        new Set<string>(
          [...jugados, ...pendientes]
            .flatMap((partido) => [partido.local, partido.visitante])
            .filter((nombre): nombre is string => Boolean(nombre)),
        ),
      );

      if (nombresEquipos.length === 0) {
        setLogos({});
        return;
      }

      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresEquipos);

      if (!activo) return;
      if (clubesError) console.log(clubesError);

      const mapa: Record<string, string> = {};
      (clubesData || []).forEach((club: any) => {
        if (club?.nombre && club?.logo_url) {
          mapa[normalizarNombreEquipo(club.nombre)] = club.logo_url;
        }
      });
      setLogos(mapa);
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [temporada, division]);

  const obtenerLogo = useCallback(
    (nombre?: string | null) => {
      if (!nombre) return null;
      return logos[normalizarNombreEquipo(nombre)] || null;
    },
    [logos],
  );

  return {
    ultimosResultados,
    proximosPartidos,
    obtenerLogo,
  };
}
