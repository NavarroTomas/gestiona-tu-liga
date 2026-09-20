"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type PublicSeason = {
  nombre: string;
  numero?: number | null;
  activa?: boolean | null;
  estado?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

function seasonNumber(value: string) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : -1;
}

function sortSeasons(rows: PublicSeason[]) {
  return [...rows].sort((a, b) => {
    const na = a.numero ?? seasonNumber(a.nombre);
    const nb = b.numero ?? seasonNumber(b.nombre);
    if (na !== nb) return nb - na;
    return b.nombre.localeCompare(a.nombre, "es");
  });
}

export function usePublicSeasons(fallback = "Temporada 4") {
  const [records, setRecords] = useState<PublicSeason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("temporadas")
        .select("nombre,numero,activa,estado,fecha_inicio,fecha_fin")
        .order("numero", { ascending: false, nullsFirst: false });

      if (cancelled) return;

      if (error) {
        console.error("No se pudieron cargar las temporadas:", error);
        setRecords([]);
      } else {
        setRecords(sortSeasons((data || []) as PublicSeason[]));
      }
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const visibleRecords = useMemo(
    () => records.filter((row) => row.activa || !["borrador", "archivada"].includes(String(row.estado || "").toLowerCase())),
    [records],
  );

  const activeRecord = useMemo(
    () =>
      records.find((row) => row.activa) ||
      visibleRecords[0] ||
      records[0] ||
      null,
    [records, visibleRecords],
  );

  const seasons = useMemo(
    () =>
      visibleRecords.length
        ? visibleRecords.map((row) => row.nombre)
        : activeRecord?.nombre
          ? [activeRecord.nombre]
          : [fallback],
    [visibleRecords, activeRecord, fallback],
  );

  function getSeasonYear(name?: string | null) {
    const row = records.find((item) => item.nombre === name);
    const year = row?.fecha_inicio ? Number(row.fecha_inicio.slice(0, 4)) : NaN;
    return Number.isFinite(year) ? year : new Date().getFullYear();
  }

  return {
    records,
    seasons,
    activeSeason: activeRecord?.nombre || fallback,
    activeRecord,
    loading,
    getSeasonYear,
  };
}
