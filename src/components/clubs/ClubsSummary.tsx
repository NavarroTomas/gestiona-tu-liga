import type { ClubsSummary } from "@/lib/clubs/types";
import { BallIcon, FieldIcon, UsersIcon } from "./ClubsIcons";

function PlayerIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M6 20v-2.5A5.5 5.5 0 0 1 11.5 12h1A5.5 5.5 0 0 1 18 17.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export default function ClubsSummary({ summary, loading }: { summary: ClubsSummary; loading: boolean }) {
  const items = [
    { label: "Clubes registrados", value: summary.clubs, icon: UsersIcon },
    { label: "Jugadores", value: summary.players, icon: PlayerIcon },
    { label: "Partidos disputados", value: summary.matches, icon: FieldIcon },
    { label: "Goles convertidos", value: summary.goals, icon: BallIcon },
  ];

  return (
    <section className="border-b border-[#d6e8f2] bg-[#f8fcff]">
      <div className="mx-auto grid max-w-[1680px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-10">
        {items.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`flex min-h-[106px] items-center gap-4 py-5 ${index % 2 === 0 ? "pr-4" : "pl-4"} lg:px-7 ${index > 0 ? "lg:border-l lg:border-[#cfe3ef]" : ""}`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f6fd] text-[#168ed1] sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="min-w-0">
              <strong className="block text-[26px] font-black leading-none text-[#102f55] sm:text-[30px]">{loading ? "—" : value}</strong>
              <span className="mt-1.5 block text-[10px] font-black uppercase leading-tight tracking-[.04em] text-[#426987] sm:text-[11px]">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
