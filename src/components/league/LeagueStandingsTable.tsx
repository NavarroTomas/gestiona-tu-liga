import TeamLink from "@/components/team/TeamLink";
import type { FormResult, LeagueStanding } from "@/lib/league/types";
import { normalizarDivision } from "@/lib/league/utils";

function colorForma(resultado: FormResult) {
  if (resultado === "W") return "bg-[#2fb56d]";
  if (resultado === "D") return "bg-[#b9c3cc]";
  return "bg-[#f0525d]";
}

function zonaEquipo(index: number, total: number, division: string) {
  const puesto = index + 1;
  const esPrimera = normalizarDivision(division) === "primera";
  const esSegunda = normalizarDivision(division) === "segunda";

  if (esPrimera) {
    if (puesto === 1) return { barra: "bg-[#2497e6]", etiqueta: "Campeón" };
    if (puesto === total - 1) return { barra: "bg-[#f1a33b]", etiqueta: "Promoción" };
    if (puesto === total) return { barra: "bg-[#ef4855]", etiqueta: "Descenso" };
  }

  if (esSegunda) {
    if (puesto === 1) return { barra: "bg-[#2fb56d]", etiqueta: "Ascenso directo" };
    if (puesto >= 2 && puesto <= 5) return { barra: "bg-[#2497e6]", etiqueta: "Playoffs" };
  }

  return { barra: "bg-transparent", etiqueta: "" };
}

export default function LeagueStandingsTable({
  tabla,
  logos,
  proximosRivales,
  division,
}: {
  tabla: LeagueStanding[];
  logos: Record<string, string>;
  proximosRivales: Record<string, string>;
  division: string;
}) {
  return (
    <section className="overflow-hidden rounded-[9px] border border-[#d7e6f0] bg-white text-[#102f55]">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="h-10 border-b border-[#d7e6f0] bg-[#eef6fb] text-[10px] font-black uppercase tracking-[.045em] text-[#244d76] sm:text-[11px]">
            <th className="w-[42px] px-1 text-center sm:w-[50px]">#</th>
            <th className="px-2 text-left sm:px-3">Club</th>
            <th className="w-[48px] px-1 text-center sm:w-[54px]">PJ</th>
            <th className="hidden w-[48px] px-1 text-center md:table-cell">G</th>
            <th className="hidden w-[48px] px-1 text-center md:table-cell">E</th>
            <th className="hidden w-[48px] px-1 text-center md:table-cell">P</th>
            <th className="hidden w-[58px] px-1 text-center sm:table-cell">DG</th>
            <th className="w-[54px] px-1 text-center sm:w-[62px]">PTS</th>
            <th className="hidden w-[118px] px-2 text-center lg:table-cell">Forma</th>
            <th className="hidden w-[170px] px-3 text-left xl:table-cell">Próximo rival</th>
          </tr>
        </thead>

        <tbody>
          {tabla.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-14 text-center text-sm font-semibold text-[#7890a8]">
                No hay clubes cargados para esta temporada y división.
              </td>
            </tr>
          ) : (
            tabla.map((equipo, index) => {
              const zona = zonaEquipo(index, tabla.length, division);
              const rival = proximosRivales[equipo.nombre];

              return (
                <tr
                  key={equipo.nombre}
                  title={zona.etiqueta || undefined}
                  className="group h-[43px] border-b border-[#e4edf3] bg-white text-[11px] font-semibold transition-colors last:border-b-0 hover:bg-[#f5faff] sm:text-[12px]"
                >
                  <td className="relative px-1 text-center font-medium text-[#46698d]">
                    <span className={`absolute bottom-0 left-0 top-0 w-[3px] ${zona.barra}`} />
                    {index + 1}
                  </td>

                  <td className="min-w-0 px-2 sm:px-3">
                    <TeamLink
                      name={equipo.nombre}
                      className="group/team flex min-w-0 items-center gap-2 sm:gap-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7">
                        {logos[equipo.nombre] ? (
                          <img
                            src={logos[equipo.nombre]}
                            alt={equipo.nombre}
                            className="h-full w-full object-contain transition-transform group-hover/team:scale-[1.04]"
                          />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#edf5fa] text-[8px] font-black text-[#597895] sm:h-7 sm:w-7 sm:text-[9px]">
                            {equipo.nombre.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="truncate font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf]">
                        {equipo.nombre}
                      </span>
                    </TeamLink>
                  </td>

                  <td className="px-1 text-center text-[#45698e]">{equipo.pj}</td>
                  <td className="hidden px-1 text-center text-[#45698e] md:table-cell">{equipo.pg}</td>
                  <td className="hidden px-1 text-center text-[#45698e] md:table-cell">{equipo.pe}</td>
                  <td className="hidden px-1 text-center text-[#45698e] md:table-cell">{equipo.pp}</td>
                  <td className="hidden px-1 text-center text-[#45698e] sm:table-cell">
                    {equipo.dg > 0 ? "+" : ""}{equipo.dg}
                  </td>
                  <td className="px-1 text-center text-[12px] font-black text-[#102f55] sm:text-[13px]">
                    {equipo.puntos}
                  </td>

                  <td className="hidden px-2 lg:table-cell">
                    <div className="flex justify-center gap-[5px]">
                      {equipo.forma.length === 0 ? (
                        <span className="text-[#9aabb9]">—</span>
                      ) : (
                        equipo.forma.map((resultado, i) => (
                          <span
                            key={`${equipo.nombre}-${i}`}
                            className={`h-[10px] w-[10px] rounded-[3px] ${colorForma(resultado)}`}
                            title={resultado === "W" ? "Victoria" : resultado === "D" ? "Empate" : "Derrota"}
                          />
                        ))
                      )}
                    </div>
                  </td>

                  <td className="hidden px-3 xl:table-cell">
                    {rival ? (
                      <TeamLink name={rival} className="group/team flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {logos[rival] ? (
                            <img
                              src={logos[rival]}
                              alt={rival}
                              className="h-5 w-5 object-contain transition-transform group-hover/team:scale-[1.04]"
                            />
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#edf5fa] text-[7px] font-black text-[#597895]">
                              {rival.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span className="truncate text-[10px] font-semibold text-[#355d83] transition-colors group-hover/team:text-[#258fcf] 2xl:text-[11px]">
                          {rival}
                        </span>
                      </TeamLink>
                    ) : (
                      <span className="text-[#9aabb9]">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d7e6f0] bg-[#fbfdff] px-3 py-2.5 text-[9px] font-semibold text-[#67819a] sm:px-4 sm:text-[10px]">
        {normalizarDivision(division) === "primera" ? (
          <>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#2497e6]" /> Campeón</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#f1a33b]" /> Promoción</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ef4855]" /> Descenso</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#2fb56d]" /> Ascenso directo</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#2497e6]" /> Playoffs de ascenso</span>
          </>
        )}
      </div>
    </section>
  );
}
