const southAmericaFlags = [
  { name: "Colombia", src: "/themes/worldcup-real/flags/co.png" },
  { name: "Venezuela", src: "/themes/worldcup-real/flags/ve.png" },
  { name: "Brasil", src: "/themes/worldcup-real/flags/br.png" },
  { name: "Ecuador", src: "/themes/worldcup-real/flags/ec.png" },
  { name: "Peru", src: "/themes/worldcup-real/flags/pe.png" },
  { name: "Bolivia", src: "/themes/worldcup-real/flags/bo.png" },
  { name: "Chile", src: "/themes/worldcup-real/flags/cl.png" },
  { name: "Argentina", src: "/themes/worldcup-real/flags/ar.png" },
  { name: "Uruguay", src: "/themes/worldcup-real/flags/uy.png" },
  { name: "Paraguay", src: "/themes/worldcup-real/flags/py.png" },
];

export default function SouthAmericaBunting() {
  return (
    <div className="relative mx-auto mb-5 hidden h-32 w-full max-w-[1180px] overflow-visible md:block">
      <svg
        className="absolute left-1/2 top-2 h-16 w-[calc(100%-2rem)] -translate-x-1/2 overflow-visible"
        viewBox="0 0 1000 90"
        preserveAspectRatio="none"
      >
        <path
          d="M 10 28 Q 500 54 990 28"
          fill="none"
          stroke="rgba(255,255,255,.62)"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M 10 33 Q 500 59 990 33"
          fill="none"
          stroke="rgba(0,0,0,.36)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute inset-x-0 top-0">
        {southAmericaFlags.map((flag, index) => {
          const progress = index / (southAmericaFlags.length - 1);
          const left = 5.5 + progress * 89;
          const top = 20 + Math.sin(progress * Math.PI) * 18;

          return (
            <div
              key={flag.name}
              className="absolute origin-top"
              style={{
                left: `${left}%`,
                top: `${top}px`,
                transform: `translateX(-50%) rotate(${-8 + index * 1.8}deg)`,
              }}
            >
              <div className="mx-auto h-2 w-6 rounded-b-sm border border-white/30 bg-white/70 shadow-[0_3px_8px_rgba(0,0,0,.38)]" />
              <div className="mx-auto h-2.5 w-[2px] bg-white/65 shadow-[0_0_8px_rgba(255,255,255,.24)]" />
              <div className="relative h-[50px] w-[38px] overflow-hidden rounded-b-sm border border-white/32 bg-black/20 shadow-[0_16px_34px_rgba(0,0,0,.50)] xl:h-[58px] xl:w-[43px]">
                <img src={flag.src} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,.26),transparent_26%,rgba(255,255,255,.28)_44%,transparent_62%,rgba(0,0,0,.22)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-black/24" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
