export default function Hero({title="La Liga Definitiva",subtitle="Gestioná tu Liga"}:{title?:string;subtitle?:string}={}) {
 return <section className="mx-auto w-full max-w-[1480px] px-6 py-12 sm:px-10 sm:py-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">{subtitle}</p><h1 className="mt-4 text-4xl font-black tracking-tight text-[#102f55] sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-500">Partidos, noticias, equipos y estadísticas de tu competencia.</p></section>;
}
