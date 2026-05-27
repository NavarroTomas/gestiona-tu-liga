import Panel from "./ui/Panel";

export default function StatsGlobales() {

  return (

    <Panel>

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-6">

          <div>

            <p className="
              text-sky-400
              text-xs
              font-black
              tracking-[5px]
              uppercase
              mb-2
            ">
              League Stats
            </p>

            <h2 className="
              text-3xl
              md:text-4xl
              font-black
              text-white
            ">
              ESTADÍSTICAS
            </h2>

          </div>

          <div className="
            text-[10px]
            uppercase
            font-black
            tracking-widest
            bg-[#0d131d]
            border border-[#243041]
            px-3 py-1
            rounded-xl
            text-sky-300
          ">
            LIVE DATA
          </div>

        </div>

        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
        ">

          <div className="
            rounded-2xl
            bg-gradient-to-b
            from-[#1e293b]
            to-[#0f172a]
            border-2
            border-[#334155]
            p-5
          ">

            <p className="
              text-zinc-500
              uppercase
              text-xs
              font-black
              mb-3
            ">
              CLUBES
            </p>

            <h3 className="
              text-5xl
              font-black
              text-sky-300
              font-mono
            ">
              4
            </h3>

          </div>

          <div className="
            rounded-2xl
            bg-gradient-to-b
            from-[#1e293b]
            to-[#0f172a]
            border-2
            border-[#334155]
            p-5
          ">

            <p className="
              text-zinc-500
              uppercase
              text-xs
              font-black
              mb-3
            ">
              PARTIDOS
            </p>

            <h3 className="
              text-5xl
              font-black
              text-cyan-300
              font-mono
            ">
              12
            </h3>

          </div>

          <div className="
            rounded-2xl
            bg-gradient-to-b
            from-[#1e293b]
            to-[#0f172a]
            border-2
            border-[#334155]
            p-5
          ">

            <p className="
              text-zinc-500
              uppercase
              text-xs
              font-black
              mb-3
            ">
              GOLES
            </p>

            <h3 className="
              text-5xl
              font-black
              text-white
              font-mono
            ">
              48
            </h3>

          </div>

          <div className="
            rounded-2xl
            bg-gradient-to-b
            from-[#1e293b]
            to-[#0f172a]
            border-2
            border-[#334155]
            p-5
          ">

            <p className="
              text-zinc-500
              uppercase
              text-xs
              font-black
              mb-3
            ">
              MVP
            </p>

            <h3 className="
              text-5xl
              font-black
              text-yellow-300
              font-mono
            ">
              9
            </h3>

          </div>

        </div>

      </div>

    </Panel>

  );

}