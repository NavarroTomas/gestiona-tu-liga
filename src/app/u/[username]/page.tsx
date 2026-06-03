"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PerfilPublico = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  steam_id: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: string | null;
  visible_role: string | null;
};

type StatJugador = {
  nombre: string | null;
  playerId?: string | null;
  playerid?: string | null;
  equipo: string | null;
  temporada: string | null;
  division: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  overallRating?: number | null;
  score?: number | null;
  gKSaves?: number | null;
  gKCatches?: number | null;
};

export default function PerfilPublicoPage() {
  const params = useParams();
  const usernameParam = String(params?.username || "").toLowerCase();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [stats, setStats] = useState<StatJugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPerfilPublico();
  }, [usernameParam]);

  async function cargarPerfilPublico() {
    setLoading(true);
    setMensaje("");

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select("id,email,display_name,username,playerid,steam_id,bio,avatar_url,status,visible_role")
      .eq("username", usernameParam)
      .maybeSingle();

    if (perfilError) {
      console.log(perfilError);
      setMensaje("No pude cargar este perfil.");
      setLoading(false);
      return;
    }

    if (!perfilData) {
      setMensaje("No existe este usuario.");
      setLoading(false);
      return;
    }

    setPerfil(perfilData as PerfilPublico);

    if (perfilData.playerid) {
      const { data: statsData, error: statsError } = await supabase
        .from("estadisticas_jugadores")
        .select("*")
        .eq("playerId", perfilData.playerid);

      if (statsError) {
        console.log(statsError);
      } else {
        setStats((statsData || []) as StatJugador[]);
      }
    }

    setLoading(false);
  }

  const resumen = useMemo(() => {
    const partidos = stats.length;
    const goles = stats.reduce((acc, s) => acc + Number(s.goals || 0), 0);
    const asistencias = stats.reduce((acc, s) => acc + Number(s.assists || 0), 0);
    const mvps = stats.reduce((acc, s) => acc + Number(s.mvp || 0), 0);
    const atajadas = stats.reduce((acc, s) => acc + Number(s.gKSaves || 0), 0);
    const atrapadas = stats.reduce((acc, s) => acc + Number(s.gKCatches || 0), 0);

    const ratings = stats
      .map((s) => Number(s.overallRating || 0))
      .filter((n) => n > 0);

    const ratingPromedio =
      ratings.length > 0
        ? ratings.reduce((acc, n) => acc + n, 0) / ratings.length
        : 0;

    const ultimo = [...stats]
      .filter((s) => s.temporada || s.equipo)
      .slice()
      .reverse()[0];

    return {
      partidos,
      goles,
      asistencias,
      mvps,
      atajadas,
      atrapadas,
      ratingPromedio,
      equipoActual: ultimo?.equipo || "Sin equipo registrado",
      temporadaActual: ultimo?.temporada || "-",
      divisionActual: ultimo?.division || "-",
    };
  }, [stats]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Cargando perfil...
        </p>
      </main>
    );
  }

  if (mensaje || !perfil) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 text-white">
        <section className="max-w-xl rounded-[34px] border border-red-400/20 bg-red-400/10 p-8 text-center">
          <h1 className="text-3xl font-black uppercase text-red-300">
            Perfil no encontrado
          </h1>

          <p className="mt-4 text-zinc-300">{mensaje || "No existe este usuario."}</p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-3 text-sm font-black uppercase text-black"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.18)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:items-center">
            <div className="flex justify-center md:justify-start">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-6xl font-black text-sky-300 shadow-[0_0_35px_rgba(56,189,248,.18)]">
                {(perfil.display_name || perfil.username || "A").slice(0, 1).toUpperCase()}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Perfil APA
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                {perfil.display_name || perfil.username}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase text-sky-300">
                  @{perfil.username}
                </span>

                <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase text-yellow-300">
                  {perfil.visible_role || "usuario"}
                </span>

                <span className="rounded-full border border-green-400/25 bg-green-400/10 px-4 py-2 text-xs font-black uppercase text-green-300">
                  {perfil.status || "pending"}
                </span>
              </div>

              {perfil.bio && (
                <p className="mt-6 max-w-3xl whitespace-pre-line text-zinc-300">
                  {perfil.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-[30px] border border-white/10 bg-[#020714] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              PSO ID
            </p>
            <p className="mt-3 break-all text-2xl font-black text-sky-300">
              {perfil.playerid || "-"}
            </p>
          </article>

          <article className="rounded-[30px] border border-white/10 bg-[#020714] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              Steam ID
            </p>
            <p className="mt-3 break-all text-2xl font-black text-yellow-300">
              {perfil.steam_id || "-"}
            </p>
          </article>

          <article className="rounded-[30px] border border-white/10 bg-[#020714] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              Club actual
            </p>
            <p className="mt-3 text-2xl font-black text-white">
              {resumen.equipoActual}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              {resumen.temporadaActual} · {resumen.divisionActual}
            </p>
          </article>
        </section>

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Estadísticas APA
            </p>

            <h2 className="mt-2 text-4xl font-black uppercase">
              Carrera
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {[
              ["PJ", resumen.partidos],
              ["Goles", resumen.goles],
              ["Asist.", resumen.asistencias],
              ["MVP", resumen.mvps],
              ["Ataj.", resumen.atajadas],
              ["Rating", resumen.ratingPromedio ? resumen.ratingPromedio.toFixed(2) : "-"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/10 bg-black/35 p-5 text-center"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  {label}
                </p>

                <p className="mt-3 text-3xl font-black text-sky-300">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
            Últimos partidos
          </p>

          <div className="mt-5 space-y-3">
            {stats.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                Todavía no hay estadísticas vinculadas a este PSO ID.
              </p>
            ) : (
              stats
                .slice()
                .reverse()
                .slice(0, 8)
                .map((s, index) => (
                  <article
                    key={`${s.temporada}-${s.division}-${s.equipo}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/35 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xl font-black uppercase">
                          {s.equipo || "Sin equipo"}
                        </p>

                        <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          {s.temporada || "-"} · {s.division || "-"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
                        <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sky-300">
                          G {Number(s.goals || 0)}
                        </span>
                        <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                          A {Number(s.assists || 0)}
                        </span>
                        <span className="rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-purple-300">
                          MVP {Number(s.mvp || 0)}
                        </span>
                        <span className="rounded-xl border border-green-400/20 bg-green-400/10 px-3 py-2 text-green-300">
                          RT {Number(s.overallRating || 0)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
