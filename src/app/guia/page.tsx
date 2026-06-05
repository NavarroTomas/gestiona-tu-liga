"use client";

import Link from "next/link";

const secciones = [
  { id: "registro", nombre: "Registro", icono: "🚨" },
  { id: "inicio", nombre: "Inicio", icono: "🏠" },
  { id: "perfil", nombre: "Perfil", icono: "👤" },
  { id: "divisiones", nombre: "Divisiones", icono: "📊" },
  { id: "fixture", nombre: "Fixture", icono: "📅" },
  { id: "clubes", nombre: "Clubes", icono: "👥" },
  { id: "mercado", nombre: "Mercado", icono: "🔁" },
  { id: "jugadores", nombre: "Jugadores", icono: "🧍" },
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
      className="scroll-mt-28 rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-3xl">
              {icono}
            </div>

            <div className="min-w-0">
              <p className="text-sky-300 text-xs uppercase tracking-[0.3em] font-black">
                Guía APA
              </p>

              <h2 className="mt-2 break-words text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                {titulo}
              </h2>
            </div>
          </div>

          <p className="mt-5 max-w-4xl text-zinc-400 text-base md:text-lg leading-relaxed break-words">
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

      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <div
            key={`${id}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/35 p-4"
          >
            <p className="text-zinc-300 leading-relaxed break-words">
              {item}
            </p>
          </div>
        ))}
      </div>

      {consejo && (
        <div className="mt-7 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
          <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
            Consejo APA
          </p>

          <p className="mt-3 text-zinc-200 leading-relaxed break-words">
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
      <h3 className="text-xl font-black text-white leading-snug break-words">
        {pregunta}
      </h3>

      <p className="mt-3 text-zinc-400 leading-relaxed break-words">
        {respuesta}
      </p>
    </div>
  );
}

export default function GuiaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section
          id="top"
          className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[38px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 break-words sm:text-xs sm:tracking-[0.45em]">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-[clamp(2.4rem,9vw,5rem)] font-black uppercase italic leading-none break-words">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Guía Oficial
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  Plataforma APA
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-zinc-400 text-base md:text-lg leading-relaxed break-words">
                Todo lo que necesitás saber para usar la web de APA PSO Argentina:
                crear tu perfil, vincular tu PlayerId, revisar tablas, fixture, clubes, jugadores,
                mercado, historia y participar en funciones de comunidad.
              </p>
            </div>

            <div className="hidden lg:flex h-32 w-32 xl:h-40 xl:w-40 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)]">
              <span className="text-6xl">📖</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8 items-start">
          <aside className="hidden xl:block sticky top-[92px] max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] border border-sky-500/25 bg-[#020714]/90 p-4 shadow-[0_0_30px_rgba(0,120,255,.12)] backdrop-blur-xl scrollbar-thin scrollbar-thumb-sky-500/40 scrollbar-track-black/30">
            <p className="mb-4 text-sky-300 text-xs uppercase tracking-[0.3em] font-black">
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
            <section className="xl:hidden sticky top-[76px] z-40 rounded-[28px] border border-sky-500/25 bg-[#020714]/90 p-4 shadow-[0_0_30px_rgba(0,120,255,.12)] backdrop-blur-xl">
              <p className="mb-3 text-sky-300 text-xs uppercase tracking-[0.3em] font-black">
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-[26px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
            <p className="text-sky-300 text-xs uppercase tracking-[0.25em] font-black">
              Para nuevos usuarios
            </p>
            <h3 className="mt-3 text-2xl font-black uppercase break-words sm:text-3xl">
              Empezá rápido
            </h3>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Creá tu perfil, completá tus datos públicos y vinculá tu PlayerId para que la web te identifique bien.
            </p>
          </div>

          <div className="rounded-[26px] border border-yellow-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
            <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
              Comunidad
            </p>
            <h3 className="mt-3 text-2xl font-black uppercase break-words sm:text-3xl">
              Participá
            </h3>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Votá en Predicciones, armá tu Dream Team, seguí el Mercado y revisá Premios APA.
            </p>
          </div>

          <div className="rounded-[26px] border border-green-500/25 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
            <p className="text-green-300 text-xs uppercase tracking-[0.25em] font-black">
              Datos oficiales
            </p>
            <h3 className="mt-3 text-2xl font-black uppercase break-words sm:text-3xl">
              Estadísticas
            </h3>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Los rankings, perfiles, clubes y premios se alimentan de los TXT y datos oficiales cargados.
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
                <p className="text-red-300 text-xs uppercase tracking-[0.35em] font-black">
                  Leé esto antes de registrarte
                </p>

                <h2 className="mt-3 text-[clamp(2rem,7vw,4rem)] font-black uppercase italic leading-none text-white">
                  🚨 Datos obligatorios
                </h2>

                <p className="mt-5 max-w-4xl text-zinc-300 text-base md:text-lg leading-relaxed">
                  Antes de crear tu cuenta en APA, asegurate de tener correctamente tu
                  <span className="font-black text-yellow-300"> SteamID64 </span>
                  y tu
                  <span className="font-black text-sky-300"> PlayerId oficial</span>.
                  Son los datos que conectan tu usuario con tus estadísticas, premios, historial e identidad verificada.
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
                  Debés copiar el número que aparece en Steam → Detalles de la cuenta → ID de Steam.
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
                  No pongas links de Steam Community, URLs personalizadas ni nombres de usuario.
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
                  El PlayerId vincula tu perfil con estadísticas, rankings, clubes, premios y trayectoria.
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
                  APA consulta automáticamente tus horas en Pro Soccer Online para calcular si podés competir por Golden Boy.
                </p>
                <p className="mt-4 rounded-2xl border border-purple-400/25 bg-black/35 p-3 text-sm font-black text-purple-200">
                  Menos de 500 hs + menos de 25 PJ.
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-[28px] border border-orange-400/30 bg-orange-400/10 p-5">
              <p className="text-orange-300 text-xs uppercase tracking-[0.3em] font-black">
                Estado Disputa
              </p>

              <p className="mt-3 text-zinc-200 leading-relaxed">
                Si cargás mal tu Steam ID o tu PlayerId, un administrador puede marcar tu perfil como
                <span className="font-black text-orange-300"> DISPUTA</span>.
                Eso significa que tenés que corregir la información antes de poder ser aprobado.
              </p>
            </div>
          </div>
        </section>

        <GuiaCard
          id="inicio"
          icono="🏠"
          titulo="Inicio"
          href="/"
          descripcion="La página principal reúne la información más importante de la liga en un solo lugar. Es el punto ideal para empezar si entrás por primera vez."
          items={[
            "Podés ver accesos rápidos a las secciones principales de la web.",
            "Sirve para orientarte entre divisiones, clubes, jugadores e historia.",
            "También puede mostrar información destacada de la temporada activa.",
            "Desde el Inicio podés entrar rápidamente a Entretenimiento y participar.",
            "Es la puerta de entrada para seguir todo lo que pasa en APA PSO Argentina.",
            "Si sos nuevo, lo mejor es empezar por Inicio, luego Divisiones y después buscar tu club.",
          ]}
          consejo="Recorrido recomendado: Inicio → Divisiones → Clubes → Tu perfil de jugador → Predicciones → Dream Team."
        />

        <GuiaCard
          id="perfil"
          icono="👤"
          titulo="Perfil de usuario"
          href="/perfil"
          descripcion="El perfil es una de las partes más importantes de la plataforma. Sirve para identificarte dentro de APA, conectar tu cuenta con tu PlayerId y participar correctamente en funciones como Predicciones, Dream Team y perfil público."
          items={[
            "Para participar en la comunidad tenés que iniciar sesión y completar tu perfil.",
            "Tu nombre visible aparece en la web, rankings, predicciones y zona de usuario.",
            "El PlayerId es clave para vincular tu usuario con tus estadísticas reales de jugador.",
            "El Steam ID ayuda a validar identidad y evitar perfiles duplicados o falsos.",
            "Tu perfil público puede mostrar nombre, usuario, descripción, rol visible y avatar si corresponde.",
            "Si tu PlayerId está mal cargado, tus estadísticas pueden no vincularse correctamente con tu cuenta.",
            "Los administradores pueden revisar o aprobar perfiles según el estado del usuario.",
            "Si recién te registraste y algo no aparece, puede faltar completar datos o que tu perfil esté pendiente.",
          ]}
          consejo="Antes de votar o reclamar estadísticas, completá bien tu perfil: nombre visible, usuario, PlayerId y Steam ID. Es la base para que toda la web te reconozca correctamente."
        />

        <GuiaCard
          id="divisiones"
          icono="📊"
          titulo="Divisiones"
          href="/divisiones"
          descripcion="La sección de Divisiones muestra las tablas de posiciones de cada categoría y temporada."
          items={[
            "Consultá puntos, partidos jugados, victorias, empates y derrotas.",
            "Revisá goles a favor, goles en contra y diferencia de gol.",
            "Cada temporada y división se puede consultar por separado.",
            "Los equipos pueden aparecer aunque todavía no hayan jugado si están cargados en la tabla de equipos.",
            "Los resultados de los partidos actualizan automáticamente la tabla.",
            "Si una división aparece vacía, puede ser porque todavía no se cargaron equipos o partidos.",
          ]}
          consejo="Para ver una tabla correctamente, elegí la temporada y división donde tu club está cargado."
        />

        <GuiaCard
          id="fixture"
          icono="📅"
          titulo="Fixture"
          href="/fixture"
          descripcion="El Fixture permite ver los partidos organizados por división, fecha y temporada."
          items={[
            "Podés consultar qué equipos se enfrentan en cada fecha.",
            "Los partidos con resultado ya cargado muestran el marcador final.",
            "Los partidos sin resultado sirven como futuros encuentros.",
            "Si el partido tiene estadísticas, se puede abrir el Match Center.",
            "La fecha del fixture ayuda a organizar predicciones y premios.",
            "Cuando un partido se carga con resultado, también impacta en la tabla de posiciones.",
          ]}
          consejo="Si querés hacer predicciones, mirá primero el Fixture para saber qué partidos están pendientes."
        />

        <GuiaCard
          id="clubes"
          icono="👥"
          titulo="Clubes"
          href="/clubes"
          descripcion="La sección de Clubes reúne la identidad, plantel, rendimiento, historial y perfil visual de cada equipo dentro de la liga."
          items={[
            "Cada club puede tener escudo, banner, descripción y color principal.",
            "Desde un club podés acceder a su perfil completo.",
            "El perfil de club puede mostrar estadísticas, plantel, historial y partidos.",
            "Los jugadores del plantel pueden llevarte directamente a su perfil.",
            "Si un club no tiene logo, puede ser porque todavía no fue configurado.",
            "Si hay clubes con nombres repetidos, se recomienda diferenciarlos con slug, temporada o datos visuales en clubes_info.",
          ]}
          consejo="Buscá tu club para revisar su plantel, sus estadísticas y acceder rápido a los jugadores."
        />

        <GuiaCard
          id="mercado"
          icono="🔁"
          titulo="Mercado de pases"
          href="/mercado"
          descripcion="Mercado muestra fichajes, salidas, préstamos y jugadores libres de cada temporada y división."
          items={[
            "Podés filtrar movimientos por temporada, división y tipo.",
            "Los movimientos pueden mostrar desde qué club llega o hacia qué club va un jugador.",
            "Si el jugador tiene perfil público vinculado, podés entrar desde su nombre o avatar.",
            "Los clubes del movimiento pueden enlazar a su perfil de equipo cuando son clubes válidos.",
            "Los tipos principales son Fichaje, Salida, Préstamo y Libre.",
            "Sirve para seguir altas, bajas y cambios importantes antes o durante una temporada.",
          ]}
          consejo="Para que Mercado se vea completo, conviene tener clubes con logos configurados y usuarios con perfiles actualizados."
        />

        <GuiaCard
          id="jugadores"
          icono="🧍"
          titulo="Jugadores"
          href="/jugadores"
          descripcion="Cada jugador tiene un perfil deportivo individual basado en su PlayerId. Esto evita confusiones entre jugadores con nombres parecidos y permite conectar estadísticas reales con perfiles de usuario."
          items={[
            "Podés consultar goles, asistencias, MVP, rating, score y más estadísticas.",
            "Los arqueros se diferencian por atajadas y atrapadas.",
            "El historial puede mostrar rendimiento por temporada, división y equipo.",
            "Los rankings de jugadores usan playerId para agrupar correctamente.",
            "Si un jugador no aparece, puede ser porque todavía no se cargaron sus estadísticas.",
            "Desde clubes, plantillas, mercado, historia, premios y rankings podés entrar a perfiles de jugadores.",
          ]}
          consejo="El PlayerId es la clave más importante: la web identifica jugadores por PlayerId, no por nombre. Además, si el usuario completa su perfil con el mismo PlayerId, queda mejor conectado con su identidad pública."
        />

        <GuiaCard
          id="historia"
          icono="📜"
          titulo="Historia"
          href="/historia"
          descripcion="Historia muestra los grandes rankings acumulados de la liga. Es la sección para ver quiénes dejaron huella en APA."
          items={[
            "Consultá goleadores históricos de todas las temporadas cargadas.",
            "Revisá máximos asistidores, MVPs y mejores ratings.",
            "Los arqueros pueden aparecer en rankings de atajadas y atrapadas.",
            "Los datos históricos dependen de las estadísticas cargadas en la base.",
            "Si faltan temporadas viejas, los rankings irán creciendo cuando se carguen.",
            "Es ideal para comparar jugadores de distintas temporadas.",
          ]}
          consejo="Historia mejora muchísimo cuando se cargan temporadas anteriores con playerId correcto."
        />

        <GuiaCard
          id="predicciones"
          icono="🎯"
          titulo="Predicciones"
          href="/entretenimiento/predicciones"
          descripcion="Predicciones permite pronosticar partidos antes de que se jueguen y competir en un ranking de usuarios."
          items={[
            "Para votar necesitás iniciar sesión con tu usuario.",
            "Podés elegir ganador: local, empate o visitante.",
            "También podés cargar marcador exacto.",
            "Ganador correcto suma 1 punto.",
            "Marcador exacto suma 3 puntos.",
            "Cuando se carga el resultado real, la página calcula si acertaste o fallaste.",
          ]}
          consejo="Si querés competir correctamente en el ranking, usá tu cuenta real y mantené tu perfil completo."
        />

        <GuiaCard
          id="dream-team"
          icono="⭐"
          titulo="Dream Team"
          href="/entretenimiento/dream-team"
          descripcion="Dream Team permite votar el equipo ideal de una fecha con formación oficial de fútbol 8."
          items={[
            "La formación oficial es: GK, LB, CB, RB, LCM, RCM, LST y RST.",
            "Elegí una posición en la cancha y luego seleccioná un jugador.",
            "No se puede repetir el mismo jugador en varias posiciones.",
            "El equipo final se arma con los jugadores más votados por la comunidad.",
            "Los candidatos salen de las estadísticas cargadas para esa fecha.",
            "Cada usuario puede armar su Dream Team por fecha respetando las reglas de no repetir jugadores.",
          ]}
          consejo="Si no aparecen candidatos, probablemente no haya estadísticas cargadas para esa temporada, división y fecha. Si no te deja votar, revisá que hayas iniciado sesión y que tu perfil esté correcto."
        />

        <GuiaCard
          id="premios"
          icono="🏆"
          titulo="Premios APA"
          href="/entretenimiento/premios"
          descripcion="Premios APA destaca automáticamente a los mejores jugadores de cada fecha usando estadísticas oficiales."
          items={[
            "MVP de la fecha se calcula usando MVP, rating y score.",
            "Goleador destaca al jugador con más goles.",
            "Asistidor destaca al jugador con más asistencias y pases.",
            "Arquero toma atajadas y atrapadas.",
            "Defensa considera tackles, intercepciones y rating.",
            "Si no aparecen premios, puede ser porque esa fecha todavía no tiene estadísticas cargadas.",
          ]}
          consejo="Premios APA no requiere votos manuales: todo se calcula automáticamente desde las estadísticas."
        />

        <section
          id="faq"
          className="scroll-mt-28 rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(250,204,21,.10)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-3xl">
              ❓
            </div>

            <div>
              <p className="text-yellow-300 text-xs uppercase tracking-[0.3em] font-black">
                Ayuda rápida
              </p>

              <h2 className="mt-2 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                Preguntas Frecuentes
              </h2>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FAQItem pregunta="¿Por qué no aparezco en la web?" respuesta="Puede ser porque todavía no jugaste partidos cargados, porque tus estadísticas no tienen PlayerId correcto o porque tu perfil de usuario todavía no está completo." />
            <FAQItem pregunta="¿Por qué es tan importante completar mi perfil?" respuesta="Porque el perfil conecta tu usuario con tu identidad pública, tu PlayerId, tu Steam ID y tu participación en Predicciones, Dream Team y rankings de comunidad." />
            <FAQItem pregunta="¿Por qué mi club no tiene logo?" respuesta="Porque todavía no fue configurado en la base de datos o el link del logo está mal cargado." />
            <FAQItem pregunta="¿Por qué no puedo votar el mismo jugador dos veces en Dream Team?" respuesta="Porque cada jugador solo puede ocupar una posición en tu equipo ideal por fecha." />
            <FAQItem pregunta="¿Cómo sumo puntos en Predicciones?" respuesta="Sumás 1 punto por acertar el ganador y 3 puntos por acertar el marcador exacto. Necesitás iniciar sesión para votar." />
            <FAQItem pregunta="¿Por qué no aparecen premios en una fecha?" respuesta="Porque todavía no hay estadísticas de jugadores cargadas para esa fecha." />
            <FAQItem pregunta="¿Por qué una tabla aparece vacía?" respuesta="Puede ser porque no hay equipos o partidos cargados para la temporada y división seleccionadas." />
          </div>
        </section>

        <section
          id="mapa"
          className="scroll-mt-28 rounded-[34px] border border-green-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(34,197,94,.10)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-400/30 bg-green-400/10 text-3xl">
              🗺️
            </div>

            <div>
              <p className="text-green-300 text-xs uppercase tracking-[0.3em] font-black">
                Organización
              </p>

              <h2 className="mt-2 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase leading-tight">
                Mapa de la Web
              </h2>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-black/35 p-5 overflow-x-auto">
            <pre className="text-sm md:text-base leading-relaxed text-zinc-300 whitespace-pre-wrap break-words">{`Inicio
│
├─ Perfil
│  ├─ Datos públicos
│  ├─ PlayerId
│  ├─ Steam ID
│  └─ Perfil público
│
├─ Divisiones
│  └─ Tabla de posiciones
│
├─ Fixture
│  └─ Partidos por fecha
│
├─ Clubes
│  └─ Perfil de club
│     └─ Plantel y jugadores
│
├─ Mercado
│  └─ Fichajes, salidas, préstamos y libres
│
├─ Jugadores
│  └─ Perfil individual por PlayerId
│
├─ Historia
│  └─ Rankings históricos
│
└─ Entretenimiento
   ├─ Predicciones
   ├─ Dream Team
   └─ Premios APA`}</pre>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
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
