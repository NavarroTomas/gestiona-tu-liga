"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import estilos from "./public-profile.module.css";

type PerfilPublico = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  bio: string | null;
  avatar_url: string | null;
  visible_role: string | null;
};

type StatJugador = {
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  score?: number | null;
};

type Prediccion = {
  id: number;
  partido_id: string;
  prediccion: "local" | "empate" | "visitante";
  goles_local?: number | null;
  goles_visitante?: number | null;
};

type DreamVote = {
  id: number;
  temporada: string | null;
  division: string | null;
  fecha: string | null;
};

type PremioAPA = {
  id: number;
  temporada: string;
  division: string | null;
  premio: string;
  nombre: string;
  equipo: string | null;
  puntos: number | null;
  posicion: number | null;
  created_at: string | null;
};

type Logro = {
  key: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  progreso: string;
};

function premioNombre(premio: string) {
  const mapa: Record<string, string> = {
    balon_oro: "Balón de Oro",
    the_best: "The Best",
    raiko_trophy: "Raiko Trophy",
    bota_oro: "Bota de Oro",
    golden_boy: "Golden Boy",
  };

  return mapa[premio] || premio.replaceAll("_", " ");
}

export default function PerfilPublicoPage() {
  const params = useParams();
  const usernameParam = String(params?.username || "").toLowerCase();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [stats, setStats] = useState<StatJugador[]>([]);
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [dreamVotes, setDreamVotes] = useState<DreamVote[]>([]);
  const [premios, setPremios] = useState<PremioAPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPerfilPublico();
  }, [usernameParam]);

  async function cargarPerfilPublico() {
    setLoading(true);
    setMensaje("");
    setPerfil(null);

    const { data: perfilData, error: perfilError } = await supabase
      .from("public_profiles")
      .select("id,display_name,username,playerid,bio,avatar_url,visible_role")
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

    const perfilFinal = perfilData as PerfilPublico;
    setPerfil(perfilFinal);

    const statsQuery = perfilFinal.playerid
      ? supabase
          .from("estadisticas_jugadores")
          .select("goals,assists,mvp,score")
          .eq("playerId", perfilFinal.playerid)
      : Promise.resolve({ data: [], error: null });

    const prediccionesQuery = supabase
      .from("predicciones")
      .select("id,partido_id,prediccion,goles_local,goles_visitante")
      .eq("usuario", perfilFinal.id);

    const dreamQuery = supabase
      .from("public_dream_team_votos")
      .select("id,temporada,division,fecha")
      .eq("usuario", perfilFinal.id);

    const premiosQuery = perfilFinal.playerid
      ? supabase
          .from("premios_apa")
          .select("id,temporada,division,premio,nombre,equipo,puntos,posicion,created_at")
          .eq("playerid", perfilFinal.playerid)
          .order("temporada", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const [statsResult, predResult, dreamResult, premiosResult] = await Promise.all([
      statsQuery,
      prediccionesQuery,
      dreamQuery,
      premiosQuery,
    ]);

    if (statsResult.error) console.log(statsResult.error);
    if (predResult.error) console.log(predResult.error);
    if (dreamResult.error) console.log(dreamResult.error);
    if (premiosResult.error) console.log(premiosResult.error);

    setStats((statsResult.data || []) as StatJugador[]);
    setPredicciones((predResult.data || []) as Prediccion[]);
    setDreamVotes((dreamResult.data || []) as DreamVote[]);
    setPremios((premiosResult.data || []) as PremioAPA[]);
    setLoading(false);
  }

  const resumenJugador = useMemo(() => {
    return {
      partidos: stats.length,
      goles: stats.reduce((acc, item) => acc + Number(item.goals || 0), 0),
      asistencias: stats.reduce((acc, item) => acc + Number(item.assists || 0), 0),
      mvps: stats.reduce((acc, item) => acc + Number(item.mvp || 0), 0),
    };
  }, [stats]);

  const dreamEquipos = useMemo(() => {
    return new Set(
      dreamVotes.map((item) => `${item.temporada}-${item.division}-${item.fecha}`),
    ).size;
  }, [dreamVotes]);

  const logros = useMemo<Logro[]>(() => {
    const tieneBio = Boolean(perfil?.bio?.trim());
    const tieneJugador = Boolean(perfil?.playerid);
    const tienePremio = premios.length > 0;

    return [
      {
        key: "perfil_completo",
        titulo: "Perfil completo",
        descripcion: "Agregó una biografía pública a su cuenta Liga.",
        activo: tieneBio,
        progreso: tieneBio ? "Completado" : "Pendiente",
      },
      {
        key: "jugador_vinculado",
        titulo: "Jugador vinculado",
        descripcion: "La cuenta está conectada con un PlayerID oficial.",
        activo: tieneJugador,
        progreso: tieneJugador ? "Vinculado" : "Pendiente",
      },
      {
        key: "pronosticador",
        titulo: "Pronosticador",
        descripcion: "Participó al menos una vez en Predicciones Liga.",
        activo: predicciones.length >= 1,
        progreso: `${predicciones.length} predicciones`,
      },
      {
        key: "dream_team",
        titulo: "Votante Dream Team",
        descripcion: "Participó en la elección del Dream Team de la comunidad.",
        activo: dreamVotes.length >= 1,
        progreso: `${dreamVotes.length} votos`,
      },
      {
        key: "100_partidos",
        titulo: "100 partidos oficiales",
        descripcion: "Disputó al menos 100 partidos oficiales en Liga.",
        activo: resumenJugador.partidos >= 100,
        progreso: `${Math.min(resumenJugador.partidos, 100)} / 100`,
      },
      {
        key: "premio_apa",
        titulo: "Premiado por Liga",
        descripcion: "Consiguió al menos un premio individual oficial.",
        activo: tienePremio,
        progreso: `${premios.length} premios`,
      },
    ];
  }, [perfil, predicciones.length, dreamVotes.length, resumenJugador.partidos, premios.length]);

  const logrosDesbloqueados = logros.filter((logro) => logro.activo).length;

  useEffect(() => {
    const currentProfile = perfil;
    if (!currentProfile || loading) return;
    const profileId = currentProfile.id;
    const profileUsername = currentProfile.username;

    async function notificarLogros() {
      const activos = logros.filter((logro) => logro.activo);
      if (activos.length === 0) return;

      const { data: yaNotificados, error } = await supabase
        .from("logros_notificados")
        .select("logro_key")
        .eq("user_id", profileId);

      if (error) {
        console.log(error);
        return;
      }

      const existentes = new Set((yaNotificados || []).map((item: any) => item.logro_key));
      const nuevos = activos.filter((logro) => !existentes.has(logro.key));
      if (nuevos.length === 0) return;

      const { error: logrosError } = await supabase.from("logros_notificados").insert(
        nuevos.map((logro) => ({ user_id: profileId, logro_key: logro.key })),
      );

      if (logrosError) {
        console.log(logrosError);
        return;
      }

      const { error: notificacionesError } = await supabase.from("notificaciones").insert(
        nuevos.map((logro) => ({
          user_id: profileId,
          tipo: "achievement",
          titulo: "Logro desbloqueado",
          mensaje: `${logro.titulo}: ${logro.descripcion}`,
          href: `/u/${profileUsername}`,
          leida: false,
        })),
      );

      if (notificacionesError) console.log(notificacionesError);
    }

    notificarLogros();
  }, [perfil, loading, logros, logrosDesbloqueados]);

  if (loading) {
    return (
      <main className={estilos.statePage}>
        <section className={estilos.stateCard}>
          <h1>Cargando perfil</h1>
          <p>Estamos preparando la información pública de esta cuenta Liga.</p>
        </section>
      </main>
    );
  }

  if (mensaje || !perfil) {
    return (
      <main className={estilos.statePage}>
        <section className={estilos.stateCard}>
          <h1>Perfil no encontrado</h1>
          <p>{mensaje || "No existe este usuario."}</p>
          <Link href="/">Volver al inicio</Link>
        </section>
      </main>
    );
  }

  const inicial = (perfil.display_name || perfil.username || "A").slice(0, 1).toUpperCase();

  return (
    <main className={estilos.page}>
      <section className={estilos.shell}>
        <section className={estilos.hero}>
          <div className={estilos.avatar}>
            {perfil.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.display_name || perfil.username || "Avatar"}
              />
            ) : (
              inicial
            )}
          </div>

          <div className={estilos.identity}>
            <p className={estilos.eyebrow}>Perfil de comunidad Liga</p>
            <h1>{perfil.display_name || perfil.username}</h1>

            <div className={estilos.meta}>
              <span>@{perfil.username}</span>
              <span className={estilos.role}>{perfil.visible_role || "usuario"}</span>
            </div>

            <p className={estilos.bio}>
              {perfil.bio?.trim() || "Este usuario todavía no agregó una biografía pública."}
            </p>
          </div>

          <div className={estilos.heroActions}>
            {perfil.playerid ? (
              <Link className={estilos.primaryAction} href={`/jugadores/${perfil.playerid}`}>
                Ver perfil de jugador
              </Link>
            ) : (
              <span className={estilos.primaryAction}>Sin jugador vinculado</span>
            )}
            <Link className={estilos.secondaryAction} href="/entretenimiento">
              Ver comunidad Liga
            </Link>
          </div>
        </section>

        <section className={estilos.statsGrid}>
          <article className={estilos.statCard}>
            <span>Predicciones</span>
            <strong>{predicciones.length}</strong>
          </article>
          <article className={estilos.statCard}>
            <span>Dream Teams</span>
            <strong>{dreamEquipos}</strong>
          </article>
          <article className={estilos.statCard}>
            <span>Logros</span>
            <strong>{logrosDesbloqueados}/{logros.length}</strong>
          </article>
          <article className={estilos.statCard}>
            <span>Premios Liga</span>
            <strong>{premios.length}</strong>
          </article>
        </section>

        <section className={estilos.contentGrid}>
          <div className={estilos.column}>
            <section className={estilos.panel}>
              <header className={estilos.panelHeader}>
                <span>Participación</span>
                <h2>Actividad en la comunidad</h2>
              </header>

              <div className={estilos.activityGrid}>
                <article className={estilos.activityItem}>
                  <small>Predicciones realizadas</small>
                  <strong>{predicciones.length}</strong>
                  <p>Participaciones registradas en el juego de predicciones Liga.</p>
                </article>

                <article className={estilos.activityItem}>
                  <small>Dream Team</small>
                  <strong>{dreamVotes.length}</strong>
                  <p>Votos emitidos para elegir jugadores de la jornada.</p>
                </article>

                <article className={estilos.activityItem}>
                  <small>Jornadas Dream Team</small>
                  <strong>{dreamEquipos}</strong>
                  <p>Fechas distintas en las que participó de la votación.</p>
                </article>

                <article className={estilos.activityItem}>
                  <small>Cuenta vinculada</small>
                  <strong>{perfil.playerid ? "Sí" : "No"}</strong>
                  <p>{perfil.playerid ? "Tiene una ficha deportiva oficial asociada." : "Todavía no tiene PlayerID oficial asociado."}</p>
                </article>
              </div>
            </section>

            <section className={estilos.panel}>
              <header className={estilos.panelHeader}>
                <span>Progreso</span>
                <h2>Logros de la cuenta</h2>
              </header>

              <div className={estilos.achievements}>
                {logros.map((logro) => (
                  <article
                    key={logro.key}
                    className={`${estilos.achievement} ${logro.activo ? estilos.achievementUnlocked : ""}`}
                  >
                    <strong>{logro.titulo}</strong>
                    <span>{logro.descripcion}</span>
                    <small>{logro.progreso}</small>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className={estilos.column}>
            <section className={estilos.panel}>
              <header className={estilos.panelHeader}>
                <span>Cuenta y competición</span>
                <h2>Jugador vinculado</h2>
              </header>

              {perfil.playerid ? (
                <div className={estilos.playerCard}>
                  <small>Ficha deportiva oficial</small>
                  <h3>{perfil.display_name || perfil.username}</h3>
                  <p className={estilos.playerId}>PlayerID: {perfil.playerid}</p>

                  <div className={estilos.playerSummary}>
                    <div>
                      <span>PJ</span>
                      <strong>{resumenJugador.partidos}</strong>
                    </div>
                    <div>
                      <span>Goles</span>
                      <strong>{resumenJugador.goles}</strong>
                    </div>
                    <div>
                      <span>Asist.</span>
                      <strong>{resumenJugador.asistencias}</strong>
                    </div>
                  </div>

                  <Link className={estilos.playerButton} href={`/jugadores/${perfil.playerid}`}>
                    Abrir perfil de jugador
                  </Link>
                </div>
              ) : (
                <p className={estilos.emptyPlayer}>
                  Esta cuenta todavía no tiene un PlayerID oficial vinculado. Su perfil público sigue funcionando como identidad de comunidad.
                </p>
              )}
            </section>

            <section className={estilos.panel}>
              <header className={estilos.panelHeader}>
                <span>Reconocimientos</span>
                <h2>Vitrina Liga</h2>
              </header>

              {premios.length > 0 ? (
                <div className={estilos.trophies}>
                  {premios.slice(0, 8).map((premio) => (
                    <article className={estilos.trophy} key={premio.id}>
                      <div>
                        <strong>{premioNombre(premio.premio)}</strong>
                        <span>
                          {displayLabel(premio.temporada)}
                          {premio.equipo ? ` · ${premio.equipo}` : ""}
                        </span>
                      </div>
                      <b>{premio.posicion || 1}</b>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={estilos.empty}>Todavía no hay premios individuales registrados para esta cuenta.</p>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
