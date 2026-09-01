import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PlayoffsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const temporada = (typeof resolvedSearchParams.temporada === "string" ? resolvedSearchParams.temporada : "Temporada 4");
  const faseActual = (typeof resolvedSearchParams.fase === "string" ? resolvedSearchParams.fase : "Semifinal");

  // Definición de las fases de playoffs disponibles
  const fasesPlayoffs = [
    { label: "Semifinales", value: "Semifinal", desc: "2° al 5° de Segunda División" },
    { label: "Final Ascenso", value: "Final Ascenso", desc: "Ganador SF1 vs Ganador SF2" },
    { label: "Promoción", value: "Promoción", desc: "Ganador Final vs Anteúltimo Primera" },
  ];

  // Aquí puedes conectar tu llamada real a la base de datos o API filtrando por temporada y fase
  // Ejemplo: const partidos = await obtenerPartidosPlayoffs(temporada, faseActual);
  const partidos: any[] = []; // Simulado vacío por defecto para mostrar el estado interactivo

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#3b1607_0%,#081427_28%,#020714_58%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
        
        {/* Cabecera Principal */}
        <section className="relative min-h-[430px] overflow-hidden rounded-[42px] border border-orange-400/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(251,146,60,.18)] md:p-10">
          <img
            src="/images/competicion/playoffs.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/78 to-[#020714]/35" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020714] to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[380px] items-center">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-300">
                APA PSO Argentina · {temporada}
              </p>
              <h1 className="mt-5 text-[clamp(3rem,9vw,7rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
                  Playoffs
                </span>
                <span className="block text-orange-300 drop-shadow-[0_0_24px_rgba(251,146,60,.55)]">
                  de Ascenso
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Del 2° al 5° de Segunda División pelean por llegar a la final de ascenso.
                El ganador juega la promoción contra el anteúltimo de Primera.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link 
                  href={`/fixture/playoffs?temporada=${encodeURIComponent(temporada)}`} 
                  className="rounded-2xl border border-orange-300/35 bg-orange-300 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  Ver fixture completo
                </Link>
                <Link 
                  href="/estadisticas" 
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
                >
                  Ver estadísticas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pestañas de Navegación de Fases */}
        <section className="flex flex-wrap gap-3">
          {fasesPlayoffs.map((fase) => {
            const isActive = faseActual === fase.value;
            return (
              <Link
                key={fase.value}
                href={`/competicion/playoffs?temporada=${encodeURIComponent(temporada)}&fase=${encodeURIComponent(fase.value)}`}
                className={`rounded-2xl border px-6 py-4 transition ${
                  isActive
                    ? "border-orange-400 bg-orange-400/20 text-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.3)]"
                    : "border-orange-400/20 bg-[#020714]/95 text-zinc-400 hover:border-orange-400/50 hover:text-white"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{fase.desc}</p>
                <p className="mt-1 text-lg font-black uppercase">{fase.label}</p>
              </Link>
            );
          })}
        </section>

        {/* Contenedor dinámico de Partidos */}
        <section className="rounded-[30px] border border-orange-400/20 bg-[#020714]/95 p-6 md:p-8 shadow-[0_0_30px_rgba(251,146,60,.10)]">
          <div className="flex items-center justify-between border-b border-orange-400/15 pb-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">Fase Seleccionada</p>
              <h2 className="mt-1 text-2xl font-black uppercase text-white">{faseActual}</h2>
            </div>
            <span className="rounded-full bg-orange-400/10 border border-orange-400/30 px-4 py-1.5 text-xs font-bold text-orange-300">
              {temporada}
            </span>
          </div>

          {/* Renderizado de partidos o mensaje de estado */}
          {partidos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mapeo de partidos reales cuando existan */}
              {partidos.map((partido, index) => (
                <div key={index} className="border border-white/10 rounded-2xl p-4 bg-black/40">
                  {/* Estructura de tu tarjeta de partido */}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-300 mb-4 text-2xl">
                ⚽
              </div>
              <h3 className="text-lg font-black uppercase text-white">No hay partidos cargados para esta fase</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                Los encuentros correspondientes a <span className="text-orange-300 font-bold">{faseActual}</span> aparecerán aquí una vez que sean programados o cargados desde el panel de administración.
              </p>
              <div className="mt-6">
                <Link
                  href={`/fixture/playoffs?temporada=${encodeURIComponent(temporada)}&fase=${encodeURIComponent(faseActual)}`}
                  className="inline-block rounded-xl border border-orange-300/40 bg-orange-400/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-orange-300 transition hover:bg-orange-400 hover:text-black"
                >
                  Ver en el Fixture General →
                </Link>
              </div>
            </div>
          )}
        </section>

      </section>
    </main>
  );
}