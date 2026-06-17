export default function WorldCupExperience() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#0a3157]/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,.25)] md:p-6">
      <img src="/themes/worldcup/brush-yellow.png" alt="" className="absolute -right-24 -top-14 w-[520px] opacity-28" />
      <img src="/themes/worldcup/brush-blue.png" alt="" className="absolute -bottom-20 -left-24 w-[520px] opacity-24" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-300">APA World Cup Edition</p>
          <h2 className="mt-2 text-3xl font-black uppercase text-white">Temporada 4 estilo mural</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-200">
            Pintura, color, textura y fútbol. Una identidad visual propia para que APA se sienta como un evento mundialista de la comunidad.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {["/themes/worldcup/trophy-worldcup.png", "/themes/worldcup/card-partidos.png", "/themes/worldcup/card-clubes.png", "/themes/worldcup/card-jugadores.png", "/themes/worldcup/trophy-balon.png"].map((src) => (
            <div key={src} className="h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
