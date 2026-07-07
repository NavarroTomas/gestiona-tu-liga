"use client";

import Link from "next/link";

const secciones = [
  { id: "registro", nombre: "Registro", icono: "🚨" },
  { id: "discord", nombre: "Discord ID", icono: "💬" },
  { id: "inicio", nombre: "Inicio", icono: "🏠" },
  { id: "competicion", nombre: "Competición", icono: "🏆" },
  { id: "fixture", nombre: "Fixture", icono: "📅" },
  { id: "estadisticas", nombre: "Estadísticas", icono: "📊" },
  { id: "clubes", nombre: "Clubes", icono: "👥" },
  { id: "jugadores", nombre: "Jugadores", icono: "🧍" },
  { id: "mercado", nombre: "Mercado", icono: "🔁" },
  { id: "historia", nombre: "Historia", icono: "📜" },
  { id: "predicciones", nombre: "Predicciones", icono: "🎯" },
  { id: "dream-team", nombre: "Dream Team", icono: "⭐" },
  { id: "premios", nombre: "Premios APA", icono: "🏆" },
  { id: "faq", nombre: "Preguntas", icono: "❓" },
  { id: "mapa", nombre: "Mapa", icono: "🗺️" },
];

function GuiaCard({
  id,
  icono,
  titulo,
  descripcion,
  items,
  consejo,
  href,
}: {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  items: string[];
  consejo?: string;
  href?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.12)] sm:rounded-[34px] md:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-3xl">
              {icono}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Guía APA
              </p>

              <h2 className="mt-2 break-words text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                {titulo}
              </h2>
            </div>
          </div>

          <p className="mt-5 max-w-4xl break-words text-base leading-relaxed text-zinc-400 md:text-lg">
            {descripcion}
          </p>
        </div>

        {href && (
          <Link
            href={href}
            className="shrink-0 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-sky-300 transition hover:border-sky-300 hover:bg-sky-400 hover:text-black"
          >
            Ir ahora
          </Link>
        )}
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={`${id}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/35 p-4"
          >
            <p className="break-words leading-relaxed text-zinc-300">{item}</p>
          </div>
        ))}
      </div>

      {consejo && (
        <div className="mt-7 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
            Consejo APA
          </p>

          <p className="mt-3 break-words leading-relaxed text-zinc-200">
            {consejo}
          </p>
        </div>
      )}
    </section>
  );
}

function FAQItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
      <h3 className="break-words text-xl font-black leading-snug text-white">
        {pregunta}
      </h3>

      <p className="mt-3 break-words leading-relaxed text-zinc-400">
        {respuesta}
      </p>
    </div>
  );
}

export default function GuiaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section
          id="top"
          className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.22)] sm:rounded-[38px] md:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="break-words text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 break-words text-[clamp(2.4rem,9vw,5rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Guía Oficial
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  Plataforma APA
                </span>
              </h1>

              <p className="mt-5 max-w-3xl break-words text-base leading-relaxed text-zinc-400 md:text-lg">
                Guía actualizada para usar la web oficial de APA PSO Argentina:
                competición, fixture, clubes, jugadores, estadísticas,
                predicciones, Dream Team, premios, historial y administración.
              </p>
            </div>

            <div className="hidden h-32 w-32 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)] lg:flex xl:h-40 xl:w-40">
              <span className="text-6xl">📖</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[280px_1fr]">
          <aside className="scrollbar-thin scrollbar-thumb-sky-500/40 scrollbar-track-black/30 sticky top-[92px] hidden max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] border border-sky-500/25 bg-[#020714]/90 p-4 shadow-[0_0_30px_rgba(0,120,255,.12)] backdrop-blur-xl xl:block">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
              Navegación rápida
            </p>

            <div className="space-y-2">
              {secciones.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-zinc-300 transition hover:border-sky-400/60 hover:bg-sky-400/10 hover:text-white"
                >
                  <span className="text-lg">{s.icono}</span>
                  <span className="break-words leading-tight">{s.nombre}</span>
                </a>
              ))}
            </div>

            <a
              href="#top"
              className="mt-4 block rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-green-300 transition hover:bg-green-400 hover:text-black"
            >
              Volver arriba
            </a>
          </aside>

          <div className="min-w-0 space-y-8">
            <section className="sticky top-[76px] z-40 rounded-[28px] border border-sky-500/25 bg-[#020714]/90 p-4 shadow-[0_0_30px_rgba(0,120,255,.12)] backdrop-blur-xl xl:hidden">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Navegación rápida
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {secciones.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-3 text-center text-[11px] font-black uppercase text-zinc-300 transition hover:border-sky-400/60 hover:bg-sky-400/10 hover:text-white sm:text-xs"
                  >
                    <span className="shrink-0">{s.icono}</span>
                    <span className="min-w-0 truncate">{s.nombre}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-[26px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  Para nuevos usuarios
                </p>
                <h3 className="mt-3 break-words text-2xl font-black uppercase sm:text-3xl">
                  Empezá rápido
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-400">
                  Creá tu perfil, completá SteamID64, Discord ID y PlayerId para
                  vincular tu identidad con estadísticas y premios.
                </p>
              </div>

              <div className="rounded-[26px] border border-yellow-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                  Competencia oficial
                </p>
                <h3 className="mt-3 break-words text-2xl font-black uppercase sm:text-3xl">
                  Liga + Copas
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-400">
                  La plataforma ahora organiza Liga, Clasificación a Copas,
                  Copa Argentina y Copa APA bajo una misma estructura.
                </p>
              </div>

              <div className="rounded-[26px] border border-green-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-green-300">
                  Datos oficiales
                </p>
                <h3 className="mt-3 break-words text-2xl font-black uppercase sm:text-3xl">
                  PlayerId manda
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-400">
                  Las estadísticas pertenecen al jugador por PlayerId. Si cambia
                  de club, su historial no se pierde.
                </p>
              </div>
            </section>

            <section
              id="registro"
              className="scroll-mt-28 relative overflow-hidden rounded-[34px] border border-red-400/35 bg-[#020714] p-5 shadow-[0_0_55px_rgba(248,113,113,.18)] sm:p-7 md:p-8"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,.18),transparent_42%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/35 via-black/55 to-black/20" />

              <div className="relative z-10">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">
                      Leé esto antes de registrarte
                    </p>

                    <h2 className="mt-3 text-[clamp(2rem,7vw,4rem)] font-black uppercase italic leading-none text-white">
                      🚨 Datos obligatorios
                    </h2>

                    <p className="mt-5 max-w-4xl text-base leading-relaxed text-zinc-300 md:text-lg">
                      Para que tu cuenta funcione correctamente necesitás cargar
                      bien tu <span className="font-black text-yellow-300">SteamID64</span>,
                      tu <span className="font-black text-sky-300">Discord User ID</span> y tu
                      <span className="font-black text-green-300"> PlayerId oficial</span>.
                    </p>
                  </div>

                  <Link
                    href="/registro"
                    className="rounded-2xl border border-red-300/40 bg-red-400 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white"
                  >
                    Crear cuenta
                  </Link>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-yellow-400/35 bg-yellow-400/10 p-5">
                    <p className="text-4xl">🎮</p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-yellow-300">
                      SteamID64
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Copiá el número de Steam. No uses links ni nombres personalizados.
                    </p>
                    <p className="mt-4 rounded-2xl border border-green-400/25 bg-green-400/10 p-3 text-sm font-black text-green-300">
                      ✅ 76561199109076112
                    </p>
                  </div>

                  <div className="rounded-3xl border border-red-400/35 bg-red-400/10 p-5">
                    <p className="text-4xl">⛔</p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-red-300">
                      No uses links
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Links de Steam Community, URLs personalizadas o nombres no sirven para validar identidad.
                    </p>
                    <p className="mt-4 break-all rounded-2xl border border-red-400/25 bg-black/35 p-3 text-xs font-black text-red-200">
                      ❌ steamcommunity.com/id/usuario
                    </p>
                  </div>

                  <div className="rounded-3xl border border-sky-400/35 bg-sky-400/10 p-5">
                    <p className="text-4xl">🆔</p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-sky-300">
                      PlayerId
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Es la identidad deportiva. Vincula estadísticas, clubes, rankings, premios e historial.
                    </p>
                    <p className="mt-4 rounded-2xl border border-sky-400/25 bg-black/35 p-3 text-sm font-black text-sky-200">
                      La web identifica por PlayerId, no por nombre.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-purple-400/35 bg-purple-400/10 p-5">
                    <p className="text-4xl">⭐</p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-purple-300">
                      Golden Boy
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Puede usar Steam para validar horas de PSO cuando el staff calcule elegibilidad.
                    </p>
                    <p className="mt-4 rounded-2xl border border-purple-400/25 bg-black/35 p-3 text-sm font-black text-purple-200">
                      Menos de 500 hs + menos de 25 PJ.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <GuiaCard
              id="discord"
              icono="💬"
              titulo="Discord User ID"
              descripcion="APA utiliza tu Discord User ID para verificaciones, seguridad, roles y posibles integraciones con el servidor."
              items={[
                "Abrí Discord y entrá a Configuración.",
                "En Avanzado, activá Modo Desarrollador.",
                "Hacé clic derecho sobre tu usuario.",
                "Seleccioná Copiar ID.",
                "Pegá ese número en tu perfil APA.",
                "No uses tu nombre de Discord ni tu @, solo el ID numérico.",
              ]}
              consejo="Ejemplo: 123456789012345678. Si está mal, el staff puede marcar tu perfil en disputa."
            />

            <GuiaCard
              id="inicio"
              icono="🏠"
              titulo="Inicio"
              href="/"
              descripcion="Inicio es la portada general de APA. Resume lo más importante de la temporada activa y permite moverse rápido por la plataforma."
              items={[
                "Muestra estadísticas destacadas según temporada, competencia y contexto seleccionado.",
                "Permite ver próximos partidos y últimos resultados.",
                "Incluye la sección La noche del partido con un encuentro destacado.",
                "Tiene accesos rápidos a Competición, Fixture, Clubes, Jugadores, Mercado, Historia y Entretenimiento.",
                "Las noticias publicadas aparecen desde la base de datos si están activas.",
                "La portada ya no está limitada a Liga: también puede mostrar Clasificación, Copa Argentina y Copa APA.",
              ]}
              consejo="Recorrido recomendado: Inicio → Competición → Fixture → Clubes → Jugadores → Entretenimiento."
            />

            <GuiaCard
              id="competicion"
              icono="🏆"
              titulo="Competición"
              href="/competicion"
              descripcion="Competición centraliza toda la estructura oficial de APA PSO Argentina. Ya no se trabaja solo con divisiones: ahora la temporada combina Liga, clasificación y copas."
              items={[
                "Liga: contiene Primera y Segunda División.",
                "Clasificación a Copas: tiene Grupo A, Grupo B, Grupo C y Grupo D.",
                "En Clasificación, los dos primeros de cada grupo pasan a Copa Argentina.",
                "Los dos últimos de cada grupo pasan a Copa APA.",
                "Copa Argentina: eliminación directa con fases como Octavos, Cuartos, Semifinal y Final.",
                "Copa APA: eliminación directa con formato equivalente, orientada al segundo cuadro competitivo.",
                "Las tablas y grupos usan PJ, PG, PE, PP, GF, GC, DG y PTS.",
                "La estructura general es: Temporada → Competición → División / Grupo / Fase.",
              ]}
              consejo="Cuando una pantalla pida Competición, primero elegí Liga, Clasificación, Copa Argentina o Copa APA. Recién después elegís división, grupo o fase."
            />

            <GuiaCard
              id="fixture"
              icono="📅"
              titulo="Fixture y Match Center"
              href="/fixture"
              descripcion="El Fixture muestra el calendario oficial completo. Usa el mismo sistema para Liga, Clasificación a Copas, Copa Argentina y Copa APA."
              items={[
                "Podés filtrar por temporada.",
                "Podés elegir competencia: Liga, Clasificación, Copa Argentina o Copa APA.",
                "Si elegís Liga, aparecen Primera y Segunda.",
                "Si elegís Clasificación, aparecen los grupos A, B, C y D.",
                "Si elegís una copa, aparecen las fases: Octavos, Cuartos, Semifinal y Final.",
                "Los partidos sin resultado quedan como próximos encuentros.",
                "Los partidos con resultado pueden abrir estadísticas y Match Center.",
                "La carga TXT permite registrar estadísticas oficiales de un partido.",
                "Si se carga mal un TXT, desde administración se puede anular la carga y recalcular datos.",
              ]}
              consejo="No crees fixtures separados por torneo. Todo debe entrar por el fixture unificado para mantener estadísticas, rankings y premios conectados."
            />

            <GuiaCard
              id="estadisticas"
              icono="📊"
              titulo="Estadísticas"
              href="/estadisticas"
              descripcion="Estadísticas permite revisar rendimiento de partidos, equipos y jugadores usando filtros por temporada, competencia, grupo, división, fase y fecha."
              items={[
                "Los filtros siguen la estructura Temporada → Competición → División / Grupo / Fase → Fecha.",
                "Los datos de jugadores se vinculan por PlayerId.",
                "Las estadísticas de un jugador no pertenecen al club: pertenecen al jugador.",
                "Si un jugador cambia de equipo, conserva sus goles, asistencias, MVP, rating APA y premios.",
                "El rating usado para cálculos APA debe ser rating_apa, no el overallRating bruto del juego.",
                "Los rankings pueden mostrar goles, asistencias, MVP, score, rating, atajadas, tackles e intercepciones.",
              ]}
              consejo="Si algo no aparece, revisá primero que el partido tenga partido_id correcto y que las estadísticas estén cargadas con PlayerId."
            />

            <GuiaCard
              id="clubes"
              icono="👥"
              titulo="Clubes"
              href="/clubes"
              descripcion="Clubes reúne la identidad y estructura de cada equipo. Los clubes son dinámicos y salen de Supabase, no de listas hardcodeadas."
              items={[
                "Cada club puede tener escudo, estadio, temporada y división.",
                "El panel permite crear, editar y eliminar clubes.",
                "Los escudos y datos visuales se actualizan desde administración.",
                "Cada club tiene plantel asociado.",
                "Los jugadores se identifican por PSO ID / PlayerId.",
                "Cambiar a un jugador de club no borra sus estadísticas anteriores.",
                "Más adelante Mercado agregará historial formal de transferencias.",
              ]}
              consejo="Para evitar duplicados, mantené nombres de club consistentes entre clubes_info, equipos, partidos y estadísticas."
            />

            <GuiaCard
              id="jugadores"
              icono="🧍"
              titulo="Jugadores"
              href="/jugadores"
              descripcion="Cada jugador tiene un perfil deportivo individual basado en PlayerId. Es la pieza central para estadísticas, premios, historial y perfiles públicos."
              items={[
                "El PlayerId agrupa correctamente las estadísticas aunque el jugador cambie de club.",
                "El perfil puede mostrar goles, asistencias, MVP, score, rating APA, atajadas y más.",
                "Los arqueros se identifican por atajadas, atrapadas o posición.",
                "Los perfiles públicos pueden vincularse si el usuario cargó su PlayerId en la cuenta.",
                "Premios, rankings, historia y Dream Team deben usar PlayerId para evitar duplicados.",
                "Si un jugador aparece separado dos veces, probablemente tiene PlayerId mal cargado o escrito diferente.",
              ]}
              consejo="Nunca tomes el nombre como identificador principal. El nombre puede cambiar; el PlayerId debe ser la referencia estable."
            />

            <GuiaCard
              id="mercado"
              icono="🔁"
              titulo="Mercado de pases"
              href="/mercado"
              descripcion="Mercado muestra movimientos de jugadores. En la próxima etapa se ampliará con historial formal de transferencias."
              items={[
                "Puede mostrar fichajes, salidas, préstamos y jugadores libres.",
                "Los movimientos deberían vincular jugador, club origen y club destino.",
                "La estadística del jugador no se reinicia al cambiar de club.",
                "El historial futuro guardará fecha, temporada y usuario que realizó el cambio.",
                "El sistema debe evitar que un cambio de plantilla rompa rankings o premios.",
                "Los movimientos son parte importante del historial competitivo de APA.",
              ]}
              consejo="Cuando se implemente historial completo, cada transferencia debería registrar origen, destino, fecha, temporada y administrador responsable."
            />

            <GuiaCard
              id="historia"
              icono="📜"
              titulo="Historia APA"
              href="/historia"
              descripcion="Historia APA muestra el legado competitivo: premios, rankings históricos, récords y rendimiento acumulado."
              items={[
                "Muestra rankings acumulados por PlayerId.",
                "Puede mostrar goleadores históricos, asistidores, MVP y ratings.",
                "Incluye premios oficiales como Balón de Oro, The Best, Raiko Trophy, Bota de Oro y Golden Boy.",
                "La sección ya no usa estética mundialista ni copa del mundo como eje visual.",
                "En el futuro puede sumar campeones de Liga, Copa Argentina y Copa APA.",
                "También puede sumar finales, temporadas, récords de puntos y salón de la fama.",
              ]}
              consejo="Historia es tan confiable como la calidad de los datos cargados. PlayerId correcto = historial limpio."
            />

            <GuiaCard
              id="predicciones"
              icono="🎯"
              titulo="Predicciones"
              href="/entretenimiento/predicciones"
              descripcion="Predicciones permite pronosticar partidos pendientes y competir en un ranking público de usuarios."
              items={[
                "Funciona con todas las competiciones oficiales.",
                "Primero elegís temporada y competencia.",
                "Después elegís división, grupo o fase según corresponda.",
                "Podés elegir ganador: local, empate o visitante.",
                "También podés cargar marcador exacto.",
                "Ganador correcto suma 1 punto.",
                "Marcador exacto suma 3 puntos.",
                "Cuando se carga el resultado real, el sistema calcula puntos automáticamente.",
              ]}
              consejo="Las predicciones se separan por partido_id. Eso evita mezclar Liga Fecha 1 con Copa Fecha 1."
            />

            <GuiaCard
              id="dream-team"
              icono="⭐"
              titulo="Dream Team"
              href="/entretenimiento/dream-team"
              descripcion="Dream Team permite votar el equipo ideal de una fecha con formación oficial de fútbol 8."
              items={[
                "La formación oficial es GK, LB, CB, RB, LCM, RCM, LST y RST.",
                "Funciona por temporada, competencia, división/grupo/fase y fecha.",
                "Los candidatos salen de las estadísticas cargadas para ese contexto.",
                "El orden sugerido de candidatos usa Score APA ponderado, no popularidad.",
                "El Dream Team final se define por votos de la comunidad.",
                "No se puede repetir el mismo jugador en varias posiciones.",
                "Cada usuario puede votar su equipo por fecha y contexto.",
              ]}
              consejo="Separá mentalmente Dream Team automático y Dream Team votado: uno ordena candidatos por rendimiento, el otro define ganadores por votos."
            />

            <GuiaCard
              id="premios"
              icono="🏆"
              titulo="Premios APA"
              href="/entretenimiento/premios"
              descripcion="Premios APA reúne reconocimientos de fecha y premios oficiales de temporada calculados desde estadísticas oficiales."
              items={[
                "Premios de fecha: MVP, goleador, asistidor, arquero, muro defensivo y estrella.",
                "Premios de temporada: Balón de Oro, The Best, Bota de Oro, Raiko Trophy y Golden Boy.",
                "Balón de Oro evalúa rendimiento global oficial.",
                "The Best premia al mejor jugador de Segunda, contando también copas oficiales.",
                "Bota de Oro prioriza goles oficiales con peso por competición.",
                "Raiko Trophy mantiene peso por división y competición para valorar dificultad.",
                "Golden Boy conserva restricciones de elegibilidad: temporadas, PJ y horas PSO.",
                "La fórmula base es 65% rendimiento individual, 20% impacto en el equipo y 15% logro colectivo.",
                "Los pesos actuales son Liga x1.00, Copa Argentina x1.05, Clasificación x0.95 y Copa APA x0.90.",
                "Por división: Primera x1.00 y Segunda x0.75 cuando el premio requiere ponderación.",
                "El cálculo debe usar rating_apa como ranking propio de APA, no overallRating bruto del juego.",
              ]}
              consejo="El staff confirma ganadores, pero el ranking automático sirve como base objetiva. Si un dato está mal, corregí estadísticas antes de asignar premios."
            />

            <section
              id="faq"
              className="scroll-mt-28 rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.10)] md:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-3xl">
                  ❓
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Ayuda rápida
                  </p>

                  <h2 className="mt-2 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                    Preguntas frecuentes
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FAQItem pregunta="¿Por qué no aparezco en la web?" respuesta="Puede ser porque todavía no jugaste partidos cargados, porque tus estadísticas no tienen PlayerId correcto o porque tu perfil de usuario todavía no está completo." />
                <FAQItem pregunta="¿Qué pasa si cambio de club?" respuesta="No perdés estadísticas. Las estadísticas pertenecen a tu PlayerId, no al club. Solo cambia tu equipo actual o tu plantilla." />
                <FAQItem pregunta="¿Cómo funciona Clasificación a Copas?" respuesta="Tiene cuatro grupos de cuatro equipos. Los dos primeros van a Copa Argentina y los dos últimos a Copa APA." />
                <FAQItem pregunta="¿Qué diferencia hay entre Copa Argentina y Copa APA?" respuesta="Copa Argentina es el cuadro principal. Copa APA es el segundo cuadro competitivo para los equipos que no clasificaron arriba en grupos." />
                <FAQItem pregunta="¿Cómo sumo puntos en Predicciones?" respuesta="Sumás 1 punto por acertar ganador y 3 puntos por acertar marcador exacto. Necesitás iniciar sesión para votar." />
                <FAQItem pregunta="¿Cómo se calculan los premios?" respuesta="Usan estadísticas oficiales, rating_apa, peso por competición, peso por división cuando aplica, impacto individual en el equipo y logro colectivo." />
                <FAQItem pregunta="¿Por qué no aparecen premios o candidatos?" respuesta="Puede faltar carga TXT, no existir partido_id, no haber estadísticas para ese contexto o no estar consultadas las horas de Steam en Golden Boy." />
                <FAQItem pregunta="¿Qué hago si cargué mal un resultado TXT?" respuesta="Desde administración debe anularse la carga del TXT para borrar estadísticas del partido, limpiar resultado y recalcular rankings afectados." />
              </div>
            </section>

            <section
              id="mapa"
              className="scroll-mt-28 rounded-[34px] border border-green-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(34,197,94,.10)] md:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-400/30 bg-green-400/10 text-3xl">
                  🗺️
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-green-300">
                    Organización
                  </p>

                  <h2 className="mt-2 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                    Mapa de la plataforma
                  </h2>
                </div>
              </div>

              <div className="mt-7 overflow-x-auto rounded-3xl border border-white/10 bg-black/35 p-5">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300 md:text-base">{`Inicio
│
├─ Perfil
│  ├─ Datos públicos
│  ├─ PlayerId
│  ├─ SteamID64
│  └─ Discord ID
│
├─ Competición
│  ├─ Liga
│  │  ├─ Primera
│  │  └─ Segunda
│  ├─ Clasificación a Copas
│  │  ├─ Grupo A
│  │  ├─ Grupo B
│  │  ├─ Grupo C
│  │  └─ Grupo D
│  ├─ Copa Argentina
│  └─ Copa APA
│
├─ Fixture
│  ├─ Temporada
│  ├─ Competición
│  ├─ División / Grupo / Fase
│  └─ Match Center
│
├─ Estadísticas
│  ├─ Equipos
│  ├─ Jugadores
│  ├─ Ranking
│  └─ Partidos
│
├─ Clubes
│  ├─ Perfil de club
│  ├─ Escudo
│  ├─ Estadio
│  └─ Plantel
│
├─ Jugadores
│  └─ Perfil individual por PlayerId
│
├─ Mercado
│  └─ Transferencias presentes y futuras
│
├─ Historia
│  ├─ Premios históricos
│  ├─ Rankings históricos
│  └─ Récords APA
│
└─ Entretenimiento
   ├─ Predicciones
   ├─ Dream Team
   └─ Premios APA

Administración
├─ Clubes
├─ Fixture
├─ Carga TXT
├─ Anulación TXT
├─ Premios
└─ Seguridad / permisos`}</pre>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#top"
                  className="rounded-2xl border border-green-400/30 bg-green-400/10 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-green-300 transition hover:bg-green-400 hover:text-black"
                >
                  Volver arriba
                </a>

                <Link
                  href="/entretenimiento"
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-sky-300 transition hover:bg-sky-400 hover:text-black"
                >
                  Ir a entretenimiento
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
