import Link from "next/link";

type Props = {
  accesos: any[];
};

const tones = [
  { brush: "bg-yellow-300", line: "from-yellow-300", wash: "rgba(255,210,45,.22)" },
  { brush: "bg-sky-300", line: "from-sky-300", wash: "rgba(56,189,248,.20)" },
  { brush: "bg-green-300", line: "from-green-300", wash: "rgba(74,222,128,.18)" },
  { brush: "bg-cyan-200", line: "from-cyan-200", wash: "rgba(125,211,252,.18)" },
  { brush: "bg-green-300", line: "from-green-300", wash: "rgba(34,197,94,.18)" },
  { brush: "bg-yellow-200", line: "from-yellow-200", wash: "rgba(250,204,21,.22)" },
  { brush: "bg-sky-200", line: "from-sky-200", wash: "rgba(103,232,249,.18)" },
  { brush: "bg-yellow-300", line: "from-yellow-300", wash: "rgba(255,210,45,.24)" },
];

export default function QuickAccessGrid({ accesos }: Props) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {accesos.map((item, index) => {
        const tone = tones[index % tones.length];

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative min-h-[285px] overflow-hidden rounded-[28px] border border-white/15 bg-[#061b35]/70 shadow-[0_18px_48px_rgba(0,0,0,.38)] transition duration-300 hover:-translate-y-1 hover:border-yellow-200/45"
          >
            <img
              src={item.bg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020814] via-[#03152b]/68 to-[#03152b]/12" />

            <div
              className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
              style={{ background: tone.wash }}
            />

            {/* textura fina tipo papel */}
            <div className="absolute inset-0 opacity-[0.20] mix-blend-soft-light [background-image:linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.10)_1px,transparent_1px)] [background-size:18px_18px]" />

            {/* pincelada superior irregular */}
            <div className="absolute left-0 top-0 z-10 h-16 w-[72%] -translate-x-4 -translate-y-4 -rotate-2">
              <div className={`h-8 w-full ${tone.brush} opacity-95 shadow-[0_8px_20px_rgba(0,0,0,.28)]`} />
              <div className={`mt-1 h-3 w-[78%] ${tone.brush} opacity-75`} />
            </div>

            {/* pincelada lateral/baja */}
            <div className="absolute -bottom-8 -right-10 z-10 h-24 w-[62%] rotate-[-8deg]">
              <div className={`h-7 w-full ${tone.brush} opacity-30 blur-[1px]`} />
            </div>

            <div className="relative z-20 flex min-h-[285px] flex-col justify-end p-6">
              <div className={`mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r ${tone.line} via-white/85 to-transparent`} />

              <h3 className="max-w-[95%] text-[clamp(2rem,3.2vw,2.55rem)] font-black uppercase leading-[0.92] tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,.65)]">
                {item.title}
              </h3>

              <p className="mt-4 max-w-[95%] text-[13px] leading-relaxed text-white/86">
                {item.desc}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-[14px] bg-yellow-300 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#06111f] shadow-[0_10px_22px_rgba(0,0,0,.30)] transition group-hover:bg-white">
                  <span className="absolute inset-x-2 top-1 h-px bg-white/45" />
                  Explorar <span>→</span>
                </span>

                <span className={`h-px flex-1 bg-gradient-to-r ${tone.line} to-transparent opacity-70`} />
              </div>
            </div>

            <div className="absolute inset-[1px] rounded-[27px] border border-white/10" />
          </Link>
        );
      })}
    </section>
  );
}
