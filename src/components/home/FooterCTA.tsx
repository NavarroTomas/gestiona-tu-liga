import Link from "next/link";

export default function FooterCTA() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#061b35]/72 p-7 md:p-8">
      <img src="/themes/worldcup/brush-blue.png" alt="" className="absolute -left-28 -bottom-24 w-[520px] opacity-22" />
      <img src="/themes/worldcup/brush-yellow.png" alt="" className="absolute -right-24 -top-20 w-[520px] opacity-24" />
      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-200">Cómo usar la web</p>
          <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">Todo conectado</h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-200 md:text-base">
            Entrá a Competición para torneos y calendario, visitá Clubes para perfiles institucionales, Jugadores para rankings y Entretenimiento para participar con la comunidad.
          </p>
        </div>
        <Link href="/guia" className="rounded-2xl bg-yellow-300 px-6 py-4 text-center text-sm font-black uppercase text-[#06111f] transition hover:bg-white">
          Abrir guía
        </Link>
      </div>
    </section>
  );
}
