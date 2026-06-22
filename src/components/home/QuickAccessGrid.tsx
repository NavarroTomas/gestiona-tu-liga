import Link from "next/link";

type Props = {
  accesos: {
    href: string;
    title: string;
    desc: string;
    bg: string;
  }[];
};

const cardAccents = [
  { flag: "/themes/worldcup-real/flags/ar.png", line: "from-sky-300" },
  { flag: "/themes/worldcup-real/flags/br.png", line: "from-green-300" },
  { flag: "/themes/worldcup-real/flags/uy.png", line: "from-sky-200" },
  { flag: "/themes/worldcup-real/flags/co.png", line: "from-yellow-300" },
  { flag: "/themes/worldcup-real/flags/cl.png", line: "from-red-300" },
  { flag: "/themes/worldcup-real/flags/pe.png", line: "from-red-200" },
  { flag: "/themes/worldcup-real/flags/ec.png", line: "from-yellow-300" },
  { flag: "/themes/worldcup-real/flags/py.png", line: "from-blue-200" },
];

export default function QuickAccessGrid({ accesos }: Props) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {accesos.map((item, index) => {
        const accent = cardAccents[index % cardAccents.length];

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative min-h-[285px] overflow-hidden rounded-[16px] border border-white/14 bg-[#07121f]/80 shadow-[0_18px_48px_rgba(0,0,0,.40)] transition duration-300 hover:-translate-y-1 hover:border-yellow-200/38"
          >
            <img
              src={item.bg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-68 transition duration-700 group-hover:scale-105 group-hover:opacity-82"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020814] via-[#06111f]/74 to-[#020814]/18" />
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-sky-300 via-yellow-300 to-green-300" />
            <div className="absolute -right-8 -top-5 h-24 w-40 rotate-6 overflow-hidden rounded border border-white/22 bg-black/25 shadow-[0_18px_35px_rgba(0,0,0,.38)]">
              <img src={accent.flag} alt="" className="h-full w-full object-cover opacity-90" />
            </div>

            <div className="relative z-10 flex min-h-[285px] flex-col justify-end p-6">
              <div className={`mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r ${accent.line} via-white/85 to-transparent`} />

              <h3 className="max-w-[95%] text-[clamp(2rem,3.2vw,2.55rem)] font-black uppercase italic leading-[0.92] tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,.65)]">
                {item.title}
              </h3>

              <p className="mt-4 max-w-[95%] text-[13px] leading-relaxed text-white/86">
                {item.desc}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-yellow-300 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#06111f] shadow-[0_10px_22px_rgba(0,0,0,.30)] transition group-hover:bg-white">
                  Explorar <span>-&gt;</span>
                </span>
                <span className={`h-px flex-1 bg-gradient-to-r ${accent.line} to-transparent opacity-70`} />
              </div>
            </div>

            <div className="absolute inset-[1px] rounded-[15px] border border-white/10" />
          </Link>
        );
      })}
    </section>
  );
}
