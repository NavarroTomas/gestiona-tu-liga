import Link from "next/link";

const items = [
  ["Primera", "Liga oficial", "/competicion?division=primera", "I"],
  ["Segunda", "Ascenso", "/competicion?division=segunda", "II"],
  ["Copa Argentina", "Eliminación", "/competicion", "CA"],
  ["Copa APA", "Copa oficial", "/competicion", "APA"],
  ["Copa Campeones", "Los mejores", "/competicion", "CC"],
  ["Playoffs", "Definiciones", "/competicion", "PO"],
];

export default function HomeCompetitionStrip() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Temporada</p>
          <h2 className="mt-1 text-3xl font-black uppercase text-[#0b2747]">Competiciones</h2>
        </div>
        <Link href="/competicion" className="text-xs font-black text-[#245f8e]">Ver todas →</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map(([title, desc, href, code]) => (
          <Link key={title} href={href} className="group rounded-2xl border border-[#0b2747]/10 bg-white p-4 shadow-[0_10px_30px_rgba(11,39,71,.05)] transition hover:-translate-y-0.5 hover:border-[#245f8e]/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102f55] text-xs font-black text-white">{code}</div>
            <h3 className="mt-4 text-sm font-black uppercase text-[#0b2747]">{title}</h3>
            <p className="mt-1 text-xs font-medium text-[#245f8e]">{desc}</p>
            <span className="mt-4 block text-sm font-black text-[#245f8e] transition group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
