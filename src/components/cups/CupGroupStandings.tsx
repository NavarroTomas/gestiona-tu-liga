import TeamLink from "@/components/team/TeamLink";
import ClubBadge from "./ClubBadge";
import { CUPS_CONFIG, getCupDestination } from "@/config/cups";
import type { CupStandingRow } from "@/lib/cups/types";
import { formatCupDate, resultLabel } from "@/lib/cups/utils";

function formClass(result: "W" | "D" | "L") {
  if (result === "W") return "bg-[#2fb56d]";
  if (result === "D") return "bg-[#b9c3cc]";
  return "bg-[#f0525d]";
}

export default function CupGroupStandings({
  season,
  group,
  rows,
  loading,
  getLogo,
}: {
  season?: string;
  group: string;
  rows: CupStandingRow[];
  loading: boolean;
  getLogo: (name?: string | null) => string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#d7e6f0] bg-white text-[#102f55]">
      <header className="flex min-h-[56px] items-center justify-between gap-4 border-b border-[#d7e6f0] bg-[#fbfdff] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.12em] text-[#7890a7]">Tabla de posiciones</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-[#102f55] sm:text-3xl">Grupo {group}</h2>
        </div>
        <span className="shrink-0 text-xs font-bold uppercase tracking-[.1em] text-[#7890a7]">Orden: PTS · DG · GF</span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] table-fixed border-collapse">
          <thead>
            <tr className="h-12 border-b border-[#d7e6f0] bg-[#eef6fb] text-sm font-black uppercase tracking-[.045em] text-[#244d76]">
              <th className="w-[46px] px-1 text-center">#</th>
              <th className="px-3 text-left">Club</th>
              <th className="w-[48px] px-1 text-center">PJ</th>
              <th className="w-[44px] px-1 text-center">G</th>
              <th className="w-[44px] px-1 text-center">E</th>
              <th className="w-[44px] px-1 text-center">P</th>
              <th className="w-[54px] px-1 text-center">DG</th>
              <th className="w-[58px] px-1 text-center">PTS</th>
              <th className="w-[112px] px-2 text-center">Forma</th>
              <th className="w-[220px] px-3 text-left">Próximo rival</th>
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
                const destination = season === "Temporada 5"
                  ? position <= 2 ? "argentina" : position === 3 || position === 6 ? "pending" : "apa"
                  : getCupDestination(position);
                const logo = getLogo(row.equipo);
                const rivalLogo = getLogo(row.proximoRival);

                return (
                  <tr
                    key={row.equipo}
                    className="group h-[72px] border-b border-[#e4edf3] bg-white text-lg font-semibold transition-colors last:border-b-0 hover:bg-[#f5faff]"
                  >
                    <td className="relative px-1 text-center font-medium text-[#46698d]">
                      <span
                        className={`absolute bottom-0 left-0 top-0 w-[3px] ${
                          destination === "argentina" ? "bg-[#2fb56d]" : destination === "pending" ? "bg-[#d6a334]" : "bg-[#56afe2]"
                        }`}
                        title={
                          destination === "pending" ? "Depende de la comparación entre grupos" : destination === "argentina"
                            ? CUPS_CONFIG.qualification.copaArgentinaLabel
                            : CUPS_CONFIG.qualification.copaApaLabel
                        }
                      />
                      {position}
                    </td>

                    <td className="min-w-0 px-3">
                      <TeamLink name={row.equipo} className="group/team flex min-w-0 items-center gap-2.5">
                        <ClubBadge name={row.equipo} src={logo} />
                        <span className="break-words text-lg leading-snug font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf]">
                          {row.equipo}
                        </span>
                      </TeamLink>
                    </td>

                    <td className="px-1 text-center text-[#45698e]">{row.pj}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pg}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pe}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.pp}</td>
                    <td className="px-1 text-center text-[#45698e]">{row.dg > 0 ? "+" : ""}{row.dg}</td>
                    <td className="px-1 text-center text-xl font-black text-[#102f55]">{row.pts}</td>

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
                        <TeamLink name={row.proximoRival} className="group/team flex min-w-0 items-center gap-2">
                          <ClubBadge name={row.proximoRival} src={rivalLogo} className="h-9 w-9" />
                          <span className="min-w-0">
                            <span className="block text-sm leading-snug font-bold text-[#355d83] transition-colors group-hover/team:text-[#258fcf]">
                              {row.proximoRival}
                            </span>
                            <span className="block text-xs font-semibold text-[#7d94aa]">{formatCupDate(row.proximoPartido)}</span>
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
      </div>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#d7e6f0] bg-[#fbfdff] px-5 py-5 text-sm leading-relaxed font-semibold text-[#67819a]">
        {season === "Temporada 5" && <details className="w-full"><summary className="cursor-pointer">Reglas de clasificación</summary><p className="mt-2">Copa Argentina: 1.º y 2.º de cada grupo y los 2 mejores terceros. Copa APA: el tercero restante, 4.º y 5.º de cada grupo y el mejor sexto. Los otros 2 sextos quedan eliminados.</p></details>}
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
