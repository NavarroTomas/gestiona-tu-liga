"use client";

const divisiones = [
  {
    nombre: "Primera División",
    slug: "primera",
    color: "from-blue-600 to-blue-950",
    descripcion: "Fixture oficial de la máxima categoría",
  },
  {
    nombre: "Segunda División",
    slug: "segunda",
    color: "from-cyan-600 to-blue-950",
    descripcion: "Calendario completo de la segunda categoría",
  },
  {
    nombre: "Tercera División",
    slug: "tercera",
    color: "from-indigo-600 to-blue-950",
    descripcion: "Fixture completo de la tercera categoría",
  },
];

export default function FixtureHome() {
  return (
    <main className="min-h-screen bg-[#020714] text-white p-6">
      <section className="max-w-[1400px] mx-auto">

        <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-950 via-black to-blue-950 p-8 mb-8 shadow-[0_0_35px_rgba(0,120,255,.35)]">
          <p className="text-blue-400 tracking-[0.5em] text-xs font-black mb-3">
            APA PSO ARGENTINA
          </p>

          <h1 className="text-5xl md:text-7xl font-black">
            FIXTURE OFICIAL
          </h1>

          <p className="tracking-[0.5em] text-zinc-300 mt-4">
            SELECCIONÁ UNA DIVISIÓN
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {divisiones.map((d) => (
            <a
              key={d.slug}
              href={`/fixture/${d.slug}`}
              className={`group relative overflow-hidden rounded-3xl border border-blue-500/50 bg-gradient-to-br ${d.color} p-8 min-h-[320px] shadow-[0_0_25px_rgba(0,120,255,.25)] hover:scale-[1.02] transition`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.18),transparent_35%)]" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center font-black text-3xl mb-8">
                    {d.nombre.slice(0, 2).toUpperCase()}
                  </div>

                  <p className="text-blue-200 text-sm font-black tracking-[0.35em] mb-3">
                    TEMPORADA ACTIVA
                  </p>

                  <h2 className="text-4xl font-black mb-4">
                    {d.nombre}
                  </h2>

                  <p className="text-zinc-200">
                    {d.descripcion}
                  </p>
                </div>

                <div className="mt-10 bg-black/40 border border-white/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-black">
                    VER FIXTURE
                  </span>

                  <span className="text-2xl group-hover:translate-x-2 transition">
                    →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-zinc-950 border border-blue-500/40 rounded-3xl p-6">
            <h3 className="text-2xl font-black mb-2">
              📅 Fechas
            </h3>
            <p className="text-zinc-400">
              Cada división tiene su calendario separado.
            </p>
          </div>

          <div className="bg-zinc-950 border border-blue-500/40 rounded-3xl p-6">
            <h3 className="text-2xl font-black mb-2">
              🏆 Resultados
            </h3>
            <p className="text-zinc-400">
              Los resultados salen de los partidos cargados.
            </p>
          </div>

          <div className="bg-zinc-950 border border-blue-500/40 rounded-3xl p-6">
            <h3 className="text-2xl font-black mb-2">
              🔥 Tabla
            </h3>
            <p className="text-zinc-400">
              La tabla se calcula automáticamente por división.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}