"use client";

import { getSeasonTheme } from "@/lib/seasonTheme";

export default function SeasonDecorations() {
  const theme = getSeasonTheme();

  if (theme.key !== "world_cup") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/[0.035] to-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <img
          src="/themes/worldcup-real/photos/stadium-night.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-18%,rgba(245,181,49,.18),transparent_30%),linear-gradient(180deg,rgba(2,8,20,.66)_0%,rgba(2,8,20,.50)_42%,rgba(1,3,10,.92)_100%)]" />

        <div className="absolute bottom-0 left-0 top-[4.35rem] hidden w-[27vw] min-w-[260px] max-w-[430px] overflow-hidden lg:block">
          <div className="absolute inset-0 bg-sky-300/18" />
          <img
            src="/themes/worldcup-real/flags/ar.png"
            alt=""
            className="absolute left-[-12%] top-[8%] h-[52%] w-[92%] -rotate-12 object-cover opacity-70 blur-[.2px] drop-shadow-[0_26px_50px_rgba(0,0,0,.50)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(116,190,232,.28),transparent_42%),linear-gradient(180deg,rgba(255,255,255,.12),transparent_28%)]" />
          <div className="absolute bottom-[14%] left-[-12%] h-40 w-[116%] -rotate-12 bg-gradient-to-r from-sky-200/60 via-white/45 to-sky-300/55 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#020814]/10 to-[#020814]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020814]/10 via-transparent to-[#020814]" />
        </div>

        <div className="absolute bottom-0 right-0 top-[4.35rem] hidden w-[27vw] min-w-[260px] max-w-[430px] overflow-hidden lg:block">
          <div className="absolute inset-0 bg-green-500/16" />
          <img
            src="/themes/worldcup-real/flags/br.png"
            alt=""
            className="absolute right-[-12%] top-[14%] h-[52%] w-[92%] rotate-12 object-cover opacity-72 blur-[.2px] drop-shadow-[0_26px_50px_rgba(0,0,0,.50)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(220deg,rgba(34,197,94,.24),transparent_42%),linear-gradient(180deg,rgba(250,204,21,.16),transparent_32%)]" />
          <div className="absolute bottom-[15%] right-[-15%] h-40 w-[116%] rotate-12 bg-gradient-to-r from-green-400/50 via-yellow-300/45 to-sky-300/35 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#020814]/10 to-[#020814]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020814]/10 via-transparent to-[#020814]" />
        </div>

        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-100/8 to-transparent" />
        <div className="absolute left-1/2 top-[-24rem] h-[52rem] w-[88rem] -translate-x-1/2 rounded-full border border-yellow-100/10 bg-[radial-gradient(circle,rgba(245,181,49,.14),transparent_64%)]" />
        <div className="absolute left-1/2 top-[-8rem] h-[35rem] w-[11rem] origin-bottom -translate-x-1/2 rotate-[-27deg] bg-gradient-to-b from-sky-200/14 to-transparent blur-2xl" />
        <div className="absolute left-1/2 top-[-8rem] h-[35rem] w-[11rem] origin-bottom -translate-x-1/2 rotate-[27deg] bg-gradient-to-b from-yellow-100/16 to-transparent blur-2xl" />
        <div className="absolute bottom-[-9rem] left-1/2 h-[21rem] w-[min(96rem,125vw)] -translate-x-1/2 rounded-[50%] border-t border-sky-100/14 bg-[radial-gradient(ellipse_at_top,rgba(91,167,216,.13),transparent_56%)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(255,246,220,.60)_1px,transparent_1px)] [background-size:34px_34px] opacity-[0.045] [mask-image:linear-gradient(to_bottom,black,transparent_84%)]" />
      </div>

    </>
  );
}
