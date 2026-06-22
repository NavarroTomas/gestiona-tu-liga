import Link from "next/link";

type Props = {
  proximosPartidos: any[];
  ultimosResultados: any[];
  division: string;
  temporada: string;
  logoEquipo: (nombre?: string) => string | null;
  EscudoEquipo: any;
};

export default function FixturesResultsGrid({
  proximosPartidos,
  ultimosResultados,
  division,
  temporada,
  logoEquipo,
  EscudoEquipo,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Panel title="Calendario inmediato" kicker="Proximos partidos" href={`/fixture/${division}?temporada=${encodeURIComponent(temporada)}`} linkLabel="Ver todos ->">
        {proximosPartidos.length === 0 ? (
          <Empty text="No hay proximos partidos cargados." />
        ) : (
          proximosPartidos.map((p) => (
            <MatchRow key={p.id} p={p} logoEquipo={logoEquipo} EscudoEquipo={EscudoEquipo} />
          ))
        )}
      </Panel>

      <Panel title="Ultimos marcadores" kicker="Resultados" href="/estadisticas" linkLabel="Stats ->" green>
        {ultimosResultados.length === 0 ? (
          <Empty text="No hay resultados cargados." />
        ) : (
          ultimosResultados.map((p) => (
            <ResultRow key={p.id} p={p} logoEquipo={logoEquipo} EscudoEquipo={EscudoEquipo} />
          ))
        )}
      </Panel>
    </section>
  );
}

function Panel({ title, kicker, href, linkLabel, children, green }: any) {
  return (
    <section className="relative overflow-hidden rounded-[18px] border border-white/15 bg-[#06111f]/72 p-6 shadow-[0_22px_60px_rgba(0,0,0,.25)]">
      <img
        src={green ? "/themes/worldcup-real/photos/stadium-night.jpg" : "/themes/worldcup-real/photos/pitch-lights.jpg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-16"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#020814]/80 via-[#06111f]/72 to-[#102016]/68" />
      <div className="relative z-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.35em] ${green ? "text-emerald-200" : "text-sky-200"}`}>{kicker}</p>
            <h2 className="mt-2 text-3xl font-black uppercase">{title}</h2>
          </div>
          <Link href={href} className={`text-sm font-black uppercase ${green ? "text-emerald-200" : "text-sky-200"}`}>{linkLabel}</Link>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-white/10 p-5 text-zinc-300">{text}</p>;
}

function MatchRow({ p, logoEquipo, EscudoEquipo }: any) {
  return (
    <div className="grid grid-cols-[1fr_70px_1fr] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15">
      <div className="flex min-w-0 items-center justify-end gap-2">
        <p className="truncate text-right text-sm font-black uppercase">{p.local}</p>
        <EscudoEquipo nombre={p.local} logo={logoEquipo(p.local)} size="sm" />
      </div>
      <p className="rounded-xl border border-yellow-300/30 bg-yellow-300 px-2 py-1 text-center text-sm font-black text-[#06111f]">VS</p>
      <div className="flex min-w-0 items-center gap-2">
        <EscudoEquipo nombre={p.visitante} logo={logoEquipo(p.visitante)} size="sm" />
        <p className="truncate text-left text-sm font-black uppercase">{p.visitante}</p>
      </div>
    </div>
  );
}

function ResultRow({ p, logoEquipo, EscudoEquipo }: any) {
  return (
    <Link
      href={p.partido_id ? `/estadisticas/${encodeURIComponent(p.partido_id)}` : "/estadisticas"}
      className="grid grid-cols-[1fr_90px_1fr] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
    >
      <div className="flex min-w-0 items-center justify-end gap-2">
        <p className="truncate text-right text-sm font-black uppercase">{p.local}</p>
        <EscudoEquipo nombre={p.local} logo={logoEquipo(p.local)} size="sm" />
      </div>
      <p className="rounded-xl border border-yellow-300/30 bg-yellow-300 px-2 py-1 text-center text-lg font-black text-[#06111f]">{p.resultado}</p>
      <div className="flex min-w-0 items-center gap-2">
        <EscudoEquipo nombre={p.visitante} logo={logoEquipo(p.visitante)} size="sm" />
        <p className="truncate text-left text-sm font-black uppercase">{p.visitante}</p>
      </div>
    </Link>
  );
}
