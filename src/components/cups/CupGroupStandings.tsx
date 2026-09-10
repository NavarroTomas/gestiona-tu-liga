import { CUPS_CONFIG, getCupDestination } from "@/config/cups";
import type { CupStandingRow } from "@/lib/cups/types";
import { formatCupDate, resultLabel } from "@/lib/cups/utils";

function formClass(result: "W" | "D" | "L") {
  if (result === "W") return "bg-[#2fb56d]";
  if (result === "D") return "bg-[#b9c3cc]";
  return "bg-[#f0525d]";
}

export default function CupGroupStandings({
  group,
  rows,
  loading,
  getLogo,
}: {
  group: string;
  rows: CupStandingRow[];
  loading: boolean;
  getLogo: (name?: string | null) => string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#d7e6f0] bg-white text-[#102f55]">
      <header className="flex h-[58px] items-center justify-between border-b border-[#d7e6f0] bg-[#fbfdff] px-4 sm:px-5">
        <h2 className="text-[20px] font-black tracking-[-.035em] text-[#102f55]">Grupo {group}</h2>
        <span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7890a7]">PTS · DG · GF</span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <thead>
            <tr className="h-10 border-b border-[#d7e6f0] bg-[#eef6fb] text-[10px] font-black uppercase tracking-[.045em] text-[#244d76]">
              <th className="w-[46px] px-1 text-center">#</th>
              <th className="px-3 text-left">Club</th>
              <th className="w-[48px] px-1 text-center">PJ</th>
              <th className="w-[44px] px-1 text-center">G</th>
              <th className="w-[44px] px-1 text-center">E</th>
              <th className="w-[44px] px-1 text-center">P</th>
              <th className="w-[54px] px-1 text-center">DG</th>
              <th className="w-[58px] px-1 text-center">PTS</th>
              <th className="w-[112px] px-2 text-center">Forma</th>
              <th className="w-[178px] px-3 text-left">Próximo rival</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-sm font-semibold text-[#7890a8]">
                  Cargando clasificación…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-sm font-semibold text-[#7890a8]">
                  No hay partidos cargados para el Grupo {group}.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const position = index + 1;
                const destination = getCupDestination(position);
                const logo = getLogo(row.equipo);
                const rivalLogo = getLogo(row.proximoRival);

                return (
                  <tr
                    key={row.equipo}
                    className="group h-[48px] border-b border-[#e4edf3] bg-white text-[11px] font-semibold transition-colors last:border-b-0 hover:bg-[#f5faff] sm:text-[12px]"
                  >
                    <td className="relative px-1 text-center font-medium text-[#46698d]">
                      <span
                        className={`absolute bottom-0 left-0 top-0 w-[3px] ${
                          destination === "argentina" ? "bg-[#2fb56d]" : "bg-[#56afe2]"
                        }`}
                        title={
                          destination === "argentina"
                            ? CUPS_CONFIG.qualification.copaArgentinaLabel
                            : CUPS_CONFIG.qualification.copaApaLabel
                        }
                      />
                      {position}
                    </td>

                    <td className="min-w-0 px-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                          {logo ? (
                            <img src={logo} alt={row.equipo} className="h-full w-full object-contain" />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#edf5fa] text-[8px] font-black text-[#597895]">
                              {row.equipo.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span className="truncate font-bold text-[#173e68]">{row.equipo}</span>
                      </div>
                    </td>

                    <td className="px-1 text-center text-[#45698e]">{row.pj}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pg}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pe}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pp}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.dg > 0 ? "+" : ""}{row.dg}</td>
                    <td className="px-1 text-center text-[12px] font-black text-[#102f55] sm:text-[13px]">{row.pts}</td>

                    <td className="px-2">
                      <div className="flex justify-center gap-[5px]">
                        {row.forma.length === 0 ? (
                          <span className="text-[#9aabb9]">—</span>
                        ) : (
                          row.forma.map((result, formIndex) => (
                            <span
                              key={`${row.equipo}-${formIndex}`}
                              className={`h-[10px] w-[10px] rounded-[3px] ${formClass(result)}`}
                              title={resultLabel(result)}
                            />
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-3">
                      {row.proximoRival ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                            {rivalLogo ? (
                              <img src={rivalLogo} alt={row.proximoRival} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#edf5fa] text-[7px] font-black text-[#597895]">
                                {row.proximoRival.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[10px] font-bold text-[#355d83]">{row.proximoRival}</span>
                            <span className="block text-[9px] font-semibold text-[#7d94aa]">{formatCupDate(row.proximoPartido)}</span>
                          </span>
                        </div>
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
      </div>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d7e6f0] bg-[#fbfdff] px-4 py-3 text-[9px] font-semibold text-[#67819a] sm:text-[10px]">
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#2fb56d]" />
          Clasifica a {CUPS_CONFIG.qualification.copaArgentinaLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#56afe2]" />
          Clasifica a {CUPS_CONFIG.qualification.copaApaLabel}
        </span>
      </footer>
    </section>
  );
}
